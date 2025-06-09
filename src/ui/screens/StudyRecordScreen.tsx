
// src/ui/screens/StudyRecordScreen.tsx

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useStudyRecords, useStudySchedules } from '../../contexts/AppContext';
import { RootStackScreenProps } from '../../types/navigation';
import { Input, Button, Card } from '../../components/common';
import { StudyRecord } from '../../types/models';

type Props = RootStackScreenProps<'StudyRecord'>;

export const StudyRecordScreen: React.FC<Props> = ({ navigation, route }) => {
  const { createRecord } = useStudyRecords();
  const { updateSchedule } = useStudySchedules();

  const scheduleId = route.params?.scheduleId;
  const schedule = route.params?.schedule;

  const [duration, setDuration] = useState('60');
  const [memo, setMemo] = useState('');
  const [urls, setUrls] = useState(['']);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddUrl = () => {
    setUrls([...urls, '']);
  };

  const handleUpdateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const handleRemoveUrl = (index: number) => {
    const newUrls = urls.filter((_, i) => i !== index);
    setUrls(newUrls);
  };

  const handleSave = async () => {
    const durationNum = parseInt(duration, 10);
    if (isNaN(durationNum) || durationNum <= 0) {
      Alert.alert('エラー', '学習時間を正しく入力してください');
      return;
    }

    setIsLoading(true);
    try {
      const filteredUrls = urls.filter(url => url.trim() !== '');
      
      const newRecord: Omit<StudyRecord, 'id' | 'createdAt'> = {
        scheduleId: scheduleId || '',
        completedAt: new Date().toISOString(),
        duration: durationNum,
        memo: memo.trim(),
        urls: filteredUrls.length > 0 ? filteredUrls : undefined,
      };

      await createRecord(newRecord);
      
      // 予定を完了状態に更新
      if (scheduleId) {
        await updateSchedule(scheduleId, { isCompleted: true });
      }
      
      Alert.alert(
        '完了',
        '学習記録を保存しました',
        [{ 
          text: 'OK', 
          onPress: () => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('MainTabs', { screen: 'Calendar' });
            }
          }
        }]
      );
    } catch {
      Alert.alert('エラー', '記録の保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {schedule && (
          <Card style={styles.scheduleInfo}>
            <Text style={styles.scheduleTitle}>{schedule.title}</Text>
            {schedule.description && (
              <Text style={styles.scheduleDescription}>{schedule.description}</Text>
            )}
          </Card>
        )}

        <Card>
          <Input
            label="学習時間（分）"
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            placeholder="60"
          />

          <Input
            label="学習メモ"
            value={memo}
            onChangeText={setMemo}
            placeholder="今日学んだこと、気づいたことなど"
            multiline
            numberOfLines={4}
          />
        </Card>

        <Card style={styles.card}>
          <View style={styles.urlsHeader}>
            <Text style={styles.label}>参考URL</Text>
            <TouchableOpacity onPress={handleAddUrl}>
              <Text style={styles.addButton}>+ 追加</Text>
            </TouchableOpacity>
          </View>

          {urls.map((url, index) => (
            <View key={index} style={styles.urlField}>
              <Input
                value={url}
                onChangeText={(value) => handleUpdateUrl(index, value)}
                placeholder="https://example.com"
                containerStyle={styles.urlInput}
              />
              {urls.length > 1 && (
                <TouchableOpacity
                  onPress={() => handleRemoveUrl(index)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>削除</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </Card>

        <View style={styles.buttons}>
          <Button
            title="キャンセル"
            variant="secondary"
            onPress={() => navigation.goBack()}
            style={styles.button}
          />
          <Button
            title="保存"
            onPress={handleSave}
            loading={isLoading}
            style={styles.button}
          />
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
  scheduleInfo: {
    marginBottom: 16,
    backgroundColor: '#E3F2FD',
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  scheduleDescription: {
    fontSize: 14,
    color: '#666',
  },
  card: {
    marginTop: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  urlsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addButton: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  urlField: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  urlInput: {
    flex: 1,
    marginBottom: 0,
  },
  removeButton: {
    marginLeft: 8,
    padding: 8,
  },
  removeButtonText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});
