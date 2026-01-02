import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  AuthStack: undefined;
  DriverTabs: NavigatorScreenParams<any>;
  PassengerTabs: NavigatorScreenParams<any>;
};
