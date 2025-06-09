// src/ui/screens/CalendarScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Calendar, DateData, LocaleConfig } from 'react-native-calendars';
import { useStudySchedules } from '../../contexts/AppContext';
import { Card, Button, Empty } from '../../components/common';
import { StudySchedule, StudyCategory } from '../../types/models';
import { MainTabScreenProps } from '../../types/navigation';

// カレンダーのロケールを日本語に設定
LocaleConfig.locales['jp'] = {
  monthNames: [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ],
  monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  dayNames: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
  dayNamesShort: ['日', '月', '火', '水', '木', '金', '土'],
  today: '今日'
};
LocaleConfig.defaultLocale = 'jp';

const categoryColors: Record<StudyCategory, string> = {
  [StudyCategory.PYTHON]: '#3776AB',
  [StudyCategory.AI_LITERACY]: '#FF6B6B',
  [StudyCategory.PROMPT_ENGINEERING]: '#4ECDC4',
};

const categoryLabels: Record<StudyCategory, string> = {
  [StudyCategory.PYTHON]: 'Python',
  [StudyCategory.AI_LITERACY]: 'AI教養',
  [StudyCategory.PROMPT_ENGINEERING]: 'プロンプト',
};

type Props = MainTabScreenProps<'Calendar'>;

export const CalendarScreen: React.FC<Props> = ({ navigation }) => {
  const { schedules, getSchedulesByDate } = useStudySchedules();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [refreshing, setRefreshing] = useState(false);

  const selectedSchedules = getSchedulesByDate(selectedDate);

  // カレンダーにマーカーを表示
  const markedDates = schedules.reduce((acc, schedule) => {
    const dots = acc[schedule.date]?.dots || [];
    dots.push({
      key: schedule.id,
      color: categoryColors[schedule.category],
    });

    return {
      ...acc,
      [schedule.date]: {
        dots,
        selected: schedule.date === selectedDate,
        selectedColor: '#007AFF',
      },
    };
  }, {} as any);

  markedDates[selectedDate] = {
    ...markedDates[selectedDate],
    selected: true,
    selectedColor: '#007AFF',
  };

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // データの再読み込み処理
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const renderScheduleItem = (schedule: StudySchedule) => (
    <TouchableOpacity
      key={schedule.id}
      onPress={() => navigation.navigate('ScheduleDetail', { scheduleId: schedule.id })}
    >
      <Card style={styles.scheduleCard}>
        <View style={styles.scheduleHeader}>
          <View style={styles.scheduleInfo}>
            <Text style={styles.scheduleTitle}>{schedule.title}</Text>
            {schedule.startTime && (
              <Text style={styles.scheduleTime}>
                {schedule.startTime} {schedule.endTime && `- ${schedule.endTime}`}
              </Text>
            )}
          </View>
          <View
            style={[
              styles.categoryIndicator,
              { backgroundColor: categoryColors[schedule.category] },
            ]}
          >
            <Text style={styles.categoryText}>
              {categoryLabels[schedule.category]}
            </Text>
          </View>
        </View>
        {schedule.description && (
          <Text style={styles.scheduleDescription} numberOfLines={2}>
            {schedule.description}
          </Text>
        )}
        {schedule.isCompleted && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>完了</Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Calendar
          current={selectedDate}
          onDayPress={onDayPress}
          markedDates={markedDates}
          markingType="multi-dot"
          theme={{
            selectedDayBackgroundColor: '#007AFF',
            todayTextColor: '#007AFF',
            arrowColor: '#007AFF',
          }}
        />

        <View style={styles.scheduleSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {new Date(selectedDate).getFullYear() + '/' + String(new Date(selectedDate).getMonth() + 1).padStart(2, '0') + '/' + String(new Date(selectedDate).getDate()).padStart(2, '0')}
            </Text>
          </View>

          {selectedSchedules.length > 0 ? (
            selectedSchedules.map(renderScheduleItem)
          ) : (
            <Empty message="この日の予定はありません" />
          )}
        </View>
      </ScrollView>

      <Button
        title="予定を追加"
        style={styles.fab}
        onPress={() => navigation.navigate('ScheduleCreate', { date: selectedDate })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scheduleSection: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  scheduleCard: {
    marginBottom: 12,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  scheduleTime: {
    fontSize: 14,
    color: '#666',
  },
  scheduleDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  categoryIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
  },
  completedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  completedText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
