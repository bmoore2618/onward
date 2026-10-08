import { useEffect, useState } from 'react';
import { Vibration } from 'react-native';

/** Pull the first number of seconds out of a rest string like "90–120 s" or "2–3 min" */
export function restSeconds(rest: string): number {
  const m = rest.match(/(\d+)/);
  if (!m) return 90;
  const n = parseInt(m[1], 10);
  return rest.includes('min') ? n * 60 : n;
}

/**
 * One rest countdown at a time, tied to the movement it was started from so
 * the screen can show it in place. Buzzes at zero.
 */
export function useRestTimer() {
  const [timer, setTimer] = useState<{ movementId: string; remaining: number } | null>(null);

  useEffect(() => {
    if (!timer) return;
    if (timer.remaining === 0) {
      Vibration.vibrate([0, 300, 150, 300]);
      const t = setTimeout(() => setTimer(null), 1500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setTimer({ ...timer, remaining: timer.remaining - 1 }), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  return {
    /** Movement whose timer is running, if any */
    activeId: timer?.movementId ?? null,
    /** "1:29", or "Go" at zero */
    label: timer ? (timer.remaining === 0 ? 'Go' : `${Math.floor(timer.remaining / 60)}:${String(timer.remaining % 60).padStart(2, '0')}`) : '',
    start: (movementId: string, seconds: number) => setTimer({ movementId, remaining: seconds }),
    stop: () => setTimer(null),
  };
}
