import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

import type { GameDefinition, Instrument } from '../../../types/game';
import { ALL_INSTRUMENTS } from '../../../types/game';

type InstrumentSelectScreenProps = {
  game: GameDefinition;
  selectedInstrument: Instrument;
  topBarHeight: number;
  bottomBarHeight: number;
  onSelect: (instrument: Instrument) => void;
  onBack: () => void;
};

const INSTRUMENT_META: Record<Instrument, { icon: string; description: string }> = {
  piano: { icon: '🎹', description: 'Classic piano tone' },
  guitar: { icon: '🎸', description: 'Acoustic guitar' },
  synth: { icon: '🎛️', description: 'Electronic synth' },
};

export function InstrumentSelectScreen({
  game,
  selectedInstrument,
  topBarHeight,
  bottomBarHeight,
  onSelect,
  onBack,
}: InstrumentSelectScreenProps) {
  const staggerAnims = useRef(
    ALL_INSTRUMENTS.map(() => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    Animated.stagger(
      80,
      staggerAnims.map((anim) =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 7,
          tension: 60,
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, [staggerAnims]);

  return (
    <View style={[styles.screen, { paddingTop: topBarHeight + 16, paddingBottom: bottomBarHeight + 16 }]}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onBack();
        }}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Text style={styles.backArrow}>←</Text>
        <Text style={styles.backLabel}>Back</Text>
      </Pressable>

      <Text style={styles.eyebrow}>{game.title}</Text>
      <Text style={styles.heading}>Choose an{'\n'}instrument</Text>
      <Text style={styles.caption}>
        Affects which audio samples play during the game.
      </Text>

      <View style={styles.list}>
        {ALL_INSTRUMENTS.map((instrument, i) => {
          const meta = INSTRUMENT_META[instrument];
          const active = instrument === selectedInstrument;

          return (
            <Animated.View
              key={instrument}
              style={{
                opacity: staggerAnims[i],
                transform: [
                  {
                    translateY: staggerAnims[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [24, 0],
                    }),
                  },
                ],
              }}
            >
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onSelect(instrument);
                }}
                style={({ pressed }) => [
                  styles.instrumentRow,
                  active && { borderColor: game.accent, backgroundColor: '#0d1e33' },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.instrumentIcon}>{meta.icon}</Text>
                <View style={styles.instrumentTextBlock}>
                  <Text style={[styles.instrumentName, active && { color: game.accent }]}>
                    {instrument.charAt(0).toUpperCase() + instrument.slice(1)}
                  </Text>
                  <Text style={styles.instrumentDesc}>{meta.description}</Text>
                </View>
                {active ? (
                  <View style={[styles.activeDot, { backgroundColor: game.accent }]} />
                ) : null}
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onSelect(selectedInstrument);
        }}
        style={({ pressed }) => [
          styles.confirmButton,
          { backgroundColor: game.accent },
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.confirmText}>
          Play with {selectedInstrument.charAt(0).toUpperCase() + selectedInstrument.slice(1)}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#10233d',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 28,
  },
  backArrow: {
    color: '#f7f4ea',
    fontSize: 18,
    fontWeight: '700',
  },
  backLabel: {
    color: '#f7f4ea',
    fontSize: 15,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.975 }],
  },
  eyebrow: {
    color: '#f1c75b',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  heading: {
    color: '#f8f4ea',
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 40,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  caption: {
    color: '#7ea4c4',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 28,
  },
  list: {
    gap: 10,
    flex: 1,
  },
  instrumentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10233d',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#1e3d61',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 14,
  },
  instrumentIcon: {
    fontSize: 28,
    width: 36,
    textAlign: 'center',
  },
  instrumentTextBlock: {
    flex: 1,
  },
  instrumentName: {
    color: '#f8f4ea',
    fontSize: 17,
    fontWeight: '900',
  },
  instrumentDesc: {
    color: '#5e84a4',
    fontSize: 13,
    marginTop: 2,
    fontWeight: '600',
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  confirmButton: {
    marginTop: 20,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmText: {
    color: '#132238',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
});
