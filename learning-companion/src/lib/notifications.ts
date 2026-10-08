import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { LearningState } from './types';
import { lessons } from './content';
import { availableLesson, reminderPlan } from './planner';
Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }) });
export async function requestReminders() {
  if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('learning', { name: 'Learning reminders', importance: Notifications.AndroidImportance.DEFAULT });
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) return true;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted || next.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}
export async function reconcileReminders(state: LearningState) {
  const existing = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(existing.filter(n => n.identifier.startsWith('learning-')).map(n => Notifications.cancelScheduledNotificationAsync(n.identifier)));
  if (!state.settings.reminders) return 0;
  const permission = await Notifications.getPermissionsAsync();
  if (!(permission.granted || permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL)) throw new Error('Reminder permission is disabled in your phone settings.');
  const plan = reminderPlan(availableLesson(lessons, state), state);
  for (const item of plan) await Notifications.scheduleNotificationAsync({ identifier: item.id, content: { title: item.title, body: item.body, data: { lessonId: item.lessonId } }, trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: item.date, channelId: 'learning' } });
  return plan.length;
}
export async function testReminder() {
  if (!await requestReminders()) throw new Error('Notification permission was not granted.');
  await Notifications.scheduleNotificationAsync({ identifier: 'learning-test', content: { title: 'Your learning reminder', body: 'Open AI Learning to watch, build and recall.' }, trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 10, channelId: 'learning' } });
}
export function listenForLessons(onLesson: (id: string) => void) {
  const handle = (r: Notifications.NotificationResponse | null) => {
    const id = r?.notification.request.content.data?.lessonId;
    if (typeof id === 'string' && lessons.some(l => l.id === id)) { onLesson(id); void Notifications.clearLastNotificationResponseAsync(); }
  };
  void Notifications.getLastNotificationResponseAsync().then(handle);
  const subscription = Notifications.addNotificationResponseReceivedListener(handle);
  return () => subscription.remove();
}
