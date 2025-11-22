import React, { useRef, useState } from 'react';
import { TextInput, Alert, TouchableOpacity } from 'react-native';
import { View, Text, Image, ActivityIndicator } from 'dripsy';
import { ArrowRight } from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Api from '../../api/Api';
import { useToast } from '../../context/ToastContext';
import DropDownPicker from 'react-native-dropdown-picker';

export default function DriverSignUpScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [documents, setDocuments] = useState([]);
  const [otpValue, setOtpValue] = useState('');
  const [otpInput, setOtpInput] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyOtpLoading, setVerifyOtpLoading] = useState(false);
  const [sessionId, setSessionId] = useState();
  const [name, setName] = useState('');
  const [license, setLicense] = useState('');
  const [fullName, setFullName] = useState('');
  const [vechileType, setVechileType] = useState('');
  const [vechileRegistrationNumber, setVechileRegistrationNumber] =
    useState('');
  const [driverLicenseNumber, setDriverLicenseNumer] = useState('');
  const [vechileTypeOpen, setVechileTypeOpen] = useState(false);
  const [vechileItems, setVechileItems] = useState([
    { label: 'Bike', value: 'bike' },
    { label: 'Scooter', value: 'scooter' },
    { label: 'E-Rickshaw', value: 'erickshaw' },
    { label: 'Mini Auto', value: 'miniauto' },
    { label: 'Auto Rickshaw', value: 'autorickshaw' },
    { label: 'Car/Taxi', value: 'cartaxi' },
  ]);
  const [infoSubmitLoading, setInfoSubmitLoading] = useState(false);
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);
  const [vechileRCFile, setVechileRCFile] = useState(null);
  const [documentSubittingLoading, setDocumentSubmittingLoading] =
    useState(false);
  const [id, setId] = useState();
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

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const isValidPhoneNumber = num => /^\d{10}$/.test(num);

  const renderFile = file => (file?.fileName ? file.fileName : 'File selected');

  const pickFile = async type => {
    const options = {
      mediaType: 'photo',
      selectionLimit: 1,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled picker');
        return;
      }
      if (response.errorMessage) {
        Alert.alert('Error', response.errorMessage);
        return;
      }

      const asset = response.assets?.[0];
      if (!asset) return;

      if (type === 'aadhaar') setAadhaarFile(asset);
      else if (type === 'license') setLicenseFile(asset);
      else if (type === 'rc') setVechileRCFile(asset);
    });
  };

  const sendOTP = async () => {
    if (!isValidPhoneNumber(phoneNumber)) {
      alert('Enter a valid 10-digit phone number');
      return;
    }
    setOtpLoading(true);
    try {
      const response = await Api.get('/auth/sendotp', {
        params: { phoneNumber, isRegistration: true, userType: 'driver' },
      });
      const data = response.data;
      console.log(data);
      if (data.success) {
        setSessionId(data.sessionId);
        // showToast('success', 'Success!', data.message, 'top', 3000);
        setOtpInput(true);
      }
    } catch (err) {}
    setOtpLoading(false);
  };

  const verifyOTP = async () => {
    if (otpValue.length !== 6) {
      alert('Enter valid 6-digit OTP');
      return;
    }
    setVerifyOtpLoading(true);
    try {
      const response = await Api.post('/auth/verifyotp', {
        otpValue,
        sessionId,
      });
      const data = response.data;
      if (data.success) {
        setStep(2);
      } else {
        // showToast('error', 'Error!', 'Authentication failed.', 'top', 3000);
      }
    } catch (err) {
      // showToast('error', 'Error!', 'Login failed', 'top', 3000);
    }
    setVerifyOtpLoading(false);
  };

  const submitInformationStep1 = async () => {
    if (
      !fullName.trim() ||
      !driverLicenseNumber.trim() ||
      !vechileType ||
      !vechileRegistrationNumber.trim()
    ) {
      alert('All fields are required');
      return;
    }
    try {
      const response = await Api.post('/auth/driverregister', {
        fullName,
        phoneNumber,
        vechileType,
        vechileRegistrationNumber,
        driverLicenseNumber,
      });
      const data = response.data;
      if (data.success) {
        setId(data?.data?.id);
        setStep(3);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const submitDocumentationStep2 = async () => {
    if (!aadhaarFile || !licenseFile || !vechileRCFile) {
      alert('All fields are required');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('aadharFile', {
        uri: aadhaarFile.uri,
        name: aadhaarFile.name,
        type: aadhaarFile.mimeType || 'image/jpeg',
      });
      formData.append('licenseFile', {
        uri: licenseFile.uri,
        name: licenseFile.name,
        type: licenseFile.mimeType || 'image/jpeg',
      });
      formData.append('vechileRCFile', {
        uri: vechileRCFile.uri,
        name: vechileRCFile.name,
        type: vechileRCFile.mimeType || 'image/jpeg',
      });

      const response = await Api.post(
        `/auth/registrationdocuments?id=${id}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );
      const data = response.data;
      console.log(data);
      if (data.success) {
        login(data?.phone, data?.userType);
        navigation.navigate('HomeScreen');
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View sx={{ flex: 1, bg: 'white', p: 24 }}>
      <Text
        sx={{
          fontSize: 24,
          fontWeight: '700',
          textAlign: 'center',
          color: '#662d91',
          mt: 40,
        }}
      >
        Create Driver Account
      </Text>

      <View
        sx={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          mt: 24,
        }}
      >
        {[1, 2, 3].map((num, i) => (
          <React.Fragment key={num}>
            <View
              sx={{
                width: 38,
                height: 38,
                borderRadius: 24,
                bg: step === num ? '#9c0af0ff' : '#e0e0e0',
                justifyContent: 'center',
                alignItems: 'center',
                margin: 12,
              }}
            >
              <Text sx={{ color: 'white', fontWeight: '900', fontSize: 16 }}>
                {num}
              </Text>
            </View>

            {i < 2 && (
              <ArrowRight
                color="#999"
                size={26}
                style={{ marginHorizontal: 8 }}
              />
            )}
          </React.Fragment>
        ))}
      </View>

      <View
        sx={{ flexDirection: 'row', justifyContent: 'space-around', mt: 8 }}
      >
        <Text sx={{ color: step === 1 ? '#662d91' : '#999', fontSize: 14 }}>
          OTP
        </Text>
        <Text sx={{ color: step === 2 ? '#662d91' : '#999', fontSize: 14 }}>
          Details
        </Text>
        <Text sx={{ color: step === 3 ? '#662d91' : '#999', fontSize: 14 }}>
          Documents
        </Text>
      </View>

      {step === 1 && (
        <>
          <View sx={{ alignItems: 'center' }}>
            <Image
              source={require('../../assets/images/driverLogIn.png')}
              resizeMode="contain"
              sx={{
                width: 250,
                height: 250,
              }}
            />
          </View>
          <View sx={{ mt: 40 }}>
            <Text
              sx={{
                fontSize: 14,
                fontWeight: '700',
                textAlign: 'center',
                color: '#662d91',
                mb: 10,
              }}
            >
              Enter Your Mobile Number
            </Text>
            <View
              sx={{
                flexDirection: 'row',
                borderWidth: 1.5,
                borderColor: '#662d91',
                borderRadius: 50,
                alignItems: 'center',
                px: 16,
                py: 4,
              }}
            >
              <Text sx={{ color: '#662d91', fontWeight: '600', fontSize: 16 }}>
                +91
              </Text>
              <TextInput
                style={{ flex: 1, marginLeft: 10, fontSize: 16 }}
                placeholder="Enter your number"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
            </View>

            {!otpInput && (
              <TouchableOpacity
                onPress={sendOTP}
                disabled={otpLoading}
                style={{
                  backgroundColor: '#8a039fff',
                  borderRadius: 15,
                  paddingVertical: 10,
                  paddingHorizontal: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 110,
                  marginTop: 20,
                }}
              >
                {otpLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text
                    style={{
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: 16,
                    }}
                  >
                    Send OTP
                  </Text>
                )}
              </TouchableOpacity>
            )}

            {otpInput && (
              <View sx={{ alignItems: 'center' }}>
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
                    marginTop: 10,
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
          </View>
        </>
      )}

      {step === 2 && (
        <View sx={{ mt: 40 }}>
          <Text
            className="text-customPurple"
            style={{
              fontSize: 18,
              // color: customPurple,
              textAlign: 'center',
              marginBottom: 40,
              marginTop: 20,
            }}
          >
            Fill in your details to finish registration
          </Text>

          <Text style={{ fontSize: 14, fontWeight: 900 }}>FULL NAME</Text>
          <TextInput
            className="p-3 border border-gray-500 rounded-xl bg-white mb-4 items-center"
            value={fullName}
            onChangeText={setFullName}
            style={{
              padding: 1,
              borderWidth: 1,
              borderRadius: 10,
            }}
          />

          <Text className="text-orange-600 text-sm mb-1 ml-2 font-bold">
            VERIFIED PHONE NUMBER
          </Text>
          <TextInput
            value={`+91 ${phoneNumber}`}
            editable={false}
            placeholderTextColor="black"
            className="border border-green-600 rounded-xl px-4 py-3 mb-4 bg-gray-100 text-black"
          />

          <Text className="text-orange-600 text-sm mb-1 ml-2 font-bold">
            VEHICLE TYPE
          </Text>
          <DropDownPicker
            open={vechileTypeOpen}
            value={vechileType}
            items={vechileItems}
            setOpen={setVechileTypeOpen}
            setValue={setVechileType}
            setItems={setVechileItems}
            placeholder="Select Your Vehicle Type"
            style={{
              borderColor: '#210269',
              borderRadius: 15,
            }}
            dropDownContainerStyle={{
              borderColor: '#210269',
              borderRadius: 15,
            }}
            listMode="SCROLLVIEW"
            zIndex={3000}
            zIndexInverse={1000}
          />

          <Text className="text-orange-600 text-sm pt-4 mb-1 ml-2 font-bold">
            VEHICLE REGISTRATION NUMBER
          </Text>
          <TextInput
            className="p-3 border border-gray-300 rounded-xl bg-white mb-4 items-center"
            placeholder="vehicle registration number"
            value={vechileRegistrationNumber}
            onChangeText={setVechileRegistrationNumber}
          />

          <Text className="text-orange-600 text-sm mb-1 ml-2 font-bold">
            DRIVING LICENSE NUMBER
          </Text>
          <TextInput
            className=" p-3 border border-gray-300 rounded-xl bg-white mb-4 "
            // style={{width : 300}}
            placeholder="Driving license number"
            value={driverLicenseNumber}
            onChangeText={setDriverLicenseNumer}
          />

          <TouchableOpacity
            onPress={submitInformationStep1}
            style={{
              backgroundColor: '#9f3af7ff',
              borderRadius: 15,
              paddingVertical: 10,
              paddingHorizontal: 10,
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 100,
            }}
          >
            {infoSubmitLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text
                style={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: 16,
                }}
              >
                Submit
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={prevStep}
            style={{
              backgroundColor: '#e6e4e6ff',
              borderRadius: 50,
              marginTop: 10,
              paddingVertical: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#333', fontWeight: '600' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 3 && (
        <View sx={{ flex: 1, bg: 'white', p: 20, alignItems: 'center' }}>
          <View sx={{ alignItems: 'center', mt: 20 }}>
            {/* Aadhaar Upload */}
            <View
              sx={{
                flexDirection: 'row',
                alignItems: 'center',
                width: '85%',
                mb: 14,
              }}
            >
              <TouchableOpacity
                onPress={() => pickFile('aadhaar')}
                style={{
                  backgroundColor: '#4f46e5',
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                  flex: 1,
                }}
              >
                <Text
                  style={{
                    color: 'white',
                    textAlign: 'center',
                    fontWeight: '600',
                  }}
                >
                  {aadhaarFile
                    ? renderFile(aadhaarFile)
                    : 'Upload Aadhaar Card'}
                </Text>
              </TouchableOpacity>
              {/* {aadhaarFile && (
                <Ionicons
                  name="checkmark-sharp"
                  size={30}
                  color="#3b82f6"
                  style={{ marginHorizontal: 10 }}
                />
              )} */}
            </View>

            <View
              sx={{
                flexDirection: 'row',
                alignItems: 'center',
                width: '85%',
                mb: 14,
              }}
            >
              <TouchableOpacity
                onPress={() => pickFile('license')}
                style={{
                  backgroundColor: '#4f46e5',
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                  flex: 1,
                }}
              >
                <Text
                  style={{
                    color: 'white',
                    textAlign: 'center',
                    fontWeight: '600',
                  }}
                >
                  {licenseFile ? renderFile(licenseFile) : 'Upload License'}
                </Text>
              </TouchableOpacity>
              {/* {licenseFile && (
                <Ionicons
                  name="checkmark-sharp"
                  size={30}
                  color="#3b82f6"
                  style={{ marginHorizontal: 10 }}
                />
              )} */}
            </View>
            <View
              sx={{
                flexDirection: 'row',
                alignItems: 'center',
                width: '85%',
                mb: 14,
              }}
            >
              <TouchableOpacity
                onPress={() => pickFile('rc')}
                style={{
                  backgroundColor: '#4f46e5',
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                  flex: 1,
                }}
              >
                <Text
                  style={{
                    color: 'white',
                    textAlign: 'center',
                    fontWeight: '600',
                  }}
                >
                  {vechileRCFile ? renderFile(vechileRCFile) : 'Upload RC'}
                </Text>
              </TouchableOpacity>
              {/* {vechileRCFile && (
                <Ionicons
                  name="checkmark-sharp"
                  size={30}
                  color="#3b82f6"
                  style={{ marginHorizontal: 10 }}
                />
              )} */}
            </View>
          </View>
          <TouchableOpacity
            onPress={submitDocumentationStep2}
            disabled={documentSubittingLoading}
            style={{
              backgroundColor: '#e08937',
              borderRadius: 15,
              paddingVertical: 12,
              paddingHorizontal: 20,
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 160,
              marginTop: 25,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>
              {documentSubittingLoading
                ? 'Submitting...'
                : 'Complete Registration'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          alignItems: 'center',
          paddingVertical: 16,
        }}
      >
        <Text
          style={{
            fontSize: 13,
            color: '#333',
            textAlign: 'center',
          }}
        >
          Already have an account?{' '}
          <Text
            onPress={() => navigation.navigate('DriverSignUp')}
            style={{
              color: '#662d91',
              textDecorationLine: 'underline',
              fontWeight: 'bold',
              fontSize: 18,
            }}
          >
            Sign Up
          </Text>
        </Text>

        <Text
          style={{
            color: '#333',
            fontSize: 12,
            textAlign: 'center',
            marginTop: 6,
          }}
        >
          By signing in, you agree to our Terms & Conditions.
        </Text>
      </View>
    </View>
  );
}
