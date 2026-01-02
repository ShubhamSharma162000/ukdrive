import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { View, Text, Pressable, TextInput, ActivityIndicator } from 'dripsy';
import {
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Wallet,
} from 'lucide-react-native';
import { useToast } from '../../../context/ToastContext';
import Api from '../../../api/Api';
import RazorpayCheckout from 'react-native-razorpay';
import { useAuth } from '../../../context/AuthContext';
import WithdrawalModal from '../utils/WithdrawalModal';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDriverTransactions, getWalletData } from '../DriversQuery';
import { DriverWebSocket } from '../../../websocket/websocket-manager';

interface PaymentPayload {
  amount: number;
  orderId: string;
}

interface WalletTransaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: string | number;
  description: string;
  category?: string;
  rideId?: string;
  paymentId?: string;
  status?: string;
  created_at: string;
}

const StatCard = ({ icon: Icon, color, bg, value, label }: any) => (
  <View
    sx={{
      flexBasis: '48%',
      backgroundColor: bg,
      borderRadius: 12,
      padding: 16,
      mb: 16,
    }}
  >
    <Icon width={22} height={22} color={color} />

    <Text
      sx={{
        fontSize: 18,
        fontWeight: 'bold',
        mt: 8,
        color: '#111',
      }}
    >
      {value}
    </Text>

    <Text
      sx={{
        fontSize: 13,
        color: '#555',
        mt: 4,
      }}
    >
      {label}
    </Text>
  </View>
);

const FilterButton = ({ label, active, onPress }: any) => (
  <Pressable
    onPress={onPress}
    style={{
      backgroundColor: active ? '#1E40AF' : '#E0E7FF',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      marginRight: 8,
    }}
  >
    <Text
      style={{
        color: active ? '#FFFFFF' : '#1E40AF',
        fontWeight: '600',
        fontSize: 14,
      }}
    >
      {label}
    </Text>
  </Pressable>
);

