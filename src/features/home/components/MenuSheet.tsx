import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type MenuSheetProps = {
  visible: boolean;
  onClose: () => void;
  onWipeProgress: () => void;
};

const MENU_ITEMS = ['Profile', 'Settings', 'Store'] as const;

export function MenuSheet({
  visible,
  onClose,
  onWipeProgress,
}: MenuSheetProps) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <Text style={styles.sheetTitle}>Menu</Text>
          <Text style={styles.sheetSubtitle}>
            Profile, settings, cosmetic store, and dev shortcuts.
          </Text>

          {MENU_ITEMS.map((item) => (
            <View key={item} style={styles.menuItem}>
              <Text style={styles.menuItemText}>{item}</Text>
              <Text style={styles.menuItemMeta}>Soon</Text>
            </View>
          ))}

          <Pressable
            onPress={onWipeProgress}
            style={({ pressed }) => [
              styles.wipeButton,
              pressed && styles.wipeButtonPressed,
            ]}
          >
            <Text style={styles.wipeButtonText}>Wipe progress</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(3, 8, 18, 0.58)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 18,
    paddingRight: 16,
  },
  sheet: {
    width: 250,
    borderRadius: 26,
    backgroundColor: '#10233d',
    padding: 20,
    borderWidth: 1,
    borderColor: '#274563',
    gap: 12,
  },
  sheetTitle: {
    color: '#f8f4ea',
    fontSize: 24,
    fontWeight: '900',
  },
  sheetSubtitle: {
    color: '#a8bad0',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 6,
  },
  menuItem: {
    borderRadius: 18,
    backgroundColor: '#16314f',
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemText: {
    color: '#f8f4ea',
    fontSize: 15,
    fontWeight: '800',
  },
  menuItemMeta: {
    color: '#7cbdf8',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  wipeButton: {
    marginTop: 6,
    borderRadius: 18,
    backgroundColor: '#ff8356',
    paddingVertical: 14,
    alignItems: 'center',
  },
  wipeButtonPressed: {
    opacity: 0.92,
  },
  wipeButtonText: {
    color: '#311300',
    fontSize: 15,
    fontWeight: '900',
  },
});