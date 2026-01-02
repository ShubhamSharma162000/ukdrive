import React, { useState } from 'react';
import { ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useThemeUI, useSx, View, Text } from 'dripsy';
import LinearGradient from 'react-native-linear-gradient';
import {
  Bell,
  X,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Car,
  Wallet,
} from 'lucide-react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, { FadeOutLeft, FadeOutRight } from 'react-native-reanimated';
import { useAuth } from '../../../context/AuthContext';
import { PassengerWebSocket } from '../../../websocket/websocket-manager';

export default function PassengerNoifications({
  unreadCount = 10,
  isLoading = false,
  error = false,
  refetch,
  clearAllNotifications,
  markAsRead,
}) {
  const sx = useSx();
  const { id } = useAuth();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New Message',
      description:
        'Message from driver: The driver has arrived! Please be ready for pickup.',
      type: 'success',
    },
  ]);

  const { messages, sendMessage, connectPassengerWS } =
    usePassengerWebSockets();

  useEffect(() => {
    connectPassengerWS(passengerId);
  }, []);

  // {
  //   id: 1,
  //   title: 'New Message',
  //   description:
  //     'Message from driver: The driver has arrived! Please be ready for pickup.',
  //   type: 'success',
  // },
  //   {
  //     id: 2,
  //     title: 'Trip Reminder',
  //     description:
  //       'Your scheduled trip starts in 15 minutes. Please be on time.',
  //     type: 'error',
  //   },
  //   {
  //     id: 3,
  //     title: 'Payment Successful',
  //     description:
  //       'Your payment of ₹250 for today’s ride has been successfully processed.',
  //     type: 'warning',
  //   },
  //   {
  //     id: 4,
  //     title: 'New Offer',
  //     description: 'Get 20% off on your next 3 rides! Offer valid till Sunday.',
  //     type: 'success',
  //   },
  //   {
  //     id: 5,
  //     title: 'Driver Assigned',
  //     description:
  //       'A driver has been assigned to your booking. Tap to view details.',
  //     type: 'error',
  //   },
  //   {
  //     id: 6,
  //     title: 'Ride Completed',
  //     description:
  //       'Your ride from Connaught Place to Gurgaon is now completed. Rate your driver.',
  //     type: 'warning',
  //   },
  //   {
  //     id: 7,

  //     title: 'Safety Alert',
  //     description:
  //       'Always verify the driver’s name and vehicle number before starting your trip.',
  //     type: 'success',
  //   },
  //   {
  //     id: 8,
  //     title: 'Support Message',
  //     description:
  //       'Our support team has responded to your recent query. Tap to view message.',
  //     type: 'error',
  //   },
  //   {
  //     id: 9,
  //     title: 'Promo Code Applied',
  //     description:
  //       'Promo code RIDE50 applied successfully! You saved ₹50 on this trip.',
  //     type: 'warning',
  //   },
  //   {
  //     id: 10,
  //     title: 'System Update',
  //     description:
  //       'We’ve updated our app for better performance and new ride tracking features.',
  //     type: 'success',
  //   },
  //   {
  //     id: 11,
  //     title: 'Driver Nearby',
  //     description:
  //       'Your driver is less than 500 meters away. Please get ready to board.',
  //     type: 'error',
  //   },
  //   {
  //     id: 12,
  //     title: 'Payment Pending',
  //     description:
  //       'Please complete your pending payment of ₹120 for your last ride.',
  //     type: 'success',
  //   },
  //   {
  //     id: 13,
  //     title: 'Trip Cancelled',
  //     description:
  //       'Your scheduled ride at 3:00 PM was cancelled by the driver. Book again?',
  //     type: 'warning',
  //   },
  //   {
  //     id: 14,
  //     title: 'Referral Reward',
  //     description:
  //       'You earned ₹100 wallet balance for referring a friend! Keep sharing.',
  //     type: 'success',
  //   },
  //   {
  //     id: 15,
  //     title: 'Traffic Update',
  //     description:
  //       'Your driver might arrive late due to heavy traffic near your location.',
  //     type: 'warning',
  //   },
  //   {
  //     id: 16,
  //     title: 'Profile Verified',
  //     description:
  //       'Your profile has been successfully verified. You can now book premium rides.',
  //     type: 'error',
  //   },
  //   {
  //     id: 17,
  //     title: 'New Feature',
  //     description:
  //       'Try our new ‘Share My Trip’ feature to keep your friends informed during rides.',
  //     type: 'success',
  //   },
  //   {
  //     id: 18,
  //     title: 'Wallet Balance Low',
  //     description:
  //       'Your wallet balance is below ₹50. Please add funds to continue booking.',
  //     type: 'success',
  //   },
  //   {
  //     id: 19,
  //     title: 'Invoice Ready',
  //     description:
  //       'Your trip invoice for October is now available. Tap to download.',
  //     type: 'error',
  //   },
  //   {
  //     id: 20,
  //     title: 'Feedback Request',
  //     description:
  //       'How was your recent ride? Share your feedback to help us improve.',
  //     type: 'warning',
  //   },
  // ]);

  const getNotificationStyle = type => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bg: ['#f6fcf7ff', '#edfaf0ff'],
          color: '#0a8d68ff',
        };
      case 'error':
        return {
          icon: AlertCircle,
          bg: ['#eae7fdff', '#d6d8f4ff'],
          color: '#4c10e6ff',
        };
      case 'warning':
        return {
          icon: AlertCircle,
          bg: ['#eae7fdff', '#d6d8f4ff'],
          color: '#4c10e6ff',
        };
      default:
        return {
          icon: Bell,
          bg: ['#dbeafe', '#eff6ff'],
          color: '#2563eb',
        };
    }
  };

  const getCategoryIcon = category => {
    switch (category?.toLowerCase()) {
      case 'ride':
      case 'booking':
        return Car;
      case 'payment':
      case 'wallet':
        return Wallet;
      default:
        return Bell;
    }
  };

  const dismissNotification = id => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  // ✅ Replace external clearAllNotifications with local fallback
  const clearHandler = clearAllNotifications || handleClearAll;

  return (
    <>
      <View
        style={{
          backgroundColor: '#f66a0cff',
          paddingTop: 50,
          paddingBottom: 20,
          paddingLeft: 10,
        }}
      >
        <Text sx={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>
          Notifications
        </Text>
        <Text sx={{ fontSize: 16, fontWeight: 900, color: 'white' }}>
          Stay updated with your ride alerts
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginHorizontal: 20,
          marginTop: 20,
          gap: 10,
        }}
      >
        <Pressable
          onPress={refetch}
          style={{
            flex: 1,
            backgroundColor: '#c1bebdff',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 10,
            borderRadius: 10,
          }}
        >
          <RefreshCw color="white" size={18} />
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
            Refresh
          </Text>
        </Pressable>

        <Pressable
          onPress={handleClearAll}
          disabled={notifications.length === 0}
          style={{
            flex: 1,
            backgroundColor: '#f3832eff',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 10,
            borderRadius: 10,
          }}
        >
          <X color="white" size={18} />
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
            Clear All
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={sx({ padding: 16, gap: 16 })}>
        {isLoading ? (
          <ActivityIndicator
            color="#1e40af"
            size="large"
            style={{ marginTop: 40 }}
          />
        ) : error ? (
          <View sx={{ alignItems: 'center', mt: 40 }}>
            <AlertCircle color="red" size={48} />
            <Text sx={{ fontSize: 16, fontWeight: 'bold', mt: 10 }}>
              Unable to load
            </Text>
            <Pressable
              onPress={refetch}
              sx={{
                mt: 10,
                bg: '#1e40af',
                px: 14,
                py: 8,
                borderRadius: 10,
              }}
            >
              <Text sx={{ color: 'white' }}>Try Again</Text>
            </Pressable>
          </View>
        ) : notifications.length === 0 ? (
          <View sx={{ alignItems: 'center', mt: 60 }}>
            <Bell color="#6366f1" size={50} />
            <Text sx={{ fontSize: 18, fontWeight: 'bold', mt: 10 }}>
              All caught up!
            </Text>
            <Text sx={{ textAlign: 'center', color: '#6b7280', mt: 4, px: 20 }}>
              Your ride updates and alerts will appear here.
            </Text>
          </View>
        ) : (
          notifications.map(n => {
            const { icon: Icon, bg, color } = getNotificationStyle(n.type);
            const CategoryIcon = getCategoryIcon(n.category);

            return (
              <Swipeable
                key={n.id}
                onSwipeableOpen={() => dismissNotification(n.id)}
                renderLeftActions={() => (
                  <View
                    style={{
                      backgroundColor: '#fee2e2',
                      justifyContent: 'center',
                      flex: 1,
                      paddingLeft: 20,
                    }}
                  >
                    <X color="#dc2626" size={22} />
                  </View>
                )}
                renderRightActions={() => (
                  <View
                    style={{
                      backgroundColor: '#fee2e2',
                      justifyContent: 'center',
                      alignItems: 'flex-end',
                      flex: 1,
                      paddingRight: 20,
                    }}
                  >
                    <X color="#dc2626" size={22} />
                  </View>
                )}
              >
                <Animated.View
                  exiting={FadeOutRight.duration(200)}
                  style={{
                    borderRadius: 16,
                    // padding: 16,
                    flexDirection: 'row',
                    gap: 12,
                    alignItems: 'flex-start',
                    backgroundColor: '#fff',
                    marginBottom: 10,
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowRadius: 6,
                    elevation: 2,
                  }}
                >
                  <LinearGradient
                    key={n.id}
                    colors={bg}
                    style={sx({
                      borderRadius: 16,
                      padding: 16,
                      flexDirection: 'row',
                      gap: 12,
                      alignItems: 'flex-start',
                      shadowColor: '#000',
                      shadowOpacity: 0.1,
                      shadowRadius: 6,
                      elevation: 2,
                    })}
                  >
                    <View
                      sx={{
                        p: 8,
                        bg: 'white',
                        borderRadius: 14,
                      }}
                    >
                      <Icon color={color} size={24} />
                    </View>

                    <View sx={{ flex: 1 }}>
                      <Text
                        sx={{
                          fontWeight: 'bold',
                          fontSize: 16,
                          color: '#111827',
                        }}
                      >
                        {n.title}
                      </Text>
                      <Text sx={{ color: '#4b5563', fontSize: 13, mt: 2 }}>
                        {n.description}
                      </Text>
                      <View
                        sx={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          mt: 6,
                          gap: 8,
                        }}
                      >
                        <Clock color="#6b7280" size={14} />
                        <Text sx={{ fontSize: 11, color: '#6b7280' }}>
                          {new Date(n.createdAt).toLocaleString()}
                        </Text>
                        {n.category && (
                          <View
                            sx={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <CategoryIcon color="#4f46e5" size={14} />
                            <Text
                              sx={{
                                fontSize: 11,
                                color: '#4f46e5',
                                fontWeight: '600',
                              }}
                            >
                              {n.category}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </LinearGradient>

                  <Pressable
                    onPress={() => dismissNotification(n.id)}
                    style={{
                      backgroundColor: '#fee2e2',
                      borderRadius: 999,
                      padding: 6,
                    }}
                  >
                    <X color="#dc2626" size={18} />
                  </Pressable>
                </Animated.View>
              </Swipeable>
            );
          })
        )}
      </ScrollView>
    </>
  );
}
