import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { GameCard } from '../components/GameCard';
import type { GameDefinition, GameId, GameProgressMap } from '../../../types/game';
import { theme } from '../../../theme/appTheme';

type HomeScreenProps = {
  games: GameDefinition[];
  gameProgress: GameProgressMap;
  isUnlocked: (gameId: GameId) => boolean;
  topBarHeight: number;
  bottomBarHeight: number;
  onOpenGame: (gameId: GameId) => void;
  onUnlockGame: (gameId: GameId) => void;
};

export function HomeScreen({
  games,
  gameProgress,
  isUnlocked,
  topBarHeight,
  bottomBarHeight,
  onOpenGame,
  onUnlockGame,
}: HomeScreenProps) {
  const cardAnims = useRef(games.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(
      70,
      cardAnims.map((anim) =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 7,
          tension: 55,
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, [cardAnims]);

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingTop: topBarHeight + 16, paddingBottom: bottomBarHeight + 16 },
      ]}
    >
      <Text style={styles.screenTitle}>Mini Games</Text>
      <Text style={styles.screenSubtitle}>
        Sharpen your ear — one quick round at a time.
      </Text>

      <View style={styles.grid}>
        {games.map((game, i) => (
          <Animated.View
            key={game.id}
            style={{
              width: '48%',
              opacity: cardAnims[i],
              transform: [
                {
                  translateY: cardAnims[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [28, 0],
                  }),
                },
              ],
            }}
          >
            <GameCard
              game={game}
              progress={gameProgress[game.id]}
              unlocked={isUnlocked(game.id)}
              onOpen={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onOpenGame(game.id);
              }}
              onUnlock={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onUnlockGame(game.id);
              }}
            />
          </Animated.View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 18,
  },
  screenTitle: {
    color: theme.colors.textPrimary,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  screenSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },
});
