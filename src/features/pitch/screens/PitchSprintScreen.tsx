import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  createHigherLowerRound,
  type HigherLowerGuess,
  type HigherLowerRound,
} from '../../../game/pitch';
import type { DifficultyMode, Instrument } from '../../../types/game';
import { ALL_INSTRUMENTS } from '../../../types/game';
import { theme } from '../../../theme/appTheme';

type PitchSprintScreenProps = {
  selectedMode: DifficultyMode;
  selectedInstrument: Instrument;
  currentCompletion: number;
  onModeChange: (mode: DifficultyMode) => void;
  onInstrumentChange: (instrument: Instrument) => void;
  onBack: () => void;
  onComplete: (earnedPoints: number) => void;
  topBarHeight: number;
  bottomBarHeight: number;
};

type SessionState = 'lobby' | 'playing' | 'paused' | 'results';

const MODES: DifficultyMode[] = ['easy', 'medium', 'hard', 'insane'];

const MODE_ROUND_TARGET: Record<DifficultyMode, number> = {
  easy: 5,
  medium: 7,
  hard: 9,
  insane: 12,
};

const MODE_REWARD: Record<DifficultyMode, number> = {
  easy: 10,
  medium: 14,
  hard: 18,
  insane: 24,
};

const MODE_HEARTS: Record<DifficultyMode, number> = {
  easy: 5,
  medium: 4,
  hard: 3,
  insane: 2,
};

function getFeedback(direction: HigherLowerGuess, isCorrect: boolean) {
  if (isCorrect) {
    return direction === 'higher'
      ? 'Correct. The second note rose.'
      : 'Correct. The second note fell.';
  }

  return direction === 'higher'
    ? 'Missed it. The second note was higher.'
    : 'Missed it. The second note was lower.';
}

