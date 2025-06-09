// src/data/repositories/interfaces.ts

import {
  StudySchedule,
  StudyRecord,
  Prompt,
  StudyStatistics,
  AppSettings,
  StudyCategory,
  PromptLabel,
} from '../../types/models';

// 学習予定リポジトリ
export interface IStudyScheduleRepository {
  // 基本CRUD操作
  create(schedule: Omit<StudySchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<StudySchedule>;
  update(id: string, schedule: Partial<StudySchedule>): Promise<StudySchedule>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<StudySchedule | null>;
  
  // 検索・フィルタリング
  findByDate(date: string): Promise<StudySchedule[]>;
  findByDateRange(startDate: string, endDate: string): Promise<StudySchedule[]>;
  findByCategory(category: StudyCategory): Promise<StudySchedule[]>;
  findUpcoming(limit?: number): Promise<StudySchedule[]>;
  
  // 繰り返し予定の展開
  expandRepeatingSchedules(startDate: string, endDate: string): Promise<StudySchedule[]>;
}

// 学習記録リポジトリ
export interface IStudyRecordRepository {
  create(record: Omit<StudyRecord, 'id' | 'createdAt'>): Promise<StudyRecord>;
  update(id: string, record: Partial<StudyRecord>): Promise<StudyRecord>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<StudyRecord | null>;
  
  findByScheduleId(scheduleId: string): Promise<StudyRecord[]>;
  findByDateRange(startDate: string, endDate: string): Promise<StudyRecord[]>;
  findLatest(limit?: number): Promise<StudyRecord[]>;
}

// プロンプトリポジトリ
export interface IPromptRepository {
  create(prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>): Promise<Prompt>;
  update(id: string, prompt: Partial<Prompt>): Promise<Prompt>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Prompt | null>;
  
  findAll(): Promise<Prompt[]>;
  findByLabel(label: PromptLabel): Promise<Prompt[]>;
  search(query: string): Promise<Prompt[]>;
}

// 統計リポジトリ
export interface IStatisticsRepository {
  getOverallStatistics(): Promise<StudyStatistics>;
  getStatisticsByDateRange(startDate: string, endDate: string): Promise<StudyStatistics>;
  getStreakInfo(): Promise<{ current: number; longest: number }>;
  updateStatisticsCache(): Promise<void>;
}

// 設定リポジトリ
export interface ISettingsRepository {
  getSettings(): Promise<AppSettings>;
  updateSettings(settings: Partial<AppSettings>): Promise<AppSettings>;
  resetToDefaults(): Promise<AppSettings>;
}

// リポジトリファクトリ
export interface IRepositoryFactory {
  getStudyScheduleRepository(): IStudyScheduleRepository;
  getStudyRecordRepository(): IStudyRecordRepository;
  getPromptRepository(): IPromptRepository;
  getStatisticsRepository(): IStatisticsRepository;
  getSettingsRepository(): ISettingsRepository;
}