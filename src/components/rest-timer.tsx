import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Vibration } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Pull the first number of seconds out of a rest string like "90–120 s" or "2–3 min" */
export function restSeconds(rest: string): number {
  const m = rest.match(/(\d+)/);
  if (!m) return 90;
  const n = parseInt(m[1], 10);
  return rest.includes('min') ? n * 60 : n;
}

type Props = {
  /** Change this to start a countdown (each movement has its own Rest button) */
  kick?: { seconds: number; nonce: number };
};

/**
 * Floating rest countdown. Started from a movement's Rest button; tap the
 * pill to stop early. Buzzes at zero.
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

  if (remaining === null) return null;
  const mm = Math.floor(remaining / 60);
  const ss = String(remaining % 60).padStart(2, '0');

  return (
    <Pressable onPress={() => setRemaining(null)} accessibilityRole="button" accessibilityLabel="Stop rest timer" style={[styles.pill, { backgroundColor: theme.accent }]}>
      <ThemedText style={[styles.pillText, { color: theme.accentText }]}>
        {remaining === 0 ? 'Go' : `Rest ${mm}:${ss}`}
      </ThemedText>
      <ThemedText type="small" style={{ color: theme.accentText, opacity: 0.8 }}>
        tap to stop
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    top: Spacing.two,
    alignSelf: 'center',
    borderRadius: 999,
    paddingHorizontal: Spacing.four,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  pillText: { fontSize: 18, fontWeight: 700, fontVariant: ['tabular-nums'] },
});
