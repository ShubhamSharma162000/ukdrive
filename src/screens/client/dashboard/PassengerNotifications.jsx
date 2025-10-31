import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useThemeUI, useSx } from 'dripsy';
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

export default function PassengerNoifications({
  notifications = [],
  unreadCount = 0,
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
          bg: ['#e6fffa', '#f0fff4'],
          color: '#047857',
        };
      case 'error':
        return {
          icon: AlertCircle,
          bg: ['#fee2e2', '#fff1f2'],
          color: '#dc2626',
        };
      case 'warning':
        return {
          icon: AlertCircle,
          bg: ['#fef9c3', '#fefce8'],
          color: '#ca8a04',
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
      <View style={{ backgroundColor: '#f66a0cff', paddingTop: 50 }}>
        <Text sx={{ fontSize: 28, fontWeight: 900 }}>
          Stay updated with your ride alerts
        </Text>
      </View>

      <View sx={{ position: 'relative' }}>
        <Bell color="white" size={28} />
        {unreadCount > 0 && (
          <View
            sx={{
              position: 'absolute',
              top: -5,
              right: -5,
              bg: 'red',
              borderRadius: 999,
              width: 20,
              height: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text sx={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </Text>
          </View>
        )}
      </View>
      <View
        sx={{
          flexDirection: 'row',
          justifyContent: 'center',
          padding: 12,
          gap: 10,
        }}
      >
        <Pressable
          onPress={refetch}
          sx={{
            bg: '#1e40af',
            px: 12,
            py: 8,
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <RefreshCw color="white" size={16} />
          <Text sx={{ color: 'white', ml: 6 }}>Refresh</Text>
        </Pressable>

        <Pressable
          onPress={clearAllNotifications}
          disabled={notifications.length === 0}
          sx={{
            bg: notifications.length ? '#f97316' : '#fbbf24',
            px: 12,
            py: 8,
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
            opacity: notifications.length ? 1 : 0.5,
          }}
        >
          <X color="white" size={16} />
          <Text sx={{ color: 'white', ml: 6 }}>Clear All</Text>
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
                    {n.message}
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
                <View sx={{ gap: 6 }}>
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
