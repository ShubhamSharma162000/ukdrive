import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Image } from 'react-native';
import { View, Text, Pressable } from 'dripsy';
import { Camera, Bell, Upload } from 'lucide-react-native';
import {
  launchImageLibrary,
  ImageLibraryOptions,
} from 'react-native-image-picker';

export default function DriverProfile() {
  const [photo, setPhoto] = useState<string | null>(null);

  const openImagePicker = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 1,
    };

    const result = await launchImageLibrary(options);

    if (result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setPhoto(uri ?? null);
    } else {
      console.log('No image selected');
    }
  };

  return (
    <>
      <View
        style={{
          backgroundColor: '#d3d2d4ff',
          paddingTop: 40,
          paddingLeft: 20,
          paddingBottom: 10,
        }}
      >
        <Text sx={{ fontSize: 20, fontWeight: '700' }}>Enhanced</Text>
        <Text sx={{ color: '#666', fontSize: 14 }}>
          Manage your driver profile and settings
        </Text>
      </View>
      <ScrollView style={{ flex: 1, backgroundColor: '#F8F9FB' }}>
        <View
          sx={{
            alignItems: 'center',
            mb: 24,
            backgroundColor: '#D7B9F7',
            p: 25,
          }}
        >
          <View
            sx={{
              width: 100,
              height: 100,
              borderRadius: 999,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: '#8b06e3ff',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              source={
                photo
                  ? { uri: photo }
                  : require('../../../assets/images/default-profile.jpg')
              }
              style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
            />
          </View>

          <Pressable
            onPress={openImagePicker}
            sx={{
              mt: 20,
              bg: '#fcfdfdff',
              py: 6,
              px: 12,
              borderRadius: 10,
              alignItems: 'center',
              margin: 4,
              borderWidth: 1,
              borderColor: '#ccc',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Upload color="#0a0a0aff" size={12} />
            <Text sx={{ color: '#0a0a0aff', fontSize: 10, fontWeight: 'bold' }}>
              Upload Photo
            </Text>
          </Pressable>

          <Text sx={{ fontSize: 16, fontWeight: 'bold', color: '#9305daff' }}>
            Shubham Sharma
          </Text>
          <Text sx={{ color: 'gray', fontSize: 14 }}>7454958596</Text>
          <Text sx={{ color: 'gray', fontSize: 13, mt: 6 }}>
            Member since Jan 2024
          </Text>

          <View
            sx={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              width: '100%',
              mt: 20,
            }}
          >
            <Stat label="Rating" value="3.8" />
            <Stat label="Rides" value="49" />
            <Stat label="Vehicle" value="bike" />
          </View>
        </View>

        <View
          sx={{
            backgroundColor: '#fff',
            borderRadius: 16,
            p: 20,
            m: 16,
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowOffset: { width: 0, height: 3 },
            shadowRadius: 6,
            elevation: 3,
            borderWidth: 1,
            borderColor: '#f2f2f2',
          }}
        >
          {/* Header */}
          <View
            sx={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 20,
            }}
          >
            <Text sx={{ fontSize: 18, fontWeight: '700', color: '#222' }}>
              Vehicle Information
            </Text>

            <View
              sx={{
                backgroundColor: '#E6F8EB',
                borderRadius: 999,
                px: 12,
                py: 4,
              }}
            >
              <Text sx={{ color: '#1F8B4C', fontWeight: '600', fontSize: 12 }}>
                Verified ✓
              </Text>
            </View>
          </View>

          {/* Row 1 */}
          <View
            sx={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              mb: 24,
              gap: 45,
            }}
          >
            <View sx={{ flex: 1, pr: 12 }}>
              <Text sx={{ color: 'gray', fontSize: 13, mb: 4 }}>Type</Text>
              <Text sx={{ color: '#111', fontWeight: '700', fontSize: 16 }}>
                Bike
              </Text>
            </View>

            <View sx={{ flex: 1, pl: 12 }}>
              <Text sx={{ color: 'gray', fontSize: 13, mb: 4 }}>Model</Text>
              <Text sx={{ color: '#111', fontWeight: '700', fontSize: 16 }}>
                N/A
              </Text>
            </View>
          </View>

          {/* Row 2 */}
          <View
            sx={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 45,
            }}
          >
            <View sx={{ flex: 1, pr: 12 }}>
              <Text sx={{ color: 'gray', fontSize: 13, mb: 4 }}>
                Registration
              </Text>
              <Text sx={{ color: '#111', fontWeight: '700', fontSize: 16 }}>
                UK123123
              </Text>
            </View>

            <View sx={{ flex: 1, pl: 12 }}>
              <Text sx={{ color: 'gray', fontSize: 13, mb: 4 }}>Color</Text>
              <Text sx={{ color: '#111', fontWeight: '700', fontSize: 16 }}>
                N/A
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={{
              backgroundColor: '#7B2CBF',
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: 'center',
              marginTop: 18,
              shadowColor: '#7B2CBF',
              shadowOpacity: 0.25,
              shadowOffset: { width: 0, height: 3 },
              shadowRadius: 5,
              elevation: 3,
            }}
          >
            <Text
              sx={{
                color: 'white',
                fontWeight: '700',
                fontSize: 15,
                letterSpacing: 0.3,
              }}
            >
              Edit Vehicle Details
            </Text>
          </TouchableOpacity>
        </View>
        <View
          sx={{
            backgroundColor: '#fff',
            borderRadius: 16,
            m: 16,
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowOffset: { width: 0, height: 3 },
            shadowRadius: 6,
            elevation: 3,
            borderWidth: 1,
            borderColor: '#f2f2f2',
          }}
        >
          <Card title="Driver Information" verified>
            <View
              sx={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                mb: 16,
                gap: 45,
              }}
            >
              <View sx={{ flex: 1, pr: 12 }}>
                <Text sx={{ color: 'gray', fontSize: 13, mb: 4 }}>
                  Full Name
                </Text>
                <Text sx={{ color: '#111', fontWeight: '700', fontSize: 16 }}>
                  Shubham Sharma
                </Text>
              </View>

              <View sx={{ flex: 1, pl: 12 }}>
                <Text sx={{ color: 'gray', fontSize: 13, mb: 4 }}>
                  Vehicle Type
                </Text>
                <Text sx={{ color: '#111', fontWeight: '700', fontSize: 16 }}>
                  Bike
                </Text>
              </View>
            </View>

            {/* Row 2 */}
            <View
              sx={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                mb: 20,
                gap: 45,
              }}
            >
              <View sx={{ flex: 1, pr: 12 }}>
                <Text sx={{ color: 'gray', fontSize: 13, mb: 4 }}>
                  License Number
                </Text>
                <Text sx={{ color: '#111', fontWeight: '700', fontSize: 16 }}>
                  UK123123123123
                </Text>
              </View>

              <View sx={{ flex: 1, pl: 12 }}>
                <Text sx={{ color: 'gray', fontSize: 13, mb: 4 }}>
                  Registration
                </Text>
                <Text sx={{ color: '#111', fontWeight: '700', fontSize: 16 }}>
                  123123123
                </Text>
              </View>
            </View>

            {/* Button */}
            <TouchableOpacity
              style={{
                backgroundColor: '#7B2CBF',
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: 'center',
                marginTop: 8,
              }}
            >
              <Text sx={{ color: 'white', fontWeight: '600', fontSize: 15 }}>
                Update Information
              </Text>
            </TouchableOpacity>
          </Card>
        </View>
        <View
          sx={{
            backgroundColor: '#fff',
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            m: 16,
            p: 20,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 8,
            elevation: 5,
            borderWidth: 1,
            borderColor: '#eee',
          }}
        >
          <Text
            sx={{
              fontSize: 18,
              color: '#333',
              fontWeight: '700',
              mb: 10,
            }}
          >
            Today's Earnings
          </Text>

          <Text
            sx={{
              fontSize: 32,
              color: '#5E17EB',
              fontWeight: '700',
              mb: 6,
            }}
          >
            ₹49.30
          </Text>

          <Text
            sx={{
              color: '#666',
              fontSize: 15,
              mb: 20,
            }}
          >
            from 49 rides completed
          </Text>

          <TouchableOpacity
            style={{
              backgroundColor: '#7B2CBF',
              borderRadius: 12,
              paddingVertical: 12,
              width: '85%',
              alignItems: 'center',
            }}
          >
            <Text sx={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
              View Detailed Earning
            </Text>
          </TouchableOpacity>
        </View>
        <View
          sx={{
            backgroundColor: '#fff',
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            m: 16,
            p: 20,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 8,
            elevation: 5,
            borderWidth: 1,
            borderColor: '#eee',
          }}
        >
          <Text
            sx={{
              fontSize: 18,
              color: '#333',
              fontWeight: '700',
              mb: 10,
            }}
          >
            Driver Reviews
          </Text>
          <Text sx={{ fontSize: 18, mb: 4 }}>⭐️⭐️⭐️⭐️☆</Text>
          <Text sx={{ mb: 12 }}>3.8 (15 reviews)</Text>
          <View
            sx={{
              flexDirection: 'row',
              justifyContent: 'space-around',
            }}
          >
            <ReviewStat label="Total Rides" value="49" />
            <ReviewStat label="Rating" value="3.8" />
            <ReviewStat label="Earnings" value="₹49.30" />
          </View>
        </View>
      </ScrollView>
    </>
  );
}

