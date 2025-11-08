import React, { useState } from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import { View, Text, TouchableOpacity } from 'react-native';
import PassengerTabs from './PassengerTabs';
import Testing from '../screens/client/Testing';
import { Image } from 'dripsy';
import {
  Car,
  Clock,
  Bell,
  Wallet,
  Shield,
  LifeBuoy,
  HelpCircle,
  FileText,
  Globe,
  LogOut,
  Smile,
} from 'lucide-react-native';
import PassengerRideHistory from '../screens/client/drawer/PassengerRideHistory';
import PassengerNoifications from '../screens/client/dashboard/PassengerNotifications';
import PassengerWallet from '../screens/client/drawer/PassengerWallet';
import PassengerSafetySettings from '../screens/client/drawer/PassengerSafetySettings';
import PassengerHelpSupport from '../screens/client/drawer/PassengerHelpSupport';
import PassengerFAQ from '../screens/client/drawer/PassengerFAQ';
import PrivacyPolicyScreen from '../screens/client/drawer/PrivacyPolicyScreen';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import PassengerProfile from '../screens/client/dashboard/PassengerProfile';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const { navigation } = props;
  const { logout } = useAuth() || {};
  const { t, i18n } = useTranslation();
  const [showLanguageOptions, setShowLanguageOptions] = useState(false);

  const changeLanguage = lang => {
    i18n.changeLanguage(lang);
    setShowLanguageOptions(false);
  };

  const drawerItemStyle = {
    marginVertical: -8, // reduces space between items
    paddingVertical: 0, // removes internal padding
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#f57c00',
        paddingTop: 0,
      }}
    >
      <TouchableOpacity
        onPress={() => navigation.navigate('PassengerProfile')}
        style={{
          paddingVertical: 20,
          paddingHorizontal: 10,
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 30,
          gap: 20,
        }}
      >
        <Image
          source={{ uri: 'https://i.pravatar.cc/100' }}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            marginRight: 15,
          }}
        />
        <View>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>
            {t('John Doe')}
          </Text>
          <Text style={{ color: '#fff', fontSize: 14, opacity: 0.8 }}>
            {t('johndoe@email.com')}
          </Text>
        </View>
      </TouchableOpacity>

      <View
        style={{
          height: 1,
          backgroundColor: '#ddd',
          marginVertical: 8,
        }}
      />
      <View style={{ flex: 1, gap: 2 }}>
        <DrawerItem
          label="My Rides"
          icon={({ color, size }) => <Car color="white" size={size} />}
          onPress={() => {
            navigation.navigate('PassengerTabs', { screen: 'MyRide' });
          }}
          labelStyle={{ fontSize: 14, color: '#fff' }}
          style={drawerItemStyle}
        />

        <DrawerItem
          label="History"
          icon={({ color, size }) => <Clock color="white" size={size} />}
          onPress={() => {
            navigation.navigate('PassengerRideHistory');
          }}
          labelStyle={{ fontSize: 14, color: '#fff' }}
          style={drawerItemStyle}
        />

        <DrawerItem
          label="Notifications"
          icon={({ color, size }) => <Bell color="white" size={size} />}
          onPress={() => {
            navigation.navigate('PassengerTabs', {
              screen: 'PassengerNotification',
            });
          }}
          labelStyle={{ fontSize: 14, color: '#fff' }}
          style={drawerItemStyle}
        />

        <DrawerItem
          label="My Wallet"
          icon={({ color, size }) => <Wallet color="white" size={size} />}
          onPress={() => {
            navigation.navigate('PassengerWallet');
          }}
          labelStyle={{ fontSize: 14, color: '#fff' }}
          style={drawerItemStyle}
        />

        <DrawerItem
          label="Safety Settings"
          icon={({ color, size }) => <Shield color="white" size={size} />}
          onPress={() => {
            navigation.navigate('PassengerSafetySettings');
          }}
          labelStyle={{ fontSize: 14, color: '#fff' }}
          style={drawerItemStyle}
        />

        <DrawerItem
          label="Help & Support"
          icon={({ color, size }) => <LifeBuoy color="white" size={size} />}
          onPress={() => {
            navigation.navigate('PassengerHelpSupport');
          }}
          labelStyle={{ fontSize: 14, color: '#fff' }}
          style={drawerItemStyle}
        />

        <DrawerItem
          label="FAQ"
          icon={({ color, size }) => <HelpCircle color="white" size={size} />}
          onPress={() => {
            navigation.navigate('PassengerFAQ');
          }}
          labelStyle={{ fontSize: 14, color: '#fff' }}
          style={drawerItemStyle}
        />

        <DrawerItem
          label="Privacy Policy"
          icon={({ color, size }) => <FileText color="white" size={size} />}
          onPress={() => {
            navigation.navigate('PrivacyPolicyScreen');
          }}
          labelStyle={{ fontSize: 14, color: '#fff' }}
          style={drawerItemStyle}
        />

        <DrawerItem
          label={t('language')}
          icon={({ color, size }) => <Globe color="white" size={size} />}
          onPress={() => setShowLanguageOptions(!showLanguageOptions)}
          labelStyle={{ fontSize: 14, color: '#fff' }}
          style={drawerItemStyle}
        />

        {showLanguageOptions && (
          <View
            style={{
              marginLeft: 50,
              marginRight: 20,
              backgroundColor: '#f5a75eff',
              paddingLeft: 20,
              paddingVertical: 8,
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            <TouchableOpacity onPress={() => changeLanguage('en')}>
              <Text style={{ color: '#fff', fontSize: 14, marginVertical: 5 }}>
                {t('english')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => changeLanguage('hi')}>
              <Text style={{ color: '#fff', fontSize: 14, marginVertical: 5 }}>
                {t('hindi')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <DrawerItem
          label="Sign Out"
          icon={({ color, size }) => <LogOut color="white" size={size} />}
          onPress={() => logout()}
          labelStyle={{ fontSize: 14, color: '#fff' }}
          style={drawerItemStyle}
        />

        <View
          style={{
            height: 1,
            backgroundColor: '#ddd',
            marginVertical: 10,
          }}
        />

        <DrawerItem
          label="Enjoy your ride with us!"
          icon={({ color, size }) => <Smile color="white" size={size} />}
          labelStyle={{ fontSize: 14, color: '#fff' }}
          style={drawerItemStyle}
        />
      </View>
    </View>
  );
}

export default function PassengerDrawerOverlay() {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="PassengerTabs" component={PassengerTabs} />
      <Drawer.Screen
        name="PassengerRideHistory"
        component={PassengerRideHistory}
      />
      <Drawer.Screen name="PassengerProfile" component={PassengerProfile} />
      <Drawer.Screen name="PassengerWallet" component={PassengerWallet} />
      <Drawer.Screen
        name="PassengerSafetySettings"
        component={PassengerSafetySettings}
      />
      <Drawer.Screen
        name="PassengerHelpSupport"
        component={PassengerHelpSupport}
      />
      <Drawer.Screen name="PassengerFAQ" component={PassengerFAQ} />
      <Drawer.Screen
        name="PrivacyPolicyScreen"
        component={PrivacyPolicyScreen}
      />
    </Drawer.Navigator>
  );
}
