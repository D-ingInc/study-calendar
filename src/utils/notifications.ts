
// src/utils/notifications.ts

import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { StudySchedule } from '../types/models';

// 通知をスケジュール
export async function scheduleNotification(schedule: StudySchedule) {
  if (!schedule.isNotificationEnabled || !schedule.notificationTime) {
    return;
  }

  // 通知時刻を計算
  const scheduleDate = new Date(schedule.date);
  if (schedule.startTime) {
    const [hours, minutes] = schedule.startTime.split(':').map(Number);
    scheduleDate.setHours(hours, minutes, 0, 0);
  }

  const notificationDate = new Date(
    scheduleDate.getTime() - schedule.notificationTime * 60 * 1000
  );

  // 過去の時刻の場合はスキップ
  if (notificationDate <= new Date()) {
    return;
  }

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: '学習リマインダー',
      body: `${schedule.title}の時間です`,
      data: { scheduleId: schedule.id },
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DATE,
      date: notificationDate,
    },
  });

  return identifier;
}

// 通知をキャンセル
export async function cancelNotification(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

// 定期的な通知を設定（習慣化支援）
export async function setupDailyReminder(hour: number, minute: number) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '今日も学習しましょう！',
      body: 'プログラミング学習の時間です',
    },
    trigger: {
      type: SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute,
      repeats: true,
    },
  });
}