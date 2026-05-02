import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { GameDefinition, GameProgress } from '../../../types/game';
import { theme } from '../../../theme/appTheme';

type GameCardProps = {
  game: GameDefinition;
  progress: GameProgress;
  unlocked: boolean;
  onOpen: () => void;
  onUnlock: () => void;
};

export function GameCard({ game, progress, unlocked, onOpen, onUnlock }: GameCardProps) {
  const selectedCompletion = progress.completion[progress.selectedMode];

  return (
    <Pressable
      onPress={() => {
        if (unlocked) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onOpen();
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onUnlock();
        }
      }}
      style={({ pressed }) => [
        styles.card,
        { borderColor: unlocked ? game.accent : '#2a3d52' },
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.cardTopRow}>
        <Text style={styles.gameTitle}>{game.title}</Text>
        {unlocked ? (
          <View style={[styles.progressBadge, { backgroundColor: game.accent }]}>
            <Text style={styles.progressBadgeText}>{selectedCompletion}%</Text>
          </View>
        ) : null}
      </View>

      {unlocked ? (
        <>
          <Text style={styles.modeText}>Mode: {progress.selectedMode}</Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${selectedCompletion}%`, backgroundColor: game.accent },
              ]}
            />
          </View>
          <Text style={styles.description}>{game.description}</Text>
          <Text style={styles.statusText}>Tap to play</Text>
        </>
      ) : (
        <>
          <Text style={styles.description}>{game.description}</Text>
          <BlurView intensity={36} tint="dark" style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={24} color={theme.colors.textPrimary} />
            <Text style={styles.lockCost}>{game.unlockCost} pts</Text>
            <Text style={styles.lockHint}>Tap to unlock</Text>
          </BlurView>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 200,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surfaceAlt,
    padding: 16,
    borderWidth: 1.5,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  gameTitle: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '900',
    flex: 1,
    lineHeight: 20,
  },
  progressBadge: {
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginLeft: 6,
  },
  progressBadgeText: {
    color: theme.colors.textDark,
    fontSize: 11,
    fontWeight: '900',
  },
  modeText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
    marginBottom: 8,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: '#162a42',
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  description: {
    color: '#7090b0',
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  statusText: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 22,
  },
  lockCost: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
  },
  lockHint: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
});
