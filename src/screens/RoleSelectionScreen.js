import React from 'react';
import { StatusBar, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Image } from 'dripsy';
import { useDripsyTheme } from 'dripsy';

export const RoleSelectionScreen = ({ navigation }) => {
  const { theme } = useDripsyTheme();

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <View sx={{ flex: 1, backgroundColor: 'background' }}>
        <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
          {/* Orange Circle Background */}
          <View
            sx={{
              position: 'absolute',
              top: -140,
              left: -160,
              width: 300,
              height: 300,
              borderRadius: 200,
              borderWidth: 2,
              borderColor: 'rgba(241,100,6,0.92)',
              transform: [{ scaleX: 1.4 }],
              zIndex: 1,
            }}
          />

          {/* Logo */}
          <View sx={{ position: 'absolute', top: 35, left: 35, zIndex: 10 }}>
            <Image
              source={require('../assets/logo/UKDriveLogo.png')}
              resizeMode="contain"
              sx={{
                width: 80,
                height: 80,
              }}
            />
          </View>

          {/* Center Image */}
          <View
            sx={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              px: 3,
            }}
          >
            <Image
              source={require('../assets/images/RoleSelection.png')}
              resizeMode="contain"
              sx={{
                width: ['70%', '55%', '40%'], // responsive width
                height: ['30%', '35%', '40%'], // responsive height
              }}
            />
          </View>

          {/* Title */}
          <View sx={{ alignItems: 'center', mb: 3 }}>
            <Text
              sx={{
                color: 'passengerTheme',
                fontSize: RFValue(22),
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              Register now as
            </Text>
          </View>

          {/* Buttons */}
          <View sx={{ alignItems: 'center', pb: 120, gap: 16 }}>
            {/* Passenger Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('ClientLogIn')}
              style={{
                backgroundColor: 'white',
                borderColor: 'orange',
                borderWidth: 2,
                borderRadius: 25,
                paddingVertical: 14,
                alignItems: 'center',
                justifyContent: 'center',
                width: '90%',
                shadowColor: '#181a64ff',
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Text
                sx={{
                  color: 'driver',
                  fontSize: 22,
                  fontWeight: 'bold',
                }}
              >
                I’m a Passenger
              </Text>
            </TouchableOpacity>

            {/* Driver Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('DriverLogIn')}
              style={{
                backgroundColor: 'white',
                borderColor: 'orange',
                borderWidth: 2,
                borderRadius: 25,
                paddingVertical: 14,
                alignItems: 'center',
                justifyContent: 'center',
                width: '90%',
                shadowColor: '#181a64ff',
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Text
                sx={{
                  color: 'driver',
                  fontSize: 22,
                  fontWeight: 'bold',
                }}
              >
                I’m a Driver
              </Text>
            </TouchableOpacity>
          </View>

          {/* Terms and Conditions */}
          <View
            sx={{
              position: 'absolute',
              bottom: 40,
              width: '100%',
              alignItems: 'center',
            }}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('TermsScreen')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                sx={{
                  color: 'black',
                  fontWeight: '600',
                  fontSize: 18,
                  textAlign: 'center',
                  textDecorationLine: 'underline',
                }}
              >
                Terms & Conditions
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </>
  );
};
