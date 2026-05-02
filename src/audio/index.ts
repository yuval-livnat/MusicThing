import type { Instrument } from '../types/game';

// ─── Note names (flat notation — avoids # in file paths) ──────────────────────
export type NoteName = 'C' | 'Db' | 'D' | 'Eb' | 'E' | 'F' | 'Gb' | 'G' | 'Ab' | 'A' | 'Bb' | 'B';

export const ALL_NOTES: NoteName[] = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Display labels shown in the UI (sharps where conventional)
export const NOTE_DISPLAY: Record<NoteName, string> = {
  C: 'C', Db: 'C#', D: 'D', Eb: 'D#', E: 'E',
  F: 'F', Gb: 'F#', G: 'G', Ab: 'G#', A: 'A', Bb: 'A#', B: 'B',
};

// ─── Audio source type ────────────────────────────────────────────────────────
// Metro's require() returns a number (asset id). Use null until files are added.
type AudioSource = number | null;
type NoteMap = Record<NoteName, AudioSource>;

// ─── Piano ────────────────────────────────────────────────────────────────────
// Drop your mp3s into assets/audio/piano/ then replace null with require():
const PIANO: NoteMap = {
  C:  null, // require('../../assets/audio/piano/C4.mp3'),
  Db: null, // require('../../assets/audio/piano/Db4.mp3'),
  D:  null, // require('../../assets/audio/piano/D4.mp3'),
  Eb: null, // require('../../assets/audio/piano/Eb4.mp3'),
  E:  null, // require('../../assets/audio/piano/E4.mp3'),
  F:  null, // require('../../assets/audio/piano/F4.mp3'),
  Gb: null, // require('../../assets/audio/piano/Gb4.mp3'),
  G:  null, // require('../../assets/audio/piano/G4.mp3'),
  Ab: null, // require('../../assets/audio/piano/Ab4.mp3'),
  A:  null, // require('../../assets/audio/piano/A4.mp3'),
  Bb: null, // require('../../assets/audio/piano/Bb4.mp3'),
  B:  null, // require('../../assets/audio/piano/B4.mp3'),
};

// ─── Guitar ───────────────────────────────────────────────────────────────────
const GUITAR: NoteMap = {
  C:  null, // require('../../assets/audio/guitar/C4.mp3'),
  Db: null, // require('../../assets/audio/guitar/Db4.mp3'),
  D:  null, // require('../../assets/audio/guitar/D4.mp3'),
  Eb: null, // require('../../assets/audio/guitar/Eb4.mp3'),
  E:  null, // require('../../assets/audio/guitar/E4.mp3'),
  F:  null, // require('../../assets/audio/guitar/F4.mp3'),
  Gb: null, // require('../../assets/audio/guitar/Gb4.mp3'),
  G:  null, // require('../../assets/audio/guitar/G4.mp3'),
  Ab: null, // require('../../assets/audio/guitar/Ab4.mp3'),
  A:  null, // require('../../assets/audio/guitar/A4.mp3'),
  Bb: null, // require('../../assets/audio/guitar/Bb4.mp3'),
  B:  null, // require('../../assets/audio/guitar/B4.mp3'),
};

// ─── Synth ────────────────────────────────────────────────────────────────────
const SYNTH: NoteMap = {
  C:  null, // require('../../assets/audio/synth/C4.mp3'),
  Db: null, // require('../../assets/audio/synth/Db4.mp3'),
  D:  null, // require('../../assets/audio/synth/D4.mp3'),
  Eb: null, // require('../../assets/audio/synth/Eb4.mp3'),
  E:  null, // require('../../assets/audio/synth/E4.mp3'),
  F:  null, // require('../../assets/audio/synth/F4.mp3'),
  Gb: null, // require('../../assets/audio/synth/Gb4.mp3'),
  G:  null, // require('../../assets/audio/synth/G4.mp3'),
  Ab: null, // require('../../assets/audio/synth/Ab4.mp3'),
  A:  null, // require('../../assets/audio/synth/A4.mp3'),
  Bb: null, // require('../../assets/audio/synth/Bb4.mp3'),
  B:  null, // require('../../assets/audio/synth/B4.mp3'),
};

// ─── Public API ───────────────────────────────────────────────────────────────
export const AUDIO_MAP: Record<Instrument, NoteMap> = {
  piano: PIANO,
  guitar: GUITAR,
  synth: SYNTH,
};

/**
 * Returns the Metro asset source for a given instrument + note, or null if the
 * audio file has not yet been added to assets/audio/<instrument>/.
 */
export function getAudioSource(instrument: Instrument, note: NoteName): AudioSource {
  return AUDIO_MAP[instrument][note];
}
