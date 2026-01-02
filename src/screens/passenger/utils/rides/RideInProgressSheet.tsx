import React, { useEffect, useState } from 'react';
import { Alert, Pressable } from 'react-native';
import { View, Text, Image, ScrollView } from 'dripsy';
import { useMutation } from '@tanstack/react-query';
import Api from '../../../../api/Api';
import { queryClient } from '../../../../helper/queryClient';
import { useToast } from '../../../../context/ToastContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Driver {
  id: string;
  fullName: string;
  name: string;
  vehicleType: 'bike' | 'auto' | 'cab';
  vehicleNumber: string;
  rating: string;
  phone: string;
}

export interface AvailableDriver {
  id: string;
  name: string;
  vehicleType: 'bike' | 'auto' | 'cab';
  vehicleNumber: string;
  rating: string;
  eta: string;
  assigned: boolean;
}

export interface Ride {
  id: string;

  passenger_id: string;
  driver_id: string | null;

  pickup_location: string;
  pickup_lat: string;
  pickup_lng: string;

  destination: string;
  destination_lat: string;
  destination_lng: string;

  vehicle_type: 'bike' | 'auto' | 'cab';

  distance: string;
  duration: number;

  fare: string;
  base_fare: string;
  toll_charges: string;
  night_charges: string;
  platform_fee: string;
  driver_earnings: string;

  is_night_ride: boolean;

  status: 'pending' | 'accepted' | 'ongoing' | 'completed' | 'cancelled';

  pin: string | null;

  estimated_arrival: number;

  payment_method: string;
  payment_status: 'pending' | 'success' | 'failed';
  payment_id: string | null;

  created_at: string;
  completed_at: string | null;

  driver: Driver | null;
  availableDrivers: AvailableDriver[];
}

interface Props {
  onClose: () => void;
}

