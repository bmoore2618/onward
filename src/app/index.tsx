import { openURL } from 'expo-linking';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CheckIn } from '@/components/check-in';
import { RestTimer, restSeconds } from '@/components/rest-timer';
import { SwapPicker } from '@/components/swap-picker';
import { ThemedText } from '@/components/themed-text';
import { WeekSummary } from '@/components/week-summary';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { checklistFor, MOBILITY_VIDEO_URL, PROGRAM_LENGTH_DAYS, phaseForDay, REST_DAY_VIDEO_URL, type Exercise } from '@/data/program';
import { addDays, dateFromKey } from '@/data/storage';
import { useOnward } from '@/hooks/use-onward';
import { useTheme } from '@/hooks/use-theme';

export default function TodayScreen() {
  const theme = useTheme();
  const onward = useOnward();
  const params = useLocalSearchParams<{ date?: string }>();
  const requested = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : null;
  // Progress tab can open a specific day; a new calendar day resets the view
  const navKey = `${requested}|${onward.today}`;
  const [nav, setNav] = useState({ key: navKey, date: requested ?? onward.today });
  if (nav.key !== navKey) setNav({ key: navKey, date: requested ?? onward.today });
  const viewDate = nav.date;
  const setViewDate = (date: string) => setNav({ key: navKey, date });
  const [swapping, setSwapping] = useState<Exercise | null>(null);
  const [timerKick, setTimerKick] = useState<{ seconds: number; nonce: number }>();

  if (!onward.loaded) {
    return <View style={[styles.fill, { backgroundColor: theme.background }]} />;
  }

  const v = onward.viewDay(viewDate);
  const { session } = v;
  const inProgram = v.day >= 1 && v.day <= PROGRAM_LENGTH_DAYS;
  const editable = !v.isFuture && inProgram;
  const doneToday = v.isToday && !!v.record;
  const dateLabel = dateFromKey(viewDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  const checked = Object.values(v.checklist).filter(Boolean).length;

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets>
        {/* Date navigation */}
        <View style={styles.navRow}>
          <Pressable onPress={() => setViewDate(addDays(viewDate, -1))} hitSlop={12} accessibilityRole="button" accessibilityLabel="Previous day" style={styles.navButton}>
            <ThemedText style={styles.navArrow}>‹</ThemedText>
          </Pressable>
          <Pressable onPress={() => setViewDate(onward.today)} disabled={v.isToday} accessibilityRole="button" style={styles.navCenter}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.eyebrow}>
              {inProgram ? `DAY ${v.day} OF ${PROGRAM_LENGTH_DAYS}` : 'OUTSIDE THE PROGRAM'}
            </ThemedText>
            <ThemedText type="small" themeColor={v.isToday ? 'text' : 'textSecondary'}>
              {v.isToday ? `Today · ${dateLabel}` : dateLabel}
            </ThemedText>
            {!v.isToday && (
              <ThemedText type="small" style={{ color: theme.accent }}>
                Back to today
              </ThemedText>
            )}
          </Pressable>
          <Pressable onPress={() => setViewDate(addDays(viewDate, 1))} hitSlop={12} accessibilityRole="button" accessibilityLabel="Next day" style={styles.navButton}>
            <ThemedText style={styles.navArrow}>›</ThemedText>
          </Pressable>
        </View>

        {!inProgram ? (
          <View style={styles.doneWrap}>
            <ThemedText style={[styles.heading, styles.centered]}>
              {v.day > PROGRAM_LENGTH_DAYS ? `All ${PROGRAM_LENGTH_DAYS} days are behind you.` : 'Before Day 1.'}
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.centered}>
              {v.day > PROGRAM_LENGTH_DAYS ? 'Your next program is coming. Keep moving in the meantime. Onward.' : 'The program starts on your chosen start date (see Settings).'}
            </ThemedText>
          </View>
        ) : (
          <>
            {doneToday && (
              <View style={[styles.banner, { backgroundColor: theme.accent }]}>
                <ThemedText style={[styles.bannerTitle, { color: theme.accentText }]}>Day {v.day} done. Onward.</ThemedText>
                <ThemedText type="small" style={{ color: theme.accentText }}>
                  {checked} of {checklistFor(session).length} checklist items · Tomorrow: {onward.sessionFor(v.day + 1).title}
                </ThemedText>
                <Pressable onPress={onward.reopenToday} hitSlop={8} accessibilityRole="button">
                  <ThemedText type="small" style={[styles.bannerLink, { color: theme.accentText }]}>
                    Tapped by mistake? Reopen today
                  </ThemedText>
                </Pressable>
              </View>
            )}
            {v.isPast && (
              <ThemedText type="small" themeColor="textSecondary">
                {v.record ? 'Logged. Edits here save as you go.' : 'Not logged. Tap what you did and it saves as you go.'}
              </ThemedText>
            )}

            <ThemedText style={styles.heading}>{session.title}</ThemedText>
            <ThemedText themeColor="textSecondary">
              {phaseForDay(v.day).name} phase · {session.length}
            </ThemedText>

            {session.kind === 'rest' && !v.isFuture && <WeekSummary date={viewDate} />}

            {session.reentry && (
              <View style={[styles.infoCard, { backgroundColor: theme.backgroundElement, borderColor: theme.accent }]}>
                <ThemedText type="smallBold">Easing back in</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  A few days away, so today is a lighter session: two sets per movement, about 10% less weight. That’s the plan, not a penalty.
                </ThemedText>
              </View>
            )}

            {session.kind === 'strength' && editable && (
              <Pressable
                onPress={() => onward.toggleShort(viewDate)}
                accessibilityRole="switch"
                accessibilityState={{ checked: v.short }}
                style={[styles.shortToggle, { borderColor: v.short ? theme.accent : theme.border, backgroundColor: v.short ? theme.accentSoft : 'transparent' }]}>
                <ThemedText type="smallBold">{v.short ? 'Short version on' : 'Short on time?'}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {v.short ? 'First four movements, one set fewer. Still counts as a full day.' : 'Tap for the 20–25 minute version. It counts.'}
                </ThemedText>
              </Pressable>
            )}

            <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
              {session.exercises?.map((ex, i) => (
                <View
                  key={ex.slot}
                  style={[styles.exerciseRow, i > 0 && { borderTopColor: theme.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
                  <View style={styles.exerciseText}>
                    <ThemedText>
                      {ex.movement.name}
                      {ex.finisher ? <ThemedText type="small" themeColor="textSecondary">  · optional</ThemedText> : null}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {ex.prescription} · rest {ex.rest}
                    </ThemedText>
                    {ex.movement.weighted && editable && <LastLift movementId={ex.movement.id} beforeDate={viewDate} />}
                    {ex.movement.weighted && editable && (
                      <View style={styles.hitRow}>
                        <ThemedText type="small" themeColor="textSecondary">
                          All sets hit the top of the range?
                        </ThemedText>
                        {(['hit', 'miss'] as const).map((h) => {
                          const on = v.hitFor(ex.movement.id) === h;
                          return (
                            <Pressable
                              key={h}
                              onPress={() => onward.setHit(viewDate, ex.movement.id, on ? null : h)}
                              accessibilityRole="radio"
                              accessibilityState={{ selected: on }}
                              accessibilityLabel={h === 'hit' ? 'Yes, all reps hit' : 'No, fell short'}
                              style={[styles.hitChip, { backgroundColor: on ? theme.accent : theme.backgroundSelected }]}>
                              <ThemedText type="smallBold" style={{ color: on ? theme.accentText : theme.textSecondary }}>
                                {h === 'hit' ? 'Yes' : 'Not quite'}
                              </ThemedText>
                            </Pressable>
                          );
                        })}
                      </View>
                    )}
                    {(ex.note ?? ex.movement.cue) && (
                      <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
                        {ex.note ?? ex.movement.cue}
                      </ThemedText>
                    )}
                    <View style={styles.exerciseLinks}>
                      {editable && v.isToday && session.kind === 'strength' && (
                        <Pressable
                          onPress={() => setTimerKick({ seconds: restSeconds(ex.rest), nonce: Date.now() })}
                          hitSlop={8}
                          accessibilityRole="button"
                          accessibilityLabel={`Start ${ex.rest} rest for ${ex.movement.name}`}
                          style={[styles.restButton, { borderColor: theme.accent }]}>
                          <ThemedText type="smallBold" style={{ color: theme.accent }}>
                            Rest {ex.rest.replace('–', '-')}
                          </ThemedText>
                        </Pressable>
                      )}
                      {editable && (
                        <Pressable onPress={() => setSwapping(ex)} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Swap ${ex.movement.name}`}>
                          <ThemedText type="small" style={{ color: theme.accent }}>
                            Swap
                          </ThemedText>
                        </Pressable>
                      )}
                      {ex.movement.videoUrl && (
                        <Pressable onPress={() => openURL(ex.movement.videoUrl!)} hitSlop={8} accessibilityRole="link">
                          <ThemedText type="small" style={{ color: theme.accent }}>
                            Watch demo
                          </ThemedText>
                        </Pressable>
                      )}
                    </View>
                  </View>
                  {ex.movement.weighted && editable && (
                    <View style={[styles.weightBox, { borderColor: theme.border, backgroundColor: theme.background }]}>
                      <TextInput
                        value={v.weightFor(ex.movement.id)}
                        onChangeText={(t) => onward.setWeight(viewDate, ex.movement.id, t)}
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
              {session.kind === 'rest' && (
                <Pressable onPress={() => openURL(REST_DAY_VIDEO_URL)} hitSlop={8} accessibilityRole="link">
                  <ThemedText type="small" style={{ color: theme.accent }}>
                    Watch: why rest days matter
                  </ThemedText>
                </Pressable>
              )}
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

            {editable && (
              <>
                <ThemedText style={styles.sectionTitle}>{onward.isWeighInDay(viewDate) ? 'Weigh-in day' : 'Weigh-in'}</ThemedText>
                <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
                  <View style={styles.exerciseRow}>
                    <View style={styles.exerciseText}>
                      <ThemedText>Morning weight</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {onward.isWeighInDay(viewDate) ? 'Same time, same conditions each time.' : 'Optional today.'}
                      </ThemedText>
                    </View>
                    <View style={[styles.weightBox, { borderColor: theme.border, backgroundColor: theme.background }]}>
                      <TextInput
                        value={v.bodyWeight}
                        onChangeText={(t) => onward.setBodyWeight(viewDate, t)}
                        placeholder="–"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="decimal-pad"
                        returnKeyType="done"
                        maxLength={6}
                        style={[styles.weightInput, styles.bodyWeightInput, { color: theme.text }]}
                        accessibilityLabel="Body weight in pounds"
                      />
                      <ThemedText type="small" themeColor="textSecondary">
                        lb
                      </ThemedText>
                    </View>
                  </View>
                </View>

                <ThemedText style={styles.sectionTitle}>{v.isToday ? "Today's checklist" : 'Checklist'}</ThemedText>
                <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
                  {checklistFor(session).map((item, i) => {
                    const on = !!v.checklist[item.id];
                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => onward.toggleItem(viewDate, item.id)}
                        accessibilityRole="checkbox"
                        accessibilityLabel={item.label}
                        accessibilityState={{ checked: on }}
                        style={({ pressed }) => [
                          styles.checkRow,
                          i > 0 && { borderTopColor: theme.border, borderTopWidth: StyleSheet.hairlineWidth },
                          pressed && { opacity: 0.6 },
                        ]}>
                        <View
                          style={[
                            styles.checkCircle,
                            { borderColor: on ? theme.accent : theme.border },
                            on && { backgroundColor: theme.accent },
                          ]}>
                          {on && <ThemedText style={[styles.checkMark, { color: theme.accentText }]}>✓</ThemedText>}
                        </View>
                        <ThemedText style={styles.checkLabel}>{item.label}</ThemedText>
                        {item.id === 'mobility' && (
                          <Pressable onPress={() => openURL(MOBILITY_VIDEO_URL)} hitSlop={8} accessibilityRole="link">
                            <ThemedText type="small" style={{ color: theme.accent }}>
                              Stretch demo
                            </ThemedText>
                          </Pressable>
                        )}
                      </Pressable>
                    );
                  })}
                </View>

                <ThemedText style={styles.sectionTitle}>Check-in</ThemedText>
                <CheckIn date={viewDate} />

                {v.isToday && !v.record && (
                  <>
                    <Pressable
                      onPress={onward.completeToday}
                      accessibilityRole="button"
                      style={({ pressed }) => [styles.completeButton, { backgroundColor: theme.accent }, pressed && { opacity: 0.8 }]}>
                      <ThemedText style={[styles.completeLabel, { color: theme.accentText }]}>Complete Day {v.day}</ThemedText>
                    </Pressable>
                    <ThemedText type="small" themeColor="textSecondary" style={styles.centered}>
                      Partial days count. Whatever you got done, log it and keep going.
                    </ThemedText>
                  </>
                )}
              </>
            )}

            {v.isFuture && (
              <ThemedText type="small" themeColor="textSecondary" style={styles.centered}>
                Coming up. You can log it on the day.
              </ThemedText>
            )}
          </>
        )}

        {v.isToday && session.kind === 'strength' && <RestTimer kick={timerKick} />}

        <SwapPicker
          exercise={swapping}
          phaseName={phaseForDay(v.day).name}
          askScope={!v.isPast && !v.record}
          onPick={(movementId, scope) => {
            if (swapping) onward.setMovement(viewDate, swapping.slot, movementId, scope);
            setSwapping(null);
          }}
          onClose={() => setSwapping(null)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

/** "Last: 70 lb (Day 8), all reps hit → try 75" under a weighted exercise, or a first-time hint */
function LastLift({ movementId, beforeDate }: { movementId: string; beforeDate: string }) {
  const onward = useOnward();
  const s = onward.suggestion(movementId, beforeDate);
  return (
    <ThemedText type="small" themeColor="textSecondary">
      {s.text}
    </ThemedText>
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
  navRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.two },
  navButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navArrow: { fontSize: 32, lineHeight: 36 },
  navCenter: { flex: 1, alignItems: 'center', gap: 2 },
  eyebrow: { letterSpacing: 1 },
  heading: { fontSize: 34, lineHeight: 40, fontWeight: 700 },
  banner: { borderRadius: 16, padding: Spacing.three, gap: Spacing.one, marginBottom: Spacing.two },
  bannerTitle: { fontSize: 20, lineHeight: 26, fontWeight: 700 },
  bannerLink: { textDecorationLine: 'underline', marginTop: Spacing.one },
  card: { borderRadius: 16, paddingHorizontal: Spacing.three, marginTop: Spacing.three },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    minHeight: 64,
  },
  exerciseText: { flex: 1, gap: Spacing.half },
  hitRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: Spacing.one, marginTop: Spacing.half },
  hitChip: { borderRadius: 999, paddingHorizontal: Spacing.two, minHeight: 32, justifyContent: 'center' },
  infoCard: { borderRadius: 16, borderWidth: 1.5, padding: Spacing.three, marginTop: Spacing.three, gap: Spacing.half },
  shortToggle: { borderRadius: 16, borderWidth: 1.5, padding: Spacing.three, marginTop: Spacing.three, gap: Spacing.half, minHeight: 56 },
  note: { fontStyle: 'italic' },
  exerciseLinks: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: Spacing.three, marginTop: Spacing.half },
  restButton: { borderWidth: 1.5, borderRadius: 999, paddingHorizontal: Spacing.two, minHeight: 32, justifyContent: 'center' },
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
  bodyWeightInput: { width: 64 },
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
  checkLabel: { flex: 1 },
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
});
