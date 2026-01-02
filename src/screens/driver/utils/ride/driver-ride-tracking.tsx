import { useState, useEffect, useMemo, useRef } from 'react';
import {
  useQuery,
  useMutation,
  QueryClient,
  useQueryClient,
} from '@tanstack/react-query';
import { useAutoLocation } from '../../../../hooks/use-auto-location';
import { DriverWebSocket } from '../../../../websocket/websocket-manager';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'dripsy';
import { useToast } from '../../../../context/ToastContext';
import {
  DriverWebSocketProvider,
  useDriverWebSocket,
} from '../../../../context/driver-websocket-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Api from '../../../../api/Api';
import { calculateDistance } from '../calculateDistance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ArrowLeft,
  Banknote,
  Car,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Lock,
  MapPin,
  MessageCircle,
  Phone,
  Unlock,
  User,
  XCircle,
} from 'lucide-react-native';
import { Alert, Linking, Modal, Platform, StyleSheet } from 'react-native';
import { SlideToConfirm } from '../../components/slide-to-confirm';
import { StableRideMap } from '../../components/stable-ride-map';
import { Animated, PanResponder, Dimensions } from 'react-native';
import CollectPaymentModal from '../../components/collect-payment-model';

export function formatCurrency(
  amount: number | string,
  currency: string = 'INR',
  locale: string = 'en-IN',
): string {
  const value = typeof amount === 'string' ? Number(amount) : amount;

  if (isNaN(value)) return '₹0';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function DriverRideTrackingContent() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { rideId } = route.params ?? {};
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [pin, setPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [rideStarted, setRideStarted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(true);
  const [supportDialogOpen, setSupportDialogOpen] = useState(false);
  const [pinVerified, setPinVerified] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showPaymentBox, setShowPaymentBox] = useState(false);
  const driverChat = useDriverWebSocket();

  useEffect(() => {
    const checkPinStatus = async () => {
      if (!rideId) return;

      const storedValue = await AsyncStorage.getItem(`PIN_VERIFIED_${rideId}`);

      if (storedValue === 'true') {
        setPinVerified(true);
      }
    };
    checkPinStatus();
  }, [rideId]);

  const {
    data: ride = [],
    isLoading,
    error,
    isFetching,
  } = useQuery({
    queryKey: ['/api/rides', rideId],
    enabled: Boolean(rideId),
    refetchInterval: 5000,

    queryFn: async () => {
      const response = await Api.get('/rides/getactiveride', {
        params: { rideId },
      });
      return response?.data?.data;
    },
  });
  const { data: driver = [] } = useQuery({
    queryKey: ['/api/driver'],
    queryFn: async () => {
      const response = await Api.get(`/rides/getactiveridedriver`, {
        params: {
          driverId: ride?.driver_id,
        },
      });
      return response?.data?.data?.[0];
    },
    refetchInterval: 5000,
    enabled: !!ride?.driver_id,
  });
  console.log('driver ----------------', driver);
  // Real-time WebSocket GPS tracking with unified connection
  const [wsDriverLocation, setWsDriverLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  // Auto-start GPS for driver tracking page
  const driverGPS = useAutoLocation({
    driverId: (driver as any)?.id || '',
    userType: 'driver',
    autoStart: true, // Ensure GPS starts automatically on tracking page
  });

  // Use global WebSocket system instead of creating another connection
  useEffect(() => {
    if (!(driver as any)?.id) return;

    console.log(
      ' [DRIVER TRACKING] Using global WebSocket manager for driver:',
      (driver as any).id,
    );
    setWsConnected(true); // Optimistically set connected since global manager handles it

    // No need to create another WebSocket connection - the global system handles it
    // GPS data will be handled by the useAutoLocation hook
    // Chat data will be handled by the DriverWebSocketProvider context
  }, [(driver as any)?.id]);

  // REAL-TIME: WebSocket wallet update listener for payment collection
  useEffect(() => {
    if (!(driver as any)?.id) return;

    console.log(
      '[DRIVER TRACKING] Setting up real-time wallet update listener...',
    );

    // Connect to WebSocket
    DriverWebSocket.connect((driver as any).id);

    // Listen for wallet balance updates
    const removeWalletListener = DriverWebSocket.onWalletUpdate(message => {
      console.log(
        '[DRIVER TRACKING] Real-time wallet update received!',
        message,
      );
      showToast(
        `Payment Collected!  ₹${message.amount} successfully added to wallet. New balance: ₹${message.newBalance}`,
        'success',
      );

      // Refresh ride data to show updated payment status
      // queryClient.invalidateQueries({ queryKey: ['/api/rides', rideId] });
      queryClient.invalidateQueries({ queryKey: ['/api/rides'] });
      console.log(
        ' [DRIVER TRACKING] Ride and wallet data refreshed automatically',
      );
    });

    // Listen for ride completion messages (from webhook payment processing)
    const removeRideCompletionListener = DriverWebSocket.onMessage(
      'ride_completed',
      (message: any) => {
        console.log(
          '[DRIVER TRACKING] Ride completed via webhook payment!',
          message,
        );

        if (isRedirecting) return; // Prevent multiple redirects

        setIsRedirecting(true);
        // Show comprehensive success notification
        showToast(
          `Ride Completed Successfully!  Payment received: ₹${message.totalAmount}. Driver earnings: ₹${message.driverEarnings} credited to wallet.  `,
        );

        // Refresh all relevant data
        // queryClient.invalidateQueries({ queryKey: ['/api/rides', rideId] });
        queryClient.invalidateQueries({ queryKey: ['/api/rides'] });
        queryClient.invalidateQueries({
          queryKey: ['/api/drivers', driver?.id, 'wallet'],
        });

        // Redirect to driver wallet immediately for digital payments
        console.log(
          '[DRIVER TRACKING] Redirecting to driver wallet after ride completion',
        );
        // Cleanup: Disconnect WebSocket and clear ride data
        DriverWebSocket.disconnect();
      },
    );

    // Listen for ride cancellation from passenger
    const removeRideCancellationListener = DriverWebSocket.onMessage(
      'ride_cancelled',
      (message: any) => {
        console.log('[DRIVER TRACKING] Passenger cancelled the ride:', message);

        // Show cancellation notification
        showToast(
          `Ride Cancelled !! The passenger has cancelled the ride. Redirecting to driver home...'`,
        );

        // Refresh ride data to get updated status
        // queryClient.invalidateQueries({ queryKey: ['/api/rides', rideId] });
        queryClient.invalidateQueries({ queryKey: ['/api/rides'] });
      },
    );

    // Cleanup function
    return () => {
      console.log('[DRIVER TRACKING] WebSocket cleanup');
      removeWalletListener();
      removeRideCompletionListener();
      removeRideCancellationListener();
    };
  }, [(driver as any)?.id, rideId, queryClient]);

  // Auto-redirect if ride is already completed/paid
  useEffect(() => {
    if (
      ride &&
      ((ride as any)?.status === 'completed' ||
        (ride as any)?.status === 'paid')
    ) {
      console.log(
        '[DRIVER TRACKING] Ride already completed, redirecting to wallet',
      );
      showToast(
        `Ride Already Completed !! This ride has been completed. Redirecting to wallet...'`,
      );

      setTimeout(() => {
        DriverWebSocket.disconnect();
      }, 1500);
    }
  }, [ride, rideId]);

  // Smart location selection: prioritize live GPS sources
  const driverLocation = useMemo(() => {
    console.log(driver);
    console.log('[TRACKING] Driver location sources:', {
      wsDriverLocation,
      driverGPS: driverGPS?.currentLocation,
      apiLatLng: (driver as any)?.latitude && (driver as any)?.longitude,
      apiLocation: (driver as any)?.location,
      wsConnected,
    });

    // Priority 1: Live WebSocket GPS data (real-time updates) - only if connected
    if (
      wsConnected &&
      wsDriverLocation &&
      wsDriverLocation.lat &&
      wsDriverLocation.lng
    ) {
      console.log(
        '[TRACKING] Using LIVE WebSocket GPS data:',
        wsDriverLocation,
      );
      return wsDriverLocation;
    }

    // Priority 2: useAutoLocation hook GPS data (also real-time) - PREFER THIS when WS is offline
    if (
      driverGPS?.currentLocation &&
      driverGPS.currentLocation.lat &&
      driverGPS.currentLocation.lng
    ) {
      console.log(
        '[TRACKING] Using LIVE useAutoLocation GPS data:',
        driverGPS.currentLocation,
      );
      return driverGPS.currentLocation;
    }

    // Priority 3: Static API latitude/longitude fields (fallback only)
    if ((driver as any)?.latitude && (driver as any)?.longitude) {
      const location = {
        lat: parseFloat((driver as any).latitude),
        lng: parseFloat((driver as any).longitude),
      };
      console.log('[TRACKING] Using STATIC API latitude/longitude:', location);
      return location;
    }

    // Priority 4: Static API location object (fallback only)
    if ((driver as any)?.location?.lat && (driver as any)?.location?.lng) {
      const location = {
        lat: parseFloat((driver as any).location.lat),
        lng: parseFloat((driver as any).location.lng),
      };
      console.log('[TRACKING] Using STATIC API location object:', location);
      return location;
    }

    // Priority 4: Use pickup location as fallback if driver has no GPS coordinates
    if ((ride as any)?.pickupLat && (ride as any)?.pickupLng) {
      const fallbackLocation = {
        lat: parseFloat((ride as any).pickupLat),
        lng: parseFloat((ride as any).pickupLng),
      };
      console.log(
        ' Using pickup location as driver fallback:',
        fallbackLocation,
      );
      return fallbackLocation;
    }

    console.log(' [TRACKING] No driver location data available');
    return null;
  }, [
    wsDriverLocation,
    driverGPS?.currentLocation,
    (driver as any)?.latitude,
    (driver as any)?.longitude,
    (driver as any)?.location,
  ]);

  const pickupCoordinates = useMemo(() => {
    if ((ride as any)?.pickupLat && (ride as any)?.pickupLng) {
      return {
        lat: parseFloat((ride as any).pickupLat),
        lng: parseFloat((ride as any).pickupLng),
      };
    }
    return null;
  }, [(ride as any)?.pickupLat, (ride as any)?.pickupLng]);

  const destinationCoordinates = useMemo(() => {
    if ((ride as any)?.destinationLat && (ride as any)?.destinationLng) {
      return {
        lat: parseFloat((ride as any).destinationLat),
        lng: parseFloat((ride as any).destinationLng),
      };
    }
    return null;
  }, [(ride as any)?.destinationLat, (ride as any)?.destinationLng]);

  // PIN verification mutation
  const verifyPinMutation = useMutation({
    mutationFn: async (pinValue: string) => {
      const response = await Api.post(`/rides/verifypin`, {
        pin: pinValue,
        rideId: rideId,
      });
      return response?.data;
    },
    onSuccess: async data => {
      setPinVerified(true);
      await AsyncStorage.setItem(`PIN_VERIFIED_${rideId}`, 'true');
      showToast('PIN Verified Successfully', 'success');
    },
    onError: (error: any) => {
      setPinVerified(true);
      showToast(`'Invalid PIN Please check the PIN and try again`, `error`);
    },
  });

  // Arrived at pickup mutation
  const arrivedMutation = useMutation({
    mutationFn: async () => {
      const response = await Api.patch(`/rides/ridearrived`, {
        rideId: rideId,
      });
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rides', rideId] });
      showToast(`Arrived at Pickup ! You have arrived at the pickup location`);

      // Send automatic chat notification to passenger
      try {
        const message =
          'The driver has arrived! Your few minutes of travel are precious to the driver. Please be ready for pickup.';

        // Send via WebSocket - correct format
        DriverWebSocket.sendChatMessage(rideId!, message);
        console.log('💬 Auto-sent arrival notification to passenger');
      } catch (error) {
        console.error(' Failed to send arrival notification:', error);
      }

      console.log('🚗 Driver arrived - slide destination will appear');

      // Force component re-render after status change
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/rides', rideId] });
      }, 100);
    },
    onError: (error: any) => {
      showToast(`Failed to mark as arrived`, 'error');
    },
  });

  // Start ride mutation
  const startRideMutation = useMutation({
    mutationFn: async () => {
      console.log('[START RIDE] Sending API request to start ride:', rideId);
      const response = await Api.patch(`/rides/ridestart`, {
        rideId: rideId,
      });
      console.log('[START RIDE] API response:', response?.data);
      return response?.data;
    },
    onSuccess: () => {
      console.log(' [START RIDE] Success - ride started');
      queryClient.invalidateQueries({ queryKey: ['/api/rides', rideId] });
      showToast(`Ride Started ! The ride has been started successfully'`);
    },
    onError: (error: any) => {
      console.error(' [START RIDE] Error:', error);
      showToast(`Failed to Start Ride ! Please try again'`);
    },
  });

  // Complete ride mutation
  const completeRideMutation = useMutation({
    mutationFn: async () => {
      const response = await Api.patch(`/rides/completeride`, {
        rideId: rideId,
      });
    },

    onSuccess: data => {
      console.log(
        'ride is xom,plete j ferberberj cernc ernjc erjcb erjc erjc erjc erjcberjhc berjhcv erjhvc erjv ejv erjvc erjv ejcbwkowndkwjdn wjkbcnwekjc wknc wnc kjc',
      );
      queryClient.invalidateQueries({ queryKey: ['/api/rides', rideId] });
      queryClient.invalidateQueries({ queryKey: ['/api/rides'] });
      setShowPaymentBox(true);
      // Don't show payment options here - they will show automatically when status becomes awaiting_payment
      showToast(`Ride Completed! Please collect payment from passenger'`);
    },
    onError: (error: any) => {
      console.error(' Failed to complete ride:', error);
      showToast(`Failed to Complete Ride ! Please try again`);
    },
  });

  // Payment confirmation - like code cũ ukdrive
  const confirmPaymentMutation = useMutation({
    mutationFn: async (paymentMethod: 'cash' | 'digital') => {
      const response = await Api.post(`/rides/ridepayment`, {
        paymentMethod,
        amount: 12,
      });
      return response?.data;
    },
    onSuccess: () => {
      if (isRedirecting) return; // Prevent multiple redirects

      setIsRedirecting(true);
      showToast(`Payment Confirmed! Ride completed successfully`);
      queryClient.invalidateQueries({ queryKey: ['/api/rides', rideId] });
      queryClient.invalidateQueries({ queryKey: ['/api/rides'] });

      // Redirect to driver wallet immediately after cash payment
      // Cleanup: Disconnect WebSocket and clear ride data
      DriverWebSocket.disconnect();
      // Replace history to prevent going back to tracking page
    },
    onError: (error: any) => {
      console.error(' Payment confirmation error:', error);

      // Check if payment was already processed
      if (
        error.message &&
        error.message.includes('Payment already processed')
      ) {
        showToast(
          `Payment Already Processed ! This ride has already been completed. Redirecting to wallet...`,
        );
        // Redirect to wallet even if payment was already processed
        setTimeout(() => {
          DriverWebSocket.disconnect();
        }, 1500);
      } else {
        showToast(`Payment Confirmation Failed ! Please try again `);
      }
    },
  });

  const handlePinVerification = () => {
    if (!pin || pin.length !== 4) {
      showToast('Invalid PIN! Please enter a 4-digit PIN');
      return;
    }
    if (isVerifying) return;
    if (ride?.status !== 'arrived') {
      arrivedMutation.mutate(undefined, {
        onSuccess: () => {
          verifyPinMutation.mutate(pin);
        },
      });
      return;
    }
    verifyPinMutation.mutate(pin);
  };

  const handleCompleteRide = () => {
    if (driverLocation && destinationCoordinates) {
      const distance = calculateDistance(
        driverLocation,
        destinationCoordinates,
      );

      if (distance > 0.5) {
        setSupportDialogOpen(true);
        return;
      }
    }
    showToast(`Completing Ride ! Processing ride completion and payment... `);
    completeRideMutation.mutate();
  };

  const handleCall = () => {
    if ((ride as any)?.passengerPhone) {
      window.location.href = `tel:${(ride as any).passengerPhone}`;
    }
  };

  const handleMessage = () => {
    if ((ride as any)?.passengerPhone) {
      window.location.href = `sms:${(ride as any).passengerPhone}`;
    }
  };

  const callInitiate = async (phoneNumber: any) => {
    const url = `tel:${phoneNumber}`;
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      Linking.openURL(url);
    } else {
      console.log('Calling not supported on this device');
    }
  };

  if (isLoading) {
    return (
      <View
        sx={{
          flex: 1,
          backgroundColor: '$background',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#2563eb" />

        <Text
          sx={{
            mt: 3,
            color: '$textMuted',
            fontSize: 16,
          }}
        >
          Loading ride details...
        </Text>
      </View>
    );
  }

  // Debug: Log current driver location
  console.log(' Driver location data:', {
    driverApiLocation: (driver as any)?.location,
    driverApiLatLng: {
      lat: (driver as any)?.latitude,
      lng: (driver as any)?.longitude,
    },
    driverId: (driver as any)?.id,
    finalDriverLocation: driverLocation,
  });

  if (!ride) {
    return (
      <View
        sx={{
          flex: 1,
          bg: '$background',
          justifyContent: 'center',
          alignItems: 'center',
          px: 4,
        }}
      >
        <View sx={{ alignItems: 'center' }}>
          <Text
            sx={{
              fontSize: 22,
              fontWeight: 'bold',
              color: '$text',
              mb: 3,
            }}
          >
            Ride Not Found
          </Text>

          <Pressable
            onPress={() =>
              navigation.getParent()?.navigate('DriverTabs', {
                screen: 'HomeStack',
                params: { screen: 'Home' },
              })
            }
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <View
              sx={{
                px: 4,
                py: 3,
                bg: '$primary',
                borderRadius: 10,
              }}
            >
              <Text sx={{ color: 'white', fontWeight: '600' }}>
                Go to Dashboard
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View
      sx={{
        flex: 1,
        bg: '#f9fafb',
        position: 'relative',
      }}
    >
      <View
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <StableRideMap
          key={`driver-tracking-map-${(ride as any)?.status}`}
          driverLocation={driverLocation || undefined}
          passengerLocation={undefined} // Driver tracking - don't show passenger location
          pickupCoordinates={pickupCoordinates || undefined}
          destinationCoordinates={destinationCoordinates || undefined}
          isLiveSharing={true}
          vehicleType={(ride as any)?.vehicleType || 'car'}
          rideStatus={(ride as any)?.status || 'confirmed'}
          className="h-full w-full"
        />
      </View>

      <View
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 20,
        }}
      >
        <Pressable
          onPress={() =>
            navigation.getParent()?.navigate('DriverTabs', {
              screen: 'HomeStack',
              params: { screen: 'Home' },
            })
          }
          sx={{
            flexDirection: 'row',
            alignItems: 'center',
            px: 3,
            py: 2,
            bg: 'rgba(255,255,255,0.95)',
            borderRadius: 8,
          }}
        >
          <ArrowLeft size={18} color="#111827" />
          <Text
            sx={{ ml: 2, fontSize: 14, fontWeight: '600', color: '#111827' }}
          >
            Back
          </Text>
        </Pressable>
      </View>

      <View
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: '88%',
          bg: '#ffffff',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          shadowColor: '#000',
          shadowOpacity: 0.12,
          shadowRadius: 12,
          elevation: 10,
        }}
      >
        <Pressable
          onPress={() => setIsBottomSheetExpanded(v => !v)}
          sx={{
            alignItems: 'center',
            py: 2,
          }}
        >
          <View
            sx={{
              width: 40,
              height: 4,
              borderRadius: 999,
              bg: '#e5e7eb',
              mb: 1,
            }}
          />
          {isBottomSheetExpanded ? (
            <ChevronDown size={20} color="#9ca3af" />
          ) : (
            <ChevronUp size={20} color="#9ca3af" />
          )}
        </Pressable>
        {!isBottomSheetExpanded && ride && (
          <View sx={{ px: 4, pb: 3 }}>
            <View
              sx={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View sx={{ flex: 1 }}>
                <Text sx={{ fontSize: 16, fontWeight: '700' }}>
                  Ride #{ride.id.slice(-6)}
                </Text>
                <Text sx={{ fontSize: 13, color: '#6b7280', mt: 1 }}>
                  {ride.vehicle_type.toUpperCase()} • ETA{' '}
                  {ride.estimated_arrival} min
                </Text>
              </View>

              <View sx={{ alignItems: 'flex-end' }}>
                <Text
                  sx={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: ride.status === 'confirmed' ? '#16a34a' : '#2563eb',
                  }}
                >
                  {ride.status.toUpperCase()}
                </Text>

                <Text sx={{ fontSize: 16, fontWeight: '700', mt: 1 }}>
                  ₹{ride.driver_earnings}
                </Text>
              </View>
            </View>
          </View>
        )}

        {isBottomSheetExpanded && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            <View sx={{ px: 4 }}>
              <View
                sx={{
                  borderColor: '#fdc3ecff',
                  borderRadius: 16,
                  borderWidth: 1,
                  p: 20,
                  m: 10,
                }}
              >
                {!pinVerified && (
                  <View
                    sx={{
                      bg: '#FEFCE8',
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: '#FDE68A',
                      p: 10,
                      my: 12,
                    }}
                  >
                    <View
                      sx={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        mb: 2,
                      }}
                    >
                      <Lock size={18} color="#CA8A04" />
                      <Text
                        sx={{
                          ml: 2,
                          fontSize: 16,
                          fontWeight: '700',
                          color: '#92400E',
                        }}
                      >
                        PIN Verification Required
                      </Text>
                    </View>

                    <Text
                      sx={{
                        fontSize: 13,
                        color: '#854D0E',
                        mb: 3,
                      }}
                    >
                      Ask the passenger for their 4-character ride PIN to start
                      the ride.
                    </Text>

                    <View
                      sx={{
                        flexDirection: 'row',
                        alignItems: 'flex-end',
                      }}
                    >
                      <View sx={{ flex: 1, mr: 3 }}>
                        <TextInput
                          value={pin}
                          placeholder="0000"
                          maxLength={4}
                          autoCapitalize="characters"
                          autoCorrect={false}
                          keyboardType="default"
                          onChangeText={text =>
                            setPin(
                              text.replace(/[^A-Za-z0-9]/g, '').toUpperCase(),
                            )
                          }
                          style={{
                            width: '98%',
                            borderWidth: 1,
                            borderColor: '#d1d5db',
                            borderRadius: 10,
                            paddingVertical: 10,
                            textAlign: 'center',
                            fontSize: 18,
                            fontFamily: 'monospace',
                            backgroundColor: 'white',
                          }}
                        />
                      </View>

                      <Pressable
                        onPress={handlePinVerification}
                        disabled={pin.length !== 4}
                        sx={{
                          flex: 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          px: 10,
                          py: 13,
                          borderRadius: 12,
                          bg: pin.length !== 4 ? '#bfdbfe' : '#3b82f6',
                        }}
                      >
                        <Unlock size={18} color="#ffffff" />
                        <Text
                          sx={{
                            ml: 2,
                            fontSize: 14,
                            fontWeight: '600',
                            color: '#ffffff',
                          }}
                        >
                          Verify
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}

                {pinVerified && (
                  <Pressable
                    onPress={handleCompleteRide}
                    sx={{
                      bg: '#16a34a',
                      borderRadius: 16,
                      py: 10,
                      mx: 4,
                      my: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      elevation: 6,
                    }}
                  >
                    <MapPin size={18} color="#ffffff" />
                    <Text
                      sx={{
                        ml: 2,
                        color: '#ffffff',
                        fontSize: 16,
                        fontWeight: '700',
                      }}
                    >
                      Arrived at Destination
                    </Text>
                  </Pressable>
                )}
                <View sx={{ mb: 8 }}>
                  <View
                    sx={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <View
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        bg: '#f97316',
                        mr: 2,
                      }}
                    />
                    <Text sx={{ fontSize: 16, fontWeight: '900' }}>Pickup</Text>
                  </View>
                  <Text sx={{ ml: 14, fontSize: 13, color: '#4b5563' }}>
                    {ride.pickup_location}
                  </Text>
                </View>

                <View sx={{ mb: 15 }}>
                  <View
                    sx={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      mb: 1,
                    }}
                  >
                    <View
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        bg: '#7c3aed',
                        mr: 2,
                      }}
                    />
                    <Text sx={{ fontSize: 16, fontWeight: '900' }}>
                      Destination
                    </Text>
                  </View>
                  <Text sx={{ ml: 14, fontSize: 13, color: '#4b5563' }}>
                    {ride.destination}
                  </Text>
                </View>

                <View
                  sx={{
                    height: StyleSheet.hairlineWidth,
                    bg: '#858687ff',
                    m: 20,
                  }}
                />

                <View
                  sx={{
                    flexDirection: 'row',
                    mb: 20,
                  }}
                >
                  <Pressable
                    onPress={async () => {
                      try {
                        console.log(
                          ' Initiating Exotel masked call from driver to passenger',
                        );
                        const response = await Api.post('/calls/callinitiate', {
                          rideId: rideId,
                          callType: 'driver_to_passenger',
                          callerId: (driver as any)?.id || 'driver-123',
                        });

                        const callData = response?.data;
                        if (callData.success) {
                          showToast(
                            `Call Initiated! Call ${callData.ukdriveNumber} for secure connection`,
                            'success',
                          );

                          const phoneNumber = callData.ukdriveNumber;
                          const url = `tel:${phoneNumber}`;

                          Linking.canOpenURL(url).then(supported => {
                            if (supported) {
                              Linking.openURL(url);
                            } else {
                              showToast(
                                'Calling not supported on this device',
                                'error',
                              );
                            }
                          });
                        }
                      } catch (error) {
                        console.error('Call initiation failed:', error);
                        showToast(
                          `Call Failed! Unable to initiate secure call`,
                        );
                      }
                    }}
                    sx={{
                      flex: 1,
                      mr: 2,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: '#e5e7eb',
                      bg: '#f9fafb',
                      py: 9,
                    }}
                  >
                    <Phone size={18} color="#111827" />
                    <Text
                      sx={{
                        ml: 2,
                        fontSize: 14,
                        fontWeight: '600',
                        color: '#111827',
                      }}
                    >
                      Call
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleMessage}
                    sx={{
                      flex: 1,
                      ml: 2,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 999,
                      bg: '#2563eb',
                      py: 3,
                    }}
                  >
                    <MessageCircle size={18} color="#ffffff" />
                    <Text
                      sx={{
                        ml: 2,
                        fontSize: 14,
                        fontWeight: '600',
                        color: '#ffffff',
                      }}
                    >
                      Chat
                    </Text>
                  </Pressable>
                </View>
                <Pressable
                  onPress={() => callInitiate(1234553666)}
                  sx={{
                    mb: 2,
                    borderRadius: 999,
                    bg: '#ef4444',
                    py: 9,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    sx={{
                      fontSize: 15,
                      fontWeight: '700',
                      color: '#ffffff',
                    }}
                  >
                    Call Support
                  </Text>
                </Pressable>
              </View>
            </View>
            <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
              <View
                sx={{
                  bg: '#effdf0ff',
                  borderRadius: 16,
                  mx: 16,
                  p: 14,
                  elevation: 3,
                  shadowColor: '#000',
                  shadowOpacity: 0.05,
                  shadowRadius: 10,
                }}
              >
                <Text sx={{ fontSize: 16, fontWeight: '700', mb: 3 }}>
                  Trip Information
                </Text>

                <View
                  sx={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Text sx={{ color: '#6b7280' }}>Distance</Text>
                  <Text sx={{ color: '#025321ff', fontWeight: '900' }}>
                    {`${ride?.distance} km`}
                  </Text>
                </View>

                <View
                  sx={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Text sx={{ color: '#6b7280' }}>Base Fare</Text>
                  <Text sx={{ color: '#025321ff', fontWeight: '900' }}>
                    {`₹${ride?.base_fare} `}
                  </Text>
                </View>

                <View
                  sx={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    mb: 3,
                  }}
                >
                  <Text sx={{ color: '#6b7280' }}>Platform Fee</Text>
                  <Text sx={{ fontWeight: '900', color: '#ea580c' }}>
                    {' '}
                    {`₹${ride?.platform_fee} `}
                  </Text>
                </View>

                <View sx={{ height: 1, bg: '#e5e7eb', my: 2 }} />

                <View
                  sx={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    mt: 2,
                  }}
                >
                  <Text sx={{ fontSize: 16, fontWeight: '700' }}>
                    Total Fare
                  </Text>
                  <Text
                    sx={{ fontSize: 18, fontWeight: '700', color: '#1d4ed8' }}
                  >
                    ₹549
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flex: 1,
                  position: 'relative',
                  backgroundColor: '#f9fafb',
                }}
              ></View>
            </View>
          </ScrollView>
        )}
      </View>
      <Modal visible={supportDialogOpen} transparent animationType="fade">
        <View
          sx={{
            flex: 1,
            bg: 'rgba(0,0,0,0.45)',
            justifyContent: 'center',
            alignItems: 'center',
            px: 4,
          }}
        >
          <View
            sx={{
              bg: '#ffffff',
              borderRadius: 16,
              width: '100%',
              p: 4,
              elevation: 6,
            }}
          >
            <View sx={{ flexDirection: 'row', alignItems: 'center', mb: 3 }}>
              <XCircle size={22} color="#dc2626" />
              <Text
                sx={{
                  ml: 2,
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#dc2626',
                }}
              >
                Too far from destination
              </Text>
            </View>

            <Text sx={{ color: '#374151', fontSize: 14, mb: 4 }}>
              You are not at the destination yet. You must be within
              <Text sx={{ fontWeight: '700' }}> 500 meters </Text>
              to complete the ride.{'\n\n'}
              If you believe this is an error, please contact support.
            </Text>

            <Pressable
              onPress={() => setSupportDialogOpen(false)}
              sx={{
                bg: '#2563eb',
                borderRadius: 14,
                py: 3,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <Phone size={18} color="#ffffff" />
              <Text
                sx={{
                  ml: 2,
                  color: '#ffffff',
                  fontSize: 15,
                  fontWeight: '700',
                }}
              >
                Call Support ({1234567789})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setSupportDialogOpen(false)}
              sx={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 14,
                py: 3,
                alignItems: 'center',
              }}
            >
              <Text sx={{ fontSize: 14, fontWeight: '600' }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      {/* {showPaymentBox && ()} */}
      <CollectPaymentModal
        visible={showPaymentBox}
        amount={ride?.fare}
        onClose={() => setShowPaymentBox(false)}
        onSelect={mode => {
          console.log('Selected payment:', mode);
          setShowPaymentBox(false);
        }}
      />
    </View>
  );
}

export default function DriverRideTracking() {
  return (
    <DriverWebSocketProvider>
      <DriverRideTrackingContent />
    </DriverWebSocketProvider>
  );
}
