import Api from '../../api/Api';
import { useAuth } from '../../context/AuthContext';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Image } from 'dripsy';
import { useToast } from '../../context/ToastContext';
import * as Keychain from 'react-native-keychain';

export default function DriverLogInScreen({ navigation }) {
  const { login } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpInput, setOtpInput] = useState(false);
  const [verifyOtpLoading, setVerifyOtpLoading] = useState(false);
  const [sessionId, setSessionId] = useState();
  const inputRefs = useRef([]);
  const { showToast } = useToast();

  const handleOTPChange = (text, index) => {
    if (!/^\d*$/.test(text)) return;

    const newOtp = otpValue.split('');
    newOtp[index] = text;
    setOtpValue(newOtp.join(''));

    if (text && index < 5) inputRefs.current[index + 1]?.focus();
    if (!text && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const isValidPhoneNumber = num => /^\d{10}$/.test(num);

  const sendOTP = async () => {
    if (!isValidPhoneNumber(phoneNumber)) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }
    setOtpLoading(true);
    try {
      const response = await Api.get('/auth/sendotp', {
        params: { phoneNumber, isRegistration: false, userType: 'driver' },
      });
      const data = response.data;

      if (data.success) {
        setSessionId(data.sessionId);
        showToast(data?.message, 'success');
        setOtpInput(true);
      } else {
        showToast(data?.message || 'Error while sending OTP !', 'error');
      }
    } catch (err) {
      showToast(
        err?.response?.data?.message || 'Error while sending OTP !',
        'error',
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOTP = async () => {
    try {
      console.log('Starting verifyOTP...');
      if (otpValue.length !== 6) {
        console.log('Invalid OTP length');
        alert('Please enter a valid 6-digit OTP');
        return;
      }

      setVerifyOtpLoading(true);
      console.log('Sending API request...');
      const response = await Api.post('/auth/verifyotp', {
        otpValue,
        sessionId,
      });
      console.log('API response received:', response.data);
      const data = response.data;

      if (
        data.success &&
        data?.tokens?.accessToken &&
        data?.tokens?.refreshToken
      ) {
        console.log('Login data:', data?.phone, data?.userType, data?.id);
        login(data?.phone, data?.userType, data?.driverId || '123456789');

        console.log('Saving tokens...');
        await Keychain.setGenericPassword(
          'ukdrive_user',
          JSON.stringify({
            accessToken: data.tokens.accessToken,
            refreshToken: data.tokens.refreshToken,
            phoneNumber: data.phone,
            userType: data.userType,
            id: data.driverId,
          }),
        );
        console.log('Navigating to tabs...');
        // navigation.navigate('DriverTabs', { screen: 'DriverHome' });

        console.log('OTP Success — Showing toast');
        showToast(data?.message, 'success');
      } else {
        console.log('Auth failed:', data);
        showToast(data?.message || 'Authentication Failed !', 'error');
      }
    } catch (err) {
      console.log('Caught error:', err);
      showToast(
        err?.response?.data?.message || 'Error verifying OTP!',
        'error',
      );
    } finally {
      console.log('VerifyOTP finished');
      setVerifyOtpLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'flex-start',
            alignItems: 'center',
            padding: 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View
            sx={{
              position: 'absolute',
              top: -140,
              right: -160,
              width: 250,
              height: 250,
              borderRadius: 200,
              borderWidth: 2,
              borderColor: 'rgba(241,100,6,0.92)',
              transform: [{ scaleX: 1.4 }],
              zIndex: 1,
            }}
          />

          <View sx={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
            <Image
              source={require('../../assets/logo/UKDriveLogo.png')}
              resizeMode="contain"
              sx={{
                width: 90,
                height: 90,
              }}
            />
          </View>
          <View sx={{ mt: 70, alignItems: 'center', mb: 10 }}>
            <Text
              sx={{
                fontSize: RFValue(24),
                fontWeight: 'bold',
                color: 'purple',
              }}
            >
              Driver LogIn
            </Text>
          </View>
          <View
            sx={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              width: 200,
              height: 200,
            }}
          >
            <Image
              source={require('../../../src/assets/images/driverLogIn.png')}
              resizeMode="contain"
            />
          </View>

          <View sx={{ mt: 40 }}>
            <Text
              sx={{
                fontSize: RFValue(16),
                fontWeight: 'bold',
                color: 'purple',
                mb: 20,
                textAlign: 'center',
              }}
            >
              Mobile Number
            </Text>{' '}
            <View
              sx={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: 'driver',
                borderRadius: 'xl',
                px: 3,
                py: 2,
                width: '100%',
              }}
            >
              {' '}
              <View
                sx={{
                  padding: 10,
                  borderRadius: 10,
                  mr: 2,
                }}
              >
                <Text sx={{ fontWeight: 'bold', color: 'black' }}>+91</Text>
              </View>
              <TextInput
                style={{
                  flex: 1,
                  fontSize: 18,
                  color: 'black',
                  textAlign: 'center',
                }}
                keyboardType="phone-pad"
                maxLength={10}
                value={phoneNumber}
                onChangeText={text =>
                  /^\d*$/.test(text) && setPhoneNumber(text)
                }
              />
            </View>
          </View>

          {!otpInput && (
            <TouchableOpacity
              onPress={sendOTP}
              disabled={otpLoading}
              style={{
                backgroundColor: '#9B7CE5',
                borderRadius: 25,
                paddingVertical: 10,
                paddingHorizontal: 30,
                alignItems: 'center',
                justifyContent: 'center',
                width: '40%',
                shadowColor: '#000',
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 6,
                marginTop: 20,
              }}
            >
              {otpLoading ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <Text style={{ fontWeight: 'bold', fontSize: 14 }}>
                  Send OTP
                </Text>
              )}
            </TouchableOpacity>
          )}

          {otpInput && (
            <View sx={{ mt: 4, alignItems: 'center' }}>
              <View
                sx={{ flexDirection: 'row', justifyContent: 'center', mb: 5 }}
              >
                {Array(6)
                  .fill(0)
                  .map((_, index) => (
                    <TextInput
                      key={index}
                      ref={ref => (inputRefs.current[index] = ref)}
                      value={otpValue[index] || ''}
                      onChangeText={text => handleOTPChange(text, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      style={{
                        borderColor: '#9E7BF1',
                        borderWidth: 2,
                        marginRight: index !== 5 ? 8 : 0,
                        borderRadius: 6,
                        width: 30,
                        height: 50,
                        textAlign: 'center',
                        fontSize: 18,
                        fontWeight: 'bold',
                        marginTop: 40,
                      }}
                    />
                  ))}
              </View>

              <TouchableOpacity
                onPress={verifyOTP}
                disabled={verifyOtpLoading}
                style={{
                  backgroundColor: '#8F69E7',
                  borderRadius: 25,
                  paddingVertical: 10,
                  paddingHorizontal: 30,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#000',
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                  marginTop: 30,
                }}
              >
                {verifyOtpLoading ? (
                  <ActivityIndicator color="#000" size="small" />
                ) : (
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                    Verify
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        <View sx={{ mb: 2, alignItems: 'center' }}>
          <Text
            style={{
              fontSize: RFValue(13),
              color: '#333',
              textAlign: 'center',
            }}
          >
            Already have an account?{' '}
            <Text
              onPress={() => navigation.navigate('DriverSignUp')}
              style={{
                color: 'passengerTheme',
                textDecorationLine: 'underline',
                fontWeight: 'bold',
                fontSize: RFValue(16),
              }}
            >
              Sign Up
            </Text>
          </Text>
        </View>

        <Text sx={{ color: '#333', fontSize: 12, textAlign: 'center', mb: 20 }}>
          By signing in, you agree to our Terms & Conditions.
        </Text>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
