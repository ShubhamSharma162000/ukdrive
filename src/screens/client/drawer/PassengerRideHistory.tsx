import React, { useState } from 'react';
import { Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { View, Text, useDripsyTheme, Pressable, Image } from 'dripsy';
import { Car, Truck } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');
const itemWidth = (screenWidth - 60) / 3;

export default function PassengerRideHistory() {
  const { theme } = useDripsyTheme();
  const [activeTab, setActiveTab] = useState<'rides' | 'deliveries'>('rides');
  const durationFilters = ['All', 'Week', 'Month'];
  const [durationSelected, setDurationSelected] = useState('All');
  const statusFilters = ['All Status', 'Completed', 'Cancelled'];
  const [statusSelected, setStatusSelected] = useState('Completed');

  const rides = [
    {
      id: 1,
      type: 'Auto Ride',
      status: 'Cancelled',
      date: '4 Nov 2025 • 11:01 AM',
      pickup: 'QF46+XQQ, Haridwar Rd, Padampur, Uttarakhand',
      drop: 'Kotdwar, Uttarakhand, India',
      distance: '5.95 km',
      time: '18 min',
      price: '₹102.00',
    },
    {
      id: 2,
      type: 'Auto Ride',
      status: 'Completed',
      date: '3 Nov 2025 • 10:15 AM',
      pickup: 'Kotdwar Bus Stand, Uttarakhand',
      drop: 'Haridwar Rd, Uttarakhand, India',
      distance: '6.5 km',
      time: '20 min',
      price: '₹120.00',
    },
  ];

  const handleDurationPress = (d: string) => setDurationSelected(d);
  const handleStatusPress = (s: string) => setStatusSelected(s);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View
        style={{
          backgroundColor: '#e8e5e4ff',
          paddingTop: 40,
          paddingBottom: 10,
          paddingLeft: 20,
        }}
      >
        <Text sx={{ fontSize: 28, fontWeight: '700', mb: 4 }}>History</Text>
        <Text sx={{ color: 'gray', mb: 4 }}>View your past rides</Text>
      </View>

      {/* Tabs */}
      <View sx={{ flexDirection: 'row', m: 16, gap: 10 }}>
        <Pressable
          onPress={() => setActiveTab('rides')}
          sx={{
            flex: 1,
            borderRadius: 12,
            p: 3,
            mr: 2,
            alignItems: 'center',
            bg: activeTab === 'rides' ? '#f88c43ff' : '#f0f0f0',
          }}
        >
          <Car color={activeTab === 'rides' ? '#fff' : '#070707'} size={20} />
          <Text
            sx={{
              color: activeTab === 'rides' ? '#fff' : '#070707',
              fontWeight: '600',
              mt: 1,
            }}
          >
            Rides
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('deliveries')}
          sx={{
            flex: 1,
            borderRadius: 12,
            p: 3,
            alignItems: 'center',
            bg: activeTab === 'deliveries' ? '#f88c43ff' : '#f0f0f0',
          }}
        >
          <Truck
            color={activeTab === 'deliveries' ? '#fff' : '#070707'}
            size={20}
          />
          <Text
            sx={{
              color: activeTab === 'deliveries' ? '#fff' : '#070707',
              fontWeight: '600',
              mt: 1,
            }}
          >
            Deliveries
          </Text>
        </Pressable>
      </View>

      {activeTab === 'rides' ? (
        <View style={{ flex: 1 }}>
          <View style={{ paddingHorizontal: 16 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                flexWrap: 'nowrap',
                marginBottom: 10,
              }}
            >
              {durationFilters.map((f, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => handleDurationPress(f)}
                  style={{
                    backgroundColor:
                      durationSelected === f ? '#4c71f7ff' : '#f4f4f4',
                    borderRadius: 20,
                    paddingVertical: 8,
                    paddingHorizontal: 10,
                    margin: 5,
                    width: itemWidth,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: '#333',
                      fontWeight: '600',
                      textAlign: 'center',
                    }}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                flexWrap: 'nowrap',

                marginBottom: 10,
              }}
            >
              {statusFilters.map((f, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => handleStatusPress(f)}
                  style={{
                    backgroundColor:
                      statusSelected === f ? '#ff3f55ff' : '#f4f4f4',
                    borderRadius: 20,
                    paddingVertical: 8,
                    paddingHorizontal: 18,
                    margin: 5,
                    width: itemWidth,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: '#333',
                      fontWeight: '200',
                      textAlign: 'center',
                    }}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 100,
            }}
            showsVerticalScrollIndicator={false}
          >
            {rides.map(ride => (
              <View
                key={ride.id}
                style={{
                  borderWidth: 1,
                  borderColor: '#e6e6e6',
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 16,
                  backgroundColor: '#fff',
                }}
              >
                {/* Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image
                    source={{ uri: 'https://i.pravatar.cc/100' }}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      marginRight: 15,
                    }}
                  />
                  <View>
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <Text style={{ fontWeight: '700', fontSize: 18 }}>
                        {ride.type}
                      </Text>
                      <View
                        style={{
                          backgroundColor: '#ffe6e6',
                          borderRadius: 12,
                          paddingVertical: 4,
                          paddingHorizontal: 10,
                          borderWidth: 1,
                          borderColor: 'rgba(234, 34, 34, 0.3)',
                          marginLeft: 8,
                        }}
                      >
                        <Text
                          style={{
                            color: 'rgba(234, 34, 34, 1)',
                            fontSize: 14,
                            fontWeight: '600',
                          }}
                        >
                          {ride.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={{ color: '#777', marginTop: 4 }}>
                      {ride.date}
                    </Text>
                  </View>
                </View>

                <View style={{ marginTop: 12 }}>
                  <Text style={{ color: '#555' }}>📍 {ride.pickup}</Text>
                  <Text style={{ color: '#555', marginTop: 4 }}>
                    🏁 {ride.drop}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 10,
                  }}
                >
                  <Text style={{ color: '#555' }}>
                    {ride.distance} • {ride.time}
                  </Text>
                  <Text style={{ fontWeight: '700' }}>{ride.price}</Text>
                </View>

                <TouchableOpacity
                  style={{
                    backgroundColor: '#f8ab6fff',
                    borderRadius: 20,
                    paddingVertical: 8,
                    marginTop: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontWeight: '800', color: '#333' }}>
                    View Details
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      ) : (
        <View
          sx={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            py: 40,
          }}
        >
          <Text
            sx={{
              color: '#070707',
              fontWeight: '700',
              fontSize: 18,
            }}
          >
            Coming Soon 🚀
          </Text>
        </View>
      )}
    </View>
  );
}
