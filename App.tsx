import { StatusBar } from 'expo-status-bar';
import {
  Animated,
  Easing,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  GAME_LIBRARY,
  TOTAL_XP,
  TODAY_STREAK,
  UNIT_TITLE,
} from './src/data/curriculum';
import {
  createHigherLowerRound,
  type HigherLowerGuess,
  type HigherLowerRound,
} from './src/game/pitch';

type Screen = 'home' | 'higher-lower';

const ROUND_TARGET = 5;

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [score, setScore] = useState(0);
  const [roundIndex, setRoundIndex] = useState(1);
  const [hearts, setHearts] = useState(5);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [round, setRound] = useState<HigherLowerRound>(() =>
    createHigherLowerRound(),
  );

  const heroFloat = useRef(new Animated.Value(0)).current;
  const playPulse = useRef(new Animated.Value(1)).current;
  const notePulse = useRef(new Animated.Value(0.94)).current;
  const feedbackPop = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(heroFloat, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(heroFloat, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [heroFloat]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(playPulse, {
          toValue: 1.06,
          duration: 950,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(playPulse, {
          toValue: 1,
          duration: 950,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [playPulse]);

  const progress = useMemo(() => roundIndex / ROUND_TARGET, [roundIndex]);

  const handleGuess = (guess: HigherLowerGuess) => {
    const isCorrect = guess === round.direction;

    Animated.sequence([
      Animated.spring(feedbackPop, {
        toValue: 1.06,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(feedbackPop, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    if (isCorrect) {
      setScore((current) => current + 10);
      setFeedback(
        round.direction === 'higher'
          ? 'Perfect ear. The second note was higher.'
          : 'Perfect ear. The second note was lower.',
      );
    } else {
      setHearts((current) => Math.max(0, current - 1));
      setFeedback(
        round.direction === 'higher'
          ? 'Not quite. The second note climbed higher.'
          : 'Not quite. The second note dropped lower.',
      );
    }

    if (roundIndex >= ROUND_TARGET || (hearts <= 1 && !isCorrect)) {
      return;
    }

    setTimeout(() => {
      setRoundIndex((current) => current + 1);
      setRound(createHigherLowerRound());
      setFeedback(null);
      notePulse.setValue(0.94);
    }, 900);
  };

  const handleReplayPrompt = () => {
    notePulse.setValue(0.94);

    Animated.sequence([
      Animated.timing(notePulse, {
        toValue: 1.04,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(notePulse, {
        toValue: 0.98,
        duration: 160,
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

  const resetGame = () => {
    setScreen('home');
    setScore(0);
    setRoundIndex(1);
    setHearts(5);
    setFeedback(null);
    setRound(createHigherLowerRound());
  };

  const startHigherLower = () => {
    setScore(0);
    setRoundIndex(1);
    setHearts(5);
    setFeedback(null);
    setRound(createHigherLowerRound());
    setScreen('higher-lower');
  };

  const heroTranslateY = heroFloat.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const sessionFinished = roundIndex >= ROUND_TARGET || hearts === 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.appBackground}>
        <View style={styles.glowOne} />
        <View style={styles.glowTwo} />

        {screen === 'home' ? (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.wordmark}>MusicThing</Text>

            <Animated.View
              style={[
                styles.heroCard,
                { transform: [{ translateY: heroTranslateY }] },
              ]}
            >
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>Unit 1</Text>
              </View>
              <Text style={styles.heroTitle}>{UNIT_TITLE}</Text>
              <Text style={styles.heroSubtitle}>
                Quick wins, bright feedback, and tiny music challenges that
                build real pitch instinct.
              </Text>

              <View style={styles.statsRow}>
                <View style={styles.statPill}>
                  <Text style={styles.statValue}>{TODAY_STREAK}</Text>
                  <Text style={styles.statLabel}>day streak</Text>
                </View>
                <View style={styles.statPill}>
                  <Text style={styles.statValue}>{TOTAL_XP}</Text>
                  <Text style={styles.statLabel}>total xp</Text>
                </View>
              </View>
            </Animated.View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today&apos;s Path</Text>
              <Text style={styles.sectionCaption}>Start simple, then stack skills.</Text>
            </View>

            {GAME_LIBRARY.map((game, index) => {
              const unlocked = index === 0;

              return (
                <Pressable
                  key={game.id}
                  disabled={!unlocked}
                  onPress={() => {
                    if (game.id === 'higher-lower') {
                      startHigherLower();
                    }
                  }}
                  style={({ pressed }) => [
                    styles.gameCard,
                    !unlocked && styles.gameCardLocked,
                    pressed && unlocked && styles.gameCardPressed,
                  ]}
                >
                  <View style={styles.gameCardTopRow}>
                    <Text style={styles.gameEmoji}>{game.emoji}</Text>
                    <View style={styles.levelBadge}>
                      <Text style={styles.levelBadgeText}>{game.level}</Text>
                    </View>
                  </View>
                  <Text style={styles.gameTitle}>{game.title}</Text>
                  <Text style={styles.gameDescription}>{game.description}</Text>
                  <Text style={styles.gameMeta}>
                    {unlocked ? 'Playable now' : 'Unlock after Pitch Sprint'}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : (
          <View style={styles.gameScreen}>
            <View style={styles.gameHeader}>
              <Pressable onPress={resetGame} style={styles.backButton}>
                <Text style={styles.backButtonText}>Back</Text>
              </Pressable>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>
              <Text style={styles.heartsText}>{'♥'.repeat(hearts)}</Text>
            </View>

            <Text style={styles.modeLabel}>Pitch Sprint</Text>
            <Text style={styles.gamePrompt}>Was the second note higher or lower?</Text>
            <Text style={styles.roundCaption}>
              Round {Math.min(roundIndex, ROUND_TARGET)} of {ROUND_TARGET}
            </Text>

            <Animated.View
              style={[styles.notesCard, { transform: [{ scale: notePulse }] }]}
            >
              <Text style={styles.notesLabel}>Prototype prompt</Text>
              <View style={styles.notesRow}>
                <View style={styles.noteBubblePrimary}>
                  <Text style={styles.noteName}>{round.firstNote}</Text>
                </View>
                <View style={styles.noteConnector} />
                <View style={styles.noteBubbleSecondary}>
                  <Text style={styles.noteName}>{round.secondNote}</Text>
                </View>
              </View>
              <Text style={styles.notesHint}>
                Audio playback comes next. For now, this gives us the game loop,
                progression, and interaction model.
              </Text>
              <Animated.View style={{ transform: [{ scale: playPulse }] }}>
                <Pressable onPress={handleReplayPrompt} style={styles.listenButton}>
                  <Text style={styles.listenButtonText}>Pulse the notes</Text>
                </Pressable>
              </Animated.View>
            </Animated.View>

            {!sessionFinished ? (
              <View style={styles.answerRow}>
                <Pressable
                  onPress={() => handleGuess('lower')}
                  style={({ pressed }) => [
                    styles.answerButton,
                    styles.lowerButton,
                    pressed && styles.answerButtonPressed,
                  ]}
                >
                  <Text style={styles.answerText}>Lower</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleGuess('higher')}
                  style={({ pressed }) => [
                    styles.answerButton,
                    styles.higherButton,
                    pressed && styles.answerButtonPressed,
                  ]}
                >
                  <Text style={styles.answerText}>Higher</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.resultsCard}>
                <Text style={styles.resultsTitle}>
                  {hearts === 0 ? 'Session over' : 'Level clear'}
                </Text>
                <Text style={styles.resultsBody}>
                  You earned {score} XP in this prototype run.
                </Text>
                <Pressable onPress={resetGame} style={styles.resultsButton}>
                  <Text style={styles.resultsButtonText}>Return to path</Text>
                </Pressable>
              </View>
            )}

            {feedback ? (
              <Animated.View
                style={[styles.feedbackCard, { transform: [{ scale: feedbackPop }] }]}
              >
                <Text style={styles.feedbackText}>{feedback}</Text>
              </Animated.View>
            ) : null}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#081120',
  },
  appBackground: {
    flex: 1,
    backgroundColor: '#081120',
  },
  glowOne: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#3fd0b9',
    opacity: 0.18,
  },
  glowTwo: {
    position: 'absolute',
    bottom: 100,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#ff8b5e',
    opacity: 0.14,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    gap: 18,
  },
  wordmark: {
    color: '#f7f4ea',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  heroCard: {
    backgroundColor: '#10233d',
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: '#1f3a5a',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f8c74d',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  heroBadgeText: {
    color: '#352500',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  heroTitle: {
    color: '#f7f4ea',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 10,
  },
  heroSubtitle: {
    color: '#b9c7d8',
    fontSize: 15,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  statPill: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#16314f',
  },
  statValue: {
    color: '#f7f4ea',
    fontSize: 26,
    fontWeight: '900',
  },
  statLabel: {
    color: '#8ca3bb',
    fontSize: 13,
    marginTop: 4,
  },
  sectionHeader: {
    marginTop: 6,
  },
  sectionTitle: {
    color: '#f7f4ea',
    fontSize: 22,
    fontWeight: '900',
  },
  sectionCaption: {
    color: '#8ca3bb',
    fontSize: 14,
    marginTop: 4,
  },
  gameCard: {
    backgroundColor: '#fff6df',
    borderRadius: 24,
    padding: 20,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  gameCardLocked: {
    opacity: 0.62,
  },
  gameCardPressed: {
    transform: [{ scale: 0.985 }],
  },
  gameCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gameEmoji: {
    fontSize: 32,
  },
  levelBadge: {
    backgroundColor: '#10233d',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  levelBadgeText: {
    color: '#dfe9f6',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  gameTitle: {
    color: '#182538',
    fontSize: 22,
    fontWeight: '900',
  },
  gameDescription: {
    color: '#405164',
    fontSize: 15,
    lineHeight: 22,
  },
  gameMeta: {
    color: '#0d7c65',
    fontSize: 13,
    fontWeight: '700',
  },
  gameScreen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#10233d',
  },
  backButtonText: {
    color: '#f7f4ea',
    fontWeight: '700',
  },
  progressTrack: {
    flex: 1,
    height: 14,
    borderRadius: 999,
    backgroundColor: '#16314f',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#3fd0b9',
  },
  heartsText: {
    color: '#ff8b5e',
    fontSize: 18,
    fontWeight: '800',
    minWidth: 52,
    textAlign: 'right',
  },
  modeLabel: {
    color: '#f8c74d',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 28,
  },
  gamePrompt: {
    color: '#f7f4ea',
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 36,
    marginTop: 8,
  },
  roundCaption: {
    color: '#90a5ba',
    fontSize: 14,
    marginTop: 8,
  },
  notesCard: {
    backgroundColor: '#fff6df',
    borderRadius: 30,
    padding: 22,
    marginTop: 28,
  },
  notesLabel: {
    color: '#55657a',
    fontSize: 13,
    fontWeight: '700',
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
    backgroundColor: '#3fd0b9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteBubbleSecondary: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#ff8b5e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteConnector: {
    flex: 1,
    height: 6,
    marginHorizontal: 8,
    borderRadius: 999,
    backgroundColor: '#e0d6bc',
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
  listenButton: {
    marginTop: 18,
    backgroundColor: '#132238',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  listenButtonText: {
    color: '#f8f4ea',
    fontSize: 15,
    fontWeight: '800',
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
    backgroundColor: '#3fd0b9',
  },
  lowerButton: {
    backgroundColor: '#ff8b5e',
  },
  answerButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  answerText: {
    color: '#132238',
    fontSize: 18,
    fontWeight: '900',
  },
  feedbackCard: {
    marginTop: 18,
    backgroundColor: '#10233d',
    borderRadius: 20,
    padding: 16,
  },
  feedbackText: {
    color: '#eef4ff',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
  },
  resultsCard: {
    marginTop: 24,
    borderRadius: 28,
    backgroundColor: '#10233d',
    padding: 22,
    alignItems: 'center',
  },
  resultsTitle: {
    color: '#f7f4ea',
    fontSize: 28,
    fontWeight: '900',
  },
  resultsBody: {
    color: '#b9c7d8',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
  },
  resultsButton: {
    marginTop: 18,
    backgroundColor: '#f8c74d',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 18,
  },
  resultsButtonText: {
    color: '#3a2b00',
    fontWeight: '900',
    fontSize: 15,
  },
});
