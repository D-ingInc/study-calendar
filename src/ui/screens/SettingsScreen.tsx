
// src/ui/screens/SettingsScreen.tsx

import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Alert,
} from 'react-native';
import { useSettings, useStudyRecords } from '../../contexts/AppContext';
import { Card, Button, ModalPicker } from '../../components/common';
import { NotificationTime } from '../../types/models';

const notificationOptions = [
  { label: '5分前', value: NotificationTime.FIVE_MINUTES },
  { label: '15分前', value: NotificationTime.FIFTEEN_MINUTES },
  { label: '30分前', value: NotificationTime.THIRTY_MINUTES },
  { label: '1時間前', value: NotificationTime.ONE_HOUR },
  { label: '2時間前', value: NotificationTime.TWO_HOURS },
  { label: '3時間前', value: NotificationTime.THREE_HOURS },
];

const durationOptions = [
  { label: '30分', value: 30 },
  { label: '45分', value: 45 },
  { label: '60分', value: 60 },
  { label: '90分', value: 90 },
  { label: '120分', value: 120 },
];

const themeOptions = [
  { label: 'ライト', value: 'light' },
  { label: 'ダーク', value: 'dark' },
  { label: '自動', value: 'auto' },
];

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { clearAllRecords } = useStudyRecords();

  const handleNotificationTimeChange = async (value: NotificationTime) => {
    await updateSettings({ defaultNotificationTime: value });
  };

  const handleStudyDurationChange = async (value: number) => {
    await updateSettings({ defaultStudyDuration: value });
  };

  const handleThemeChange = async (value: 'light' | 'dark' | 'auto') => {
    await updateSettings({ theme: value });
  };

  const handleReset = () => {
    Alert.alert(
      '設定をリセット',
      'すべての設定をデフォルトに戻しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'リセット',
          style: 'destructive',
          onPress: async () => {
            await resetSettings();
            Alert.alert('完了', '設定をリセットしました');
          },
        },
      ]
    );
  };

  const handleResetStatistics = () => {
    Alert.alert(
      '統計情報をリセット',
      'すべての学習記録と統計情報を削除しますか？\n\nこの操作は取り消すことができません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => {
            // 二重確認
            Alert.alert(
              '最終確認',
              '本当にすべての統計情報を削除しますか？',
              [
                { text: 'キャンセル', style: 'cancel' },
                {
                  text: '削除',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await clearAllRecords();
                      Alert.alert('完了', 'すべての統計情報を削除しました');
                    } catch {
                      Alert.alert('エラー', '統計情報の削除に失敗しました');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card>
          <Text style={styles.sectionTitle}>デフォルト設定</Text>
          
          <View style={styles.field}>
            <Text style={styles.description}>
              新規予定作成時のデフォルト値
            </Text>
            <ModalPicker
              label="通知タイミング"
              selectedValue={settings.defaultNotificationTime}
              onValueChange={handleNotificationTimeChange}
              options={notificationOptions}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.description}>
              デフォルトの学習時間
            </Text>
            <ModalPicker
              label="学習時間"
              selectedValue={settings.defaultStudyDuration}
              onValueChange={handleStudyDurationChange}
              options={durationOptions}
            />
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>表示設定</Text>
          
          <ModalPicker
            label="テーマ"
            selectedValue={settings.theme}
            onValueChange={handleThemeChange}
            options={themeOptions}
          />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>アプリ情報</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>バージョン</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>データ使用量</Text>
            <Text style={styles.infoValue}>ローカルストレージのみ</Text>
          </View>
        </Card>

        <Button
          title="統計情報をリセット"
          variant="danger"
          onPress={handleResetStatistics}
          style={styles.resetButton}
        />
        
        <Button
          title="設定をリセット"
          variant="secondary"
          onPress={handleReset}
          style={styles.resetButton}
        />
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  description: {
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
  },
  resetButton: {
    marginTop: 32,
  },
});