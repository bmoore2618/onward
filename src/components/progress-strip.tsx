import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { dailyLine } from '@/data/lines';
import { PROGRAM_LENGTH_DAYS, type SessionKind } from '@/data/program';
import { useOnward } from '@/hooks/use-onward';
import { useTheme } from '@/hooks/use-theme';

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** The "home" strip at the top of Today: where you are, this week, and one line */
export function ProgressStrip({ day, kind }: { day: number; kind: SessionKind }) {
  const theme = useTheme();
  const onward = useOnward();
  const s = onward.progressStrip();
  const weeks = Math.ceil(PROGRAM_LENGTH_DAYS / 7);

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <View style={styles.row}>
        <View style={styles.stat}>
          <ThemedText style={styles.big}>{s.daysCompleted}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            days done
          </ThemedText>
        </View>
        <View style={styles.stat}>
          <ThemedText style={styles.big}>{s.week}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            of {weeks} weeks
          </ThemedText>
        </View>
        <View style={styles.stat}>
          <ThemedText style={styles.big}>{s.fullWeeks}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            full {s.fullWeeks === 1 ? 'week' : 'weeks'}
            {s.bestRun > 1 ? ` · run ${s.currentRun}` : ''}
          </ThemedText>
        </View>
        <View style={styles.dots} accessibilityLabel="This week">
          {s.weekDots.map((d, i) => (
            <View key={i} style={styles.dotCol}>
              <View
                style={[
                  styles.dot,
                  d === 'done' && { backgroundColor: theme.accent, borderColor: theme.accent },
                  d === 'today' && { borderColor: theme.accent, borderWidth: 2 },
                  (d === 'rest' || d === 'paused') && { backgroundColor: theme.backgroundSelected, borderColor: theme.backgroundSelected },
                  (d === 'missed' || d === 'future') && { borderColor: theme.border },
                ]}
              />
              <ThemedText type="small" themeColor="textSecondary" style={styles.dotLabel}>
                {DAY_LETTERS[i]}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>
      <ThemedText type="small" themeColor="textSecondary" style={styles.line}>
        {onward.profile.name ? `${onward.profile.name}, ` : ''}
        {dailyLine(day, kind, s.line)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: Spacing.three, gap: Spacing.two, marginBottom: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  stat: { alignItems: 'flex-start', minWidth: 56 },
  big: { fontSize: 26, lineHeight: 30, fontWeight: 800 },
  dots: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
  dotCol: { alignItems: 'center', gap: 2 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5 },
  dotLabel: { fontSize: 11, lineHeight: 14 },
  line: { fontStyle: 'italic', lineHeight: 20 },
});
