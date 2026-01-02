import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'dripsy';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Star } from 'lucide-react-native';

export const RateYourRide = () => {
  const [rating, setRating] = useState<number>(0);
  const [text, setText] = useState('');
  const maxChars = 500;
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fafafa' }}
      contentContainerStyle={{ padding: 16 }}
    >
      <View sx={{ alignItems: 'center', mb: 24 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: '700',
            color: '#E56A2B',
            textAlign: 'center',
          }}
        >
          Rate Your Ride
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: '#E56A2B',
            textAlign: 'center',
            marginTop: 6,
            lineHeight: 22,
          }}
        >
          Share your experience to help improve our service
        </Text>
      </View>

      <View
        sx={{
          backgroundColor: '#fff',
          borderRadius: 12,
          p: 16,
          mb: 24,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
          elevation: 1,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: '#E56A2B',
            marginBottom: 12,
          }}
        >
          Ride Details
        </Text>

        <View sx={{ flexDirection: 'row', alignItems: 'flex-start', mb: 8 }}>
          <View
            sx={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: '#E56A2B',
              mt: 6,
              mr: 8,
            }}
          />
          <View sx={{ flex: 1 }}>
            <Text style={{ fontWeight: '600', color: '#000', marginBottom: 2 }}>
              From
            </Text>
            <Text style={{ color: '#4A4A4A' }}>
              QF46+XRF, Haridwar Rd, Padampur, Uttarakhand 246149, India
            </Text>
          </View>
        </View>

        <View sx={{ flexDirection: 'row', alignItems: 'flex-start', mb: 12 }}>
          <View
            sx={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: '#8B5CF6',
              mt: 6,
              mr: 8,
            }}
          />
          <View sx={{ flex: 1 }}>
            <Text style={{ fontWeight: '600', color: '#000', marginBottom: 2 }}>
              To
            </Text>
            <Text style={{ color: '#4A4A4A' }}>
              QF4G+3RH, Nimbuchaur – Haridwar Rd, Padampur, Nimbuchaur,
              Uttarakhand 246149, India
            </Text>
          </View>
        </View>

        <View
          style={{
            borderBottomColor: '#EAEAEA',
            borderBottomWidth: 1,
            marginVertical: 12,
          }}
        />

        <View
          sx={{ flexDirection: 'row', justifyContent: 'space-between', mb: 6 }}
        >
          <Text style={{ fontWeight: '600', color: '#000' }}>Driver</Text>
          <Text style={{ color: '#4A4A4A' }}>Driver</Text>
        </View>

        <View
          sx={{ flexDirection: 'row', justifyContent: 'space-between', mb: 6 }}
        >
          <Text style={{ fontWeight: '600', color: '#000' }}>Vehicle</Text>
          <View
            sx={{
              borderWidth: 1,
              borderColor: '#E56A2B',
              borderRadius: 8,
              px: 10,
              py: 2,
            }}
          >
            <Text style={{ color: '#E56A2B', fontWeight: '500' }}>Bike</Text>
          </View>
        </View>

        <View sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontWeight: '600', color: '#000' }}>Fare</Text>
          <Text style={{ color: '#E56A2B', fontWeight: '700' }}>₹29.00</Text>
        </View>
      </View>

      <View
        sx={{
          backgroundColor: '#fff',
          borderRadius: 12,
          p: 16,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
          elevation: 1,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: '#E56A2B',
            marginBottom: 16,
          }}
        >
          How would you rate your experience?
        </Text>

        <View sx={{ flexDirection: 'row', justifyContent: 'center', mb: 16 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <TouchableOpacity key={i} style={{ marginHorizontal: 6 }}>
              <Star
                size={32}
                color={i <= rating ? '#E56A2B' : '#D1D5DB'}
                fill={i <= rating ? '#E56A2B' : 'none'}
                strokeWidth={2}
              />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ textAlign: 'center', color: '#4A4A4A', fontSize: 15 }}>
          Click a star to rate
        </Text>
      </View>
      <View
        sx={{
          bg: 'white',
          p: 20,
          borderRadius: 16,
          my: 20,
          borderWidth: 1,
          borderColor: '#EAEAEA',
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
        }}
      >
        <Text
          sx={{ fontSize: 24, fontWeight: '700', color: '#d5652c', mb: 16 }}
        >
          Share your feedback
        </Text>

        <View
          sx={{
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 12,
            mb: 8,
            height: 130,
            p: 12,
          }}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Tell us about your experience..."
            multiline
            maxLength={maxChars}
            style={{ fontSize: 16, flex: 1 }}
          />
        </View>

        <Text sx={{ color: '#868686', textAlign: 'right', mb: 20 }}>
          {text.length}/{maxChars} characters
        </Text>
      </View>
      <Pressable
        onPress={() => console.log('Submit')}
        sx={{
          bg: '#ef7c34ff',
          py: 14,
          borderRadius: 12,
          alignItems: 'center',
          mb: 16,
        }}
      >
        <Text sx={{ fontSize: 18, fontWeight: '600', color: '#fff' }}>
          Submit Review
        </Text>
      </Pressable>

      <Pressable
        onPress={() => console.log('Skip')}
        sx={{
          borderWidth: 1,
          borderColor: '#ccc',
          py: 14,
          borderRadius: 12,
          alignItems: 'center',
        }}
      >
        <Text sx={{ fontSize: 18, fontWeight: '500', color: '#333' }}>
          Skip for Now
        </Text>
      </Pressable>
    </ScrollView>
  );
};

export default RateYourRide;
