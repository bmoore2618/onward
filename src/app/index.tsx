import { openURL } from 'expo-linking';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SwapPicker } from '@/components/swap-picker';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import {
  CHECKLIST,
  checklistFor,
  PROGRAM_LENGTH_DAYS,
  phaseForDay,
  type Exercise,
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
        {onward.currentDay > PROGRAM_LENGTH_DAYS ? (
          <View style={styles.doneWrap}>
            <ThemedText style={[styles.heading, styles.centered]}>All {PROGRAM_LENGTH_DAYS} days are behind you.</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.centered}>
              Your next program is coming. Keep moving in the meantime. Onward.
            </ThemedText>
          </View>
        ) : onward.doneToday && onward.lastRecord ? (
          <DoneView
            day={onward.lastRecord.day}
            checkedCount={Object.values(onward.lastRecord.checklist).filter(Boolean).length}
            checklistTotal={
              onward.lastRecord.sessionId === 'rest' ? CHECKLIST.length - 1 : CHECKLIST.length
            }
            next={onward.tomorrow}
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
  const [swapping, setSwapping] = useState<Exercise | null>(null);
  const todayEntry = onward.bodyWeight.find((e) => e.date === onward.today);
  const todayWeight = todayEntry ? `${todayEntry.lb}` : '';

  return (
    <>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.eyebrow}>
        DAY {currentDay} OF {PROGRAM_LENGTH_DAYS}
      </ThemedText>
      <ThemedText style={styles.heading}>{session.title}</ThemedText>
      <ThemedText themeColor="textSecondary">
        {phase.name} phase · {session.length}
      </ThemedText>

      {onward.daysAway > 1 && (
        <ThemedText themeColor="textSecondary" style={styles.welcomeBack}>
          Welcome back. Here&apos;s today&apos;s session.
        </ThemedText>
      )}

      <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
        {session.exercises?.map((ex, i) => (
          <View
            key={ex.slot}
            style={[styles.exerciseRow, i > 0 && { borderTopColor: theme.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
            <Pressable
              style={styles.exerciseText}
              onPress={() => setSwapping(ex)}
              accessibilityRole="button"
              accessibilityLabel={`${ex.movement.name}, tap to swap`}>
              <ThemedText>{ex.movement.name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {ex.prescription}
              </ThemedText>
              {(ex.note ?? ex.movement.cue) && (
                <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
                  {ex.note ?? ex.movement.cue}
                </ThemedText>
              )}
              <View style={styles.exerciseLinks}>
                <ThemedText type="small" style={{ color: theme.accent }}>
                  Swap
                </ThemedText>
                {ex.movement.videoUrl && (
                  <Pressable onPress={() => openURL(ex.movement.videoUrl!)} hitSlop={8} accessibilityRole="link">
                    <ThemedText type="small" style={{ color: theme.accent }}>
                      Watch demo
                    </ThemedText>
                  </Pressable>
                )}
              </View>
            </Pressable>
            {ex.movement.weighted && (
              <View style={[styles.weightBox, { borderColor: theme.border, backgroundColor: theme.background }]}>
                <TextInput
                  value={onward.weightFor(ex.movement.id)}
                  onChangeText={(t) => onward.setWeight(ex.movement.id, t)}
                  placeholder="–"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  maxLength={5}
                  style={[styles.weightInput, { color: theme.text }]}
                  accessibilityLabel={`${ex.movement.name} weight in pounds`}
                />
                <ThemedText type="small" themeColor="textSecondary">
                  lb
                </ThemedText>
              </View>
            )}
          </View>
        ))}
        {session.blocks?.map((block, i) => (
          <View
            key={block.label}
            style={[styles.blockRow, i > 0 && { borderTopColor: theme.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              {block.label}
            </ThemedText>
            <ThemedText>{block.detail}</ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.guidance}>
        {session.effort && (
          <ThemedText type="small" themeColor="textSecondary">
            Effort: {session.effort}
          </ThemedText>
        )}
        {session.notes.map((note) => (
          <ThemedText key={note} type="small" themeColor="textSecondary">
            {note}
          </ThemedText>
        ))}
      </View>

      {onward.isWeighInDay && (
        <>
          <ThemedText style={styles.sectionTitle}>Weigh-in day</ThemedText>
          <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
            <View style={styles.exerciseRow}>
              <View style={styles.exerciseText}>
                <ThemedText>Morning weight</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Same time, same conditions each time.
                </ThemedText>
              </View>
              <View style={[styles.weightBox, { borderColor: theme.border, backgroundColor: theme.background }]}>
                <TextInput
                  value={todayWeight}
                  onChangeText={(t) => onward.setBodyWeight(onward.today, t)}
                  placeholder="–"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  maxLength={5}
                  style={[styles.weightInput, styles.bodyWeightInput, { color: theme.text }]}
                  accessibilityLabel="Body weight in pounds"
                />
                <ThemedText type="small" themeColor="textSecondary">
                  lb
                </ThemedText>
              </View>
            </View>
          </View>
        </>
      )}

      <ThemedText style={styles.sectionTitle}>Today&apos;s checklist</ThemedText>
      <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
        {checklistFor(session).map((item, i) => {
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

      <SwapPicker
        exercise={swapping}
        onPick={(movementId) => {
          if (swapping) onward.setSwap(swapping.slot, movementId);
          setSwapping(null);
        }}
        onClose={() => setSwapping(null)}
      />
    </>
  );
}

function DoneView({
  day,
  checkedCount,
  checklistTotal,
  next,
  onUndo,
}: {
  day: number;
  checkedCount: number;
  checklistTotal: number;
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
        {checkedCount} of {checklistTotal} checklist items. Onward.
      </ThemedText>

      {nextDay <= PROGRAM_LENGTH_DAYS ? (
        <View style={[styles.card, styles.tomorrowCard, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.eyebrow}>
            TOMORROW · DAY {nextDay}
          </ThemedText>
          <ThemedText style={styles.sectionTitle}>{next.title}</ThemedText>
          <ThemedText themeColor="textSecondary">{next.length}</ThemedText>
        </View>
      ) : (
        <ThemedText themeColor="textSecondary" style={styles.centered}>
          That&apos;s the full {PROGRAM_LENGTH_DAYS} days.
        </ThemedText>
      )}

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
    paddingBottom: Spacing.six * 2,
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
  exerciseText: { flex: 1, gap: Spacing.half },
  note: { fontStyle: 'italic' },
  exerciseLinks: { flexDirection: 'row', gap: Spacing.three, marginTop: Spacing.half },
  blockRow: { paddingVertical: Spacing.three, gap: Spacing.half },
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
  bodyWeightInput: { width: 60 },
  guidance: { marginTop: Spacing.two, gap: Spacing.one },
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
