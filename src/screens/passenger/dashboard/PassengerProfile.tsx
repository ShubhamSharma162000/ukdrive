import React, { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { Image, Pressable, Text, useSx, View } from 'dripsy';
import {
  Info,
  Phone,
  Mail,
  IdCard,
  UserCheck,
  Calendar,
  BarChart3,
  Route,
  Wallet,
  ChevronRight,
  LogOut,
  Upload,
  Clock,
  Shield,
  HelpCircle,
  FileText,
  Headphones,
} from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import * as ImagePicker from 'react-native-image-picker';
import {
  launchImageLibrary,
  ImageLibraryOptions,
} from 'react-native-image-picker';
import { useQuery } from '@tanstack/react-query';
import { getPassengerDetail } from '../PassengerQuery';
// import Clipboard from '@react-native-clipboard/clipboard';

export default function PassengerProfile({ navigation }: { navigation: any }) {
  const sx = useSx();
  const { id, user, logout = () => {} } = useAuth() || {};

  const [photo, setPhoto] = useState<string | null>(null);

  const { data: passengerData } = useQuery({
    queryKey: ['passenger', id],
    queryFn: () => getPassengerDetail(id),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: !!id,
  });

  const openImagePicker = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 1,
    };

    const result = await launchImageLibrary(options);

    if (result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setPhoto(uri ?? null);
    } else {
      console.log('No image selected');
    }
  };

  const shortId = passengerData?.data?.id
    ? passengerData?.data?.id.slice(0, 12) + '...'
    : 'N/A';

  const menuItems = [
    {
      label: 'History',
      icon: Clock,
      action: () =>
        navigation.navigate('PassengerTabs', {
          screen: 'HomeStack',
          params: { screen: 'RideHistory' },
        }),
    },
    {
      label: 'Safety Settings',
      icon: Shield,
      action: () =>
        navigation.navigate('PassengerTabs', {
          screen: 'HomeStack',
          params: { screen: 'Safety' },
        }),
    },
    {
      label: 'FAQ',
      icon: HelpCircle,
      action: () =>
        navigation.navigate('PassengerTabs', {
          screen: 'HomeStack',
          params: { screen: 'FAQ' },
        }),
    },
    {
      label: 'Privacy Policy',
      icon: FileText,
      action: () =>
        navigation.navigate('PassengerTabs', {
          screen: 'HomeStack',
          params: { screen: 'PrivacyPolicy' },
        }),
    },
    {
      label: 'Help & Support',
      icon: Headphones,
      action: () =>
        navigation.navigate('PassengerTabs', {
          screen: 'HomeStack',
          params: { screen: 'HelpSupport' },
        }),
    },
  ];

  return (
    <View
      sx={{
        flex: 1,
        backgroundColor: 'white',
      }}
    >
      <View
        sx={{
          backgroundColor: '#f66a0cff',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      >
        <Text
          sx={{
            fontSize: 20,
            fontWeight: 'bold',
            color: 'white',
            mt: 30,
            mb: 10,
          }}
        >
          Profile
        </Text>
      </View>

      <ScrollView contentContainerStyle={sx({ pb: 100, p: 12 })}>
        <View sx={{ alignItems: 'center', mb: 24 }}>
          <View
            sx={{
              width: 100,
              height: 100,
              borderRadius: 999,
              overflow: 'hidden',
              borderWidth: 3,
              borderColor: '#f45a01ff',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              source={
                photo
                  ? { uri: photo }
                  : require('../../../assets/images/default-profile.jpg')
              }
              style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
            />
          </View>

          <Pressable
            onPress={openImagePicker}
            sx={{
              mt: 20,
              bg: '#fcfdfdff',
              py: 6,
              px: 12,
              borderRadius: 10,
              alignItems: 'center',
              margin: 4,
              borderWidth: 1,
              borderColor: '#ccc',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Upload color="#0a0a0aff" size={12} />
            <Text sx={{ color: '#0a0a0aff', fontSize: 10, fontWeight: 'bold' }}>
              Upload Photo
            </Text>
          </Pressable>

          <Text sx={{ fontSize: 16, fontWeight: 'bold', color: '#f66a0cff' }}>
            {passengerData?.data?.full_name}
          </Text>
          <Text sx={{ color: 'gray', fontSize: 14 }}>
            {passengerData?.data?.phone}
          </Text>
          <Text sx={{ color: 'gray', fontSize: 13, mt: 6 }}>
            {passengerData?.data?.created_at
              ? new Date(passengerData.data.created_at).toLocaleDateString(
                  'en-GB',
                  {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  },
                )
              : ''}
          </Text>
        </View>

        <View
          sx={{
            backgroundColor: 'white',
            borderRadius: 16,
            p: 1,
            mb: 20,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 4,
          }}
        >
          <View
            sx={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              mb: 12,
            }}
          >
            <View sx={{ flexDirection: 'row', alignItems: 'center' }}>
              <Info size={18} color="#007AFF" style={{ marginRight: 8 }} />
              <Text sx={{ fontSize: 14, fontWeight: '600' }}>
                Basic Information
              </Text>
            </View>

            <Pressable
              onPress={() => {
                navigation.getParent()?.navigate('PassengerTabs', {
                  screen: 'HomeStack',
                  params: {
                    screen: 'EditProfile',
                    params: {
                      full_name: passengerData?.data?.full_name,
                      phone: passengerData?.data?.phone,
                      email: passengerData?.data?.email,
                    },
                  },
                });
              }}
              sx={{
                px: 12,
                py: 4,
                borderRadius: 20,
                backgroundColor: '#f9924eff',
              }}
            >
              <Text sx={{ fontSize: 14, fontWeight: '900' }}>Edit</Text>
            </Pressable>
          </View>

          {[
            {
              label: 'Phone Number',
              value: passengerData?.data?.phone,
              icon: Phone,
              color: '#10B981',
            },
            {
              label: 'Email',
              value: passengerData?.data?.email,
              icon: Mail,
              color: '#3B82F6',
            },
            {
              label: 'User ID',
              value: shortId,
              icon: IdCard,
              color: '#8B5CF6',
            },
            {
              label: 'Account Status',
              value: 'Active',
              icon: UserCheck,
              color: '#22C55E',
            },
            {
              label: 'Member Since',
              value: passengerData?.data?.created_at
                ? new Date(passengerData.data.created_at).toLocaleDateString(
                    'en-GB',
                    {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    },
                  )
                : '',
              icon: Calendar,
              color: '#F97316',
            },
          ].map((item, idx) => (
            <View
              key={idx}
              sx={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 8,
                mt: 20,
                borderBottomWidth: idx < 4 ? 1 : 0,
                borderColor: '#f66a0cff',
              }}
            >
              <View sx={{ flexDirection: 'row', alignItems: 'center' }}>
                <item.icon
                  size={18}
                  color={item.color}
                  style={{ marginRight: 8 }}
                />
                <Text sx={{ color: 'gray', fontSize: 14 }}>{item.label}</Text>
              </View>
              <Text sx={{ fontSize: 13, fontWeight: '500', color: '#111' }}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        <View
          sx={{
            backgroundColor: 'white',
            borderRadius: 16,
            mt: 20,
            py: 36,
            px: 16,
            mb: 40,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 4,
            borderWidth: 1,
            borderColor: '#f66a0cff',
          }}
        >
          <View sx={{ flexDirection: 'row', alignItems: 'center', mb: 12 }}>
            <BarChart3 size={18} color="#3B82F6" style={{ marginRight: 8 }} />
            <Text sx={{ fontSize: 14, fontWeight: '600' }}>
              Trip Statistics
            </Text>
          </View>

          <View
            sx={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              py: 8,
            }}
          >
            <View sx={{ flexDirection: 'row', alignItems: 'center' }}>
              <Route size={18} color="#10B981" style={{ marginRight: 8 }} />
              <Text sx={{ color: 'gray', fontSize: 14 }}>Total Trips</Text>
            </View>
            <Text sx={{ fontWeight: '500', color: '#111', fontSize: 14 }}>
              {passengerData?.data?.total_rides} completed trips
            </Text>
          </View>

          <View
            sx={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              py: 8,
            }}
          >
            <View sx={{ flexDirection: 'row', alignItems: 'center' }}>
              <Wallet size={18} color="#8B5CF6" style={{ marginRight: 8 }} />
              <Text sx={{ color: 'gray', fontSize: 14 }}>Wallet Balance</Text>
            </View>
            <Text sx={{ fontWeight: '500', color: '#111' }}>
              ₹{passengerData?.data?.wallet_balance}
            </Text>
          </View>
        </View>

        {menuItems.map((item, index) => (
          <Pressable
            key={index}
            onPress={item.action}
            sx={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f9fafb',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#f07c07ff',
              p: 16,
              mb: 10,
            }}
          >
            <View sx={{ flexDirection: 'row', alignItems: 'center' }}>
              <item.icon
                size={20}
                color="#4B5563"
                style={{ marginRight: 10 }}
              />
              <Text sx={{ fontSize: 13, fontWeight: '500', color: '#111' }}>
                {item.label}
              </Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </Pressable>
        ))}

        <Pressable
          onPress={() => {
            if (typeof logout === 'function') logout();
          }}
          sx={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#fee2e2',
            borderRadius: 12,
            p: 16,
            mb: 10,
          }}
        >
          <View sx={{ flexDirection: 'row', alignItems: 'center' }}>
            <LogOut size={20} color="#DC2626" style={{ marginRight: 10 }} />
            <Text sx={{ fontSize: 16, fontWeight: '500', color: '#DC2626' }}>
              Sign Out
            </Text>
          </View>
          <ChevronRight size={18} color="#f87171" />
        </Pressable>
      </ScrollView>
    </View>
  );
}
