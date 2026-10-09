import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { dateFromKey, type StatusKind } from '@/data/storage';
import { useOnward } from '@/hooks/use-onward';
import { useTheme } from '@/hooks/use-theme';

const OPTIONS: { kind: StatusKind; label: string; hint: string }[] = [
  { kind: 'away', label: 'Away', hint: 'Travel, work, family. Reminders pause until you’re back.' },
  { kind: 'sick', label: 'Sick', hint: 'Rest is the plan. No sessions, no reminders.' },
  { kind: 'injured', label: 'Injured', hint: 'No sessions until you’re ready. The first one back is lighter on purpose.' },
];

const LABELS: Record<StatusKind, string> = { away: 'Away', sick: 'Sick', injured: 'Injured' };

/**
 * "Not training for a while?" Lets the user say so before the gap, which
 * pauses reminders and marks the days as intentional instead of missed.
 */
export function StatusSwitch() {
  const theme = useTheme();
  const onward = useOnward();
  const [open, setOpen] = useState(false);
  const status = onward.status;

  if (status) {
    const since = dateFromKey(status.since).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return (
      <View style={[styles.activeCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
        <View style={styles.activeText}>
          <ThemedText type="smallBold">{LABELS[status.kind]} since {since}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Reminders are paused. These days are marked as a break, not misses.
          </ThemedText>
        </View>
        <Pressable onPress={() => onward.setStatus(null)} accessibilityRole="button" style={({ pressed }) => [styles.backButton, { backgroundColor: theme.accent }, pressed && { opacity: 0.8 }]}>
          <ThemedText type="smallBold" style={{ color: theme.accentText }}>
            I’m back
          </ThemedText>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <Pressable onPress={() => setOpen(true)} hitSlop={8} accessibilityRole="button" style={styles.link}>
        <ThemedText type="small" themeColor="textSecondary">
          Not training for a while? <ThemedText type="small" style={{ color: theme.accent }}>Set a status</ThemedText>
        </ThemedText>
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Close" />
        <View style={[styles.sheet, { backgroundColor: theme.background }]} accessibilityViewIsModal>
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.eyebrow}>
            STATUS
          </ThemedText>
          <ThemedText style={styles.title}>Taking a break?</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Say so and the app stops nudging. The program doesn’t restart; you come back to whatever day it is.
          </ThemedText>
          <View style={[styles.list, { backgroundColor: theme.backgroundElement }]}>
            {OPTIONS.map((o, i) => (
              <Pressable
                key={o.kind}
                onPress={() => {
                  onward.setStatus(o.kind);
                  setOpen(false);
                }}
                accessibilityRole="button"
                accessibilityLabel={`${o.label}. ${o.hint}`}
                style={({ pressed }) => [styles.row, i > 0 && { borderTopColor: theme.border, borderTopWidth: StyleSheet.hairlineWidth }, pressed && { opacity: 0.6 }]}>
                <ThemedText>{o.label}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {o.hint}
                </ThemedText>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={() => setOpen(false)} hitSlop={12} accessibilityRole="button" style={styles.cancel}>
            <ThemedText themeColor="textSecondary">Never mind</ThemedText>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  link: { alignSelf: 'center', minHeight: 40, justifyContent: 'center', marginTop: Spacing.two },
  activeCard: { borderRadius: 16, borderWidth: 1, padding: Spacing.three, marginTop: Spacing.three, flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  activeText: { flex: 1, gap: 2 },
  backButton: { minHeight: 44, borderRadius: 12, paddingHorizontal: Spacing.three, justifyContent: 'center' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.two },
  eyebrow: { letterSpacing: 1 },
  title: { fontSize: 24, lineHeight: 30, fontWeight: 700 },
  list: { borderRadius: 16, paddingHorizontal: Spacing.three, marginTop: Spacing.two },
  row: { minHeight: 56, justifyContent: 'center', paddingVertical: Spacing.two, gap: 2 },
  cancel: { alignSelf: 'center', marginTop: Spacing.three, minHeight: 44, justifyContent: 'center' },
});
