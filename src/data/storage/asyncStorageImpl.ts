// src/data/storage/asyncStorageImpl.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  StudySchedule, 
  StudyRecord, 
  Prompt, 
  AppSettings,
  NotificationTime,
  StudyCategory,
  PromptLabel,
  StudyStatistics,
  RepeatType,
} from '../../types/models';
import {
  IStudyScheduleRepository,
  IStudyRecordRepository,
  IPromptRepository,
  IStatisticsRepository,
  ISettingsRepository,
} from '../repositories/interfaces';

// ストレージキー
const STORAGE_KEYS = {
  STUDY_SCHEDULES: '@StudyCalendar:schedules',
  STUDY_RECORDS: '@StudyCalendar:records',
  PROMPTS: '@StudyCalendar:prompts',
  SETTINGS: '@StudyCalendar:settings',
  STATISTICS_CACHE: '@StudyCalendar:statistics',
} as const;

// ベースストレージクラス
abstract class BaseAsyncStorage<T extends { id: string }> {
  constructor(protected storageKey: string) {}

  protected async getAll(): Promise<T[]> {
    try {
      const data = await AsyncStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading from ${this.storageKey}:`, error);
      return [];
    }
  }

  protected async saveAll(items: T[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (error) {
      console.error(`Error writing to ${this.storageKey}:`, error);
      throw error;
    }
  }

  protected generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  protected getCurrentTimestamp(): string {
    return new Date().toISOString();
  }
}

// 学習予定リポジトリ実装
export class StudyScheduleRepository 
  extends BaseAsyncStorage<StudySchedule> 
  implements IStudyScheduleRepository {
  
  constructor() {
    super(STORAGE_KEYS.STUDY_SCHEDULES);
  }

  async create(schedule: Omit<StudySchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<StudySchedule> {
    const schedules = await this.getAll();
    const newSchedule: StudySchedule = {
      ...schedule,
      id: this.generateId(),
      createdAt: this.getCurrentTimestamp(),
      updatedAt: this.getCurrentTimestamp(),
    };
    
    schedules.push(newSchedule);
    await this.saveAll(schedules);
    return newSchedule;
  }

  async update(id: string, schedule: Partial<StudySchedule>): Promise<StudySchedule> {
    const schedules = await this.getAll();
    const index = schedules.findIndex(s => s.id === id);
    
    if (index === -1) {
      throw new Error(`Schedule with id ${id} not found`);
    }
    
    schedules[index] = {
      ...schedules[index],
      ...schedule,
      id, // IDは変更不可
      updatedAt: this.getCurrentTimestamp(),
    };
    
    await this.saveAll(schedules);
    return schedules[index];
  }

  async delete(id: string): Promise<void> {
    const schedules = await this.getAll();
    const filtered = schedules.filter(s => s.id !== id);
    await this.saveAll(filtered);
  }

  async findById(id: string): Promise<StudySchedule | null> {
    const schedules = await this.getAll();
    return schedules.find(s => s.id === id) || null;
  }

  async findByDate(date: string): Promise<StudySchedule[]> {
    const schedules = await this.getAll();
    return schedules.filter(s => s.date === date);
  }

  async findByDateRange(startDate: string, endDate: string): Promise<StudySchedule[]> {
    const schedules = await this.getAll();
    return schedules.filter(s => s.date >= startDate && s.date <= endDate);
  }

  async findByCategory(category: StudyCategory): Promise<StudySchedule[]> {
    const schedules = await this.getAll();
    return schedules.filter(s => s.category === category);
  }

  async findUpcoming(limit: number = 10): Promise<StudySchedule[]> {
    const schedules = await this.getAll();
    const now = new Date().toISOString();
    
    return schedules
      .filter(s => {
        const scheduleDateTime = s.startTime 
          ? `${s.date}T${s.startTime}` 
          : `${s.date}T00:00:00`;
        return scheduleDateTime >= now && !s.isCompleted;
      })
      .sort((a, b) => {
        const aTime = a.startTime ? `${a.date}T${a.startTime}` : `${a.date}T00:00:00`;
        const bTime = b.startTime ? `${b.date}T${b.startTime}` : `${b.date}T00:00:00`;
        return aTime.localeCompare(bTime);
      })
      .slice(0, limit);
  }

  async expandRepeatingSchedules(startDate: string, endDate: string): Promise<StudySchedule[]> {
    const schedules = await this.getAll();
    const expanded: StudySchedule[] = [];
    
    for (const schedule of schedules) {
      if (!schedule.repeatPattern || schedule.repeatPattern.type === RepeatType.NONE) {
        if (schedule.date >= startDate && schedule.date <= endDate) {
          expanded.push(schedule);
        }
        continue;
      }
      
      // 繰り返し予定の展開ロジック
      const dates = this.generateRepeatDates(schedule, startDate, endDate);
      for (const date of dates) {
        expanded.push({
          ...schedule,
          date,
          id: `${schedule.id}_${date}`, // 仮想ID
        });
      }
    }
    
    return expanded.sort((a, b) => a.date.localeCompare(b.date));
  }

  private generateRepeatDates(schedule: StudySchedule, startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const { repeatPattern } = schedule;
    
    if (!repeatPattern) return dates;
    
    let currentDate = new Date(schedule.date);
    const end = new Date(endDate);
    const patternEnd = repeatPattern.endDate ? new Date(repeatPattern.endDate) : end;
    
    while (currentDate <= end && currentDate <= patternEnd) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      if (dateStr >= startDate) {
        dates.push(dateStr);
      }
      
      switch (repeatPattern.type) {
        case RepeatType.DAILY:
          currentDate.setDate(currentDate.getDate() + (repeatPattern.interval || 1));
          break;
        case RepeatType.WEEKLY:
          currentDate.setDate(currentDate.getDate() + 7 * (repeatPattern.interval || 1));
          break;
        case RepeatType.MONTHLY:
          currentDate.setMonth(currentDate.getMonth() + (repeatPattern.interval || 1));
          break;
        case RepeatType.CUSTOM:
          // カスタム繰り返しロジック（曜日指定など）
          if (repeatPattern.daysOfWeek && repeatPattern.daysOfWeek.length > 0) {
            do {
              currentDate.setDate(currentDate.getDate() + 1);
            } while (!repeatPattern.daysOfWeek.includes(currentDate.getDay()));
          }
          break;
      }
    }
    
    return dates;
  }
}

// 学習記録リポジトリ実装
export class StudyRecordRepository 
  extends BaseAsyncStorage<StudyRecord> 
  implements IStudyRecordRepository {
  
  constructor() {
    super(STORAGE_KEYS.STUDY_RECORDS);
  }

  async create(record: Omit<StudyRecord, 'id' | 'createdAt'>): Promise<StudyRecord> {
    const records = await this.getAll();
    const newRecord: StudyRecord = {
      ...record,
      id: this.generateId(),
      createdAt: this.getCurrentTimestamp(),
    };
    
    records.push(newRecord);
    await this.saveAll(records);
    return newRecord;
  }

  async update(id: string, record: Partial<StudyRecord>): Promise<StudyRecord> {
    const records = await this.getAll();
    const index = records.findIndex(r => r.id === id);
    
    if (index === -1) {
      throw new Error(`Record with id ${id} not found`);
    }
    
    records[index] = {
      ...records[index],
      ...record,
      id, // IDは変更不可
    };
    
    await this.saveAll(records);
    return records[index];
  }

  async delete(id: string): Promise<void> {
    const records = await this.getAll();
    const filtered = records.filter(r => r.id !== id);
    await this.saveAll(filtered);
  }

  async findById(id: string): Promise<StudyRecord | null> {
    const records = await this.getAll();
    return records.find(r => r.id === id) || null;
  }

  async findByScheduleId(scheduleId: string): Promise<StudyRecord[]> {
    const records = await this.getAll();
    return records.filter(r => r.scheduleId === scheduleId);
  }

  async findByDateRange(startDate: string, endDate: string): Promise<StudyRecord[]> {
    const records = await this.getAll();
    return records.filter(r => {
      const recordDate = r.completedAt.split('T')[0];
      return recordDate >= startDate && recordDate <= endDate;
    });
  }

  async findLatest(limit: number = 10): Promise<StudyRecord[]> {
    const records = await this.getAll();
    return records
      .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
      .slice(0, limit);
  }

  async clear(): Promise<void> {
    await this.saveAll([]);
  }
}

// プロンプトリポジトリ実装
export class PromptRepository 
  extends BaseAsyncStorage<Prompt> 
  implements IPromptRepository {
  
  constructor() {
    super(STORAGE_KEYS.PROMPTS);
  }

  async create(prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>): Promise<Prompt> {
    const prompts = await this.getAll();
    const newPrompt: Prompt = {
      ...prompt,
      id: this.generateId(),
      createdAt: this.getCurrentTimestamp(),
      updatedAt: this.getCurrentTimestamp(),
    };
    
    prompts.push(newPrompt);
    await this.saveAll(prompts);
    return newPrompt;
  }

  async update(id: string, prompt: Partial<Prompt>): Promise<Prompt> {
    const prompts = await this.getAll();
    const index = prompts.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error(`Prompt with id ${id} not found`);
    }
    
    prompts[index] = {
      ...prompts[index],
      ...prompt,
      id, // IDは変更不可
      updatedAt: this.getCurrentTimestamp(),
    };
    
    await this.saveAll(prompts);
    return prompts[index];
  }

  async delete(id: string): Promise<void> {
    const prompts = await this.getAll();
    const filtered = prompts.filter(p => p.id !== id);
    await this.saveAll(filtered);
  }

  async findById(id: string): Promise<Prompt | null> {
    const prompts = await this.getAll();
    return prompts.find(p => p.id === id) || null;
  }

  async findAll(): Promise<Prompt[]> {
    return this.getAll();
  }

  async findByLabel(label: PromptLabel): Promise<Prompt[]> {
    const prompts = await this.getAll();
    return prompts.filter(p => p.label === label);
  }

  async search(query: string): Promise<Prompt[]> {
    const prompts = await this.getAll();
    const lowerQuery = query.toLowerCase();
    
    return prompts.filter(p => 
      p.content.toLowerCase().includes(lowerQuery) ||
      (p.memo && p.memo.toLowerCase().includes(lowerQuery))
    );
  }
}

// 統計リポジトリ実装
export class StatisticsRepository implements IStatisticsRepository {
  constructor(
    private scheduleRepo: IStudyScheduleRepository,
    private recordRepo: IStudyRecordRepository,
    private promptRepo: IPromptRepository
  ) {}

  async getOverallStatistics(): Promise<StudyStatistics> {
    const records = await this.recordRepo.findLatest(1000); // 最新1000件
    const prompts = await this.promptRepo.findAll();
    
    return this.calculateStatistics(records, prompts);
  }

  async getStatisticsByDateRange(startDate: string, endDate: string): Promise<StudyStatistics> {
    const records = await this.recordRepo.findByDateRange(startDate, endDate);
    const prompts = await this.promptRepo.findAll();
    
    return this.calculateStatistics(records, prompts);
  }

  async getStreakInfo(): Promise<{ current: number; longest: number }> {
    const records = await this.recordRepo.findLatest(365); // 過去1年分
    
    // 日付ごとに学習記録をグループ化
    const dateSet = new Set(
      records.map(r => r.completedAt.split('T')[0])
    );
    
    const sortedDates = Array.from(dateSet).sort();
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / 86400000);
        
        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    
    // 現在のストリークを計算
    if (sortedDates.includes(today) || sortedDates.includes(yesterday)) {
      const relevantDate = sortedDates.includes(today) ? today : yesterday;
      tempStreak = 1;
      
      for (let i = sortedDates.indexOf(relevantDate) - 1; i >= 0; i--) {
        const prevDate = new Date(sortedDates[i]);
        const currDate = new Date(sortedDates[i + 1]);
        const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / 86400000);
        
        if (diffDays === 1) {
          tempStreak++;
        } else {
          break;
        }
      }
      
      currentStreak = tempStreak;
    }
    
    return { current: currentStreak, longest: longestStreak };
  }

  async updateStatisticsCache(): Promise<void> {
    const statistics = await this.getOverallStatistics();
    await AsyncStorage.setItem(STORAGE_KEYS.STATISTICS_CACHE, JSON.stringify(statistics));
  }

  async clearStatistics(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.STATISTICS_CACHE);
  }

  private calculateStatistics(records: StudyRecord[], prompts: Prompt[]): StudyStatistics {
    const totalStudyTime = records.reduce((sum, r) => sum + r.duration, 0);
    
    const studyTimeByCategory: Record<StudyCategory, number> = {
      [StudyCategory.PYTHON]: 0,
      [StudyCategory.AI_LITERACY]: 0,
      [StudyCategory.PROMPT_ENGINEERING]: 0,
    };
    
    const studyTimeByDate: Record<string, number> = {};
    
    // カテゴリ別・日付別の集計は、学習記録に紐づく予定情報が必要
    // ここでは簡略化のため、記録のみで集計
    records.forEach(record => {
      const date = record.completedAt.split('T')[0];
      studyTimeByDate[date] = (studyTimeByDate[date] || 0) + record.duration;
    });
    
    const promptsByLabel = prompts.reduce((acc, prompt) => {
      acc[prompt.label] = (acc[prompt.label] || 0) + 1;
      return acc;
    }, {} as Record<PromptLabel, number>);
    
    return {
      totalStudyTime,
      studyTimeByCategory,
      studyTimeByDate,
      currentStreak: 0, // getStreakInfo()で別途計算
      longestStreak: 0, // getStreakInfo()で別途計算
      totalPrompts: prompts.length,
      promptsByLabel,
    };
  }
}

// 設定リポジトリ実装
export class SettingsRepository implements ISettingsRepository {
  private defaultSettings: AppSettings = {
    defaultNotificationTime: NotificationTime.THIRTY_MINUTES,
    defaultStudyDuration: 60,
    theme: 'auto',
  };

  async getSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...this.defaultSettings, ...JSON.parse(data) } : this.defaultSettings;
    } catch (error) {
      console.error('Error reading settings:', error);
      return this.defaultSettings;
    }
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const currentSettings = await this.getSettings();
    const newSettings = { ...currentSettings, ...settings };
    
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
    return newSettings;
  }

  async resetToDefaults(): Promise<AppSettings> {
    await AsyncStorage.removeItem(STORAGE_KEYS.SETTINGS);
    return this.defaultSettings;
  }
}