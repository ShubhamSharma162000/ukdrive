import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, X } from 'lucide-react-native';
import Api from '../../../api/Api';
import { useToast } from '../../../context/ToastContext';
import Animated from 'react-native-reanimated';
import { Pressable, Text, View } from 'dripsy';
import { useRideNotificationSound } from './notificationSound';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/core';
import { DriverWebSocket } from '../../../websocket/websocket-manager';

interface ActiveRideNotificationProps {
  driverId: string;
  onViewDetails?: (rideId: string) => void;
  onClose?: () => void;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export default function ActiveRideNotification({
  driverId,
  onViewDetails,
  onClose,
}: ActiveRideNotificationProps) {
  const navigation = useNavigation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastRideCount, setLastRideCount] = useState(0);
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [trackModal, setTrackModal] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const SWIPE_THRESHOLD = 100;
  const MAX_DRAG = 200;
  const CANCEL_AFTER = 5 * 60; // 300 seconds

  const { play, stop } = useRideNotificationSound();

  const { data: activeRides = [] } = useQuery({
    queryKey: [`/api/drivers/${driverId}/rides`],
    queryFn: async () => {
      const response = await Api.get(`/rides/getdriverrides`, {
        params: {
          id: driverId,
        },
      });
      if (response?.data?.data) {
        setIsVisible(true);
      }
      return response?.data?.data;
    },
    refetchInterval: 5000,
    enabled: !!driverId,
  });

  const activeRide = activeRides[0];

  useEffect(() => {
    if (!activeRide?.createdAt) return;

    const createdAt = new Date(activeRide.createdAt).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - createdAt) / 1000);
      const remaining = CANCEL_AFTER - elapsed;

      if (remaining <= 0) {
        clearInterval(interval);
        cancelRideMutation.mutate(activeRide.id);
        setRemainingTime(0);
      } else {
        setRemainingTime(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeRide?.id]);

  // Handle ride cancellation via WebSocket
  useEffect(() => {
    if (!activeRides?.id) return;

    const unsubscribe = DriverWebSocket.onRideUpdate((data: any) => {
      if (data.type === 'ride_cancelled' && data.rideId === activeRides.id) {
        console.log('🚫 [BOOKING CONFIRMED] Driver cancelled the ride:', data);

        // // Show cancellation notification
        // toast({
        //   title: "🚫 Ride Cancelled",
        //   description: "The driver has cancelled your ride. Redirecting to trip details to select another driver...",
        //   variant: "destructive",
        //   duration: 5000,
        // });
        showToast(
          'The passenger has cancelled your ride. Redirecting to trip details to select another driver...',
          'success',
        );
        // Redirect to trip details (home page) after a short delay
        setTimeout(() => {
          // setLocation('/');
        }, 2000);
      }
    });

    return unsubscribe;
  }, [activeRides]);

  useEffect(() => {
    console.log('🔍 [RIDE CHECK] Current rides:', activeRides?.length ?? 0);
    if (activeRides && activeRides?.length > 0) {
      const ride = activeRides[0];
      if (activeRides?.length > lastRideCount) {
        showToast(
          `🚗 NEW ACTIVE RIDE!\n${ride.pickupLocation} → ${ride.destination} • ₹${ride.fare}`,
          'success',
        );
      }
      play();
    } else {
      stop();
      setLastRideCount(0);
    }
  }, [activeRides]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Driver Confirmed';
      case 'in_progress':
        return 'Ride In Progress';
      case 'picked_up':
        return 'Passenger Picked Up';
      case 'awaiting_payment':
        return 'Awaiting Payment';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'picked_up':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'awaiting_payment':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const acceptRideMutation = useMutation({
    mutationFn: (rideId: string) =>
      Api.patch(
        '/rides/updatesrides',
        { status: 'confirmed' },
        { params: { id: rideId } },
      ),

    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ['driverActiveRide', driverId],
      });

      const previousRide = queryClient.getQueryData([
        'driverActiveRide',
        driverId,
      ]);

      queryClient.setQueryData(['driverActiveRide', driverId], (old: any) =>
        old ? { ...old, status: 'confirmed' } : old,
      );

      return { previousRide };
    },

