import { useAuth } from '../../src/context/AuthContext';
// import PreventBackOnHome from '../utils/PreventBackOnHome.js';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import AuthStack from '../navigation/AuthStack.js';
import UserTabs from './PassengerTabs.js';
import { DriverDrawerOverlay } from '../navigation/DriverDrawerOverlay.js';
import { UsersDrawerOverlay } from './PassengerDrawerOverlay';
import DriverTabs from './DriverTabs';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { userType, user } = useAuth() || {};
  // For testing, you can mock:
  // const userType = 'driver';
  // const user = { name: 'test' };

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        swipeEnabled: true,
      }}
    >
      {!user ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : userType === 'driver' ? (
        <Stack.Screen name="DriverTabs" component={DriverTabs} />
      ) : (
        <Stack.Screen name="UserTabs" component={UserTabs} />
      )}
    </Stack.Navigator>
  );
}
