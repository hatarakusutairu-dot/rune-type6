export type Role = 'teacher' | 'student' | 'guest';

export interface ConnectionState {
  status: 'idle' | 'connecting' | 'open' | 'closed' | 'error';
  lastError?: string;
}
