import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useOnward } from '@/hooks/use-onward';
import { useTheme } from '@/hooks/use-theme';

export const FEEL_LABELS = ['', 'Wiped', 'Low', 'Okay', 'Good', 'Great'];

/** "How did today feel?" 1–5 plus a free note. Saves as you go. */
export function CheckIn({ date }: { date: string }) {
  const theme = useTheme();
  const onward = useOnward();
  const checkin = onward.checkinFor(date);

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText>How did today feel?</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Energy, soreness, mood, all of it. One tap.
      </ThemedText>
      <View style={styles.scale}>
        {[1, 2, 3, 4, 5].map((n) => {
          const on = checkin.feel === n;
          return (
            <Pressable
              key={n}
              onPress={() => onward.setFeel(date, on ? null : n)}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${n}, ${FEEL_LABELS[n]}`}
              style={({ pressed }) => [
                styles.option,
                { borderColor: on ? theme.accent : theme.border, backgroundColor: on ? theme.accent : theme.background },
                pressed && { opacity: 0.6 },
              ]}>
              <ThemedText style={[styles.optionNumber, { color: on ? theme.accentText : theme.text }]}>{n}</ThemedText>
              <ThemedText type="small" style={{ color: on ? theme.accentText : theme.textSecondary }}>
                {FEEL_LABELS[n]}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
      <TextInput
        value={checkin.note ?? ''}
        onChangeText={(t) => onward.setNote(date, t)}
        placeholder="Notes: what went well, what to change next time…"
        placeholderTextColor={theme.textSecondary}
        multiline
        style={[styles.note, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
        accessibilityLabel="Notes for the day"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: Spacing.three, marginTop: Spacing.three, gap: Spacing.two },
  scale: { flexDirection: 'row', gap: Spacing.one, marginTop: Spacing.one, flexWrap: 'wrap' },
  option: { flex: 1, minWidth: 50, minHeight: 56, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', gap: 2, paddingHorizontal: 2 },
  optionNumber: { fontSize: 18, fontWeight: 700 },
  note: { borderWidth: 1, borderRadius: 12, padding: Spacing.two, minHeight: 72, fontSize: 16, lineHeight: 22, textAlignVertical: 'top', marginTop: Spacing.one },
});
