import React, { useState } from 'react';
import { ScrollView } from 'react-native';
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

export default function PassengerProfile({ navigation }: { navigation: any }) {
  const sx = useSx();
  const { logout } = useAuth() || {};
  const [photo, setPhoto] = useState<string | null>(null);

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
  const authSession = {
    fullName: 'John Doe',
    phone: '+91 9876543210',
    email: 'john@example.com',
    id: 'USR12345',
  };
  const totalTrips = 12;
  const walletBalance = 450;
  const menuItems = [
    {
      label: 'History',
      icon: Clock,
      action: () => navigation.navigate('PassengerRideHistory'),
    },
    {
      label: 'Safety Settings',
      icon: Shield,
      action: () => navigation.navigate('PassengerSafetySettings'),
    },
    {
      label: 'FAQ',
      icon: HelpCircle,
      action: () => navigation.navigate('PassengerFAQ'),
    },
    {
      label: 'Privacy Policy',
      icon: FileText,
      action: () => navigation.navigate('PrivacyPolicyScreen'),
    },
    {
      label: 'Help & Support',
      icon: Headphones,
      action: () => navigation.navigate('PassengerHelpSupport'),
    },
  ];

  const handleSignOut = () => {
    // logout();
    console.log('logout');
  };

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
            {authSession.fullName}
          </Text>
          <Text sx={{ color: 'gray', fontSize: 14 }}>{authSession.phone}</Text>
          <Text sx={{ color: 'gray', fontSize: 13, mt: 6 }}>
            Member since Jan 2024
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
              onPress={() => navigation.navigate('EditProfile')}
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
              value: authSession.phone,
              icon: Phone,
              color: '#10B981',
            },
            {
              label: 'Email',
              value: authSession.email,
              icon: Mail,
              color: '#3B82F6',
            },
            {
              label: 'User ID',
              value: authSession.id,
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
              value: 'Jan 2024',
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
              {totalTrips} completed trips
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
              ₹{walletBalance}
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
          onPress={handleSignOut}
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
