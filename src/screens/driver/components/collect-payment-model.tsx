import React from 'react';
import { Pressable, Text, View } from 'dripsy';
import {
  Banknote,
  Smartphone,
  Wallet,
  CheckCircle2,
} from 'lucide-react-native';
import { Modal } from 'react-native';

export default function CollectPaymentModal({
  visible,
  amount,
  onSelect,
}: {
  visible: boolean;
  amount: number | string;
  onSelect: (mode: 'cash' | 'digital' | 'wallet') => void;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      hardwareAccelerated
      statusBarTranslucent
      onRequestClose={() => {
        // ❌ Do nothing (blocks Android back button)
      }}
    >
      <View
        sx={{
          flex: 1,
          bg: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}
      >
        <View
          sx={{
            bg: '#ffffff',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            px: 4,
            pt: 5,
            pb: 6,
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <View sx={{ alignItems: 'center', mb: 3 }}>
            <CheckCircle2 size={34} color="#16a34a" />
          </View>

          <Text
            sx={{
              fontSize: 20,
              fontWeight: '800',
              textAlign: 'center',
              mb: 1,
              color: '#111827',
            }}
          >
            Ride Completed
          </Text>
          <Text
            sx={{
              textAlign: 'center',
              color: '#6b7280',
              fontSize: 14,
              mb: 4,
              lineHeight: 20,
            }}
          >
            Thank you for completing the ride successfully.
            {'\n'}
            Please collect the payment to finish the trip.
          </Text>

          {/* Amount */}
          <View sx={{ mb: 18, mt: 10 }}>
            <Text
              sx={{
                textAlign: 'center',
                color: '#6b7280',
                fontSize: 13,
                mb: 1,
              }}
            >
              Total amount to collect
            </Text>
            <Text
              sx={{
                fontSize: 32,
                fontWeight: '900',
                textAlign: 'center',
                color: '#06760fff',
              }}
            >
              ₹{amount}
            </Text>
          </View>

          <Pressable
            onPress={() => onSelect('cash')}
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              bg: '#ecfdf5',
              borderRadius: 16,
              px: 10,
              py: 10,
              mb: 15,
              borderWidth: 1,
              borderColor: '#bbf7d0',
            }}
          >
            <Banknote size={22} color="#16a34a" />
            <View sx={{ ml: 20 }}>
              <Text sx={{ fontSize: 16, fontWeight: '700', color: '#166534' }}>
                Cash
              </Text>
              <Text sx={{ fontSize: 12, color: '#16a34a' }}>
                Collect cash from passenger
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => onSelect('digital')}
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              bg: '#eff6ff',
              borderRadius: 16,
              px: 10,
              py: 10,
              mb: 15,
              borderWidth: 1,
              borderColor: '#bfdbfe',
            }}
          >
            <Smartphone size={22} color="#2563eb" />
            <View sx={{ ml: 20 }}>
              <Text sx={{ fontSize: 16, fontWeight: '700', color: '#1e40af' }}>
                Digital / UPI
              </Text>
              <Text sx={{ fontSize: 12, color: '#2563eb' }}>
                Payment via UPI or online app
              </Text>
            </View>
          </Pressable>
          <Pressable
            onPress={() => onSelect('wallet')}
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              bg: '#f5f3ff',
              borderRadius: 16,
              px: 10,
              py: 10,
              mb: 15,
              borderWidth: 1,
              borderColor: '#ddd6fe',
            }}
          >
            <Wallet size={22} color="#7c3aed" />
            <View sx={{ ml: 20 }}>
              <Text sx={{ fontSize: 16, fontWeight: '700', color: '#5b21b6' }}>
                Wallet
              </Text>
              <Text sx={{ fontSize: 12, color: '#7c3aed' }}>
                Deduct from in-app wallet
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
