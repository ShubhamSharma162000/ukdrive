import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { View, Text, Pressable, Image } from 'dripsy';
import { MapPin } from 'lucide-react-native';

const tabs = ['Today', 'Weekly', 'Monthly'];
const tripTabs = ['All', 'Completed', 'Pending', 'Cancelled'];

export default function MyTrip() {
  const [activeTab, setActiveTab] = useState('Weekly');
  const [activeTripTab, setActiveTripTab] = useState('All');

  const trips = [
    {
      id: 1,
      name: 'Shalini',
      date: '11/5/2025',
      time: '09:48 PM',
      status: 'Completed',
      fare: 29,
      pickup: 'Google Building 40, 1600 Amphitheatre Pkwy',
      dropoff: '1600 Amphitheatre Pkwy, Mountain View, CA',
      distance: '1.26 km',
      duration: '4 mins',
      vehicle: 'Bike',
    },
    {
      id: 2,
      name: 'Shalini',
      date: '11/5/2025',
      time: '08:59 PM',
      status: 'Cancelled',
      fare: 29,
      pickup: 'Google Building 40, 1600 Amphitheatre Pkwy',
      dropoff: '1600 Amphitheatre Pkwy, Mountain View, CA',
      distance: '1.26 km',
      duration: '4 mins',
      vehicle: 'Bike',
    },
  ];

  const filteredTrips =
    activeTripTab === 'All'
      ? trips
      : trips.filter(t => t.status === activeTripTab);

  return (
    <>
      <View
        style={{
          backgroundColor: '#d3d2d4ff',
          paddingTop: 20,
          paddingLeft: 20,
        }}
      >
        <Text sx={{ fontSize: 20, fontWeight: 'bold' }}>My Trips</Text>
        <Text sx={{ color: '#666', mb: 16, fontSize: 14 }}>
          View your trip history and earnings
        </Text>
      </View>
      <ScrollView style={{ backgroundColor: '#fff', flex: 1, padding: 16 }}>
        <View
          sx={{
            flexDirection: 'row',
            backgroundColor: '#f2f2f2',
            borderRadius: 12,
            mb: 20,
            overflow: 'hidden',
          }}
        >
          {tabs.map(tab => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              sx={{
                flex: 1,
                py: 10,
                alignItems: 'center',
                backgroundColor:
                  activeTab === tab ? '#9108f3ff' : 'transparent',
              }}
            >
              <Text
                sx={{
                  color: activeTab === tab ? '#fff' : '#000',
                  fontWeight: 'bold',
                  fontSize: 14,
                }}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        <View
          sx={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            mb: 24,
          }}
        >
          <View
            sx={{
              width: '48%',
              backgroundColor: '#f8e9fdff',
              borderRadius: 16,
              p: 16,
              shadowColor: '#000',
              shadowOpacity: 0.05,
              shadowRadius: 4,
            }}
          >
            <Text sx={{ color: '#555', fontSize: 14 }}>Total Trips</Text>
            <Text sx={{ fontSize: 28, fontWeight: 'bold' }}>151</Text>
            <Text sx={{ color: '#777', fontSize: 14 }}>Completed</Text>
          </View>

          <View
            sx={{
              width: '48%',
              backgroundColor: '#f8e9fdff',
              borderRadius: 16,
              p: 16,
              shadowColor: '#000',
              shadowOpacity: 0.05,
              shadowRadius: 4,
            }}
          >
            <Text sx={{ color: '#555', fontSize: 14 }}>Total Earnings</Text>
            <Text sx={{ fontSize: 28, fontWeight: 'bold' }}>₹4,160</Text>
            <Text sx={{ color: '#777', fontSize: 14 }}>From Trips</Text>
          </View>
        </View>

        <Text sx={{ fontSize: 14, fontWeight: 'bold', mb: 12 }}>
          This Week Trips
        </Text>

        <View
          sx={{
            flexDirection: 'row',
            backgroundColor: '#E7D4F3',
            borderRadius: 12,
            overflow: 'hidden',
            mb: 20,
          }}
        >
          {tripTabs.map(tab => (
            <Pressable
              key={tab}
              onPress={() => setActiveTripTab(tab)}
              sx={{
                flex: 1,
                py: 6,
                alignItems: 'center',
                backgroundColor: activeTripTab === tab ? '#fff' : 'transparent',
                borderRadius: 8,
                m: 3,
              }}
            >
              <Text
                sx={{
                  color: activeTripTab === tab ? '#000' : 'rgba(0,0,0,0.6)',
                  fontWeight: 'bold',
                  fontSize: 14,
                }}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        {filteredTrips.map(trip => (
          <View
            key={trip.id}
            sx={{
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#eee',
              p: 26,
              mb: 16,
              backgroundColor: '#fff',
              shadowColor: '#000',
              shadowOpacity: 0.15,
              shadowOffset: { width: 0, height: 4 },
              shadowRadius: 8,
            }}
          >
            <View sx={{ flexDirection: 'row' }}>
              <Image
                source={require('../../../assets/images/default-profile.jpg')}
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: '#9901e4ff',
                  marginBottom: 12,
                }}
                resizeMode="cover"
              />

              <View
                sx={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  ml: 16,
                }}
              >
                <View sx={{ flexDirection: 'column' }}>
                  <Text sx={{ fontSize: 15, fontWeight: 'bold' }}>
                    {trip.name}
                  </Text>
                  <Text sx={{ color: '#666', mb: 8, fontSize: 13 }}>
                    {trip.date} • {trip.time}
                  </Text>
                </View>
                <View sx={{ ml: 20 }}>
                  <View
                    sx={{
                      backgroundColor:
                        trip.status === 'Completed' ? '#E6F8EB' : '#FDECEC',
                      px: 8,
                      py: 4,
                      borderRadius: 8,
                    }}
                  >
                    <Text
                      sx={{
                        color:
                          trip.status === 'Completed' ? '#1F8B4C' : '#D32F2F',
                        fontWeight: 'bold',
                        fontSize: 10,
                      }}
                    >
                      {trip.status}
                    </Text>
                  </View>
                  <Text sx={{ fontWeight: 'bold', fontSize: 14, mb: 4 }}>
                    ₹{trip.fare} INR
                  </Text>
                  <Text sx={{ color: '#999', mb: 8, fontSize: 12 }}>
                    Trip Fare
                  </Text>
                </View>
              </View>
            </View>

            <View sx={{ mb: 8 }}>
              <View sx={{ flexDirection: 'row', alignItems: 'center' }}>
                <MapPin color="#fa7319ff" size={20} />
                <Text sx={{ ml: 6, fontWeight: 'bold', fontSize: 14 }}>
                  Pickup Location
                </Text>
              </View>
              <Text sx={{ color: '#555', ml: 22, fontSize: 12 }}>
                {trip.pickup}
              </Text>
            </View>

            <View sx={{ mb: 8 }}>
              <View sx={{ flexDirection: 'row', alignItems: 'center' }}>
                <MapPin color="#8104f5ff" size={20} />
                <Text sx={{ ml: 6, fontWeight: 'bold', fontSize: 14 }}>
                  Drop off Location
                </Text>
              </View>
              <Text sx={{ color: '#555', ml: 22, fontSize: 12 }}>
                {trip.dropoff}
              </Text>
            </View>
            <View
              style={{
                height: 1,
                backgroundColor: '#E0E0E0',
                width: '100%',
                marginVertical: 10,
              }}
            />
            <View sx={{ flexDirection: 'row' }}>
              <Text sx={{ fontWeight: 'bold', fontSize: 12 }}>
                {'  '}
                Distance: {trip.distance}
              </Text>{' '}
              <Text sx={{ fontWeight: 'bold', fontSize: 12 }}>
                {'   '}
                Duration: {trip.duration}
              </Text>
              {'   '}
              <Text sx={{ fontWeight: 'bold', fontSize: 12 }}>
                {'   '}
                Vehicle: {trip.vehicle}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </>
  );
}
