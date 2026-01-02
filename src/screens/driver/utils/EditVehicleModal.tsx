import React, { useState } from 'react';
import { Modal, Pressable, TextInput } from 'react-native';
import { View, Text } from 'dripsy';
import { useToast } from '../../../context/ToastContext';

export default function EditVehicleModal({ visible, onClose }: any) {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    vehicleType: '',
    model: '',
    regNo: '',
    color: '',
  });

  const [openType, setOpenType] = useState(false);
  const [openColor, setOpenColor] = useState(false);

  const updateField = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!form.vehicleType || !form.model || !form.regNo || !form.color) {
      console.log('Validation failed!');
      return;
    }
    showToast('Form is updated successfully ', 'success');
    onClose();
  };

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View
        sx={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.4)',
          padding: 20,
        }}
      >
        <View
          sx={{
            width: '100%',
            bg: 'white',
            borderRadius: 16,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 10,
            elevation: 8,
          }}
        >
          <View
            sx={{
              width: '100%',
              bg: '#A84DFF',
              padding: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text sx={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
              Edit Vehicle Details
            </Text>

            <Pressable onPress={onClose}>
              <Text sx={{ color: 'white', fontSize: 20 }}>✕</Text>
            </Pressable>
          </View>

          <View sx={{ padding: 18 }}>
            <Text sx={{ fontWeight: 'bold', mb: 6 }}>Vehicle Type</Text>

            <Pressable
              onPress={() => setOpenType(!openType)}
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 10,
                padding: 14,
                marginBottom: 8,
              }}
            >
              <Text>{form.vehicleType || 'Select type'}</Text>
            </Pressable>

            {openType && (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 10,
                  marginBottom: 16,
                }}
              >
                {['Bike', 'Scooter', 'Car'].map(item => (
                  <Pressable
                    key={item}
                    onPress={() => {
                      updateField('vehicleType', item);
                      setOpenType(false);
                    }}
                    style={{ padding: 12 }}
                  >
                    <Text>{item}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            <Text sx={{ fontWeight: 'bold', mb: 6 }}>Vehicle Model</Text>

            <TextInput
              placeholder="e.g., Hero Splendor Plus"
              value={form.model}
              onChangeText={t => updateField('model', t)}
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 10,
                padding: 12,
                marginBottom: 16,
              }}
            />

            <Text sx={{ fontWeight: 'bold', mb: 6 }}>Registration Number</Text>

            <TextInput
              placeholder="UK 07 AB 1234"
              value={form.regNo}
              onChangeText={t => updateField('regNo', t)}
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 10,
                padding: 12,
                marginBottom: 6,
              }}
            />

            <Text sx={{ color: 'gray', mb: 16 }}>Format: UK 07 AB 1234</Text>

            <Text sx={{ fontWeight: 'bold', mb: 6 }}>Vehicle Color</Text>

            <TextInput
              placeholder="Enter vehicle color"
              value={form.color}
              onChangeText={t => updateField('color', t)}
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 10,
                padding: 12,
                marginBottom: 16,
              }}
            />

            <Pressable
              onPress={handleSubmit}
              style={{
                backgroundColor: '#B056FF',
                borderRadius: 10,
                paddingVertical: 14,
                marginBottom: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontSize: 16 }}>Save Changes</Text>
            </Pressable>

            <Pressable onPress={onClose}>
              <Text
                sx={{
                  textAlign: 'center',
                  paddingVertical: 12,
                  color: '#444',
                }}
              >
                Cancel
              </Text>
            </Pressable>

            <View
              sx={{
                bg: '#EDF2FF',
                padding: 12,
                borderRadius: 10,
                mt: 6,
              }}
            >
              <Text sx={{ color: '#5566AA', fontSize: 14 }}>
                Vehicle details will be verified before approval for rides
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
