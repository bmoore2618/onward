import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Vibration, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const PRESETS = [60, 90, 120];

/** Pull the first number of seconds out of a rest string like "90–120 s" or "2–3 min" */
export function restSeconds(rest: string): number {
  const m = rest.match(/(\d+)/);
  if (!m) return 90;
  const n = parseInt(m[1], 10);
  return rest.includes('min') ? n * 60 : n;
}

type Props = {
  /** Change this to auto-start a countdown (e.g. after logging a set) */
  kick?: { seconds: number; nonce: number };
};

/**
 * Between-sets rest timer. Tap a preset to start, tap the clock to stop.
 * While running it also shows as a floating pill so it stays visible
 * when you scroll back up to the exercise list.
 */
export function RestTimer({ kick }: Props) {
  const theme = useTheme();
  // Seconds left; null when idle
  const [remaining, setRemaining] = useState<number | null>(null);
  const [seenKick, setSeenKick] = useState(kick?.nonce ?? 0);
  if (kick && kick.nonce !== seenKick) {
    setSeenKick(kick.nonce);
    setRemaining(kick.seconds);
  }

  useEffect(() => {
    if (remaining === null) return;
    if (remaining === 0) {
      Vibration.vibrate([0, 300, 150, 300]);
      const t = setTimeout(() => setRemaining(null), 1500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setRemaining(remaining - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  const running = remaining !== null;
  const mm = Math.floor((remaining ?? 0) / 60);
  const ss = String((remaining ?? 0) % 60).padStart(2, '0');

  return (
    <>
      <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
        <View style={styles.row}>
          <View style={styles.text}>
            <ThemedText>Rest timer</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {running ? 'Tap the clock to stop.' : 'Starts itself when you log a set. Buzzes when it’s time.'}
            </ThemedText>
          </View>
          {running ? (
            <Pressable onPress={() => setRemaining(null)} accessibilityRole="button" accessibilityLabel="Stop rest timer" style={[styles.clock, { backgroundColor: theme.accent }]}>
              <ThemedText style={[styles.clockText, { color: theme.accentText }]}>
                {mm}:{ss}
              </ThemedText>
            </Pressable>
          ) : (
            <View style={styles.presets}>
              {PRESETS.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setRemaining(s)}
                  accessibilityRole="button"
                  accessibilityLabel={`Start ${s} second rest`}
                  style={({ pressed }) => [styles.preset, { borderColor: theme.accent }, pressed && { opacity: 0.6 }]}>
                  <ThemedText type="smallBold" style={{ color: theme.accent }}>
                    {s}s
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>
      {running && (
        <Pressable onPress={() => setRemaining(null)} accessibilityRole="button" accessibilityLabel="Stop rest timer" style={[styles.pill, { backgroundColor: theme.accent }]}>
          <ThemedText type="smallBold" style={{ color: theme.accentText }}>
            Rest {mm}:{ss}
          </ThemedText>
        </Pressable>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, paddingHorizontal: Spacing.three, marginTop: Spacing.three },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, minHeight: 72 },
  text: { flex: 1, gap: 2 },
  presets: { flexDirection: 'row', gap: Spacing.one },
  preset: { minWidth: 48, height: 44, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.one },
  clock: { minWidth: 92, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.three },
  clockText: { fontSize: 22, fontWeight: 700, fontVariant: ['tabular-nums'] },
  pill: {
    position: 'absolute',
    top: Spacing.two,
    alignSelf: 'center',
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    height: 40,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
