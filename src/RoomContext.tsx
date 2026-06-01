import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ClientMessage, Phase, PublicRoomState, ServerMessage, StudentInfo } from '@shared/protocol';
import { connect, type SyncHandle } from './lib/sync';
import { loadState, patchState } from './lib/storage';

export type Role = 'teacher' | 'student' | 'guest';

interface RoomCtxValue {
  role: Role;
  setRole: (r: Role) => void;
  code: string | null;
  setCode: (c: string | null) => void;
  status: 'idle' | 'connecting' | 'open' | 'closed' | 'error';
  state: PublicRoomState | null;
  phase: Phase;
  sid: string | null;
  teacherToken: string | null;
  setTeacherToken: (t: string | null) => void;
  self: StudentInfo | null;
  studentCount: number;
  perClassCount: Record<string, number>;
  lastError: string | null;
  send: (msg: ClientMessage) => void;
  connectToRoom: (code: string) => void;
  disconnect: () => void;
  /** Teacher.tsx calls this with the teacherToken so the socket auto-claims on (re)open. */
  armTeacherClaim: (token: string | null) => void;
  /** Student.tsx calls this with a join payload so the socket auto-rejoins on (re)open. */
  armStudentRejoin: (info: { code: string; className: string; sid: string } | null) => void;
  events: ServerEvents;
}

interface ServerEvents {
  progress?: Extract<ServerMessage, { type: 'PROGRESS' }>['payload'];
  distribution?: Extract<ServerMessage, { type: 'WORK_DISTRIBUTION' }>['payload'];
  cross?: Extract<ServerMessage, { type: 'CROSS_MATRIX' }>['payload'];
  cloud?: Extract<ServerMessage, { type: 'COMMENT_CLOUD' }>['payload'];
  commentList?: Extract<ServerMessage, { type: 'COMMENT_LIST' }>['payload'];
  commentProgress?: Extract<ServerMessage, { type: 'COMMENT_PROGRESS' }>['payload'];
  lastReaction?: { emoji: string; seq: number };
  /** Last press event — used to trigger a burst animation. */
  lastCharacterPress?: { phase: string; count: number; seq: number };
}

interface RejoinInfo {
  code: string;
  className: string;
  sid: string;
}

const RoomCtx = createContext<RoomCtxValue | null>(null);

export function useRoom() {
  const ctx = useContext(RoomCtx);
  if (!ctx) throw new Error('useRoom must be used within RoomProvider');
  return ctx;
}