interface StatProps {
  label: string;
  value: string | number;
  color?: string;
  bg?: string;
}

const Stat = ({
  label,
  value,
  color = '#1F8B4C',
  bg = '#F8F9FA',
}: StatProps) => (
  <View
    sx={{
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: bg,
      borderRadius: 16,
      paddingX: 20,
      paddingY: 18,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: '#e6e6e6',
      minWidth: '30%',
      m: 6,
    }}
  >
    <Text
      sx={{
        fontSize: 20,
        fontWeight: '800',
        color,
        marginBottom: 4,
      }}
    >
      {value}
    </Text>
    <Text
      sx={{
        color: '#666',
        fontSize: 14,
        fontWeight: '500',
        textTransform: 'capitalize',
      }}
    >
      {label}
    </Text>
  </View>
);

const Card = ({ title, children, verified }: any) => (
  <View
    sx={{
      bg: 'white',
      m: 16,
      p: 16,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 4,
    }}
  >
    <View sx={{ flexDirection: 'row', justifyContent: 'space-between', mb: 8 }}>
      <Text sx={{ fontWeight: '700', fontSize: 16 }}>{title}</Text>
      {verified && (
        <View sx={{ bg: '#D1FADF', borderRadius: 12, px: 8, py: 2 }}>
          <Text sx={{ color: '#0A8A00', fontWeight: '600' }}>Verified</Text>
        </View>
      )}
    </View>
    {children}
  </View>
);

const ReviewStat = ({
  label,
  value,
  color = '#1F8B4C',
  bg = '#F8F9FA',
}: StatProps) => (
  <View
    sx={{
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: bg,
      borderRadius: 16,
      paddingX: 15,
      paddingY: 18,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: '#e6e6e6',
      minWidth: '30%',
      m: 6,
    }}
  >
    <Text
      sx={{
        fontSize: 20,
        fontWeight: '800',
        color,
        marginBottom: 4,
      }}
    >
      {value}
    </Text>
    <Text
      sx={{
        color: '#666',
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'capitalize',
      }}
    >
      {label}
    </Text>
  </View>
);
