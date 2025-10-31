import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';

export async function requestAndGetLocation() {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        throw new Error('Location permission denied');
      }
    }

    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        pos => resolve(pos.coords),
        err => reject(err),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    });
  } catch (error) {
    throw error;
  }
}

export function watchLocationUpdates(callback, errorCallback) {
  const watchId = Geolocation.watchPosition(
    pos => callback(pos.coords),
    error => errorCallback?.(error),
    { enableHighAccuracy: true, distanceFilter: 5, interval: 5000 },
  );

  return () => Geolocation.clearWatch(watchId);
}
