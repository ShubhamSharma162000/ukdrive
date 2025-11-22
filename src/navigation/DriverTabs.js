import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Bell, User, CarFront } from 'lucide-react-native';
import PassengerStack from './PassengerStack';
import MyTrip from '../screens/driver/dashboard/MyTrip';
import DriverProfile from '../screens/driver/dashboard/DriverProfile';
import DriverWallet from '../screens/driver/dashboard/DriverWallet';
import DriverStack from './DriverStack';

const Tab = createBottomTabNavigator();

export default function DriverTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        lazy: true,
        headerShown: false,
        tabBarActiveTintColor: '#a827f8ff',
        tabBarInactiveTintColor: '#151514ff',
        tabBarStyle: {
          height: 60,
          paddingVertical: 4,
          backgroundColor: '#ffffff',
          padding: 4,
          alignContent: 'center',
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: { fontSize: 12 },
        tabBarActiveBackgroundColor: '#e0c4ff',
        tabBarInactiveBackgroundColor: '#ffffff',
      }}
    >
      <Tab.Screen
        name="HomeStack"
        component={DriverStack}
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          title: 'Home',
        }}
      />

      <Tab.Screen
        name="MyTrip"
        component={MyTrip}
        options={{
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
          title: 'My Trip',
        }}
      />

      <Tab.Screen
        name="MyWallet"
        component={DriverWallet}
        options={{
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
          title: 'Wallet',
        }}
      />
      <Tab.Screen
        name="DriverProfile"
        component={DriverProfile}
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}
