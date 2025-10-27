import { createDrawerNavigator } from '@react-navigation/drawer';
import UserTabs from './UserTabs';
import ClientHomeScreen from '../screens/client/ClientHomeScree';

const Drawer = createDrawerNavigator();

export const UsersDrawerOverlay = () => (
  <Drawer.Navigator
    screenOptions={{
      headerShown: false,
      drawerType: 'slide',
      swipeEnabled: false,
    }}
  >
    <Drawer.Screen name="HomeTabs" component={UserTabs} />
    <Drawer.Screen name="Settings" component={ClientHomeScreen} />
    <Drawer.Screen name="Help" component={ClientHomeScreen} />
  </Drawer.Navigator>
);
