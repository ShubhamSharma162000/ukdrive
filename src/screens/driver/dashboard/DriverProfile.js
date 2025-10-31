import { ScrollView, TouchableOpacity } from 'react-native';
import { View, Text } from 'dripsy';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function DriverProfile({ navigation }) {
  const badgeColors = {
    approved: { bg: 'success', color: 'white' },
    rejected: { bg: 'danger', color: 'white' },
    pending: { bg: 'yellow', color: 'white' },
  };

  const verificationStatus = 'pending';
  const badgeLabel = 'approved';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff' }}
      contentContainerStyle={{ paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <LinearGradient
        colors={['#2563eb', '#7c3aed', '#4f46e5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ height: 420, width: '100%' }}
      >
        <View sx={{ alignItems: 'center', mt: 80 }}>
          <View
            sx={{
              width: 64,
              height: 64,
              bg: 'white',
              borderRadius: 16,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: 'black',
              shadowOpacity: 0.1,
              shadowRadius: 6,
            }}
          >
            <Text sx={{ fontSize: 28, fontWeight: 'bold', color: 'secondary' }}>
              S
            </Text>
          </View>
          <Text
            sx={{ fontSize: 20, fontWeight: 'bold', color: 'white', mt: 16 }}
          >
            Welcome Shubham
          </Text>
          <View
            sx={{
              bg: 'rgba(255,255,255,0.2)',
              px: 12,
              py: 4,
              borderRadius: 16,
              mt: 8,
            }}
          >
            <Text sx={{ color: 'white', fontSize: 14 }}>
              ID : ajfhvaflsdkjvr65465edfvervre564
            </Text>
          </View>
        </View>

        {/* STATS */}
        <View sx={{ flexDirection: 'row', justifyContent: 'center', mt: 56 }}>
          {[
            { label: 'Rating', value: '5.0' },
            { label: 'Rides', value: '25' },
            { label: 'car', icon: 'car' },
          ].map((item, idx) => (
            <BlurView
              key={idx}
              intensity={10}
              tint="light"
              style={{
                width: '30%',
                padding: 12,
                borderRadius: 16,
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
                marginLeft: 8,
                overflow: 'hidden',
              }}
            >
              {item.icon ? (
                <Icon
                  name={item.icon}
                  size={20}
                  color="white"
                  style={{ marginBottom: 4 }}
                />
              ) : (
                <Text
                  sx={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: 'white',
                    mb: 4,
                  }}
                >
                  {item.value}
                </Text>
              )}
              <Text sx={{ fontSize: 12, color: 'white', opacity: 0.8 }}>
                {item.label}
              </Text>
            </BlurView>
          ))}
        </View>

        <View sx={{ alignItems: 'center', mt: 12 }}>
          <BlurView
            intensity={10}
            tint="light"
            style={{
              borderRadius: 16,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderColor: 'rgba(255,255,255,0.1)',
              padding: 12,
              width: '93%',
              alignItems: 'center',
            }}
          >
            <Text sx={{ color: 'white', fontSize: 18, fontWeight: '500' }}>
              7865456783
            </Text>
          </BlurView>
        </View>
      </LinearGradient>

      {/* VEHICLE CARD */}
      <LinearGradient
        colors={['#f0f0ff', '#ffffff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          margin: 16,
          borderRadius: 16,
          borderLeftWidth: 4,
          borderLeftColor: '#7c3aed',
          padding: 12,
        }}
      >
        <View
          sx={{ flexDirection: 'row', justifyContent: 'space-between', mb: 12 }}
        >
          <Text sx={{ fontSize: 18, fontWeight: 'bold' }}>
            Vehicle Information
          </Text>
          <View
            sx={{
              px: 12,
              py: 4,
              borderRadius: 999,
              bg: badgeColors[verificationStatus]?.bg ?? 'yellow',
            }}
          >
            <Text sx={{ color: 'white', fontWeight: 'bold' }}>
              {badgeLabel}
            </Text>
          </View>
        </View>

        <View
          sx={{
            flexWrap: 'wrap',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          {[
            ['Type', 'CAR'],
            ['Model', '89079'],
            ['Registration', '87tt87t8'],
            ['Color', 'Red'],
          ].map(([label, value]) => (
            <View key={label} sx={{ width: '48%', mb: 12 }}>
              <Text sx={{ color: 'muted', fontSize: 14 }}>{label}</Text>
              <Text sx={{ fontSize: 16, fontWeight: '700', mt: 4 }}>
                {value}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          sx={{
            borderWidth: 1,
            borderColor: '#9ca3af',
            borderRadius: 8,
            py: 12,
            alignItems: 'center',
            mt: 4,
          }}
        >
          <Text sx={{ color: 'gray700', fontWeight: 'bold' }}>
            Edit Vehicle Details
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          sx={{
            mt: 8,
            py: 12,
            borderRadius: 8,
            alignItems: 'center',
            bg: verificationStatus !== 'approved' ? 'primary' : 'transparent',
            borderWidth: verificationStatus === 'approved' ? 1 : 0,
            borderColor:
              verificationStatus === 'approved' ? 'gray400' : 'transparent',
          }}
        >
          <Text sx={{ color: 'white', fontWeight: 'bold' }}>
            {verificationStatus === 'approved'
              ? 'Verification Complete'
              : 'Upload Documents Now'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* FOOTER BUTTONS */}
      <View sx={{ pb: 32, alignItems: 'center', gap: 12 }}>
        {[
          ['Contact Support', '#d1d5db'],
          ['Complete History', '#7c3aed'],
          ['Show Driver Status', '#22c55e'],
          ['Show Messages', '#22c55e'],
          ['Logout', '#dc2626'],
        ].map(([label, color], idx) => (
          <TouchableOpacity
            key={idx}
            sx={{
              width: 340,
              py: 12,
              borderWidth: 1,
              borderColor: color,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text sx={{ color, fontWeight: 'bold' }}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
