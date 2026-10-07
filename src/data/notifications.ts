import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Profile } from '@/data/profile';
import { PROGRAM_LENGTH_DAYS, type Session } from '@/data/program';
import { addDays, dateFromKey, daysBetween, todayKey } from '@/data/storage';

/** How many days ahead to schedule. iOS allows 64 pending; ~2 per day keeps us well under. */
const DAYS_AHEAD = 14;

type WeekNumbers = { week: number; workoutsDone: number; trainingDays: number; weightChange: number | null };

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

/**
 * Replace all scheduled reminders with the next two weeks:
 *   evening (default 8 PM): "Tomorrow: Strength B, about 40 min"
 *   morning (default 7 AM): "Day 9: Conditioning is ready"
 *   Sunday morning: the week's numbers, using what's logged at the time of scheduling
 * Called whenever the app opens or the data changes, so the schedule never runs dry.
 */
export async function syncNotifications(
  profile: Profile,
  sessionFor: (day: number) => Session,
  weekSummary: (date: string) => WeekNumbers
): Promise<void> {
  if (Platform.OS === 'web') return;

  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!profile.notificationsEnabled) return;
  if (!(await requestNotificationPermission())) return;

  const now = new Date();
  const today = todayKey(now);

  for (let i = 0; i < DAYS_AHEAD; i++) {
    const date = addDays(today, i);
    const day = daysBetween(profile.programStartDate, date) + 1;

    // Morning: today's session (or the week wrap on rest days)
    if (day >= 1 && day <= PROGRAM_LENGTH_DAYS) {
      const session = sessionFor(day);
      const at = dateFromKey(date);
      at.setHours(profile.morningHour, 0, 0, 0);
      if (at > now) {
        let title = `Day ${day}: ${session.title}`;
        let body = `${session.length}. Today's session is ready when you are.`;
        if (session.kind === 'rest') {
          const w = weekSummary(date);
          const change = w.weightChange === null ? '' : `, ${w.weightChange > 0 ? '+' : ''}${w.weightChange} lb`;
          title = `Week ${w.week} wrap`;
          body = `${w.workoutsDone} of ${w.trainingDays} workouts${change}. Rest day today. Monday is a clean start.`;
        }
        await Notifications.scheduleNotificationAsync({
          content: { title, body },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at },
        });
      }
    }

    // Evening: tomorrow's session
    const tomorrowDay = day + 1;
    if (tomorrowDay >= 1 && tomorrowDay <= PROGRAM_LENGTH_DAYS) {
      const next = sessionFor(tomorrowDay);
      const at = dateFromKey(date);
      at.setHours(profile.eveningHour, 0, 0, 0);
      if (at > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Tomorrow: ${next.title}`,
            body: next.kind === 'rest' ? `Day ${tomorrowDay} is a full rest day.` : `Day ${tomorrowDay}, ${next.length}.`,
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at },
        });
      }
    }
  }
}
