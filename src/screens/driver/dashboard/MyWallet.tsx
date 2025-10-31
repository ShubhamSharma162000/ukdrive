import React, { useEffect, useState } from 'react';
import { Modal, StatusBar } from 'react-native';
import { View, Text, ScrollView, Pressable } from 'dripsy';
import { Card, TextInput } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import RazorpayCheckout from 'react-native-razorpay'
import {
  getDriverTransactions,
  getRideInfo,
  getWalletData,
} from '../DriversQuery';

export const MyWallet = () => {
  const queryClient = useQueryClient();
  const [driverId, setDriverId] = useState('');
  const [activeTab, setActiveTab] = useState('Recent Transactions');
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRazorpayPayment, setShowRazorpayPayment] = useState(false);

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      amount: '',
      withdrawalMethod: '',
      upiId: '',
      accountHolderName: '',
      bankAccountNumber: '',
      ifscCode: '',
      bankName: '',
    },
  });

  const withdrawalMethod = watch('withdrawalMethod');

  useEffect(() => {
    const getDriverId = async () => {
      const id = 'dc2480ba-86ca-403b-8cc0-81469e992c93';
      setDriverId(id);
    };
    getDriverId();
  }, []);

  const { data: walletData } = useQuery({
    queryKey: ['walletData', driverId],
    queryFn: () => getWalletData(driverId),
    enabled: !!driverId,
  });

  const balance = walletData?.balance || 0;
  const Tabs = ['Recent Transactions', 'Analytics'];

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <SafeAreaProvider>
        {/* Header Card */}
        <View
          sx={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            px: 16,
            mt: 60,
            mx: 16,
            borderRadius: 20,
            bg: '#9e84efff',
          }}
        >
          <View sx={{ flex: 1, borderRadius: 16, p: 16, mr: 8 }}>
            <Text sx={{ fontSize: 20, fontWeight: 'bold' }}>
              Current Balance
            </Text>
            <Text sx={{ fontSize: 18, fontWeight: 'bold' }}>₹ {balance}</Text>

            <View
              sx={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                mt: 16,
              }}
            >
              <Pressable
                onPress={() => setShowRazorpayPayment(true)}
                sx={{
                  flex: 0.48,
                  bg: 'primary',
                  py: 12,
                  alignItems: 'center',
                  borderRadius: 12,
                }}
              >
                <Text sx={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                  Add Money
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setIsWithdrawOpen(true)}
                sx={{
                  flex: 0.48,
                  bg: 'danger',
                  py: 12,
                  alignItems: 'center',
                  borderRadius: 12,
                }}
              >
                <Text sx={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                  Withdraw
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View
          sx={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            mt: 24,
            mb: 40,
          }}
        >
          {Tabs.map(tab => {
            const isActive = activeTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                sx={{
                  flex: 1,
                  mx: 4,
                  py: 10,
                  borderRadius: 10,
                  alignItems: 'center',
                  bg: isActive ? 'indigo' : '#d1d5db',
                }}
              >
                <Text
                  sx={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: isActive ? 'white' : 'gray600',
                  }}
                >
                  {tab}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Modals */}
        <Modal visible={showRazorpayPayment} transparent animationType="fade">
          <View
            sx={{
              flex: 1,
              bg: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
              p: 16,
            }}
          >
            <View
              sx={{
                bg: 'white',
                borderRadius: 12,
                p: 20,
                width: '100%',
                maxWidth: 360,
              }}
            >
              <Text sx={{ fontSize: 18, fontWeight: 'bold', mb: 16 }}>
                Add Money to Driver Wallet
              </Text>
              <TextInput
                placeholder="Enter amount"
                keyboardType="numeric"
                value={rechargeAmount}
                onChangeText={val => setRechargeAmount(val)}
              />
              <Pressable
                disabled={!rechargeAmount || parseInt(rechargeAmount) < 10}
                sx={{
                  mt: 16,
                  bg:
                    !rechargeAmount || parseInt(rechargeAmount) < 10
                      ? '#a5b4fc'
                      : 'indigo',
                  borderRadius: 10,
                  py: 12,
                  alignItems: 'center',
                }}
              >
                <Text sx={{ color: 'white', fontWeight: 'bold' }}>
                  Pay with UPI/QR Code
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <Modal visible={isWithdrawOpen} transparent animationType="slide">
          <View
            sx={{
              flex: 1,
              bg: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
              p: 16,
            }}
          >
            <ScrollView
              sx={{
                bg: 'white',
                borderRadius: 12,
                p: 20,
                width: '100%',
                maxWidth: 380,
              }}
            >
              <Text sx={{ fontSize: 18, fontWeight: 'bold', mb: 12 }}>
                Withdraw Money
              </Text>

              <Controller
                control={control}
                name="amount"
                render={({
                  field,
                }: {
                  field: { value: string; onChange: (val: string) => void };
                }) => (
                  <TextInput
                    keyboardType="numeric"
                    placeholder="Enter amount"
                    value={field.value}
                    onChangeText={field.onChange}
                  />
                )}
              />

              <View
                sx={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  mt: 16,
                }}
              >
                <Pressable
                  sx={{
                    flex: 0.48,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: '#ccc',
                    py: 10,
                    alignItems: 'center',
                  }}
                  onPress={() => setIsWithdrawOpen(false)}
                >
                  <Text>Cancel</Text>
                </Pressable>

                <Pressable
                  sx={{
                    flex: 0.48,
                    bg: isSubmitting ? '#a3e635' : 'green',
                    borderRadius: 10,
                    py: 10,
                    alignItems: 'center',
                  }}
                  onPress={handleSubmit(() => {})}
                >
                  <Text sx={{ color: 'white' }}>
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </SafeAreaProvider>
    </>
  );
};
