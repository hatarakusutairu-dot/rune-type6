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
  events: ServerEvents;
}

interface ServerEvents {
  progress?: Extract<ServerMessage, { type: 'PROGRESS' }>['payload'];
  distribution?: Extract<ServerMessage, { type: 'WORK_DISTRIBUTION' }>['payload'];
  cross?: Extract<ServerMessage, { type: 'CROSS_MATRIX' }>['payload'];
  cloud?: Extract<ServerMessage, { type: 'COMMENT_CLOUD' }>['payload'];
  lastReaction?: { emoji: string; ts: number };
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
      case 'REACTION_BURST':
        setEvents((e) => ({ ...e, lastReaction: { emoji: msg.payload.emoji, ts: Date.now() } }));
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
      handleRef.current = connect({
        code: c,
        onMessage: handleMessage,
        onStatus: setStatus,
      });
    },
    [handleMessage],
  );

  const disconnect = useCallback(() => {
    handleRef.current?.close();
    handleRef.current = null;
    setStatus('idle');
    setState(null);
    setSelf(null);
  }, []);

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
      events,
    ],
  );

  return <RoomCtx.Provider value={value}>{children}</RoomCtx.Provider>;
}
