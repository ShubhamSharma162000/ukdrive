import React, { useState } from 'react';
import { ScrollView, Pressable } from 'react-native';
import { View, Text, useDripsyTheme } from 'dripsy';
import { IconButton } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';

export default function PassengerRides() {
  const { theme } = useDripsyTheme();
  const [selectedTab, setSelectedTab] = useState<'rides' | 'deliveries'>(
    'rides',
  );

  const currentRides = [
    {
      id: '1',
      fare: 250,
      pickup: 'Connaught Place, Delhi',
      destination: 'Indira Gandhi Airport',
      status: 'confirmed',
      driver: { name: 'Amit Sharma', rating: 4.8 },
    },
  ];

  const currentDeliveries: any[] = [];

  return (
    <>
      <View
        sx={{
          backgroundColor: '#f66a0cff',
          px: 20,
          py: 24,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <View
          sx={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            pt: 20,
          }}
        >
          <View>
            <Text sx={{ color: 'white', opacity: 0.8, mt: 4 }}>
              Track your active bookings
            </Text>
          </View>
          <View
            sx={{
              width: 48,
              height: 48,
              bg: 'rgba(255,255,255,0.2)',
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconButton icon="car" iconColor="white" size={22} />
          </View>
        </View>
      </View>

      <View
        sx={{
          flexDirection: 'row',
          bg: 'rgba(164, 162, 162, 0.2)',
          borderRadius: 12,
          mx: 8,
          mt: 16,
          p: 4,
        }}
      >
        {[
          {
            key: 'rides',
            label: `Rides (${currentRides.length})`,
            icon: 'car',
          },
          {
            key: 'deliveries',
            label: `Deliveries (${currentDeliveries.length})`,
            icon: 'truck',
          },
        ].map(tab => (
          <Pressable
            key={tab.key}
            onPress={() => setSelectedTab(tab.key as any)}
            style={{
              flex: 1,
              borderRadius: 10,
              paddingVertical: 10,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              backgroundColor:
                selectedTab === tab.key ? '#f8873bff' : 'transparent',
            }}
          >
            <IconButton icon={tab.icon} size={16} iconColor="#0a0a0aff" />
            <Text
              sx={{
                color: 'black',
                fontWeight: '600',
                fontSize: 18,
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16, marginTop: 20 }}>
        {selectedTab === 'rides' ? (
          currentRides.length > 0 ? (
            currentRides.map(ride => (
              <View
                key={ride.id}
                sx={{
                  bg: 'white',
                  borderRadius: 16,
                  p: 16,
                  mb: 16,
                  shadowColor: '#000',
                  shadowOpacity: 0.1,
                  shadowRadius: 6,
                  elevation: 3,
                }}
              >
                <Text sx={{ fontSize: 18, fontWeight: '700', color: 'text' }}>
                  ₹{ride.fare}
                </Text>
                <Text sx={{ color: 'secondary', mt: 1 }}>
                  {ride.pickup} → {ride.destination}
                </Text>
                <Text sx={{ mt: 2, color: 'gray' }}>
                  Driver: {ride.driver.name} ★ {ride.driver.rating}
                </Text>
              </View>
            ))
          ) : (
            <Text sx={{ textAlign: 'center', mt: 40, color: 'gray' }}>
              No active rides found.
            </Text>
          )
        ) : currentDeliveries.length > 0 ? (
          <Text sx={{ textAlign: 'center', mt: 40 }}>Deliveries list</Text>
        ) : (
          <Text sx={{ textAlign: 'center', mt: 40, color: 'gray' }}>
            No active deliveries.
          </Text>
        )}
      </ScrollView>
    </>
  );
}
