import type { BlendMode } from '@/constants/blend-modes';

export const ROUTES = {
  SCREEN_1: 'screen_1',
  SCREEN_2: 'screen_2',
  SCREEN_3: 'screen_3',
  SCREEN_4: 'screen_4',
  SCREEN_5: 'screen_5',
} as const;

export type RootStackParamList = {
  [ROUTES.SCREEN_1]: undefined;
  [ROUTES.SCREEN_2]: { text1: string };
  [ROUTES.SCREEN_3]: { text1: string; text2: string };
  [ROUTES.SCREEN_4]: { text1: string; text2: string; mode: BlendMode };
  [ROUTES.SCREEN_5]: {
    text1: string;
    text2: string;
    mode: BlendMode;
    result?: string;
    error?: string;
  };
};
