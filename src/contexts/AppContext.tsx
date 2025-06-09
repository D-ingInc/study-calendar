// src/contexts/AppContext.tsx

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  StudySchedule,
  StudyRecord,
  Prompt,
  AppSettings,
  StudyStatistics,
  PromptLabel,
  NotificationTime,
} from '../types/models';
import {
  StudyScheduleRepository,
  StudyRecordRepository,
  PromptRepository,
  StatisticsRepository,
  SettingsRepository,
} from '../data/storage/asyncStorageImpl';

// アプリケーション状態
interface AppState {
  schedules: StudySchedule[];
  records: StudyRecord[];
  prompts: Prompt[];
  settings: AppSettings;
  statistics: StudyStatistics | null;
  isLoading: boolean;
  error: string | null;
}

// アクション定義
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SCHEDULES'; payload: StudySchedule[] }
  | { type: 'ADD_SCHEDULE'; payload: StudySchedule }
  | { type: 'UPDATE_SCHEDULE'; payload: StudySchedule }
  | { type: 'DELETE_SCHEDULE'; payload: string }
  | { type: 'SET_RECORDS'; payload: StudyRecord[] }
  | { type: 'ADD_RECORD'; payload: StudyRecord }
  | { type: 'SET_PROMPTS'; payload: Prompt[] }
  | { type: 'ADD_PROMPT'; payload: Prompt }
  | { type: 'UPDATE_PROMPT'; payload: Prompt }
  | { type: 'DELETE_PROMPT'; payload: string }
  | { type: 'SET_SETTINGS'; payload: AppSettings }
  | { type: 'SET_STATISTICS'; payload: StudyStatistics };

// 初期状態
const initialState: AppState = {
  schedules: [],
  records: [],
  prompts: [],
  settings: {
    defaultNotificationTime: NotificationTime.THIRTY_MINUTES,
    defaultStudyDuration: 60,
    theme: 'auto',
  },
  statistics: null,
  isLoading: true,
  error: null,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_SCHEDULES':
      return { ...state, schedules: action.payload };
    
    case 'ADD_SCHEDULE':
      return { ...state, schedules: [...state.schedules, action.payload] };
    
    case 'UPDATE_SCHEDULE':
      return {
        ...state,
        schedules: state.schedules.map(s =>
          s.id === action.payload.id ? action.payload : s
        ),
      };
    
    case 'DELETE_SCHEDULE':
      return {
        ...state,
        schedules: state.schedules.filter(s => s.id !== action.payload),
      };
    
    case 'SET_RECORDS':
      return { ...state, records: action.payload };
    
    case 'ADD_RECORD':
      return { ...state, records: [...state.records, action.payload] };
    
    case 'SET_PROMPTS':
      return { ...state, prompts: action.payload };
    
    case 'ADD_PROMPT':
      return { ...state, prompts: [...state.prompts, action.payload] };
    
    case 'UPDATE_PROMPT':
      return {
        ...state,
        prompts: state.prompts.map(p =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    
    case 'DELETE_PROMPT':
      return {
        ...state,
        prompts: state.prompts.filter(p => p.id !== action.payload),
      };
    
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    
    case 'SET_STATISTICS':
      return { ...state, statistics: action.payload };
    
    default:
      return state;
  }
}

// コンテキスト定義
interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  repositories: {
    schedule: StudyScheduleRepository;
    record: StudyRecordRepository;
    prompt: PromptRepository;
    statistics: StatisticsRepository;
    settings: SettingsRepository;
  };
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

// プロバイダーコンポーネント
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // リポジトリインスタンス
  const repositories = React.useMemo(() => {
    const schedule = new StudyScheduleRepository();
    const record = new StudyRecordRepository();
    const prompt = new PromptRepository();
    const statistics = new StatisticsRepository(schedule, record, prompt);
    const settings = new SettingsRepository();
    
    return { schedule, record, prompt, statistics, settings };
  }, []);
  
  // 初期データ読み込み
  useEffect(() => {
    async function loadInitialData() {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const [schedules, records, prompts, settings] = await Promise.all([
          repositories.schedule.findByDateRange(
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          ),
          repositories.record.findLatest(100),
          repositories.prompt.findAll(),
          repositories.settings.getSettings(),
        ]);
        
        dispatch({ type: 'SET_SCHEDULES', payload: schedules });
        dispatch({ type: 'SET_RECORDS', payload: records });
        dispatch({ type: 'SET_PROMPTS', payload: prompts });
        dispatch({ type: 'SET_SETTINGS', payload: settings });
        
        // 統計情報を非同期で読み込み
        repositories.statistics.getOverallStatistics().then(stats => {
          dispatch({ type: 'SET_STATISTICS', payload: stats });
        }).catch(() => {
          console.error('統計情報の読み込みに失敗しました');
        });
      } catch {
        dispatch({ type: 'SET_ERROR', payload: 'データの読み込みに失敗しました' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
    
    loadInitialData();
  }, [repositories]);
  
  return (
    <AppContext.Provider value={{ state, dispatch, repositories }}>
      {children}
    </AppContext.Provider>
  );
}

// カスタムフック: コンテキスト使用
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

// カスタムフック: 学習予定管理
export function useStudySchedules() {
  const { state, dispatch, repositories } = useApp();
  
  const createSchedule = async (
    schedule: Omit<StudySchedule, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      const newSchedule = await repositories.schedule.create(schedule);
      dispatch({ type: 'ADD_SCHEDULE', payload: newSchedule });
      return newSchedule;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '予定の作成に失敗しました' });
      throw error;
    }
  };
  
  const updateSchedule = async (id: string, schedule: Partial<StudySchedule>) => {
    try {
      const updated = await repositories.schedule.update(id, schedule);
      dispatch({ type: 'UPDATE_SCHEDULE', payload: updated });
      return updated;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '予定の更新に失敗しました' });
      throw error;
    }
  };
  
  const deleteSchedule = async (id: string) => {
    try {
      await repositories.schedule.delete(id);
      dispatch({ type: 'DELETE_SCHEDULE', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '予定の削除に失敗しました' });
      throw error;
    }
  };
  
  const getSchedulesByDate = (date: string) => {
    return state.schedules.filter(s => s.date === date);
  };
  
  const getUpcomingSchedules = (limit: number = 10) => {
    const now = new Date().toISOString();
    return state.schedules
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
  };
  
  return {
    schedules: state.schedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getSchedulesByDate,
    getUpcomingSchedules,
  };
}

