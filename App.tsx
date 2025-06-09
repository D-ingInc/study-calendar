
// App.tsx

import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from './src/contexts/AppContext';
import { AppNavigator } from './src/ui/navigation/AppNavigator';
import * as Notifications from 'expo-notifications';

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
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.error('通知の許可が得られませんでした');
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
