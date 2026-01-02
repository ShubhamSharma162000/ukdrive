import React, { useState } from 'react';
import {
  Modal,
  TextInput,
  Pressable,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { View, Text } from 'dripsy';
import {
  ImageLibraryOptions,
  launchImageLibrary,
} from 'react-native-image-picker';
import { Asset } from 'react-native-image-picker';
export default function UpdateInfoModal({ visible, onClose }: any) {
  const [step, setStep] = useState(1);

  const [aadhaarFile, setAadhaarFile] = useState<Asset | null>(null);
  const [licenseFile, setLicenseFile] = useState<Asset | null>(null);
  const [vechileRCFile, setVechileRCFile] = useState<Asset | null>(null);

  const [form, setForm] = useState({
    fullName: '',
    vehicleType: '',
    registrationNumber: '',
    licenseNumber: '',
    rcNumber: '',
    ownerName: '',
  });

  const renderFile = (file: any) =>
    file?.fileName ? file.fileName : 'File selected';

  const pickFile = async (type: any) => {
    const options: ImageLibraryOptions = {
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

  const validateStep1 = () => {
    const {
      fullName,
      vehicleType,
      registrationNumber,
      licenseNumber,
      rcNumber,
      ownerName,
    } = form;

    if (
      !fullName.trim() ||
      !vehicleType.trim() ||
      !registrationNumber.trim() ||
      !licenseNumber.trim() ||
      !rcNumber.trim() ||
      !ownerName.trim()
    ) {
      Alert.alert('Missing Fields', 'All fields in Step 1 are required.');
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!aadhaarFile || !licenseFile || !vechileRCFile) {
      Alert.alert('Missing Files', 'Please upload all required documents.');
      return false;
    }

    return true;
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        sx={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
          alignItems: 'center',
          p: 20,
        }}
      >
        <View
          sx={{
            width: '100%',
            bg: 'white',
            borderRadius: 12,
            p: 20,
          }}
        >
          <View
            sx={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 10,
            }}
          >
            <View sx={{ width: 22 }} />
            <Text sx={{ fontSize: 20, fontWeight: '700', textAlign: 'center' }}>
              Update Information
            </Text>
            <Pressable onPress={onClose}>
              <Text sx={{ fontSize: 22 }}>✕</Text>
            </Pressable>
          </View>

          <View
            sx={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              mt: 20,
              mb: 30,
            }}
          >
            <View
              sx={{
                width: 35,
                height: 35,
                borderRadius: 20,
                bg: step === 1 ? 'purple' : 'lightgrey',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text sx={{ color: 'white', fontWeight: '700' }}>1</Text>
            </View>

            <View
              sx={{
                width: 40,
                height: 2,
                bg: step === 2 ? 'purple' : 'lightgrey',
                mx: 10,
              }}
            />

            <View
              sx={{
                width: 35,
                height: 35,
                borderRadius: 20,
                bg: step === 2 ? '#a113f3ff' : 'lightgrey',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text sx={{ color: 'white', fontWeight: '700' }}>2</Text>
            </View>
          </View>

          {step === 1 && (
            <View sx={{ mt: 10 }}>
              <View
                sx={{
                  width: '100%',
                  mb: 15,
                  bg: '#F8F8FA',
                  borderRadius: 12,
                  p: 12,
                  borderWidth: 1,
                  borderColor: '#E2E2E8',
                }}
              >
                <TextInput
                  placeholder="Full Name"
                  placeholderTextColor="#888"
                  value={form.fullName}
                  onChangeText={t => setForm({ ...form, fullName: t })}
                />
              </View>

              {/* Vehicle Type */}
              <TouchableOpacity onPress={() => pickFile('aadhaar')}>
                <View
                  sx={{
                    width: '100%',
                    mb: 15,
                    bg: '#F8F8FA',
                    borderRadius: 12,
                    p: 12,
                    borderWidth: 1,
                    borderColor: '#E2E2E8',
                  }}
                >
                  <TextInput
                    placeholder="Vehicle Type"
                    placeholderTextColor="#888"
                    value={form.vehicleType}
                    onChangeText={t => setForm({ ...form, vehicleType: t })}
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => pickFile('license')}>
                <View
                  sx={{
                    width: '100%',
                    mb: 15,
                    bg: '#F8F8FA',
                    borderRadius: 12,
                    p: 12,
                    borderWidth: 1,
                    borderColor: '#E2E2E8',
                  }}
                >
                  <TextInput
                    placeholder="Registration Number"
                    placeholderTextColor="#888"
                    value={form.registrationNumber}
                    onChangeText={t =>
                      setForm({ ...form, registrationNumber: t })
                    }
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => pickFile('rc')}>
                <View
                  sx={{
                    width: '100%',
                    mb: 15,
                    bg: '#F8F8FA',
                    borderRadius: 12,
                    p: 12,
                    borderWidth: 1,
                    borderColor: '#E2E2E8',
                  }}
                >
                  <TextInput
                    placeholder="Driving License Number"
                    placeholderTextColor="#888"
                    value={form.licenseNumber}
                    onChangeText={t => setForm({ ...form, licenseNumber: t })}
                  />
                </View>
              </TouchableOpacity>

              <View
                sx={{
                  width: '100%',
                  mb: 15,
                  bg: '#F8F8FA',
                  borderRadius: 12,
                  p: 12,
                  borderWidth: 1,
                  borderColor: '#E2E2E8',
                }}
              >
                <TextInput
                  placeholder="RC Number (Optional)"
                  placeholderTextColor="#888"
                  value={form.rcNumber}
                  onChangeText={t => setForm({ ...form, rcNumber: t })}
                />
              </View>

              <View
                sx={{
                  width: '100%',
                  mb: 15,
                  bg: '#F8F8FA',
                  borderRadius: 12,
                  p: 12,
                  borderWidth: 1,
                  borderColor: '#E2E2E8',
                }}
              >
                <TextInput
                  placeholder="Vehicle Owner Name (Optional)"
                  placeholderTextColor="#888"
                  value={form.ownerName}
                  onChangeText={t => setForm({ ...form, ownerName: t })}
                />
              </View>

              <TouchableOpacity
                onPress={() => {
                  if (validateStep1()) {
                    setStep(2);
                  }
                }}
              >
                <View
                  sx={{
                    bg: 'purple',
                    p: 16,
                    borderRadius: 12,
                    mt: 10,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    sx={{
                      color: 'white',
                      fontSize: 16,
                      fontWeight: '700',
                    }}
                  >
                    Continue
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View>
              {/* Aadhaar */}
              <TouchableOpacity onPress={() => pickFile('aadhaar')}>
                <View sx={uploadBox}>
                  <Text>Aadhaar Card</Text>

                  {aadhaarFile ? (
                    <Text sx={{ mt: 5, fontSize: 12, color: 'green' }}>
                      {aadhaarFile.fileName || 'Uploaded'}
                    </Text>
                  ) : (
                    <Text sx={{ mt: 5, fontSize: 12, color: 'red' }}>
                      No file selected
                    </Text>
                  )}
                </View>
              </TouchableOpacity>

              {/* License */}
              <TouchableOpacity onPress={() => pickFile('license')}>
                <View sx={uploadBox}>
                  <Text>Driving License</Text>

                  {licenseFile ? (
                    <Text sx={{ mt: 5, fontSize: 12, color: 'green' }}>
                      {licenseFile.fileName || 'Uploaded'}
                    </Text>
                  ) : (
                    <Text sx={{ mt: 5, fontSize: 12, color: 'red' }}>
                      No file selected
                    </Text>
                  )}
                </View>
              </TouchableOpacity>

              {/* RC */}
              <TouchableOpacity onPress={() => pickFile('rc')}>
                <View sx={uploadBox}>
                  <Text>Vehicle RC</Text>

                  {vechileRCFile ? (
                    <Text sx={{ mt: 5, fontSize: 12, color: 'green' }}>
                      {vechileRCFile.fileName || 'Uploaded'}
                    </Text>
                  ) : (
                    <Text sx={{ mt: 5, fontSize: 12, color: 'red' }}>
                      No file selected
                    </Text>
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (validateStep1()) {
                    setStep(2);
                  }
                }}
              >
                <View
                  sx={{
                    bg: '#9a1ac8ff',
                    p: 14,
                    borderRadius: 8,
                    mt: 10,
                    alignItems: 'center',
                  }}
                >
                  <Text sx={{ color: 'white', fontWeight: '700' }}>
                    Update Information
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setStep(1)}>
                <Text
                  sx={{
                    mt: 15,
                    textAlign: 'center',
                    color: 'purple',
                    fontWeight: '600',
                  }}
                >
                  Back
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

/* --------------- SX-ONLY STYLE OBJECTS --------------- */
const uploadBox = {
  bg: '#f1eff1ff',
  p: 20,
  borderRadius: 10,
  mb: 15,
};

// For TextInput we must use `style`, since TextInput doesn't support `sx`
const inputStyle = {
  width: '100%',
  borderWidth: 1,
  borderColor: '#ccc',
  padding: 12,
  borderRadius: 8,
  marginBottom: 15,
  fontSize: 16,
};
