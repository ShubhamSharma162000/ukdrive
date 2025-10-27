import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import ClientHomeScreen from '../screens/client/dashboard/ClientHomeScreen';

const Tab = createBottomTabNavigator();

export default function UserTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#fcab64ff',
        tabBarInactiveTintColor: '#151514ff',
        tabBarStyle: {
          height: 60,
          paddingVertical: 6,
          // backgroundColor: '#fee1c7ff',
        },
        tabBarLabelStyle: { fontSize: 12 },
        tabBarIconStyle: { marginBottom: -2 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={ClientHomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MyRide"
        component={ClientHomeScreen}
        options={{
          tabBarLabel: 'MyRide',
          tabBarIcon: ({ color, size }) => (
            <Icon name="history" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Notification"
        component={ClientHomeScreen}
        options={{
          tabBarLabel: 'Notification',
          tabBarIcon: ({ color, size }) => (
            <Icon name="dollar" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ClientHomeScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon name="dollar" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
