import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Vibration, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const PRESETS = [60, 90, 120];

/** Between-sets rest timer: tap a preset to start, tap the clock to stop */
export function RestTimer() {
  const theme = useTheme();
  // Seconds left; null when idle
  const [remaining, setRemaining] = useState<number | null>(null);

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
    <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <View style={styles.row}>
        <View style={styles.text}>
          <ThemedText>Rest timer</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {running ? 'Tap the clock to stop.' : 'Buzzes when it’s time for the next set.'}
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
});
