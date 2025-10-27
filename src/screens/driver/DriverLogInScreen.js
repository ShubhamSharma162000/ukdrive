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

export default function DriverLogInScreen({ navigation }) {
  const { login } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpInput, setOtpInput] = useState(false);
  const [verifyOtpLoading, setVerifyOtpLoading] = useState(false);
  const [sessionId, setSessionId] = useState();
  const inputRefs = useRef([]);

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
        // showToast('success', 'Success!', data.message, 'top', 3000);
        setOtpInput(true);
      } else {
        // showToast(
        //   'error',
        //   'Error!',
        //   data.message || 'Failed to send OTP',
        //   'top',
        //   3000,
        // );
      }
    } catch (err) {
      // showToast('error', 'Error!', 'Failed to send OTP', 'top', 3000);
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (otpValue.length !== 6) {
      alert('Please enter a valid 6-digit OTP');
      return;
    }
    setVerifyOtpLoading(true);
    try {
      const response = await Api.post('/auth/verifyotp', {
        otpValue,
        sessionId,
      });
      const data = response.data;

      if (
        data.success &&
        data?.tokens?.accessToken &&
        data?.tokens?.refreshToken
      ) {
        // await saveItem logic
        login(data?.phone, data?.userType, data?.id);
        navigation.navigate('DriverHome');
      } else {
        // showToast('error', 'Error!', 'Authentication failed.', 'top', 3000);
      }
    } catch (err) {
      // showToast(
      //   'error',
      //   'Error!',
      //   'Login failed. Please try again.',
      //   'top',
      //   3000,
      // );
    } finally {
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
          <View sx={{ mt: 20, alignItems: 'center', mb: 40 }}>
            <Text
              sx={{
                fontSize: RFValue(32),
                fontWeight: 'bold',
                color: 'purple',
              }}
            >
              Driver LogIn
            </Text>
          </View>
          <Image
            source={require('../../../src/assets/images/driverLogIn.png')}
            resizeMode="contain"
          />

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
                  // backgroundColor: '#9E7BF1',
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
                  borderBottomWidth: 1,
                  borderBottomColor: '#9E7BF1',
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
                width: '35%',
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
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
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
                        height: 40,
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
