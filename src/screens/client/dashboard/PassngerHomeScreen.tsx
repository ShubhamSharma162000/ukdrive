import {
  Text,
  View,
  Pressable,
  useDripsyTheme,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'dripsy';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  PermissionsAndroid,
  Platform,
  StatusBar,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PassengerHamburgerButton } from '../../../helper/PassengerHamburgerButton.js';
import Geolocation from '@react-native-community/geolocation';
import {
  ArrowRight,
  ArrowLeft,
  Search,
  Layers,
  Clock,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geocoder from 'react-native-geocoding';
import { useAutoLocation } from '../../../hooks/use-auto-location';
import { useAuth } from '../../../context/AuthContext.js';
import { LocationSelector } from '../utils/LocationSelecter';
import polyline from '@mapbox/polyline';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';

const GOOGLE_MAPS_APIKEY = 'AIzaSyDREKZTN8iX9SoqlfOatpmw0bIDWiXHGGo';

type LatLng = { latitude: number; longitude: number };

interface RouteInfo {
  coordinates: LatLng[];
  distance: string;
  duration: string;
  summary: string;
}

const truncateWords = (text = '', wordLimit = 10) => {
  const words = text.trim().split(/\s+/);
  if (words.length <= wordLimit) return text;
  return words.slice(0, wordLimit).join(' ') + '...';
};

const PassengerHomeScreen = () => {
  const { theme } = useDripsyTheme();
  const navigation = useNavigation();
  const [expanded, setExpanded] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const [routes, setRoutes] = useState<any[]>([]);
  const mapRef = useRef<MapView>(null);

  const [step, setStep] = useState(1);
  const [step2Loading, setStep2Loading] = useState(false);
  const [step3Loading, setStep3Loading] = useState(false);
  const [routesData, setRoutesData] = useState<any[]>([]);
  const [selectedRouteCoords, setSelectedRouteCoords] = useState<any[]>([]);

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
  }>({ lat: 20.5937, lng: 78.9629, zoom: 5 });
  const [hasSelectedPickup, setHasSelectedPickup] = useState(false);
  const [pickupLocation, setPickupLocation] = useState('');
  const [shouldCalculateRoute, setShouldCalculateRoute] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
    fare: number;
    bikeFare: number;
    autoFare: number;
    cabFare: number;
    distanceKm: number;
    tollCharges?: number;
  } | null>(null);

  // Force map re-render when GPS button is clicked
  const [gpsButtonClickCount, setGpsButtonClickCount] = useState(0);

  // Track last selection timestamp for free mapping
  const [lastSelectionTimestamp, setLastSelectionTimestamp] = useState<{
    type: 'gps' | 'pickup' | 'destination' | 'vehicle';
    timestamp: number;
  } | null>(null);

  const [cachedPlaces, setCachedPlaces] = useState({});
  const [initialCurrentLocation, setInitialCurrentLocation] = useState<{
    name: string;
    coords: { latitude: number; longitude: number };
  } | null>(null);

  // CRITICAL FIX: Debounce pickup updates to prevent flicker during drag
  const debouncedPickupUpdate = useRef<NodeJS.Timeout | null>(null);

  //----------------------------for destination----------------

  const [destinationLocation, setDestinationLocation] = useState('');
  const [hasSelectedDestination, setHasSelectedDestination] = useState(false);

  //-------------------------utils-----------------------------
  const [selectedVehicleType, setSelectedVehicleType] = useState<
    'bike' | 'auto' | 'cab' | null
  >(null);
  // Control destination marker mode: true = fixed marker in center, false = marker at textbox position
  const [isDestinationMarkerFixed, setIsDestinationMarkerFixed] =
    useState(false);

  // Control pickup marker mode: true = fixed marker in center, false = marker at textbox position
  const [isPickupMarkerFixed, setIsPickupMarkerFixed] = useState(false);
  const [isLiveSharing, setIsLiveSharing] = useState(true);
  const [isManualPickupActive, setIsManualPickupActive] = useState(false);

  const { id } = useAuth();

  const [region, setRegion] = useState({
    latitude: 28.6139,
    longitude: 77.209,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const passengerLocation = useAutoLocation({
    userId: id || undefined,
    userType: 'passenger',
    autoStart: true,
    isManualPickupActive,
  });

  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
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

  const heightInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  const rotateInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  useEffect(() => {
    if (
      !pickupLocation ||
      pickupLocation.trim() === '' ||
      pickupLocation === 'From'
    ) {
      setHasSelectedPickup(false);
    }
  }, [pickupLocation]);

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Access Required',
            message: 'This app needs to access your location',
            buttonPositive: 'OK',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
      }
      Geolocation.getCurrentPosition(
        async position => {
          const { latitude, longitude } = position.coords;
          setRegion({
            ...region,
            latitude,
            longitude,
          });
          try {
            const apiKey = 'AIzaSyDREKZTN8iX9SoqlfOatpmw0bIDWiXHGGo';
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`,
            );

            const data = await response.json();
            const address =
              data.results?.[0]?.formatted_address || 'Current Location';
            setInitialCurrentLocation({
              name: address,
              coords: { latitude, longitude },
            });
          } catch (err) {
            console.log(err);
          }
        },
        error => console.error(error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    };
    requestLocationPermission();
  }, []);

  //handle the search result here to set the pickup location

  const handleSearchResultSelect = (result: any) => {
    console.log('📍 Search result selected from map:', result.name);

    // 1️⃣ Update the pickup location text
    setPickupLocation(result.address);

    // 2️⃣ Call a function to finalize pickup logic
    handlePickupSelectionComplete(result.address, result.coordinates);

    // 3️⃣ Update the map region to center on this location
    setLocationCoordinates({
      lat: result.coordinates.lat,
      lng: result.coordinates.lng,
      zoom: 16,
    });

    // 4️⃣ Optionally, store the selected location in local memory (not window)
    setCachedPlaces(prev => ({
      ...prev,
      [result.address]: result.coordinates,
    }));

    // 5️⃣ Clear the search results after selecting
    setSearchResults([]);
  };

  const handlePickupSelectionComplete = (
    address: string,
    coordinates: { lat: number; lng: number },
  ) => {
    console.log('📍 Pickup selection completed:', address, coordinates);

    // Mark pickup as selected
    setHasSelectedPickup(true);

    // Clear route info when pickup changes
    setRouteInfo(null);
    setShouldCalculateRoute(false);

    // Reset GPS button click count to allow free mapping
    setGpsButtonClickCount(0);

    // Update timestamp for pickup selection
    setLastSelectionTimestamp({
      type: 'pickup',
      timestamp: Date.now(),
    });

    // Don't update locationCoordinates to avoid map re-centering and jitter
    // The map should stay where the user positioned it
  };

  // Handler to update pickup address when map is moved in fixed mode (ONLY TEXTBOX UPDATE)
  const handlePickupLocationUpdate = (
    address: string,
    coordinates: { lat: number; lng: number },
  ) => {
    console.log(
      '📍 Pickup location update triggered (TEXTBOX ONLY):',
      address,
      coordinates,
    );

    // Clear existing timeout
    if (debouncedPickupUpdate.current) {
      clearTimeout(debouncedPickupUpdate.current);
    }

    // Debounce the actual update to prevent flicker
    debouncedPickupUpdate.current = setTimeout(() => {
      console.log(
        '📍 Executing pickup textbox update only:',
        address,
        coordinates,
      );

      // ONLY UPDATE TEXTBOX - Don't trigger other side effects
      setPickupLocation(address);

      setCachedPlaces(prev => ({
        ...prev,
        [address]: coordinates,
      }));
    }, 300); // Reduced debounce for better responsiveness
  };

  const handleRouteCalculated = (routeData: any) => {
    console.log(
      '🏠 Home page received route data from Google Maps:',
      routeData,
    );
    setRouteInfo({
      distance: routeData.distance,
      duration: routeData.duration,
      fare: routeData.bikeFare,
      bikeFare: routeData.bikeFare,
      autoFare: routeData.autoFare,
      cabFare: routeData.cabFare,
      distanceKm: routeData.distanceKm,
      tollCharges: routeData.tollCharges || 0,
    });
  };

  useEffect(() => {
    if (!routeInfo || !pickupLocation || !destinationLocation) {
      setSelectedVehicleType(null);
    }
  }, [routeInfo, pickupLocation, destinationLocation]);

  useEffect(() => {
    if (pickupLocation && destinationLocation) {
      // Google Maps component will handle route calculation and call handleRouteCalculated
      console.log(
        'Pickup/destination changed, Google Maps will calculate route',
      );
    }
  }, [pickupLocation, destinationLocation]);

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

      // Reset destination marker to normal mode when calculating route
      setIsDestinationMarkerFixed(false);

      // Reset pickup marker to normal mode when calculating route
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
      console.log('cbdjchdc dcbndjicnwcionconcnirne ', data);

      if (data.routes?.length > 0) {
        const points = polyline.decode(data.routes[0].overview_polyline.points);
        const routeCoords = points.map(([lat, lng]) => ({
          latitude: lat,
          longitude: lng,
        }));
        setRoutesData(data.routes);
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
        setRouteInfo({
          distance,
          duration,
          fare: bikeFare,
          bikeFare,
          autoFare,
          cabFare,
          distanceKm: distanceValue,
          tollCharges: 0,
        });

        if (!passengerLocation?.currentLocation || passengerLocation.error) {
          const centerLat =
            (routePickupCoords?.lat + routeDestinationCoords?.lat) / 2;
          const centerLng =
            (routePickupCoords?.lng + routeDestinationCoords?.lng) / 2;
          const adjustedCenterLat = centerLat + 0.01;

          setLocationCoordinates({
            lat: adjustedCenterLat,
            lng: centerLng,
            zoom: 13,
          });
          console.log('Centering map on route midpoint (shifted north)');
        } else {
          console.log('Keeping map centered on passenger GPS');
        }
      } else {
        console.warn(' No routes found between these points.');
        setRouteInfo(null);
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
      console.log('rides');
    } catch (error) {
      console.log(error);
    }
  };

  const openConfirmPage = async () => {
    try {
      // navigation.navigate('ConfirmRide');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <View style={{ flex: 1 }}>
        <SafeAreaProvider>
          <View sx={{ flex: 1 }}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={{ flex: 1 }}
              mapType="standard"
              region={region}
            >
              {selectedRouteCoords?.length > 0 && (
                <Polyline
                  coordinates={selectedRouteCoords}
                  strokeWidth={5}
                  strokeColor="#007AFF"
                />
              )}
              <Marker
                coordinate={{
                  latitude: region.latitude,
                  longitude: region.longitude,
                }}
                title="Your Location"
                description="You are here"
              />
            </MapView>
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
                      currentLocation={
                        pickupLocation || initialCurrentLocation?.name || 'From'
                      }
                      locationType="pickup"
                      onLocationChange={async (
                        location: any,
                        coordinates: any,
                      ) => {
                        console.log(
                          ' [PICKUP] Setting pickup location:',
                          location,
                        );
                        console.log(
                          ' [PICKUP] Setting pickup coordinates:',
                          coordinates,
                        );
                        console.log(
                          ' [PICKUP] Previous pickupLocation:',
                          pickupLocation,
                        );
                        console.log(
                          ' [PICKUP] Previous destinationLocation:',
                          destinationLocation,
                        );

                        setPickupLocation(location);
                        console.log(
                          ' [PICKUP] After setPickupLocation called with:',
                          location,
                        );

                        // Store coordinates if provided
                        if (coordinates) {
                          setCachedPlaces(prev => ({
                            ...prev,
                            [location]: coordinates,
                          }));

                          console.log(
                            ' [PICKUP] Pickup coordinates stored:',
                            coordinates,
                          );
                          console.log(
                            ' [PICKUP] Current pickupLocation state:',
                            pickupLocation,
                          );
                          console.log(
                            ' [PICKUP] Current destinationLocation state:',
                            destinationLocation,
                          );
                        }

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

                            console.log(
                              ' [PICKUP] Pickup coordinates stored:',
                              coordinates,
                            );
                            console.log(
                              ' [PICKUP] Current pickupLocation state:',
                              pickupLocation,
                            );
                            console.log(
                              ' [PICKUP] Current destinationLocation state:',
                              destinationLocation,
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

                                console.log(
                                  '📍 Coordinates stored locally for marker display:',
                                  {
                                    location,
                                    coords,
                                  },
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

                        if (newSharingState) {
                          if (
                            passengerLocation?.currentLocation &&
                            !passengerLocation.error
                          ) {
                            // Only center map on GPS location, don't update pickup location
                            setLocationCoordinates({
                              lat: passengerLocation.currentLocation.lat,
                              lng: passengerLocation.currentLocation.lng,
                              zoom: 16,
                            });

                            // Clear any existing route info when GPS location changes
                            setRouteInfo(null);
                          }
                        }
                      }}
                      passengerGPS={passengerLocation?.currentLocation}
                    ></LocationSelector>
                    <LocationSelector
                      currentLocation={destinationLocation || 'To'}
                      locationType="destination"
                      passengerGPS={passengerLocation?.currentLocation}
                      onLocationChange={async (
                        location: any,
                        coordinates: any,
                      ) => {
                        console.log(
                          '🎯 [DESTINATION] Setting destination location:',
                          location,
                        );
                        console.log(
                          '🎯 [DESTINATION] Setting destination coordinates:',
                          coordinates,
                        );
                        console.log(
                          '🎯 [DESTINATION] Previous destinationLocation:',
                          destinationLocation,
                        );
                        console.log(
                          '🎯 [DESTINATION] Previous pickupLocation:',
                          pickupLocation,
                        );

                        setDestinationLocation(location);
                        console.log(
                          '🎯 [DESTINATION] After setDestinationLocation called with:',
                          location,
                        );

                        // Store coordinates if provided
                        if (coordinates) {
                          setCachedPlaces(prev => ({
                            ...prev,
                            [location]: coordinates,
                          }));
                          console.log(
                            '✅ [DESTINATION] Destination coordinates stored:',
                            coordinates,
                          );
                          console.log(
                            '✅ [DESTINATION] Current destinationLocation state:',
                            destinationLocation,
                          );
                          console.log(
                            '✅ [DESTINATION] Current pickupLocation state:',
                            pickupLocation,
                          );
                        }

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
                              console.log(
                                ' Destination coordinates cached:',
                                coords,
                              );

                              // Center map on the selected destination location
                              setLocationCoordinates({
                                lat: coords.lat,
                                lng: coords.lng,
                                zoom: 16, // Close zoom for destination detail
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

                                console.log(
                                  '📍 Coordinates stored locally for marker display:',
                                  {
                                    location,
                                    coords,
                                  },
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
                              onValueChange={itemValue =>
                                setSelectedRouteIndex(itemValue)
                              }
                              style={{
                                backgroundColor: '#f5f5f5',
                                borderRadius: 10,
                                borderWidth: 2,
                                borderColor: '#f45a0dff',
                              }}
                              itemStyle={{
                                color: 'black',
                                fontSize: 16,
                              }}
                              dropdownIconColor="#f45a0d"
                            >
                              {routesData.map((route, index) => (
                                <Picker.Item
                                  key={index}
                                  label={`${route.summary} (${route?.legs?.[0]?.distance?.text}, ${route?.legs?.[0]?.duration?.text})`}
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
                          onPress={openConfirmPage}
                          sx={{
                            flex: 1,
                            alignItems: 'center',
                            bg: 'white',
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
                            <Text sx={{ fontWeight: 'bold', mt: 6 }}>Bike</Text>
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
                                0
                              </Text>
                            </View>
                          </View>
                        </Pressable>

                        <Pressable
                          sx={{
                            flex: 1,
                            alignItems: 'center',
                            bg: 'white',
                            borderRadius: 12,
                            p: 12,
                            mx: 4,
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
                            <Text sx={{ fontWeight: 'bold', mt: 6 }}>Auto</Text>
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
                                0
                              </Text>
                            </View>
                          </View>
                        </Pressable>

                        <Pressable
                          sx={{
                            flex: 1,
                            alignItems: 'center',
                            bg: 'white',
                            borderRadius: 12,
                            p: 12,
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
                                0
                              </Text>
                            </View>
                          </View>
                        </Pressable>
                      </View>
                    )}
                    <View
                      sx={{
                        bg: '#f0f4ff',
                        borderRadius: 12,
                        p: 16,
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        sx={{
                          fontSize: 16,
                          fontWeight: 'bold',
                          color: '#1e40af',
                          mb: 6,
                        }}
                      >
                        Select Vehicle Type
                      </Text>
                      <Text sx={{ color: '#3b82f6' }}>
                        Tap on a vehicle type to view available drivers
                      </Text>
                    </View>
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
        </SafeAreaProvider>
      </View>
    </>
  );
};

export default PassengerHomeScreen;
