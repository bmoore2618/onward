import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { PROGRAM_LENGTH_DAYS } from '@/data/program';
import { dateFromKey, isValidDateKey } from '@/data/storage';
import { useOnward } from '@/hooks/use-onward';
import { useTheme } from '@/hooks/use-theme';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function hourLabel(h: number) {
  const suffix = h < 12 ? 'AM' : 'PM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:00 ${suffix}`;
}

export default function SettingsScreen() {
  const theme = useTheme();
  const onward = useOnward();
  const { profile, setProfile } = onward;
  const [startDraft, setStartDraft] = useState(profile.programStartDate);

  const startValid = isValidDateKey(startDraft);
  const startIsMonday = startValid && dateFromKey(startDraft).getDay() === 1;
  const currentDay = onward.programDayFor(onward.today);

  const commitStart = () => {
    if (startValid && startDraft !== profile.programStartDate) setProfile({ programStartDate: startDraft });
  };

  const hasFusion = profile.limitations.includes('lumbar-fusion');

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <ThemedText style={styles.heading}>Settings</ThemedText>

        <ThemedText style={styles.sectionTitle}>Goal</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <Row label="Goal weight" hint="Shown as a dashed line on the weight chart">
            <Field value={profile.goalWeight} onChangeText={(t) => setProfile({ goalWeight: t.replace(/[^0-9.]/g, '') })} unit="lb" width={64} label="Goal weight in pounds" />
          </Row>
        </View>

        <ThemedText style={styles.sectionTitle}>Program</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <Row
            label="Day 1 date"
            hint={
              !startValid
                ? 'Use the form 2026-09-28'
                : !startIsMonday
                  ? 'Heads up: not a Monday, so rest days won’t land on Sundays.'
                  : `Today is Day ${currentDay} of ${PROGRAM_LENGTH_DAYS}.`
            }>
            <TextInput
              value={startDraft}
              onChangeText={setStartDraft}
              onBlur={commitStart}
              onSubmitEditing={commitStart}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numbers-and-punctuation"
              returnKeyType="done"
              maxLength={10}
              style={[styles.dateInput, { color: startValid ? theme.text : '#C0392B', borderColor: theme.border, backgroundColor: theme.background }]}
              accessibilityLabel="Program start date"
            />
          </Row>
          <Divider />
          <View style={styles.stack}>
            <ThemedText>Weigh-in days</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              The Today screen prompts for a morning weight on these days. You can still log on any day.
            </ThemedText>
            <View style={styles.chips}>
              {WEEKDAYS.map((name, i) => {
                const on = profile.weighInWeekdays.includes(i);
                return (
                  <Pressable
                    key={name}
                    onPress={() =>
                      setProfile({
                        weighInWeekdays: on ? profile.weighInWeekdays.filter((d) => d !== i) : [...profile.weighInWeekdays, i].sort(),
                      })
                    }
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: on }}
                    style={[styles.chip, { backgroundColor: on ? theme.accent : theme.backgroundSelected }]}>
                    <ThemedText type="smallBold" style={{ color: on ? theme.accentText : theme.textSecondary }}>
                      {name}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <Divider />
          <Row label="Back-friendly adjustments" hint="Swaps in gentler options for a past lumbar fusion. Off = the standard program.">
            <Switch
              value={hasFusion}
              onValueChange={(on) => setProfile({ limitations: on ? ['lumbar-fusion'] : [] })}
              trackColor={{ true: theme.accent }}
              accessibilityLabel="Back-friendly adjustments"
            />
          </Row>
        </View>

        <ThemedText style={styles.sectionTitle}>Reminders</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <Row label="Notifications" hint="A heads-up the night before and a nudge in the morning.">
            <Switch
              value={profile.notificationsEnabled}
              onValueChange={(on) => setProfile({ notificationsEnabled: on })}
              trackColor={{ true: theme.accent }}
              accessibilityLabel="Notifications"
            />
          </Row>
          <Divider />
          <Row label="Evening reminder" hint="“Tomorrow: Strength B, about 45 min”">
            <Stepper value={profile.eveningHour} onChange={(h) => setProfile({ eveningHour: h })} label="Evening reminder hour" />
          </Row>
          <Divider />
          <Row label="Morning reminder" hint="“Day 9: Peloton Conditioning is ready”">
            <Stepper value={profile.morningHour} onChange={(h) => setProfile({ morningHour: h })} label="Morning reminder hour" />
          </Row>
        </View>

        <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
          Onward · Consistency over perfection.
        </ThemedText>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <ThemedText>{label}</ThemedText>
        {hint && (
          <ThemedText type="small" themeColor="textSecondary">
            {hint}
          </ThemedText>
        )}
      </View>
      {children}
    </View>
  );
}

function Divider() {
  const theme = useTheme();
  return <View style={{ borderTopColor: theme.border, borderTopWidth: StyleSheet.hairlineWidth }} />;
}

function Field({ value, onChangeText, unit, width, label }: { value: string; onChangeText: (t: string) => void; unit: string; width: number; label: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.fieldBox, { borderColor: theme.border, backgroundColor: theme.background }]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="–"
        placeholderTextColor={theme.textSecondary}
        keyboardType="decimal-pad"
        returnKeyType="done"
        maxLength={6}
        style={[styles.fieldInput, { color: theme.text, width }]}
        accessibilityLabel={label}
      />
      <ThemedText type="small" themeColor="textSecondary">
        {unit}
      </ThemedText>
    </View>
  );
}

function Stepper({ value, onChange, label }: { value: number; onChange: (h: number) => void; label: string }) {
  const theme = useTheme();
  return (
    <View style={styles.stepper} accessibilityLabel={label}>
      <Pressable onPress={() => onChange((value + 23) % 24)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Earlier" style={styles.stepButton}>
        <ThemedText style={styles.stepArrow}>‹</ThemedText>
      </Pressable>
      <ThemedText style={[styles.stepValue, { color: theme.text }]}>{hourLabel(value)}</ThemedText>
      <Pressable onPress={() => onChange((value + 1) % 24)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Later" style={styles.stepButton}>
        <ThemedText style={styles.stepArrow}>›</ThemedText>
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
  heading: { fontSize: 34, lineHeight: 40, fontWeight: 700 },
  sectionTitle: { fontSize: 20, lineHeight: 28, fontWeight: 700, marginTop: Spacing.four },
  card: { borderRadius: 16, paddingHorizontal: Spacing.three, marginTop: Spacing.three },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.three, minHeight: 64 },
  rowText: { flex: 1, gap: Spacing.half },
  stack: { paddingVertical: Spacing.three, gap: Spacing.two },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.one },
  chip: { borderRadius: 999, paddingHorizontal: Spacing.three, minHeight: 40, justifyContent: 'center' },
  fieldBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, borderWidth: 1, borderRadius: 10, paddingHorizontal: Spacing.two, height: 44 },
  fieldInput: { fontSize: 18, fontWeight: 600, textAlign: 'right' },
  dateInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: Spacing.two, height: 44, width: 132, fontSize: 16, fontWeight: 600, textAlign: 'center' },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  stepButton: { width: 36, height: 44, alignItems: 'center', justifyContent: 'center' },
  stepArrow: { fontSize: 28, lineHeight: 32 },
  stepValue: { fontSize: 16, fontWeight: 600, minWidth: 76, textAlign: 'center' },
  footer: { textAlign: 'center', marginTop: Spacing.five },
});
