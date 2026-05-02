# Audio Assets

## Folder Structure

```
assets/audio/
  piano/     ← drop 12 mp3 files here
  guitar/    ← drop 12 mp3 files here
  synth/     ← drop 12 mp3 files here
```

## File Naming Convention

Each instrument folder should contain exactly 12 mp3 files, one per chromatic note (octave 4):

| File name  | Note         |
|------------|--------------|
| C4.mp3     | C natural    |
| Db4.mp3    | C# / D♭      |
| D4.mp3     | D natural    |
| Eb4.mp3    | D# / E♭      |
| E4.mp3     | E natural    |
| F4.mp3     | F natural    |
| Gb4.mp3    | F# / G♭      |
| G4.mp3     | G natural    |
| Ab4.mp3    | G# / A♭      |
| A4.mp3     | A natural    |
| Bb4.mp3    | A# / B♭      |
| B4.mp3     | B natural    |

## Adding New Instruments

1. Create a new folder under `assets/audio/` with the instrument name
2. Add your 12 mp3 files using the naming convention above
3. Add the instrument to `src/types/game.ts` → `Instrument` union type
4. Add the require() map in `src/audio/index.ts`

## Wiring Up Audio

Once files are in place, open `src/audio/index.ts` and uncomment the `require()` calls
for each instrument. The app uses `expo-av` (install with `npx expo install expo-av`)
to play the returned asset.
