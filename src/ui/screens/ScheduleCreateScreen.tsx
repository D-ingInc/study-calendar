// src/ui/screens/ScheduleCreateScreen.tsx

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useStudySchedules, useSettings } from '../../contexts/AppContext';
import { RootStackScreenProps } from '../../types/navigation';
import { Input, Button, Card } from '../../components/common';
import {
  StudyCategory,
  NotificationTime,
  RepeatType,
  StudySchedule,
} from '../../types/models';

const categoryOptions = [
  { label: 'Python', value: StudyCategory.PYTHON },
  { label: 'AI教養', value: StudyCategory.AI_LITERACY },
  { label: 'プロンプトエンジニアリング', value: StudyCategory.PROMPT_ENGINEERING },
];

const notificationOptions = [
  { label: '5分前', value: NotificationTime.FIVE_MINUTES },
  { label: '15分前', value: NotificationTime.FIFTEEN_MINUTES },
  { label: '30分前', value: NotificationTime.THIRTY_MINUTES },
  { label: '1時間前', value: NotificationTime.ONE_HOUR },
  { label: '2時間前', value: NotificationTime.TWO_HOURS },
  { label: '3時間前', value: NotificationTime.THREE_HOURS },
];

const repeatOptions = [
  { label: '繰り返しなし', value: RepeatType.NONE },
  { label: '毎日', value: RepeatType.DAILY },
  { label: '毎週', value: RepeatType.WEEKLY },
  { label: '毎月', value: RepeatType.MONTHLY },
];

type Props = RootStackScreenProps<'ScheduleCreate'>;

export const ScheduleCreateScreen: React.FC<Props> = ({ navigation, route }) => {
  const { createSchedule } = useStudySchedules();
  const { settings } = useSettings();

  const initialDate = route.params?.date || new Date().toISOString().split('T')[0];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date(initialDate));
  const [hasTime, setHasTime] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [category, setCategory] = useState(StudyCategory.PYTHON);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
  const [notificationTime, setNotificationTime] = useState(
    settings.defaultNotificationTime
  );
  const [repeatType, setRepeatType] = useState(RepeatType.NONE);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('エラー', 'タイトルを入力してください');
      return;
    }

    setIsLoading(true);
    try {
      const newSchedule: Omit<StudySchedule, 'id' | 'createdAt' | 'updatedAt'> = {
        title: title.trim(),
        description: description.trim(),
        date: date.toISOString().split('T')[0],
        startTime: hasTime ? startTime.toTimeString().slice(0, 5) : undefined,
        endTime: hasTime ? endTime.toTimeString().slice(0, 5) : undefined,
        category,
        isCompleted: false,
        isNotificationEnabled,
        notificationTime: isNotificationEnabled ? notificationTime : undefined,
        repeatPattern: repeatType !== RepeatType.NONE
          ? { type: repeatType }
          : undefined,
      };

      await createSchedule(newSchedule);
      navigation.goBack();
    } catch {
      Alert.alert('エラー', '予定の作成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card>
          <Input
            label="タイトル"
            value={title}
            onChangeText={setTitle}
            placeholder="学習内容を入力"
          />

          <Input
            label="説明（任意）"
            value={description}
            onChangeText={setDescription}
            placeholder="詳細な説明を入力"
            multiline
            numberOfLines={3}
          />

          <View style={styles.field}>
            <Text style={styles.label}>カテゴリ</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={category}
                onValueChange={setCategory}
                style={styles.picker}
              >
                {categoryOptions.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>日付</Text>
            <Button
              title={date.toLocaleDateString('ja-JP')}
              variant="secondary"
              onPress={() => setShowDatePicker(true)}
            />
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setDate(selectedDate);
                }
              }}
            />
          )}

          <View style={styles.switchField}>
            <Text style={styles.label}>時間を設定</Text>
            <Switch value={hasTime} onValueChange={setHasTime} />
          </View>

          {hasTime && (
            <>
              <View style={styles.timeFields}>
                <View style={styles.timeField}>
                  <Text style={styles.subLabel}>開始時間</Text>
                  <Button
                    title={startTime.toTimeString().slice(0, 5)}
                    variant="secondary"
                    size="small"
                    onPress={() => setShowStartTimePicker(true)}
                  />
                </View>
                <View style={styles.timeField}>
                  <Text style={styles.subLabel}>終了時間</Text>
                  <Button
                    title={endTime.toTimeString().slice(0, 5)}
                    variant="secondary"
                    size="small"
                    onPress={() => setShowEndTimePicker(true)}
                  />
                </View>
              </View>

              {showStartTimePicker && (
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedTime) => {
                    setShowStartTimePicker(false);
                    if (selectedTime) {
                      setStartTime(selectedTime);
                    }
                  }}
                />
              )}

              {showEndTimePicker && (
                <DateTimePicker
                  value={endTime}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedTime) => {
                    setShowEndTimePicker(false);
                    if (selectedTime) {
                      setEndTime(selectedTime);
                    }
                  }}
                />
              )}
            </>
          )}
        </Card>

        <Card style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>繰り返し</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={repeatType}
                onValueChange={setRepeatType}
                style={styles.picker}
              >
                {repeatOptions.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.switchField}>
            <Text style={styles.label}>リマインダー通知</Text>
            <Switch
              value={isNotificationEnabled}
              onValueChange={setIsNotificationEnabled}
            />
          </View>

          {isNotificationEnabled && (
            <View style={styles.field}>
              <Text style={styles.subLabel}>通知タイミング</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={notificationTime}
                  onValueChange={setNotificationTime}
                  style={styles.picker}
                >
                  {notificationOptions.map((option) => (
                    <Picker.Item
                      key={option.value}
                      label={option.label}
                      value={option.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          )}
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
  card: {
    marginTop: 16,
  },
  field: {
    marginBottom: 16,
  },
  switchField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  picker: {
    height: 50,
  },
  timeFields: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeField: {
    flex: 1,
    marginHorizontal: 4,
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