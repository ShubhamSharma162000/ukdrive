import { Text, View, Pressable, useDripsyTheme } from 'dripsy';
import React, { useRef, useState } from 'react';
import { Animated, Easing, StatusBar } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PassengerHamburgerButton } from '../../../helper/PassengerHamburgerButton.js';
import { Icon } from 'react-native-paper';
import { IconButton } from 'react-native-paper';

const ClientHomeScreen = () => {
  const { theme } = useDripsyTheme();
  const [expanded, setExpanded] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    Animated.timing(animation, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
    setExpanded(!expanded);
  };

  const heightInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 130],
  });

  const rotateInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <SafeAreaProvider>
        <View sx={{ flex: 1 }}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            initialRegion={{
              latitude: 28.6139,
              longitude: 77.209,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            <Marker
              coordinate={{ latitude: 28.6139, longitude: 77.209 }}
              title="New Delhi"
              description="Capital of India"
            />
          </MapView>
          <View
            sx={{
              backgroundColor: '#fa8233ff',
              position: 'absolute',
              bottom: 40,
              left: 0,
              right: 0,
              p: 12,
              m: 10,
              borderRadius: 'xl',
            }}
          >
            <Pressable
              onPress={toggleExpand}
              sx={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                bg: 'primary',
                borderRadius: 12,
                // px: 20,
                // py: 14,
              }}
            >
              {expanded ? (
                <IconButton icon="arrow-right" size={24} iconColor="white" />
              ) : (
                <IconButton icon="arrow-right" size={24} iconColor="white" />
              )}
              <Text
                sx={{
                  color: 'white',
                  fontSize: 18,
                  fontWeight: '600',
                }}
              >
                {expanded ? 'Pickup Location' : 'Where are you going ?'}
              </Text>
              {!expanded && (
                <IconButton icon="arrow-right" size={24} iconColor="white" />
              )}
              <Animated.View
                style={{ transform: [{ rotate: rotateInterpolate }] }}
              ></Animated.View>
            </Pressable>

            <Animated.View
              style={{
                height: heightInterpolate,
                overflow: 'hidden',
                opacity: animation,
              }}
            >
              <View
                sx={{
                  bg: 'white',
                  borderRadius: 'xl',
                  mt: 12,
                  p: 16,
                }}
              >
                <Text sx={{ fontWeight: '700', fontSize: 16, color: 'text' }}>
                  Extra Information
                </Text>
                <Text sx={{ mt: 6, color: 'secondary', fontSize: 14 }}>
                  This card appears when you tap the arrow. You can add ride
                  details, driver info, or any expandable content here.
                </Text>
              </View>
            </Animated.View>
          </View>
          <View style={{ position: 'absolute', top: 60, left: 10 }}>
            <PassengerHamburgerButton />
          </View>
        </View>
      </SafeAreaProvider>
    </>
  );
};

export default ClientHomeScreen;
