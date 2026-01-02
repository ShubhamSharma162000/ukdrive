import React, { useState } from 'react';
import { Modal, Switch, TouchableOpacity } from 'react-native';
import { View, Text, ScrollView, TextInput } from 'dripsy';
import { backgroundColor } from '@shopify/restyle';

// Define the allowed setting keys
type SettingKey =
  | 'shareRideDetails'
  | 'emergencyAlerts'
  | 'locationSharing'
  | 'rideVerification'
  | 'nightModeSafety';

export default function PassengerSafetySettings() {
  const [settings, setSettings] = useState<Record<SettingKey, boolean>>({
    shareRideDetails: true,
    emergencyAlerts: true,
    locationSharing: true,
    rideVerification: true,
    nightModeSafety: true,
  });
  const [addEmergencyContctModalVisible, setAddEmergencyContctModalVisible] =
    useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    relationship: '',
  });

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSave = () => {
    console.log('Saved contact:', form);
    setAddEmergencyContctModalVisible(false);
    setForm({ name: '', phone: '', relationship: '' });
  };

  const toggleSwitch = (key: SettingKey) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <ScrollView sx={{ flex: 1, backgroundColor: '#f7f8fa', padding: 20 }}>
      <View
        sx={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 20,
        }}
      >
        <View>
          <Text sx={{ fontSize: 26, fontWeight: 'bold', color: '#000' }}>
            Safety Settings
          </Text>
          <Text sx={{ fontSize: 15, color: '#6c6c6c' }}>
            Manage your safety preferences
          </Text>
        </View>
        <View
          sx={{
            backgroundColor: '#f2f3f5',
            width: 40,
            height: 40,
            borderRadius: 9999,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text sx={{ fontSize: 22 }}>🛡️</Text>
        </View>
      </View>

      <View
        sx={{
          backgroundColor: '#fff',
          borderColor: '#f9f1f1ff',
          border: 2,
          borderRadius: 12,
          padding: 20,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 4,
          mb: 20,
        }}
      >
        <Text
          sx={{ fontSize: 20, fontWeight: 'bold', color: '#f97316', mb: 10 }}
        >
          Safety Features
        </Text>

        {(
          [
            {
              key: 'shareRideDetails',
              title: 'Share Ride Details',
              desc: 'Automatically share trip details with emergency contacts',
            },
            {
              key: 'emergencyAlerts',
              title: 'Emergency Alerts',
              desc: 'Enable quick access to emergency features',
            },
            {
              key: 'locationSharing',
              title: 'Location Sharing',
              desc: 'Share live location during rides',
            },
            {
              key: 'rideVerification',
              title: 'Ride Verification',
              desc: 'Verify driver and vehicle details before starting',
            },
            {
              key: 'nightModeSafety',
              title: 'Night Mode Safety',
              desc: 'Enhanced safety features for night rides',
            },
          ] as { key: SettingKey; title: string; desc: string }[]
        ).map((item, idx) => (
          <View
            key={item.key}
            sx={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottomWidth: idx === 4 ? 0 : 1,
              borderColor: '#eee',
              py: 12,
            }}
          >
            <View sx={{ flex: 1, pr: 10 }}>
              <Text sx={{ fontSize: 16, fontWeight: 'bold', color: '#1e1e1e' }}>
                {item.title}
              </Text>
              <Text sx={{ fontSize: 14, color: '#6b7280', mt: 1 }}>
                {item.desc}
              </Text>
            </View>
            <Switch
              trackColor={{ false: '#d1d5db', true: '#22c55e' }}
              thumbColor="#fff"
              value={settings[item.key]}
              onValueChange={() => toggleSwitch(item.key)}
            />
          </View>
        ))}
      </View>

      <View
        sx={{
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: '#e4e8e8ff',
          borderRadius: 12,
          padding: 20,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 4,
        }}
      >
        <View
          sx={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 10,
          }}
        >
          <Text sx={{ fontSize: 20, fontWeight: 'bold', color: '#f97316' }}>
            Emergency Contacts
          </Text>
          <TouchableOpacity
            onPress={() => setAddEmergencyContctModalVisible(true)}
            style={{
              backgroundColor: '#f97316',
              borderRadius: 8,
              padding: 10,
            }}
          >
            <Text sx={{ color: '#fff', fontWeight: 'bold' }}>Add</Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={addEmergencyContctModalVisible}
          onRequestClose={() => setAddEmergencyContctModalVisible(false)}
        >
          <View
            sx={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.4)',
            }}
          >
            <View
              sx={{
                backgroundColor: '#fff',
                borderRadius: 12,
                padding: 20,
                width: '90%',
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 6,
              }}
            >
              <Text
                sx={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: '#f97316',
                  mb: 16,
                }}
              >
                Add Emergency Contact
              </Text>

              <View sx={{ flexDirection: 'row', gap: 10 }}>
                <View sx={{ flex: 1 }}>
                  <Text sx={{ fontWeight: '600', mb: 4 }}>Full Name *</Text>
                  <TextInput
                    placeholder="Enter full name"
                    style={{
                      borderWidth: 1,
                      borderColor: '#d1d5db',
                      borderRadius: 8,
                      padding: 10,
                    }}
                    value={form.name}
                    onChangeText={v => handleChange('name', v)}
                  />
                </View>

                <View sx={{ flex: 1 }}>
                  <Text sx={{ fontWeight: '600', mb: 4 }}>Phone Number *</Text>
                  <TextInput
                    placeholder="10-digit phone"
                    keyboardType="phone-pad"
                    style={{
                      borderWidth: 1,
                      borderColor: '#d1d5db',
                      borderRadius: 8,
                      padding: 10,
                    }}
                    value={form.phone}
                    onChangeText={v => handleChange('phone', v)}
                  />
                </View>
              </View>

              <View sx={{ mt: 12 }}>
                <Text sx={{ fontWeight: '600', mb: 4 }}>Relationship</Text>
                <TextInput
                  placeholder="Parent, Spouse, Friend, ..."
                  style={{
                    borderWidth: 1,
                    borderColor: '#d1d5db',
                    borderRadius: 8,
                    padding: 10,
                  }}
                  value={form.relationship}
                  onChangeText={v => handleChange('relationship', v)}
                />
              </View>

              <View
                sx={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  mt: 20,
                  gap: 12,
                }}
              >
                <TouchableOpacity
                  style={{
                    backgroundColor: '#3b82f6',
                    borderRadius: 10,
                    flex: 1,
                    paddingVertical: 10,
                  }}
                  onPress={handleSave}
                >
                  <Text
                    sx={{
                      color: '#fff',
                      fontWeight: '600',
                      textAlign: 'center',
                    }}
                  >
                    Save
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: '#f3f4f6',
                    borderRadius: 10,
                    flex: 1,
                    paddingVertical: 10,
                  }}
                  onPress={() => setAddEmergencyContctModalVisible(false)}
                >
                  <Text
                    sx={{
                      color: '#374151',
                      fontWeight: '600',
                      textAlign: 'center',
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <View sx={{ alignItems: 'center', mt: 10 }}>
          <Text sx={{ fontSize: 16, color: '#374151', fontWeight: 'bold' }}>
            No emergency contacts added
          </Text>
          <Text
            sx={{ fontSize: 14, color: '#6b7280', mt: 4, textAlign: 'center' }}
          >
            Add trusted contacts for emergency situations
          </Text>
        </View>
      </View>
      <View
        sx={{
          mt: 20,
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: '#e5e7eb',
          borderRadius: 12,
          padding: 20,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 4,
          marginBottom: 20,
        }}
      >
        <Text
          sx={{ fontSize: 20, fontWeight: '700', color: '#f97316', mb: 16 }}
        >
          Emergency Actions
        </Text>
        <View
          sx={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            gap: 12,
            marginBottom: 20,
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: '#f97316',
              borderRadius: 10,
              paddingVertical: 10,
              paddingHorizontal: 16,
              width: '48%',
            }}
          >
            <Text
              sx={{
                color: '#fff',
                fontWeight: '600',
                textAlign: 'center',
                fontSize: 14,
              }}
            >
              Test Emergency Alert
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#f97316',
              borderRadius: 10,
              paddingVertical: 10,
              paddingHorizontal: 16,
              width: '48%',
            }}
          >
            <Text
              sx={{
                color: '#fff',
                fontWeight: '600',
                textAlign: 'center',
                fontSize: 14,
              }}
            >
              SOS Information
            </Text>
          </TouchableOpacity>
        </View>

        <View
          sx={{
            backgroundColor: '#f9fafb',
            borderRadius: 10,
            padding: 14,
          }}
        >
          <Text sx={{ fontWeight: '700', fontSize: 16, mb: 8 }}>
            How Emergency Features Work:
          </Text>

          <Text sx={{ color: '#374151', mb: 4, fontSize: 14 }}>
            • Emergency contacts receive ride details automatically when enabled
          </Text>
          <Text sx={{ color: '#374151', mb: 4, fontSize: 14 }}>
            • SOS button appears during active rides for immediate help
          </Text>
          <Text sx={{ color: '#374151', mb: 4, fontSize: 14 }}>
            • Location is shared in real-time with selected contacts
          </Text>
          <Text sx={{ color: '#374151', fontSize: 14 }}>
            • Emergency services can be contacted directly from the app
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
