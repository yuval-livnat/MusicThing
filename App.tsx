import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  INITIAL_DAY_STREAK,
  INITIAL_GAME_PROGRESS,
  INITIAL_TOTAL_POINTS,
  MUSIC_GAMES,
} from './src/features/home/data/games';
import { HomeScreen } from './src/features/home/screens/HomeScreen';
import { MenuScreen } from './src/features/menu/screens/MenuScreen';
import { PitchSprintScreen } from './src/features/pitch/screens/PitchSprintScreen';
import type { DifficultyMode, GameId, GameProgressMap, Instrument } from './src/types/game';
import { theme } from './src/theme/appTheme';

type Screen = 'home' | 'menu' | 'pitch';

const TOP_BAR_CONTENT_HEIGHT = 52;
const BOTTOM_BAR_CONTENT_HEIGHT = 46;

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const insets = useSafeAreaInsets();
  const topBarHeight = insets.top + TOP_BAR_CONTENT_HEIGHT;
  const bottomBarHeight = insets.bottom + BOTTOM_BAR_CONTENT_HEIGHT;

  const [screen, setScreen] = useState<Screen>('home');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionLabel, setTransitionLabel] = useState('Loading...');
  const [totalPoints, setTotalPoints] = useState(INITIAL_TOTAL_POINTS);
  const [dayStreak, setDayStreak] = useState(INITIAL_DAY_STREAK);
  const [gameProgress, setGameProgress] = useState<GameProgressMap>(INITIAL_GAME_PROGRESS);
  const [unlockedGames, setUnlockedGames] = useState<Set<GameId>>(new Set(['pitch']));
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>('piano');

  const contentAnim = useRef(new Animated.Value(1)).current;

  const transitionTo = (nextScreen: Screen, label: string) => {
    if (isTransitioning) return;
    setTransitionLabel(label);
    setIsTransitioning(true);

    Animated.spring(contentAnim, {
      toValue: 0,
      friction: 8,
      tension: 80,
      useNativeDriver: true,
    }).start(() => {
      setScreen(nextScreen);
      setTimeout(() => {
        Animated.spring(contentAnim, {
          toValue: 1,
          friction: 7,
          tension: 55,
          useNativeDriver: true,
        }).start(() => setIsTransitioning(false));
      }, 160);
    });
  };

  const quickTransitionTo = (nextScreen: Screen) => {
    if (screen === nextScreen || isTransitioning) return;

    Animated.timing(contentAnim, {
      toValue: 0,
      duration: 110,
      useNativeDriver: true,
    }).start(() => {
      setScreen(nextScreen);
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleOpenGame = (gameId: GameId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (gameId === 'pitch') {
      transitionTo('pitch', 'Entering Pitch...');
    }
  };

  const handleUnlockGame = (gameId: GameId) => {
    const game = MUSIC_GAMES.find((g) => g.id === gameId);
    if (!game) return;

    if (totalPoints < game.unlockCost) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Not enough points',
        `You need ${game.unlockCost} pts to unlock ${game.title}. Keep playing to earn more!`,
        [{ text: 'OK' }],
      );
      return;
    }

    Alert.alert(
      `Unlock ${game.title}?`,
      `Spend ${game.unlockCost} points to unlock this game permanently.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlock',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setTotalPoints((p) => p - game.unlockCost);
            setUnlockedGames((prev) => new Set([...prev, gameId]));
          },
        },
      ],
    );
  };

  const handleModeChange = (gameId: GameId, mode: DifficultyMode) => {
    setGameProgress((current) => ({
      ...current,
      [gameId]: { ...current[gameId], selectedMode: mode },
    }));
  };

  const handleSessionComplete = (earnedPoints: number) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTotalPoints((current) => current + earnedPoints);
    setGameProgress((current) => {
      const pitchProgress = current.pitch;
      const nextCompletion = Math.min(
        100,
        pitchProgress.completion[pitchProgress.selectedMode] + 12,
      );
      return {
        ...current,
        pitch: {
          ...pitchProgress,
          completion: {
            ...pitchProgress.completion,
            [pitchProgress.selectedMode]: nextCompletion,
          },
        },
      };
    });
    transitionTo('home', 'Nice run. Returning...');
  };

  const handleWipeProgress = () => {
    setTotalPoints(0);
    setDayStreak(0);
    setGameProgress(INITIAL_GAME_PROGRESS);
    setUnlockedGames(new Set(['pitch']));
    transitionTo('home', 'Resetting progress...');
  };

  const isUnlocked = (gameId: GameId) => unlockedGames.has(gameId);
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <Animated.View
        style={[styles.contentWrap, { opacity: contentAnim, transform: [{ scale: contentAnim }] }]}
      >
        {screen === 'home' && (
          <HomeScreen
            games={MUSIC_GAMES}
            gameProgress={gameProgress}
            isUnlocked={isUnlocked}
            topBarHeight={topBarHeight}
            bottomBarHeight={bottomBarHeight}
            onOpenGame={handleOpenGame}
            onUnlockGame={handleUnlockGame}
          />
        )}
        {screen === 'menu' && (
          <MenuScreen
            totalPoints={totalPoints}
            dayStreak={dayStreak}
            topBarHeight={topBarHeight}
            bottomBarHeight={bottomBarHeight}
            onBack={() => quickTransitionTo('home')}
            onWipeProgress={handleWipeProgress}
          />
        )}
        {screen === 'pitch' && (
          <PitchSprintScreen
            selectedMode={gameProgress.pitch.selectedMode}
            selectedInstrument={selectedInstrument}
            currentCompletion={
              gameProgress.pitch.completion[gameProgress.pitch.selectedMode]
            }
            topBarHeight={topBarHeight}
            bottomBarHeight={bottomBarHeight}
            onModeChange={(mode: DifficultyMode) => handleModeChange('pitch', mode)}
            onInstrumentChange={setSelectedInstrument}
            onBack={() => transitionTo('home', 'Nice run. Returning...')}
            onComplete={handleSessionComplete}
          />
        )}
      </Animated.View>

      {/* Top blur bar — sits at the physical screen edge (behind status bar) */}
      {screen !== 'pitch' ? (
      <View
        pointerEvents="auto"
        style={[styles.topBar, { height: topBarHeight }]}
      >
        <BlurView intensity={54} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[styles.topBarContent, { paddingTop: insets.top }]}>
          {screen !== 'menu' ? (
            <>
              <View style={styles.statPill}>
                <Text style={styles.statValue}>{totalPoints}</Text>
                <Text style={styles.statLabel}> pts</Text>
              </View>
              <View style={styles.statPill}>
                <Text style={styles.statValue}>{dayStreak}</Text>
                <Ionicons name="flame" size={12} color={theme.colors.textSecondary} />
              </View>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  quickTransitionTo('menu');
                }}
                style={styles.menuButton}
              >
                <View style={styles.menuLine} />
                <View style={styles.menuLine} />
                <View style={[styles.menuLine, styles.menuLineShort]} />
              </Pressable>
            </>
          ) : (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                quickTransitionTo('home');
              }}
              style={styles.iconOnlyBackButton}
            >
              <Ionicons name="arrow-back" size={20} color={theme.colors.textPrimary} />
            </Pressable>
          )}
        </View>
        <View style={styles.topBarBorder} />
      </View>
      ) : null}

      {/* Bottom blur bar — at the physical bottom edge */}
      {screen !== 'pitch' ? (
      <View pointerEvents="none" style={[styles.bottomBar, { height: bottomBarHeight }]}> 
        <BlurView intensity={54} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.bottomBarBorder} />
      </View>
      ) : null}

      {isTransitioning ? (
        <View style={styles.transitionOverlay}>
          <BlurView intensity={65} tint="dark" style={styles.transitionCard}>
            <Ionicons name="musical-notes" size={18} color="#f6f1e3" />
            <Text style={styles.transitionText}>{transitionLabel}</Text>
          </BlurView>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentWrap: {
    flex: 1,
  },
  glowTop: {
    position: 'absolute',
    top: -80,
    right: -20,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: theme.colors.accentTeal,
    opacity: 0.16,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -20,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: theme.colors.accentOrange,
    opacity: 0.13,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  topBarContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 8,
  },
  topBarBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(213, 231, 255, 0.12)',
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(18, 38, 64, 0.72)',
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(80, 130, 200, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statValue: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '900',
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },
  menuButton: {
    marginLeft: 'auto',
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
    backgroundColor: 'rgba(18, 38, 64, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(80, 130, 200, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  menuLine: {
    width: 16,
    height: 2,
    borderRadius: 1,
    backgroundColor: theme.colors.textPrimary,
  },
  menuLineShort: {
    width: 10,
    alignSelf: 'flex-start',
    marginLeft: 3,
  },
  iconOnlyBackButton: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
    backgroundColor: 'rgba(18, 38, 64, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(80, 130, 200, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  bottomBarBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(213, 231, 255, 0.10)',
  },
  transitionOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transitionCard: {
    minWidth: 180,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 229, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 10,
    overflow: 'hidden',
  },
  transitionText: {
    color: '#f6f1e3',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
