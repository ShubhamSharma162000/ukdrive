import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Image, View } from 'dripsy';
import { Bell, CarFront, Home, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DriverHome from '../screens/driver/dashboard/DriverHome';
import MyTrip from '../screens/driver/dashboard/MyTrip';
import DriverWallet, {
  MyWallet,
} from '../screens/driver/dashboard/DriverWallet';
import DriverProfile from '../screens/driver/dashboard/DriverProfile';
import PassengerLogInScreen from '../screens/driver/ClientHomej';

const Tab = createBottomTabNavigator();

export default function DriverTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        lazy: true,
        headerShown: false,
        tabBarActiveTintColor: '#f1790fff',
        tabBarInactiveTintColor: '#151514ff',
        tabBarStyle: {
          height: insets.bottom + 60,
          paddingBottom: insets.bottom,
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
        name="DriverHome"
        component={PassengerLogInScreen}
        options={{
          tabBarLabel: 'Home',

          tabBarIcon: ({ focused }) => (
            <View
              style={{
                backgroundColor: focused ? '#fdcd9fff' : 'transparent',
                flex: 1,
                padding: 18,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Home size={22} color={focused ? '#ea610cff' : '#060606ff'} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="MyTrip"
        component={MyTrip}
        options={{
          tabBarLabel: 'MyTrip',
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                backgroundColor: focused ? '#fdcd9fff' : 'transparent',
                padding: 10,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CarFront size={22} color={focused ? '#ea610cff' : '#060606ff'} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="MyWallet"
        component={DriverWallet}
        options={{
          tabBarLabel: 'MyWallet',
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                backgroundColor: focused ? '#fdcd9fff' : 'transparent',
                padding: 10,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={22} color={focused ? '#ea610cff' : '#060606ff'} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="DriverProfile"
        component={DriverProfile}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                backgroundColor: focused ? '#fdcd9fff' : 'transparent',
                padding: 10,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={22} color={focused ? '#ea610cff' : '#060606ff'} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
