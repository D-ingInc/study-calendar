
// src/domain/notification/NotificationService.ts

import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { StudySchedule } from '../../types/models';
import { IStudyScheduleRepository } from '../../data/repositories/interfaces';

export class NotificationService {
  private notificationIds: Map<string, string> = new Map();
  
  constructor(private scheduleRepository: IStudyScheduleRepository) {}

  /**
   * すべての予定の通知を設定
   */
  async setupAllNotifications(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const schedules = await this.scheduleRepository.findByDateRange(
      today,
      nextWeek.toISOString().split('T')[0]
    );
    
    for (const schedule of schedules) {
      if (schedule.isNotificationEnabled && !schedule.isCompleted) {
        await this.scheduleNotification(schedule);
      }
    }
  }

  /**
   * 個別の予定の通知を設定
   */
  async scheduleNotification(schedule: StudySchedule): Promise<void> {
    // 既存の通知をキャンセル
    await this.cancelNotification(schedule.id);
    
    if (!schedule.isNotificationEnabled || !schedule.notificationTime) {
      return;
    }
    
    const notificationDate = this.calculateNotificationTime(schedule);
    
    // 過去の時刻の場合はスキップ
    if (notificationDate <= new Date()) {
      return;
    }
    
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: '学習リマインダー',
        body: `「${schedule.title}」の時間が近づいています`,
        data: { scheduleId: schedule.id },
        sound: true,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        date: notificationDate,
      },
    });
    
    this.notificationIds.set(schedule.id, identifier);
  }

  /**
   * 通知をキャンセル
   */
  async cancelNotification(scheduleId: string): Promise<void> {
    const notificationId = this.notificationIds.get(scheduleId);
    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      this.notificationIds.delete(scheduleId);
    }
  }

  /**
   * 通知時刻を計算
   */
  private calculateNotificationTime(schedule: StudySchedule): Date {
    const scheduleDate = new Date(schedule.date);
    
    if (schedule.startTime) {
      const [hours, minutes] = schedule.startTime.split(':').map(Number);
      scheduleDate.setHours(hours, minutes, 0, 0);
    } else {
      // 時間指定がない場合は朝9時をデフォルトとする
      scheduleDate.setHours(9, 0, 0, 0);
    }
    
    // 通知時間分を引く
    const notificationTime = schedule.notificationTime || 30;
    return new Date(scheduleDate.getTime() - notificationTime * 60 * 1000);
  }

  /**
   * 習慣化のための定期通知を設定
   */
  async setupDailyReminder(hour: number, minute: number): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '今日も学習しましょう！',
        body: 'プログラミング学習の時間です',
        sound: true,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.CALENDAR,
        hour,
        minute,
        repeats: true,
      },
    });
  }

  /**
   * すべての通知をクリア
   */
  async clearAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    this.notificationIds.clear();
  }
}