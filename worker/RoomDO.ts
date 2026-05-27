import type {
  ClientMessage,
  ServerMessage,
  StudentInfo,
} from '../shared/protocol';
import {
  addCharacterPress,
  closeRoom,
  computeCommentList,
  computeCommentProgress,
  computeCrossMatrix,
  computeDistribution,
  computeProgress,
  computeWordCloud,
  createInternalRoomState,
  deserializeRoom,
  endActive,
  advancePhase,
  rewindPhase,
  serializeRoom,
  setWorkResult,
  toPublicState,
  type InternalRoomState,
  type SerializedRoomState,
} from './state';

const STORAGE_KEY = 'room';

interface Attachment {
  role: 'teacher' | 'student' | 'pending';
  sid?: string;
  lastReactionAt?: number;
}

export class RoomDO {
  private state: DurableObjectState;
  private room: InternalRoomState | null = null;
  private reactionSeq = 0;
  private characterSeq = 0;

  constructor(state: DurableObjectState) {
    this.state = state;
    state.blockConcurrencyWhile(async () => {
      const saved = await state.storage.get<SerializedRoomState>(STORAGE_KEY);
      if (saved) this.room = deserializeRoom(saved);
    });
  }

  private async persist() {
    if (!this.room) return;
    await this.state.storage.put(STORAGE_KEY, serializeRoom(this.room));
  }

  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);

    if (url.pathname === '/init' && req.method === 'POST') {
      const body = (await req.json()) as { code: string; classes: string[] | null };
      if (!this.room) {
        this.room = createInternalRoomState(body.code, body.classes);
        await this.persist();
      }
      return new Response(JSON.stringify({ teacherToken: this.room.teacherToken }), {
        headers: { 'content-type': 'application/json' },
      });
    }

    if (req.headers.get('Upgrade') === 'websocket') {
      if (!this.room) {
        // Room not initialized — reject.
        return new Response('Room not found', { status: 404 });
      }
      const pair = new WebSocketPair();
      const [client, server] = [pair[0], pair[1]];
      const attachment: Attachment = { role: 'pending' };
      this.state.acceptWebSocket(server);
      server.serializeAttachment(attachment);
      return new Response(null, { status: 101, webSocket: client });
    }

    return new Response('Not found', { status: 404 });
  }

  async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer) {
    if (!this.room) return;
    let msg: ClientMessage;
    try {
      msg = JSON.parse(typeof raw === 'string' ? raw : new TextDecoder().decode(raw));
    } catch {
      this.sendTo(ws, { type: 'ERROR', payload: { code: 'BAD_JSON', message: 'invalid' } });
      return;
    }

    const attachment = (ws.deserializeAttachment() as Attachment | null) ?? { role: 'pending' };

    switch (msg.type) {
      case 'PING':
        this.sendTo(ws, { type: 'PONG', payload: {} });
        return;

      case 'HELLO':
        this.sendTo(ws, { type: 'STATE', payload: { state: toPublicState(this.room) } });
        return;

      case 'S_JOIN': {
        const { code, className, sid } = msg.payload;
        if (code !== this.room.code) {
          this.sendTo(ws, {
            type: 'ERROR',
            payload: { code: 'NO_ROOM', message: 'ルームコードが違います' },
          });
          return;
        }
        if (!this.room.classes.includes(className)) {
          this.sendTo(ws, {
            type: 'ERROR',
            payload: { code: 'BAD_CLASS', message: 'クラス名が不正です' },
          });
          return;
        }
        let student: StudentInfo;
        if (sid && this.room.students.has(sid)) {
          const existing = this.room.students.get(sid)!;
          existing.className = className;
          existing.lastSeenAt = Date.now();
          existing.online = true;
          student = existing;
        } else {
          const newSid = sid || crypto.randomUUID();
          student = {
            sid: newSid,
            className,
            joinedAt: Date.now(),
            lastSeenAt: Date.now(),
            online: true,
          };
          this.room.students.set(newSid, student);
        }
        attachment.role = 'student';
        attachment.sid = student.sid;
        ws.serializeAttachment(attachment);
        await this.persist();
        this.sendTo(ws, {
          type: 'JOINED',
          payload: { sid: student.sid, state: toPublicState(this.room), self: student },
        });
        this.broadcastStudentCount();
        return;
      }

      case 'T_CREATE_ROOM': {
        if (msg.payload.teacherToken !== this.room.teacherToken) {
          this.sendTo(ws, {
            type: 'ERROR',
            payload: { code: 'UNAUTHORIZED', message: '権限がありません' },
          });
          return;
        }
        attachment.role = 'teacher';
        ws.serializeAttachment(attachment);
        this.sendTo(ws, {
          type: 'ROOM_CREATED',
          payload: { code: this.room.code, teacherToken: this.room.teacherToken },
        });
        this.sendTo(ws, { type: 'STATE', payload: { state: toPublicState(this.room) } });
        return;
      }

      case 'T_NEXT_PHASE': {
        if (!this.checkTeacher(ws, msg.payload.token)) return;
        const prev = this.room.phase;
        const phase = advancePhase(this.room);
        await this.persist();
        this.broadcast({ type: 'PHASE_CHANGE', payload: { phase } });
        this.onPhaseEntered(prev, phase);
        return;
      }

      case 'T_PREV_PHASE': {
        if (!this.checkTeacher(ws, msg.payload.token)) return;
        const prev = this.room.phase;
        const phase = rewindPhase(this.room);
        if (phase !== prev) {
          await this.persist();
          this.broadcast({ type: 'PHASE_CHANGE', payload: { phase } });
          this.onPhaseEntered(prev, phase);
        }
        return;
      }

      case 'T_END_ACTIVE': {
        if (!this.checkTeacher(ws, msg.payload.token)) return;
        const prev = this.room.phase;
        const phase = endActive(this.room);
        if (phase !== prev) {
          await this.persist();
          this.broadcast({ type: 'PHASE_CHANGE', payload: { phase } });
          this.onPhaseEntered(prev, phase);
        }
        return;
      }

      case 'T_CLOSE_ROOM': {
        if (!this.checkTeacher(ws, msg.payload.token)) return;
        const phase = closeRoom(this.room);
        await this.persist();
        this.broadcast({ type: 'PHASE_CHANGE', payload: { phase } });
        return;
      }

      case 'T_SET_DISTRIBUTION_VIEW': {
        if (!this.checkTeacher(ws, msg.payload.token)) return;
        this.room.distributionView = msg.payload.view;
        await this.persist();
        this.broadcast({ type: 'STATE', payload: { state: toPublicState(this.room) } });
        return;
      }

      case 'S_WORK_RESULT': {
        const sid = attachment.sid;
        if (!sid || !this.room.students.has(sid)) {
          this.sendTo(ws, {
            type: 'ERROR',
            payload: { code: 'NO_SID', message: '入室していません' },
          });
          return;
        }
        const { workId, scores, mainType, subType } = msg.payload;
        if (workId !== 1 && workId !== 2) {
          this.sendTo(ws, {
            type: 'ERROR',
            payload: { code: 'BAD_WORKID', message: 'workId が不正です' },
          });
          return;
        }
        if (typeof mainType !== 'string' || typeof subType !== 'string' || !scores || typeof scores !== 'object') {
          this.sendTo(ws, {
            type: 'ERROR',
            payload: { code: 'BAD_PAYLOAD', message: 'ペイロードが不正です' },
          });
          return;
        }
        setWorkResult(this.room, sid, workId, scores, mainType, subType);
        await this.persist();
        // Live progress to teacher(s) during active phase.
        this.broadcastTeachers({
          type: 'PROGRESS',
          payload: computeProgress(this.room, workId),
        });
        return;
      }

      case 'S_COMMENT': {
        const raw = msg.payload?.text;
        const text = typeof raw === 'string' ? raw.trim().slice(0, 80) : '';
        if (text.length === 0) return;
        this.room.comments.push({ text, ts: Date.now() });
        if (attachment.sid) this.room.commentedSids.add(attachment.sid);
        await this.persist();
        this.broadcastTeachers({
          type: 'COMMENT_CLOUD',
          payload: computeWordCloud(this.room.comments),
        });
        this.broadcastTeachers({
          type: 'COMMENT_LIST',
          payload: computeCommentList(this.room.comments),
        });
        this.broadcastTeachers({
          type: 'COMMENT_PROGRESS',
          payload: computeCommentProgress(this.room),
        });
        return;
      }

      case 'S_CHARACTER_CHECK': {
        const sid = attachment.sid;
        if (!sid || !this.room.students.has(sid)) {
          this.sendTo(ws, {
            type: 'ERROR',
            payload: { code: 'NO_SID', message: '入室していません' },
          });
          return;
        }
        const phase = msg.payload?.phase;
        if (typeof phase !== 'string' || !phase.includes('_explain_')) return;
        const size = addCharacterPress(this.room, phase, sid);
        if (size === null) return;
        await this.persist();
        this.characterSeq += 1;
        this.broadcast({
          type: 'CHARACTER_PRESS',
          payload: { phase: phase as never, count: size, seq: this.characterSeq },
        });
        return;
      }

      case 'REACTION': {
        const now = Date.now();
        if (attachment.lastReactionAt && now - attachment.lastReactionAt < 400) return;
        attachment.lastReactionAt = now;
        ws.serializeAttachment(attachment);
        const emoji = String(msg.payload.emoji ?? '').slice(0, 32);
        if (!emoji) return;
        this.reactionSeq += 1;
        this.broadcast({ type: 'REACTION_BURST', payload: { emoji, seq: this.reactionSeq } });
        return;
      }
    }
  }

  async webSocketClose(ws: WebSocket) {
    if (!this.room) return;
    const attachment = (ws.deserializeAttachment() as Attachment | null) ?? { role: 'pending' };
    if (attachment.role === 'student' && attachment.sid) {
      const st = this.room.students.get(attachment.sid);
      if (st) {
        st.online = false;
        st.lastSeenAt = Date.now();
      }
      await this.persist();
      this.broadcastStudentCount();
    }
  }

  async webSocketError(ws: WebSocket) {
    await this.webSocketClose(ws);
  }

  // ----- helpers -----

  private checkTeacher(ws: WebSocket, token: string): boolean {
    if (!this.room) return false;
    if (token !== this.room.teacherToken) {
      this.sendTo(ws, {
        type: 'ERROR',
        payload: { code: 'UNAUTHORIZED', message: '権限がありません' },
      });
      return false;
    }
    const attachment = (ws.deserializeAttachment() as Attachment | null) ?? { role: 'pending' };
    attachment.role = 'teacher';
    ws.serializeAttachment(attachment);
    return true;
  }

  private sendTo(ws: WebSocket, msg: ServerMessage) {
    try {
      ws.send(JSON.stringify(msg));
    } catch {
      // ignored
    }
  }

  private broadcast(msg: ServerMessage) {
    const payload = JSON.stringify(msg);
    for (const ws of this.state.getWebSockets()) {
      try {
        ws.send(payload);
      } catch {
        // ignored
      }
    }
  }

  private broadcastTeachers(msg: ServerMessage) {
    const payload = JSON.stringify(msg);
    for (const ws of this.state.getWebSockets()) {
      const a = (ws.deserializeAttachment() as Attachment | null) ?? { role: 'pending' };
      if (a.role !== 'teacher') continue;
      try {
        ws.send(payload);
      } catch {
        // ignored
      }
    }
  }

  private broadcastStudentCount() {
    if (!this.room) return;
    const pub = toPublicState(this.room);
    this.broadcast({
      type: 'STUDENT_COUNT',
      payload: { count: pub.studentCount, perClass: pub.perClassCount },
    });
  }

  private onPhaseEntered(prev: string, phase: string) {
    if (!this.room) return;
    if (phase === 'stage1_results') {
      this.broadcastTeachers({
        type: 'WORK_DISTRIBUTION',
        payload: computeDistribution(this.room, 1),
      });
    } else if (phase === 'stage2_results') {
      this.broadcastTeachers({
        type: 'WORK_DISTRIBUTION',
        payload: computeDistribution(this.room, 2),
      });
    } else if (phase === 'stage3_summary') {
      this.broadcastTeachers({
        type: 'CROSS_MATRIX',
        payload: computeCrossMatrix(this.room),
      });
    } else if (phase === 'stage3_comment') {
      this.broadcastTeachers({
        type: 'COMMENT_PROGRESS',
        payload: computeCommentProgress(this.room),
      });
    } else if (phase === 'stage3_wordcloud') {
      this.broadcastTeachers({
        type: 'COMMENT_CLOUD',
        payload: computeWordCloud(this.room.comments),
      });
      this.broadcastTeachers({
        type: 'COMMENT_LIST',
        payload: computeCommentList(this.room.comments),
      });
      this.broadcastTeachers({
        type: 'COMMENT_PROGRESS',
        payload: computeCommentProgress(this.room),
      });
    }
    void prev;
  }
}
