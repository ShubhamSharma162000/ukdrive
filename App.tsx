import React from 'react';
import 'react-native-reanimated';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DripsyProvider, View } from 'dripsy';
import { theme } from './src/theme/theme';
import AppNavigator from './src/navigation/AppNavigater';
import { AuthProvider } from './src/context/AuthContext';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ToastProvider } from './src/context/ToastContext';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DripsyProvider theme={theme}>
        <SafeAreaProvider>
          <AuthProvider>
            <NavigationContainer>
              <ToastProvider>
                <AppNavigator />
              </ToastProvider>
            </NavigationContainer>
          </AuthProvider>
        </SafeAreaProvider>
      </DripsyProvider>
    </GestureHandlerRootView>
  );
}
