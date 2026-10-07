import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FEEL_LABELS } from '@/components/check-in';
import { ProgressPhotos } from '@/components/progress-photos';
import { ThemedText } from '@/components/themed-text';
import { WeightChart } from '@/components/weight-chart';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { CHECKLIST, checklistFor, dayCounts, movement, PROGRAM_LENGTH_DAYS } from '@/data/program';
import { addDays, dateFromKey, todayKey, type DayRecord } from '@/data/storage';
import { useOnward } from '@/hooks/use-onward';
import { useTheme } from '@/hooks/use-theme';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

type DayStatus = 'future' | 'off-program' | 'full' | 'partial' | 'rest' | 'missed' | 'today';

export default function ProgressScreen() {
  const theme = useTheme();
  const onward = useOnward();
  const { sessionFor, completed, programDayFor, profile, today } = onward;
  const [selected, setSelected] = useState<string | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);

  const byDate = useMemo(() => {
    const map = new Map<string, DayRecord>();
    for (const r of completed) map.set(r.date, r);
    return map;
  }, [completed]);

  const currentDay = programDayFor(today);
  const doneToday = byDate.has(today);
  const lastDay = Math.min(currentDay, PROGRAM_LENGTH_DAYS);
  // Days that have happened so far (today counts once it's completed)
  const elapsedDays = Math.max(0, doneToday ? lastDay : lastDay - 1);

  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    const applicable: Record<string, number> = {};
    let trainingDays = 0;
    let workoutsDone = 0;
    for (let day = 1; day <= elapsedDays; day++) {
      const date = addDays(profile.programStartDate, day - 1);
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
    // Day-completion rule: planned session (or short version), or a rest day with 3+ habits
    let daysCompleted = 0;
    let goodWeeks = 0;
    let weekWorkouts = 0;
    for (let day = 1; day <= elapsedDays; day++) {
      const date = addDays(profile.programStartDate, day - 1);
      const session = sessionFor(day);
      const record = byDate.get(date);
      if (record && dayCounts(session, record.checklist)) daysCompleted++;
      if (record?.checklist.workout) weekWorkouts++;
      if (day % 7 === 0 || day === elapsedDays) {
        if (weekWorkouts >= 2) goodWeeks++;
        weekWorkouts = 0;
      }
    }
    return {
      daysCompleted,
      goodWeeks,
      weeksSoFar: Math.ceil(elapsedDays / 7),
      consistency: trainingDays ? Math.round((workoutsDone / trainingDays) * 100) : 0,
      items: CHECKLIST.map((item) => ({ ...item, done: counts[item.id] ?? 0, of: applicable[item.id] ?? 0 })),
    };
  }, [elapsedDays, byDate, sessionFor, profile.programStartDate]);

  // Calendar month to show
  const base = dateFromKey(today);
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
    if (date === today && !doneToday) return 'today';
    if (date > today) return 'future';
    const session = sessionFor(day);
    const record = byDate.get(date);
    if (session.kind === 'rest') return 'rest';
    if (!record) return 'missed';
    const needed = checklistFor(session).length;
    const got = Object.values(record.checklist).filter(Boolean).length;
    if (got === 0) return 'missed';
    return got >= needed || dayCounts(session, record.checklist) ? 'full' : 'partial';
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

  // Body weight summary
  const first = onward.bodyWeight[0];
  const latest = onward.bodyWeight[onward.bodyWeight.length - 1];
  const change = first && latest ? Math.round((latest.lb - first.lb) * 10) / 10 : null;
  const changeText = change === null ? '–' : change > 0 ? `+${change}` : `${change}`;
  const todayView = onward.viewDay(today);

  const selectedDay = selected ? programDayFor(selected) : null;
  const selectedView = selected && selectedDay && selectedDay >= 1 && selectedDay <= PROGRAM_LENGTH_DAYS ? onward.viewDay(selected) : null;

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <ThemedText style={styles.heading}>Progress</ThemedText>

        <View style={styles.statRow}>
          <Stat label="Days completed" value={`${stats.daysCompleted}`} sub={`of ${elapsedDays} so far`} />
          <Stat label="Workout consistency" value={`${stats.consistency}%`} sub="of training days" />
        </View>
        <View style={styles.statRow}>
          <Stat label="Weeks with 2+ sessions" value={`${stats.goodWeeks}`} sub={`of ${stats.weeksSoFar} so far`} />
          <Stat label="Program" value={`Day ${Math.min(currentDay, PROGRAM_LENGTH_DAYS)}`} sub={`of ${PROGRAM_LENGTH_DAYS}`} />
        </View>

        <ThemedText style={styles.sectionTitle}>Body weight</ThemedText>
        <View style={[styles.card, styles.weightCard, { backgroundColor: theme.backgroundElement }]}>
          <View style={styles.weightStats}>
            <WeightStat label="Start" value={first ? `${first.lb}` : '–'} />
            <WeightStat label="Current" value={latest ? `${latest.lb}` : '–'} />
            <WeightStat label="Change" value={changeText} />
            <WeightStat label="Goal" value={profile.goalWeight || '–'} />
          </View>
          <WeightChart points={onward.bodyWeight} goal={parseFloat(profile.goalWeight) || undefined} paceStart={first ? { date: first.date, lb: first.lb } : undefined} />
          {first && (
            <ThemedText type="small" themeColor="textSecondary">
              The dotted line is a steady 0.75 lb a week. That pace is what the research calls realistic; the goal line shows where you’re headed.
            </ThemedText>
          )}
          <View style={[styles.logRow, { borderTopColor: theme.border }]}>
            <ThemedText>Today&apos;s weigh-in</ThemedText>
            <View style={[styles.weightBox, { borderColor: theme.border, backgroundColor: theme.background }]}>
              <TextInput
                value={todayView.bodyWeight}
                onChangeText={(t) => onward.setBodyWeight(today, t)}
                placeholder="–"
                placeholderTextColor={theme.textSecondary}
                keyboardType="decimal-pad"
                returnKeyType="done"
                maxLength={6}
                style={[styles.weightInput, { color: theme.text }]}
                accessibilityLabel="Today's body weight in pounds"
              />
              <ThemedText type="small" themeColor="textSecondary">
                lb
              </ThemedText>
            </View>
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            Set your goal weight on the Settings tab.
          </ThemedText>
        </View>

        <ThemedText style={styles.sectionTitle}>Progress photos</ThemedText>
        <ProgressPhotos />

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
          <View style={styles.legend}>
            <ThemedText type="small" themeColor="textSecondary">
              A day counts when you do the session (short version included) or tick 3+ habits on a rest day.
            </ThemedText>
          </View>
        </View>

        {selected && selectedView && (
          <View style={[styles.card, styles.detail, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.eyebrow}>
              DAY {selectedView.day} · {dateFromKey(selected).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </ThemedText>
            <ThemedText style={styles.detailTitle}>{selectedView.session.title}</ThemedText>

            {selectedView.record && selectedView.session.exercises && (
              <View style={styles.detailList}>
                {selectedView.session.exercises.map((ex) => {
                  const w = selectedView.record!.weights[ex.movement.id];
                  return (
                    <View key={ex.slot} style={styles.detailRow}>
                      <ThemedText style={styles.detailName}>{movement(ex.movement.id).name}</ThemedText>
                      <ThemedText themeColor="textSecondary">{w ? `${w} lb` : '–'}</ThemedText>
                    </View>
                  );
                })}
              </View>
            )}
            {selectedView.bodyWeight !== '' && (
              <ThemedText type="small" themeColor="textSecondary">
                Weigh-in: {selectedView.bodyWeight} lb
              </ThemedText>
            )}
            {(() => {
              const c = onward.checkinFor(selected);
              return (
                <>
                  {c.feel && (
                    <ThemedText type="small" themeColor="textSecondary">
                      Felt: {c.feel}/5 · {FEEL_LABELS[c.feel]}
                    </ThemedText>
                  )}
                  {c.note ? <ThemedText style={styles.noteText}>“{c.note}”</ThemedText> : null}
                </>
              );
            })()}

            {selectedView.isFuture ? (
              <ThemedText themeColor="textSecondary">Coming up.</ThemedText>
            ) : (
              <>
                {!selectedView.record && !selectedView.isToday && selectedView.session.kind !== 'rest' && (
                  <ThemedText type="small" themeColor="textSecondary">
                    Not logged. Tap what you did that day.
                  </ThemedText>
                )}
                <View style={styles.chips}>
                  {checklistFor(selectedView.session).map((item) => {
                    const on = !!selectedView.checklist[item.id];
                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => onward.toggleItem(selected, item.id)}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: on }}
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
            )}

            <Pressable
              onPress={() => router.push({ pathname: '/', params: { date: selected } })}
              accessibilityRole="button"
              style={({ pressed }) => [styles.openButton, { borderColor: theme.accent }, pressed && { opacity: 0.6 }]}>
              <ThemedText style={{ color: theme.accent, fontWeight: 600 }}>
                {selectedView.isFuture ? 'Preview this day' : 'Open this day to edit weights and movements'}
              </ThemedText>
            </Pressable>
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
  weightInput: { width: 64, fontSize: 18, fontWeight: 600, textAlign: 'right' },
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
  noteText: { fontStyle: 'italic' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.one },
  chip: { borderRadius: 999, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, minHeight: 40, justifyContent: 'center' },
  openButton: { marginTop: Spacing.two, minHeight: 48, borderWidth: 1.5, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.three },
});
