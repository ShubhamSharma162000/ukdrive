import React, { useEffect, useState } from 'react';
import { Image, LayoutAnimation } from 'react-native';
import { View, Text, ScrollView, Pressable } from 'dripsy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft } from 'lucide-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getDriverReviews,
  getEstimatePrice,
  updateRidesData,
} from '../../PassengerQuery';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../../../../context/AuthContext';
import { useAutoLocation } from '../../../../hooks/use-auto-location';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import Geocoder from 'react-native-geocoding';
import Api from '../../../../api/Api';
import { CommonActions } from '@react-navigation/native';
import { useToast } from '../../../../context/ToastContext';

const bookingSchema = z.object({
  vehicleChoice: z.string().min(1, 'Vehicle selection is required'),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const paymentOptions = [
  { label: 'GPay', icon: require('../../../../assets/vehicle/auto.png') },
  { label: 'PhonePe', icon: require('../../../../assets/vehicle/auto.png') },
  { label: 'Paytm', icon: require('../../../../assets/vehicle/auto.png') },
];

const isNightTime = () => {
  const hour = new Date().getHours();
  return hour >= 22 || hour < 4;
};

interface Ride {
  id: string;
  pickupLocation: string;
  destination: string;
  duration: string;
  distance: string;
  fare: Number;
  platformFee: Number;
  driverName: string;
  driverRating: string;
  vehicleType: string;
  vehicleNumber: string;
  pin: string;
}

export default function RideSummaryScreen({ route, navigation }: any) {
  const { id } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const {
    driver,
    pickupLocation,
    destinationLocation,
    destinationCoords,
    passengerLat,
    passengerLng,
    routeInfo,
  } = route.params;
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>();
  const [selectedPayment, setSelectedPayment] = useState('UPI Payment');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [driverReviews, setDriverReviews] = useState<any>(null);

  const [ride, setRide] = useState<Ride | null>(null);

  let selectedVehicle = driver?.vehicle_type;

  const finalPrice =
    driver?.vehicle_type === 'car'
      ? routeInfo?.cabTotal
      : driver?.vehicle_type === 'bike'
      ? routeInfo?.bikeTotal
      : driver?.vehicle_type === 'auto'
      ? routeInfo?.autoTotal
      : 0;

  const basePrice =
    driver?.vehicle_type === 'car'
      ? routeInfo?.cabFare
      : driver?.vehicle_type === 'bike'
      ? routeInfo?.bikeFare
      : driver?.vehicle_type === 'auto'
      ? routeInfo?.autoFare
      : 0;

  const platformFee =
    driver?.vehicle_type === 'bike'
      ? routeInfo?.bikeTotal - routeInfo?.bikeFare
      : driver?.vehicle_type === 'auto'
      ? routeInfo?.autoTotal - routeInfo?.autoFare
      : driver?.vehicle_type === 'car' || driver?.vehicle_type === 'cab'
      ? routeInfo?.cabTotal - routeInfo?.cabFare
      : 0;

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

  useEffect(() => {
    const getReviews = async () => {
      const response = await Api.post('/passenger/getdriversreview', {
        id: driver?.id,
        limit: '3',
      });
      console.log(response);
    };
  }, [driver?.id]);

  const passengerLocation = useAutoLocation({
    userId: id || undefined,
    userType: 'passenger',
    autoStart: true,
  });

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      vehicleChoice: driver?.vehicle_type,
    },
  });

  const createRide = useMutation({
    mutationFn: async () => {
      const backendVehicleType =
        driver?.vehicle_type === 'cab' ? 'car' : driver?.vehicle_type;
      let destinationLatParam = destinationLocation?.lat;
      let destinationLngParam = destinationLocation?.lng;

      // AUTOMATIC GEOCODING: If no destination coordinates from URL, try Google Places cache
      if (
        (!destinationLocation?.lat || !destinationLocation?.lng) &&
        destinationLocation
      ) {
        // Check Google Places coordinates cache
        const coords = await geocodeLocation(destinationLocation);

        if (!coords) {
          console.warn('geocodeLocation returned null');
          return; // or handle error
        }
        destinationLatParam = coords.lat.toString();
        destinationLngParam = coords.lng.toString();
      }
      // Fallback: Use Google Geocoding API in React Native
      else {
        try {
          const apiKey = 'AIzaSyDREKZTN8iX9SoqlfOatpmw0bIDWiXHGGo';

          const response = await axios.get(
            'https://maps.googleapis.com/maps/api/geocode/json',
            {
              params: {
                address: destinationLocation,
                key: apiKey,
              },
            },
          );

          if (
            response.data.status === 'OK' &&
            response.data.results &&
            response.data.results[0]
          ) {
            const location = response.data.results[0].geometry.location;

            destinationLatParam = location.lat.toString();
            destinationLngParam = location.lng.toString();

            console.log('React Native Geocoding Result:', location);
          } else {
            throw new Error('Geocoding failed: ' + response.data.status);
          }
        } catch (error) {
          console.error(' Google Geocoding API Error:', error);
        }
      }

      const rideData = {
        passenger_id: id,
        driver_id: driver?.id,
        fare: routeInfo?.fare,
        pickup_location: pickupLocation,
        pickup_lat: passengerLat,
        pickup_lng: passengerLng,
        destination: destinationLocation,
        destination_lat: destinationCoords?.lat,
        destination_lng: destinationCoords?.lng,
        vehicle_type: backendVehicleType,
        distance: routeInfo?.distance,
        duration: routeInfo?.duration,
        base_fare: routeInfo?.baseFare,
        toll_charges: 0,
        night_charges: routeInfo?.nightCharges,
        is_night_ride: routeInfo?.isNightRide,
        estimated_arrival: routeInfo?.duration,
        payment_method: selectedPayment,
        platform_fee: routeInfo?.platformFee,
        driver_earnings: routeInfo?.baseFare,
      };

      // CRITICAL: Ensure destination coordinates are always included
      if (!rideData.destination_lat || !rideData.destination_lng) {
        try {
          // Use Google Geocoding API to get destination coordinates
          const apiKey = 'AIzaSyDREKZTN8iX9SoqlfOatpmw0bIDWiXHGGo';
          if (apiKey) {
            const geocodeResponse = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                rideData.destination,
              )}&key=${apiKey}`,
            );
            const geocodeData = await geocodeResponse.json();

            if (geocodeData.results && geocodeData.results.length > 0) {
              const location = geocodeData.results[0].geometry.location;
              rideData.destination_lat = location.lat.toString();
              rideData.destination_lng = location.lng.toString();
            }
          }
        } catch (error) {
          console.warn(' Failed to geocode destination:', error);
        }
      }

      console.log(' Creating ride with destination coordinates:', {
        destination: rideData.destination,
        destinationLat: rideData.destination_lat,
        destinationLng: rideData.destination_lng,
      });

      const response = await updateRidesData(rideData);
      return response?.data;
    },
    onSuccess: async ride => {
      console.log(ride);
      await AsyncStorage.setItem('active_ride', JSON.stringify(ride));

      if (!ride.id) {
        showToast('Ride created but ID is missing. Please try again.', 'error');
        return;
      }

      // Check if ride is already confirmed (pre-selected driver) or requires driver selection
      if (ride.status === 'confirmed' && ride.driver) {
        showToast(
          'Ride Confirmed! ${ride.driver.vehicleType} ${ride.driver.vehicleNumber} has been assigned. Driver: ${ride.driver.name}',
          'success',
        );
      } else if (ride.availableDrivers?.length > 0) {
        const assignedDriver = ride.availableDrivers.find(
          (driver: any) => driver.assigned,
        );
        if (assignedDriver) {
          showToast(
            'Ride Confirmed! ${assignedDriver.vehicleType} ${assignedDriver.vehicleNumber} has been assigned. Driver: ${assignedDriver.name}',
            'success',
          );
        } else {
          showToast(
            'Ride Booked! Found ${ride.availableDrivers.length} available drivers. Select your preferred driver.',
            'error',
          );
        }
      } else {
        showToast(
          'No Drivers Available ! No drivers found in your area. Please try again later.',
          'error',
        );
      }
    },
    onError: error => {
      console.log(error);
      showToast('Booking Failed!', 'error');
    },
  });

  async function confirmRide() {
    createRide.mutate();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home', params: { openRide: true } }],
      }),
    );
  }

  return (
    <ScrollView
      sx={{
        flex: 1,
        backgroundColor: '#f5f5f5',
      }}
    >
      <View
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          px: 16,
          py: 14,
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
          backgroundColor: '#fff',
        }}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color="#374151" />
        </Pressable>
        <Text
          sx={{ fontSize: 18, fontWeight: '600', color: '#111827', ml: 12 }}
        >
          Regular {driver?.vehicle_type}
        </Text>
      </View>

      <View
        sx={{
          backgroundColor: 'white',
          margin: 12,
          padding: 16,
          borderRadius: 14,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 6,
        }}
      >
        <View sx={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            sx={{
              width: 100,
              height: 100,
              borderRadius: 999,
              overflow: 'hidden',
              borderWidth: 3,
              borderColor: '#f45a01ff',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              source={
                photo
                  ? { uri: photo }
                  : require('../../../../assets/images/default-profile.jpg')
              }
              style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
            />
          </View>

          <View sx={{ marginLeft: 12 }}>
            <Text sx={{ fontWeight: '700', fontSize: 16 }}>
              {driver?.full_name}
            </Text>
            <Text sx={{ color: 'gray', marginTop: 4 }}>⭐{driver?.rating}</Text>
            <Text sx={{ color: 'gray', marginTop: 4 }}>
              {driver?.license_number}
            </Text>
          </View>
        </View>

        <View sx={{ marginTop: 16 }}>
          <View sx={{ flexDirection: 'row' }}>
            <View
              sx={{
                width: 8,
                height: 8,
                borderRadius: 50,
                backgroundColor: '#f97316',
                mt: 6,
                mr: 10,
              }}
            />
            <Text sx={{ color: 'gray', fontWeight: '700' }}>PICKUP</Text>
          </View>
          <Text sx={{ marginTop: 4 }}>{pickupLocation}</Text>
          <View sx={{ flexDirection: 'row' }}>
            <View
              sx={{
                width: 8,
                height: 8,
                borderRadius: 50,
                backgroundColor: '#a006f3ff',
                mt: 20,
                mr: 10,
              }}
            />
            <Text sx={{ marginTop: 12, color: 'gray', fontWeight: '700' }}>
              DESTINATION
            </Text>
          </View>
          <Text sx={{ marginTop: 4 }}>{destinationLocation}</Text>

          <Text sx={{ marginTop: 10, color: 'gray' }}>
            {routeInfo?.distance} · {routeInfo?.duration}
          </Text>
        </View>
      </View>

      {driverReviews && (
        <View
          sx={{
            bg: 'white',
            borderRadius: 12,
            p: 3,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 6,
            borderWidth: 1,
            borderColor: '#e5e7eb',
            mb: 3,
          }}
        >
          <View sx={{ flexDirection: 'row', alignItems: 'center', mb: 2 }}>
            <View
              sx={{
                width: 28,
                height: 28,
                bg: '#fff4e6',
                borderRadius: 50,
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
              }}
            >
              <Svg width={18} height={18} fill="#ea580c" viewBox="0 0 20 20">
                <Path d="M18 10c0 3.866-3.582 7-8 7a8.841..." />
              </Svg>
            </View>

            <Text sx={{ fontWeight: '700', fontSize: 14, color: '#1f2937' }}>
              Driver Reviews
            </Text>
          </View>

          <View>
            {driverReviews ? (
              <View>
                {[1, 2, 3].map(i => (
                  <View
                    key={i}
                    sx={{
                      mb: 3,
                      borderBottomWidth: 1,
                      borderColor: '#f2f2f2',
                      pb: 2,
                    }}
                  >
                    <View
                      sx={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        mb: 2,
                      }}
                    >
                      <View
                        sx={{
                          width: 80,
                          height: 14,
                          bg: '#e5e7eb',
                          borderRadius: 6,
                        }}
                      />
                      <View
                        sx={{
                          width: 70,
                          height: 14,
                          bg: '#e5e7eb',
                          borderRadius: 6,
                        }}
                      />
                    </View>
                    <View
                      sx={{
                        width: '100%',
                        height: 10,
                        bg: '#e5e7eb',
                        borderRadius: 6,
                        mb: 1,
                      }}
                    />
                    <View
                      sx={{
                        width: '75%',
                        height: 10,
                        bg: '#e5e7eb',
                        borderRadius: 6,
                      }}
                    />
                  </View>
                ))}
              </View>
            ) : driverReviews?.length > 0 ? (
              driverReviews.map((review: any, index: any) => (
                <View
                  key={review.id || index}
                  sx={{
                    borderBottomWidth:
                      index === driverReviews.length - 1 ? 0 : 1,
                    borderColor: '#f2f2f2',
                    pb: 2,
                    mb: index === driverReviews.length - 1 ? 0 : 2,
                  }}
                >
                  <View
                    sx={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Text
                      sx={{ fontWeight: '600', color: '#1f2937', fontSize: 13 }}
                    >
                      {review.reviewerName || `Reviewer ${index + 1}`}
                    </Text>

                    <View sx={{ flexDirection: 'row', alignItems: 'center' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Svg
                          key={star}
                          width={16}
                          height={16}
                          fill={star <= review.rating ? '#fbbf24' : '#d1d5db'}
                          viewBox="0 0 20 20"
                        >
                          <Path d="M9.049 2.927c.3-.921 1.603..." />
                        </Svg>
                      ))}

                      <Text sx={{ ml: 1, fontSize: 10, color: '#6b7280' }}>
                        {review.rating}/5
                      </Text>
                    </View>
                  </View>

                  {review.comment ? (
                    <Text sx={{ color: '#4b5563', fontSize: 12 }}>
                      "{review.comment}"
                    </Text>
                  ) : (
                    <Text
                      sx={{
                        color: '#9ca3af',
                        fontSize: 12,
                        fontStyle: 'italic',
                      }}
                    >
                      No comment provided
                    </Text>
                  )}
                </View>
              ))
            ) : (
              <View sx={{ alignItems: 'center', py: 5 }}>
                <Svg width={48} height={48} fill="#d1d5db" viewBox="0 0 20 20">
                  <Path d="M18 10c0 3.866-3.582..." />
                </Svg>

                <Text sx={{ color: '#6b7280', mt: 1 }}>No reviews yet</Text>
                <Text sx={{ color: '#9ca3af', fontSize: 11, mt: 1 }}>
                  This driver hasn't received any reviews
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
      <View
        sx={{
          backgroundColor: 'white',
          margin: 12,
          padding: 16,
          borderRadius: 14,
        }}
      >
        <Text sx={{ fontWeight: '700', fontSize: 17, color: '#009900' }}>
          {routeInfo?.fare}
        </Text>

        <View
          sx={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 12,
          }}
        >
          <Text>Base Fare</Text>
          <Text>{routeInfo?.baseFare}</Text>
        </View>

        <View
          sx={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 10,
          }}
        >
          <Text>Taxes & Service Charge (15%)</Text>
          <Text>{routeInfo?.platformFee}</Text>
        </View>

        <View
          sx={{
            height: 1,
            backgroundColor: '#e6e6e6',
            marginVertical: 12,
          }}
        />

        <View
          sx={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Text sx={{ fontWeight: '700' }}>Total Amount</Text>
          <Text sx={{ fontWeight: '700', color: '#009900' }}>
            {routeInfo?.fare}
          </Text>
        </View>
      </View>

      <View
        sx={{
          backgroundColor: 'white',
          marginHorizontal: 12,
          padding: 18,
          borderRadius: 16,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 3,
        }}
      >
        <Pressable
          onPress={() => {
            LayoutAnimation.easeInEaseOut();
            setDropdownOpen(!dropdownOpen);
          }}
          sx={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View>
            <Text sx={{ fontWeight: '700', fontSize: 16 }}>
              {selectedPayment}
            </Text>
            <Text sx={{ color: 'gray', marginTop: 3, fontSize: 13 }}>
              Fast & secure UPI payment
            </Text>
          </View>

          <Text
            sx={{
              color: '#007bff',
              fontWeight: '600',
              fontSize: 15,
            }}
          >
            {dropdownOpen ? '▲' : '▼'}
          </Text>
        </Pressable>

        {dropdownOpen && (
          <View
            sx={{
              marginTop: 14,
              backgroundColor: '#fafafa',
              borderRadius: 14,
              paddingVertical: 6,
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            {paymentOptions.map(option => (
              <Pressable
                key={option.label}
                onPress={() => {
                  LayoutAnimation.easeInEaseOut();
                  setSelectedPayment(option.label);
                  setDropdownOpen(false);
                }}
                sx={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: '#eee',
                }}
              >
                <Image
                  source={option.icon}
                  style={{ width: 28, height: 28, marginRight: 12 }}
                />
                <Text sx={{ fontSize: 16 }}>{option.label}</Text>

                {selectedPayment === option.label && (
                  <Text
                    sx={{
                      marginLeft: 'auto',
                      color: '#10b981',
                      fontWeight: '700',
                    }}
                  >
                    ✓
                  </Text>
                )}
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <Pressable
        onPress={confirmRide}
        sx={{
          backgroundColor: '#ff7a00',
          padding: 16,
          margin: 12,
          borderRadius: 10,
          alignItems: 'center',
        }}
      >
        <Text sx={{ color: 'white', fontWeight: '700', fontSize: 17 }}>
          CONFIRM – ₹{routeInfo?.fare}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
