import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import {
  CHECKLIST,
  PROGRAM_LENGTH_DAYS,
  phaseForDay,
  type Session,
} from '@/data/program';
import { useOnward } from '@/hooks/use-onward';
import { useTheme } from '@/hooks/use-theme';

export default function TodayScreen() {
  const theme = useTheme();
  const onward = useOnward();

  if (!onward.loaded) {
    return <View style={[styles.fill, { backgroundColor: theme.background }]} />;
  }

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets>
        {onward.doneToday && onward.lastRecord ? (
          <DoneView
            day={onward.lastRecord.day}
            checkedCount={Object.values(onward.lastRecord.checklist).filter(Boolean).length}
            next={onward.session}
            onUndo={onward.undoToday}
          />
        ) : (
          <TodayView onward={onward} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function TodayView({ onward }: { onward: ReturnType<typeof useOnward> }) {
  const theme = useTheme();
  const { currentDay, session } = onward;
  const phase = phaseForDay(currentDay);

  return (
    <>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.eyebrow}>
        DAY {currentDay} OF {PROGRAM_LENGTH_DAYS}
      </ThemedText>
      <ThemedText style={styles.heading}>{session.title}</ThemedText>
      <ThemedText themeColor="textSecondary">
        {phase ? `${phase.name} phase · ` : ''}about {session.minutes} min
      </ThemedText>

      {onward.daysAway > 1 && (
        <ThemedText themeColor="textSecondary" style={styles.welcomeBack}>
          Welcome back. Picking up right where you left off.
        </ThemedText>
      )}

      <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
        {session.exercises?.map((ex, i) => (
          <View
            key={ex.id}
            style={[styles.exerciseRow, i > 0 && { borderTopColor: theme.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
            <View style={styles.exerciseText}>
              <ThemedText>{ex.name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {ex.prescription}
              </ThemedText>
            </View>
            {ex.weighted && (
              <View style={[styles.weightBox, { borderColor: theme.border, backgroundColor: theme.background }]}>
                <TextInput
                  value={onward.weightFor(ex.id)}
                  onChangeText={(t) => onward.setWeight(ex.id, t)}
                  placeholder="–"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  maxLength={5}
                  style={[styles.weightInput, { color: theme.text }]}
                  accessibilityLabel={`${ex.name} weight in pounds`}
                />
                <ThemedText type="small" themeColor="textSecondary">
                  lb
                </ThemedText>
              </View>
            )}
          </View>
        ))}
        {session.steps?.map((step, i) => (
          <View
            key={step}
            style={[styles.exerciseRow, i > 0 && { borderTopColor: theme.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
            <ThemedText>{step}</ThemedText>
          </View>
        ))}
      </View>

      <ThemedText type="small" themeColor="textSecondary" style={styles.guidance}>
        Effort: {session.effort}
        {'\n'}
        {session.note}
      </ThemedText>

      <ThemedText style={styles.sectionTitle}>Today&apos;s checklist</ThemedText>
      <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
        {CHECKLIST.map((item, i) => {
          const checked = !!onward.checklist[item.id];
          return (
            <Pressable
              key={item.id}
              onPress={() => onward.toggleItem(item.id)}
              accessibilityRole="checkbox"
              accessibilityLabel={item.label}
              accessibilityState={{ checked }}
              style={({ pressed }) => [
                styles.checkRow,
                i > 0 && { borderTopColor: theme.border, borderTopWidth: StyleSheet.hairlineWidth },
                pressed && { opacity: 0.6 },
              ]}>
              <View
                style={[
                  styles.checkCircle,
                  { borderColor: checked ? theme.accent : theme.border },
                  checked && { backgroundColor: theme.accent },
                ]}>
                {checked && <ThemedText style={[styles.checkMark, { color: theme.accentText }]}>✓</ThemedText>}
              </View>
              <ThemedText>{item.label}</ThemedText>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={onward.completeDay}
        accessibilityRole="button"
        style={({ pressed }) => [styles.completeButton, { backgroundColor: theme.accent }, pressed && { opacity: 0.8 }]}>
        <ThemedText style={[styles.completeLabel, { color: theme.accentText }]}>Complete Day {currentDay}</ThemedText>
      </Pressable>
      <ThemedText type="small" themeColor="textSecondary" style={styles.centered}>
        Partial days count. Whatever you got done, log it and keep going.
      </ThemedText>
    </>
  );
}

function DoneView({
  day,
  checkedCount,
  next,
  onUndo,
}: {
  day: number;
  checkedCount: number;
  next: Session;
  onUndo: () => void;
}) {
  const theme = useTheme();
  const nextDay = day + 1;

  return (
    <View style={styles.doneWrap}>
      <View style={[styles.doneBadge, { backgroundColor: theme.accent }]}>
        <ThemedText style={[styles.doneBadgeMark, { color: theme.accentText }]}>✓</ThemedText>
      </View>
      <ThemedText style={styles.heading}>Day {day} done.</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.centered}>
        {checkedCount} of {CHECKLIST.length} checklist items. Onward.
      </ThemedText>

      <View style={[styles.card, styles.tomorrowCard, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.eyebrow}>
          TOMORROW · DAY {nextDay}
        </ThemedText>
        <ThemedText style={styles.sectionTitle}>{next.title}</ThemedText>
        <ThemedText themeColor="textSecondary">about {next.minutes} min</ThemedText>
      </View>

      <Pressable onPress={onUndo} hitSlop={12} accessibilityRole="button">
        <ThemedText type="small" themeColor="textSecondary" style={styles.undo}>
          Tapped by mistake? Reopen today
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.two,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  eyebrow: { letterSpacing: 1 },
  heading: { fontSize: 34, lineHeight: 40, fontWeight: 700 },
  welcomeBack: { marginTop: Spacing.two },
  card: { borderRadius: 16, paddingHorizontal: Spacing.three, marginTop: Spacing.three },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    minHeight: 64,
  },
  exerciseText: { flex: 1 },
  weightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.two,
    height: 44,
  },
  weightInput: { width: 44, fontSize: 18, fontWeight: 600, textAlign: 'right' },
  guidance: { marginTop: Spacing.two },
  sectionTitle: { fontSize: 20, lineHeight: 28, fontWeight: 700, marginTop: Spacing.four },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, minHeight: 56 },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { fontSize: 16, lineHeight: 20, fontWeight: 700 },
  completeButton: {
    marginTop: Spacing.five,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeLabel: { fontSize: 20, fontWeight: 700 },
  centered: { textAlign: 'center' },
  doneWrap: { alignItems: 'center', gap: Spacing.two, paddingTop: Spacing.six },
  doneBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  doneBadgeMark: { fontSize: 36, lineHeight: 42, fontWeight: 700 },
  tomorrowCard: { alignSelf: 'stretch', paddingVertical: Spacing.three, marginTop: Spacing.four },
  undo: { marginTop: Spacing.four, textDecorationLine: 'underline' },
});
