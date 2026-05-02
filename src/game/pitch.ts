const NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;

export type HigherLowerGuess = 'higher' | 'lower';

export type HigherLowerRound = {
  firstNote: string;
  secondNote: string;
  direction: HigherLowerGuess;
};

export function createHigherLowerRound(): HigherLowerRound {
  const firstIndex = Math.floor(Math.random() * NOTES.length);
  const direction: HigherLowerGuess = Math.random() > 0.5 ? 'higher' : 'lower';
  const offset = 1 + Math.floor(Math.random() * 2);

  let secondIndex =
    direction === 'higher' ? firstIndex + offset : firstIndex - offset;

  if (secondIndex < 0) {
    secondIndex = firstIndex + offset;
    return {
      firstNote: NOTES[firstIndex],
      secondNote: NOTES[Math.min(secondIndex, NOTES.length - 1)],
      direction: 'higher',
    };
  }

  if (secondIndex >= NOTES.length) {
    secondIndex = firstIndex - offset;
    return {
      firstNote: NOTES[firstIndex],
      secondNote: NOTES[Math.max(secondIndex, 0)],
      direction: 'lower',
    };
  }

  return {
    firstNote: NOTES[firstIndex],
    secondNote: NOTES[secondIndex],
    direction,
  };
}