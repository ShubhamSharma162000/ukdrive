import React, { useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { View, Text, Image } from 'dripsy';
import { Wallet, ArrowDownLeft, ArrowUpRight, Plus } from 'lucide-react-native';

export default function PassengerWallet() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'analytics'>(
    'transactions',
  );

  const transactions = [
    {
      id: '#1bc12955',
      desc: 'bbbbbbbbbbbbb',
      date: '04 Nov 2025 at 12:59 PM',
      amount: '-₹600.00',
      type: 'debit',
      status: 'completed',
    },
    {
      id: '#f5d5a04f',
      desc: 'bbbb',
      date: '04 Nov 2025 at 12:58 PM',
      amount: '+₹500.00',
      type: 'credit',
      status: 'completed',
    },
    {
      id: '#3f9e0f9b',
      desc: 'Wallet topup digitally (pay_RZiFf22LD0VLUE)',
      date: '30 Oct 2025 at 07:41 AM',
      amount: '+₹10.00',
      type: 'credit',
      status: 'completed',
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff' }}
      contentContainerStyle={{}}
    >
      <View
        style={{
          backgroundColor: '#f66a0cff',
          paddingTop: 40,
          paddingLeft: 20,
        }}
      >
        <Text sx={{ color: '#ffffff', fontSize: 28, fontWeight: '700', mb: 1 }}>
          My Wallet
        </Text>
        <Text sx={{ color: '#ffffff', mb: 20 }}>
          Manage your earnings and transactions
        </Text>
      </View>

      <View
        sx={{
          borderWidth: 1,
          borderColor: '#e6e6e6',
          borderRadius: 16,
          p: 20,
          m: 20,
          backgroundColor: '#fff',
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <View
          sx={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View>
            <Text sx={{ color: '#777' }}>Current Balance</Text>
            <Text
              sx={{ color: '#3BAE53', fontSize: 28, fontWeight: '700', mt: 4 }}
            >
              ₹38.00
            </Text>
          </View>
          <View
            sx={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: 'rgba(0, 200, 83, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Wallet color="#3BAE53" size={24} />
          </View>
        </View>

        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: '#b88cff',
            borderRadius: 10,
            paddingVertical: 10,
            marginTop: 16,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Plus color="#b88cff" size={18} />
          <Text style={{ color: '#b88cff', fontWeight: '600', marginLeft: 8 }}>
            Add Money
          </Text>
        </TouchableOpacity>
      </View>

      <View
        sx={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          mb: 20,
          backgroundColor: '#f5f5f5',
          borderRadius: 10,
          p: 4,
        }}
      >
        <TouchableOpacity
          onPress={() => setActiveTab('transactions')}
          style={{
            flex: 1,
            backgroundColor:
              activeTab === 'transactions' ? '#fff' : 'transparent',
            borderRadius: 8,
            alignItems: 'center',
            paddingVertical: 10,
          }}
        >
          <Text
            style={{
              color: activeTab === 'transactions' ? '#000' : '#777',
              fontWeight: activeTab === 'transactions' ? '700' : '500',
            }}
          >
            Transactions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('analytics')}
          style={{
            flex: 1,
            backgroundColor: activeTab === 'analytics' ? '#fff' : 'transparent',
            borderRadius: 8,
            alignItems: 'center',
            paddingVertical: 10,
          }}
        >
          <Text
            style={{
              color: activeTab === 'analytics' ? '#000' : '#777',
              fontWeight: activeTab === 'analytics' ? '700' : '500',
            }}
          >
            Analytics
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'transactions' ? (
        transactions.map((t, i) => (
          <View
            key={i}
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#eee',
              borderRadius: 14,
              p: 14,
              mb: 12,
              backgroundColor: '#fff',
            }}
          >
            <View
              sx={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor:
                  t.type === 'credit'
                    ? 'rgba(0, 200, 83, 0.1)'
                    : 'rgba(234, 34, 34, 0.1)',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 10,
              }}
            >
              {t.type === 'credit' ? (
                <ArrowUpRight color="#3BAE53" size={18} />
              ) : (
                <ArrowDownLeft color="#EA2222" size={18} />
              )}
            </View>

            <View sx={{ flex: 1 }}>
              <Text sx={{ fontWeight: '700', fontSize: 15 }}>{t.id}</Text>
              <Text sx={{ color: '#333', mt: 1, fontSize: 14 }}>{t.desc}</Text>
              <Text sx={{ color: '#777', mt: 2, fontSize: 12 }}>{t.date}</Text>
            </View>

            <View sx={{ alignItems: 'flex-end' }}>
              <Text
                sx={{
                  color: t.type === 'credit' ? '#3BAE53' : '#EA2222',
                  fontWeight: '700',
                  fontSize: 15,
                  mb: 1,
                }}
              >
                {t.amount}
              </Text>
              <View
                sx={{
                  backgroundColor: '#3D8BFF',
                  borderRadius: 6,
                  px: 8,
                  py: 3,
                }}
              >
                <Text sx={{ color: '#fff', fontSize: 11 }}>{t.status}</Text>
              </View>
            </View>
          </View>
        ))
      ) : (
        <View
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
            py: 80,
          }}
        >
          <Text sx={{ color: '#666' }}>Analytics Coming Soon 🚀</Text>
        </View>
      )}
    </ScrollView>
  );
}
