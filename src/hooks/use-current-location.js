import { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

export default function useCurrentLocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const requestPermission = async () => {
    if (Platform.OS === 'ios') return true;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      setErrorMsg('Permission request failed');
      return false;
    }
  };

  const getCurrentLocation = async () => {
    const ok = await requestPermission();
    if (!ok) {
      setErrorMsg('Permission denied');
      setLoading(false);
      return;
    }

    Geolocation.getCurrentPosition(
      pos => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLoading(false);
      },
      err => {
        setErrorMsg(err.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
        showLocationDialog: true,
        distanceFilter: 0,
      },
    );
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return { location, loading, errorMsg };
}
