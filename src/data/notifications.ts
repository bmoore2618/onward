import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Profile } from '@/data/profile';
import { PROGRAM_LENGTH_DAYS, sessionForDay, type Swaps } from '@/data/program';
import { addDays, dateFromKey, daysBetween, todayKey } from '@/data/storage';

/** How many days ahead to schedule. iOS allows 64 pending; 2 per day keeps us well under. */
const DAYS_AHEAD = 14;

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
 *   evening (default 8 PM): "Tomorrow: Strength B, about 45 min"
 *   morning (default 7 AM): "Day 9: Peloton Conditioning is ready"
 * Called whenever the app opens or settings change, so the schedule never runs dry.
 */
export async function syncNotifications(profile: Profile, swaps: Swaps): Promise<void> {
  if (Platform.OS === 'web') return;

  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!profile.notificationsEnabled) return;
  if (!(await requestNotificationPermission())) return;

  const now = new Date();
  const today = todayKey(now);

  for (let i = 0; i < DAYS_AHEAD; i++) {
    const date = addDays(today, i);
    const day = daysBetween(profile.programStartDate, date) + 1;

    // Morning: today's session
    if (day >= 1 && day <= PROGRAM_LENGTH_DAYS) {
      const session = sessionForDay(day, profile, swaps);
      const at = dateFromKey(date);
      at.setHours(profile.morningHour, 0, 0, 0);
      if (at > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Day ${day}: ${session.title}`,
            body:
              session.kind === 'rest'
                ? 'Rest day. Easy walking is fine. See you tomorrow.'
                : `${session.length}. Today's session is ready when you are.`,
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at },
        });
      }
    }

    // Evening: tomorrow's session
    const tomorrowDay = day + 1;
    if (tomorrowDay >= 1 && tomorrowDay <= PROGRAM_LENGTH_DAYS) {
      const next = sessionForDay(tomorrowDay, profile, swaps);
      const at = dateFromKey(date);
      at.setHours(profile.eveningHour, 0, 0, 0);
      if (at > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Tomorrow: ${next.title}`,
            body:
              next.kind === 'rest'
                ? `Day ${tomorrowDay} is a full rest day.`
                : `Day ${tomorrowDay}, ${next.length}.`,
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at },
        });
      }
    }
  }
}
