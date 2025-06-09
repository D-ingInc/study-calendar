// src/types/models.ts

// 学習予定
export interface StudySchedule {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  category: StudyCategory;
  isCompleted: boolean;
  isNotificationEnabled: boolean;
  notificationTime?: NotificationTime;
  repeatPattern?: RepeatPattern;
  createdAt: string;
  updatedAt: string;
}

// 学習カテゴリ
export enum StudyCategory {
  PYTHON = 'python',
  AI_LITERACY = 'ai_literacy',
  PROMPT_ENGINEERING = 'prompt_engineering',
}

// 通知タイミング
export enum NotificationTime {
  FIVE_MINUTES = 5,
  FIFTEEN_MINUTES = 15,
  THIRTY_MINUTES = 30,
  ONE_HOUR = 60,
  TWO_HOURS = 120,
  THREE_HOURS = 180,
}

// 繰り返しパターン
export interface RepeatPattern {
  type: RepeatType;
  interval?: number; // 繰り返し間隔
  daysOfWeek?: number[]; // 0-6 (日-土)
  endDate?: string; // 終了日
}

export enum RepeatType {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

// 学習記録
export interface StudyRecord {
  id: string;
  scheduleId: string;
  completedAt: string;
  duration: number; // 分単位
  memo?: string;
  urls?: string[];
  createdAt: string;
}

// プロンプト
export interface Prompt {
  id: string;
  content: string;
  label: PromptLabel;
  memo?: string;
  createdAt: string;
  updatedAt: string;
}

// プロンプトラベル
export enum PromptLabel {
  CHATGPT = 'chatgpt',
  CLAUDE = 'claude',
  GEMINI = 'gemini',
  DEEPSEEK = 'deepseek',
  PROGRAMMING = 'programming',
  OTHER = 'other',
}

// 学習統計
export interface StudyStatistics {
  totalStudyTime: number; // 総学習時間（分）
  studyTimeByCategory: Record<StudyCategory, number>;
  studyTimeByDate: Record<string, number>; // YYYY-MM-DD -> 分
  currentStreak: number; // 現在の連続学習日数
  longestStreak: number; // 最長連続学習日数
  totalPrompts: number;
  promptsByLabel: Record<PromptLabel, number>;
}

// アプリ設定
export interface AppSettings {
  defaultNotificationTime: NotificationTime;
  defaultStudyDuration: number; // デフォルト学習時間（分）
  theme: 'light' | 'dark' | 'auto';
}