import 'react-native-reanimated';
import { enableScreens } from 'react-native-screens';
enableScreens();
import React from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { DripsyProvider, View } from 'dripsy';
import { theme } from './src/theme/theme';
import AppNavigator from './src/navigation/AppNavigater';
import { AuthProvider } from './src/context/AuthContext';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ToastProvider } from './src/context/ToastContext';
import './src/i18n';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DripsyProvider theme={theme}>
        <SafeAreaProvider>
          <SafeAreaView
            style={{ flex: 1, backgroundColor: '#fff' }}
            edges={['bottom', 'left', 'right']}
          >
            <AuthProvider>
              <NavigationContainer>
                <ToastProvider>
                  <AppNavigator />
                </ToastProvider>
              </NavigationContainer>
            </AuthProvider>
          </SafeAreaView>
        </SafeAreaProvider>
      </DripsyProvider>
    </GestureHandlerRootView>
  );
}
