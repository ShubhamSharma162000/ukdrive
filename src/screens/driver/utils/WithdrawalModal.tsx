import React, { useState } from 'react';
import { Modal } from 'react-native';
import { View, Text, Pressable, TextInput } from 'dripsy';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useToast } from '../../../context/ToastContext';
import Api from '../../../api/Api';
import { getWalletData } from '../DriversQuery';

type Props = {
  visible: boolean;
  onClose: () => void;
  balance: number;
  id: string;
};

const withdrawalSchema = z
  .object({
    amount: z.string().min(1, 'Amount is required'),
    withdrawalMethod: z.enum(['upi', 'bank_account'], {
      error: 'Please select a withdrawal method',
    }),
    upiId: z.string().optional(),
    bankAccountNumber: z.string().optional(),
    ifscCode: z.string().optional(),
    bankName: z.string().optional(),
    accountHolderName: z.string().optional(),
  })
  .refine(
    data => {
      if (data.withdrawalMethod === 'upi') {
        return data.upiId && data.upiId.length > 0;
      }
      if (data.withdrawalMethod === 'bank_account') {
        return (
          data.bankAccountNumber &&
          data.ifscCode &&
          data.bankName &&
          data.accountHolderName
        );
      }
      return true;
    },
    {
      message:
        'Please fill all required fields for the selected withdrawal method',
      path: ['withdrawalMethod'],
    },
  );

export default function WithdrawalModal({
  visible,
  onClose,
  balance,
  id,
}: Props) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [method, setMethod] = useState<'upi' | 'bank_account'>('upi');
  const [openSelect, setOpenSelect] = useState(false);
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [bank, setBank] = useState({
    name: '',
    account: '',
    ifsc: '',
    bankName: '',
  });

  const createWithdrawalMutation = useMutation({
    mutationFn: async (data: z.infer<typeof withdrawalSchema>) => {
      console.log('inside mutation function ');
      console.log(data);
      const response = await Api.post(
        `/payment/driver/withdrawal-request/${id}`,
        data,
      );
      console.log(response);
      return response.data;
    },
    onSuccess: () => {
      showToast(
        'Withdrawal Request Submitted! Your withdrawal request will be processed within 24-48 hours.',
        'success',
      );
      queryClient.invalidateQueries({
        queryKey: ['/api/drivers', id, 'withdrawals'],
      });
      onClose();
    },
    onError: (error: any) => {
      showToast(`Withdrawal Request Failed: ${error.message}`, 'error');
    },
  });

  const onPressSubmit = () => {
    try {
      const parsed = withdrawalSchema.parse({
        amount,
        withdrawalMethod: method,
        upiId,
        bankAccountNumber: bank.account,
        ifscCode: bank.ifsc,
        bankName: bank.bankName,
        accountHolderName: bank.name,
      });

      createWithdrawalMutation.mutate(parsed);
    } catch (err) {
      if (err instanceof z.ZodError) {
        showToast(err.issues[0].message, 'error');
      }
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        sx={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <View
          sx={{
            bg: 'white',
            padding: 20,
            borderRadius: 12,
          }}
        >
          <View sx={{ alignItems: 'center' }}>
            <Text sx={{ fontSize: 22, fontWeight: 'bold', mb: 15 }}>
              Withdraw Money
            </Text>
          </View>

          <Text sx={{ mb: 6 }}>Withdrawal Amount</Text>
          <TextInput
            placeholder="Enter amount (₹)"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            sx={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              padding: 12,
              mb: 6,
            }}
          />

          <Text sx={{ color: 'gray', mb: 10 }}>
            Available balance: ₹{balance}
          </Text>

          <Text sx={{ mb: 6 }}>Withdrawal Method</Text>

          <Pressable
            onPress={() => setOpenSelect(!openSelect)}
            sx={{
              borderWidth: 1,
              borderColor: '#8B4BCC',
              borderRadius: 8,
              padding: 12,
              mb: 10,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text sx={{ fontSize: 16 }}>
              {method === 'upi' ? 'UPI Payment' : 'Bank Account Transfer'}
            </Text>
            <Text sx={{ fontSize: 18 }}>⌄</Text>
          </Pressable>

          {openSelect && (
            <View
              sx={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 8,
                overflow: 'hidden',
                mb: 10,
              }}
            >
              <Pressable
                onPress={() => {
                  setMethod('upi');
                  setOpenSelect(false);
                }}
                sx={{
                  padding: 14,
                  bg: method === 'upi' ? '#F3E6FF' : 'white',
                }}
              >
                <Text sx={{ fontSize: 16 }}>UPI Payment</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setMethod('bank_account');
                  setOpenSelect(false);
                }}
                sx={{
                  padding: 14,
                  bg: method === 'bank_account' ? '#F3E6FF' : 'white',
                  borderTopWidth: 1,
                  borderColor: '#eee',
                }}
              >
                <Text sx={{ fontSize: 16 }}>Bank Account Transfer</Text>
              </Pressable>
            </View>
          )}

          {method === 'upi' && (
            <View sx={{ mt: 20 }}>
              <Text sx={{ mb: 6 }}>UPI ID</Text>
              <TextInput
                placeholder="yourname@upi / phonepe / gpay"
                value={upiId}
                onChangeText={setUpiId}
                sx={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 8,
                  padding: 12,
                  mb: 15,
                }}
              />
            </View>
          )}

          {method === 'bank_account' && (
            <View sx={{ mt: 20 }}>
              <Text sx={{ mb: 4 }}>Account Holder Name</Text>
              <TextInput
                placeholder="As per bank records"
                value={bank.name}
                onChangeText={t => setBank({ ...bank, name: t })}
                sx={input}
              />

              <Text sx={{ mb: 4 }}>Account Number</Text>
              <TextInput
                placeholder="Bank account number"
                keyboardType="numeric"
                value={bank.account}
                onChangeText={t => setBank({ ...bank, account: t })}
                sx={input}
              />

              <Text sx={{ mb: 4 }}>IFSC Code</Text>
              <TextInput
                placeholder="IFSC0001234"
                value={bank.ifsc}
                onChangeText={t => setBank({ ...bank, ifsc: t })}
                sx={input}
              />

              <Text sx={{ mb: 4 }}>Bank Name</Text>
              <TextInput
                placeholder="Bank Name"
                value={bank.bankName}
                onChangeText={t => setBank({ ...bank, bankName: t })}
                sx={input}
              />
            </View>
          )}

          <View sx={{ flexDirection: 'row', mt: 20 }}>
            <Pressable
              onPress={onClose}
              sx={{
                flex: 1,
                padding: 14,
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 10,
                mr: 10,
                alignItems: 'center',
              }}
            >
              <Text>Cancel</Text>
            </Pressable>

            <Pressable
              onPress={onPressSubmit}
              sx={{
                flex: 1,
                padding: 14,
                bg: '#8f0ee5ff',
                borderRadius: 10,
                alignItems: 'center',
              }}
            >
              <Text sx={{ color: 'white', fontWeight: 'bold' }}>Submit</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const input = {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  padding: 12,
  mb: 15,
};
