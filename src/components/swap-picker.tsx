import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { Exercise } from '@/data/program';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  exercise: Exercise | null;
  onPick: (movementId: string) => void;
  onClose: () => void;
};

/** Bottom sheet listing the other movements that fit an exercise slot */
export function SwapPicker({ exercise, onPick, onClose }: Props) {
  const theme = useTheme();

  return (
    <Modal visible={!!exercise} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
      <View style={[styles.sheet, { backgroundColor: theme.background }]}>
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.eyebrow}>
          SWAP
        </ThemedText>
        <ThemedText style={styles.title}>{exercise?.movement.name}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Pick a different movement for this slot. Your choice sticks until you change it.
        </ThemedText>

        <View style={[styles.list, { backgroundColor: theme.backgroundElement }]}>
          {exercise?.alternatives.map((m, i) => (
            <Pressable
              key={m.id}
              onPress={() => onPick(m.id)}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.row,
                i > 0 && { borderTopColor: theme.border, borderTopWidth: StyleSheet.hairlineWidth },
                pressed && { opacity: 0.6 },
              ]}>
              <ThemedText>{m.name}</ThemedText>
              {m.cue && (
                <ThemedText type="small" themeColor="textSecondary">
                  {m.cue}
                </ThemedText>
              )}
            </Pressable>
          ))}
        </View>

        <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" style={styles.cancel}>
          <ThemedText themeColor="textSecondary">Keep {exercise?.movement.name}</ThemedText>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.two,
  },
  eyebrow: { letterSpacing: 1 },
  title: { fontSize: 24, lineHeight: 30, fontWeight: 700 },
  list: { borderRadius: 16, paddingHorizontal: Spacing.three, marginTop: Spacing.two },
  row: { minHeight: 56, justifyContent: 'center', paddingVertical: Spacing.two },
  cancel: { alignSelf: 'center', marginTop: Spacing.three, minHeight: 44, justifyContent: 'center' },
});
