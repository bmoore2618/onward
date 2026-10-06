import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { WeightChart } from '@/components/weight-chart';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { PROFILE } from '@/data/profile';
import { CHECKLIST, checklistFor, movement, PROGRAM_LENGTH_DAYS } from '@/data/program';
import { addDays, dateFromKey, todayKey, type DayRecord } from '@/data/storage';
import { programDayFor, useOnward } from '@/hooks/use-onward';
import { useTheme } from '@/hooks/use-theme';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

type DayStatus = 'future' | 'off-program' | 'full' | 'partial' | 'rest' | 'missed' | 'today';

export default function ProgressScreen() {
  const theme = useTheme();
  const onward = useOnward();
  const { sessionFor, completed, doneToday } = onward;
  const [selected, setSelected] = useState<string | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);

  const byDate = useMemo(() => {
    const map = new Map<string, DayRecord>();
    for (const r of completed) map.set(r.date, r);
    return map;
  }, [completed]);

  const lastDay = Math.min(onward.currentDay, PROGRAM_LENGTH_DAYS);
  // Days that have happened so far (today counts once it's completed)
  const elapsedDays = Math.max(0, doneToday ? lastDay : lastDay - 1);

  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    const applicable: Record<string, number> = {};
    let trainingDays = 0;
    let workoutsDone = 0;
    for (let day = 1; day <= elapsedDays; day++) {
      const date = addDays(PROFILE.programStartDate, day - 1);
      const session = sessionFor(day);
      const record = byDate.get(date);
      for (const item of checklistFor(session)) {
        applicable[item.id] = (applicable[item.id] ?? 0) + 1;
        if (record?.checklist[item.id]) counts[item.id] = (counts[item.id] ?? 0) + 1;
      }
      if (session.kind !== 'rest') {
        trainingDays++;
        if (record?.checklist.workout) workoutsDone++;
      }
    }
    return {
      daysCompleted: completed.filter((r) => r.day >= 1 && r.day <= PROGRAM_LENGTH_DAYS).length,
      consistency: trainingDays ? Math.round((workoutsDone / trainingDays) * 100) : 0,
      items: CHECKLIST.map((item) => ({
        ...item,
        done: counts[item.id] ?? 0,
        of: applicable[item.id] ?? 0,
      })),
    };
  }, [elapsedDays, byDate, completed, sessionFor]);

  // Calendar month to show
  const base = dateFromKey(onward.today);
  const monthStart = new Date(base.getFullYear(), base.getMonth() + monthOffset, 1);
  const monthKey = todayKey(monthStart);
  const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
  const leadingBlanks = (monthStart.getDay() + 6) % 7; // Monday-first
  // Rows of exactly seven cells; null = blank cell outside this month
  const weeks: (number | null)[][] = [];
  const cells: (number | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7) cells.push(null);
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const statusFor = (date: string): DayStatus => {
    const day = programDayFor(date);
    if (day < 1 || day > PROGRAM_LENGTH_DAYS) return 'off-program';
    if (date === onward.today && !onward.doneToday) return 'today';
    if (date > onward.today) return 'future';
    const session = onward.sessionFor(day);
    const record = byDate.get(date);
    if (!record) return session.kind === 'rest' ? 'rest' : 'missed';
    const needed = checklistFor(session).length;
    const got = Object.values(record.checklist).filter(Boolean).length;
    if (session.kind === 'rest') return 'rest';
    return got >= needed ? 'full' : 'partial';
  };

  const cellColors = (status: DayStatus) => {
    switch (status) {
      case 'full':
        return { bg: theme.accent, fg: theme.accentText };
      case 'partial':
        return { bg: theme.accentSoft, fg: theme.text };
      case 'rest':
        return { bg: theme.backgroundSelected, fg: theme.textSecondary };
      case 'today':
        return { bg: 'transparent', fg: theme.text, border: theme.accent };
      case 'missed':
        return { bg: 'transparent', fg: theme.textSecondary, border: theme.border };
      default:
        return { bg: 'transparent', fg: theme.textSecondary };
    }
  };

  const first = onward.bodyWeight[0];
  const latest = onward.bodyWeight[onward.bodyWeight.length - 1];
  const startWeight = first ? `${first.lb}` : '–';
  const currentWeight = latest ? `${latest.lb}` : '–';
  const change = first && latest ? Math.round((latest.lb - first.lb) * 10) / 10 : null;
  const changeText = change === null ? '–' : change > 0 ? `+${change}` : `${change}`;
  const todayWeight = onward.bodyWeight.find((e) => e.date === onward.today) ? `${onward.bodyWeight.find((e) => e.date === onward.today)!.lb}` : '';

  const selectedDay = selected ? programDayFor(selected) : null;
  const selectedRecord = selected ? byDate.get(selected) : undefined;
  const selectedSession = selectedDay && selectedDay >= 1 && selectedDay <= PROGRAM_LENGTH_DAYS ? onward.sessionFor(selectedDay) : null;

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <ThemedText style={styles.heading}>Progress</ThemedText>

        <View style={styles.statRow}>
          <Stat label="Days completed" value={`${stats.daysCompleted}`} sub={`of ${PROGRAM_LENGTH_DAYS}`} />
          <Stat label="Workout consistency" value={`${stats.consistency}%`} sub="of training days" />
        </View>

        <ThemedText style={styles.sectionTitle}>Body weight</ThemedText>
        <View style={[styles.card, styles.weightCard, { backgroundColor: theme.backgroundElement }]}>
          <View style={styles.weightStats}>
            <WeightStat label="Start" value={startWeight} />
            <WeightStat label="Current" value={currentWeight} />
            <WeightStat label="Change" value={changeText} />
            <View style={styles.weightStat}>
              <ThemedText type="small" themeColor="textSecondary">
                Goal
              </ThemedText>
              <TextInput
                value={onward.goalWeight}
                onChangeText={onward.setGoalWeight}
                placeholder="–"
                placeholderTextColor={theme.textSecondary}
                keyboardType="decimal-pad"
                returnKeyType="done"
                maxLength={5}
                style={[styles.weightStatValue, styles.goalInput, { color: theme.text, borderColor: theme.border }]}
                accessibilityLabel="Goal weight in pounds"
              />
            </View>
          </View>
          <WeightChart points={onward.bodyWeight} goal={parseFloat(onward.goalWeight) || undefined} />
          <View style={[styles.logRow, { borderTopColor: theme.border }]}>
            <ThemedText>Today&apos;s weigh-in</ThemedText>
            <View style={[styles.weightBox, { borderColor: theme.border, backgroundColor: theme.background }]}>
              <TextInput
                value={todayWeight}
                onChangeText={(t) => onward.setBodyWeight(onward.today, t)}
                placeholder="–"
                placeholderTextColor={theme.textSecondary}
                keyboardType="decimal-pad"
                returnKeyType="done"
                maxLength={5}
                style={[styles.weightInput, { color: theme.text }]}
                accessibilityLabel="Today's body weight in pounds"
              />
              <ThemedText type="small" themeColor="textSecondary">
                lb
              </ThemedText>
            </View>
          </View>
        </View>

        <ThemedText style={styles.sectionTitle}>Daily habits</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          {stats.items.map((item, i) => {
            const pct = item.of ? item.done / item.of : 0;
            return (
              <View key={item.id} style={[styles.habitRow, i > 0 && { borderTopColor: theme.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
                <View style={styles.habitHeader}>
                  <ThemedText>{item.label}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {item.done}/{item.of}
                  </ThemedText>
                </View>
                <View style={[styles.bar, { backgroundColor: theme.backgroundSelected }]}>
                  <View style={[styles.barFill, { backgroundColor: theme.accent, width: `${Math.round(pct * 100)}%` }]} />
                </View>
              </View>
            );
          })}
          {elapsedDays === 0 && (
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptyNote}>
              Complete your first day and this fills in.
            </ThemedText>
          )}
        </View>

        <View style={styles.monthHeader}>
          <Pressable onPress={() => setMonthOffset((o) => o - 1)} hitSlop={12} accessibilityRole="button" accessibilityLabel="Previous month">
            <ThemedText style={styles.monthArrow}>‹</ThemedText>
          </Pressable>
          <ThemedText style={styles.sectionTitleInline}>
            {MONTHS[monthStart.getMonth()]} {monthStart.getFullYear()}
          </ThemedText>
          <Pressable onPress={() => setMonthOffset((o) => o + 1)} hitSlop={12} accessibilityRole="button" accessibilityLabel="Next month">
            <ThemedText style={styles.monthArrow}>›</ThemedText>
          </Pressable>
        </View>

        <View style={[styles.card, styles.calendar, { backgroundColor: theme.backgroundElement }]}>
          <View style={styles.weekRow}>
            {WEEKDAYS.map((d, i) => (
              <ThemedText key={i} type="smallBold" themeColor="textSecondary" style={styles.weekday}>
                {d}
              </ThemedText>
            ))}
          </View>
          {weeks.map((week, w) => (
            <View key={w} style={styles.weekRow}>
              {week.map((dayOfMonth, i) => {
                if (dayOfMonth === null) return <View key={`b${i}`} style={styles.cell} />;
                const date = addDays(monthKey, dayOfMonth - 1);
                const status = statusFor(date);
                const c = cellColors(status);
                const isSelected = date === selected;
                return (
                  <Pressable
                    key={date}
                    onPress={() => setSelected(date)}
                    accessibilityRole="button"
                    accessibilityLabel={`${date}, ${status}`}
                    style={styles.cell}>
                    <View
                      style={[
                        styles.cellInner,
                        { backgroundColor: c.bg },
                        c.border && { borderColor: c.border, borderWidth: 2 },
                        isSelected && { borderColor: theme.text, borderWidth: 2 },
                      ]}>
                      <ThemedText style={[styles.cellText, { color: c.fg }]}>{dayOfMonth}</ThemedText>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
          <View style={styles.legend}>
            <Legend color={theme.accent} label="Complete" />
            <Legend color={theme.accentSoft} label="Partial" />
            <Legend color={theme.backgroundSelected} label="Rest" />
          </View>
        </View>

        {selected && selectedSession && (
          <View style={[styles.card, styles.detail, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.eyebrow}>
              DAY {selectedDay} · {dateFromKey(selected).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </ThemedText>
            <ThemedText style={styles.detailTitle}>{selectedSession.title}</ThemedText>

            {selectedRecord || (selected < onward.today && selectedSession.kind !== 'rest') ? (
              <>
                {selectedRecord && selectedSession.exercises && (
                  <View style={styles.detailList}>
                    {selectedSession.exercises.map((ex) => {
                      const doneId = selectedRecord.movements?.[ex.slot] ?? ex.movement.id;
                      const w = selectedRecord.weights[doneId];
                      return (
                        <View key={ex.slot} style={styles.detailRow}>
                          <ThemedText style={styles.detailName}>{movement(doneId).name}</ThemedText>
                          <ThemedText themeColor="textSecondary">{w ? `${w} lb` : '–'}</ThemedText>
                        </View>
                      );
                    })}
                  </View>
                )}
                {!selectedRecord && (
                  <ThemedText type="small" themeColor="textSecondary">
                    Not logged. Tap what you did that day.
                  </ThemedText>
                )}
                <View style={styles.chips}>
                  {checklistFor(selectedSession).map((item) => {
                    const on = !!selectedRecord?.checklist[item.id];
                    const editable = selected < onward.today;
                    return (
                      <Pressable
                        key={item.id}
                        disabled={!editable}
                        onPress={() => onward.togglePastItem(selected, item.id)}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: on, disabled: !editable }}
                        style={({ pressed }) => [
                          styles.chip,
                          { backgroundColor: on ? theme.accent : theme.backgroundSelected },
                          pressed && { opacity: 0.6 },
                        ]}>
                        <ThemedText type="small" style={{ color: on ? theme.accentText : theme.textSecondary }}>
                          {on ? '✓ ' : ''}
                          {item.label}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : (
              <ThemedText themeColor="textSecondary">
                {selected > onward.today
                  ? 'Coming up.'
                  : selected === onward.today
                    ? 'In progress. Log it from the Today tab.'
                    : 'Rest day.'}
              </ThemedText>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {sub}
      </ThemedText>
      <ThemedText type="smallBold" style={styles.statLabel}>
        {label}
      </ThemedText>
    </View>
  );
}

function WeightStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.weightStat}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText style={styles.weightStatValue}>{value}</ThemedText>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: {
    padding: Spacing.four,
    paddingBottom: Spacing.six * 2,
    gap: Spacing.two,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  heading: { fontSize: 34, lineHeight: 40, fontWeight: 700 },
  eyebrow: { letterSpacing: 1 },
  statRow: { flexDirection: 'row', gap: Spacing.three, marginTop: Spacing.two },
  stat: { flex: 1, borderRadius: 16, padding: Spacing.three, gap: Spacing.half },
  statValue: { fontSize: 32, lineHeight: 38, fontWeight: 700 },
  statLabel: { marginTop: Spacing.one },
  sectionTitle: { fontSize: 20, lineHeight: 28, fontWeight: 700, marginTop: Spacing.four },
  sectionTitleInline: { fontSize: 20, lineHeight: 28, fontWeight: 700 },
  card: { borderRadius: 16, paddingHorizontal: Spacing.three, marginTop: Spacing.three },
  weightCard: { paddingVertical: Spacing.three, gap: Spacing.three },
  weightStats: { flexDirection: 'row', justifyContent: 'space-between' },
  weightStat: { flex: 1, gap: Spacing.half },
  weightStatValue: { fontSize: 22, lineHeight: 28, fontWeight: 700 },
  goalInput: { borderBottomWidth: 1, minWidth: 56, paddingVertical: 0 },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  weightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.two,
    height: 44,
  },
  weightInput: { width: 56, fontSize: 18, fontWeight: 600, textAlign: 'right' },
  habitRow: { paddingVertical: Spacing.three, gap: Spacing.two },
  habitHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  emptyNote: { paddingVertical: Spacing.three },
  monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.four },
  monthArrow: { fontSize: 32, lineHeight: 36, paddingHorizontal: Spacing.three },
  calendar: { paddingVertical: Spacing.three, paddingHorizontal: Spacing.two },
  weekRow: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', marginBottom: Spacing.one },
  cell: { flex: 1, aspectRatio: 1, padding: 3 },
  cellInner: { flex: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cellText: { fontSize: 15, fontWeight: 600 },
  legend: { flexDirection: 'row', gap: Spacing.three, justifyContent: 'center', marginTop: Spacing.three },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  legendDot: { width: 12, height: 12, borderRadius: 4 },
  detail: { paddingVertical: Spacing.three, gap: Spacing.two },
  detailTitle: { fontSize: 22, lineHeight: 28, fontWeight: 700 },
  detailList: { gap: Spacing.one },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.three },
  detailName: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.one },
  chip: { borderRadius: 999, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, minHeight: 40, justifyContent: 'center' },
});