    onError: (_err, _rideId, context) => {
      if (context?.previousRide) {
        queryClient.setQueryData(
          ['driverActiveRide', driverId],
          context.previousRide,
        );
      }
      showToast('Error! Failed to accept the ride.', 'error');
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['driverActiveRide', driverId],
      });
    },

    onSuccess: () => {
      setTrackModal(true);
      showToast('Ride confirmed successfully.', 'success');
    },
  });

  const handleAcceptRide = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const res = acceptRideMutation.mutate(activeRide.id);
    console.log(res);
  };

  const handleTrackRide = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    navigation.getParent()?.navigate('HomeStack', {
      screen: 'DriverRideTracking',
      params: {
        rideId: activeRide?.id,
      },
    });
  };
  const cancelRideMutation = useMutation({
    mutationFn: async (rideId: string) => {
      return Api.patch(
        '/rides/updatesrides',
        { status: 'cancelled' },
        { params: { id: rideId } },
      );
    },

    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ['driverActiveRide', driverId],
      });

      const previousRide = queryClient.getQueryData([
        'driverActiveRide',
        driverId,
      ]);
      queryClient.setQueryData(['driverActiveRide', driverId], null);

      return { previousRide };
    },

    onError: (_err, _rideId, context) => {
      if (context?.previousRide) {
        queryClient.setQueryData(
          ['driverActiveRide', driverId],
          context.previousRide,
        );
      }

      showToast('Error! Failed to cancel the ride.', 'error');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['driverActiveRide', driverId],
      });
    },

    onSuccess: () => {
      showToast('Ride Cancelled successfully.', 'success');
    },
  });

  const handleCancelRide = () => {
    if (!activeRide?.id || cancelRideMutation.isPending) return;

    Alert.alert('Cancel Ride', 'Are you sure you want to cancel this ride?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel Ride',
        style: 'destructive',
        onPress: () => cancelRideMutation.mutate(activeRide.id),
      },
    ]);
  };

  const opacity = isDismissed ? 0 : 1;
  const scale = isDismissed ? 0.95 : 1;

  if (!activeRides || activeRides?.length === 0 || !isVisible) {
    return null;
  }

  return (
    <>
      {activeRide && !trackModal && (
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 10,
            left: 0,
            right: 0,
            opacity,
            zIndex: 40,
          }}
        >
          <View
            sx={{
              width: '100%',
              borderRadius: 12,
              bg: 'white',
              shadowColor: '#000',
              shadowOpacity: 0.15,
              shadowRadius: 10,
              elevation: 6,
              overflow: 'hidden',
            }}
          >
            <View
              sx={{
                px: 12,
                py: 8,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#9CA3AF',
              }}
            >
              <View sx={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    bg: remainingTime === 0 ? 'red' : 'white',
                  }}
                />
                <Text sx={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                  Active Ride{' '}
                  {remainingTime !== null && `(${formatTime(remainingTime)})`}
                </Text>
              </View>

              <Pressable onPress={onClose}>
                <X size={14} color="white" />
              </Pressable>
            </View>

            <View sx={{ p: 8 }}>
              <View
                sx={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  mb: 8,
                }}
              >
                <Text
                  sx={{
                    fontSize: 11,
                    px: 8,
                    py: 2,
                    borderRadius: 20,
                    borderWidth: 1,
                    color: getStatusColor(activeRide?.status),
                    borderColor: getStatusColor(activeRide?.status),
                  }}
                >
                  {getStatusText(activeRide?.status)}
                </Text>

                <Text sx={{ fontSize: 11, color: 'gray' }}>
                  {formatDate(activeRide?.created_at)}
                </Text>
              </View>

              <View
                sx={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  mb: 8,
                }}
              >
                <Text sx={{ fontSize: 18, fontWeight: 'bold' }}>
                  ₹{activeRide?.fare}
                </Text>
                <Text sx={{ fontSize: 12, color: 'gray' }}>
                  {activeRide?.vehicle_type}
                </Text>
              </View>

              <View sx={{ gap: 6 }}>
                <View sx={{ flexDirection: 'row', gap: 8 }}>
                  <View
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      bg: '#f97316',
                      mt: 4,
                    }}
                  />
                  <View sx={{ flex: 1 }}>
                    <Text sx={{ fontSize: 11, color: 'gray' }}>From</Text>
                    <Text numberOfLines={1} sx={{ fontSize: 12 }}>
                      {activeRide?.pickup_location}
                    </Text>
                  </View>
                </View>

                <View sx={{ flexDirection: 'row', gap: 8 }}>
                  <View
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      bg: '#9333ea',
                      mt: 4,
                    }}
                  />
                  <View sx={{ flex: 1 }}>
                    <Text sx={{ fontSize: 11, color: 'gray' }}>To</Text>
                    <Text numberOfLines={1} sx={{ fontSize: 12 }}>
                      {activeRide?.destination}
                    </Text>
                  </View>
                </View>
              </View>
              <View sx={{ flexDirection: 'row', mt: 8, gap: 6 }}>
                <Pressable
                  onPress={handleAcceptRide}
                  style={({ pressed }) => ({
                    flex: 1,
                    backgroundColor: '#7c3aed',
                    borderRadius: 8,
                    paddingVertical: 8,
                    paddingHorizontal: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <MapPin size={14} color="white" />
                  <Text
                    sx={{
                      color: 'white',
                      fontSize: 12,
                      fontWeight: '600',
                      ml: 4,
                    }}
                  >
                    Accept
                  </Text>
                </Pressable>

                <Pressable
                  disabled={cancelRideMutation.isPending}
                  onPress={handleCancelRide}
                  style={({ pressed }) => ({
                    flex: 1,
                    backgroundColor: cancelRideMutation.isPending
                      ? '#9ca3af'
                      : '#dc2626',
                    borderRadius: 8,
                    paddingVertical: 8,
                    alignItems: 'center',
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text style={{ color: 'white', fontWeight: '600' }}>
                    {cancelRideMutation.isPending ? 'Cancelling…' : 'Cancel'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Animated.View>
      )}
      {trackModal && (
        <View sx={{ p: 12 }}>
          <Text sx={{ fontSize: 16, fontWeight: 'bold', mb: 4 }}>
            Ride Confirmed
          </Text>

          <Text sx={{ fontSize: 12, color: 'gray', mb: 12 }}>
            You can now start tracking the ride
          </Text>

          <View sx={{ gap: 8 }}>
            <View sx={{ flexDirection: 'row', gap: 8 }}>
              <View
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  bg: '#f97316',
                  mt: 4,
                }}
              />
              <Text numberOfLines={1} sx={{ fontSize: 12, flex: 1 }}>
                {activeRide.pickup_location}
              </Text>
            </View>

            <View sx={{ flexDirection: 'row', gap: 8 }}>
              <View
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  bg: '#9333ea',
                  mt: 4,
                }}
              />
              <Text numberOfLines={1} sx={{ fontSize: 12, flex: 1 }}>
                {activeRide.destination}
              </Text>
            </View>
          </View>

          <View sx={{ flexDirection: 'row', gap: 6, mt: 12 }}>
            <Pressable
              onPress={() => handleTrackRide()}
              style={{
                flex: 1,
                backgroundColor: '#7c3aed',
                borderRadius: 8,
                paddingVertical: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>
                Start Tracking
              </Text>
            </Pressable>

            {/* <Pressable
              onPress={handleTrackRide}
              style={{
                flex: 1,
                backgroundColor: '#e5e7eb',
                borderRadius: 8,
                paddingVertical: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontWeight: '600' }}>Back</Text>
            </Pressable> */}
          </View>
        </View>
      )}
    </>
  );
}
