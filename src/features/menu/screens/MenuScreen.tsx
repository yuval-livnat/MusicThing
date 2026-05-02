import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../theme/appTheme';

type MenuScreenProps = {
  totalPoints: number;
  dayStreak: number;
  topBarHeight: number;
  bottomBarHeight: number;
  onBack: () => void;
  onWipeProgress: () => void;
};

const MENU_ITEMS = [
  { label: 'Profile', meta: 'Soon', icon: 'person-outline' },
  { label: 'Settings', meta: 'Soon', icon: 'settings-outline' },
  { label: 'Store', meta: 'Soon', icon: 'musical-notes-outline' },
  { label: 'Achievements', meta: 'Soon', icon: 'trophy-outline' },
] as const;

export function MenuScreen({
  totalPoints,
  dayStreak,
  topBarHeight,
  bottomBarHeight,
  onBack: _onBack,
  onWipeProgress,
}: MenuScreenProps) {
  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingTop: topBarHeight + 16, paddingBottom: bottomBarHeight + 16 },
      ]}
    >
      <Text style={styles.heading}>Menu</Text>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{totalPoints}</Text>
          <Text style={styles.statLabel}>points</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{dayStreak}</Text>
          <Text style={styles.statLabel}>day streak</Text>
        </View>
      </View>

      <View style={styles.section}>
        {MENU_ITEMS.map((item) => (
          <Pressable
            key={item.label}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
          >
            <Ionicons name={item.icon} size={20} color={theme.colors.textSecondary} style={styles.menuIcon} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuMeta}>{item.meta}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          onWipeProgress();
        }}
        style={({ pressed }) => [styles.wipeButton, pressed && styles.pressed]}
      >
        <Text style={styles.wipeText}>Wipe all progress</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.975 }],
  },
  heading: {
    color: theme.colors.textPrimary,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  statBox: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  statValue: {
    color: theme.colors.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 4,
  },
  section: {
    gap: 8,
    marginBottom: 28,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  menuIcon: {
    width: 28,
    textAlign: 'center',
  },
  menuLabel: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  menuMeta: {
    color: '#4d7ea8',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  wipeButton: {
    backgroundColor: theme.colors.dangerBg,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.dangerBorder,
  },
  wipeText: {
    color: '#ff8356',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
});
