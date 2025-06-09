
// src/ui/screens/StatisticsScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  RefreshControl,
} from 'react-native';
import { useStatistics } from '../../contexts/AppContext';
import { Card } from '../../components/common';
import { StudyCategory, PromptLabel } from '../../types/models';

const categoryLabels = {
  [StudyCategory.PYTHON]: 'Python',
  [StudyCategory.AI_LITERACY]: 'AI教養',
  [StudyCategory.PROMPT_ENGINEERING]: 'プロンプト',
};

const promptLabelNames = {
  [PromptLabel.CHATGPT]: 'ChatGPT',
  [PromptLabel.CLAUDE]: 'Claude',
  [PromptLabel.GEMINI]: 'Gemini',
  [PromptLabel.DEEPSEEK]: 'DeepSeek',
  [PromptLabel.PROGRAMMING]: 'プログラミング',
  [PromptLabel.OTHER]: 'その他',
};

export const StatisticsScreen: React.FC = () => {
  const { statistics, refreshStatistics } = useStatistics();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    refreshStatistics();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshStatistics();
    setRefreshing(false);
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}時間${mins}分`;
    }
    return `${mins}分`;
  };

  if (!statistics) {
    return (
      <View style={styles.container}>
        <Text>読み込み中...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* ストリーク情報 */}
        <Card style={styles.streakCard}>
          <Text style={styles.cardTitle}>学習継続</Text>
          <View style={styles.streakContainer}>
            <View style={styles.streakItem}>
              <Text style={styles.streakNumber}>{statistics.currentStreak}</Text>
              <Text style={styles.streakLabel}>現在の連続日数</Text>
            </View>
            <View style={styles.streakDivider} />
            <View style={styles.streakItem}>
              <Text style={styles.streakNumber}>{statistics.longestStreak}</Text>
              <Text style={styles.streakLabel}>最長記録</Text>
            </View>
          </View>
        </Card>

        {/* 総学習時間 */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>総学習時間</Text>
          <Text style={styles.totalTime}>{formatTime(statistics.totalStudyTime)}</Text>
        </Card>

        {/* カテゴリ別学習時間 */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>カテゴリ別学習時間</Text>
          {Object.entries(statistics.studyTimeByCategory).map(([category, time]) => (
            <View key={category} style={styles.categoryRow}>
              <Text style={styles.categoryName}>
                {categoryLabels[category as StudyCategory]}
              </Text>
              <Text style={styles.categoryTime}>{formatTime(time)}</Text>
            </View>
          ))}
        </Card>

        {/* プロンプト統計 */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>保存したプロンプト</Text>
          <Text style={styles.totalPrompts}>合計: {statistics.totalPrompts}個</Text>
          <View style={styles.promptStats}>
            {Object.entries(statistics.promptsByLabel).map(([label, count]) => (
              <View key={label} style={styles.promptItem}>
                <Text style={styles.promptLabel}>
                  {promptLabelNames[label as PromptLabel]}
                </Text>
                <Text style={styles.promptCount}>{count}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* 最近の学習時間グラフ（簡易版） */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>今週の学習時間</Text>
          <View style={styles.weekChart}>
            {['月', '火', '水', '木', '金', '土', '日'].map((day, index) => {
              const date = new Date();
              date.setDate(date.getDate() - date.getDay() + index + 1);
              const dateStr = date.toISOString().split('T')[0];
              const time = statistics.studyTimeByDate[dateStr] || 0;
              const maxTime = Math.max(...Object.values(statistics.studyTimeByDate));
              const height = maxTime > 0 ? (time / maxTime) * 100 : 0;

              return (
                <View key={day} style={styles.dayColumn}>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        { height: `${height}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.dayLabel}>{day}</Text>
                </View>
              );
            })}
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  streakCard: {
    marginBottom: 16,
    backgroundColor: '#007AFF',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  streakItem: {
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFF',
  },
  streakLabel: {
    fontSize: 14,
    color: '#FFF',
    marginTop: 4,
  },
  streakDivider: {
    width: 1,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  totalTime: {
    fontSize: 28,
    fontWeight: '700',
    color: '#007AFF',
    textAlign: 'center',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  categoryName: {
    fontSize: 14,
    color: '#666',
  },
  categoryTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalPrompts: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 12,
  },
  promptStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  promptItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  promptLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  promptCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  weekChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 120,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    flex: 1,
    width: '60%',
    justifyContent: 'flex-end',
  },
  bar: {
    backgroundColor: '#007AFF',
    borderRadius: 4,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
});