// カスタムフック: 学習記録管理
export function useStudyRecords() {
  const { state, dispatch, repositories } = useApp();
  
  const createRecord = async (
    record: Omit<StudyRecord, 'id' | 'createdAt'>
  ) => {
    try {
      const newRecord = await repositories.record.create(record);
      dispatch({ type: 'ADD_RECORD', payload: newRecord });
      
      // 関連する予定を完了状態に更新
      if (record.scheduleId) {
        const schedule = state.schedules.find(s => s.id === record.scheduleId);
        if (schedule && !schedule.isCompleted) {
          await repositories.schedule.update(record.scheduleId, { isCompleted: true });
          dispatch({
            type: 'UPDATE_SCHEDULE',
            payload: { ...schedule, isCompleted: true },
          });
        }
      }
      
      // 統計情報を更新
      repositories.statistics.updateStatisticsCache();
      
      return newRecord;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '記録の作成に失敗しました' });
      throw error;
    }
  };
  
  const getRecordsBySchedule = (scheduleId: string) => {
    return state.records.filter(r => r.scheduleId === scheduleId);
  };
  
  const getRecentRecords = (limit: number = 10) => {
    return [...state.records]
      .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
      .slice(0, limit);
  };
  
  return {
    records: state.records,
    createRecord,
    getRecordsBySchedule,
    getRecentRecords,
  };
}

// カスタムフック: プロンプト管理
export function usePrompts() {
  const { state, dispatch, repositories } = useApp();
  
  const createPrompt = async (
    prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      const newPrompt = await repositories.prompt.create(prompt);
      dispatch({ type: 'ADD_PROMPT', payload: newPrompt });
      return newPrompt;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'プロンプトの作成に失敗しました' });
      throw error;
    }
  };
  
  const updatePrompt = async (id: string, prompt: Partial<Prompt>) => {
    try {
      const updated = await repositories.prompt.update(id, prompt);
      dispatch({ type: 'UPDATE_PROMPT', payload: updated });
      return updated;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'プロンプトの更新に失敗しました' });
      throw error;
    }
  };
  
  const deletePrompt = async (id: string) => {
    try {
      await repositories.prompt.delete(id);
      dispatch({ type: 'DELETE_PROMPT', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'プロンプトの削除に失敗しました' });
      throw error;
    }
  };
  
  const searchPrompts = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return state.prompts.filter(p =>
      p.content.toLowerCase().includes(lowerQuery) ||
      (p.memo && p.memo.toLowerCase().includes(lowerQuery))
    );
  };
  
  const getPromptsByLabel = (label: PromptLabel) => {
    return state.prompts.filter(p => p.label === label);
  };
  
  return {
    prompts: state.prompts,
    createPrompt,
    updatePrompt,
    deletePrompt,
    searchPrompts,
    getPromptsByLabel,
  };
}

// カスタムフック: 統計情報
export function useStatistics() {
  const { state, repositories } = useApp();
  
  const refreshStatistics = async () => {
    try {
      const stats = await repositories.statistics.getOverallStatistics();
      const streakInfo = await repositories.statistics.getStreakInfo();
      
      const fullStats: StudyStatistics = {
        ...stats,
        currentStreak: streakInfo.current,
        longestStreak: streakInfo.longest,
      };
      
      return fullStats;
    } catch (error) {
      console.error('統計情報の取得に失敗しました:', error);
      throw error;
    }
  };
  
  return {
    statistics: state.statistics,
    refreshStatistics,
  };
}

// カスタムフック: 設定管理
export function useSettings() {
  const { state, dispatch, repositories } = useApp();
  
  const updateSettings = async (settings: Partial<AppSettings>) => {
    try {
      const updated = await repositories.settings.updateSettings(settings);
      dispatch({ type: 'SET_SETTINGS', payload: updated });
      return updated;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '設定の更新に失敗しました' });
      throw error;
    }
  };
  
  const resetSettings = async () => {
    try {
      const defaults = await repositories.settings.resetToDefaults();
      dispatch({ type: 'SET_SETTINGS', payload: defaults });
      return defaults;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '設定のリセットに失敗しました' });
      throw error;
    }
  };
  
  return {
    settings: state.settings,
    updateSettings,
    resetSettings,
  };
}