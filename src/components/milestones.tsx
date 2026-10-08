import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { EarnedMilestone } from '@/data/milestones';
import { dateFromKey } from '@/data/storage';
import { useTheme } from '@/hooks/use-theme';

function short(date: string) {
  return dateFromKey(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** One badge face: lit when earned, outlined when not */
export function Badge({ m, size = 56 }: { m: EarnedMilestone; size?: number }) {
  const theme = useTheme();
  const on = !!m.earnedOn;
  return (
    <View
      style={[
        styles.badge,
        { width: size, height: size, borderRadius: size / 2 },
        on ? { backgroundColor: theme.accent, borderColor: theme.accent } : { backgroundColor: 'transparent', borderColor: theme.border },
      ]}>
      <ThemedText style={[styles.glyph, { fontSize: size * 0.34, color: on ? theme.accentText : theme.textSecondary }]}>{m.glyph}</ThemedText>
    </View>
  );
}

/** Grid of every milestone for the Progress tab */
export function MilestoneGrid({ milestones }: { milestones: EarnedMilestone[] }) {
  const theme = useTheme();
  const earned = milestones.filter((m) => m.earnedOn).length;
  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText type="small" themeColor="textSecondary">
        {earned} of {milestones.length} earned. Nothing here is ever taken away.
      </ThemedText>
      <View style={styles.grid}>
        {milestones.map((m) => (
          <View key={m.id} style={styles.cell} accessibilityLabel={`${m.title}: ${m.earnedOn ? `earned ${short(m.earnedOn)}` : m.how}`}>
            <Badge m={m} />
            <ThemedText type="smallBold" style={styles.cellTitle} numberOfLines={2}>
              {m.title}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.cellSub} numberOfLines={3}>
              {m.earnedOn ? short(m.earnedOn) : m.how}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

/** The card shown on Today the first time a milestone is earned */
export function NewMilestoneCard({ milestones, onDismiss }: { milestones: EarnedMilestone[]; onDismiss: () => void }) {
  const theme = useTheme();
  if (milestones.length === 0) return null;
  const m = milestones[0];
  return (
    <View style={[styles.newCard, { backgroundColor: theme.backgroundElement, borderColor: theme.accent }]}>
      <Badge m={m} size={64} />
      <View style={styles.newText}>
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.eyebrow}>
          MILESTONE{milestones.length > 1 ? `S · +${milestones.length - 1} more` : ''}
        </ThemedText>
        <ThemedText style={styles.newTitle}>{m.title}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {m.how}
        </ThemedText>
        <Pressable onPress={onDismiss} hitSlop={8} accessibilityRole="button" style={styles.dismiss}>
          <ThemedText type="smallBold" style={{ color: theme.accent }}>
            Nice. Onward
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  glyph: { fontWeight: 800 },
  card: { borderRadius: 16, padding: Spacing.three, marginTop: Spacing.three, gap: Spacing.three },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: Spacing.three },
  cell: { width: '33.33%', alignItems: 'center', paddingHorizontal: Spacing.one, gap: Spacing.half },
  cellTitle: { textAlign: 'center', marginTop: Spacing.half },
  cellSub: { textAlign: 'center', fontSize: 12, lineHeight: 16 },
  newCard: { borderRadius: 16, borderWidth: 1.5, padding: Spacing.three, marginTop: Spacing.three, flexDirection: 'row', gap: Spacing.three, alignItems: 'center' },
  newText: { flex: 1, gap: 2 },
  eyebrow: { letterSpacing: 1 },
  newTitle: { fontSize: 22, lineHeight: 28, fontWeight: 700 },
  dismiss: { marginTop: Spacing.one, minHeight: 32, justifyContent: 'center' },
});
