// import React, { useEffect, useState } from 'react';
// import {
//   createDrawerNavigator,
//   DrawerContentScrollView,
//   DrawerItem,
// } from '@react-navigation/drawer';
// import { View, Text, TouchableOpacity } from 'react-native';
// import { Image } from 'dripsy';
// import {
//   Car,
//   Clock,
//   Bell,
//   Wallet,
//   Shield,
//   LifeBuoy,
//   HelpCircle,
//   FileText,
//   Globe,
//   LogOut,
//   Smile,
// } from 'lucide-react-native';
// import { useTranslation } from 'react-i18next';
// import DriverTabs from './DriverTabs';
// import Testing from '../screens/client/Testing';
// import { useAuth } from '../context/AuthContext';
// import DriverProfile from '../screens/driver/dashboard/DriverProfile';
// import DriverWallet from '../screens/driver/dashboard/DriverWallet';
// import MyTrip from '../screens/driver/dashboard/MyTrip';
// import DriverNoifications from '../screens/driver/drawer/DriverNotifications';
// import DriverHistory from '../screens/driver/drawer/DriverHistory';
// import DriverHelpSupport from '../screens/driver/drawer/DriverHelpSupport';
// import PrivacyPolicyScreen from '../screens/client/drawer/PrivacyPolicyScreen';

// const Drawer = createDrawerNavigator();

// function CustomDrawerContent(props) {
//   const { navigation } = props;
//   const { user, logout } = useAuth() || {};
//   const { t, i18n } = useTranslation();
//   const [showLanguageOptions, setShowLanguageOptions] = useState(false);

//   useEffect(() => {
//     console.log('AuthContext mounted, user:', user);
//   }, [user]);

//   const changeLanguage = lang => {
//     i18n.changeLanguage(lang);
//     setShowLanguageOptions(false);
//   };

//   const drawerItemStyle = {
//     marginVertical: -8,
//     paddingVertical: 0,
//   };

//   return (
//     <View
//       style={{
//         flex: 1,
//         backgroundColor: '#c603f7ff',
//         paddingTop: 0,
//       }}
//     >
//       <TouchableOpacity
//         onPress={() => navigation.navigate('DriverProfile')}
//         style={{
//           paddingVertical: 20,
//           paddingHorizontal: 10,
//           flexDirection: 'row',
//           alignItems: 'center',
//           marginTop: 30,
//           gap: 20,
//         }}
//       >
//         <Image
//           source={{ uri: 'https://i.pravatar.cc/100' }}
//           style={{
//             width: 60,
//             height: 60,
//             borderRadius: 30,
//             marginRight: 15,
//           }}
//         />
//         <View>
//           <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>
//             {t('John Doe')}
//           </Text>
//           <Text style={{ color: '#fff', fontSize: 14, opacity: 0.8 }}>
//             {t('johndoe@email.com')}
//           </Text>
//         </View>
//       </TouchableOpacity>

//       <View
//         style={{
//           height: 1,
//           backgroundColor: '#ddd',
//           marginVertical: 8,
//         }}
//       />
//       <View style={{ flex: 1, gap: 2 }}>
//         <DrawerItem
//           label="Wallet"
//           icon={({ color, size }) => <Clock color="white" size={size} />}
//           onPress={() => {
//             navigation.navigate('DriverWallet');
//           }}
//           labelStyle={{ fontSize: 14, color: '#fff' }}
//           style={drawerItemStyle}
//         />

//         <DrawerItem
//           label="My Trip"
//           icon={({ color, size }) => <Clock color="white" size={size} />}
//           onPress={() => {
//             navigation.navigate('MyTrip');
//           }}
//           labelStyle={{ fontSize: 14, color: '#fff' }}
//           style={drawerItemStyle}
//         />

//         <DrawerItem
//           label="History"
//           icon={({ color, size }) => <Bell color="white" size={size} />}
//           onPress={() => {
//             navigation.navigate('DriverHistory');
//           }}
//           labelStyle={{ fontSize: 14, color: '#fff' }}
//           style={drawerItemStyle}
//         />

//         <DrawerItem
//           label="Notifications"
//           icon={({ color, size }) => <Wallet color="white" size={size} />}
//           onPress={() => {
//             navigation.navigate('DriverNoifications');
//           }}
//           labelStyle={{ fontSize: 14, color: '#fff' }}
//           style={drawerItemStyle}
//         />

