// src/ui/screens/ScheduleEditScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Switch,
  Platform,
  Alert,
  KeyboardAvoidingView,
  Modal,
  TouchableOpacity,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useStudySchedules, useSettings } from '../../contexts/AppContext';
import { RootStackScreenProps } from '../../types/navigation';
import { Input, Button, Card, ModalPicker } from '../../components/common';
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

type Props = RootStackScreenProps<'ScheduleEdit'>;

export const ScheduleEditScreen: React.FC<Props> = ({ navigation, route }) => {
  const { schedules, updateSchedule } = useStudySchedules();
  const { settings } = useSettings();
  const { scheduleId, schedule: passedSchedule } = route.params;

  const existingSchedule = schedules.find(s => s.id === scheduleId) || passedSchedule;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
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

  useEffect(() => {
    if (existingSchedule) {
      setTitle(existingSchedule.title);
      setDescription(existingSchedule.description || '');
      setDate(new Date(existingSchedule.date));
      setHasTime(!!existingSchedule.startTime);
      if (existingSchedule.startTime) {
        const [hours, minutes] = existingSchedule.startTime.split(':');
        const startDate = new Date();
        startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        setStartTime(startDate);
      }
      if (existingSchedule.endTime) {
        const [hours, minutes] = existingSchedule.endTime.split(':');
        const endDate = new Date();
        endDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        setEndTime(endDate);
      }
      setCategory(existingSchedule.category);
      setIsNotificationEnabled(existingSchedule.isNotificationEnabled);
      setNotificationTime(existingSchedule.notificationTime || settings.defaultNotificationTime);
      setRepeatType(existingSchedule.repeatPattern?.type || RepeatType.NONE);
    }
  }, [existingSchedule, settings.defaultNotificationTime]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('エラー', 'タイトルを入力してください');
      return;
    }

    if (!existingSchedule) {
      Alert.alert('エラー', '予定が見つかりません');
      return;
    }

    setIsLoading(true);
    try {
      const updatedSchedule: Partial<StudySchedule> = {
        title: title.trim(),
        description: description.trim(),
        date: date.toISOString().split('T')[0],
        startTime: hasTime ? startTime.toTimeString().slice(0, 5) : undefined,
        endTime: hasTime ? endTime.toTimeString().slice(0, 5) : undefined,
        category,
        isNotificationEnabled,
        notificationTime: isNotificationEnabled ? notificationTime : undefined,
        repeatPattern: repeatType !== RepeatType.NONE
          ? { type: repeatType }
          : undefined,
      };

      await updateSchedule(scheduleId, updatedSchedule);
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('MainTabs', { screen: 'Calendar' });
      }
    } catch {
      Alert.alert('エラー', '予定の更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (!existingSchedule) {
    return (
      <View style={styles.container}>
        <Card>
          <Input
            label="エラー"
            value="予定が見つかりません"
            editable={false}
          />
        </Card>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
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

          <ModalPicker
            label="カテゴリ"
            selectedValue={category}
            onValueChange={setCategory}
            options={categoryOptions}
          />
        </Card>

        <Card style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>日付</Text>
            <Button
              title={date.getFullYear() + '/' + String(date.getMonth() + 1).padStart(2, '0') + '/' + String(date.getDate()).padStart(2, '0')}
              variant="secondary"
              onPress={() => setShowDatePicker(true)}
            />
          </View>

          {Platform.OS === 'ios' ? (
            <Modal
              visible={showDatePicker}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowDatePicker(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(false)}
                      style={styles.modalButton}
                    >
                      <Text style={styles.modalButtonText}>キャンセル</Text>
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>日付を選択</Text>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(false)}
                      style={styles.modalButton}
                    >
                      <Text style={[styles.modalButtonText, styles.doneText]}>完了</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="spinner"
                    onChange={(_, selectedDate) => {
                      if (selectedDate) {
                        setDate(selectedDate);
                      }
                    }}
                    style={styles.dateTimePicker}
                    textColor="#333"
                  />
                </View>
              </View>
            </Modal>
          ) : (
            showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={(_, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setDate(selectedDate);
                  }
                }}
              />
            )
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

              {Platform.OS === 'ios' ? (
                <Modal
                  visible={showStartTimePicker}
                  transparent={true}
                  animationType="slide"
                  onRequestClose={() => setShowStartTimePicker(false)}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      <View style={styles.modalHeader}>
                        <TouchableOpacity
                          onPress={() => setShowStartTimePicker(false)}
                          style={styles.modalButton}
                        >
                          <Text style={styles.modalButtonText}>キャンセル</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>開始時間を選択</Text>
                        <TouchableOpacity
                          onPress={() => setShowStartTimePicker(false)}
                          style={styles.modalButton}
                        >
                          <Text style={[styles.modalButtonText, styles.doneText]}>完了</Text>
                        </TouchableOpacity>
                      </View>
                      <DateTimePicker
                        value={startTime}
                        mode="time"
                        is24Hour={true}
                        display="spinner"
                        onChange={(_, selectedTime) => {
                          if (selectedTime) {
                            setStartTime(selectedTime);
                            // 終了時間を開始時間の1時間後に自動設定
                            const newEndTime = new Date(selectedTime);
                            newEndTime.setHours(newEndTime.getHours() + 1);
                            setEndTime(newEndTime);
                          }
                        }}
                        style={styles.dateTimePicker}
                        textColor="#333"
                      />
                    </View>
                  </View>
                </Modal>
              ) : (
                showStartTimePicker && (
                  <DateTimePicker
                    value={startTime}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={(_, selectedTime) => {
                      setShowStartTimePicker(false);
                      if (selectedTime) {
                        setStartTime(selectedTime);
                        // 終了時間を開始時間の1時間後に自動設定
                        const newEndTime = new Date(selectedTime);
                        newEndTime.setHours(newEndTime.getHours() + 1);
                        setEndTime(newEndTime);
                      }
                    }}
                  />
                )
              )}

              {Platform.OS === 'ios' ? (
                <Modal
                  visible={showEndTimePicker}
                  transparent={true}
                  animationType="slide"
                  onRequestClose={() => setShowEndTimePicker(false)}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      <View style={styles.modalHeader}>
                        <TouchableOpacity
                          onPress={() => setShowEndTimePicker(false)}
                          style={styles.modalButton}
                        >
                          <Text style={styles.modalButtonText}>キャンセル</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>終了時間を選択</Text>
                        <TouchableOpacity
                          onPress={() => setShowEndTimePicker(false)}
                          style={styles.modalButton}
                        >
                          <Text style={[styles.modalButtonText, styles.doneText]}>完了</Text>
                        </TouchableOpacity>
                      </View>
                      <DateTimePicker
                        value={endTime}
                        mode="time"
                        is24Hour={true}
                        display="spinner"
                        onChange={(_, selectedTime) => {
                          if (selectedTime) {
                            setEndTime(selectedTime);
                          }
                        }}
                        style={styles.dateTimePicker}
                        textColor="#333"
                      />
                    </View>
                  </View>
                </Modal>
              ) : (
                showEndTimePicker && (
                  <DateTimePicker
                    value={endTime}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={(_, selectedTime) => {
                      setShowEndTimePicker(false);
                      if (selectedTime) {
                        setEndTime(selectedTime);
                      }
                    }}
                  />
                )
              )}
            </>
          )}
        </Card>

        <Card style={styles.card}>
          <ModalPicker
            label="繰り返し"
            selectedValue={repeatType}
            onValueChange={setRepeatType}
            options={repeatOptions}
          />
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
            <ModalPicker
              label="通知タイミング"
              selectedValue={notificationTime}
              onValueChange={setNotificationTime}
              options={notificationOptions}
            />
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
            title="更新"
            onPress={handleSave}
            loading={isLoading}
            style={styles.button}
          />
        </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  doneText: {
    fontWeight: '600',
  },
  dateTimePicker: {
    height: 216,
    marginHorizontal: 20,
  },
});