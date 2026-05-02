export const UNIT_TITLE = 'Pitch Playground';
export const TODAY_STREAK = 4;
export const TOTAL_XP = 120;

export const GAME_LIBRARY = [
  {
    id: 'higher-lower',
    title: 'Pitch Sprint',
    description:
      'Hear two notes and decide whether the second one jumped up or dropped down.',
    emoji: '🎯',
    level: 'Level 1',
  },
  {
    id: 'same-different',
    title: 'Same or Sneaky',
    description:
      'Spot whether the melody stayed the same or one note quietly changed.',
    emoji: '🕵️',
    level: 'Level 2',
  },
  {
    id: 'interval-ladder',
    title: 'Interval Ladder',
    description:
      'Climb from tiny intervals to wider jumps without losing your streak.',
    emoji: '🪜',
    level: 'Level 3',
  },
] as const;