import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StatusBar,
  Switch,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Image, Text, View } from 'dripsy';
import Geolocation, {
  GeoPosition,
  GeoError,
} from 'react-native-geolocation-service';

// Helper function to request permission and get initial location
export async function requestAndGetLocation(): Promise<{
  latitude: number;
  longitude: number;
}> {
  return new Promise(async (resolve, reject) => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          reject(new Error('Location permission denied'));
          return;
        }
      }

      Geolocation.getCurrentPosition(
        (position: GeoPosition) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        (error: GeoError) => reject(error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    } catch (err) {
      reject(err);
    }
  });
}

// Helper to watch location updates
export function watchLocationUpdates(
  onLocation: (coords: { latitude: number; longitude: number }) => void,
  onError: (error: GeoError) => void,
): () => void {
  const watchId = Geolocation.watchPosition(
    (position: GeoPosition) => {
      const { latitude, longitude } = position.coords;
      onLocation({ latitude, longitude });
    },
    onError,
    { enableHighAccuracy: true, distanceFilter: 0, interval: 5000 },
  );

  // Properly typed cleanup
  return () => Geolocation.clearWatch(watchId);
}

export default function DriverHome() {
  const mapRef = useRef<MapView | null>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(true);

  useEffect(() => {
    let clearWatch: (() => void) | undefined;

    const initLocation = async () => {
      try {
        const coords = await requestAndGetLocation();
        setLocation(coords);

        clearWatch = watchLocationUpdates(
          newCoords => {
            setLocation(newCoords);
            mapRef.current?.animateToRegion(
              {
                ...newCoords,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              } as Region,
              500,
            );
          },
          err => setErrorMsg(err.message),
        );
      } catch (error: any) {
        setErrorMsg(error.message);
        Alert.alert('Location Error', error.message);
      }
    };

    initLocation();

    return () => {
      if (clearWatch) clearWatch();
    };
  }, []);

  if (errorMsg) {
    return (
      <View sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text sx={{ color: 'red', fontSize: 16 }}>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View
        sx={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          bg: '#F9FAFB',
        }}
      >
        <ActivityIndicator size="large" color="#4B0082" />
        <Text
          sx={{ mt: 12, color: '#4B0082', fontWeight: '600', fontSize: 16 }}
        >
          Fetching your location...
        </Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <SafeAreaProvider>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          mapType="standard"
          style={{ flex: 1 }}
          region={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={location}>
            <Image
              source={require('../../../assets/vehicle/car.png')}
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
          </Marker>
        </MapView>

        <View
          sx={{
            position: 'absolute',
            top: 80,
            right: 20,
            flexDirection: 'row',
            alignItems: 'center',
            bg: 'white',
            py: 1,
            px: 10,
            borderRadius: 12,
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <Text sx={{ color: 'black', fontWeight: '600', mr: 8, fontSize: 15 }}>
            Go Online
          </Text>
          <Switch
            value={isSharing}
            onValueChange={value => setIsSharing(value)}
            trackColor={{ false: '#f8300cff', true: '#81C784' }}
            thumbColor={isSharing ? '#ffffff' : '#f4f3f4'}
            style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }] }}
          />
        </View>
      </SafeAreaProvider>
    </>
  );
}