export default function RideInProgressSheet({ onClose }: Props) {
  const { showToast } = useToast();
  const [photo, setPhoto] = useState<string | null>(null);
  const [collapsed, setCollapsed] = React.useState(false);
  const [ride, setRide] = useState<Ride | null>(null);
  useEffect(() => {
    const loadRide = async () => {
      const storedRide = await AsyncStorage.getItem('active_ride');
      console.log(
        'stored ride ---------------------------------------------------',
      );
      console.log(storedRide);
      if (!storedRide) return;

      const parsedRide = JSON.parse(storedRide) as Ride;
      setRide(parsedRide);
    };

    loadRide();
  }, []);

  // Cancel ride mutation
  const cancelRideMutation = useMutation({
    mutationFn: async (rideId: string) => {
      const response = await Api.patch(
        '/rides/updatesrides',
        {
          status: 'cancelled',
        },
        {
          params: {
            id: ride?.id,
          },
        },
      );
      console.log(response?.data);
      return response.data;
    },
    onSuccess: async data => {
      console.log(data);
      showToast(
        'Ride Cancelled ! The ride has been cancelled successfully.',
        'error',
      );
      await AsyncStorage.removeItem('active_ride');
      onClose();

      queryClient.invalidateQueries({
        queryKey: [`/rides/updaterides`],
      });
    },
    onError: error => {
      console.log(error);
      showToast('Error! Failed to cancel the ride. Please try again.', 'error');
    },
  });

  const handleCancelRide = () => {
    if (!ride?.id) return;

    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride?\n\nThis action cannot be undone.',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel Ride',
          style: 'destructive',
          onPress: () => {
            cancelRideMutation.mutate(ride.id);
          },
        },
      ],
      {
        cancelable: true,
      },
    );
  };

  const handleEmergency = async () => {
    // const emergencyConfirmed = confirm(
    //   `🚨 EMERGENCY ALERT\n\n` +
    //     `This will immediately:\n` +
    //     `📞 Call emergency services (Police: 100)\n` +
    //     `📱 Alert UkDrive safety team\n` +
    //     `📍 Share your live location\n` +
    //     `👥 Notify emergency contacts\n\n` +
    //     `Only use for real emergencies!\n\n` +
    //     `Press OK to activate emergency protocol`,
    // );

    if (ride) {
      // showToast(
      //   '🚨 Emergency Alert Activated ! Contacting emergency services and safety team...',
      //   'error',
      // );

      try {
        // Send real emergency alert to server
        const response = await Api.post(
          '/emergency_alert/passenger/emergency',
          {
            rideId: ride?.id,
            passengerId: ride?.passenger_id,
            emergencyType: 'general',
            location: {
              lat: ride?.pickup_lat || 0,
              lng: ride?.pickup_lng || 0,
              address: ride?.pickup_location || 'Unknown Location',
            },
            message: 'Emergency assistance requested by passenger',
          },
        );
        console.log(
          'here k vje vejrwv ejrhv erjv ejv ewjv erhv ewrjhv ewrhv erhv erhjv erhv efwhcv ewhv ewrhjv ewrjkv werkj',
        );
        if (response) {
          console.log('🚨 Emergency alert sent successfully:', response);

          showToast(
            '🚓 Emergency Services Notified"! Police and UkDrive safety team have been alerted. Help is on the way.',
            'error',
          );

          setTimeout(() => {
            showToast(
              '👮 Emergency Response Active"! Emergency services ETA: 5-8 minutes. Stay safe and stay on the line.',
              'error',
            );
          }, 3000);
        } else {
          throw new Error('Failed to send emergency alert');
        }
      } catch (error) {
        console.error('❌ Emergency alert error:', error);

        showToast(
          '⚠️ Emergency Alert Failed"! Unable to contact emergency services. Please call 100 directly.',
          'error',
        );
      }
    }
  };

  return (
    <View
      sx={{
        width: '100%',
        bg: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        p: 20,
        position: 'absolute',
        bottom: 0,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 10,
        maxHeight: collapsed ? 'auto' : 550,
      }}
    >
      <Pressable onPress={() => setCollapsed(!collapsed)}>
        <View
          sx={{
            width: 60,
            height: 6,
            bg: '#dcdcdc',
            borderRadius: 10,
            alignSelf: 'center',
            mb: collapsed ? 8 : 20,
          }}
        />

        {collapsed && (
          <View sx={{ alignItems: 'center', mb: 1 }}>
            <Text sx={{ fontSize: 14, fontWeight: '600' }}>
              Ride In Progress
            </Text>
            <Text sx={{ color: '#777', fontSize: 12 }}>
              Tap to expand details
            </Text>
          </View>
        )}
      </Pressable>
      {!collapsed && (
        <>
          <ScrollView>
            <View sx={{ mb: 20 }}>
              <View sx={{ flexDirection: 'row', gap: 80 }}>
                <Text sx={{ fontSize: 14, fontWeight: 'bold' }}>Pickup:</Text>
                <Text
                  sx={{
                    fontSize: 14,
                    color: '#444',
                    width: '80%',
                    flexWrap: 'wrap',
                  }}
                >
                  {ride?.pickup_location}
                </Text>
              </View>
              <View
                sx={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  mt: 20,
                  gap: 47,
                }}
              >
                <Text sx={{ fontSize: 16, fontWeight: 'bold', width: 80 }}>
                  Destination:
                </Text>

                <Text
                  sx={{
                    fontSize: 14,
                    color: '#444',
                    flex: 1,
                    flexWrap: 'wrap',
                  }}
                >
                  {ride?.destination}
                </Text>
              </View>
            </View>

            <View
              sx={{
                flexDirection: 'row',
                alignItems: 'center',
                mb: 16,
                gap: 9,
              }}
            >
              <Text
                sx={{
                  color: '#007BFF',
                  fontWeight: '600',
                  mr: 6,
                  fontSize: 12,
                }}
              >
                Driver Location
              </Text>
              <View
                sx={{
                  width: 10,
                  height: 10,
                  bg: 'orange',
                  borderRadius: 10,
                  mr: 6,
                }}
              />
              <Text sx={{ fontSize: 14, fontWeight: '900' }}>
                Driver approaching
              </Text>
              <Text sx={{ ml: 8, color: '#777', fontSize: 14 }}>
                ETA: {ride?.duration}
              </Text>
            </View>

            <View
              sx={{
                bg: '#F2FFF2',
                borderRadius: 16,
                p: 14,
                mb: 20,
                borderWidth: 1,
                borderColor: '#D9F5D9',
              }}
            >
              <View
                sx={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 15,
                }}
              >
                <Text sx={{ fontSize: 14, fontWeight: 'bold', mb: 6 }}>
                  Trip Fare 💸
                </Text>

                <Text sx={{ fontSize: 14, fontWeight: 'bold', mb: 6 }}>
                  ₹{ride?.fare}
                </Text>
              </View>
              <View
                sx={{ flexDirection: 'row', justifyContent: 'space-between' }}
              >
                <Text sx={{ fontSize: 13, color: '#444' }}>
                  Base Fare (bike):
                </Text>
                <Text
                  sx={{ fontSize: 14, color: '#111111ff', fontWeight: 'bold' }}
                >
                  ₹{ride?.base_fare}
                </Text>
              </View>
              <View
                sx={{ flexDirection: 'row', justifyContent: 'space-between' }}
              >
                <Text sx={{ fontSize: 13, color: '#0c22e5ff', mt: 4 }}>
                  Platform Fee (15%):
                </Text>
                <Text
                  sx={{
                    fontSize: 14,
                    color: '#0c22e5ff',
                    mt: 4,
                    fontWeight: 'bold',
                  }}
                >
                  ₹{ride?.platform_fee}
                </Text>
              </View>
              <View
                style={{
                  height: 1,
                  backgroundColor: '#d1cdcdff',
                  marginVertical: 10,
                }}
              />

              <View
                sx={{ flexDirection: 'row', justifyContent: 'space-between' }}
              >
                <Text
                  sx={{
                    fontSize: 14,
                    fontWeight: 'bold',
                    mt: 6,
                    color: 'green',
                  }}
                >
                  Total Amount:
                </Text>
                <Text
                  sx={{
                    fontSize: 14,
                    fontWeight: 'bold',
                    mt: 6,
                    color: 'green',
                  }}
                >
                  ₹{ride?.fare}
                </Text>
              </View>
            </View>

            <View
              sx={{
                borderRadius: 16,
                p: 14,
                mb: 20,
                borderWidth: 1,
                borderColor: '#c1c4c1ff',
              }}
            >
              <View
                sx={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  mb: 16,
                  gap: 20,
                }}
              >
                <View
                  sx={{
                    width: 70,
                    height: 70,
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
                    style={{
                      width: '100%',
                      height: '100%',
                      resizeMode: 'cover',
                    }}
                  />
                </View>

                <View>
                  <Text sx={{ fontSize: 14, fontWeight: 'bold' }}>
                    {ride?.driver?.fullName}
                  </Text>
                  <Text sx={{ fontSize: 14, color: '#555' }}>
                    ⭐ {ride?.driver?.rating}
                  </Text>
                </View>

                <View sx={{ marginLeft: 'auto' }}>
                  <Text sx={{ fontSize: 13, fontWeight: 'bold' }}>Vehicle</Text>
                  <Text sx={{ fontSize: 13, color: '#333' }}>
                    {ride?.driver?.vehicleType}
                  </Text>
                  <Text sx={{ fontSize: 13, color: '#333' }}>
                    {ride?.driver?.vehicleNumber}
                  </Text>
                </View>
              </View>
              <View
                sx={{
                  alignItems: 'center',
                  mb: 20,
                  backgroundColor: '#fcefe2ff',
                  p: 10,
                  borderRadius: 10,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Text sx={{ fontWeight: 'bold' }}>Vechile Number</Text>
                <Text
                  sx={{ fontSize: 15, color: '#f67e0eff', fontWeight: 'bold' }}
                >
                  {ride?.driver?.vehicleNumber}
                </Text>
              </View>

              <View
                sx={{
                  bg: '#FFF4E5',
                  p: 16,
                  borderRadius: 12,
                  mb: 10,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <View>
                  <Text sx={{ fontSize: 14, color: '#444' }}>Ride PIN</Text>
                  <Text sx={{ fontSize: 12, color: '#555', mt: 6 }}>
                    Share this PIN with your driver
                  </Text>
                </View>
                <Text
                  sx={{
                    fontSize: 28,
                    fontWeight: 'bold',
                    color: '#e88103ff',
                    mt: 4,
                  }}
                >
                  {ride?.pin}
                </Text>
              </View>
            </View>
            <View
              sx={{
                bg: '#FFF8D9',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: '#F3D67A',
                p: 20,
                alignItems: 'center',
              }}
            >
              <Text
                sx={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#C79A00',
                  mb: 6,
                }}
              >
                ⟳ Waiting for driver to accept...
              </Text>

              <Text
                sx={{
                  fontSize: 14,
                  color: '#8A6D00',
                  textAlign: 'center',
                  lineHeight: 20,
                }}
              >
                Call and chat will be available once driver{'\n'}accepts your
                ride
              </Text>
            </View>

            <Pressable onPress={handleCancelRide}>
              <View
                sx={{
                  mt: 16,
                  bg: '#FFECEC',
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: '#FFBDBD',
                  p: 14,
                  alignItems: 'center',
                }}
              >
                <Text
                  sx={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#D83434',
                  }}
                >
                  Cancel Ride
                </Text>
              </View>
            </Pressable>
            <Pressable
              onPress={handleEmergency}
              android_ripple={{ color: 'rgba(255,0,0,0.15)' }}
              style={({ pressed }) => [
                {
                  marginTop: 24,
                  backgroundColor: '#FFECEC',
                  borderRadius: 18,
                  borderWidth: 1.5,
                  borderColor: '#FFB3B3',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  alignItems: 'center',
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                  shadowColor: '#D83434',
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 3,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: '700',
                  color: '#D83434',
                  letterSpacing: 0.4,
                }}
              >
                🚨 Emergency / SOS
              </Text>

              <Text
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  color: '#8A1F1F',
                  textAlign: 'center',
                }}
              >
                Use only in real emergencies
              </Text>
            </Pressable>
          </ScrollView>
        </>
      )}
    </View>
  );
}
