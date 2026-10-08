import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useOnward } from '@/hooks/use-onward';
import { useTheme } from '@/hooks/use-theme';

/** "Not today?" shows what skipping does, with no guilt attached */
export function SkipPreview() {
  const theme = useTheme();
  const onward = useOnward();
  const [open, setOpen] = useState(false);
  const p = onward.skipPreview();

  if (!open) {
    return (
      <Pressable onPress={() => setOpen(true)} hitSlop={8} accessibilityRole="button" style={styles.link}>
        <ThemedText type="small" themeColor="textSecondary">
          Not today? <ThemedText type="small" style={{ color: theme.accent }}>See what that means</ThemedText>
        </ThemedText>
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText type="smallBold">If you skip today</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Nothing resets. Tomorrow is Day {p.tomorrowDay}, {p.tomorrow.title}, as planned. This week stays at {p.weekDone} of {p.weekTraining} sessions so far, and
        the short version is always there if a crowded day is the problem.
      </ThemedText>
      <Pressable onPress={() => setOpen(false)} hitSlop={8} accessibilityRole="button" style={styles.close}>
        <ThemedText type="smallBold" style={{ color: theme.accent }}>
          Got it
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  link: { alignSelf: 'center', minHeight: 40, justifyContent: 'center', marginTop: Spacing.one },
  card: { borderRadius: 16, padding: Spacing.three, marginTop: Spacing.two, gap: Spacing.one },
  close: { alignSelf: 'flex-start', minHeight: 32, justifyContent: 'center', marginTop: Spacing.one },
});
