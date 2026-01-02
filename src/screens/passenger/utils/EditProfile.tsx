import React, { useState } from 'react';
import { Alert, TextInput, TouchableOpacity } from 'react-native';
import { Text, View } from 'dripsy';
import { ArrowLeft, Edit3 } from 'lucide-react-native';
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { postUpdateProfile } from '../PassengerQuery';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import PassengerProfile from '../dashboard/PassengerProfile';

export default function EditProfile({ navigation, route }: any) {
  const { id } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { full_name = '', phone = '', email = '' } = route?.params || {};
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');

  const {
    mutate: updateProfile,
    data,
    isPending,
    isSuccess,
    error,
  } = useMutation({
    mutationFn: postUpdateProfile,
    onSuccess: response => {
      if (response?.success) {
        showToast(response?.message, 'success');
        queryClient.invalidateQueries({ queryKey: ['passenger', id] });
        navigation.navigate('Profile');
      }
    },
    onError: err => {
      console.log('Error:', err);
    },
  });

  const handleSave = () => {
    const name = formName?.trim?.() || '';
    const mail = formEmail?.trim?.() || '';

    if (!name && !mail) {
      Alert.alert('Validation Error', 'Please fill all required fields.');
      return;
    }
    if (name === full_name && mail === email) {
      Alert.alert('No Changes', 'You have not updated any information.');
      return;
    }
    updateProfile({
      id,
      full_name: name,
      email: mail,
    });
  };

  return (
    <View
      sx={{
        flex: 1,
        backgroundColor: '#f9fafb',
        p: 20,
      }}
    >
      <View
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 24,
        }}
      >
        <View sx={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              padding: 6,
              borderRadius: 50,
              backgroundColor: '#f3f4f6',
            }}
          >
            <ArrowLeft color="#111" size={22} />
          </TouchableOpacity>
          <View sx={{ ml: 12 }}>
            <Text sx={{ fontSize: 18, fontWeight: '700', color: '#111' }}>
              Edit Profile
            </Text>
            <Text sx={{ fontSize: 14, color: '#6b7280' }}>
              Update your information
            </Text>
          </View>
        </View>
        <Edit3 color="#9ca3af" size={20} />
      </View>

      <Text sx={{ fontSize: 18, fontWeight: '700', color: '#f97316', mb: 14 }}>
        Personal Information
      </Text>

      <Text sx={{ fontWeight: '600', mb: 6 }}>Full Name</Text>
      <TextInput
        value={formName}
        onChangeText={setFormName}
        placeholder={full_name}
        style={{
          borderWidth: 1,
          borderColor: '#e5e7eb',
          borderRadius: 8,
          padding: 10,
          backgroundColor: '#fff',
          marginBottom: 16,
        }}
      />

      <Text sx={{ fontWeight: '600', mb: 6 }}>Email</Text>
      <TextInput
        value={formEmail}
        onChangeText={setFormEmail}
        placeholder={email}
        style={{
          borderWidth: 1,
          borderColor: '#e5e7eb',
          borderRadius: 8,
          padding: 10,
          backgroundColor: '#fff',
          marginBottom: 16,
        }}
      />

      <View sx={{ flexDirection: 'row', alignItems: 'center', mb: 6 }}>
        <Text sx={{ fontWeight: '600', mr: 6 }}>Phone Number</Text>
        <View
          sx={{
            backgroundColor: '#fff7ed',
            borderRadius: 12,
            px: 8,
            py: 2,
          }}
        >
          <Text sx={{ color: '#f97316', fontSize: 12, fontWeight: '600' }}>
            Cannot Change
          </Text>
        </View>
      </View>

      <TextInput
        value={phone}
        editable={false}
        style={{
          borderWidth: 1,
          borderColor: '#e5e7eb',
          borderRadius: 8,
          padding: 10,
          backgroundColor: '#f3f4f6',
          color: '#9ca3af',
          marginBottom: 6,
        }}
      />

      <Text sx={{ color: '#6b7280', fontSize: 13, mb: 24 }}>
        Phone number is locked for security. To update,{' '}
        <Text sx={{ color: '#f97316', textDecorationLine: 'underline' }}>
          contact support
        </Text>{' '}
        or visit the nearest UKDrive office.
      </Text>

      <View
        sx={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <TouchableOpacity
          onPress={handleSave}
          style={{
            flex: 1,
            backgroundColor: '#f97316',
            borderRadius: 8,
            paddingVertical: 12,
            alignItems: 'center',
            marginRight: 8,
          }}
        >
          <Text sx={{ color: '#fff', fontWeight: '700' }}>Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          style={{
            flex: 1,
            borderColor: '#f97316',
            borderWidth: 1,
            borderRadius: 8,
            paddingVertical: 12,
            alignItems: 'center',
            marginLeft: 8,
          }}
        >
          <Text sx={{ color: '#f97316', fontWeight: '700' }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
