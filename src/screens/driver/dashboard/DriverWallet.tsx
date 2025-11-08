import React, { useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { View, Text, Pressable } from 'dripsy';
import {
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Wallet,
} from 'lucide-react-native';

const StatCard = ({ icon: Icon, color, bg, label, value }: any) => (
  <View
    sx={{
      flex: 1,
      bg,
      borderRadius: 'lg',
      p: 16,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 6,
      elevation: 4,
      m: 6,
      minWidth: '45%',
    }}
  >
    <Icon color={color} size={26} strokeWidth={2.2} />
    <Text sx={{ fontSize: 22, fontWeight: 'bold', color, mt: 6 }}>{value}</Text>
    <Text sx={{ color: 'gray', fontSize: 14 }}>{label}</Text>
  </View>
);

const FilterButton = ({ label, active, onPress }: any) => (
  <TouchableOpacity onPress={onPress}>
    <View
      sx={{
        bg: active ? 'primary' : 'white',
        borderWidth: 1,
        borderColor: active ? 'primary' : '#d1d5db',
        px: 12,
        py: 8,
        borderRadius: 'md',
        minWidth: 100,
        alignItems: 'center',
      }}
    >
      <Text
        sx={{
          color: active ? 'white' : 'black',
          fontWeight: 'bold',
          fontSize: 14,
        }}
      >
        {label}
      </Text>
    </View>
  </TouchableOpacity>
);

export default function DriverWallet() {
  const [activeTab, setActiveTab] = useState('Recent Transactions');
  const [activeFilter, setActiveFilter] = useState('All Time');

  const filters = ['Today', 'This Month', 'All Time'];

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
      id: '#83a1f87c',
      desc: 'Platform fee (15%) for cash ride #6b472f61',
      date: 'Nov 05, 2025 • 01:20',
      amount: '-₹4.35',
      status: 'completed',
    },
    {
      id: '#83a1f87c',
      desc: 'Platform fee (15%) for cash ride #6b472f61',
      date: 'Nov 05, 2025 • 01:20',
      amount: '-₹4.35',
      status: 'completed',
    },
    {
      id: '#83a1f87c',
      desc: 'Platform fee (15%) for cash ride #6b472f61',
      date: 'Nov 05, 2025 • 01:20',
      amount: '-₹4.35',
      status: 'completed',
    },
    {
      id: '#83a1f87c',
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
