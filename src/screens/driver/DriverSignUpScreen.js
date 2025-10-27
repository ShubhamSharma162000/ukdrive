// import Api from '../../api/Api';
// import { useAuth } from '../../context/AuthContext';
// // import { showToast } from '../../toast';
// import * as DocumentPicker from 'expo-document-picker';
// import { useRef, useState } from 'react';
// import {
//   ActivityIndicator,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
// } from 'react-native';
// import DropDownPicker from 'react-native-dropdown-picker';
// import { Text } from 'react-native-paper';
// import { RFValue } from 'react-native-responsive-fontsize';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { View } from 'dripsy';

// export default function DriverSignUpScreen({ navigation }) {
//   const { login } = useAuth();
//   const [step, setStep] = useState(0);
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [otpValue, setOtpValue] = useState('');
//   const [otpInput, setOtpInput] = useState(false);
//   const [otpLoading, setOtpLoading] = useState(false);
//   const [verifyOtpLoading, setVerifyOtpLoading] = useState(false);
//   const [sessionId, setSessionId] = useState();
//   const [fullName, setFullName] = useState('');
//   const [vechileType, setVechileType] = useState('');
//   const [vechileRegistrationNumber, setVechileRegistrationNumber] =
//     useState('');
//   const [driverLicenseNumber, setDriverLicenseNumer] = useState('');
//   const [vechileTypeOpen, setVechileTypeOpen] = useState(false);
//   const [vechileItems, setVechileItems] = useState([
//     { label: 'Bike', value: 'bike' },
//     { label: 'Scooter', value: 'scooter' },
//     { label: 'E-Rickshaw', value: 'erickshaw' },
//     { label: 'Mini Auto', value: 'miniauto' },
//     { label: 'Auto Rickshaw', value: 'autorickshaw' },
//     { label: 'Car/Taxi', value: 'cartaxi' },
//   ]);
//   const [infoSubmitLoading, setInfoSubmitLoading] = useState(false);
//   const [id, setId] = useState();

//   const [aadhaarFile, setAadhaarFile] = useState(null);
//   const [licenseFile, setLicenseFile] = useState(null);
//   const [vechileRCFile, setVechileRCFile] = useState(null);
//   const [documentSubittingLoading, setDocumentSubmittingLoading] =
//     useState(false);

//   const inputRefs = useRef([]);

//   const handleOTPChange = (text, index) => {
//     if (!/^\d*$/.test(text)) return;

//     const newOtp = otpValue.split('');
//     newOtp[index] = text;
//     setOtpValue(newOtp.join(''));

//     if (text && index < 5) inputRefs.current[index + 1].focus();
//     if (!text && index > 0) inputRefs.current[index - 1].focus();
//   };

//   const isValidPhoneNumber = num => /^\d{10}$/.test(num);

//   const pickFile = async type => {
//     const result = await DocumentPicker.getDocumentAsync({
//       type: '*/*',
//       copyToCacheDirectory: true,
//     });

//     if (!result.canceled && result.assets?.length > 0) {
//       const file = result.assets[0];
//       if (type === 'aadhaar') setAadhaarFile(file);
//       if (type === 'license') setLicenseFile(file);
//       if (type === 'rc') setVechileRCFile(file);
//     }
//   };

//   function renderFile(file, maxChars = 15) {
//     if (!file) return null;
//     const displayName =
//       file.name && file.name.length > maxChars
//         ? file.name.slice(0, maxChars) + '...'
//         : file.name || '';
//     return (
//       <Text sx={{ color: 'white', textAlign: 'center' }}>{displayName}</Text>
//     );
//   }

//   const sendOTP = async () => {
//     if (!isValidPhoneNumber(phoneNumber)) {
//       alert('Enter a valid 10-digit phone number');
//       return;
//     }
//     setOtpLoading(true);
//     try {
//       const response = await Api.get('/auth/sendotp', {
//         params: { phoneNumber, isRegistration: true, userType: 'driver' },
//       });
//       const data = response.data;
//       if (data.success) {
//         setSessionId(data.sessionId);
//         // showToast('success', 'Success!', data.message, 'top', 3000);
//         setOtpInput(true);
//       }
//     } catch (err) {}
//     setOtpLoading(false);
//   };

