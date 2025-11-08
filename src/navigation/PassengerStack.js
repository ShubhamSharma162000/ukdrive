// HomeStack.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PassengerHomeScreen from '../screens/client/dashboard/PassngerHomeScreen'; // check file name
import PassengerRideHistory from '../screens/client/drawer/PassengerRideHistory';
import PassengerWallet from '../screens/client/drawer/PassengerWallet';
import PassengerSafetySettings from '../screens/client/drawer/PassengerSafetySettings';
import PassengerHelpSupport from '../screens/client/drawer/PassengerHelpSupport';
import PassengerFAQ from '../screens/client/drawer/PassengerFAQ';
import PrivacyPolicyScreen from '../screens/client/drawer/PrivacyPolicyScreen';

const Stack = createStackNavigator();

export default function PassengerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={PassengerHomeScreen} />
      <Stack.Screen name="RideHistory" component={PassengerRideHistory} />
      <Stack.Screen name="Wallet" component={PassengerWallet} />
      <Stack.Screen name="Safety" component={PassengerSafetySettings} />
      <Stack.Screen name="HelpSupport" component={PassengerHelpSupport} />
      <Stack.Screen name="FAQ" component={PassengerFAQ} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </Stack.Navigator>
  );
}
