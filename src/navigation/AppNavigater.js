import { useAuth } from '../../src/context/AuthContext';
// import PreventBackOnHome from '../utils/PreventBackOnHome.js';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import AuthStack from '../navigation/AuthStack.js';
import UserTabs from '../navigation/UserTabs.js';
import { DriverDrawerOverlay } from '../navigation/DriverDrawerOverlay.js';
import { UsersDrawerOverlay } from './UsersDrawerOverlay';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { userType, user } = useAuth();
  return (
    <>
      {/* <PreventBackOnHome /> */}
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!user ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : userType === 'driver' ? (
          <Stack.Screen
            name="DriverDrawerOverlay"
            component={DriverDrawerOverlay}
          />
        ) : (
          <Stack.Screen name="UserTabs" component={UsersDrawerOverlay} />
        )}
      </Stack.Navigator>
    </>
  );
}
