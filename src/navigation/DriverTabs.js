import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DriverHome from '../screens/driver/dashboard/DriverHome';
import { MyWallet } from '../screens/driver/dashboard/MyWallet';
import MyTrip from '../screens/driver/dashboard/MyTrip';
import DriverProfile from '../screens/driver/dashboard/DriverProfile';
import { Home, History, Wallet, User } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

export default function DriverTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#801da7ff',
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
        name="DriverHome"
        component={DriverHome}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <Home size={60} color="#f66a0c" strokeWidth={2.5} />
          ),
        }}
      />
      <Tab.Screen
        name="MyTrip"
        component={MyTrip}
        options={{
          tabBarLabel: 'My Trips',
          tabBarIcon: ({ color }) => <History color={color} size={24} />,
        }}
      />
      <Tab.Screen
        name="MyWallet"
        component={MyWallet}
        options={{
          tabBarLabel: 'Wallet',
          tabBarIcon: ({ color }) => <Wallet color={color} size={24} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={DriverProfile}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <User size={12} color={color} strokeWidth={2.5} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
