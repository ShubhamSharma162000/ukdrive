import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../../src/context/AuthContext';

// Navigation components
import AuthStack from '../navigation/AuthStack';
import DriverDrawerOverlay from '../navigation/DriverDrawerOverlay';
import PassengerDrawerOverlay from './PassengerDrawerOverlay';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { userType, user } = useAuth() || {};
  console.log('user ', user);
  console.log(userType);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!user ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : user?.userType === 'driver' ? (
        <Stack.Screen name="DriverDashboard" component={DriverDrawerOverlay} />
      ) : (
        <Stack.Screen
          name="PassengerDashboard"
          component={PassengerDrawerOverlay}
        />
      )}
    </Stack.Navigator>
  );
}
