import React from 'react';
import { ScrollView } from 'react-native';
import { View, Text, Pressable } from 'dripsy';

export default function MyEarningsScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F6FA' }}>
      <View
        sx={{
          px: 16,
          pt: 40,
          pb: 10,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text sx={{ fontSize: 26, fontWeight: '700' }}>My Earnings</Text>

        {/* <Pressable>
          <Ionicons name="download-outline" size={26} color="#7B3EFF" />
        </Pressable> */}
      </View>

      {/* Tabs */}
      <View
        sx={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          px: 16,
          mb: 14,
        }}
      >
        {['Today', 'Weekly', 'Monthly'].map(t => (
          <Pressable key={t} style={{ flex: 1 }}>
            <View
              sx={{
                py: 10,
                mx: 4,
                borderRadius: 12,
                backgroundColor: t === 'Weekly' ? '#7B3EFF' : '#EFEFFE',
              }}
            >
              <Text
                sx={{
                  textAlign: 'center',
                  color: t === 'Weekly' ? 'white' : '#7B3EFF',
                  fontWeight: '600',
                }}
              >
                {t}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Earnings cards */}
      <View
        sx={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          px: 16,
          mb: 18,
        }}
      >
        <Card title="My Earnings" amount="₹59.50" sub="Total Earnings" />
        <Card title="Completed Trips" amount="2" sub="Total Trips" />
      </View>

      {/* Trips list */}
      <Text sx={{ px: 16, mb: 10, fontWeight: '700', fontSize: 17 }}>
        This Week Trips
      </Text>

      <View sx={{ px: 12 }}>
        <TripItem
          name="Dishank"
          date="23/11/2025"
          time="04:20 PM"
          amount="₹29.75"
        />
        <TripItem
          name="Dishank"
          date="23/11/2025"
          time="04:03 PM"
          amount="₹29.75"
        />
      </View>
    </ScrollView>
  );
}

/* ————————————————————————————
   Components
———————————————————————————— */

const Card = ({ title, amount, sub }: any) => (
  <View
    sx={{
      width: '48%',
      backgroundColor: 'white',
      borderRadius: 14,
      p: 16,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
    }}
  >
    <Text sx={{ color: '#888', fontSize: 14 }}>{title}</Text>
    <Text sx={{ fontSize: 26, fontWeight: '700', mt: 4 }}>{amount}</Text>
    <Text sx={{ fontSize: 13, color: '#888', mt: 2 }}>{sub}</Text>
  </View>
);

const TripItem = ({ name, date, time, amount }: any) => (
  <View
    sx={{
      backgroundColor: 'white',
      borderRadius: 14,
      p: 14,
      mb: 14,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    }}
  >
    <View sx={{ flexDirection: 'row', alignItems: 'center' }}>
      <View
        sx={{
          width: 44,
          height: 44,
          borderRadius: 30,
          backgroundColor: '#C9C9C9',
          mr: 12,
        }}
      />

      <View>
        <Text sx={{ fontSize: 15, fontWeight: '600' }}>{name}</Text>
        <Text sx={{ color: '#606060', fontSize: 14, mt: 2 }}>
          {date} • {time}
        </Text>
      </View>
    </View>

    <View style={{ alignItems: 'flex-end' }}>
      <Text sx={{ fontSize: 16, fontWeight: '700' }}>{amount}</Text>
      <Text sx={{ fontSize: 12, color: '#707070', mt: 2 }}>
        Driver Earnings
      </Text>
    </View>
  </View>
);
