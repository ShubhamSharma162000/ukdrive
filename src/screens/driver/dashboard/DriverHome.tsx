import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  PermissionsAndroid,
  Platform,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { View, Text, Image } from 'dripsy';
import Geolocation from 'react-native-geolocation-service';
import { useFocusEffect } from '@react-navigation/core';
import { useAuth } from '../../../context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAutoLocation } from '../../../hooks/use-auto-location';
import { Switch } from 'react-native-gesture-handler';
import { DriverWebSocket } from '../../../websocket/websocket-manager';
import Api from '../../../api/Api';
import { DriverHamburgerButton } from '../../../helper/DriverHamburgerButton';
import bikeIcon from '../../../assets/vehicle/bike.png';
import autoIcon from '../../../assets/vehicle/auto.png';
import carIcon from '../../../assets/vehicle/car.png';
import ActiveRideNotification from '../notifications/active-ride-notification';

export interface Driver {
  id: string;
  full_name: string;
  phone: string;
  vehicle_type?: 'motorcycle' | 'auto' | 'car' | string;
  vehicle_registration?: string;
  license_number?: string;
  rating: number; // decimal(2,1) → number
  total_rides: number;
  is_available: boolean;
  is_active: boolean;
  is_gps_sharing: boolean;
  wallet_balance: number; // decimal(10,2) → number
  current_location?: string;
  latitude?: number;
  longitude?: number;
  license_image_url?: string;
  aadhaar_image_url?: string;
  rc_image_url?: string;
  rc_number?: string;
  vehicle_owner_name?: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  verified_at?: Date | null;
  verified_by?: string | null;
  verification_notes?: string | null;
  created_at: Date;
}

const customStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#f2f2f2' }],
  },
  {
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4a4a4a' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#d9d9d9' }],
  },
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#d0d0d0' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#f7f7f7' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#e6e6e6' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#bfbfbf' }],
  },
  {
    featureType: 'transit',
    stylers: [{ visibility: 'off' }],
  },

  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#d2d9e5' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#a0a7b8' }],
  },
];

const getVehicleIcon = (vehicleType: string) => {
  const type = vehicleType?.toLowerCase() || '';
  if (type.includes('bike') || type.includes('motorcycle')) {
    return bikeIcon;
  } else if (
    type.includes('auto') ||
    type.includes('rickshaw') ||
    type.includes('tuk-tuk')
  ) {
    return autoIcon;
  } else if (
    type.includes('cab') ||
    type.includes('car') ||
    type.includes('taxi')
  ) {
    return carIcon;
  }
  return carIcon;
};

