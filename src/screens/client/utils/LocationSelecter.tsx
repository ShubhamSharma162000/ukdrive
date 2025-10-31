import React, { useState, useEffect } from 'react';
import {
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  Modal,
} from 'react-native';
import Geocoder from 'react-native-geocoding';
import { Text, View } from 'dripsy';
import Geolocation from '@react-native-community/geolocation';
import { MapPin } from 'lucide-react-native';

// Initialize your API key
Geocoder.init('AIzaSyDREKZTN8iX9SoqlfOatpmw0bIDWiXHGGo');

interface LocationSelectorProps {
  // isOpen?: boolean;
  currentLocation?: string; // Current pickup/destination text
  locationType?: 'pickup' | 'destination'; // Mode of selection
  onLocationChange: (
    location: string,
    coordinates?: { lat: number; lng: number },
  ) => Promise<void> | void; // Fired when user selects a new location
  onSearchResults?: (results: any[]) => void; // Update search result list
  passengerGPS?: { lat: number; lng: number } | null; // Current GPS position
  isLiveSharing?: boolean; // Live location sharing state
  onLiveSharingToggle?: () => Promise<void> | void; // Toggle live sharing
  children?: React.ReactNode;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  // isOpen,
  currentLocation,
  locationType = 'pickup',
  onLocationChange,
  onSearchResults,
  passengerGPS,
  isLiveSharing = false,
  onLiveSharingToggle,
  // children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 🔍 Search for places using react-native-geocoding
  const searchPlaces = async (text: string) => {
    if (!text || text.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const json = await Geocoder.from(text);
      const formatted = json.results.map((item: any) => ({
        name: item.formatted_address,
        coordinates: {
          lat: item.geometry.location.lat,
          lng: item.geometry.location.lng,
        },
      }));
      setResults(formatted);
    } catch (e) {
      console.warn('Error fetching places:', e);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 📍 Use current GPS location
  const useCurrentLocation = async () => {
    setIsLoading(true);
    Geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude } = pos.coords;
        try {
          const json = await Geocoder.from({ lat: latitude, lng: longitude });
          const address = json.results[0]?.formatted_address;
          onLocationChange(address, { lat: latitude, lng: longitude });
          setIsOpen(false);
        } catch (e) {
          console.warn('Reverse geocode failed', e);
        } finally {
          setIsLoading(false);
        }
      },
      err => {
        console.warn('GPS error:', err);
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  // 🧠 Auto-use GPS if live sharing is ON
  useEffect(() => {
    if (isOpen && isLiveSharing && passengerGPS) {
      onLocationChange(`Current location`, passengerGPS);
    }
  }, [isOpen, isLiveSharing]);

  return (
    <View>
      <Pressable onPress={() => setIsOpen(true)}>
        <View
          sx={{
            backgroundColor: 'white',
            p: 4,
            m: 6,
            borderRadius: 15,
          }}
        >
          <View sx={{ flexDirection: 'row', alignItems: 'center' }}>
            <MapPin
              size={22}
              color={locationType === 'pickup' ? '#f66a0cff' : '#8B5CF6'}
              strokeWidth={2.5}
              style={{ marginLeft: 10 }}
            />
            <Text sx={{ fontWeight: 900, fontSize: 15, mb: 6, pl: 10 }}>
              {locationType === 'pickup' ? 'Pickup Location' : 'Destination'}
            </Text>
          </View>

          <View
            sx={{ flexDirection: 'row', alignItems: 'center', marginLeft: 40 }}
          >
            <Text
              sx={{
                fontWeight: 700,
                flexShrink: 1,
                color: 'gray',
              }}
            >
              {currentLocation || (locationType === 'pickup' ? 'From' : 'To')}
            </Text>
          </View>
        </View>
      </Pressable>

      <Modal visible={isOpen} animationType="slide">
        <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
          <Text sx={{ fontWeight: '600', mb: 8 }}>
            Select {locationType === 'pickup' ? 'Pickup' : 'Destination'}
          </Text>

          <TextInput
            value={query}
            onChangeText={text => {
              setQuery(text);
              searchPlaces(text);
            }}
            placeholder="Search places..."
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              padding: 8,
              marginBottom: 12,
            }}
          />

          {isLoading && <ActivityIndicator size="small" color="#333" />}

          <FlatList
            data={results}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onLocationChange(item.name, item.coordinates);
                  setIsOpen(false);
                }}
                style={{
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: '#eee',
                }}
              >
                <Text sx={{ color: 'gray800' }}>{item.name}</Text>
              </Pressable>
            )}
          />

          <Pressable
            onPress={useCurrentLocation}
            style={{
              backgroundColor: '#007bff',
              borderRadius: 8,
              padding: 10,
              marginTop: 10,
            }}
          >
            <Text
              sx={{ color: 'white', textAlign: 'center', fontWeight: '600' }}
            >
              Use Current Location
            </Text>
          </Pressable>

          <Pressable onPress={() => setIsOpen(false)} style={{ marginTop: 10 }}>
            <Text sx={{ color: 'gray700', textAlign: 'center' }}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
};
