import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MAX_FONT_SCALE, ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { nextMonday, type CardioMode, type Equipment, type Limitation, type Profile } from '@/data/profile';
import { PROGRAM_LENGTH_DAYS } from '@/data/program';
import { addDays, dateFromKey, isValidDateKey, todayKey } from '@/data/storage';
import { useOnward } from '@/hooks/use-onward';
import { useTheme } from '@/hooks/use-theme';

const EQUIPMENT: { id: Equipment; label: string; hint: string }[] = [
  { id: 'home', label: 'Home gym', hint: 'Dumbbells or kettlebells, a bench. A bar and rack if you have one.' },
  { id: 'gym', label: 'Full gym', hint: 'Barbells, machines, cables.' },
  { id: 'bodyweight', label: 'Bodyweight', hint: 'No equipment, or you travel a lot.' },
];
const CARDIO: { id: CardioMode; label: string }[] = [
  { id: 'bike', label: 'Bike' },
  { id: 'walk', label: 'Walk / jog' },
  { id: 'row', label: 'Rower' },
];
const LIMITATIONS: { id: Limitation; label: string; hint: string }[] = [
  { id: 'lower-back', label: 'Lower back', hint: 'Front-loaded squats, supported rows and bridges by default.' },
  { id: 'knee', label: 'Knees', hint: 'Box squats and step-ups by default.' },
  { id: 'shoulder', label: 'Shoulders', hint: 'Neutral-grip and angled pressing by default.' },
];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function hourLabel(h: number) {
  const suffix = h < 12 ? 'AM' : 'PM';
  return `${h % 12 === 0 ? 12 : h % 12}:00 ${suffix}`;
}
function pretty(date: string) {
  return dateFromKey(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

/**
 * First-open setup. Six screens, one question each, every answer pre-filled
 * so it can be tapped through in under a minute. Also used for "Run setup
 * again" from Settings.
 */
export function Onboarding() {
  const theme = useTheme();
  const onward = useOnward();
  const [step, setStep] = useState(0);
  const [p, setP] = useState<Profile>(() => ({
    ...onward.profile,
    programStartDate: onward.onboarded ? onward.profile.programStartDate : nextMonday(),
  }));
  const [customStart, setCustomStart] = useState('');
  const patch = (x: Partial<Profile>) => setP((prev) => ({ ...prev, ...x }));

  const today = todayKey();
  const upcoming = nextMonday();
  const lastMonday = addDays(upcoming, -7);
  const customValid = isValidDateKey(customStart);

  const steps = [
    // 0 Welcome
    <View key="welcome" style={styles.center}>
      <Image source={require('@/assets/images/splash-icon.png')} style={styles.mark} contentFit="contain" accessibilityIgnoresInvertColors accessible={false} />
      <ThemedText style={styles.title} accessibilityRole="header">
        Onward
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.centerText}>
        A {PROGRAM_LENGTH_DAYS}-day comeback for people getting back into shape after time away. Three strength sessions a week, two conditioning, one easy day, one rest.
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.centerText}>
        You don’t restart. You adjust. Missed a day? Onward.
      </ThemedText>
      <TextInput
        value={p.name}
        onChangeText={(t) => patch({ name: t })}
        placeholder="Your first name (optional)"
        placeholderTextColor={theme.textSecondary}
        autoCapitalize="words"
        returnKeyType="done"
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.backgroundElement }]}
        accessibilityLabel="Your first name"
      />
    </View>,

    // 1 Start date
    <View key="start" style={styles.stack}>
      <ThemedText style={styles.title} accessibilityRole="header">
        When is Day 1?
      </ThemedText>
      <ThemedText themeColor="textSecondary">Day 1 is a Monday, so rest days land on Sundays. The program follows the calendar from there.</ThemedText>
      <Option on={p.programStartDate === upcoming} title={`Next Monday, ${pretty(upcoming)}`} hint="Recommended. A few days to get set up." onPress={() => patch({ programStartDate: upcoming })} />
      <Option on={p.programStartDate === lastMonday} title={`This week, started ${pretty(lastMonday)}`} hint={`You’d be on Day ${Math.max(1, Math.round((dateFromKey(today).getTime() - dateFromKey(lastMonday).getTime()) / 86_400_000) + 1)} today. Fine if you’ve already begun.`} onPress={() => patch({ programStartDate: lastMonday })} />
      <View style={[styles.optionRow, { borderColor: theme.border }]}>
        <View style={styles.optionText}>
          <ThemedText>Another date</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {customStart && !customValid ? 'Use the form 2026-10-12' : 'YYYY-MM-DD'}
          </ThemedText>
        </View>
        <TextInput
          value={customStart}
          onChangeText={(t) => {
            setCustomStart(t);
            if (isValidDateKey(t)) patch({ programStartDate: t });
          }}
          placeholder="2026-10-12"
          placeholderTextColor={theme.textSecondary}
          keyboardType="numbers-and-punctuation"
          returnKeyType="done"
          maxLength={10}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          style={[styles.dateInput, { color: customStart && !customValid ? theme.danger : theme.text, borderColor: customStart && !customValid ? theme.danger : theme.border, backgroundColor: theme.backgroundElement }]}
          accessibilityLabel="Another start date, year dash month dash day"
        />
      </View>
    </View>,

    // 2 Where you train
    <View key="where" style={styles.stack}>
      <ThemedText style={styles.title} accessibilityRole="header">
        Where will you train?
      </ThemedText>
      <ThemedText themeColor="textSecondary">Same program either way. This only changes which movement fills each slot.</ThemedText>
      {EQUIPMENT.map((e) => (
        <Option key={e.id} on={p.equipment === e.id} title={e.label} hint={e.hint} onPress={() => patch({ equipment: e.id })} />
      ))}
      <ThemedText style={styles.subTitle}>Cardio you have</ThemedText>
      <View style={styles.chips}>
        {CARDIO.map((c) => (
          <Chip key={c.id} on={p.cardioMode === c.id} label={c.label} onPress={() => patch({ cardioMode: c.id })} />
        ))}
      </View>
      <Row label="Punching bag" hint="Adds bag rounds to Saturday conditioning">
        <Switch value={p.hasHeavyBag} onValueChange={(on) => patch({ hasHeavyBag: on })} trackColor={{ true: theme.accent }} accessibilityLabel="Punching bag" accessibilityHint="Adds bag rounds to Saturday conditioning" />
      </Row>
    </View>,

    // 3 Work around
    <View key="limits" style={styles.stack}>
      <ThemedText style={styles.title} accessibilityRole="header">
        Anything to work around?
      </ThemedText>
      <ThemedText themeColor="textSecondary">
        Picks movements many people with these histories find more comfortable. Every original movement stays available as a swap. Training preference, not medical advice.
      </ThemedText>
      {LIMITATIONS.map((l) => (
        <Row key={l.id} label={l.label} hint={l.hint}>
          <Switch
            value={p.limitations.includes(l.id)}
            onValueChange={(on) => patch({ limitations: on ? [...p.limitations, l.id] : p.limitations.filter((x) => x !== l.id) })}
            trackColor={{ true: theme.accent }}
            accessibilityLabel={`Work around ${l.label.toLowerCase()}`}
            accessibilityHint={l.hint}
          />
        </Row>
      ))}
      <ThemedText type="small" themeColor="textSecondary">
        If you’ve been inactive for a long time or were told to limit activity, check with your doctor before starting.
      </ThemedText>
    </View>,

    // 4 Goal and weigh-ins
    <View key="goal" style={styles.stack}>
      <ThemedText style={styles.title} accessibilityRole="header">
        A weight goal?
      </ThemedText>
      <ThemedText themeColor="textSecondary">Optional. The chart shows a steady 0.5–1 lb a week pace, which is what realistic looks like.</ThemedText>
      <View style={[styles.optionRow, { borderColor: theme.border }]}>
        <ThemedText style={styles.optionText}>Goal weight</ThemedText>
        <View style={[styles.unitBox, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
          <TextInput
            value={p.goalWeight}
            onChangeText={(t) => patch({ goalWeight: t.replace(/[^0-9.]/g, '') })}
            placeholder="–"
            placeholderTextColor={theme.textSecondary}
            keyboardType="decimal-pad"
            returnKeyType="done"
            maxLength={6}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
            style={[styles.unitInput, { color: theme.text }]}
            accessibilityLabel="Goal weight in pounds"
          />
          <ThemedText type="small" themeColor="textSecondary">
            lb
          </ThemedText>
        </View>
      </View>
      <ThemedText style={styles.subTitle}>Weigh-in days</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        The app prompts for a morning weight on these days. You can log on any day.
      </ThemedText>
      <View style={styles.chips}>
        {WEEKDAYS.map((name, i) => (
          <Chip
            key={name}
            on={p.weighInWeekdays.includes(i)}
            label={name}
            onPress={() => patch({ weighInWeekdays: p.weighInWeekdays.includes(i) ? p.weighInWeekdays.filter((d) => d !== i) : [...p.weighInWeekdays, i].sort() })}
          />
        ))}
      </View>
    </View>,

    // 5 Reminders
    <View key="reminders" style={styles.stack}>
      <ThemedText style={styles.title} accessibilityRole="header">
        Reminders
      </ThemedText>
      <ThemedText themeColor="textSecondary">A heads-up the night before and a nudge in the morning. Never about a missed day. Change them any time in Settings.</ThemedText>
      <Row label="Notifications">
        <Switch value={p.notificationsEnabled} onValueChange={(on) => patch({ notificationsEnabled: on })} trackColor={{ true: theme.accent }} accessibilityLabel="Notifications" />
      </Row>
      <Row label="Evening" hint="“Tomorrow: Strength B, about 40 min”">
        <Stepper value={p.eveningHour} onChange={(h) => patch({ eveningHour: h })} label="Evening reminder hour" />
      </Row>
      <Row label="Morning" hint="“Day 9: Conditioning is ready”">
        <Stepper value={p.morningHour} onChange={(h) => patch({ morningHour: h })} label="Morning reminder hour" />
      </Row>
    </View>,
  ];

  const last = step === steps.length - 1;
  const canNext = step !== 1 || isValidDateKey(p.programStartDate);

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <View style={styles.dots} accessible accessibilityRole="progressbar" accessibilityLabel={`Setup step ${step + 1} of ${steps.length}`} accessibilityValue={{ min: 1, max: steps.length, now: step + 1 }}>
          {steps.map((_, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: i <= step ? theme.accent : theme.backgroundSelected }]} />
          ))}
        </View>
        {steps[step]}
      </ScrollView>
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        {step > 0 ? (
          <Pressable onPress={() => setStep(step - 1)} hitSlop={8} accessibilityRole="button" style={styles.back}>
            <ThemedText themeColor="textSecondary">Back</ThemedText>
          </Pressable>
        ) : (
          <View style={styles.back} />
        )}
        <Pressable
          onPress={() => (last ? onward.finishOnboarding(p) : setStep(step + 1))}
          disabled={!canNext}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canNext }}
          accessibilityHint={canNext ? undefined : 'Enter a valid Day 1 date first'}
          style={({ pressed }) => [styles.next, { backgroundColor: theme.accent }, (pressed || !canNext) && { opacity: 0.7 }]}>
          <ThemedText style={[styles.nextLabel, { color: theme.accentText }]}>{last ? 'Start' : step === 0 ? 'Get started' : 'Next'}</ThemedText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Option({ on, title, hint, onPress }: { on: boolean; title: string; hint?: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: on }}
      style={({ pressed }) => [styles.optionRow, { borderColor: on ? theme.accent : theme.border, backgroundColor: on ? theme.accentSoft : 'transparent' }, pressed && { opacity: 0.7 }]}>
      <View style={styles.optionText}>
        <ThemedText type="smallBold">{title}</ThemedText>
        {hint && (
          <ThemedText type="small" themeColor="textSecondary">
            {hint}
          </ThemedText>
        )}
      </View>
    </Pressable>
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
  const theme = useTheme();
  return (
    <View style={[styles.optionRow, { borderColor: theme.border }]}>
      <View style={styles.optionText}>
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

function Stepper({ value, onChange, label }: { value: number; onChange: (h: number) => void; label: string }) {
  return (
    <View style={styles.stepper}>
      <Pressable onPress={() => onChange((value + 23) % 24)} hitSlop={8} accessibilityRole="button" accessibilityLabel={`${label}, one hour earlier`} style={styles.stepButton}>
        <ThemedText style={styles.stepArrow}>‹</ThemedText>
      </Pressable>
      <ThemedText style={styles.stepValue} accessibilityLabel={`${label}: ${hourLabel(value)}`}>
        {hourLabel(value)}
      </ThemedText>
      <Pressable onPress={() => onChange((value + 1) % 24)} hitSlop={8} accessibilityRole="button" accessibilityLabel={`${label}, one hour later`} style={styles.stepButton}>
        <ThemedText style={styles.stepArrow}>›</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.three, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', flexGrow: 1 },
  dots: { flexDirection: 'row', gap: Spacing.one, marginBottom: Spacing.two },
  dot: { width: 28, height: 4, borderRadius: 2 },
  center: { alignItems: 'center', gap: Spacing.three, paddingTop: Spacing.five },
  centerText: { textAlign: 'center', lineHeight: 24 },
  mark: { width: 96, height: 96 },
  stack: { gap: Spacing.three },
  title: { fontSize: 30, lineHeight: 36, fontWeight: 700 },
  subTitle: { fontSize: 18, lineHeight: 24, fontWeight: 700, marginTop: Spacing.two },
  input: { borderWidth: 1, borderRadius: 12, minHeight: 52, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, fontSize: 18, alignSelf: 'stretch', textAlign: 'center' },
  optionRow: { borderWidth: 1.5, borderRadius: 14, padding: Spacing.three, flexDirection: 'row', alignItems: 'center', gap: Spacing.three, minHeight: 60, flexWrap: 'wrap' },
  optionText: { flex: 1, minWidth: 140, gap: 2 },
  dateInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: Spacing.two, minHeight: 44, minWidth: 132, fontSize: 16, fontWeight: 600, textAlign: 'center', paddingVertical: Spacing.one },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: { borderRadius: 999, paddingHorizontal: Spacing.three, minHeight: 40, justifyContent: 'center' },
  unitBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, borderWidth: 1, borderRadius: 10, paddingHorizontal: Spacing.two, minHeight: 44 },
  unitInput: { minWidth: 64, fontSize: 18, fontWeight: 600, textAlign: 'right', paddingVertical: Spacing.one },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  stepButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  stepArrow: { fontSize: 28, lineHeight: 32 },
  stepValue: { fontSize: 16, fontWeight: 600, minWidth: 76, textAlign: 'center' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.three, borderTopWidth: StyleSheet.hairlineWidth, gap: Spacing.three },
  back: { minWidth: 64, minHeight: 48, justifyContent: 'center' },
  next: { flex: 1, minHeight: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  nextLabel: { fontSize: 18, fontWeight: 700 },
});
