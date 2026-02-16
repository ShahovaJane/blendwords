export const LISTEN_STATE = {
  IDLE: 'idle',
  LOADING: 'loading',
  PLAYING: 'playing',
} as const;

export type ListenState = (typeof LISTEN_STATE)[keyof typeof LISTEN_STATE];
