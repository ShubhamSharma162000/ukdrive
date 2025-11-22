import 'react-native-reanimated';
import { enableScreens } from 'react-native-screens';
enableScreens();
import React, { useEffect, useState } from 'react';
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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PassengerWebSocketProvider } from './src/context/passenger-websocket-context';
import * as Keychain from 'react-native-keychain';
import { DriverWebSocketProvider } from './src/context/driver-websocket-context';

export default function App() {
  const queryClient = new QueryClient();
  const [id, setId] = useState();
  useEffect(() => {
    const getId = async () => {
      const credentials = await Keychain.getGenericPassword();
      if (credentials) {
        const storedData = JSON.parse(credentials.password);
        console.log(storedData);
        setId(storedData?.id);
      }
    };
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DripsyProvider theme={theme}>
        <SafeAreaProvider>
          <SafeAreaView
            style={{ flex: 1, backgroundColor: '#fff' }}
            edges={['bottom', 'left', 'right']}
          >
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <DriverWebSocketProvider>
                  <PassengerWebSocketProvider>
                    <NavigationContainer>
                      <ToastProvider>
                        <AppNavigator />
                      </ToastProvider>
                    </NavigationContainer>
                  </PassengerWebSocketProvider>
                </DriverWebSocketProvider>
              </AuthProvider>
            </QueryClientProvider>
          </SafeAreaView>
        </SafeAreaProvider>
      </DripsyProvider>
    </GestureHandlerRootView>
  );
}
