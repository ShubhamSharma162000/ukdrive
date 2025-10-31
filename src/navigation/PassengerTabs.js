import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import PassengerRides from '../screens/client/dashboard/PassengerRides';
import PassengerNoifications from '../screens/client/dashboard/PassengerNotifications';
import PassengerProfile from '../screens/client/dashboard/PassengerProfile';
import PassengerHomeScreen from '../screens/client/dashboard/PassngerHomeScreen';

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
        },
        tabBarLabelStyle: { fontSize: 12 },
        tabBarIconStyle: { marginBottom: -2 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={PassengerHomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MyRide"
        component={PassengerRides}
        options={{
          tabBarLabel: 'Rides',
          tabBarIcon: ({ color, size }) => (
            <Icon name="history" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Notification"
        component={PassengerNoifications}
        options={{
          tabBarLabel: 'Notification',
          tabBarIcon: ({ color, size }) => (
            <Icon name="dollar" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={PassengerProfile}
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
