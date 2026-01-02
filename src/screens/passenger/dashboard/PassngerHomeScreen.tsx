import {
  Text,
  View,
  Pressable,
  useDripsyTheme,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'dripsy';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  PermissionsAndroid,
  Platform,
  StatusBar,
} from 'react-native';
import MapView, {
  Circle,
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PassengerHamburgerButton } from '../../../helper/PassengerHamburgerButton.js';
import Geolocation from 'react-native-geolocation-service';
import {
  ArrowRight,
  ArrowLeft,
  Search,
  Layers,
  Clock,
  MapPin,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geocoder from 'react-native-geocoding';
import { useAuth } from '../../../context/AuthContext.js';
import { LocationSelector } from '../utils/LocationSelecter';
import polyline from '@mapbox/polyline';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import RideInProgressSheet from '../utils/rides/RideInProgressSheet';
import { PassengerWebSocket } from '../../../websocket/websocket-manager';
import Api from '../../../api/Api.js';
import carIcon from '../../../assets/vehicle/car.png';
import bikeIcon from '../../../assets/vehicle/bike.png';
import autoIcon from '../../../assets/vehicle/auto.png';
import LinearGradient from 'react-native-linear-gradient';

const GOOGLE_MAPS_APIKEY = 'AIzaSyDREKZTN8iX9SoqlfOatpmw0bIDWiXHGGo';

type LatLng = { latitude: number; longitude: number };

interface RouteInfo {
  coordinates: LatLng[];
  distance: string;
  duration: string;
  summary: string;
}

export interface RawDriver {
  id: string;
  fullName: string;
  latitude: string | null;
  longitude: string | null;
  rating?: string;
  distance?: string;
  eta?: string;
  vehicleType?: string;
  phone?: string;
  vehicleRegistration?: string;
  isAvailable: boolean;
}

export interface TransformedDriver {
  id: string;
  name: string;
  vehicleType: string;
  location: {
    lat: number;
    lng: number;
  };
  rating: number;
  distance: string;
  eta: string;
  available: boolean;
  vehicleNumber: string;
  phone: string;
}

interface Driver {
  id: string;
  full_name: string;
  latitude: string;
  longitude: string;
  vehicle_type: string;
  rating: string;
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

const truncateWords = (text = '', wordLimit = 10) => {
  const words = text.trim().split(/\s+/);
  if (words.length <= wordLimit) return text;
  return words.slice(0, wordLimit).join(' ') + '...';
};

const placeCache = new Map<string, { lat: number; lng: number }>();

export function getCachedPlace(address: string) {
  return placeCache.get(address) || null;
}

export function setCachedPlace(
  address: string,
  coords: { lat: number; lng: number },
) {
  placeCache.set(address, coords);
}

const isNightTime = () => {
  const hour = new Date().getHours();
  return hour >= 22 || hour < 4;
};

const calculateFare = (fare: number, percent = 0.15) => {
  const baseWithPercent = fare + fare * percent;
  return isNightTime() ? baseWithPercent * 2 : baseWithPercent;
};

const calculateBaseFare = (fare: number) => {
  return isNightTime() ? fare * 2 : fare;
};

const calculatePlatformFee = (fare: number, percent = 0.15) => {
  const fee = fare * percent;
  return isNightTime() ? fee * 2 : fee;
};

const PassengerHomeScreen = ({ navigation, route }: any) => {
  const { theme } = useDripsyTheme();
  const [expanded, setExpanded] = useState(false); //for expanded ride information
  const animation = useRef(new Animated.Value(0)).current;
  const [routes, setRoutes] = useState<any[]>([]); //for set routes
  const mapRef = useRef<MapView>(null);
  const [step, setStep] = useState(1);
  const [step2Loading, setStep2Loading] = useState(false);
  const [step3Loading, setStep3Loading] = useState(false);
  const [routesData, setRoutesData] = useState<any[]>([]); //for routes data
  const [selectedRouteCoords, setSelectedRouteCoords] = useState<any[]>([]); //for selected routes
  const [searchResults, setSearchResults] = useState<
    Array<{
      id: string;
      name: string;
      address: string;
      coordinates: { lat: number; lng: number };
      type: string;
    }>
  >([]);
  const [locationCoordinates, setLocationCoordinates] = useState<{
    lat: number;
    lng: number;
    zoom: number;
  }>({ lat: 20.5937, lng: 78.9629, zoom: 5 }); //for location cordinates
  const [hasSelectedPickup, setHasSelectedPickup] = useState(false); //for check puckup location is selected
  const [pickupLocation, setPickupLocation] = useState(''); // pckup location
  const [shouldCalculateRoute, setShouldCalculateRoute] = useState(false); //for routes calculated
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
    fare: number;
    bikeFare: number;
    autoFare: number;
    cabFare: number;
    baseFare: number;
    nightCharges: number;
    distanceKm: number;
    tollCharges?: number;
    isNightRide?: boolean;
    platformFee?: number;
  } | null>(null);

  // Force map re-render when GPS button is clicked
  const [gpsButtonClickCount, setGpsButtonClickCount] = useState(0);

  // Track last selection timestamp for free mapping
  const [lastSelectionTimestamp, setLastSelectionTimestamp] = useState<{
    type: 'gps' | 'pickup' | 'destination' | 'vehicle';
    timestamp: number;
  } | null>(null);

  const [destinationLocation, setDestinationLocation] = useState('');
  const [hasSelectedDestination, setHasSelectedDestination] = useState(false);
  const [selectedVehicleType, setSelectedVehicleType] = useState<
    'bike' | 'auto' | 'cab' | null
  >(null);
  // Control destination marker mode: true = fixed marker in center, false = marker at textbox position
  const [isDestinationMarkerFixed, setIsDestinationMarkerFixed] =
    useState(false);

  // Control pickup marker mode: true = fixed marker in center, false = marker at textbox position
  const [isPickupMarkerFixed, setIsPickupMarkerFixed] = useState(false);
  const [isLiveSharing, setIsLiveSharing] = useState(true);
  const { id } = useAuth();
  const [ride, setRide] = useState(null);
  const [showRideSheet, setShowRideSheet] = useState(false);
  const [locationLoaded, setLocationLoaded] = useState(false);
  const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
  const [selectedRideVehicle, setSelectedRideVehicle] = useState('bike');
  const [filteredDriver, setFilteredDriver] = useState<Driver[]>([]);
  const [destinationCoords, setDestinationCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [passengerLat, setPassengerLat] = useState<number | null>(null);
  const [passengerLng, setPassengerLng] = useState<number | null>(null);

  useEffect(() => {
    const loadRide = async () => {
      if (route?.params?.openRide) {
        setShowRideSheet(true);
      }
    };
    loadRide();
  }, [route?.params?.openRide]);

  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0); //we have multiple routes so to select the 1 one
  const selectedRoute = routesData[selectedRouteIndex];
  const toggleExpand = () => {
    Animated.timing(animation, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
    setExpanded(!expanded);
  };

  const rotateInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const intervalRef = useRef<any>(null);

  const [region, setRegion] = useState({
    latitude: 29.75,
    longitude: 78.53,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  const [markerPosition, setMarkerPosition] = useState({
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    const getAllDrivers = async () => {
      if (region) {
        const result = await Api.get('/rides/getalldrivers', {
          params: {
            id: id,
            pickupLat: region.latitude,
            pickupLng: region.longitude,
            lat: region.latitude,
            lng: region.longitude,
          },
        });
        console.log(result?.data);
        setAllDrivers(result?.data);
      }
    };
    getAllDrivers();
  }, [region]);

  const [mapReady, setMapReady] = useState(false);

  const lastUpdate = useRef(Date.now());

  useEffect(() => {
    PassengerWebSocket.connect(id);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
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
              setPassengerLat(latitude);
              setPassengerLng(longitude);
              setMarkerPosition({ latitude, longitude });
              setRegion(prev => ({ ...prev, latitude, longitude }));
              setLocationLoaded(true);

              if (mapReady && mapRef.current) {
                mapRef.current.animateCamera({
                  center: { latitude, longitude },
                });
              }

              const sent = PassengerWebSocket.sendGPS(latitude, longitude);
              console.log('WS sent:', sent);
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
    }, [mapReady]),
  );

  const handlePickupSelectionComplete = (
    address: string,
    coordinates: { lat: number; lng: number },
  ) => {
    setHasSelectedPickup(true);
    setRouteInfo(null);
    setShouldCalculateRoute(false);
    setGpsButtonClickCount(0);
    setLastSelectionTimestamp({
      type: 'pickup',
      timestamp: Date.now(),
    });
  };

  useEffect(() => {
    if (!routeInfo || !pickupLocation || !destinationLocation) {
      setSelectedVehicleType(null);
    }
  }, [routeInfo, pickupLocation, destinationLocation]);

  //--------------------------CALCULATE LOGIC-------------------

  const calculatestep = async () => {
    try {
      setStep2Loading(true);
      const hasPickup =
        pickupLocation &&
        pickupLocation.trim() !== '' &&
        pickupLocation !== 'From';
      const hasDestination =
        destinationLocation &&
        destinationLocation.trim() !== '' &&
        destinationLocation !== 'To';

      if (!hasPickup || !hasDestination) {
        return;
      }

      console.log('🔍 Trip Details shown immediately - States:', {
        showLocationSelection: false,
        showTripDetails: true,
        pickupLocation,
        destinationLocation,
      });
      setIsDestinationMarkerFixed(false);
      setIsPickupMarkerFixed(false);

      if (
        pickupLocation &&
        pickupLocation.trim() !== '' &&
        pickupLocation !== 'From'
      ) {
        const coords = await geocodeLocation(pickupLocation);
        if (coords) {
          handlePickupSelectionComplete(pickupLocation, coords);
        }
      }

      setShouldCalculateRoute(true);

      calculateRoute(pickupLocation, destinationLocation)
        .then(() => {
          console.log(' Route calculation completed in background');
        })
        .catch(error => {
          console.error('Route calculation failed in background:', error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const calculateRoute = async (pickup: string, destination: string) => {
    if (!pickup || !destination) {
      setRouteInfo(null);
      return;
    }

    try {
      const routePickupCoords = await geocodeLocation(pickup);
      const routeDestinationCoords = await geocodeLocation(destination);

      if (
        !routePickupCoords ||
        !routeDestinationCoords ||
        routePickupCoords.lat == null ||
        routePickupCoords.lng == null ||
        routeDestinationCoords.lat == null ||
        routeDestinationCoords.lng == null
      ) {
        console.error(' Invalid geocode results:', {
          routePickupCoords,
          routeDestinationCoords,
        });
        setRouteInfo(null);
        return;
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${routePickupCoords.lat},${routePickupCoords.lng}&destination=${routeDestinationCoords.lat},${routeDestinationCoords.lng}&alternatives=true&key=${GOOGLE_MAPS_APIKEY}`,
      );
      const data = await response.json();

      if (data.routes?.length > 0) {
        const points = polyline.decode(data.routes[0].overview_polyline.points);
        const routeCoords = points.map(([lat, lng]) => ({
          latitude: lat,
          longitude: lng,
        }));
        setRoutesData(data.routes);
        console.log('here is routes data ', data?.routes);
        setStep2Loading(false);
        setStep(2);

        if (mapRef.current && routeCoords.length > 0) {
          mapRef.current.fitToCoordinates(routeCoords, {
            edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
            animated: true,
          });
        }

        setSelectedRouteCoords(routeCoords);

        const decodedRoutes: RouteInfo[] = data.routes.map((route: any) => ({
          coordinates: polyline
            .decode(route.overview_polyline.points)
            .map(([lat, lng]: [number, number]) => ({
              latitude: lat,
              longitude: lng,
            })),
          distance: route.legs[0]?.distance?.text ?? 'N/A',
          duration: route.legs[0]?.duration?.text ?? 'N/A',
          summary: route.summary ?? 'Unnamed Route',
        }));

        setRoutes(decodedRoutes);

        const selectedRoute = data.routes[0];
        const leg = selectedRoute.legs[0];
        const distance = leg.distance.text;
        const duration = leg.duration.text;
        const distanceValue = leg.distance.value / 1000;
        const bikeFare = Math.round(distanceValue * 8);
        const autoFare = Math.round(distanceValue * 15);
        const cabFare = Math.round(distanceValue * 18);
        const platformPercent = 0.15;
        let fare: number;
        let baseFare: number;

        const isNightRide = isNightTime();

        let selectedFare =
          selectedRideVehicle === 'bike'
            ? bikeFare
            : selectedRideVehicle === 'auto'
            ? autoFare
            : cabFare;

        // Calculate fare with percent + night multiplier
        fare = calculateFare(selectedFare);

        // Calculate base fare (night x 2)
        baseFare = calculateBaseFare(selectedFare);
        const platformFee = calculatePlatformFee(selectedFare);

        setRouteInfo({
          distance,
          duration,
          bikeFare,
          autoFare,
          cabFare,
          fare,
          baseFare,
          nightCharges: fare,
          isNightRide,
          distanceKm: distanceValue,
          tollCharges: 0,
          platformFee,
        });
      }
    } catch (error) {
      console.error(' Route calculation error:', error);
      setRouteInfo(null);
    }
  };

  useEffect(() => {
    if (selectedRouteCoords?.length > 0 && mapRef.current) {
      mapRef.current.fitToCoordinates(selectedRouteCoords, {
        edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
        animated: true,
      });
    }
  }, [selectedRouteCoords]);

  Geocoder.init('AIzaSyDREKZTN8iX9SoqlfOatpmw0bIDWiXHGGo');
  const geocodeLocation = async (locationName: string) => {
    if (!locationName) return null;

    try {
      const response = await Geocoder.from(locationName);

      if (response.results.length > 0) {
        const { lat, lng } = response.results[0].geometry.location;

        const coords = { lat, lng, zoom: 14 };
        console.log(`📍 Geocoded "${locationName}" →`, coords);

        // Store coordinates locally using AsyncStorage
        const cachedPlaces =
          (await AsyncStorage.getItem('googlePlacesCoordinates')) || '{}';
        const updatedPlaces = {
          ...JSON.parse(cachedPlaces),
          [locationName]: { lat, lng },
        };
        await AsyncStorage.setItem(
          'googlePlacesCoordinates',
          JSON.stringify(updatedPlaces),
        );

        console.log('💾 Coordinates saved in local storage:', updatedPlaces);

        return coords;
      } else {
        console.warn('No results found for', locationName);
        return null;
      }
    } catch (error) {
      console.error(' Geocoding error:', error);
      return null;
    }
  };

  //-----------------------------Get Rides------------------------------------------------------------

  const getRides = async () => {
    try {
      setStep(3);
    } catch (error) {
      console.log(error);
    }
  };

  const getDriverIcon = (vehicleType: string) => {
    switch (vehicleType?.toLowerCase()) {
      case 'car':
        return carIcon;
      case 'bike':
        return bikeIcon;
      case 'auto':
        return autoIcon;
      default:
        return carIcon;
    }
  };

  const handleVehicleSelect = (type: any) => {
    setSelectedRideVehicle(type);
    console.log(allDrivers);
    const filtered = allDrivers.filter(
      d => d.vehicle_type.toLowerCase() === type,
    );
    setFilteredDriver(filtered);
  };

  const getSelectedFare = () => {
    if (selectedRideVehicle === 'bike') return routeInfo?.bikeFare;
    if (selectedRideVehicle === 'auto') return routeInfo?.autoFare;
    if (selectedRideVehicle === 'car') return routeInfo?.cabFare;
    return 0;
  };

  const vehicleCounts = allDrivers.reduce(
    (acc, driver) => {
      if (driver.vehicle_type === 'bike') acc.bike++;
      if (driver.vehicle_type === 'auto') acc.auto++;
      if (driver.vehicle_type === 'cab' || driver.vehicle_type === 'car')
        acc.cab++;
      return acc;
    },
    { bike: 0, auto: 0, cab: 0 },
  );

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <View style={{ flex: 1 }}>
        <SafeAreaProvider>
          <View sx={{ flex: 1, overflow: 'hidden' }}>
            {locationLoaded ? (
              <MapView
                ref={mapRef}
                onMapReady={() => setMapReady(true)}
                provider={PROVIDER_GOOGLE}
                style={{ flex: 1 }}
                mapType="standard"
                initialRegion={region}
                customMapStyle={customStyle}
              >
                <Marker coordinate={markerPosition} />

                <Circle
                  center={markerPosition}
                  radius={300}
                  strokeWidth={1}
                  strokeColor="rgba(0, 122, 255, 0.5)"
                  fillColor="rgba(0, 122, 255, 0.1)"
                />

                {allDrivers.map((driver, index) => (
                  <Marker
                    key={driver.id || index}
                    coordinate={{
                      latitude: Number(driver.latitude),
                      longitude: Number(driver.longitude),
                    }}
                  >
                    <Image
                      source={getDriverIcon(driver.vehicle_type)}
                      style={{ width: 40, height: 40 }}
                      resizeMode="contain"
                    />
                  </Marker>
                ))}

                {destinationCoords && (
                  <Marker
                    coordinate={{
                      latitude: destinationCoords?.latitude,
                      longitude: destinationCoords.longitude,
                    }}
                    title="Destination"
                    pinColor="purple"
                  />
                )}
                {selectedRouteCoords.length > 0 && (
                  <Polyline
                    coordinates={selectedRouteCoords}
                    strokeWidth={8}
                    strokeColor="#1E90FF"
                  />
                )}
              </MapView>
            ) : (
              <View
                sx={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  mt: -50,
                }}
              >
                <ActivityIndicator size="large" color="blue" />

                <Text
                  sx={{
                    mt: 20,
                    fontSize: 18,
                    color: 'primary',
                    fontWeight: 'bold',
                  }}
                >
                  Loading your location...
                </Text>
              </View>
            )}

            <View
              sx={{
                backgroundColor: '#fa8233ff',
                position: 'absolute',
                bottom: 20,
                left: 0,
                right: 0,
                p: 12,
                m: 10,
                borderRadius: 'xl',
              }}
            >
              <ScrollView showsVerticalScrollIndicator={false}>
                <Pressable
                  onPress={toggleExpand}
                  sx={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderRadius: 12,
                  }}
                >
                  {expanded ? (
                    <Pressable
                      onPress={() => {
                        if (step === 3) {
                          setStep(2);
                        } else if (step === 2) {
                          setStep(1);
                        } else if (step === 1) {
                          setExpanded(false);
                        }
                      }}
                      sx={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderRadius: 12,
                      }}
                    >
                      <ArrowLeft size={24} color="white" strokeWidth={2.5} />
                    </Pressable>
                  ) : (
                    <ArrowLeft size={24} color="white" strokeWidth={2.5} />
                  )}
                  <Text
                    sx={{
                      color: 'white',
                      fontSize: 18,
                      fontWeight: '900',
                    }}
                  >
                    {expanded
                      ? step === 1
                        ? 'Enter Location'
                        : step === 2
                        ? 'Select Routes'
                        : step === 3
                        ? 'Ride Details '
                        : 'Enter Location'
                      : 'Where are you going?'}
                  </Text>

                  {!expanded && (
                    <View>
                      <Search size={24} color="white" strokeWidth={2.5} />
                    </View>
                  )}
                  <Animated.View
                    style={{ transform: [{ rotate: rotateInterpolate }] }}
                  ></Animated.View>
                </Pressable>
                {expanded && step === 1 && (
                  <>
                    <LocationSelector
                      currentLocation={pickupLocation || 'From'}
                      locationType="pickup"
                      onLocationChange={async (
                        location: any,
                        coordinates: any,
                      ) => {
                        setPickupLocation(location);

                        if (coordinates) {
                          try {
                            // Get existing cache
                            const existingCache = await AsyncStorage.getItem(
                              'googlePlacesCoordinates',
                            );
                            const parsedCache = existingCache
                              ? JSON.parse(existingCache)
                              : {};

                            // Add new entry
                            parsedCache[location] = coordinates;

                            // Save updated cache
                            await AsyncStorage.setItem(
                              'googlePlacesCoordinates',
                              JSON.stringify(parsedCache),
                            );
                          } catch (error) {
                            console.error(
                              ' Error storing pickup coordinates:',
                              error,
                            );
                          }
                        }

                        // Reset GPS button click count to allow free mapping
                        setGpsButtonClickCount(0);

                        // Update timestamp for pickup selection
                        setLastSelectionTimestamp({
                          type: 'pickup',
                          timestamp: Date.now(),
                        });

                        // Set destination marker to normal mode when searching pickup
                        setIsDestinationMarkerFixed(false);

                        // Set pickup marker to fixed mode when searching pickup
                        setIsPickupMarkerFixed(true);

                        if (
                          location &&
                          location.trim() !== '' &&
                          location !== 'From'
                        ) {
                          try {
                            const coords = await geocodeLocation(location);
                            if (coords) {
                              // Center map on the selected pickup location
                              setLocationCoordinates({
                                lat: coords.lat,
                                lng: coords.lng,
                                zoom: 16, // Close zoom for pickup detail
                              });

                              if (location && coords) {
                                // Get existing stored coordinates (if any)
                                const storedData = await AsyncStorage.getItem(
                                  'googlePlacesCoordinates',
                                );
                                const parsedData = storedData
                                  ? JSON.parse(storedData)
                                  : {};

                                // Add or update the new location
                                parsedData[location] = coords;

                                // Save it back to storage
                                await AsyncStorage.setItem(
                                  'googlePlacesCoordinates',
                                  JSON.stringify(parsedData),
                                );
                              }

                              // Clear any existing route info when pickup location changes
                              setRouteInfo(null);

                              // Disable route calculation when pickup location changes
                              setShouldCalculateRoute(false);
                            }
                          } catch (error) {
                            console.error(
                              'Failed to center map on pickup location:',
                              error,
                            );
                          }
                        }
                      }}
                      onSearchResults={setSearchResults}
                      isLiveSharing={isLiveSharing}
                      onLiveSharingToggle={async () => {
                        const newSharingState = !isLiveSharing;
                        setIsLiveSharing(newSharingState);
                        localStorage.setItem(
                          'passenger_live_sharing',
                          newSharingState.toString(),
                        );
                      }}
                    ></LocationSelector>
                    <LocationSelector
                      currentLocation={destinationLocation || 'To'}
                      locationType="destination"
                      onLocationChange={async (
                        location: any,
                        coordinates: any,
                      ) => {
                        setDestinationLocation(location);

                        // Mark destination as selected when user enters a valid location
                        if (
                          location &&
                          location.trim() !== '' &&
                          location !== 'To'
                        ) {
                          setHasSelectedDestination(true);
                          // Clear route info when destination changes
                          setRouteInfo(null);
                          setShouldCalculateRoute(false);
                        }

                        // Reset GPS button click count to allow free mapping
                        setGpsButtonClickCount(0);

                        // Update timestamp for destination selection
                        setLastSelectionTimestamp({
                          type: 'destination',
                          timestamp: Date.now(),
                        });

                        // Set destination marker to fixed mode when searching destination
                        setIsDestinationMarkerFixed(true);

                        // Set pickup marker to normal mode when searching destination
                        setIsPickupMarkerFixed(false);

                        // Ensure pickup is properly set before destination selection
                        // Only finalize pickup if it hasn't been finalized yet
                        if (
                          pickupLocation &&
                          pickupLocation.trim() !== '' &&
                          pickupLocation !== 'From' &&
                          !hasSelectedPickup
                        ) {
                          const coords = (window as any)
                            .googlePlacesCoordinates?.[pickupLocation];
                          if (coords) {
                            handlePickupSelectionComplete(
                              pickupLocation,
                              coords,
                            );
                          }
                        }

                        if (
                          location &&
                          location.trim() !== '' &&
                          location !== 'To'
                        ) {
                          try {
                            const coords = await geocodeLocation(location);
                            if (coords) {
                              // Center map on the selected destination location
                              setLocationCoordinates({
                                lat: coords.lat,
                                lng: coords.lng,
                                zoom: 16, // Close zoom for destination detail
                              });
                              setDestinationCoords({
                                latitude: coords.lat,
                                longitude: coords.lng,
                              });

                              if (location && coords) {
                                // Get existing stored coordinates (if any)
                                const storedData = await AsyncStorage.getItem(
                                  'ukdrive_destination_location',
                                );
                                const parsedData = storedData
                                  ? JSON.parse(storedData)
                                  : {};

                                // Add or update the new location
                                parsedData[location] = coords;

                                // Save it back to storage
                                await AsyncStorage.setItem(
                                  'ukdrive_destination_location',
                                  JSON.stringify(parsedData),
                                );
                              }

                              // Clear any existing route info when destination changes
                              setRouteInfo(null);

                              // Disable route calculation when destination changes
                              setShouldCalculateRoute(false);
                            }
                          } catch (error) {
                            console.error(
                              ' Failed to geocode destination during selection:',
                              error,
                            );
                          }
                        }
                      }}
                      onSearchResults={setSearchResults}
                    ></LocationSelector>
                    <Pressable
                      onPress={calculatestep}
                      sx={{
                        mt: 16,
                        bg: '#eefbe9ff',
                        borderRadius: 'm',
                        py: 10,
                      }}
                    >
                      {step2Loading ? (
                        <ActivityIndicator color="black" />
                      ) : (
                        <Text
                          sx={{
                            fontWeight: '900',
                            fontSize: 15,
                            textAlign: 'center',
                          }}
                        >
                          Calculated
                        </Text>
                      )}
                    </Pressable>
                  </>
                )}
                {expanded && step === 2 && (
                  <>
                    <View
                      sx={{
                        backgroundColor: '#ffffff',
                        p: 12,
                        m: 10,
                        borderRadius: 'l',
                      }}
                    >
                      <Text>Route Imformation </Text>
                      <Text
                        sx={{
                          lineHeight: 22,
                          fontSize: 16,
                          color: '#333',
                          fontWeight: 'bold',
                        }}
                      >
                        {`${truncateWords(
                          pickupLocation,
                          20,
                        )}   =>  ${truncateWords(destinationLocation, 20)}`}
                      </Text>
                      {Array.isArray(routesData) && routesData.length > 0 ? (
                        <View sx={{ pt: 16 }}>
                          <View
                            style={{
                              backgroundColor: '#ffffff',
                              borderRadius: 10,
                              borderWidth: 2,
                              borderColor: '#f45a0dff',
                              overflow: 'hidden',
                            }}
                          >
                            <Picker
                              selectedValue={selectedRouteIndex}
                              onValueChange={index => {
                                setSelectedRouteIndex(index);

                                // update selected route polyline
                                const selected = routes[index];
                                setSelectedRouteCoords(selected.coordinates);

                                // Fit map to selected route
                                if (mapRef.current) {
                                  mapRef.current.fitToCoordinates(
                                    selected.coordinates,
                                    {
                                      edgePadding: {
                                        top: 80,
                                        bottom: 80,
                                        left: 50,
                                        right: 50,
                                      },
                                      animated: true,
                                    },
                                  );
                                }
                              }}
                            >
                              {routesData.map((route, index) => (
                                <Picker.Item
                                  key={index}
                                  label={`${route.summary} (${route.legs[0]?.distance?.text}, ${route.legs[0]?.duration?.text})`}
                                  value={index}
                                />
                              ))}
                            </Picker>
                          </View>
                          <Pressable
                            onPress={getRides}
                            sx={{
                              mt: 16,
                              bg: '#f6894fff',
                              borderRadius: 'm',
                              py: 10,
                            }}
                          >
                            {step3Loading ? (
                              <ActivityIndicator color="black" />
                            ) : (
                              <Text
                                sx={{
                                  fontWeight: '900',
                                  fontSize: 15,
                                  textAlign: 'center',
                                  color: 'white',
                                }}
                              >
                                Apply Routes
                              </Text>
                            )}
                          </Pressable>
                        </View>
                      ) : (
                        <Text>No routes available</Text>
                      )}
                    </View>
                  </>
                )}

                {expanded && step === 3 && (
                  <>
                    <View
                      sx={{
                        bg: 'white',
                        borderRadius: 16,
                        p: 16,
                        mb: 20,
                        mt: 20,
                        shadowColor: '#000',
                        shadowOpacity: 0.1,
                        shadowRadius: 5,
                      }}
                    >
                      <View
                        sx={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          mb: 10,
                        }}
                      >
                        <Layers color="#f45a0d" size={28} />
                        <View sx={{ ml: 12 }}>
                          <Text sx={{ fontWeight: 'bold', fontSize: 18 }}>
                            {selectedRoute?.legs?.[0]?.distance?.text || 0}
                          </Text>
                          <View
                            sx={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              mt: 4,
                            }}
                          >
                            <Clock size={16} color="gray" />
                            <Text sx={{ color: 'gray', ml: 4 }}>
                              {selectedRoute?.legs?.[0]?.duration?.text || 0}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View
                        sx={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          bg: '#f8f8f8',
                          borderRadius: 10,
                          p: 10,
                        }}
                      >
                        <Text
                          numberOfLines={1}
                          sx={{ flex: 1, color: '#1a1a1a' }}
                        >
                          {pickupLocation}
                        </Text>
                        <ArrowRight color="#10b981" size={20} />
                        <Text
                          numberOfLines={1}
                          sx={{ flex: 1, color: '#ef4444', textAlign: 'right' }}
                        >
                          {destinationLocation}
                        </Text>
                      </View>
                    </View>
                    {routeInfo && (
                      <View
                        sx={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          mb: 20,
                        }}
                      >
                        <Pressable
                          onPress={() => handleVehicleSelect('bike')}
                          sx={{
                            flex: 1,
                            alignItems: 'center',
                            bg:
                              selectedRideVehicle === 'bike'
                                ? '#efb792ff'
                                : 'white',
                            borderRadius: 12,
                            p: 8,
                            mx: 4,
                            shadowColor: '#000',
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                          }}
                        >
                          <View style={{ flexDirection: 'row', gap: 6 }}>
                            <Image
                              source={require('../../../assets/icons/bike.png')}
                              resizeMode="contain"
                            />
                            <Text sx={{ fontWeight: 'bold', mt: 2 }}>Bike</Text>
                          </View>
                          <View style={{ flexDirection: 'row', gap: 6 }}>
                            <Text
                              sx={{
                                color: '#f45a0d',
                                fontWeight: 'bold',
                                fontSize: 16,
                              }}
                            >
                              ₹{routeInfo.bikeFare}
                            </Text>
                            <View
                              sx={{
                                bg: '#10b981',
                                borderRadius: 20,
                                px: 8,
                                mt: 4,
                              }}
                            >
                              <Text sx={{ color: 'white', fontSize: 12 }}>
                                {vehicleCounts?.bike}
                              </Text>
                            </View>
                          </View>
                        </Pressable>

                        <Pressable
                          onPress={() => handleVehicleSelect('auto')}
                          sx={{
                            flex: 1,
                            alignItems: 'center',
                            bg:
                              selectedRideVehicle === 'auto'
                                ? '#efb792ff'
                                : 'white',
                            borderRadius: 12,
                            p: 8,
                            mx: 1,
                            shadowColor: '#000',
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                          }}
                        >
                          {' '}
                          <View style={{ flexDirection: 'row', gap: 6 }}>
                            <Image
                              source={require('../../../assets/icons/auto.png')}
                              resizeMode="contain"
                            />
                            <Text sx={{ fontWeight: 'bold', mt: 2 }}>Auto</Text>
                          </View>
                          <View style={{ flexDirection: 'row', gap: 6 }}>
                            <Text
                              sx={{
                                color: '#f45a0d',
                                fontWeight: 'bold',
                                fontSize: 16,
                              }}
                            >
                              ₹{routeInfo.autoFare}
                            </Text>
                            <View
                              sx={{
                                bg: '#10b981',
                                borderRadius: 20,
                                px: 8,
                                mt: 4,
                              }}
                            >
                              <Text sx={{ color: 'white', fontSize: 12 }}>
                                {vehicleCounts?.auto}
                              </Text>
                            </View>
                          </View>
                        </Pressable>

                        <Pressable
                          onPress={() => handleVehicleSelect('car')}
                          sx={{
                            flex: 1,
                            alignItems: 'center',
                            bg:
                              selectedRideVehicle === 'car'
                                ? '#efb792ff'
                                : 'white',
                            borderRadius: 12,
                            p: 4,
                            mx: 4,
                            shadowColor: '#000',
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                          }}
                        >
                          <View style={{ flexDirection: 'row', gap: 6 }}>
                            <Image
                              source={require('../../../assets/icons/cab.png')}
                              resizeMode="contain"
                            />
                            <Text sx={{ fontWeight: 'bold', mt: 6 }}>Cab</Text>
                          </View>
                          <View style={{ flexDirection: 'row', gap: 6 }}>
                            <Text
                              sx={{
                                color: '#f45a0d',
                                fontWeight: 'bold',
                                fontSize: 16,
                              }}
                            >
                              ₹{routeInfo.cabFare}
                            </Text>
                            <View
                              sx={{
                                bg: '#10b981',
                                borderRadius: 20,
                                px: 8,
                                mt: 4,
                              }}
                            >
                              <Text sx={{ color: 'white', fontSize: 12 }}>
                                {vehicleCounts?.cab}
                              </Text>
                            </View>
                          </View>
                        </Pressable>
                      </View>
                    )}
                    {selectedRideVehicle && (
                      <>
                        {filteredDriver.length === 0 ? (
                          <Text sx={{ color: 'gray' }}>
                            No drivers available
                          </Text>
                        ) : (
                          filteredDriver.map((driver, index) => (
                            <Pressable
                              onPress={() => {
                                navigation
                                  .getParent()
                                  ?.navigate('PassengerTabs', {
                                    screen: 'HomeStack',
                                    params: {
                                      screen: 'RideSummaryScreen',
                                      params: {
                                        driver,
                                        pickupLocation,
                                        destinationLocation,
                                        destinationCoords,
                                        passengerLat,
                                        passengerLng,
                                        routeInfo,
                                      },
                                    },
                                  });
                              }}
                            >
                              <LinearGradient
                                colors={['#ffe7d6', '#ffd3b3']}
                                style={{
                                  marginHorizontal: 10,
                                  marginVertical: 8,
                                  borderRadius: 16,
                                  padding: 14,
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  elevation: 4,
                                }}
                              >
                                <View style={{ flex: 1 }}>
                                  <Text
                                    style={{
                                      fontSize: 16,
                                      fontWeight: 'bold',
                                      color: '#111',
                                    }}
                                  >
                                    {driver?.full_name}
                                  </Text>

                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                      marginTop: 6,
                                    }}
                                  >
                                    <Clock size={16} color="#444" />
                                    <Text
                                      style={{ marginLeft: 4, color: '#444' }}
                                    >
                                      {selectedRoute?.legs?.[0]?.duration
                                        ?.text || 0}
                                    </Text>

                                    <MapPin
                                      size={16}
                                      color="#444"
                                      style={{ marginLeft: 16 }}
                                    />
                                    <Text
                                      style={{ marginLeft: 4, color: '#444' }}
                                    >
                                      {selectedRoute?.legs?.[0]?.distance
                                        ?.text || 0}
                                    </Text>
                                  </View>
                                </View>

                                <View style={{ alignItems: 'flex-end' }}>
                                  <Text
                                    style={{
                                      color: '#10b981',
                                      fontWeight: 'bold',
                                      fontSize: 16,
                                    }}
                                  >
                                    ₹{getSelectedFare()}
                                  </Text>

                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      marginTop: 6,
                                    }}
                                  >
                                    <Text
                                      style={{ color: '#fbbf24', fontSize: 16 }}
                                    >
                                      ★
                                    </Text>
                                    <Text
                                      style={{
                                        marginLeft: 4,
                                        color: '#555',
                                        fontWeight: '600',
                                      }}
                                    >
                                      {driver?.rating}
                                    </Text>
                                  </View>
                                </View>
                              </LinearGradient>
                            </Pressable>
                          ))
                        )}
                      </>
                    )}
                  </>
                )}
              </ScrollView>
            </View>

            <View
              style={{
                position: 'absolute',
                top: 60,
                left: 10,
                zIndex: 9999,
                elevation: 10,
              }}
            >
              <PassengerHamburgerButton />
            </View>
          </View>
          {showRideSheet && (
            <RideInProgressSheet onClose={() => setShowRideSheet(false)} />
          )}
        </SafeAreaProvider>
      </View>
    </>
  );
};

export default PassengerHomeScreen;
