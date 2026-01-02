// HomeStack.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PassengerRideHistory from '../screens/passenger/drawer/PassengerRideHistory';
import PassengerWallet from '../screens/passenger/drawer/PassengerWallet';
import PassengerSafetySettings from '../screens/passenger/drawer/PassengerSafetySettings';
import PassengerHelpSupport from '../screens/passenger/drawer/PassengerHelpSupport';
import PassengerFAQ from '../screens/passenger/drawer/PassengerFAQ';
import PrivacyPolicyScreen from '../screens/passenger/drawer/PrivacyPolicyScreen';
import DetailHistoryScreen from '../screens/passenger/utils/DetailHistoryScreen';
import RateYourRide from '../screens/passenger/utils/RateYourRide';
import RideSummaryScreen from '../screens/passenger/utils/rides/RideSummaryScreen';
import EditProfile from '../screens/passenger/utils/EditProfile';
import PassengerHomeScreen from '../screens/passenger/dashboard/PassngerHomeScreen';

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
      <Stack.Screen
        name="DetailHistoryScreen"
        component={DetailHistoryScreen}
      />
      <Stack.Screen name="RateYourRide" component={RateYourRide} />
      <Stack.Screen name="RideSummaryScreen" component={RideSummaryScreen} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
    </Stack.Navigator>
  );
}