export default function DriverHomeScreen() {
  const mapRef = useRef<MapView | null>(null);
  const { id } = useAuth();
  const intervalRef = useRef<any>(null);
  const [gpsOnline, setGpsOnline] = useState(false);
  const driverLocation = useAutoLocation({
    driverId: id || undefined,
    userType: 'driver',
    autoStart: true,
  });

  const [driverData, setDriverData] = useState<Driver | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [activeRideId, setActiveRideId] = useState();

  const [region, setRegion] = useState({
    latitude: 29.75,
    longitude: 78.53,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [markerPosition, setMarkerPosition] = useState({
    latitude: 0,
    longitude: 0,
  });

  const [mapReady, setMapReady] = useState(false);

  const lastUpdate = useRef(Date.now());

  useEffect(() => {
    setShowPopup(true);
  }, []);

  useEffect(() => {
    DriverWebSocket.connect(id);
  }, [id]);

  useEffect(() => {
    const getDriverDetails = async () => {
      try {
        const res = await Api.get(`/driver/getdriverdata`, {
          params: { id },
        });
        const data = res?.data;
        setDriverData(data);
      } catch (err) {
        console.error(err);
      }
    };
    getDriverDetails();
  }, [id]);

  const vehicleIcon = getVehicleIcon(driverData?.vehicle_type || 'bike');

  useFocusEffect(
    useCallback(() => {
      if (!gpsOnline) return;

      const startGPS = async () => {
        if (Platform.OS === 'android') {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          );

          if (result !== 'granted') {
            console.log('Location permission denied');
            return;
          }
        }

        intervalRef.current = setInterval(() => {
          Geolocation.getCurrentPosition(
            pos => {
              const { latitude, longitude } = pos.coords;

              console.log('GPS:', latitude, longitude);
              setMarkerPosition({ latitude, longitude });
              setRegion(prev => ({ ...prev, latitude, longitude }));

              if (mapReady && mapRef.current) {
                mapRef.current.animateCamera({
                  center: { latitude, longitude },
                  //  zoom: camera.zoom,
                });
              }

              if (gpsOnline) {
                const sent = DriverWebSocket.sendGPS(latitude, longitude);
                console.log('WS sent:', sent);
              }
            },
            err => console.log('GPS ERROR:', err),
            { enableHighAccuracy: true, timeout: 15000 },
          );
        }, 5000);
      };

      startGPS();

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }, [gpsOnline, mapReady]),
  );

  const handleToggleGPS = async (value: any) => {
    try {
      setGpsOnline(value);

      const res = await Api.post('/driver/updatedrivergps', {
        value,
        driverId: id,
      });

      console.log(res.data);
    } catch (error: any) {
      console.log('API ERROR:', error.response?.data || error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaProvider>
        <View style={{ flex: 1 }}>
          <MapView
            ref={mapRef}
            onMapReady={() => setMapReady(true)}
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            mapType="standard"
            initialRegion={region}
            customMapStyle={customStyle}
          >
            <Marker coordinate={markerPosition}>
              <Image
                source={vehicleIcon}
                style={{ width: 50, height: 50 }}
                resizeMode="contain"
              />
            </Marker>
            <Circle
              center={markerPosition}
              radius={300}
              strokeWidth={1}
              strokeColor="rgba(0, 122, 255, 0.5)"
              fillColor="rgba(0, 122, 255, 0.1)"
            />
          </MapView>
          <View
            style={{
              position: 'absolute',
              top: 40,
              right: 20,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#cebefcff',
              padding: 8,
              borderRadius: 10,
              elevation: 3,
            }}
          >
            <Switch
              value={gpsOnline}
              onValueChange={handleToggleGPS}
              thumbColor={gpsOnline ? 'green' : 'red'}
            />
            <Text style={{ marginLeft: 10, fontWeight: 'bold' }}>
              {gpsOnline ? 'GPS ONLINE' : 'GO ONLINE'}
            </Text>
          </View>
        </View>
      </SafeAreaProvider>
      <View
        style={{
          position: 'absolute',
          top: 40,
          left: 10,
          zIndex: 9999,
          elevation: 10,
        }}
      >
        <DriverHamburgerButton />
      </View>
      <Modal
        visible={showPopup}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPopup(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              padding: 20,
              borderRadius: 12,
              width: '80%',
              alignItems: 'center',
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}
            >
              GPS is Offline
            </Text>
            <Text style={{ textAlign: 'center', marginBottom: 20 }}>
              Do you want to go online and share your location?
            </Text>

            <TouchableOpacity
              onPress={async () => {
                setShowPopup(false);
                await handleToggleGPS(true);
              }}
              style={{
                backgroundColor: 'green',
                paddingVertical: 10,
                paddingHorizontal: 25,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>
                Go Online
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowPopup(false)}
              style={{ marginTop: 10 }}
            >
              <Text style={{ color: 'gray' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* {activeRideId && (
        <DriverRideOverlay
          rideId={activeRideId}
          onClose={() => setActiveRideId(null)}
          driverLocation={driverCoordinates || undefined}
        />
      )} */}
      {id && (
        <ActiveRideNotification
          driverId={id}
          onViewDetails={(rideId: any) => {
            setActiveRideId(rideId);
          }}
        />
      )}
    </View>
  );
}
