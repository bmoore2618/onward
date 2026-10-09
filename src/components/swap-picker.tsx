import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { Exercise, Movement } from '@/data/program';
import { useTheme } from '@/hooks/use-theme';

export type SwapScope = 'always' | 'phase';

type Props = {
  exercise: Exercise | null;
  /** Name of the current phase, shown in the scope choice */
  phaseName: string;
  /** Ask how long the swap should last (today and future days only) */
  askScope: boolean;
  onPick: (movementId: string, scope: SwapScope) => void;
  onClose: () => void;
};

/** Bottom sheet listing the other movements that fit an exercise slot */
export function SwapPicker({ exercise, phaseName, askScope, onPick, onClose }: Props) {
  const theme = useTheme();
  const [pending, setPending] = useState<Movement | null>(null);

  const close = () => {
    setPending(null);
    onClose();
  };

  return (
    <Modal visible={!!exercise} transparent animationType="slide" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close} accessibilityRole="button" accessibilityLabel="Close" />
      <View style={[styles.sheet, { backgroundColor: theme.background }]} accessibilityViewIsModal>
        {pending ? (
          <>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.eyebrow}>
              SWAP TO {pending.name.toUpperCase()}
            </ThemedText>
            <ThemedText style={styles.title}>For how long?</ThemedText>
            <View style={[styles.list, { backgroundColor: theme.backgroundElement }]}>
              <Pressable
                onPress={() => {
                  onPick(pending.id, 'phase');
                  setPending(null);
                }}
                accessibilityRole="button"
                style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}>
                <ThemedText>Just this phase ({phaseName})</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  The program’s own rotation picks up again next phase.
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => {
                  onPick(pending.id, 'always');
                  setPending(null);
                }}
                accessibilityRole="button"
                style={({ pressed }) => [styles.row, { borderTopColor: theme.border, borderTopWidth: StyleSheet.hairlineWidth }, pressed && { opacity: 0.6 }]}>
                <ThemedText>Always</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Use this movement in this slot for the rest of the program.
                </ThemedText>
              </Pressable>
            </View>
            <Pressable onPress={() => setPending(null)} hitSlop={12} accessibilityRole="button" style={styles.cancel}>
              <ThemedText themeColor="textSecondary">Back</ThemedText>
            </Pressable>
          </>
        ) : (
          <>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.eyebrow}>
              SWAP
            </ThemedText>
            <ThemedText style={styles.title}>{exercise?.movement.name}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Pick a different movement for this slot.
            </ThemedText>

            <View style={[styles.list, { backgroundColor: theme.backgroundElement }]}>
              {exercise?.alternatives.map((m, i) => (
                <Pressable
                  key={m.id}
                  onPress={() => (askScope ? setPending(m) : onPick(m.id, 'always'))}
                  accessibilityRole="button"
                  accessibilityLabel={m.cue ? `${m.name}. ${m.cue}` : m.name}
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

            <Pressable onPress={close} hitSlop={12} accessibilityRole="button" style={styles.cancel}>
              <ThemedText themeColor="textSecondary">Keep {exercise?.movement.name}</ThemedText>
            </Pressable>
          </>
        )}
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
  row: { minHeight: 56, justifyContent: 'center', paddingVertical: Spacing.two, gap: 2 },
  cancel: { alignSelf: 'center', marginTop: Spacing.three, minHeight: 44, justifyContent: 'center' },
});