//         <DrawerItem
//           label="Rewards"
//           icon={({ color, size }) => <LifeBuoy color="white" size={size} />}
//           onPress={() => {
//             navigation.navigate('Testing');
//           }}
//           labelStyle={{ fontSize: 14, color: '#fff' }}
//           style={drawerItemStyle}
//         />

//         <DrawerItem
//           label="Settings"
//           icon={({ color, size }) => <Shield color="white" size={size} />}
//           onPress={() => {
//             navigation.navigate('DriverProfile');
//           }}
//           labelStyle={{ fontSize: 14, color: '#fff' }}
//           style={drawerItemStyle}
//         />

//         <DrawerItem
//           label={t('language')}
//           icon={({ color, size }) => <Globe color="white" size={size} />}
//           onPress={() => setShowLanguageOptions(!showLanguageOptions)}
//           labelStyle={{ fontSize: 14, color: '#fff' }}
//           style={drawerItemStyle}
//         />

//         {showLanguageOptions && (
//           <View
//             style={{
//               marginLeft: 50,
//               marginRight: 20,
//               backgroundColor: '#d99cfaff',
//               paddingLeft: 20,
//               paddingVertical: 8,
//               borderRadius: 10,
//               overflow: 'hidden',
//             }}
//           >
//             <TouchableOpacity onPress={() => changeLanguage('en')}>
//               <Text style={{ color: '#fff', fontSize: 14, marginVertical: 5 }}>
//                 {t('english')}
//               </Text>
//             </TouchableOpacity>
//             <TouchableOpacity onPress={() => changeLanguage('hi')}>
//               <Text style={{ color: '#fff', fontSize: 14, marginVertical: 5 }}>
//                 {t('hindi')}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         <DrawerItem
//           label="Help & Support"
//           icon={({ color, size }) => <LifeBuoy color="white" size={size} />}
//           onPress={() => {
//             navigation.navigate('DriverHelpSupport');
//           }}
//           labelStyle={{ fontSize: 14, color: '#fff' }}
//           style={drawerItemStyle}
//         />

//         <DrawerItem
//           label="Privacy Policy"
//           icon={({ color, size }) => <LifeBuoy color="white" size={size} />}
//           onPress={() => {
//             navigation.navigate('PrivacyPolicyScreen');
//           }}
//           labelStyle={{ fontSize: 14, color: '#fff' }}
//           style={drawerItemStyle}
//         />

//         <DrawerItem
//           label="Sign Out"
//           icon={({ color, size }) => <LogOut color="white" size={size} />}
//           onPress={() => logout()}
//           labelStyle={{ fontSize: 14, color: '#fff' }}
//           style={drawerItemStyle}
//         />

//         <View
//           style={{
//             height: 1,
//             backgroundColor: '#ddd',
//             marginVertical: 10,
//           }}
//         />

//         <DrawerItem
//           label="Enjoy your ride with us!"
//           icon={({ color, size }) => <Smile color="white" size={size} />}
//           labelStyle={{ fontSize: 14, color: '#fff' }}
//           style={drawerItemStyle}
//         />
//       </View>
//     </View>
//   );
// }

// export default function DriverDrawerOverlay() {
//   return (
//     <Drawer.Navigator
//       drawerContent={props => <CustomDrawerContent {...props} />}
//       screenOptions={{ headerShown: false }}
//     >
//       <Drawer.Screen name="DriverTabs" component={DriverTabs} />
//       <Drawer.Screen name="DriverProfile" component={DriverProfile} />
//       <Drawer.Screen name="DriverWallet" component={DriverWallet} />
//       <Drawer.Screen name="MyTrip" component={MyTrip} />
//       <Drawer.Screen name="Testing" component={Testing} />
//       <Drawer.Screen name="DriverHistory" component={DriverHistory} />
//       <Drawer.Screen name="DriverNoifications" component={DriverNoifications} />
//       <Drawer.Screen name="DriverHelpSupport" component={DriverHelpSupport} />
//       <Drawer.Screen
//         name="PrivacyPolicyScreen"
//         component={PrivacyPolicyScreen}
//       />
//     </Drawer.Navigator>
//   );
// }
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
