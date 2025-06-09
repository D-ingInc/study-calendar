
// src/ui/screens/SettingsScreen.tsx

import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useSettings } from '../../contexts/AppContext';
import { Card, Button } from '../../components/common';
import { NotificationTime } from '../../types/models';

const notificationOptions = [
  { label: '5分前', value: NotificationTime.FIVE_MINUTES },
  { label: '15分前', value: NotificationTime.FIFTEEN_MINUTES },
  { label: '30分前', value: NotificationTime.THIRTY_MINUTES },
  { label: '1時間前', value: NotificationTime.ONE_HOUR },
  { label: '2時間前', value: NotificationTime.TWO_HOURS },
  { label: '3時間前', value: NotificationTime.THREE_HOURS },
];

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useSettings();

  const handleNotificationTimeChange = async (value: NotificationTime) => {
    await updateSettings({ defaultNotificationTime: value });
  };

  const handleStudyDurationChange = async (value: string) => {
    const duration = parseInt(value, 10);
    if (!isNaN(duration) && duration > 0) {
      await updateSettings({ defaultStudyDuration: duration });
    }
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card>
          <Text style={styles.sectionTitle}>デフォルト設定</Text>
          
          <View style={styles.field}>
            <Text style={styles.label}>通知タイミング</Text>
            <Text style={styles.description}>
              新規予定作成時のデフォルト値
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={settings.defaultNotificationTime}
                onValueChange={handleNotificationTimeChange}
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

          <View style={styles.field}>
            <Text style={styles.label}>学習時間（分）</Text>
            <Text style={styles.description}>
              デフォルトの学習時間
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={settings.defaultStudyDuration.toString()}
                onValueChange={handleStudyDurationChange}
                style={styles.picker}
              >
                <Picker.Item label="30分" value="30" />
                <Picker.Item label="45分" value="45" />
                <Picker.Item label="60分" value="60" />
                <Picker.Item label="90分" value="90" />
                <Picker.Item label="120分" value="120" />
              </Picker>
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>表示設定</Text>
          
          <View style={styles.field}>
            <Text style={styles.label}>テーマ</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={settings.theme}
                onValueChange={handleThemeChange}
                style={styles.picker}
              >
                <Picker.Item label="ライト" value="light" />
                <Picker.Item label="ダーク" value="dark" />
                <Picker.Item label="自動" value="auto" />
              </Picker>
            </View>
          </View>
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
          title="設定をリセット"
          variant="danger"
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