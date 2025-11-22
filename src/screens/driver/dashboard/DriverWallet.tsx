import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { View, Text, Pressable, TextInput } from 'dripsy';
import {
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Wallet,
} from 'lucide-react-native';
import { useToast } from '../../../context/ToastContext';
import RazorpayCheckout from '../utils/RazorpayCheckout';
import Api from '../../../api/Api';

export default function DriverWallet() {
  const [activeTab, setActiveTab] = useState('Recent Transactions');
  const [activeFilter, setActiveFilter] = useState('All Time');
  const filters = ['Today', 'This Month', 'All Time'];
  const presetAmounts = [100, 500, 1000, 2000, 5000, 10000];
  const [amount, setAmount] = useState('');
  const [visible, setVisible] = useState(false);
  const { showToast } = useToast();
  const [amountError, setAmountError] = useState(false);
  const [openRazorpay, setOpenRazorpay] = useState(false);

  const onProceedPayment = async (amount: any) => {
    try {
      const numAmount = Number(amount);

      if (!numAmount || numAmount < 100) {
        setAmountError(true);
        showToast(
          'Minimum Amount Required . You must add at least ₹100 to proceed.',
          'error',
        );
        return;
      }
      // setAmountError(false);
      // setOpenRazorpay(true);
      try {
        const res = await Api.post(`/payment/driver-wallet/create-order`, {
          params: { amount },
        });
        console.log(res?.data);
      } catch (error) {}
    } catch (error) {}
  };

  const transactions = [
    {
      id: '#e81f8590',
      desc: 'Platform fee (15%) for cash ride #db64ab6b',
      date: 'Nov 05, 2025 • 21:55',
      amount: '-₹4.35',
      status: 'completed',
    },
    {
      id: '#ca2477ea',
      desc: 'Platform fee (15%) for cash ride #4c473c84',
      date: 'Nov 05, 2025 • 20:25',
      amount: '-₹4.35',
      status: 'completed',
    },
    {
      id: '#af561de6',
      desc: 'Platform fee (15%) for cash ride #56462f26',
      date: 'Nov 05, 2025 • 03:41',
      amount: '-₹8.10',
      status: 'completed',
    },
    {
      id: '#83a1f87cdd',
      desc: 'Platform fee (15%) for cash ride #6b472f61',
      date: 'Nov 05, 2025 • 01:20',
      amount: '-₹4.35',
      status: 'completed',
    },
    {
      id: '#83a1f87ddc',
      desc: 'Platform fee (15%) for cash ride #6b472f61',
      date: 'Nov 05, 2025 • 01:20',
      amount: '-₹4.35',
      status: 'completed',
    },
    {
      id: 'dd',
      desc: 'Platform fee (15%) for cash ride #6b472f61',
      date: 'Nov 05, 2025 • 01:20',
      amount: '-₹4.35',
      status: 'completed',
    },
    {
      id: '#83a1ssf87c',
      desc: 'Platform fee (15%) for cash ride #6b472f61',
      date: 'Nov 05, 2025 • 01:20',
      amount: '-₹4.35',
      status: 'completed',
    },
  ];

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
                ₹54.80
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
                borderColor: '#C7A2E2',
                borderRadius: 12,
                alignItems: 'center',
                py: 10,
                mr: 6,
              }}
            >
              <Text sx={{ color: '#8B4BCC', fontWeight: 'bold' }}>
                + Add Money
              </Text>
            </Pressable>

            <Pressable
              sx={{
                flex: 1,
                borderWidth: 1,
                borderColor: '#C7A2E2',
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
            backgroundColor: '#E7D4F3',
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
                    {tx.desc}
                  </Text>
                  <Text sx={{ color: '#999', mt: 2, fontSize: 13 }}>
                    {tx.date}
                  </Text>
                </View>

                <View sx={{ alignItems: 'flex-end' }}>
                  <Text sx={{ color: '#D32F2F', fontWeight: 'bold', mb: 4 }}>
                    {tx.amount}
                  </Text>
                  <View
                    sx={{
                      backgroundColor: '#E0E8FF',
                      borderRadius: 8,
                      px: 8,
                      py: 4,
                    }}
                  >
                    <Text
                      sx={{
                        color: '#1E40AF',
                        fontWeight: 'bold',
                        fontSize: 12,
                      }}
                    >
                      {tx.status}
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

                  {/* Custom Amount */}
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
                      onPress={() => {
                        setVisible(false);
                      }}
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
            {openRazorpay && (
              <RazorpayCheckout
                amount={10}
                onSuccess={(data: any) => {
                  console.log('Payment Success:', data);
                  setOpenRazorpay(false);
                }}
                onCancel={() => {
                  console.log('Payment Cancelled');
                  setOpenRazorpay(false);
                }}
              />
            )}
          </View>
        )}

        {/* {activeTab === 'Analytics' && (
          <>
            <View
              sx={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                mb: 20,
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
                color="#D32F2F"
                bg="#E6F8EB"
                value="₹2204.15"
                label="Total Income"
              />
              <StatCard
                icon={Clock}
                color="#D32F2F"
                bg="#E8F1FE"
                value="68"
                label="Total Transactions"
              />
              <StatCard
                icon={ArrowDownRight}
                color="#D32F2F"
                bg="#FDECEC"
                value="₹2149.35"
                label="Total Expenses"
              />
              <StatCard
                icon={Wallet}
                color="#D32F2F"
                bg="#EAF9EF"
                value="₹54.80"
                label="Net Earnings"
              />
            </View>
          </>
        )}
    */}
      </ScrollView>
    </>
  );
}
