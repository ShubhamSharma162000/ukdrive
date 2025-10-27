import { createDrawerNavigator } from '@react-navigation/drawer';
// import DriverHome from '../screens/driver/dashboard/DriverHome';
// import DriverTabs from '../navigation/'
import ClientHomeScreen from '../screens/client/ClientHomeScree';

const Drawer = createDrawerNavigator();

export const DriverDrawerOverlay = () => (
  <Drawer.Navigator
    screenOptions={{
      headerShown: false,
      drawerType: 'slide',
      swipeEnabled: false,
    }}
  >
    <Drawer.Screen name="DriverTabs" component={DriverTabs} />
    <Drawer.Screen name="Settings" component={ClientHomeScreen} />
    <Drawer.Screen name="Help" component={ClientHomeScreen} />
  </Drawer.Navigator>
);
