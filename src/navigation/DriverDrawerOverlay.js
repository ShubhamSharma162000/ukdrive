import React, { useState } from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'dripsy';
import PassengerTabs from './PassengerTabs';
import {
  Clock,
  Wallet,
  Shield,
  LifeBuoy,
  FileText,
  Globe,
  LogOut,
  Smile,
  Home,
  Languages,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import DriverTabs from './DriverTabs';

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
    marginVertical: -8,
    paddingVertical: 0,
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <TouchableOpacity
        onPress={() => navigation.navigate('DriverTabs', { screen: 'Profile' })}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          backgroundColor: '#cc09f4ff',
          borderRadius: 16,
        }}
      >
        <Image
          source={{ uri: 'https://i.pravatar.cc/100' }}
          style={{ width: 56, height: 56, borderRadius: 28, marginRight: 12 }}
        />
        <View>
          <Text style={{ color: '#fff', fontWeight: '700' }}>John Doe</Text>
          <Text style={{ color: '#fff', opacity: 0.85 }}>
            johndoe@email.com
          </Text>
        </View>
      </TouchableOpacity>

      <View style={{ marginTop: 8 }}>
        <DrawerItem
          label="Home"
          icon={({ size }) => <Home size={size} />}
          onPress={() =>
            navigation.navigate('DriverTabs', {
              screen: 'HomeStack',
              params: { screen: 'Home' },
            })
          }
        />

        <DrawerItem
          label="History"
          icon={({ size }) => <Clock size={size} />}
          onPress={() =>
            navigation.navigate('DriverTabs', {
              screen: 'HomeStack',
              params: { screen: 'History' },
            })
          }
        />
        <DrawerItem
          label="Notifications"
          icon={({ size }) => <Wallet size={size} />}
          onPress={() =>
            navigation.navigate('DriverTabs', {
              screen: 'HomeStack',
              params: { screen: 'Notifications' },
            })
          }
        />
        <DrawerItem
          label="Rewards"
          icon={({ size }) => <Shield size={size} />}
          onPress={() =>
            navigation.navigate('DriverTabs', {
              screen: 'HomeStack',
              params: { screen: 'Notifications' },
            })
          }
        />
        <DrawerItem
          label="Setting"
          icon={({ size }) => <LifeBuoy size={size} />}
          onPress={() =>
            navigation.navigate('DriverTabs', {
              screen: 'HomeStack',
              params: { screen: 'Notifications' },
            })
          }
        />
        <DrawerItem
          label="Help & Support"
          icon={({ size }) => <FileText size={size} />}
          onPress={() =>
            navigation.navigate('DriverTabs', {
              screen: 'HomeStack',
              params: { screen: 'HelpSupport' },
            })
          }
        />
        <DrawerItem
          label="Privacy Policy"
          icon={({ size }) => <Globe size={size} />}
          onPress={() =>
            navigation.navigate('DriverTabs', {
              screen: 'HomeStack',
              params: { screen: 'PrivacyPolicy' },
            })
          }
        />
        <DrawerItem
          label={t('language')}
          icon={({ color, size }) => <Languages color="black" size={size} />}
          onPress={() => setShowLanguageOptions(!showLanguageOptions)}
          labelStyle={{ fontSize: 14 }}
          style={{ drawerItemStyle }}
        />

        {showLanguageOptions && (
          <View
            style={{
              marginLeft: 50,
              marginRight: 20,
              backgroundColor: '#d99cfaff',
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
          label="Logout"
          icon={({ size }) => <LogOut size={size} />}
          onPress={() => logout && logout()}
        />
        <View
          style={{
            height: 1,
            backgroundColor: '#E0E0E0',
            marginVertical: 10,
          }}
        />
        <DrawerItem
          label="ENJOY YOUR RIDE WITH US ! "
          icon={({ size }) => <Smile size={size} />}
          onPress={() =>
            navigation.navigate('DriverTabs', {
              screen: 'HomeStack',
              params: { screen: 'Home' },
            })
          }
        />
      </View>
    </DrawerContentScrollView>
  );
}

export default function PassengerDrawerOverlay() {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="DriverTabs" component={DriverTabs} />
    </Drawer.Navigator>
  );
}
