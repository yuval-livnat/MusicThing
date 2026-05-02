import { Pressable, StyleSheet, View } from 'react-native';

type MenuButtonProps = {
  onPress: () => void;
};

export function MenuButton({ onPress }: MenuButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
    >
      <View style={styles.line} />
      <View style={styles.line} />
      <View style={styles.line} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: '#11233d',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#1d3655',
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  line: {
    width: 22,
    height: 2.5,
    borderRadius: 999,
    backgroundColor: '#f6f2e8',
  },
});