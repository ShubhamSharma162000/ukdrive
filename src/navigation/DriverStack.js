import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PassengerLogInScreen from '../screens/driver/ClientHomej';
import DriverHistory from '../screens/driver/drawer/DriverHistory';
import DriverNoifications from '../screens/driver/drawer/DriverNotifications';
import DriverHelpSupport from '../screens/driver/drawer/DriverHelpSupport';
import PrivacyPolicyScreen from '../screens/driver/drawer/PrivacyPolicyScreen';
import DriverHomeScreen from '../screens/driver/dashboard/DriverHome';

const Stack = createStackNavigator();

export default function DriverStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={DriverHomeScreen} />
      <Stack.Screen name="History" component={DriverHistory} />
      <Stack.Screen name="Notifications" component={DriverNoifications} />
      <Stack.Screen name="Rewards" component={PassengerLogInScreen} />
      <Stack.Screen name="HelpSupport" component={DriverHelpSupport} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </Stack.Navigator>
  );
}
