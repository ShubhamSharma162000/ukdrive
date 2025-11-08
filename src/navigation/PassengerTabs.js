import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PassengerNotifications from '../screens/client/dashboard/PassengerNotifications';
import PassengerProfile from '../screens/client/dashboard/PassengerProfile';
import { Home, Bell, User, CarFront } from 'lucide-react-native';
import PassengerStack from './PassengerStack';
import PassengerRides from '../screens/client/dashboard/PassengerRides';

const Tab = createBottomTabNavigator();

export default function PassengerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        lazy: true,
        headerShown: false,
        tabBarActiveTintColor: '#f1790fff',
        tabBarInactiveTintColor: '#151514ff',
        tabBarStyle: {
          height: 60,
          paddingVertical: 4,
          backgroundColor: '#ffffff',
          padding: 4,
          alignContent: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 5,
        },
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tab.Screen
        name="HomeStack"
        component={PassengerStack}
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          title: 'Home',
        }}
      />

      <Tab.Screen
        name="MyRide"
        component={PassengerRides}
        options={{
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
          title: 'My Ride',
        }}
      />

      <Tab.Screen
        name="Notifications"
        component={PassengerNotifications}
        options={{
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
          title: 'Notifications',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={PassengerProfile}
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}
