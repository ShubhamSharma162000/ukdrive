import React, { useState } from 'react';
import { Modal, Pressable, TextInput } from 'react-native';
import { View, Text, ScrollView } from 'dripsy';

export default function AddMoneyModal({ visible, onClose }: any) {
  const [amount, setAmount] = useState('');

  const suggestedAmounts = [100, 200, 500, 1000, 2000, 5000];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        sx={{
          flex: 1,
          bg: 'rgba(0,0,0,0.3)',
          justifyContent: 'flex-end',
        }}
      >
        <View
          sx={{
            bg: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            p: 16,
            maxHeight: '85%',
          }}
        >
          {/* Header */}
          <View sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text sx={{ fontSize: 20, fontWeight: '900' }}>
              Add Money to Wallet
            </Text>

            <Pressable onPress={onClose}>
              <Text sx={{ fontSize: 20 }}>✖</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View
              sx={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                mt: 16,
                justifyContent: 'space-between',
              }}
            >
              {suggestedAmounts.map(item => (
                <Pressable key={item} onPress={() => setAmount(String(item))}>
                  <View
                    sx={{
                      width: 110,
                      py: 10,
                      my: 4,
                      bg: '#f5f5f5',
                      borderRadius: 12,
                      alignItems: 'center',
                    }}
                  >
                    <Text sx={{ fontSize: 18, fontWeight: '700' }}>
                      ₹{item}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>

            <Text sx={{ mt: 14, fontWeight: '600' }}>
              Or Enter Custom Amount
            </Text>

            <View
              sx={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 12,
                mt: 8,
                p: 4,
              }}
            >
              <TextInput
                placeholder="Enter amount (₹10 - ₹50,000)"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                style={{ fontSize: 22, fontWeight: '900', color: '#188006ff' }}
              />
            </View>

            <Text sx={{ mt: 4, color: 'gray' }}>
              Minimum: ₹10, Maximum: ₹50,000
            </Text>

            <Pressable onPress={() => console.log('Pay: ', amount)}>
              <View
                sx={{
                  mt: 20,
                  py: 16,
                  bg: '#AECBFA',
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                <Text sx={{ fontSize: 18, fontWeight: '700' }}>
                  Pay with UPI
                </Text>
              </View>
            </Pressable>

            {/* Info Section */}
            <View sx={{ mt: 24, bg: '#f7f7ff', p: 16, borderRadius: 12 }}>
              <Text sx={{ fontSize: 18, fontWeight: '700', mb: 8 }}>
                In-App Payment:
              </Text>

              <Text>Payment opens inside the app (no browser redirect)</Text>
              <Text>UPI, Cards, Net Banking, Wallets supported</Text>
              <Text> Secure Razorpay checkout modal</Text>
              <Text>Instant verification & auto wallet update</Text>
            </View>

            {/* Payment Methods */}
            <View sx={{ mt: 24, bg: '#f7f7ff', p: 16, borderRadius: 12 }}>
              <Text sx={{ fontSize: 18, fontWeight: '700', mb: 8 }}>
                All Payment Methods Available:
              </Text>

              <Text> UPI (with QR code)</Text>
              <Text>Net Banking</Text>
              <Text> Debit/Credit Cards</Text>
              <Text> Wallets (Paytm, PhonePe, etc.)</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
