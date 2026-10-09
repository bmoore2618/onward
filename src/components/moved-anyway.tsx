import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { MovedKind } from '@/data/storage';
import { useOnward } from '@/hooks/use-onward';
import { useTheme } from '@/hooks/use-theme';

const KINDS: { id: MovedKind; label: string }[] = [
  { id: 'walk', label: 'Walk' },
  { id: 'bike', label: 'Bike' },
  { id: 'run', label: 'Run' },
  { id: 'swim', label: 'Swim' },
  { id: 'other', label: 'Other' },
];

export const MOVED_LABELS: Record<MovedKind, string> = { walk: 'a walk', bike: 'a bike ride', run: 'a run', swim: 'a swim', other: 'some movement' };

/**
 * "Moved anyway": on a training day when the session didn't happen, log the
 * walk or ride you did instead. It doesn't count as the workout, but the day
 * shows as movement rather than a miss.
 */
export function MovedAnyway({ date }: { date: string }) {
  const theme = useTheme();
  const onward = useOnward();
  const moved = onward.viewDay(date).record?.movedAnyway;

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText>Skipped the session but moved anyway?</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Log it. It won’t count as the workout, but it’s not nothing, and the calendar will say so.
      </ThemedText>
      <View style={styles.chips}>
        {KINDS.map((k) => {
          const on = moved?.kind === k.id;
          return (
            <Pressable
              key={k.id}
              onPress={() => onward.setMovedAnyway(date, on ? null : { kind: k.id, minutes: moved?.minutes })}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              style={[styles.chip, { backgroundColor: on ? theme.accent : theme.backgroundSelected }]}>
              <ThemedText type="smallBold" style={{ color: on ? theme.accentText : theme.textSecondary }}>
                {k.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
      {moved && (
        <View style={styles.minutesRow}>
          <ThemedText type="small" themeColor="textSecondary">
            How long?
          </ThemedText>
          <View style={[styles.box, { borderColor: theme.border, backgroundColor: theme.background }]}>
            <TextInput
              value={moved.minutes ? String(moved.minutes) : ''}
              onChangeText={(t) => onward.setMovedAnyway(date, { kind: moved.kind, minutes: parseInt(t.replace(/[^0-9]/g, ''), 10) || undefined })}
              placeholder="–"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
              returnKeyType="done"
              maxLength={3}
              style={[styles.input, { color: theme.text }]}
              accessibilityLabel="Minutes of movement"
            />
            <ThemedText type="small" themeColor="textSecondary">
              min
            </ThemedText>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: Spacing.three, marginTop: Spacing.three, gap: Spacing.two },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.one },
  chip: { borderRadius: 999, paddingHorizontal: Spacing.three, minHeight: 40, justifyContent: 'center' },
  minutesRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginTop: Spacing.one },
  box: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, borderWidth: 1, borderRadius: 10, paddingHorizontal: Spacing.two, height: 44 },
  input: { width: 48, fontSize: 18, fontWeight: 600, textAlign: 'right' },
});
