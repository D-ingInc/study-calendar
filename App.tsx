
// App.tsx

import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { AppProvider } from './src/contexts/AppContext';
import { AppNavigator } from './src/ui/navigation/AppNavigator';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// 通知の設定
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  useEffect(() => {
    // 通知の許可をリクエスト
    const requestPermissions = async () => {
      try {
        // Expo Goでの通知制限をチェック
        if (Constants.executionEnvironment === 'storeClient' && Platform.OS === 'android') {
          console.warn('Expo Go では通知機能に制限があります。完全な機能を利用するには Development Build をご利用ください。');
          return;
        }

        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.error('通知の許可が得られませんでした');
        }
      } catch (error) {
        console.error('通知許可の取得中にエラーが発生しました:', error);
      }
    };

    requestPermissions();

    // 通知タップ時のハンドラー
    const subscription = Notifications.addNotificationResponseReceivedListener(
      () => {
        // 通知がタップされた時の処理
        // ここで適切な画面に遷移する処理を追加
      }
    );

    return () => subscription.remove();
  }, []);

  return (
    <AppProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </AppProvider>
  );
}
