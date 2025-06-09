import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { StudySchedule } from './models';

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  ScheduleCreate: { date?: string };
  ScheduleDetail: { scheduleId: string };
  ScheduleEdit: { scheduleId: string; schedule: StudySchedule };
  StudyRecord: { scheduleId?: string; schedule?: StudySchedule };
  PromptCreate: undefined;
  PromptDetail: { promptId: string };
  PromptEdit: { promptId: string };
};

export type MainTabParamList = {
  Calendar: undefined;
  Statistics: undefined;
  Prompts: undefined;
  Settings: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, Screen>;

export type MainTabScreenProps<Screen extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, Screen>,
    StackScreenProps<RootStackParamList>
  >;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}