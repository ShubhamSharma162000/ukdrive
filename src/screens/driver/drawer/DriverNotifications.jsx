import React from 'react';
import { ScrollView, ActivityIndicator } from 'react-native';
import { useThemeUI, useSx, View, Text, Pressable } from 'dripsy';
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

const notifications = [
  {
    title: 'New Message',
    description:
      'Message from driver: The driver has arrived! Please be ready for pickup.',
    type: 'success',
  },
  {
    title: 'Trip Reminder',
    description: 'Your scheduled trip starts in 15 minutes. Please be on time.',
    type: 'error',
  },
  {
    title: 'Payment Successful',
    description:
      'Your payment of ₹250 for today’s ride has been successfully processed.',
    type: 'warning',
  },
  {
    title: 'New Offer',
    description: 'Get 20% off on your next 3 rides! Offer valid till Sunday.',
    type: 'success',
  },
  {
    title: 'Driver Assigned',
    description:
      'A driver has been assigned to your booking. Tap to view details.',
    type: 'error',
  },
  {
    title: 'Ride Completed',
    description:
      'Your ride from Connaught Place to Gurgaon is now completed. Rate your driver.',
    type: 'warning',
  },
  {
    title: 'Safety Alert',
    description:
      'Always verify the driver’s name and vehicle number before starting your trip.',
    type: 'success',
  },
  {
    title: 'Support Message',
    description:
      'Our support team has responded to your recent query. Tap to view message.',
    type: 'error',
  },
  {
    title: 'Promo Code Applied',
    description:
      'Promo code RIDE50 applied successfully! You saved ₹50 on this trip.',
    type: 'warning',
  },
  {
    title: 'System Update',
    description:
      'We’ve updated our app for better performance and new ride tracking features.',
    type: 'success',
  },
  {
    title: 'Driver Nearby',
    description:
      'Your driver is less than 500 meters away. Please get ready to board.',
    type: 'error',
  },
  {
    title: 'Payment Pending',
    description:
      'Please complete your pending payment of ₹120 for your last ride.',
    type: 'success',
  },
  {
    title: 'Trip Cancelled',
    description:
      'Your scheduled ride at 3:00 PM was cancelled by the driver. Book again?',
    type: 'warning',
  },
  {
    title: 'Referral Reward',
    description:
      'You earned ₹100 wallet balance for referring a friend! Keep sharing.',
    type: 'success',
  },
  {
    title: 'Traffic Update',
    description:
      'Your driver might arrive late due to heavy traffic near your location.',
    type: 'warning',
  },
  {
    title: 'Profile Verified',
    description:
      'Your profile has been successfully verified. You can now book premium rides.',
    type: 'error',
  },
  {
    title: 'New Feature',
    description:
      'Try our new ‘Share My Trip’ feature to keep your friends informed during rides.',
    type: 'success',
  },
  {
    title: 'Wallet Balance Low',
    description:
      'Your wallet balance is below ₹50. Please add funds to continue booking.',
    type: 'success',
  },
  {
    title: 'Invoice Ready',
    description:
      'Your trip invoice for October is now available. Tap to download.',
    type: 'error',
  },
  {
    title: 'Feedback Request',
    description:
      'How was your recent ride? Share your feedback to help us improve.',
    type: 'warning',
  },
];

export default function DriverNoifications({
  unreadCount = 10,
  isLoading = false,
  error = false,
  refetch,
  clearAllNotifications,
  markAsRead,
  dismissNotification,
}) {
  const sx = useSx();

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

  return (
    <>
      <View
        style={{
          backgroundColor: '#e3e2e5ff',
          paddingTop: 50,
          paddingBottom: 20,
          paddingLeft: 10,
        }}
      >
        <Text sx={{ fontSize: 24, fontWeight: 'bold', color: 'black' }}>
          Notifications
        </Text>
        <Text sx={{ fontSize: 16, fontWeight: 900, color: 'black' }}>
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
          onPress={clearAllNotifications}
          disabled={notifications.length === 0}
          style={{
            flex: 1,
            backgroundColor: '#a906eaff',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 10,
            borderRadius: 10,
            // opacity: notifications.length === 0 ? 0.6 : 1,
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
                    sx={{ fontWeight: 'bold', fontSize: 16, color: '#111827' }}
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
                <View sx={{ flexDirection: 'row', gap: 6 }}>
                  {!n.isRead && (
                    <Pressable
                      onPress={() => markAsRead(n.id)}
                      sx={{
                        bg: '#dcfce7',
                        borderRadius: 999,
                        p: 6,
                      }}
                    >
                      <CheckCircle color="#15803d" size={18} />
                    </Pressable>
                  )}
                  <Pressable
                    onPress={() => dismissNotification(n.id)}
                    sx={{
                      bg: '#fee2e2',
                      borderRadius: 999,
                      p: 6,
                    }}
                  >
                    <X color="#dc2626" size={18} />
                  </Pressable>
                </View>
              </LinearGradient>
            );
          })
        )}
      </ScrollView>
    </>
  );
}
