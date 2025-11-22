import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RoleSelectionScreen } from '../screens/RoleSelectionScreen';
import DriverLogInScreen from '../screens/driver/DriverLogInScreen';
import DriverSignUpScreen from '../screens/driver/DriverSignUpScreen';
import PassengerLogInScreen from '../screens/passenger/PassengerLogInScreen';
import PassengerSignUpScreen from '../screens/passenger/PassengerSignUpScreen';

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
        component={PassengerLogInScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ClientSignUp"
        component={PassengerSignUpScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DriverLogIn"
        component={DriverLogInScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DriverSignUp"
        component={DriverSignUpScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HomeScreen"
        component={PassengerLogInScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PassengerLogInScreen"
        component={PassengerLogInScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
