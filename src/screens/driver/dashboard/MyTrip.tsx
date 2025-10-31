import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { ScrollView } from 'moti';
import { View, Text, Pressable } from 'dripsy';
import { getDriversDetails, getDriversTripDetails } from '../DriversQuery';

export default function MyTrip() {
  const [activeTab, setActiveTab] = useState('Today');
  const [activeRideTab, setActiveRideTab] = useState('All');
  const durationTabs = ['Today', 'Weekly', 'Monthly'];
  const rideTabs = ['all', 'completed', 'pending', 'cancelled'];
  const insets = useSafeAreaInsets();

  // --- Queries ---
  const { data: driverData } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => getDriversDetails('dc2480ba-86ca-403b-8cc0-81469e992c93'),
  });

  const { data: allTripsData } = useQuery({
    queryKey: ['tripData', activeTab, activeRideTab],
    queryFn: () =>
      getDriversTripDetails(
        'dc2480ba-86ca-403b-8cc0-81469e992c93',
        activeTab,
        activeRideTab,
      ),
  });

  const tripsArray = Array.isArray(allTripsData) ? allTripsData : [];
  const totalRidesCompleted = tripsArray.filter(
    r => r.status === 'completed',
  ).length;
  const totalEarnings = tripsArray
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + (r.driverEarnings || 0), 0);

  return (
    <View sx={{ flex: 1, bg: 'white', pt: 14 }}>
      {/* Duration Tabs */}
      <View
        sx={{ flexDirection: 'row', justifyContent: 'space-around', px: 2 }}
      >
        {durationTabs.map(tab => {
          const isActive = activeTab === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              sx={{
                flex: 1,
                alignItems: 'center',
                py: 10,
                mx: 4,
                borderRadius: 12,
                bg: isActive ? 'indigo600' : 'gray100',
              }}
            >
              <Text
                sx={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: isActive ? 'white' : 'gray600',
                }}
              >
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Stats Section */}
      <View
        sx={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          px: 16,
          mt: 20,
        }}
      >
        <View sx={{ flex: 1, bg: 'indigo100', borderRadius: 16, p: 16, mr: 8 }}>
          <Text sx={{ color: 'gray600', fontSize: 13, fontWeight: '500' }}>
            Total Trips
          </Text>
          <Text
            sx={{ fontSize: 24, fontWeight: '700', color: 'indigo700', mt: 8 }}
          >
            {totalRidesCompleted}
          </Text>
        </View>

        <View sx={{ flex: 1, bg: 'indigo100', borderRadius: 16, p: 16, ml: 8 }}>
          <Text sx={{ color: 'gray600', fontSize: 13, fontWeight: '500' }}>
            Total Earnings
          </Text>
          <Text
            sx={{ fontSize: 24, fontWeight: '700', color: 'indigo700', mt: 8 }}
          >
            ₹ {totalEarnings || 0}
          </Text>
        </View>
      </View>

      {/* Ride Filter Tabs */}
      <View
        sx={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          px: 2,
          mt: 20,
        }}
      >
        {rideTabs.map(tab => {
          const isActive = activeRideTab === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveRideTab(tab)}
              sx={{
                flex: 1,
                alignItems: 'center',
                py: 8,
                mx: 4,
                borderRadius: 12,
                bg: isActive ? 'indigo600' : 'gray100',
              }}
            >
              <Text
                sx={{
                  fontSize: 15,
                  color: isActive ? 'white' : 'gray600',
                }}
              >
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Trip List */}
      <ScrollView contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}>
        <View
          sx={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            mt: 12,
          }}
        >
          {tripsArray.length > 0 ? (
            tripsArray.map((trip: any, index: number) => (
              <View
                key={trip.id || index}
                sx={{
                  width: '90%',
                  bg: 'white',
                  borderRadius: 12,
                  p: 16,
                  mb: 12,
                  borderWidth: 1,
                  borderColor: 'gray100',
                  shadowColor: '#000',
                  shadowOpacity: 0.05,
                  shadowRadius: 3,
                }}
              >
                {/* Header */}
                <View
                  sx={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    mb: 12,
                  }}
                >
                  <View sx={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        bg: 'gray400',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 10,
                      }}
                    />
                    <View>
                      <Text sx={{ fontWeight: '600', color: 'gray800' }}>
                        {trip.passengerName || 'Passenger'}
                      </Text>
                      <Text sx={{ fontSize: 12, color: 'gray500' }}>
                        {new Date(trip.createdAt).toLocaleDateString()} •{' '}
                        {new Date(trip.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  </View>

                  <View sx={{ alignItems: 'flex-end' }}>
                    <Text
                      sx={{
                        fontSize: 12,
                        fontWeight: '600',
                        px: 8,
                        py: 4,
                        borderRadius: 8,
                        mb: 4,
                        color:
                          trip.status === 'completed'
                            ? 'green800'
                            : trip.status === 'cancelled'
                            ? 'red800'
                            : 'blue800',
                        bg:
                          trip.status === 'completed'
                            ? 'green100'
                            : trip.status === 'cancelled'
                            ? 'red100'
                            : 'blue100',
                      }}
                    >
                      {trip.status === 'completed'
                        ? '✓ Completed'
                        : trip.status === 'cancelled'
                        ? '✗ Cancelled'
                        : trip.status === 'awaiting_payment'
                        ? 'Awaiting Payment'
                        : '⏳ Pending'}
                    </Text>
                    <Text
                      sx={{ fontSize: 18, fontWeight: '700', color: 'gray800' }}
                    >
                      ₹{trip.fare || 0} AED
                    </Text>
                    <Text sx={{ fontSize: 11, color: 'gray500' }}>
                      Trip Fare
                    </Text>
                  </View>
                </View>

                {/* Pickup / Drop */}
                <View>
                  <View
                    sx={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      mb: 6,
                    }}
                  >
                    <View
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        bg: 'green500',
                        mt: 5,
                      }}
                    />
                    <View sx={{ flex: 1, ml: 10 }}>
                      <Text
                        sx={{
                          fontSize: 11,
                          color: 'gray500',
                          fontWeight: '500',
                        }}
                      >
                        Pickup Location
                      </Text>
                      <Text sx={{ fontSize: 13, color: 'gray800' }}>
                        {trip.pickupLocation || 'Unknown Location'}
                      </Text>
                    </View>
                  </View>
                  <View sx={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <View
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        bg: 'red500',
                        mt: 5,
                      }}
                    />
                    <View sx={{ flex: 1, ml: 10 }}>
                      <Text
                        sx={{
                          fontSize: 11,
                          color: 'gray500',
                          fontWeight: '500',
                        }}
                      >
                        Drop off Location
                      </Text>
                      <Text sx={{ fontSize: 13, color: 'gray800' }}>
                        {trip.destination || 'Unknown Destination'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Trip Stats */}
                <View
                  sx={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    mt: 12,
                    pt: 8,
                    borderTopWidth: 1,
                    borderColor: 'gray100',
                  }}
                >
                  <Text sx={{ fontSize: 12, color: 'gray500' }}>
                    Distance:{' '}
                    <Text sx={{ fontWeight: '600', color: 'gray800' }}>
                      {trip.distance}
                    </Text>
                  </Text>
                  <Text sx={{ fontSize: 12, color: 'gray500' }}>
                    Duration:{' '}
                    <Text sx={{ fontWeight: '600', color: 'gray800' }}>
                      {trip.duration}
                    </Text>
                  </Text>
                  <Text sx={{ fontSize: 12, color: 'gray500' }}>
                    Vehicle:{' '}
                    <Text sx={{ fontWeight: '600', color: 'gray800' }}>
                      {trip.vehicleType || 'Car'}
                    </Text>
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View sx={{ py: 32, alignItems: 'center' }}>
              <Text sx={{ color: 'gray400', fontSize: 18, mb: 4 }}>
                No trips found
              </Text>
              <Text sx={{ color: 'gray500', fontSize: 14 }}>
                No trip data for the selected period
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
