import type { GameDefinition, GameProgressMap } from '../../../types/game';

export const INITIAL_TOTAL_POINTS = 0;
export const INITIAL_DAY_STREAK = 0;

export const MUSIC_GAMES: GameDefinition[] = [
  {
    id: 'pitch',
    title: 'Pitch',
    description:
      'Train your ear on note direction, interval feel, and fast pitch decisions.',
    accent: '#2fc3a7',
    unlockCost: 0,
  },
  {
    id: 'tempo-tap',
    title: 'TempoTap',
    description:
      'A rhythm and beat trainer built around locking into pulse and tempo memory.',
    accent: '#f1c75b',
    unlockCost: 220,
  },
  {
    id: 'whats-that-chord',
    title: 'What\'s That Chord!?',
    description:
      'Hear a chord, then a new note lands. Guess what the harmony turns into.',
    accent: '#ff8356',
    unlockCost: 360,
  },
  {
    id: 'ladder',
    title: 'The Ladder',
    description:
      'One note plays. You decide how many steps up the next note climbed.',
    accent: '#78a7ff',
    unlockCost: 520,
  },
];

export const INITIAL_GAME_PROGRESS: GameProgressMap = {
  pitch: {
    selectedMode: 'easy',
    completion: {
      easy: 36,
      medium: 12,
      hard: 0,
      insane: 0,
    },
  },
  'tempo-tap': {
    selectedMode: 'easy',
    completion: {
      easy: 0,
      medium: 0,
      hard: 0,
      insane: 0,
    },
  },
  'whats-that-chord': {
    selectedMode: 'easy',
    completion: {
      easy: 0,
      medium: 0,
      hard: 0,
      insane: 0,
    },
  },
  ladder: {
    selectedMode: 'easy',
    completion: {
      easy: 0,
      medium: 0,
      hard: 0,
      insane: 0,
    },
  },
};
