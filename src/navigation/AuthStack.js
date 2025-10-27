import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ClientHomeScreen from '../screens/client/ClientHomeScree';
import { RoleSelectionScreen } from '../screens/RoleSelectionScreen';
import ClientLogInScreen from '../screens/client/ClientLogInScreen';
import ClientSignUpScreen from '../screens/client/ClientSignUpScreen';
import DriverLogInScreen from '../screens/driver/DriverLogInScreen';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="RoleSelection">
      <Stack.Screen
        name="RoleSelection"
        component={RoleSelectionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ClientLogIn"
        component={ClientLogInScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ClientSignUp"
        component={ClientSignUpScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DriverLogIn"
        component={DriverLogInScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DriverSignUp"
        component={DriverLogInScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HomeScreen"
        component={ClientHomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ClientHomeScreen"
        component={ClientHomeScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
