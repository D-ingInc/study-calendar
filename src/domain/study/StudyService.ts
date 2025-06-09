// src/domain/study/StudyService.ts

import { StudyCategory } from '../../types/models';
import { 
  IStudyScheduleRepository, 
  IStudyRecordRepository 
} from '../../data/repositories/interfaces';

export class StudyService {
  constructor(
    private scheduleRepository: IStudyScheduleRepository,
    private recordRepository: IStudyRecordRepository
  ) {}

  /**
   * 学習予定が重複していないかチェック
   */
  async checkScheduleConflict(
    date: string,
    startTime?: string,
    endTime?: string,
    excludeId?: string
  ): Promise<boolean> {
    if (!startTime || !endTime) {
      return false; // 時間指定がない場合は重複チェックしない
    }

    const schedules = await this.scheduleRepository.findByDate(date);
    
    return schedules.some(schedule => {
      if (schedule.id === excludeId) return false;
      if (!schedule.startTime || !schedule.endTime) return false;
      
      // 時間の重複をチェック
      const newStart = this.timeToMinutes(startTime);
      const newEnd = this.timeToMinutes(endTime);
      const existStart = this.timeToMinutes(schedule.startTime);
      const existEnd = this.timeToMinutes(schedule.endTime);
      
      return (
        (newStart >= existStart && newStart < existEnd) ||
        (newEnd > existStart && newEnd <= existEnd) ||
        (newStart <= existStart && newEnd >= existEnd)
      );
    });
  }

  /**
   * 今日の学習時間を取得
   */
  async getTodayStudyTime(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const records = await this.recordRepository.findByDateRange(today, today);
    
    return records.reduce((total, record) => total + record.duration, 0);
  }

  /**
   * カテゴリ別の学習時間を集計
   */
  async getStudyTimeByCategory(
    startDate: string,
    endDate: string
  ): Promise<Record<StudyCategory, number>> {
    const records = await this.recordRepository.findByDateRange(startDate, endDate);
    const schedules = await this.scheduleRepository.findByDateRange(startDate, endDate);
    
    const result: Record<StudyCategory, number> = {
      [StudyCategory.PYTHON]: 0,
      [StudyCategory.AI_LITERACY]: 0,
      [StudyCategory.PROMPT_ENGINEERING]: 0,
    };
    
    for (const record of records) {
      const schedule = schedules.find(s => s.id === record.scheduleId);
      if (schedule) {
        result[schedule.category] += record.duration;
      }
    }
    
    return result;
  }

  /**
   * 学習の達成率を計算
   */
  async getCompletionRate(startDate: string, endDate: string): Promise<number> {
    const schedules = await this.scheduleRepository.findByDateRange(startDate, endDate);
    
    if (schedules.length === 0) return 0;
    
    const completed = schedules.filter(s => s.isCompleted).length;
    return Math.round((completed / schedules.length) * 100);
  }

  /**
   * 推奨学習時間を提案
   */
  async suggestStudyDuration(category: StudyCategory): Promise<number> {
    // 過去30日間の同じカテゴリの平均学習時間を計算
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const records = await this.recordRepository.findByDateRange(
      thirtyDaysAgo.toISOString().split('T')[0],
      new Date().toISOString().split('T')[0]
    );
    
    const categoryRecords = [];
    for (const record of records) {
      const schedule = await this.scheduleRepository.findById(record.scheduleId);
      if (schedule && schedule.category === category) {
        categoryRecords.push(record);
      }
    }
    
    if (categoryRecords.length === 0) {
      // デフォルト値を返す
      return category === StudyCategory.PYTHON ? 90 : 60;
    }
    
    const totalDuration = categoryRecords.reduce((sum, r) => sum + r.duration, 0);
    return Math.round(totalDuration / categoryRecords.length);
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}