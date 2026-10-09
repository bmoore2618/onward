import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { DEFAULT_PROGRESS_LAYOUT, type AppState, type ProgressSectionId } from '@/data/storage';
import { useOnward } from '@/hooks/use-onward';
import { useTheme } from '@/hooks/use-theme';

export const SECTION_TITLES: Record<ProgressSectionId, string> = {
  stats: 'Overview',
  milestones: 'Milestones',
  weight: 'Body weight',
  lifts: 'Strength since Day 1',
  photos: 'Progress photos',
  habits: 'Daily habits',
  calendar: 'Calendar',
};

/** "Rearrange" sheet for the Progress tab: move sections up/down, show or hide */
export function LayoutEditor() {
  const theme = useTheme();
  const onward = useOnward();
  const [open, setOpen] = useState(false);
  const layout = onward.progressLayout;

  const move = (index: number, dir: -1 | 1) => {
    const next: AppState['progressLayout'] = [...layout];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    onward.setProgressLayout(next);
  };
  const toggle = (index: number) => {
    const next = layout.map((s, i) => (i === index ? { ...s, hidden: !s.hidden } : s));
    onward.setProgressLayout(next);
  };

  return (
    <>
      <Pressable onPress={() => setOpen(true)} hitSlop={8} accessibilityRole="button" style={styles.link}>
        <ThemedText type="small" style={{ color: theme.accent }}>
          Rearrange
        </ThemedText>
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Close" />
        <View style={[styles.sheet, { backgroundColor: theme.background }]} accessibilityViewIsModal>
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.eyebrow}>
            PROGRESS TAB
          </ThemedText>
          <ThemedText style={styles.title}>Rearrange sections</ThemedText>
          <View style={[styles.list, { backgroundColor: theme.backgroundElement }]}>
            {layout.map((s, i) => (
              <View key={s.id} style={[styles.row, i > 0 && { borderTopColor: theme.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
                <ThemedText style={[styles.name, s.hidden && { color: theme.textSecondary }]}>{SECTION_TITLES[s.id]}</ThemedText>
                <Pressable onPress={() => move(i, -1)} disabled={i === 0} hitSlop={6} accessibilityRole="button" accessibilityLabel={`Move ${SECTION_TITLES[s.id]} up`} accessibilityState={{ disabled: i === 0 }} style={[styles.arrow, i === 0 && { opacity: 0.3 }]}>
                  <ThemedText style={styles.arrowText}>↑</ThemedText>
                </Pressable>
                <Pressable onPress={() => move(i, 1)} disabled={i === layout.length - 1} hitSlop={6} accessibilityRole="button" accessibilityLabel={`Move ${SECTION_TITLES[s.id]} down`} accessibilityState={{ disabled: i === layout.length - 1 }} style={[styles.arrow, i === layout.length - 1 && { opacity: 0.3 }]}>
                  <ThemedText style={styles.arrowText}>↓</ThemedText>
                </Pressable>
                <Switch value={!s.hidden} onValueChange={() => toggle(i)} trackColor={{ true: theme.accent }} accessibilityLabel={`Show ${SECTION_TITLES[s.id]}`} />
              </View>
            ))}
          </View>
          <View style={styles.actions}>
            <Pressable onPress={() => onward.setProgressLayout(DEFAULT_PROGRESS_LAYOUT)} hitSlop={8} accessibilityRole="button" style={styles.textButton}>
              <ThemedText type="small" themeColor="textSecondary">
                Reset to default
              </ThemedText>
            </Pressable>
            <Pressable onPress={() => setOpen(false)} accessibilityRole="button" style={({ pressed }) => [styles.done, { backgroundColor: theme.accent }, pressed && { opacity: 0.8 }]}>
              <ThemedText type="smallBold" style={{ color: theme.accentText }}>
                Done
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  link: { minHeight: 40, justifyContent: 'center' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.two },
  eyebrow: { letterSpacing: 1 },
  title: { fontSize: 24, lineHeight: 30, fontWeight: 700 },
  list: { borderRadius: 16, paddingHorizontal: Spacing.three, marginTop: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, minHeight: 56 },
  name: { flex: 1 },
  arrow: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  arrowText: { fontSize: 20, fontWeight: 700 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.three },
  textButton: { minHeight: 44, justifyContent: 'center' },
  done: { minHeight: 44, borderRadius: 12, paddingHorizontal: Spacing.four, justifyContent: 'center' },
});