export default function DriverWallet() {
  const { id } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('Recent Transactions');
  const [activeFilter, setActiveFilter] = useState('All Time');
  const filters = ['Today', 'This Month', 'All Time'];
  const presetAmounts = [100, 500, 1000, 2000, 5000, 10000];
  const [amount, setAmount] = useState('');
  const [visible, setVisible] = useState(false);
  const { showToast } = useToast();
  const [amountError, setAmountError] = useState(false);
  const [paymentPayload, setPaymentPayload] = useState<PaymentPayload | null>(
    null,
  );
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const {
    data: walletData,
    isLoading,
    error: walletError,
    refetch: refetchWallet,
  } = useQuery({
    queryKey: ['/api/drivers', id, 'wallet', 'driver_wallet'],
    queryFn: () => getWalletData(id),
    refetchInterval: false,
    enabled: !!id,
    retry: false,
  });
  console.log(walletData);
  const {
    data: transactions = [],
    error: transactionsError,
    refetch: refetchTransactions,
  } = useQuery<WalletTransaction[]>({
    queryKey: ['/api/drivers', id, 'wallet', 'transactions'],
    queryFn: () => getDriverTransactions(id),
    refetchInterval: false,
    enabled: !!id,
    retry: false,
  });

  console.log(transactions);
  // REAL-TIME: WebSocket wallet update listener for drivers
  useEffect(() => {
    if (!id) return;
    console.log(
      '[DRIVER WALLET] Setting up real-time wallet update listener...',
    );
    // Connect to WebSocket
    DriverWebSocket.connect(id);

    // Listen for wallet balance updates
    const removeWalletListener = DriverWebSocket.onWalletUpdate(message => {
      console.log('💰 [DRIVER] Real-time wallet update received!', message);

      // // Show success notification
      // toast({
      //   title: "💰 Wallet Updated!",
      //   description: `₹${message.amount} added successfully. New balance: ₹${message.newBalance}`,
      //   duration: 5000,
      // });

      // Instantly refresh wallet data
      queryClient.invalidateQueries({
        queryKey: ['/api/drivers', id, 'wallet'],
      });
      queryClient.invalidateQueries({
        queryKey: ['/api/drivers', id, 'wallet', 'transactions'],
      });
      console.log(' [DRIVER] Wallet data refreshed automatically');
    });

    // Cleanup function
    return () => {
      console.log('🔄 [DRIVER WALLET] WebSocket cleanup');
      removeWalletListener();
    };
  }, [id, queryClient]);

  // Listen for WebSocket wallet updates via the existing WebSocket manager
  useEffect(() => {
    if (id && showWithdrawModal) {
      console.log(
        '🔄 [DRIVER WALLET] Setting up real-time wallet update listener...',
      );

      // Listen for wallet_balance_update messages using the imported DriverWebSocket
      const cleanup = DriverWebSocket.onWalletUpdate((data: any) => {
        console.log('💰 [WALLET PAGE] Received real-time wallet update:', data);
        if (data.driverId === id) {
          console.log('📊 [WALLET PAGE] Processing wallet balance update...');

          // Force refresh wallet data immediately
          queryClient.invalidateQueries({
            queryKey: ['/api/drivers', id, 'wallet'],
          });
          queryClient.invalidateQueries({
            queryKey: ['/api/drivers', id, 'wallet', 'transactions'],
          });

          // Auto-close payment dialog and show success
          console.log(
            '🎉 [WALLET PAGE] Auto-closing payment dialog after successful payment',
          );
          setShowWithdrawModal(false);
          setAmount('');
          // toast({
          //   title: "Payment Successful!",
          //   description: `₹${data.amount} added to your wallet successfully`,
          // });
        }
      });

      return () => {
        console.log('🧹 [DRIVER WALLET] Cleaning up wallet update listener');
        cleanup?.();
      };
    }
  }, [id, showWithdrawModal, queryClient]);

  const onProceedPayment = async (amount: any) => {
    try {
      const numAmount = Number(amount);
      console.log('i am here at onproceed payment ', numAmount);
      if (!numAmount || numAmount < 100) {
        setAmountError(true);
        showToast(
          'Minimum Amount Required . You must add at least ₹100 to proceed.',
          'error',
        );
        return;
      }

      if (amount > 50000) {
        setAmountError(true);
        showToast('Maximum amount per transaction is ₹50,000', 'error');
        return;
      }
      try {
        setPaymentLoading(true);
        const res = await Api.post('/payment/driver-wallet/create-order', {
          amount,
        });
        console.log(res?.data);
        if (res.data.success) {
          setPaymentPayload({
            amount: amount,
            orderId: res.data.id,
          });
          const pay = () => {
            const options = {
              description: 'Add Money to Wallet',
              key: 'rzp_live_R7Hfkqef2YC7Ca',
              amount: numAmount * 100,
              currency: res.data.order.currency,
              order_id: res.data.order.id,
              name: 'UKDrive',
              prefill: {
                email: 'support@ukdrive.in',
                contact: '9876543210',
                name: 'UKDrive',
              },
              notes: {
                userId: id,
                userType: 'driver',
              },
              theme: { color: '#760496ff' },
            };

            RazorpayCheckout.open(options)
              .then(async (data: any) => {
                console.log('Payment success:', data);
                const res = await Api.post(
                  '/payment/driver-wallet/payment-success',
                  {
                    razorpay_order_id: data?.razorpay_order_id,
                    razorpay_payment_id: data?.razorpay_payment_id,
                    razorpay_signature: data?.razorpay_signature,
                  },
                );
                console.log(res);
              })
              .catch((error: any) => {
                console.log('Payment failed:', error);
              })
              .finally(() => setPaymentLoading(false));
          };
          pay();
        }
      } catch (error) {
        setPaymentLoading(false);
      }
    } catch (error) {
      setPaymentLoading(false);
    }
  };

  return (
    <>
      <View
        style={{
          backgroundColor: '#d3d2d4ff',
          paddingTop: 40,
          paddingLeft: 20,
        }}
      >
        <Text sx={{ fontSize: 18, fontWeight: 'bold' }}>My Wallet</Text>
        <Text sx={{ color: '#666', mb: 16, fontSize: 14 }}>
          Manage your earnings and transactions
        </Text>
      </View>
      <ScrollView style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
        <View
          sx={{
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#eee',
            backgroundColor: '#fafafa',
            p: 16,
            mb: 20,
          }}
        >
          <View
            sx={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 16,
            }}
          >
            <View>
              <Text sx={{ color: '#666', fontSize: 14 }}>Current Balance</Text>
              <Text sx={{ fontSize: 28, fontWeight: 'bold', color: '#1F8B4C' }}>
                {walletData?.data?.balance}
              </Text>
            </View>
            <View
              sx={{
                backgroundColor: '#E6F8EB',
                borderRadius: 999,
                p: 10,
              }}
            >
              <Wallet color="#0fd536ff" size={32} strokeWidth={2.2} />
            </View>
          </View>

          <View sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Pressable
              onPress={() => setVisible(true)}
              sx={{
                flex: 1,
                borderWidth: 1,
                borderColor: '#3b0462ff',
                borderRadius: 12,
                alignItems: 'center',
                py: 10,
                mr: 6,
              }}
            >
              <Text sx={{ color: '#3d0575ff', fontWeight: 'bold' }}>
                + Add Money
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setShowWithdrawModal(true)}
              sx={{
                flex: 1,
                borderWidth: 1,
                borderColor: '#3b0462ff',
                borderRadius: 12,
                alignItems: 'center',
                py: 10,
                ml: 6,
              }}
            >
              <Text sx={{ color: '#8B4BCC', fontWeight: 'bold' }}>
                ← Withdraw
              </Text>
            </Pressable>
          </View>
        </View>

        <View
          sx={{
            flexDirection: 'row',
            backgroundColor: '#7f29b4ff',
            borderRadius: 12,
            overflow: 'hidden',
            mb: 20,
          }}
        >
          {['Recent Transactions', 'Analytics'].map(tab => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              sx={{
                flex: 1,
                py: 10,
                alignItems: 'center',
                backgroundColor: activeTab === tab ? '#C7A2E2' : '#eceaeeff',
              }}
            >
              <Text
                sx={{
                  color: activeTab === tab ? '#fff' : '#000',
                  fontWeight: 'bold',
                }}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        {activeTab === 'Recent Transactions' && (
          <View>
            {transactions.map(tx => (
              <View
                key={tx.id}
                sx={{
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: '#eee',
                  backgroundColor: '#fff',
                  p: 16,
                  mb: 12,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View sx={{ flex: 1 }}>
                  <Text sx={{ fontWeight: 'bold' }}>{tx.id}</Text>
                  <Text sx={{ color: '#666', mt: 2, fontSize: 13 }}>
                    {tx.description}
                  </Text>
                  <Text sx={{ color: '#999', mt: 2, fontSize: 13 }}>
                    {new Date(tx.created_at).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>

                <View sx={{ alignItems: 'flex-end' }}>
                  <Text
                    sx={{
                      color: tx.type === 'credit' ? '#47eb7dff' : '#cf3030ff',
                      fontWeight: 'bold',
                      mb: 4,
                    }}
                  >
                    {tx.amount}
                  </Text>
                  <View
                    sx={{
                      backgroundColor:
                        tx.type === 'credit' ? '#47eb7dff' : '#cf3030ff',
                      borderRadius: 8,
                      px: 8,
                      py: 4,
                    }}
                  >
                    <Text
                      sx={{
                        color: '#fbfbfcff',
                        fontWeight: 'bold',
                        fontSize: 12,
                      }}
                    >
                      {tx.type}
                    </Text>
                  </View>
                </View>
              </View>
            ))}

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
                            color:
                              amount == item.toString() ? '#7f56d9' : '#000',
                            fontWeight:
                              amount == item.toString() ? '600' : '400',
                          }}
                        >
                          ₹{item}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <Text sx={{ mt: 10, mb: 6, color: '#444' }}>
                    Custom Amount
                  </Text>

                  <TextInput
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    placeholder="Enter amount"
                    style={{
                      borderColor: amountError ? 'red' : '#dcdcdc',
                      borderWidth: 1,
                      borderRadius: 10,
                      padding: 12,
                      fontSize: 16,
                    }}
                  />

                  <Text sx={{ mt: 5, fontSize: 13, color: '#777' }}>
                    Minimum: ₹100, Maximum: ₹50,000
                  </Text>

                  <View
                    sx={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      mt: 20,
                    }}
                  >
                    <Pressable
                      onPress={() => onProceedPayment(amount)}
                      sx={{
                        flex: 1,
                        bg: '#6b3fd1ff',
                        py: 14,
                        borderRadius: 12,
                        alignItems: 'center',
                        mr: 8,
                        opacity: paymentLoading ? 0.6 : 1,
                      }}
                      disabled={paymentLoading}
                    >
                      {paymentLoading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text
                          sx={{
                            color: 'white',
                            fontSize: 16,
                            fontWeight: '600',
                          }}
                        >
                          Proceed to Payment
                        </Text>
                      )}
                    </Pressable>

                    <Pressable
                      onPress={() => setVisible(false)}
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
            {showWithdrawModal && (
              <WithdrawalModal
                visible={showWithdrawModal}
                onClose={() => setShowWithdrawModal(false)}
                balance={100}
                id={id}
              />
            )}
          </View>
        )}

        {activeTab === 'Analytics' && (
          <>
            <View
              sx={{
                flexDirection: 'row',
                gap: 10,
                mb: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {filters.map(f => (
                <FilterButton
                  key={f}
                  label={f}
                  active={activeFilter === f}
                  onPress={() => setActiveFilter(f)}
                />
              ))}
            </View>
            <View
              sx={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
              }}
            >
              <StatCard
                icon={ArrowUpRight}
                color="#1E9C56"
                bg="#E6F8EB"
                value={walletData?.data?.balance}
                label="Total Income"
              />
              <StatCard
                icon={Clock}
                color="#1E40AF"
                bg="#E8F1FE"
                value={transactions?.length}
                label="Total Transactions"
              />
              <StatCard
                icon={ArrowDownRight}
                color="#D32F2F"
                bg="#FDECEC"
                value={walletData?.data?.totalExpenses}
                label="Total Expenses"
              />
              <StatCard
                icon={Wallet}
                color="#0F6B32"
                bg="#EAF9EF"
                value={walletData?.data?.totalEarnings}
                label="Net Earnings"
              />
            </View>
          </>
        )}
      </ScrollView>
    </>
  );
}
