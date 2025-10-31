import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import UserTabs from './PassengerTabs';
import PassengerLogInScreen from '../screens/client/ClientHomeScree';
import {
  Home,
  Car,
  History,
  Bell,
  Wallet,
  Shield,
  HelpCircle,
  MessageCircle,
  Lock,
  Globe,
  LogOut,
  Smile,
} from 'lucide-react-native';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = props => {
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 0,
      }}
    >
      <View
        style={{
          backgroundColor: '#f97316',
          paddingVertical: 30,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          margin: 10,
        }}
      >
        <Image
          source={{
            uri: 'https://i.pravatar.cc/100',
          }}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            marginRight: 15,
          }}
        />
        <View>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>
            John Doe
          </Text>
          <Text style={{ color: '#fff', fontSize: 14, opacity: 0.8 }}>
            johndoe@email.com
          </Text>
        </View>
      </View>

      <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: 10 }}>
        <DrawerItemList {...props} />
      </View>

      <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: '#eee' }}>
        <TouchableOpacity
          onPress={() => console.log('Sign out pressed')}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
        >
          <LogOut color="#f97316" size={20} />
          <Text style={{ fontSize: 15, color: '#333', fontWeight: '600' }}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

export const UsersDrawerOverlay = () => (
  <Drawer.Navigator
    drawerContent={props => <CustomDrawerContent {...props} />}
    screenOptions={{
      headerShown: false,
      drawerType: 'slide',
      swipeEnabled: true,
      drawerActiveTintColor: '#f97316',
      drawerInactiveTintColor: '#555',
      drawerLabelStyle: { fontSize: 15, fontWeight: '600' },
    }}
  >
    <Drawer.Screen
      name="HomeTabs"
      component={UserTabs}
      options={{
        drawerLabel: 'Home',
        drawerIcon: ({ color, size }) => <Home color={color} size={size} />,
      }}
    />
    <Drawer.Screen
      name="My Rides"
      component={PassengerLogInScreen}
      options={{
        drawerIcon: ({ color, size }) => <Car color={color} size={size} />,
      }}
    />
    <Drawer.Screen
      name="History"
      component={PassengerLogInScreen}
      options={{
        drawerIcon: ({ color, size }) => <History color={color} size={size} />,
      }}
    />
    <Drawer.Screen
      name="Notifications"
      component={PassengerLogInScreen}
      options={{
        drawerIcon: ({ color, size }) => <Bell color={color} size={size} />,
      }}
    />
    <Drawer.Screen
      name="My Wallet"
      component={PassengerLogInScreen}
      options={{
        drawerIcon: ({ color, size }) => <Wallet color={color} size={size} />,
      }}
    />
    <Drawer.Screen
      name="Safety settings"
      component={PassengerLogInScreen}
      options={{
        drawerIcon: ({ color, size }) => <Shield color={color} size={size} />,
      }}
    />
    <Drawer.Screen
      name="Help & Support"
      component={PassengerLogInScreen}
      options={{
        drawerIcon: ({ color, size }) => (
          <HelpCircle color={color} size={size} />
        ),
      }}
    />
    <Drawer.Screen
      name="FAQ"
      component={PassengerLogInScreen}
      options={{
        drawerIcon: ({ color, size }) => (
          <MessageCircle color={color} size={size} />
        ),
      }}
    />
    <Drawer.Screen
      name="Privacy Policy"
      component={PassengerLogInScreen}
      options={{
        drawerIcon: ({ color, size }) => <Lock color={color} size={size} />,
      }}
    />
    <Drawer.Screen
      name="Language"
      component={PassengerLogInScreen}
      options={{
        drawerIcon: ({ color, size }) => <Globe color={color} size={size} />,
      }}
    />
    <Drawer.Screen
      name="Enjoy your ride with us !"
      component={PassengerLogInScreen}
      options={{
        drawerIcon: ({ color, size }) => <Smile color={color} size={size} />,
      }}
    />
  </Drawer.Navigator>
);
