import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { backupSummary, exportBackup, restoreBackup } from '@/data/backup';
import type { CardioMode, Equipment, Limitation } from '@/data/profile';
import { PROGRAM_LENGTH_DAYS } from '@/data/program';
import { dateFromKey, isValidDateKey } from '@/data/storage';
import { useOnward } from '@/hooks/use-onward';
import { useTheme } from '@/hooks/use-theme';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const EQUIPMENT: { id: Equipment; label: string; hint: string }[] = [
  { id: 'home', label: 'Home gym', hint: 'Dumbbells, kettlebells, a bench; maybe a bar and rack' },
  { id: 'gym', label: 'Full gym', hint: 'Barbells, machines, cables' },
  { id: 'bodyweight', label: 'Bodyweight', hint: 'No equipment, or travelling' },
];
const CARDIO: { id: CardioMode; label: string }[] = [
  { id: 'bike', label: 'Bike' },
  { id: 'walk', label: 'Walk / jog' },
  { id: 'row', label: 'Rower' },
];
const LIMITATIONS: { id: Limitation; label: string; hint: string }[] = [
  { id: 'lower-back', label: 'Lower back', hint: 'Front-loaded squats, supported rows and bridges by default' },
  { id: 'knee', label: 'Knees', hint: 'Box squats and step-ups by default; lighten before shortening range' },
  { id: 'shoulder', label: 'Shoulders', hint: 'Neutral-grip and angled pressing by default' },
];

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
  const [busy, setBusy] = useState(false);

  const startValid = isValidDateKey(startDraft);
  const startIsMonday = startValid && dateFromKey(startDraft).getDay() === 1;
  const currentDay = onward.programDayFor(onward.today);

  const commitStart = () => {
    if (startValid && startDraft !== profile.programStartDate) setProfile({ programStartDate: startDraft });
  };

  const toggleLimitation = (id: Limitation) =>
    setProfile({
      limitations: profile.limitations.includes(id) ? profile.limitations.filter((l) => l !== id) : [...profile.limitations, id],
    });

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <ThemedText style={styles.heading}>Settings</ThemedText>

        <ThemedText style={styles.sectionTitle}>You</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <Row label="First name" hint="Optional">
            <TextInput
              value={profile.name}
              onChangeText={(t) => setProfile({ name: t })}
              placeholder="–"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="words"
              returnKeyType="done"
              style={[styles.dateInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              accessibilityLabel="First name"
            />
          </Row>
          <Divider />
          <Row label="Goal weight" hint="The chart shows a steady 0.5–1 lb a week pace toward it">
            <Field value={profile.goalWeight} onChangeText={(t) => setProfile({ goalWeight: t.replace(/[^0-9.]/g, '') })} unit="lb" width={64} label="Goal weight in pounds" />
          </Row>
        </View>

        <ThemedText style={styles.sectionTitle}>Where you train</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <View style={styles.stack}>
            <ThemedText>Equipment</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Same 75 days for everyone. This only changes which movement fills each slot.
            </ThemedText>
            <View style={styles.chips}>
              {EQUIPMENT.map((e) => (
                <Chip key={e.id} on={profile.equipment === e.id} label={e.label} onPress={() => setProfile({ equipment: e.id })} />
              ))}
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              {EQUIPMENT.find((e) => e.id === profile.equipment)?.hint}
            </ThemedText>
          </View>
          <Divider />
          <View style={styles.stack}>
            <ThemedText>Cardio</ThemedText>
            <View style={styles.chips}>
              {CARDIO.map((c) => (
                <Chip key={c.id} on={profile.cardioMode === c.id} label={c.label} onPress={() => setProfile({ cardioMode: c.id })} />
              ))}
            </View>
          </View>
          <Divider />
          <Row label="Punching bag" hint="Offers bag rounds on Saturday conditioning">
            <Switch value={profile.hasHeavyBag} onValueChange={(on) => setProfile({ hasHeavyBag: on })} trackColor={{ true: theme.accent }} accessibilityLabel="Punching bag" />
          </Row>
        </View>

        <ThemedText style={styles.sectionTitle}>Work around</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <View style={styles.stack}>
            <ThemedText type="small" themeColor="textSecondary">
              Picks movements many people with these histories find more comfortable. Every original movement stays available as a swap. This is training preference, not medical advice.
            </ThemedText>
          </View>
          {LIMITATIONS.map((l) => (
            <View key={l.id}>
              <Divider />
              <Row label={l.label} hint={l.hint}>
                <Switch value={profile.limitations.includes(l.id)} onValueChange={() => toggleLimitation(l.id)} trackColor={{ true: theme.accent }} accessibilityLabel={l.label} />
              </Row>
            </View>
          ))}
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
              {WEEKDAYS.map((name, i) => (
                <Chip
                  key={name}
                  on={profile.weighInWeekdays.includes(i)}
                  label={name}
                  onPress={() =>
                    setProfile({
                      weighInWeekdays: profile.weighInWeekdays.includes(i)
                        ? profile.weighInWeekdays.filter((d) => d !== i)
                        : [...profile.weighInWeekdays, i].sort(),
                    })
                  }
                />
              ))}
            </View>
          </View>
        </View>

        <ThemedText style={styles.sectionTitle}>Reminders</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <Row label="Notifications" hint="A heads-up the night before and a nudge in the morning.">
            <Switch value={profile.notificationsEnabled} onValueChange={(on) => setProfile({ notificationsEnabled: on })} trackColor={{ true: theme.accent }} accessibilityLabel="Notifications" />
          </Row>
          <Divider />
          <Row label="Evening reminder" hint="“Tomorrow: Strength B, about 40 min”">
            <Stepper value={profile.eveningHour} onChange={(h) => setProfile({ eveningHour: h })} label="Evening reminder hour" />
          </Row>
          <Divider />
          <Row label="Morning reminder" hint="“Day 9: Conditioning is ready”">
            <Stepper value={profile.morningHour} onChange={(h) => setProfile({ morningHour: h })} label="Morning reminder hour" />
          </Row>
        </View>

        <ThemedText style={styles.sectionTitle}>Backup</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <Row label="Export backup" hint={`One file with everything: ${backupSummary({ days: onward.completed.length, weighIns: onward.bodyWeight.length, photos: onward.photos.length })}. Save it to iCloud Drive or email it to yourself.`}>
            <Pressable
              onPress={async () => {
                if (busy) return;
                setBusy(true);
                try {
                  const ok = await exportBackup();
                  if (!ok) Alert.alert('Can’t share here', 'Sharing isn’t available on this device.');
                } catch {
                  Alert.alert('Export failed', 'Something went wrong writing the backup. Try again.');
                } finally {
                  setBusy(false);
                }
              }}
              disabled={busy}
              accessibilityRole="button"
              style={({ pressed }) => [styles.button, { backgroundColor: theme.accent }, (pressed || busy) && { opacity: 0.7 }]}>
              <ThemedText type="smallBold" style={{ color: theme.accentText }}>
                Export
              </ThemedText>
            </Pressable>
          </Row>
          <Divider />
          <Row label="Restore from backup" hint="Replaces everything in the app with the backup. Export first if you want to keep what’s here.">
            <Pressable
              onPress={() =>
                Alert.alert('Restore a backup?', 'Everything currently in the app will be replaced by the backup file you choose.', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Choose file',
                    onPress: async () => {
                      if (busy) return;
                      setBusy(true);
                      try {
                        const r = await restoreBackup();
                        if (r.ok) {
                          await onward.reloadState();
                          Alert.alert('Restored', r.summary);
                        } else if (r.reason !== 'cancelled') {
                          Alert.alert('Nothing restored', r.reason);
                        }
                      } catch {
                        Alert.alert('Nothing restored', 'Something went wrong reading that file.');
                      } finally {
                        setBusy(false);
                      }
                    },
                  },
                ])
              }
              disabled={busy}
              accessibilityRole="button"
              style={({ pressed }) => [styles.button, styles.buttonOutline, { borderColor: theme.accent }, (pressed || busy) && { opacity: 0.7 }]}>
              <ThemedText type="smallBold" style={{ color: theme.accent }}>
                Restore
              </ThemedText>
            </Pressable>
          </Row>
        </View>

        <Pressable onPress={onward.restartOnboarding} hitSlop={8} accessibilityRole="button" style={styles.footerLink}>
          <ThemedText type="small" style={{ color: theme.accent }}>
            Run setup again
          </ThemedText>
        </Pressable>
        <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
          If you’ve been inactive for a long time or were told to limit activity, check with your doctor before starting.
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
          Onward · Consistency over perfection.
        </ThemedText>
      </ScrollView>
    </SafeAreaView>
  );
}

function Chip({ on, label, onPress }: { on: boolean; label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="checkbox" accessibilityState={{ checked: on }} style={[styles.chip, { backgroundColor: on ? theme.accent : theme.backgroundSelected }]}>
      <ThemedText type="smallBold" style={{ color: on ? theme.accentText : theme.textSecondary }}>
        {label}
      </ThemedText>
    </Pressable>
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
  content: { padding: Spacing.four, paddingBottom: Spacing.six * 2, gap: Spacing.two, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
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
  button: { minHeight: 44, borderRadius: 12, paddingHorizontal: Spacing.three, justifyContent: 'center', alignItems: 'center' },
  buttonOutline: { backgroundColor: 'transparent', borderWidth: 1.5 },
  footer: { textAlign: 'center', marginTop: Spacing.four },
  footerLink: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', marginTop: Spacing.four },
});
