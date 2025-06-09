// src/ui/navigation/AppNavigator.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Screens
import { CalendarScreen } from '../screens/CalendarScreen';
import { StatisticsScreen } from '../screens/StatisticsScreen';
import { PromptsScreen } from '../screens/PromptsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ScheduleCreateScreen } from '../screens/ScheduleCreateScreen';
import { ScheduleDetailScreen } from '../screens/ScheduleDetailScreen';
import { ScheduleEditScreen } from '../screens/ScheduleEditScreen';
import { StudyRecordScreen } from '../screens/StudyRecordScreen';
import { PromptCreateScreen } from '../screens/PromptCreateScreen';
import { PromptDetailScreen } from '../screens/PromptDetailScreen';
import { PromptEditScreen } from '../screens/PromptEditScreen';

// Navigation Types
import { RootStackParamList, MainTabParamList } from '../../types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

// タブナビゲーター
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Calendar':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Statistics':
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              break;
            case 'Prompts':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ title: 'カレンダー' }}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{ title: '統計' }}
      />
      <Tab.Screen
        name="Prompts"
        component={PromptsScreen}
        options={{ title: 'プロンプト' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: '設定' }}
      />
    </Tab.Navigator>
  );
}

// メインナビゲーター
export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ScheduleCreate"
          component={ScheduleCreateScreen}
          options={{ title: '予定を作成' }}
        />
        <Stack.Screen
          name="ScheduleDetail"
          component={ScheduleDetailScreen}
          options={{ title: '予定の詳細' }}
        />
        <Stack.Screen
          name="ScheduleEdit"
          component={ScheduleEditScreen}
          options={{ title: '予定を編集' }}
        />
        <Stack.Screen
          name="StudyRecord"
          component={StudyRecordScreen}
          options={{ title: '学習を記録' }}
        />
        <Stack.Screen
          name="PromptCreate"
          component={PromptCreateScreen}
          options={{ title: 'プロンプトを保存' }}
        />
        <Stack.Screen
          name="PromptDetail"
          component={PromptDetailScreen}
          options={{ title: 'プロンプトの詳細' }}
        />
        <Stack.Screen
          name="PromptEdit"
          component={PromptEditScreen}
          options={{ title: 'プロンプトを編集' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}