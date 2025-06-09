// src/ui/screens/ScheduleDetailScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Alert,
} from 'react-native';
import { useStudySchedules, useStudyRecords } from '../../contexts/AppContext';
import { RootStackScreenProps } from '../../types/navigation';
import { Button, Card, Badge } from '../../components/common';
import { StudyCategory } from '../../types/models';

const categoryColors = {
  [StudyCategory.PYTHON]: '#3776AB',
  [StudyCategory.AI_LITERACY]: '#FF6B6B',
  [StudyCategory.PROMPT_ENGINEERING]: '#4ECDC4',
};

const categoryLabels = {
  [StudyCategory.PYTHON]: 'Python',
  [StudyCategory.AI_LITERACY]: 'AI教養',
  [StudyCategory.PROMPT_ENGINEERING]: 'プロンプト',
};

type Props = RootStackScreenProps<'ScheduleDetail'>;

export const ScheduleDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { scheduleId } = route.params;
  
  const { schedules, deleteSchedule } = useStudySchedules();
  const { getRecordsBySchedule } = useStudyRecords();
  
  const schedule = schedules.find(s => s.id === scheduleId);
  const records = getRecordsBySchedule(scheduleId);
  
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!schedule) {
      // 予定が見つからない場合はカレンダー画面に戻る
      navigation.navigate('MainTabs', { screen: 'Calendar' });
    }
  }, [schedule, navigation]);

  if (!schedule) {
    return null;
  }

  const handleDelete = () => {
    Alert.alert(
      '予定を削除',
      'この予定を削除してもよろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteSchedule(scheduleId);
              // 削除成功後はカレンダー画面に戻る
              navigation.navigate('MainTabs', { screen: 'Calendar' });
            } catch {
              Alert.alert('エラー', '削除に失敗しました');
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleComplete = () => {
    navigation.navigate('StudyRecord', { scheduleId, schedule });
  };

  const handleEdit = () => {
    navigation.navigate('ScheduleEdit', { scheduleId, schedule });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* 基本情報 */}
        <Card>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{schedule.title}</Text>
              <Badge
                label={categoryLabels[schedule.category]}
                backgroundColor={categoryColors[schedule.category]}
              />
            </View>
            {schedule.isCompleted && (
              <Badge label="完了" backgroundColor="#4CAF50" />
            )}
          </View>

          {schedule.description && (
            <Text style={styles.description}>{schedule.description}</Text>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.label}>日付:</Text>
            <Text style={styles.value}>
              {new Date(schedule.date).getFullYear() + '/' + String(new Date(schedule.date).getMonth() + 1).padStart(2, '0') + '/' + String(new Date(schedule.date).getDate()).padStart(2, '0')}
            </Text>
          </View>

          {schedule.startTime && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>時間:</Text>
              <Text style={styles.value}>
                {schedule.startTime}
                {schedule.endTime && ` - ${schedule.endTime}`}
              </Text>
            </View>
          )}

          {schedule.repeatPattern && schedule.repeatPattern.type !== 'none' && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>繰り返し:</Text>
              <Text style={styles.value}>
                {schedule.repeatPattern.type === 'daily' && '毎日'}
                {schedule.repeatPattern.type === 'weekly' && '毎週'}
                {schedule.repeatPattern.type === 'monthly' && '毎月'}
              </Text>
            </View>
          )}

          {schedule.isNotificationEnabled && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>通知:</Text>
              <Text style={styles.value}>
                {schedule.notificationTime}分前
              </Text>
            </View>
          )}
        </Card>

        {/* 学習記録 */}
        {records.length > 0 && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>学習記録</Text>
            {records.map((record, index) => (
              <View key={record.id} style={styles.recordItem}>
                <View style={styles.recordHeader}>
                  <Text style={styles.recordDate}>
                    {new Date(record.completedAt).getFullYear() + '/' + String(new Date(record.completedAt).getMonth() + 1).padStart(2, '0') + '/' + String(new Date(record.completedAt).getDate()).padStart(2, '0')}
                  </Text>
                  <Text style={styles.recordDuration}>
                    {record.duration}分
                  </Text>
                </View>
                {record.memo && (
                  <Text style={styles.recordMemo}>{record.memo}</Text>
                )}
                {record.urls && record.urls.length > 0 && (
                  <View style={styles.urlsContainer}>
                    <Text style={styles.urlsLabel}>参考URL:</Text>
                    {record.urls.map((url, urlIndex) => (
                      <Text key={urlIndex} style={styles.url} numberOfLines={1}>
                        • {url}
                      </Text>
                    ))}
                  </View>
                )}
                {index < records.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </Card>
        )}

        {/* アクションボタン */}
        <View style={styles.actions}>
          {!schedule.isCompleted && (
            <Button
              title="学習を完了"
              onPress={handleComplete}
              fullWidth
              style={styles.actionButton}
            />
          )}
          
          <View style={styles.buttonRow}>
            <Button
              title="編集"
              variant="secondary"
              onPress={handleEdit}
              style={styles.button}
            />
            <Button
              title="削除"
              variant="danger"
              onPress={handleDelete}
              loading={isDeleting}
              style={styles.button}
            />
          </View>
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    width: 80,
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  card: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  recordItem: {
    marginBottom: 12,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  recordDate: {
    fontSize: 14,
    color: '#666',
  },
  recordDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  recordMemo: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  urlsContainer: {
    marginTop: 8,
  },
  urlsLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  url: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginTop: 12,
  },
  actions: {
    marginTop: 24,
  },
  actionButton: {
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});