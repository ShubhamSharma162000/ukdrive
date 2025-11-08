import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { DripsyProvider, View, Text, Image, Pressable } from 'dripsy';
import LinearGradient from 'react-native-linear-gradient';

const rides = [
  {
    id: 1,
    title: 'Ride Request',
    date: '2025-11-07 at 01:20 PM',
    amount: '₹29',
    status: 'Completed',
    paymentMode: 'CASH',
    from: 'Google Building 40, 1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA',
    to: '1603 Charleston Rd, Mountain View, CA 94043, USA',
  },
  {
    id: 2,
    title: 'Ride Request',
    date: '2025-11-06 at 09:45 AM',
    amount: '₹45',
    status: 'Canceled',
    paymentMode: 'UPI',
    from: '1 Infinite Loop, Cupertino, CA 95014, USA',
    to: 'San Jose Airport, CA, USA',
  },
  {
    id: 3,
    title: 'Ride Request',
    date: '2025-11-06 at 05:30 PM',
    amount: '₹62',
    status: 'Cancelled',
    paymentMode: 'CASH',
    from: 'Palo Alto, CA, USA',
    to: 'Menlo Park, CA, USA',
  },
  {
    id: 4,
    title: 'Ride Request',
    date: '2025-11-05 at 10:15 AM',
    amount: '₹38',
    status: 'Canceled',
    paymentMode: 'CARD',
    from: 'Los Altos, CA, USA',
    to: 'Mountain View, CA, USA',
  },
  {
    id: 5,
    title: 'Ride Request',
    date: '2025-11-05 at 07:50 PM',
    amount: '₹57',
    status: 'Canceled',
    paymentMode: 'CASH',
    from: 'Sunnyvale, CA, USA',
    to: 'Santa Clara, CA, USA',
  },
  {
    id: 6,
    title: 'Ride Request',
    date: '2025-11-04 at 12:00 PM',
    amount: '₹33',
    status: 'Canceled',
    paymentMode: 'UPI',
    from: 'Googleplex, Mountain View, CA, USA',
    to: 'Redwood City, CA, USA',
  },
  {
    id: 7,
    title: 'Ride Request',
    date: '2025-11-04 at 03:20 PM',
    amount: '₹41',
    status: 'Cancelled',
    paymentMode: 'CASH',
    from: 'Stanford University, CA, USA',
    to: 'Menlo Park, CA, USA',
  },
  {
    id: 8,
    title: 'Ride Request',
    date: '2025-11-03 at 06:45 PM',
    amount: '₹28',
    status: 'Completed',
    paymentMode: 'CARD',
    from: 'Santa Clara, CA, USA',
    to: 'Cupertino, CA, USA',
  },
  {
    id: 9,
    title: 'Ride',
    date: '2025-11-03 at 11:00 AM',
    amount: '₹50',
    status: 'Completed',
    paymentMode: 'CASH',
    from: 'Palo Alto, CA, USA',
    to: 'San Jose, CA, USA',
  },
  {
    id: 10,
    title: 'Ride Request',
    date: '2025-11-02 at 08:10 AM',
    amount: '₹36',
    status: 'Completed',
    paymentMode: 'CASH',
    from: 'Los Gatos, CA, USA',
    to: 'Santa Clara, CA, USA',
  },
];

const tabs = [
  { label: 'All', count: 150 },
  { label: 'Rides', count: 150 },
  { label: 'Deliveries', count: 0 },
];

