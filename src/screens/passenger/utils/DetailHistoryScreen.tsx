import React from 'react';
import { ScrollView, Pressable, TouchableOpacity } from 'react-native';
import { View, Text } from 'dripsy';
import { ArrowLeft } from 'lucide-react-native';
import { StackNavigationProp } from '@react-navigation/stack';

// 👇 Define your navigation types (replace with your actual stack name)
type RootStackParamList = {
  RideDetails: undefined;
  // Add other screens here if needed
  Home: undefined;
};

type RideDetailsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'RideDetails'
>;

type Props = {
  navigation: RideDetailsScreenNavigationProp;
};

interface RideLocation {
  title: string;
  time: string;
}

interface RideDetails {
  type: string;
  id: string;
  status: string;
  fare: string;
  pickup: RideLocation;
  dropoff: RideLocation;
}

const DetailHistoryScreen: React.FC<Props> = ({ navigation }) => {
  const ride: RideDetails = {
    type: 'Bike',
    id: '#57d9b5a8',
    status: 'Completed',
    fare: '₹29.00',
    pickup: {
      title: 'QF46+XRF, Haridwar Rd, Padampur, Uttarakhand 246149, India',
      time: '9 Nov 2025 at 06:13 PM',
    },
    dropoff: {
      title:
        'QF4G+3RH, Nimbuchaur - Haridwar Rd, Padampur, Nimbuchaur, Uttarakhand 246149, India',
      time: '9 Nov 2025 at 11:18 AM',
    },
  };

  return (
    <View sx={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <View
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          px: 16,
          py: 14,
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
          backgroundColor: '#fff',
        }}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color="#374151" />
        </Pressable>
        <Text
          sx={{ fontSize: 18, fontWeight: '600', color: '#111827', ml: 12 }}
        >
          Ride Details
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          sx={{
            backgroundColor: '#fff',
            borderRadius: 12,
            m: 16,
            p: 16,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
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
              <Text sx={{ fontWeight: '700', fontSize: 16 }}>{ride.type}</Text>
              <Text sx={{ color: '#6b7280', mt: 2 }}>Ride ID: {ride.id}</Text>
            </View>

            <View
              sx={{
                backgroundColor: '#dcfce7',
                px: 10,
                py: 4,
                borderRadius: 8,
              }}
            >
              <Text sx={{ color: '#15803d', fontWeight: '600' }}>
                {ride.status}
              </Text>
            </View>
          </View>

          <View
            sx={{
              borderTopWidth: 1,
              borderTopColor: '#e5e7eb',
              mt: 12,
              pt: 12,
              alignItems: 'center',
            }}
          >
            <Text sx={{ fontSize: 24, fontWeight: '700', color: '#111827' }}>
              {ride.fare}
            </Text>
            <Text sx={{ color: '#6b7280', mt: 2 }}>Total Fare</Text>
          </View>
        </View>

        <View
          sx={{
            backgroundColor: '#fff',
            borderRadius: 12,
            m: 16,
            p: 16,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <Text sx={{ fontWeight: '700', fontSize: 16, mb: 8 }}>
            Trip Route
          </Text>

          <View sx={{ flexDirection: 'row', alignItems: 'flex-start', m: 20 }}>
            <View
              sx={{
                width: 8,
                height: 8,
                borderRadius: 50,
                backgroundColor: '#f97316',
                mt: 6,
                mr: 10,
              }}
            />
            <View sx={{ flex: 1 }}>
              <Text sx={{ fontWeight: '600', color: '#6b7280' }}>
                PICKUP LOCATION
              </Text>
              <Text sx={{ mt: 4, color: '#111827' }}>{ride.pickup.title}</Text>
              <Text sx={{ mt: 2, color: '#6b7280', fontSize: 13 }}>
                {ride.pickup.time}
              </Text>
            </View>
          </View>

          <View sx={{ flexDirection: 'row', alignItems: 'flex-start', m: 20 }}>
            <View
              sx={{
                width: 8,
                height: 8,
                borderRadius: 50,
                backgroundColor: '#8b5cf6',
                mt: 6,
                mr: 10,
              }}
            />
            <View sx={{ flex: 1 }}>
              <Text sx={{ fontWeight: '600', color: '#6b7280' }}>
                DROP-OFF LOCATION
              </Text>
              <Text sx={{ mt: 4, color: '#111827' }}>{ride.dropoff.title}</Text>
              <Text sx={{ mt: 2, color: '#6b7280', fontSize: 13 }}>
                {ride.dropoff.time}
              </Text>
            </View>
          </View>
        </View>
        <View
          sx={{
            backgroundColor: '#fff',
            borderRadius: 16,
            p: 16,
            m: 16,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <View
            sx={{
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}
          >
            <Text sx={{ fontWeight: '700', fontSize: 16, color: '#111827' }}>
              Trip Information
            </Text>
          </View>

          <View sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View
              sx={{
                flex: 1,
                alignItems: 'center',
                borderRightWidth: 1,
                borderRightColor: '#e5e7eb',
              }}
            >
              <Text sx={{ color: '#6b7280', fontWeight: '500' }}>Distance</Text>
              <Text
                sx={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: '#111827',
                  mt: 4,
                }}
              >
                1.38
              </Text>
            </View>

            <View sx={{ flex: 1, alignItems: 'center' }}>
              <Text sx={{ color: '#6b7280', fontWeight: '500' }}>Duration</Text>
              <Text
                sx={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: '#111827',
                  mt: 4,
                }}
              >
                4 min
              </Text>
            </View>
          </View>
        </View>

        <View
          sx={{
            backgroundColor: '#fff',
            borderRadius: 16,
            p: 16,
            m: 16,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <Text
            sx={{ fontWeight: '700', fontSize: 16, color: '#111827', mb: 12 }}
          >
            Fare Breakdown
          </Text>

          <View
            sx={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              mb: 6,
            }}
          >
            <Text sx={{ color: '#111827' }}>Base Fare</Text>
            <Text sx={{ color: '#111827' }}>₹25.00</Text>
          </View>

          <View
            sx={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              mb: 8,
            }}
          >
            <Text sx={{ color: '#2563eb' }}>
              Taxes and Service Charge (15%)
            </Text>
            <Text sx={{ color: '#2563eb' }}>₹4.00</Text>
          </View>

          <View
            sx={{
              height: 1,
              backgroundColor: '#e5e7eb',
              my: 8,
            }}
          />

          <View
            sx={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text sx={{ fontWeight: '700', color: '#111827' }}>Total</Text>
            <Text sx={{ fontWeight: '700', color: '#16a34a' }}>₹29.00</Text>
          </View>
        </View>

        <View sx={{ m: 16 }}>
          <TouchableOpacity
            onPress={() => {
              navigation.getParent()?.navigate('PassengerTabs', {
                screen: 'HomeStack',
                params: { screen: 'RateYourRide' },
              });
            }}
            style={{
              backgroundColor: '#fef9c3',
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <Text style={{ color: '#92400e', fontWeight: '600', fontSize: 16 }}>
              Rate This Ride
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#e0f2fe',
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <Text style={{ color: '#1d4ed8', fontWeight: '600', fontSize: 16 }}>
              Download Receipt
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              navigation.getParent()?.navigate('PassengerTabs', {
                screen: 'HomeStack',
                params: { screen: 'HelpSupport' },
              });
            }}
            style={{
              backgroundColor: '#f3f4f6',
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: '#111827',
                fontWeight: '600',
                fontSize: 16,
              }}
            >
              Get Help
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default DetailHistoryScreen;
