import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { PHASES } from '@/data/program';
import { useOnward } from '@/hooks/use-onward';
import { useTheme } from '@/hooks/use-theme';

/**
 * Shown for the first three days of a new phase (and after Day 75): what the
 * phase you just finished added up to.
 */
export function PhaseRecap({ day }: { day: number }) {
  const theme = useTheme();
  const onward = useOnward();
  const finished = PHASES.findIndex((p) => day >= p.lastDay + 1 && day <= p.lastDay + 3);
  if (finished === -1) return null;
  const phase = PHASES[finished];
  const next = PHASES[finished + 1];
  const r = onward.phaseRecap(finished);

  return (
    <View style={[styles.card, { backgroundColor: theme.accent }]}>
      <ThemedText type="smallBold" style={[styles.eyebrow, { color: theme.accentText }]}>
        {phase.name.toUpperCase()} COMPLETE
      </ThemedText>
      <View style={styles.stats}>
        <Stat value={`${r.sessionsDone}/${r.trainingDays}`} label="sessions" color={theme.accentText} />
        <Stat value={`${r.liftsUp}`} label={r.liftsUp === 1 ? 'lift up' : 'lifts up'} color={theme.accentText} />
        <Stat value={r.weightChange === null ? '–' : r.weightChange > 0 ? `+${r.weightChange}` : `${r.weightChange}`} label="lb" color={theme.accentText} />
      </View>
      <ThemedText type="small" style={{ color: theme.accentText }}>
        {next ? `${next.name} is under way: ${next.focus}` : 'That’s the full 75 days. Whatever comes next, you’ve already built the hard part.'}
      </ThemedText>
    </View>
  );
}

function Stat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={styles.stat}>
      <ThemedText style={[styles.value, { color }]}>{value}</ThemedText>
      <ThemedText type="small" style={{ color, opacity: 0.85 }}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: Spacing.three, marginTop: Spacing.three, gap: Spacing.two },
  eyebrow: { letterSpacing: 1 },
  stats: { flexDirection: 'row', gap: Spacing.four },
  stat: { gap: 2 },
  value: { fontSize: 24, lineHeight: 28, fontWeight: 800 },
});
