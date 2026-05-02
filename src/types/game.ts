export type DifficultyMode = 'easy' | 'medium' | 'hard' | 'insane';

export type Instrument = 'piano' | 'guitar' | 'synth';

export const ALL_INSTRUMENTS: Instrument[] = ['piano', 'guitar', 'synth'];

export type GameId = 'pitch' | 'tempo-tap' | 'whats-that-chord' | 'ladder';

export type GameDefinition = {
  id: GameId;
  title: string;
  description: string;
  accent: string;
  unlockCost: number;
};

export type GameProgress = {
  selectedMode: DifficultyMode;
  completion: Record<DifficultyMode, number>;
};

export type GameProgressMap = Record<GameId, GameProgress>;