export function PitchSprintScreen({
  selectedMode,
  selectedInstrument,
  currentCompletion,
  onModeChange,
  onInstrumentChange,
  onBack,
  onComplete,
  topBarHeight,
  bottomBarHeight,
}: PitchSprintScreenProps) {
  const topInset = Math.max(0, topBarHeight - 52);
  const bottomInset = Math.max(0, bottomBarHeight - 46);

  const roundTarget = MODE_ROUND_TARGET[selectedMode];
  const startingHearts = MODE_HEARTS[selectedMode];
  const rewardPerCorrect = MODE_REWARD[selectedMode];

  const [sessionState, setSessionState] = useState<SessionState>('lobby');
  const [score, setScore] = useState(0);
  const [roundIndex, setRoundIndex] = useState(1);
  const [hearts, setHearts] = useState(startingHearts);
  const [roundOutcome, setRoundOutcome] = useState<string | null>(null);
  const [roundResolved, setRoundResolved] = useState(false);
  const [isRunCompletePending, setIsRunCompletePending] = useState(false);
  const [isInstrumentMenuOpen, setIsInstrumentMenuOpen] = useState(false);
  const [firstRevealed, setFirstRevealed] = useState(false);
  const [secondRevealed, setSecondRevealed] = useState(false);
  const [round, setRound] = useState<HigherLowerRound>(() =>
    createHigherLowerRound(),
  );

  const playPulse = useRef(new Animated.Value(1)).current;
  const notePulse = useRef(new Animated.Value(0.96)).current;
  const topBarAnim = useRef(new Animated.Value(0)).current;
  const bottomBarAnim = useRef(new Animated.Value(0)).current;
  const firstRevealAnim = useRef(new Animated.Value(0)).current;
  const secondRevealAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setSessionState('lobby');
    setIsInstrumentMenuOpen(false);
    setScore(0);
    setRoundIndex(1);
    setHearts(startingHearts);
    setRoundOutcome(null);
    setRoundResolved(false);
    setIsRunCompletePending(false);
    setRound(createHigherLowerRound());
    setFirstRevealed(false);
    setSecondRevealed(false);
    firstRevealAnim.setValue(0);
    secondRevealAnim.setValue(0);
  }, [selectedMode, startingHearts, firstRevealAnim, secondRevealAnim]);

  useEffect(() => {
    Animated.spring(topBarAnim, {
      toValue: 1,
      friction: 7,
      tension: 55,
      useNativeDriver: true,
    }).start();
  }, [topBarAnim]);

  useEffect(() => {
    Animated.timing(bottomBarAnim, {
      toValue: sessionState === 'playing' || sessionState === 'paused' ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [bottomBarAnim, sessionState]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(playPulse, {
          toValue: 1.05,
          duration: 900,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(playPulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [playPulse]);

  const progress = useMemo(
    () => roundIndex / roundTarget,
    [roundIndex, roundTarget],
  );

  const startRun = () => {
    setIsInstrumentMenuOpen(false);
    setSessionState('playing');
    setScore(0);
    setRoundIndex(1);
    setHearts(startingHearts);
    setRoundOutcome(null);
    setRoundResolved(false);
    setIsRunCompletePending(false);
    setRound(createHigherLowerRound());
    setFirstRevealed(false);
    setSecondRevealed(false);
    firstRevealAnim.setValue(0);
    secondRevealAnim.setValue(0);
  };

  const revealNote = (target: 'first' | 'second') => {
    if (sessionState !== 'playing') return;

    if (target === 'first') {
      if (firstRevealed) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setFirstRevealed(true);
      Animated.timing(firstRevealAnim, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
      return;
    }

    if (secondRevealed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSecondRevealed(true);
    Animated.timing(secondRevealAnim, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  const toggleInstrumentMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsInstrumentMenuOpen((current) => !current);
  };

  const togglePause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSessionState((current) => (current === 'paused' ? 'playing' : 'paused'));
  };

  const handleGuess = (guess: HigherLowerGuess) => {
    if (sessionState !== 'playing' || roundResolved) return;

    if (!firstRevealed) {
      setFirstRevealed(true);
      firstRevealAnim.setValue(1);
    }

    if (!secondRevealed) {
      setSecondRevealed(true);
      secondRevealAnim.setValue(1);
    }

    const isCorrect = guess === round.direction;
    const nextScore = isCorrect ? score + rewardPerCorrect : score;
    const nextHearts = isCorrect ? hearts : Math.max(0, hearts - 1);

    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setScore(nextScore);
    setHearts(nextHearts);
    setRoundOutcome(getFeedback(round.direction, isCorrect));
    setRoundResolved(true);

    const runComplete = roundIndex >= roundTarget || nextHearts === 0;
    setIsRunCompletePending(runComplete);
  };

  const handleNextRound = () => {
    if (!roundResolved) return;

    if (isRunCompletePending) {
      setSessionState('results');
      return;
    }

    setRoundIndex((current) => current + 1);
    setRound(createHigherLowerRound());
    setRoundOutcome(null);
    setRoundResolved(false);
    setIsRunCompletePending(false);
    notePulse.setValue(0.96);
    setFirstRevealed(false);
    setSecondRevealed(false);
    firstRevealAnim.setValue(0);
    secondRevealAnim.setValue(0);
  };

  const handlePlayNotes = () => {
    notePulse.setValue(0.96);
    Animated.sequence([
      Animated.timing(notePulse, {
        toValue: 1.04,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(notePulse, {
        toValue: 0.99,
        duration: 150,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(notePulse, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={[styles.screen, { paddingTop: topBarHeight + 14, paddingBottom: bottomBarHeight + 14 }]}>
      <Animated.View
        style={[
          styles.topGlassRailWrap,
          {
            height: topBarHeight,
            opacity: topBarAnim,
            transform: [{ translateY: topBarAnim.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) }],
          },
        ]}
      >
        <BlurView intensity={54} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[styles.topRailContent, { paddingTop: topInset }]}>
          <View style={styles.topSideSlotLeft}>
            <Pressable onPress={onBack} style={styles.iconButton}>
              <Ionicons name="arrow-back" size={20} color={theme.colors.textPrimary} />
            </Pressable>
          </View>

          <View style={styles.topCenterSlot} pointerEvents="none">
            <Text style={styles.topTitle}>Pitch Sprint</Text>
          </View>

          <View style={styles.topSideSlotRight}>
            {sessionState === 'playing' || sessionState === 'paused' ? (
              <View style={styles.instrumentChipStatic}>
                <Text style={styles.instrumentText}>{selectedInstrument}</Text>
              </View>
            ) : (
              <>
                <Pressable onPress={toggleInstrumentMenu} style={styles.instrumentDropdown}>
                  <Text style={styles.instrumentText}>{selectedInstrument}</Text>
                  <Ionicons
                    name={isInstrumentMenuOpen ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={theme.colors.textSecondary}
                  />
                </Pressable>
                {isInstrumentMenuOpen ? (
                  <View style={styles.instrumentMenu}>
                    {ALL_INSTRUMENTS.map((instrument) => {
                      const active = instrument === selectedInstrument;
                      return (
                        <Pressable
                          key={instrument}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            onInstrumentChange(instrument);
                            setIsInstrumentMenuOpen(false);
                          }}
                          style={[styles.instrumentMenuItem, active && styles.instrumentMenuItemActive]}
                        >
                          <Text style={[styles.instrumentMenuText, active && styles.instrumentMenuTextActive]}>
                            {instrument}
                          </Text>
                          {active ? (
                            <Ionicons name="checkmark" size={14} color={theme.colors.accentTeal} />
                          ) : null}
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}
              </>
            )}
          </View>
        </View>
        <View style={styles.topGlassBorder} />
      </Animated.View>

      {sessionState === 'lobby' ? (
        <View style={styles.lobbyCard}>
          <Text style={styles.lobbyModeLabel}>Pitch Sprint</Text>
          <Text style={styles.lobbyTitle}>Choose difficulty, then start your run.</Text>
          <Text style={styles.lobbyCaption}>
            Current progress in {selectedMode}: {currentCompletion}%
          </Text>

          <View style={styles.modePickerRow}>
            {MODES.map((mode) => {
              const active = mode === selectedMode;

              return (
                <Pressable
                  key={mode}
                  onPress={() => onModeChange(mode)}
                  style={[
                    styles.modeChip,
                    active && styles.modeChipActive,
                  ]}
                >
                  <Text style={[styles.modeChipText, active && styles.modeChipTextActive]}>
                    {mode}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.lobbyMeta}>Rounds: {roundTarget} | Hearts: {startingHearts}</Text>

          <Pressable onPress={startRun} style={styles.startButton}>
            <Text style={styles.startButtonText}>
              {currentCompletion > 0 ? 'Continue' : 'Start'}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {sessionState === 'playing' || sessionState === 'paused' ? (
        <>
          <Text style={styles.modeLabel}>Pitch / {selectedMode}</Text>
          <Text style={styles.title}>Was the second note higher or lower?</Text>
          <Text style={styles.caption}>
            {roundResolved
              ? roundOutcome
              : `Round ${Math.min(roundIndex, roundTarget)} of ${roundTarget}`}
          </Text>

          <Animated.View
            style={[styles.notesCard, { transform: [{ scale: notePulse }] }]}
          >
            <Text style={styles.notesLabel}>Current prompt</Text>
            <View style={styles.notesRow}>
              <Pressable
                onPress={() => revealNote('first')}
                disabled={sessionState !== 'playing' || firstRevealed}
                style={styles.noteBubblePrimary}
              >
                <Animated.Text
                  style={[
                    styles.noteName,
                    {
                      opacity: firstRevealAnim.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] }),
                      transform: [{
                        scale: firstRevealAnim.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] }),
                      }],
                    },
                  ]}
                >
                  {firstRevealed ? round.firstNote : '?'}
                </Animated.Text>
              </Pressable>
              <View style={styles.noteConnector} />
              <Pressable
                onPress={() => revealNote('second')}
                disabled={sessionState !== 'playing' || secondRevealed}
                style={styles.noteBubbleSecondary}
              >
                <Animated.Text
                  style={[
                    styles.noteName,
                    {
                      opacity: secondRevealAnim.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] }),
                      transform: [{
                        scale: secondRevealAnim.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] }),
                      }],
                    },
                  ]}
                >
                  {secondRevealed ? round.secondNote : '?'}
                </Animated.Text>
              </Pressable>
            </View>
            <Text style={styles.notesHint}>
              Tap both note bubbles to reveal before answering.
            </Text>
            <Animated.View style={{ transform: [{ scale: playPulse }] }}>
              <Pressable onPress={handlePlayNotes} style={styles.playButton}>
                <View style={styles.playButtonContent}>
                  <Ionicons name="play" size={16} color="#f8f4ea" />
                  <Text style={styles.playButtonText}>Play notes</Text>
                </View>
              </Pressable>
            </Animated.View>
          </Animated.View>

          <View style={styles.answerRow}>
            <Pressable
              onPress={() => handleGuess('lower')}
              disabled={sessionState !== 'playing' || roundResolved}
              style={({ pressed }) => [
                styles.answerButton,
                styles.lowerButton,
                (sessionState !== 'playing' || roundResolved) && styles.answerButtonDisabled,
                pressed && styles.answerButtonPressed,
              ]}
            >
              <Text style={styles.answerText}>Lower</Text>
            </Pressable>
            <Pressable
              onPress={() => handleGuess('higher')}
              disabled={sessionState !== 'playing' || roundResolved}
              style={({ pressed }) => [
                styles.answerButton,
                styles.higherButton,
                (sessionState !== 'playing' || roundResolved) && styles.answerButtonDisabled,
                pressed && styles.answerButtonPressed,
              ]}
            >
              <Text style={styles.answerText}>Higher</Text>
            </Pressable>
          </View>

          {roundResolved ? (
            <Pressable onPress={handleNextRound} style={styles.nextButton}>
              <Text style={styles.nextButtonText}>
                {isRunCompletePending ? 'See results' : 'Next round'}
              </Text>
            </Pressable>
          ) : null}

          {sessionState === 'paused' ? (
            <View style={styles.pauseOverlay}>
              <Text style={styles.pauseTitle}>Paused</Text>
              <Pressable onPress={togglePause} style={styles.pauseButton}>
                <Ionicons name="play" size={18} color={theme.colors.textDark} />
                <Text style={styles.pauseButtonText}>Resume</Text>
              </Pressable>
            </View>
          ) : null}
        </>
      ) : null}

      {sessionState === 'results' ? (
        <View style={styles.resultsCard}>
          <Text style={styles.resultsTitle}>{hearts === 0 ? 'Run ended' : 'Run clear'}</Text>
          <Text style={styles.resultsText}>
            You banked {score} points in {selectedMode} mode.
          </Text>
          <View style={styles.resultsButtonRow}>
            <Pressable onPress={() => setSessionState('lobby')} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Retry</Text>
            </Pressable>
            <Pressable onPress={() => onComplete(score)} style={styles.resultsButton}>
              <Text style={styles.resultsButtonText}>Collect points</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <Animated.View
        style={[
          styles.bottomGlassRailWrap,
          {
            height: bottomBarHeight,
            opacity: bottomBarAnim,
            transform: [{ translateY: bottomBarAnim.interpolate({ inputRange: [0, 1], outputRange: [26, 0] }) }],
          },
        ]}
        pointerEvents={sessionState === 'playing' || sessionState === 'paused' ? 'auto' : 'none'}
      >
        <BlurView intensity={54} tint="dark" style={StyleSheet.absoluteFill} />
        <View
          style={[
            styles.bottomRailContent,
            {
              paddingTop: Math.max(4, bottomInset / 2),
              paddingBottom: Math.max(4, bottomInset / 2),
              transform: [{ translateY: -4 }],
            },
          ]}
        >
          <View style={styles.bottomProgressBlock}>
            <View style={styles.bottomProgressTrack}>
              <View style={[styles.bottomProgressFill, { width: `${progress * 100}%` }]} />
            </View>
          </View>
          <Pressable onPress={togglePause} style={styles.iconButton}>
            <Ionicons
              name={sessionState === 'paused' ? 'play' : 'pause'}
              size={18}
              color={theme.colors.textPrimary}
            />
          </Pressable>
        </View>
        <View style={styles.bottomGlassBorder} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#071729',
  },
  topGlassRailWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5,
    overflow: 'hidden',
  },
  topRailContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  topSideSlotLeft: {
    width: 112,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  topCenterSlot: {
    position: 'absolute',
    left: 72,
    right: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topSideSlotRight: {
    width: 112,
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 7,
  },
  topGlassBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(213, 231, 255, 0.12)',
  },
  topTitle: {
    color: theme.colors.textPrimary,
    fontSize: 24,
    fontWeight: '900',
    flex: 1,
    textAlign: 'center',
    marginTop: 44,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instrumentDropdown: {
    minWidth: 98,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 6,
  },
  instrumentChipStatic: {
    minWidth: 98,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  instrumentMenu: {
    position: 'absolute',
    top: 46,
    right: 0,
    minWidth: 130,
    backgroundColor: '#0f2138',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(213, 231, 255, 0.18)',
    paddingVertical: 6,
    overflow: 'hidden',
  },
  instrumentMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  instrumentMenuItemActive: {
    backgroundColor: 'rgba(47, 195, 167, 0.14)',
  },
  instrumentMenuText: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  instrumentMenuTextActive: {
    color: theme.colors.accentTeal,
  },
  instrumentText: {
    color: theme.colors.textPrimary,
    textTransform: 'capitalize',
    fontSize: 12,
    fontWeight: '800',
  },
  lobbyCard: {
    marginTop: 24,
    backgroundColor: '#fff9e8',
    borderRadius: 30,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(19, 34, 56, 0.10)',
  },
  lobbyModeLabel: {
    color: '#0f7a63',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  modeLabel: {
    color: '#f4d27a',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 32,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  lobbyTitle: {
    color: '#132238',
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 36,
    marginTop: 8,
  },
  title: {
    color: '#f9f2dd',
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 38,
    marginTop: 10,
  },
  lobbyCaption: {
    color: '#4b6077',
    fontSize: 14,
    marginTop: 8,
  },
  caption: {
    color: '#b7c9dc',
    fontSize: 15,
    marginTop: 8,
    lineHeight: 22,
    minHeight: 44,
  },
  modePickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  modeChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d2c6a6',
    backgroundColor: '#f6ebcf',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modeChipActive: {
    backgroundColor: '#2fc3a7',
    borderColor: '#2fc3a7',
  },
  modeChipText: {
    color: '#546173',
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'capitalize',
  },
  modeChipTextActive: {
    color: '#132238',
  },
  lobbyMeta: {
    color: '#4d5d71',
    fontSize: 13,
    marginTop: 16,
    fontWeight: '800',
  },
  startButton: {
    marginTop: 18,
    backgroundColor: '#132238',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#f8f4ea',
    fontSize: 15,
    fontWeight: '900',
  },
  notesCard: {
    backgroundColor: '#fff9ea',
    borderRadius: 30,
    padding: 22,
    marginTop: 28,
    borderWidth: 1,
    borderColor: 'rgba(19, 34, 56, 0.10)',
    shadowColor: '#001020',
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  notesLabel: {
    color: '#55657a',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  noteBubblePrimary: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#2fc3a7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteBubbleSecondary: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#ff8356',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteConnector: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    marginHorizontal: 8,
    backgroundColor: '#e2d6b7',
  },
  noteName: {
    color: '#132238',
    fontSize: 34,
    fontWeight: '900',
  },
  notesHint: {
    color: '#506174',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 20,
  },
  playButton: {
    marginTop: 18,
    backgroundColor: '#132238',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  playButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playButtonText: {
    color: '#f8f4ea',
    fontSize: 15,
    fontWeight: '900',
  },
  answerRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 22,
  },
  answerButton: {
    flex: 1,
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: 'center',
  },
  higherButton: {
    backgroundColor: '#2fc3a7',
  },
  lowerButton: {
    backgroundColor: '#ff8356',
  },
  answerButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  answerButtonDisabled: {
    opacity: 0.52,
  },
  answerText: {
    color: '#132238',
    fontSize: 18,
    fontWeight: '900',
  },
  nextButton: {
    marginTop: 18,
    backgroundColor: '#f1c75b',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#2b1f00',
    fontSize: 15,
    fontWeight: '900',
  },
  pauseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(8, 16, 28, 0.72)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  pauseTitle: {
    color: theme.colors.textPrimary,
    fontSize: 24,
    fontWeight: '900',
  },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.accentGold,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  pauseButtonText: {
    color: theme.colors.textDark,
    fontWeight: '900',
  },
  bottomGlassRailWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
    overflow: 'hidden',
  },
  bottomRailContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 14,
  },
  bottomGlassBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(213, 231, 255, 0.10)',
  },
  bottomProgressBlock: {
    flex: 1,
    gap: 5,
  },
  bottomProgressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#16314f',
    overflow: 'hidden',
  },
  bottomProgressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: theme.colors.accentTeal,
  },
  resultsCard: {
    marginTop: 24,
    borderRadius: 28,
    backgroundColor: '#0f2844',
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(213, 231, 255, 0.14)',
  },
  resultsTitle: {
    color: '#f7f4ea',
    fontSize: 28,
    fontWeight: '900',
  },
  resultsText: {
    color: '#b9c7d8',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
  },
  resultsButtonRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 10,
  },
  secondaryButton: {
    backgroundColor: '#244363',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  secondaryButtonText: {
    color: '#dbe9fb',
    fontWeight: '800',
  },
  resultsButton: {
    backgroundColor: '#f1c75b',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  resultsButtonText: {
    color: '#3a2b00',
    fontWeight: '900',
    fontSize: 14,
  },
});
