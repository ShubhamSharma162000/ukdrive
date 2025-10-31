// src/screens/ClientSignUpScreen.tsx
import React, { useRef, useState } from 'react';
import {
  StatusBar,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { View, Text, Image } from 'dripsy';
import { RFValue } from 'react-native-responsive-fontsize';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import Api from '../../api/Api';
import { theme } from '../theme/theme';
import { useDripsyTheme } from 'dripsy';
import { useToast } from '../../context/ToastContext';
import * as Keychain from 'react-native-keychain';

export default function PassengerSignUpScreen({ navigation }) {
  const { login } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpInput, setOtpInput] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [verifyOtpLoading, setVerifyOtpLoading] = useState(false);
  const [sessionId, setSessionId] = useState();
  const inputRefs = useRef([]);
  const { theme } = useDripsyTheme();
  const { showToast } = useToast();

  const inputs = Array(6).fill(0);

  const isValidPhoneNumber = num => /^\d{10}$/.test(num);

  const handleOTPChange = (text, index) => {
    if (!/^\d*$/.test(text)) return;
    const newOtp = otpValue.split('');
    newOtp[index] = text;
    setOtpValue(newOtp.join(''));

    if (text && index < 5) inputRefs.current[index + 1]?.focus();
    if (!text && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const sendOTP = async () => {
    if (!isValidPhoneNumber(phoneNumber)) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }
    try {
      setOtpLoading(true);
      const response = await Api.get('/auth/sendotp', {
        params: { phoneNumber, isRegistration: true, userType: 'passenger' },
      });
      const data = response?.data;
      if (data?.success) {
        console.log(data);
        setSessionId(data?.sessionId);
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
    if (otpValue.length !== 6) {
      alert('Please enter a valid 6-digit OTP');
      return;
    }
    try {
      setVerifyOtpLoading(true);
      const response = await Api.post('/auth/verifyotp', {
        otpValue,
        sessionId,
      });
      const data = response.data;
      if (data.success) {
        showToast(data?.message, 'success');
        login(data?.phone, data?.userType);
        await Keychain.setGenericPassword(
          'ukdrive_user',
          JSON.stringify({
            accessToken: data.tokens.accessToken,
            refreshToken: data.tokens.refreshToken,
            phoneNumber: data.phone,
            userType: data.userType,
            id: data.id,
          }),
        );
        navigation.navigate('PassengerHomeScreen');
      } else {
        showToast(data?.message || 'Authentication Failed !', 'error');
      }
    } catch (err) {
      showToast(
        err?.response?.data?.message || 'Error while sending the OTP !',
        'error',
      );
    } finally {
      setVerifyOtpLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          padding: 20,
          marginTop: 6,
        }}
      >
        <Text
          style={{
            fontSize: RFValue(24),
            fontWeight: 'bold',
            color: '#F16100',
          }}
        >
          Create Passenger Account
        </Text>

        <View sx={{ width: '90%', mb: 4, mt: 40 }}>
          <Image
            source={require('../../../src/assets/images/passengerLogIn.png')}
            resizeMode="contain"
          />
          <Text
            sx={{
              color: 'passengerTheme',
              fontSize: RFValue(16),
              fontWeight: 'bold',
              mb: 20,
              mt: 40,
              textAlign: 'center',
            }}
          >
            Mobile Number
          </Text>
          <View
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              borderColor: 'passengerTheme',
              borderRadius: 'xl',
              borderWidth: 2,
              px: 3,
              py: 2,
              width: '100%',
            }}
          >
            <Text
              sx={{ fontWeight: 'bold', fontSize: RFValue(16), color: 'black' }}
            >
              +91
            </Text>
            <TextInput
              style={{ flex: 1, fontSize: RFValue(16), color: '#1D0948' }}
              keyboardType="phone-pad"
              maxLength={10}
              value={phoneNumber}
              textAlign="center"
              onChangeText={text => /^\d*$/.test(text) && setPhoneNumber(text)}
            />
          </View>
        </View>

        {!otpInput && (
          <TouchableOpacity
            onPress={sendOTP}
            disabled={otpLoading}
            style={{
              backgroundColor: theme.colors.passengerTheme,
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 25,
              alignItems: 'center',
              justifyContent: 'center',
              width: '40%',
              shadowColor: 'passengerTheme',
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
              marginTop: 10,
            }}
          >
            {otpLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                style={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: RFValue(16),
                }}
              >
                Send OTP
              </Text>
            )}
          </TouchableOpacity>
        )}

        {otpInput && (
          <View sx={{ alignItems: 'center', mt: 4 }}>
            <View
              sx={{ flexDirection: 'row', justifyContent: 'center', mb: 4 }}
            >
              {inputs.map((_, index) => (
                <TextInput
                  key={index}
                  ref={ref => (inputRefs.current[index] = ref)}
                  value={otpValue[index] || ''}
                  onChangeText={text => handleOTPChange(text, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  style={{
                    width: RFValue(30),
                    height: RFValue(40),
                    textAlign: 'center',
                    fontSize: RFValue(18),
                    fontWeight: 'bold',
                    borderColor: theme.colors.passengerTheme,
                    borderWidth: 2,
                    borderRadius: 6,
                    marginRight: index !== 5 ? 10 : 0,
                    marginTop: 20,
                  }}
                />
              ))}
            </View>

            <TouchableOpacity
              onPress={verifyOTP}
              disabled={verifyOtpLoading}
              style={{
                backgroundColor: theme.colors.passengerTheme,
                borderRadius: 25,
                paddingVertical: 12,
                paddingHorizontal: 20,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: theme.colors.passengerTheme,
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
                marginTop: 20,
                width: 180,
              }}
            >
              {verifyOtpLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  style={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: RFValue(16),
                  }}
                >
                  Verify
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View sx={{ mb: 20, alignItems: 'center' }}>
        <Text
          style={{
            fontSize: RFValue(13),
            color: '#333',
            textAlign: 'center',
          }}
        >
          Already have an account?{' '}
          <Text
            onPress={() => navigation.navigate('ClientLogIn')}
            style={{
              color: 'passengerTheme',
              textDecorationLine: 'underline',
              fontWeight: 'bold',
              fontSize: RFValue(16),
            }}
          >
            Sign In
          </Text>
        </Text>

        <Text
          style={{
            color: '#13121299',
            textAlign: 'center',
            fontSize: RFValue(12),
            marginTop: 4,
          }}
        >
          By signing in, you agree to our Terms & Conditions.
        </Text>
      </View>
    </SafeAreaView>
  );
}