//   const verifyOTP = async () => {
//     if (otpValue.length !== 6) {
//       alert('Enter valid 6-digit OTP');
//       return;
//     }
//     setVerifyOtpLoading(true);
//     try {
//       const response = await Api.post('/auth/verifyotp', {
//         otpValue,
//         sessionId,
//       });
//       const data = response.data;
//       if (data.success) {
//         setStep(1);
//       } else {
//         // showToast('error', 'Error!', 'Authentication failed.', 'top', 3000);
//       }
//     } catch (err) {
//       // showToast('error', 'Error!', 'Login failed', 'top', 3000);
//     }
//     setVerifyOtpLoading(false);
//   };

//   const submitInformationStep1 = async () => {
//     if (
//       !fullName.trim() ||
//       !driverLicenseNumber.trim() ||
//       !vechileType ||
//       !vechileRegistrationNumber.trim()
//     ) {
//       alert('All fields are required');
//       return;
//     }
//     try {
//       const response = await Api.post('/auth/driverregister', {
//         fullName,
//         phoneNumber,
//         vechileType,
//         vechileRegistrationNumber,
//         driverLicenseNumber,
//       });
//       const data = response.data;
//       if (data.success) {
//         setId(data?.data?.id);
//         setStep(2);
//       }
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const submitDocumentationStep2 = async () => {
//     if (!aadhaarFile || !licenseFile || !vechileRCFile) {
//       alert('All fields are required');
//       return;
//     }
//     try {
//       const formData = new FormData();
//       formData.append('aadharFile', {
//         uri: aadhaarFile.uri,
//         name: aadhaarFile.name,
//         type: aadhaarFile.mimeType || 'image/jpeg',
//       });
//       formData.append('licenseFile', {
//         uri: licenseFile.uri,
//         name: licenseFile.name,
//         type: licenseFile.mimeType || 'image/jpeg',
//       });
//       formData.append('vechileRCFile', {
//         uri: vechileRCFile.uri,
//         name: vechileRCFile.name,
//         type: vechileRCFile.mimeType || 'image/jpeg',
//       });

//       const response = await Api.post(
//         `/auth/registrationdocuments?id=${id}`,
//         formData,
//         {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         },
//       );
//       const data = response.data;
//       if (data.success) {
//         login(data?.phone, data?.userType);
//         navigation.navigate('HomeScreen');
//       }
//     } catch (err) {
//       console.log(err);
//     }
//   };
//   const stepsLabels = ['Mobile', 'OTP', 'Info', 'Documents'];

//   return (
//     <SafeAreaView sx={{ flex: 1, backgroundColor: 'white' }}>
//       <ScrollView
//         contentContainerStyle={{
//           flexGrow: 1,
//           padding: 20,
//           alignItems: 'center',
//         }}
//       >
//         <View sx={{ width: '100%', maxWidth: 500, alignItems: 'center' }}>
//           <View
//             style={{
//               flexDirection: 'row',
//               justifyContent: 'space-around',
//               marginBottom: 20,
//             }}
//           >
//             {stepsLabels.map((label, index) => (
//               <View key={index} style={{ alignItems: 'center' }}>
//                 <View
//                   style={{
//                     width: 30,
//                     height: 30,
//                     borderRadius: 15,
//                     backgroundColor: step >= index ? '#F16100' : '#ccc',
//                     justifyContent: 'center',
//                     alignItems: 'center',
//                   }}
//                 >
//                   <Text style={{ color: '#fff', fontWeight: 'bold' }}>
//                     {index + 1}
//                   </Text>
//                 </View>
//                 <Text
//                   style={{
//                     marginTop: 4,
//                     color: step >= index ? '#F16100' : '#999',
//                   }}
//                 >
//                   {label}
//                 </Text>
//               </View>
//             ))}
//           </View>

//           {step === 0 && (
//             <>
//               <Text
//                 sx={{
//                   fontSize: RFValue(16),
//                   color: 'primary',
//                   textAlign: 'center',
//                   mb: 3,
//                 }}
//               >
//                 Mobile Number
//               </Text>
//               <View sx={{ flexDirection: 'row', alignItems: 'center', mb: 3 }}>
//                 <View
//                   sx={{
//                     backgroundColor: 'purple',
//                     borderRadius: 10,
//                     padding: 2,
//                   }}
//                 >
//                   <Text sx={{ color: 'white', fontWeight: 'bold' }}>+91</Text>
//                 </View>
//                 <TextInput
//                   style={{ flex: 1, fontSize: 18, color: '#111' }}
//                   keyboardType="phone-pad"
//                   maxLength={10}
//                   value={phoneNumber}
//                   onChangeText={setPhoneNumber}
//                 />
//               </View>
//               {!otpInput ? (
//                 <TouchableOpacity
//                   onPress={sendOTP}
//                   disabled={otpLoading}
//                   style={{
//                     backgroundColor: 'purple',
//                     padding: 10,
//                     borderRadius: 20,
//                     alignItems: 'center',
//                   }}
//                 >
//                   {otpLoading ? (
//                     <ActivityIndicator color="white" />
//                   ) : (
//                     <Text sx={{ color: 'white' }}>Send OTP</Text>
//                   )}
//                 </TouchableOpacity>
//               ) : (
//                 <View
//                   sx={{ flexDirection: 'row', justifyContent: 'center', mt: 3 }}
//                 >
//                   {Array(6)
//                     .fill(0)
//                     .map((_, i) => (
//                       <TextInput
//                         key={i}
//                         ref={ref => (inputRefs.current[i] = ref)}
//                         value={otpValue[i] || ''}
//                         onChangeText={text => handleOTPChange(text, i)}
//                         keyboardType="number-pad"
//                         maxLength={1}
//                         style={{
//                           borderWidth: 2,
//                           borderColor: 'purple',
//                           width: 40,
//                           height: 50,
//                           textAlign: 'center',
//                           marginRight: i !== 5 ? 5 : 0,
//                           borderRadius: 6,
//                         }}
//                       />
//                     ))}
//                 </View>
//               )}
//             </>
//           )}

//           {step === 1 && (
//             <>
//               <Text sx={{ mb: 1, color: 'primary' }}>Full Name</Text>
//               <TextInput
//                 value={fullName}
//                 onChangeText={setFullName}
//                 style={{
//                   borderWidth: 1,
//                   borderColor: 'purple',
//                   padding: 10,
//                   borderRadius: 10,
//                   width: '100%',
//                   marginBottom: 10,
//                 }}
//               />
//               <Text sx={{ mb: 1, color: 'primary' }}>Vehicle Type</Text>
//               <DropDownPicker
//                 open={vechileTypeOpen}
//                 value={vechileType}
//                 items={vechileItems}
//                 setOpen={setVechileTypeOpen}
//                 setValue={setVechileType}
//                 setItems={setVechileItems}
//               />
//               <TouchableOpacity
//                 onPress={submitInformationStep1}
//                 style={{
//                   backgroundColor: 'purple',
//                   padding: 12,
//                   borderRadius: 10,
//                   alignItems: 'center',
//                   mt: 10,
//                 }}
//               >
//                 {infoSubmitLoading ? (
//                   <ActivityIndicator color="white" />
//                 ) : (
//                   <Text sx={{ color: 'white' }}>Continue</Text>
//                 )}
//               </TouchableOpacity>
//             </>
//           )}
//           {step === 2 && (
//             <>
//               <TouchableOpacity
//                 onPress={() => pickFile('aadhaar')}
//                 style={{
//                   borderWidth: 1,
//                   borderColor: 'purple',
//                   borderRadius: 10,
//                   padding: 10,
//                   width: '100%',
//                   marginBottom: 10,
//                 }}
//               >
//                 <Text>
//                   {aadhaarFile ? renderFile(aadhaarFile) : 'Upload Aadhaar'}
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 onPress={() => pickFile('license')}
//                 style={{
//                   borderWidth: 1,
//                   borderColor: 'purple',
//                   borderRadius: 10,
//                   padding: 10,
//                   width: '100%',
//                   marginBottom: 10,
//                 }}
//               >
//                 <Text>
//                   {licenseFile ? renderFile(licenseFile) : 'Upload License'}
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 onPress={() => pickFile('rc')}
//                 style={{
//                   borderWidth: 1,
//                   borderColor: 'purple',
//                   borderRadius: 10,
//                   padding: 10,
//                   width: '100%',
//                   marginBottom: 10,
//                 }}
//               >
//                 <Text>
//                   {vechileRCFile ? renderFile(vechileRCFile) : 'Upload RC'}
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 onPress={submitDocumentationStep2}
//                 style={{
//                   backgroundColor: 'purple',
//                   padding: 12,
//                   borderRadius: 10,
//                   alignItems: 'center',
//                   mt: 5,
//                 }}
//               >
//                 {documentSubittingLoading ? (
//                   <Text sx={{ color: 'white' }}>Submitting...</Text>
//                 ) : (
//                   <Text sx={{ color: 'white' }}>Complete Registration</Text>
//                 )}
//               </TouchableOpacity>
//             </>
//           )}
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }
