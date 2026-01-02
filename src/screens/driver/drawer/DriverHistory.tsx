import React, { useMemo, useState } from 'react';
import { Button, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { DripsyProvider, View, Text, Image, Pressable } from 'dripsy';
import LinearGradient from 'react-native-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { getHistoryDetails } from '../DashboardQuery';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Api from '../../../api/Api';

export default function DriverHistory() {
  const { id } = useAuth();
  const [activeTab, setActiveTab] = useState('All');

  const sendTestNotification = async () => {
    const response = Api.post('/fcm/test-direct', {
      title: 'Ride Update',
      body: 'Your driver is arriving soon',
      userId: '22af096c-c43e-11f0-9ae7-2944d975bd55',
      userType: 'driver',
      data: {
        rideId: '0c10740a-35a4-4599-8d1e-53a1e815ab17',
        screen: 'RideDetails',
      },
    });
    console.log(response);
  };

  const {
    data: historyData,
    isLoading,
    error: historyError,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ['/api/drivers', id, 'history', 'driver_history'],
    queryFn: () => getHistoryDetails(id),
    refetchInterval: false,
    enabled: !!id,
    retry: false,
  });

  const rides = useMemo(() => {
    if (Array.isArray(historyData)) return historyData;
    if (Array.isArray(historyData?.data)) return historyData.data;
    return [];
  }, [historyData]);

  const tabs = useMemo(() => {
    const completedCount = rides.filter(
      (r: any) => r.status === 'completed',
    ).length;

    const cancelledCount = rides.filter(
      (r: any) => r.status === 'cancelled',
    ).length;

    return [
      { label: 'All', count: rides.length },
      { label: 'Completed', count: completedCount },
      { label: 'Cancelled', count: cancelledCount },
    ];
  }, [rides]);

  const {
    todayTotalRides,
    todayCompletedRidesCount,
    todayEarnings,
    filteredRides,
  } = useMemo(() => {
    const completedRides = rides.filter(
      (ride: any) => ride.status === 'completed',
    );

    return {
      todayTotalRides: rides.length,

      todayCompletedRidesCount: completedRides.length,

      todayEarnings: completedRides.reduce(
        (sum: any, ride: any) => sum + Number(ride.driver_earnings || 0),
        0,
      ),

      filteredRides:
        activeTab === 'All'
          ? rides
          : rides.filter(
              (ride: any) =>
                ride.status.toLowerCase() === activeTab.toLowerCase(),
            ),
    };
  }, [rides, activeTab]);

  return (
    <>
      <View
        style={{
          backgroundColor: '#48048dff',
          padding: 20,
        }}
      >
        <Text sx={{ color: '#fff', fontWeight: 'bold' }}>Complete History</Text>
        <Text sx={{ mt: 2, fontSize: 13, color: '#fff' }}>
          Statistics and history of all your trips
        </Text>
      </View>

      <Pressable
        onPress={sendTestNotification}
        style={{
          padding: 12,
          backgroundColor: '#4CAF50',
          borderRadius: 8,
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>
          Send Test Notification
        </Text>
      </Pressable>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <StatCard
          title="Total Trips"
          subtitle="All requests"
          value={todayTotalRides}
          color="#fb1f0bff"
          backgroundColor="#f7ceceff"
          icon="car-multiple"
        />

        <StatCard
          title="Completed Trips"
          subtitle="Successfully finished"
          value={todayCompletedRidesCount}
          color="#065b03ff"
          backgroundColor="#d2f6d8ff"
          icon="check-circle"
        />

        <StatCard
          title="Total Earnings"
          subtitle="From completed trips"
          value={`₹ ${todayEarnings}`}
          color="#0f4dca"
          backgroundColor="#d0cff6ff"
          icon="wallet"
        />

        <View
          sx={{
            backgroundColor: 'card',
            borderRadius: 12,
            padding: 14,
            borderWidth: 1,
            borderColor: 'rgba(208, 208, 211, 0.62)',
            gap: 12,
            alignItems: 'flex-start',
            mb: 24,
          }}
        >
          <View
            sx={{
              flexDirection: 'row',
              backgroundColor: '#f2f3f5',
              borderRadius: 50,
              padding: 4,
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 3 },
              elevation: 4,
            }}
          >
            {tabs.map(tab => {
              const isActive = activeTab === tab.label;
              return (
                <Pressable
                  key={tab.label}
                  onPress={() => setActiveTab(tab.label)}
                  sx={{
                    flex: 1,
                    overflow: 'hidden',
                    borderRadius: 50,
                    mx: 2,
                  }}
                >
                  {isActive ? (
                    <LinearGradient
                      colors={['#4062FF', '#5C82FF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        borderRadius: 50,
                        paddingVertical: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'row',
                      }}
                    >
                      <Text
                        style={{
                          color: '#fff',
                          fontWeight: '700',
                          fontSize: 14,
                        }}
                      >
                        {tab.label}
                      </Text>
                      <View
                        style={{
                          backgroundColor: '#fff',
                          borderRadius: 50,
                          minWidth: 22,
                          height: 22,
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginLeft: 6,
                          paddingHorizontal: 6,
                        }}
                      >
                        <Text
                          style={{
                            color: '#4062FF',
                            fontWeight: '700',
                            fontSize: 12,
                          }}
                        >
                          {tab.count}
                        </Text>
                      </View>
                    </LinearGradient>
                  ) : (
                    <View
                      sx={{
                        borderRadius: 50,
                        paddingVertical: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'row',
                      }}
                    >
                      <Text
                        sx={{
                          color: '#606060',
                          fontWeight: '700',
                          fontSize: 14,
                        }}
                      >
                        {tab.label}
                      </Text>
                      <View
                        sx={{
                          backgroundColor: '#d9d9d9',
                          borderRadius: 50,
                          minWidth: 22,
                          height: 22,
                          justifyContent: 'center',
                          alignItems: 'center',
                          ml: 6,
                          px: 6,
                        }}
                      >
                        <Text
                          sx={{
                            color: '#fff',
                            fontWeight: '700',
                            fontSize: 12,
                          }}
                        >
                          {tab.count}
                        </Text>
                      </View>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
        {filteredRides.map((ride: any) => (
          <HistoryCard key={ride.id} ride={ride} />
        ))}
      </ScrollView>
    </>
  );
}

const StatCard = ({
  title,
  subtitle,
  value,
  color,
  backgroundColor,
  icon,
}: {
  title: string;
  subtitle: string;
  value: string | number;
  color: string;
  backgroundColor: string;
  icon: string;
}) => {
  return (
    <View
      sx={{
        backgroundColor: backgroundColor,
        borderRadius: 16,
        padding: 16,
        mb: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderLeftWidth: 6,
        borderLeftColor: color,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            backgroundColor: `${color}22`,
            padding: 10,
            borderRadius: 12,
            marginRight: 12,
          }}
        >
          <MaterialCommunityIcons name={icon} size={24} color={color} />
        </View>

        <View>
          <Text sx={{ fontSize: 14, fontWeight: '700' }}>{title}</Text>
          <Text sx={{ mt: 2, color: 'mutedText', fontSize: 12 }}>
            {subtitle}
          </Text>
        </View>
      </View>

      <Text
        sx={{
          fontSize: 30,
          fontWeight: '800',
          color,
        }}
      >
        {value}
      </Text>
    </View>
  );
};

const HistoryCard = ({ ride }: { ride: any }) => {
  const isCompleted = ride.status === 'completed';

  return (
    <Pressable
      onPress={() => console.log('Ride clicked:', ride.id)}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.95 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View
        sx={{
          backgroundColor: '#fff',
          borderRadius: 16,
          borderWidth: 1,
          borderColor: '#e5e7eb',
          mt: 16,
          p: 16,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
        }}
      >
        <View
          sx={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View>
            <Text sx={{ fontSize: 14, fontWeight: '700' }}>
              Ride #{ride.id.slice(0, 6)}
            </Text>
            <Text sx={{ fontSize: 11, color: '#6b7280', mt: 2 }}>
              {new Date(ride.created_at).toLocaleString()}
            </Text>
          </View>

          <View sx={{ alignItems: 'flex-end' }}>
            <Text
              sx={{
                fontSize: 18,
                fontWeight: '800',
                color: isCompleted ? '#16a34a' : '#dc2626',
              }}
            >
              ₹ {ride.driver_earnings}
            </Text>

            <View
              sx={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: isCompleted ? '#dcfce7' : '#fee2e2',
                px: 10,
                py: 3,
                borderRadius: 20,
                mt: 4,
              }}
            >
              <MaterialCommunityIcons
                name={isCompleted ? 'check-circle' : 'close-circle'}
                size={14}
                color={isCompleted ? '#16a34a' : '#dc2626'}
              />
              <Text
                sx={{
                  ml: 6,
                  fontSize: 12,
                  fontWeight: '700',
                  color: isCompleted ? '#16a34a' : '#dc2626',
                  textTransform: 'capitalize',
                }}
              >
                {ride.status}
              </Text>
            </View>
          </View>
        </View>
        <View sx={{ mt: 14 }}>
          <View sx={{ flexDirection: 'row', mb: 8 }}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={18}
              color="#2563eb"
            />
            <Text sx={{ ml: 6, fontSize: 13, color: '#111827', flex: 1 }}>
              {ride.pickup_location}
            </Text>
          </View>

          <View sx={{ flexDirection: 'row' }}>
            <MaterialCommunityIcons
              name="map-marker-check"
              size={18}
              color="#16a34a"
            />
            <Text sx={{ ml: 6, fontSize: 13, color: '#111827', flex: 1 }}>
              {ride.destination}
            </Text>
          </View>
        </View>

        <View
          sx={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            mt: 14,
            pt: 12,
            borderTopWidth: 1,
            borderColor: '#e5e7eb',
          }}
        >
          <View sx={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="bike" size={16} color="#6b7280" />
            <Text sx={{ ml: 6, fontSize: 12, color: '#6b7280' }}>
              {ride.vehicle_type.toUpperCase()} • {ride.distance} km
            </Text>
          </View>

          <View sx={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons
              name="credit-card-outline"
              size={16}
              color="#6b7280"
            />
            <Text sx={{ ml: 6, fontSize: 12, color: '#6b7280' }}>
              {ride.payment_method} ({ride.payment_status})
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};
