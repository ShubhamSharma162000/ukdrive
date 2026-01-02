// src/components/NotificationHandler.tsx
import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import { useAuth } from './context/AuthContext';
import Api from './api/Api';

export default function NotificationHandler(navigation: any) {
  const { userType, user, id } = useAuth();

  useEffect(() => {
    requestPermission();
    getFCMToken();
    setupListeners();
  }, [userType]);

  async function requestPermission() {
    await messaging().requestPermission();
  }

  async function getFCMToken() {
    const token = await messaging().getToken();
    console.log('FCM TOKEN:', token);
    if (token) {
      const response = await Api.post(
        '/fcm/register',
        {
          fcmToken: token,
          device_type: 'phone',
        },
        {
          headers: {
            'Content-Type': 'application.json',
            'x-session-passenger-id': id,
            'x-session-driver-id': id,
          },
        },
      );
      console.log(response);
    }
  }

  function setupListeners() {
    // Background state
    messaging().onNotificationOpenedApp(async remoteMessage => {
      if (userType === 'driver') {
        navigation.navigate('DriverTabs', {
          screen: 'HomeStack',
          params: { screen: 'Notifications' },
        });
      } else {
        navigation.navigate('PassengerTabs', {
          screen: 'HomeStack',
          params: { screen: 'Notifications' },
        });
      }
    });

    // Killed state
    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        if (!remoteMessage) return;
        if (userType === 'driver') {
          navigation.navigate('DriverTabs', {
            screen: 'HomeStack',
            params: { screen: 'Notifications' },
          });
        } else {
          navigation.navigate('PassengerTabs', {
            screen: 'HomeStack',
            params: { screen: 'Notifications' },
          });
        }
      });
  }

  return null;
}
