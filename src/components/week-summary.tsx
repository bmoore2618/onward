import { StyleSheet, View } from 'react-native';

import { FEEL_LABELS } from '@/components/check-in';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { dateFromKey } from '@/data/storage';
import { useOnward } from '@/hooks/use-onward';
import { useTheme } from '@/hooks/use-theme';

function short(date: string) {
  return dateFromKey(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** The week's numbers, shown on rest days, with a light look back at last week */
export function WeekSummary({ date }: { date: string }) {
  const theme = useTheme();
  const onward = useOnward();
  const s = onward.weekSummary(date);
  const habitPct = s.habitsTotal ? Math.round((s.habitsDone / s.habitsTotal) * 100) : 0;

  const line =
    s.workoutsDone === s.trainingDays && s.trainingDays > 0
      ? 'Every session done. That’s the whole game.'
      : s.workoutsDone >= s.trainingDays - 1 && s.trainingDays > 0
        ? 'Nearly all of it. Life happened, the plan kept going.'
        : s.workoutsDone > 0
          ? 'Some weeks are like this. Next week starts fresh on Monday.'
          : 'A quiet week. Monday is a clean start, no catching up needed.';

  const review = s.previous
    ? s.workoutsDone > s.previous.workoutsDone
      ? `Up from ${s.previous.workoutsDone} workouts last week.`
      : s.workoutsDone < s.previous.workoutsDone
        ? `Last week was ${s.previous.workoutsDone}. If this week was crowded, the short sessions are there for that.`
        : `Same as last week. Steady is the goal.`
    : null;

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.eyebrow}>
        WEEK {s.week} · {short(s.start)} – {short(s.end)}
      </ThemedText>
      <View style={styles.stats}>
        <Stat value={`${s.workoutsDone}/${s.trainingDays}`} label="workouts" />
        <Stat value={`${habitPct}%`} label="habits" />
        <Stat value={s.weightChange === null ? '–' : s.weightChange > 0 ? `+${s.weightChange}` : `${s.weightChange}`} label="lb this week" />
        <Stat value={s.avgFeel === null ? '–' : `${s.avgFeel}`} label={s.avgFeel === null ? 'feel' : FEEL_LABELS[Math.round(s.avgFeel)].toLowerCase()} />
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {line}
        {review ? ` ${review}` : ''}
      </ThemedText>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: Spacing.three, marginTop: Spacing.three, gap: Spacing.two },
  eyebrow: { letterSpacing: 1 },
  stats: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { flex: 1, gap: 2 },
  statValue: { fontSize: 22, lineHeight: 28, fontWeight: 700 },
});