export default function DriverHistory() {
  const [activeTab, setActiveTab] = useState('All');

  const filteredRides =
    activeTab === 'All'
      ? rides
      : rides.filter(ride => ride.status === activeTab);

  return (
    <>
      <View
        style={{
          backgroundColor: '#d3d2d4ff',
          padding: 20,
        }}
      >
        <Text sx={{ color: 'black', fontWeight: 'bold' }}>
          Complete History
        </Text>
        <Text sx={{ mt: 2, fontSize: 13 }}>
          Statistics and history of all your trips
        </Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View
          sx={{
            backgroundColor: 'card',
            borderRadius: 12,
            padding: 14,
            mb: 12,
            borderWidth: 2,
            borderColor: '#ad0cf19f',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderLeftWidth: 6,
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 3 },
            overflow: 'hidden',
          }}
        >
          <View>
            <Text sx={{ fontSize: 14, fontWeight: '700' }}>Total Trips</Text>
            <Text sx={{ mt: 4, color: 'mutedText', fontSize: 12 }}>
              All requests
            </Text>
          </View>

          <Text sx={{ fontSize: 30, fontWeight: '800', color: '#ad0cf19f' }}>
            150
          </Text>
        </View>
        <View
          sx={{
            backgroundColor: 'card',
            borderRadius: 12,
            padding: 14,
            mb: 12,
            borderWidth: 2,
            borderColor: '#0d8f079f',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderLeftWidth: 6,
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 3 },

            overflow: 'hidden',
          }}
        >
          <View>
            <Text sx={{ fontSize: 14, fontWeight: '700' }}>Completed</Text>
            <Text sx={{ mt: 4, color: 'mutedText', fontSize: 12 }}>
              Successfully finished
            </Text>
          </View>

          <Text sx={{ fontSize: 30, fontWeight: '800', color: '#0d8f079f' }}>
            31
          </Text>
        </View>
        <View
          sx={{
            backgroundColor: 'card',
            borderRadius: 12,
            padding: 14,
            mb: 12,
            borderWidth: 2,
            borderColor: '#0f4dca9f',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderLeftWidth: 6,
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 3 },

            overflow: 'hidden',
          }}
        >
          <View>
            <Text sx={{ fontSize: 14, fontWeight: '700' }}>Total Earnings</Text>
            <Text sx={{ mt: 4, color: 'mutedText', fontSize: 12 }}>
              From completed trips
            </Text>
          </View>

          <Text sx={{ fontSize: 30, fontWeight: '800', color: '#0f4dca9f' }}>
            ₹3939
          </Text>
        </View>

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
          {/* ---- Tabs ---- */}
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

          {filteredRides.map(ride => (
            <View
              key={ride.id}
              sx={{
                backgroundColor: '#fff',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#e1e4e8',
                mt: 16,
                p: 14,
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
                width: '100%',
                alignSelf: 'center',
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
                  <Text sx={{ fontSize: 16, fontWeight: '700' }}>
                    Ride Request
                  </Text>
                  <Text sx={{ color: '#555', mt: 2, fontSize: 12 }}>
                    {ride.date}
                  </Text>
                </View>
                <View sx={{ alignItems: 'flex-end' }}>
                  <Text
                    sx={{
                      fontSize: 18,
                      fontWeight: '800',
                      color:
                        ride.status === 'Completed' ? '#0d8f07' : '#d11a1a',
                    }}
                  >
                    {ride.amount}
                  </Text>
                  <View
                    sx={{
                      backgroundColor:
                        ride.status === 'Completed' ? '#d7f8e4' : '#fde2e2',
                      borderRadius: 16,
                      px: 10,
                      py: 2,
                      mt: 4,
                    }}
                  >
                    <Text
                      sx={{
                        color:
                          ride.status === 'Completed' ? '#0d8f07' : '#d11a1a',
                        fontWeight: '700',
                        fontSize: 12,
                      }}
                    >
                      {ride.status}
                    </Text>
                  </View>
                  <Text sx={{ fontSize: 11, color: '#777', mt: 2 }}>98</Text>
                </View>
              </View>

              <View sx={{ mt: 10 }}>
                <Text sx={{ fontSize: 13, color: '#111' }}>
                  <Text sx={{ fontWeight: '700' }}>from: </Text>
                  {ride.from}
                </Text>
                <Text sx={{ fontSize: 13, color: '#111', mt: 4 }}>
                  <Text sx={{ fontWeight: '700' }}>to: </Text>
                  {ride.to}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
}
