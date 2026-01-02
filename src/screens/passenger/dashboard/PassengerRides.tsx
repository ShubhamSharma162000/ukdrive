import React, { useState, useMemo, useCallback } from 'react';
import { Pressable, ScrollView } from 'react-native';
import { Text, useDripsyTheme, View } from 'dripsy';
import { Car, Truck, MapPin, User, Star, Clock } from 'lucide-react-native';

export default function PassengerRides() {
  const { theme } = useDripsyTheme();
  const [selectedTab, setSelectedTab] = useState<'rides' | 'deliveries'>(
    'rides',
  );

  const currentRides = useMemo(
    () => [
      {
        id: '1',
        fare: 250,
        pickup: 'Connaught Place, Delhi',
        destination: 'Indira Gandhi Airport',
        status: 'completed',
        driver: { name: 'Amit Sharma', rating: 4.8 },
      },
      {
        id: '2',
        fare: 250,
        pickup: 'Connaught Place, Delhi',
        destination: 'Indira Gandhi Airport',
        status: 'pending',
        driver: { name: 'Amit Sharma', rating: 4.8 },
      },
      {
        id: '3',
        fare: 250,
        pickup: 'Connaught Place, Delhi',
        destination: 'Indira Gandhi Airport',
        status: 'cancelled',
        driver: { name: 'Amit Sharma', rating: 4.8 },
      },
      {
        id: '4',
        fare: 250,
        pickup: 'Connaught Place, Delhi',
        destination: 'Indira Gandhi Airport',
        status: 'completed',
        driver: { name: 'Amit Sharma', rating: 4.8 },
      },
    ],
    [],
  );

  const currentDeliveries: any[] = useMemo(() => [], []);
  type TabKey = 'rides' | 'deliveries';

  const tabs: { key: TabKey; label: string; icon: any }[] = useMemo(
    () => [
      { key: 'rides', label: `Rides (${currentRides.length})`, icon: Car },
      {
        key: 'deliveries',
        label: `Deliveries (${currentDeliveries.length})`,
        icon: Truck,
      },
    ],
    [currentRides.length, currentDeliveries.length],
  );
  const handleTabPress = (key: any) => {
    setSelectedTab(key);
  };

  const renderRideCard = useCallback(
    (ride: any) => (
      <Pressable
        key={ride.id}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 20,
          padding: 18,
          marginBottom: 16,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 5 },
          elevation: 5,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.6)',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginVertical: 8,
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#111' }}>
            ₹{ride.fare.toLocaleString()}
          </Text>
          <View
            style={{
              backgroundColor:
                ride.status === 'completed'
                  ? '#bdfdd0ff'
                  : ride.status === 'cancelled'
                  ? '#fababaff'
                  : '#f3e57dff',
              paddingVertical: 4,
              paddingHorizontal: 10,
              borderRadius: 20,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#111' }}>
              {ride.status}
            </Text>
          </View>
        </View>

        <View
          style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}
        >
          <MapPin size={16} color="#007AFF" />
          <Text style={{ color: '#444', fontSize: 15, marginLeft: 6 }}>
            {ride.pickup} → {ride.destination}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 12,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <User size={16} color="#888" />
            <Text style={{ color: '#333', fontSize: 14, marginLeft: 6 }}>
              {ride.driver.name}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Star size={16} color="#FFD700" />
            <Text style={{ fontSize: 14, color: '#333', marginLeft: 4 }}>
              {ride.driver.rating}
            </Text>
          </View>
        </View>
      </Pressable>
    ),
    [],
  );

  return (
    <>
      <View
        style={{
          backgroundColor: '#f66a0cff',
          paddingTop: 50,
          paddingBottom: 20,
          paddingLeft: 10,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text sx={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>
          Track Your Active Bookings
        </Text>
        <View sx={{ marginRight: 30 }}>
          <Clock color="#c2cde4ff" size={24} />
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          borderRadius: 12,
          marginHorizontal: 8,
          marginTop: 16,
          padding: 4,
        }}
      >
        {tabs.map(tab => {
          const isActive = selectedTab === tab.key;
          const Icon = tab.icon;

          return (
            <Pressable
              key={tab.key}
              onPress={() => handleTabPress(tab.key)}
              style={({ pressed }) => [
                {
                  flex: 1,
                  borderRadius: 10,
                  paddingVertical: 10,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  backgroundColor: isActive ? '#fb9637ff' : '#eee',
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <View style={{ margin: 8 }}>
                <Icon size={24} color={isActive ? 'white' : 'black'} />
              </View>
              <Text
                style={{
                  color: isActive ? 'white' : 'black',
                  fontWeight: '600',
                  fontSize: 18,
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16, marginTop: 20 }}>
        {selectedTab === 'rides' ? (
          currentRides.length > 0 ? (
            currentRides.map(renderRideCard)
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