export function RoomProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('guest');
  const [code, setCode] = useState<string | null>(null);
  const [status, setStatus] = useState<RoomCtxValue['status']>('idle');
  const [state, setState] = useState<PublicRoomState | null>(null);
  const [sid, setSid] = useState<string | null>(loadState().sid ?? null);
  const [self, setSelf] = useState<StudentInfo | null>(null);
  const [teacherToken, setTeacherToken] = useState<string | null>(() =>
    sessionStorage.getItem('rune-type6:teacherToken'),
  );
  const [lastError, setLastError] = useState<string | null>(null);
  const [events, setEvents] = useState<ServerEvents>({});

  const handleRef = useRef<SyncHandle | null>(null);
  const rejoinRef = useRef<RejoinInfo | null>(null);
  const teacherClaimRef = useRef<string | null>(null);

  const phase: Phase = state?.phase ?? 'lobby';
  const studentCount = state?.studentCount ?? 0;
  const perClassCount = state?.perClassCount ?? {};

  useEffect(() => {
    if (teacherToken) sessionStorage.setItem('rune-type6:teacherToken', teacherToken);
    else sessionStorage.removeItem('rune-type6:teacherToken');
  }, [teacherToken]);

  const handleMessage = useCallback((msg: ServerMessage) => {
    switch (msg.type) {
      case 'ROOM_CREATED':
        setTeacherToken(msg.payload.teacherToken);
        setCode(msg.payload.code);
        break;
      case 'JOINED':
        setSid(msg.payload.sid);
        setState(msg.payload.state);
        setSelf(msg.payload.self);
        patchState({ sid: msg.payload.sid, roomCode: msg.payload.state.code });
        if (msg.payload.self) {
          rejoinRef.current = {
            code: msg.payload.state.code,
            className: msg.payload.self.className,
            sid: msg.payload.sid,
          };
        }
        break;
      case 'STATE':
        setState(msg.payload.state);
        break;
      case 'PHASE_CHANGE':
        setState((s) => (s ? { ...s, phase: msg.payload.phase } : s));
        break;
      case 'STUDENT_COUNT':
        setState((s) =>
          s ? { ...s, studentCount: msg.payload.count, perClassCount: msg.payload.perClass } : s,
        );
        break;
      case 'PROGRESS':
        setEvents((e) => ({ ...e, progress: msg.payload }));
        break;
      case 'WORK_DISTRIBUTION':
        setEvents((e) => ({ ...e, distribution: msg.payload }));
        break;
      case 'CROSS_MATRIX':
        setEvents((e) => ({ ...e, cross: msg.payload }));
        break;
      case 'COMMENT_CLOUD':
        setEvents((e) => ({ ...e, cloud: msg.payload }));
        break;
      case 'COMMENT_LIST':
        setEvents((e) => ({ ...e, commentList: msg.payload }));
        break;
      case 'COMMENT_PROGRESS':
        setEvents((e) => ({ ...e, commentProgress: msg.payload }));
        break;
      case 'REACTION_BURST':
        setEvents((e) => ({
          ...e,
          lastReaction: { emoji: msg.payload.emoji, seq: msg.payload.seq },
        }));
        break;
      case 'CHARACTER_PRESS':
        setState((s) =>
          s
            ? {
                ...s,
                characterPressCounts: {
                  ...(s.characterPressCounts ?? {}),
                  [msg.payload.phase]: msg.payload.count,
                },
              }
            : s,
        );
        setEvents((e) => ({
          ...e,
          lastCharacterPress: {
            phase: msg.payload.phase,
            count: msg.payload.count,
            seq: msg.payload.seq,
          },
        }));
        break;
      case 'ERROR':
        setLastError(`${msg.payload.code}: ${msg.payload.message}`);
        break;
      case 'PONG':
        break;
    }
  }, []);

  const connectToRoom = useCallback(
    (c: string) => {
      handleRef.current?.close();
      setCode(c);
      setLastError(null);
      // Reset per-room view state so a switch to a different room doesn't
      // briefly show the old room's phase / self / events while the new
      // STATE/JOINED arrives.
      setState(null);
      setSelf(null);
      setEvents({});
      handleRef.current = connect({
        code: c,
        onMessage: handleMessage,
        onStatus: setStatus,
        onOpen: () => {
          // Re-establish role on every (re)open so reconnects don't leave the socket as 'pending'.
          const claim = teacherClaimRef.current;
          if (claim) {
            handleRef.current?.send({ type: 'T_CREATE_ROOM', payload: { teacherToken: claim } });
          }
          const rj = rejoinRef.current;
          if (rj && rj.code === c) {
            handleRef.current?.send({
              type: 'S_JOIN',
              payload: { code: rj.code, className: rj.className, sid: rj.sid },
            });
          }
        },
      });
    },
    [handleMessage],
  );

  const disconnect = useCallback(() => {
    handleRef.current?.close();
    handleRef.current = null;
    rejoinRef.current = null;
    teacherClaimRef.current = null;
    setStatus('idle');
    setState(null);
    setSelf(null);
  }, []);

  const armTeacherClaim = useCallback((token: string | null) => {
    teacherClaimRef.current = token;
  }, []);

  /**
   * Pre-arm an S_JOIN payload so any (re)open of the WebSocket will resend
   * it. Called by Student.tsx right before send() so a click that lands on a
   * "OPEN but actually dead" socket is recovered by the next reconnect.
   */
  const armStudentRejoin = useCallback(
    (info: RejoinInfo | null) => {
      rejoinRef.current = info;
    },
    [],
  );

  useEffect(() => () => handleRef.current?.close(), []);

  const send = useCallback((msg: ClientMessage) => {
    handleRef.current?.send(msg);
  }, []);

  const value = useMemo<RoomCtxValue>(
    () => ({
      role,
      setRole,
      code,
      setCode,
      status,
      state,
      phase,
      sid,
      teacherToken,
      setTeacherToken,
      self,
      studentCount,
      perClassCount,
      lastError,
      send,
      connectToRoom,
      disconnect,
      armTeacherClaim,
      armStudentRejoin,
      events,
    }),
    [
      role,
      code,
      status,
      state,
      phase,
      sid,
      teacherToken,
      self,
      studentCount,
      perClassCount,
      lastError,
      send,
      connectToRoom,
      disconnect,
      armTeacherClaim,
      armStudentRejoin,
      events,
    ],
  );

  return <RoomCtx.Provider value={value}>{children}</RoomCtx.Provider>;
}
