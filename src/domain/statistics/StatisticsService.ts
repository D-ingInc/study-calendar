
// src/domain/statistics/StatisticsService.ts

import { 
  StudyRecord
} from '../../types/models';

export class StatisticsService {
  /**
   * 週間の学習パターンを分析
   */
  analyzeWeeklyPattern(records: StudyRecord[]): {
    mostProductiveDay: string;
    averageStudyTimePerDay: number;
    pattern: Record<string, number>;
  } {
    const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];
    const pattern: Record<string, number> = {};
    const dayTotals: Record<number, number> = {};
    const dayCounts: Record<number, number> = {};
    
    // 曜日別に集計
    records.forEach(record => {
      const date = new Date(record.completedAt);
      const dayIndex = date.getDay();
      
      dayTotals[dayIndex] = (dayTotals[dayIndex] || 0) + record.duration;
      dayCounts[dayIndex] = (dayCounts[dayIndex] || 0) + 1;
    });
    
    // 平均を計算
    let maxAverage = 0;
    let mostProductiveDayIndex = 0;
    let totalAverage = 0;
    let daysWithData = 0;
    
    for (let i = 0; i < 7; i++) {
      const average = dayCounts[i] ? dayTotals[i] / dayCounts[i] : 0;
      pattern[daysOfWeek[i]] = Math.round(average);
      
      if (average > maxAverage) {
        maxAverage = average;
        mostProductiveDayIndex = i;
      }
      
      if (average > 0) {
        totalAverage += average;
        daysWithData++;
      }
    }
    
    return {
      mostProductiveDay: daysOfWeek[mostProductiveDayIndex],
      averageStudyTimePerDay: daysWithData > 0 ? Math.round(totalAverage / daysWithData) : 0,
      pattern,
    };
  }

  /**
   * 学習目標の達成度を計算
   */
  calculateGoalAchievement(
    records: StudyRecord[],
    dailyGoalMinutes: number = 60
  ): {
    achievementRate: number;
    daysAchieved: number;
    totalDays: number;
  } {
    const dailyTotals: Record<string, number> = {};
    
    records.forEach(record => {
      const date = record.completedAt.split('T')[0];
      dailyTotals[date] = (dailyTotals[date] || 0) + record.duration;
    });
    
    const totalDays = Object.keys(dailyTotals).length;
    const daysAchieved = Object.values(dailyTotals)
      .filter(total => total >= dailyGoalMinutes).length;
    
    return {
      achievementRate: totalDays > 0 ? Math.round((daysAchieved / totalDays) * 100) : 0,
      daysAchieved,
      totalDays,
    };
  }

  /**
   * 学習の進歩を分析
   */
  analyzeProgress(
    records: StudyRecord[],
    period: 'week' | 'month' = 'week'
  ): {
    trend: 'improving' | 'stable' | 'declining';
    percentageChange: number;
  } {
    const now = new Date();
    const periodDays = period === 'week' ? 7 : 30;
    const halfPeriod = Math.floor(periodDays / 2);
    
    const firstHalfStart = new Date(now);
    firstHalfStart.setDate(now.getDate() - periodDays);
    const secondHalfStart = new Date(now);
    secondHalfStart.setDate(now.getDate() - halfPeriod);
    
    let firstHalfTotal = 0;
    let secondHalfTotal = 0;
    
    records.forEach(record => {
      const recordDate = new Date(record.completedAt);
      
      if (recordDate >= firstHalfStart && recordDate < secondHalfStart) {
        firstHalfTotal += record.duration;
      } else if (recordDate >= secondHalfStart) {
        secondHalfTotal += record.duration;
      }
    });
    
    const percentageChange = firstHalfTotal > 0
      ? Math.round(((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100)
      : 0;
    
    let trend: 'improving' | 'stable' | 'declining';
    if (percentageChange > 10) {
      trend = 'improving';
    } else if (percentageChange < -10) {
      trend = 'declining';
    } else {
      trend = 'stable';
    }
    
    return { trend, percentageChange };
  }
}