import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Text, View } from 'dripsy';

const MyEarning = () => {
  const [activeTab, setActiveTab] = useState<'Today' | 'Weekly' | 'Monthly'>(
    'Today',
  );
  const [activeRideTab, setActiveRideTab] = useState<
    'All' | 'Completed' | 'Pending' | 'Cancelled'
  >('All');

  const durationTabs = ['Today', 'Weekly', 'Monthly'];
  const rideTabs = ['All', 'Completed', 'Pending', 'Cancelled'];

  return (
    <View sx={{ flex: 1, bg: 'white', pt: 14 }}>
      <View
        sx={{ flexDirection: 'row', justifyContent: 'space-around', px: 2 }}
      >
        {durationTabs.map(tab => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab as any)}
            >
              <View
                sx={{
                  flex: 1,
                  alignItems: 'center',
                  py: 3,
                  mx: 1,
                  borderRadius: 12,
                  bg: isActive ? 'primary' : 'gray100',
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
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View
        sx={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          px: 4,
          mt: 6,
        }}
      >
        <View sx={{ flex: 1, bg: 'indigo100', borderRadius: 16, p: 4, mr: 2 }}>
          <Text sx={{ color: 'gray600', fontSize: 14, fontWeight: '500' }}>
            Total Trips
          </Text>
          <Text
            sx={{ fontSize: 24, fontWeight: '600', color: 'indigo700', mt: 2 }}
          >
            ₹ 0
          </Text>
        </View>

        <View sx={{ flex: 1, bg: 'indigo100', borderRadius: 16, p: 4, ml: 2 }}>
          <Text sx={{ color: 'gray600', fontSize: 14, fontWeight: '500' }}>
            Total Earning
          </Text>
          <Text
            sx={{ fontSize: 24, fontWeight: '600', color: 'indigo700', mt: 2 }}
          >
            ₹ 0
          </Text>
        </View>
      </View>

      <View
        sx={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          px: 2,
          mt: 6,
        }}
      >
        {rideTabs.map(tab => {
          const isActive = activeRideTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveRideTab(tab as any)}
            >
              <View
                sx={{
                  flex: 1,
                  alignItems: 'center',
                  py: 2,
                  mx: 1,
                  borderRadius: 12,
                  bg: isActive ? 'primary' : 'gray100',
                }}
              >
                <Text
                  sx={{
                    fontSize: 15,
                    fontWeight: '500',
                    color: isActive ? 'white' : 'gray600',
                  }}
                >
                  {tab}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View sx={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text sx={{ fontSize: 18, fontWeight: '600' }}>No Trip Found</Text>
      </View>
    </View>
  );
};

export default MyEarning;
