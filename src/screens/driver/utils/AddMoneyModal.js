import React, { useState } from 'react';
import { Modal, TextInput } from 'react-native';
import { View, Text, Pressable } from 'dripsy';

export default function AddMoneyModal({ visible, onClose, onProceed }) {
  const presetAmounts = [100, 500, 1000, 2000, 5000, 10000];
  const [amount, setAmount] = useState('');

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        sx={{
          flex: 1,
          bg: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          sx={{
            width: '90%',
            bg: 'white',
            borderRadius: 16,
            p: 20,
          }}
        >
          {/* Title */}
          <Text
            sx={{
              fontSize: 20,
              fontWeight: '600',
              textAlign: 'center',
              mb: 20,
            }}
          >
            Add Money to Wallet
          </Text>

          {/* Preset Amount Buttons */}
          <View
            sx={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}
          >
            {presetAmounts.map(item => (
              <Pressable
                key={item}
                onPress={() => setAmount(item.toString())}
                sx={{
                  width: '30%',
                  py: 12,
                  borderWidth: 1,
                  borderColor:
                    amount == item.toString() ? '#7f56d9' : '#dcdcdc',
                  borderRadius: 12,
                  alignItems: 'center',
                  mb: 12,
                  bg: amount == item.toString() ? '#efe6ff' : 'white',
                }}
              >
                <Text
                  sx={{
                    fontSize: 16,
                    color: amount == item.toString() ? '#7f56d9' : '#000',
                    fontWeight: amount == item.toString() ? '600' : '400',
                  }}
                >
                  ₹{item}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Custom Amount */}
          <Text sx={{ mt: 10, mb: 6, color: '#444' }}>Custom Amount</Text>

          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="Enter amount"
            style={{
              borderWidth: 1,
              borderColor: '#dcdcdc',
              borderRadius: 10,
              padding: 12,
              fontSize: 16,
            }}
          />

          <Text sx={{ mt: 5, fontSize: 13, color: '#777' }}>
            Minimum: ₹100, Maximum: ₹50,000
          </Text>

          {/* Buttons */}
          <View
            sx={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              mt: 20,
            }}
          >
            <Pressable
              onPress={() => onProceed(amount)}
              sx={{
                flex: 1,
                bg: '#d7c6ff',
                py: 14,
                borderRadius: 12,
                alignItems: 'center',
                mr: 8,
              }}
            >
              <Text sx={{ fontSize: 16, fontWeight: '600' }}>
                Proceed to Payment
              </Text>
            </Pressable>

            <Pressable
              onPress={onClose}
              sx={{
                width: 90,
                borderWidth: 1,
                borderColor: '#dcdcdc',
                py: 14,
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <Text sx={{ color: '#777', fontSize: 16 }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
