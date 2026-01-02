import React, { useRef, useState } from 'react';
import { Animated, PanResponder } from 'react-native';
import { View, Text, Pressable } from 'dripsy';
import { ArrowRight, CheckCircle } from 'lucide-react-native';

interface SlideToConfirmProps {
  text: string;
  onConfirm: () => void;
  disabled?: boolean;
  testID?: string;
}

const SLIDER_WIDTH = 280;
const HANDLE_SIZE = 48;
const MAX_SLIDE = SLIDER_WIDTH - HANDLE_SIZE - 8;

export function SlideToConfirm({
  text,
  onConfirm,
  disabled = false,
  testID,
}: SlideToConfirmProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [confirmed, setConfirmed] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled && !confirmed,
      onMoveShouldSetPanResponder: () => !disabled && !confirmed,

      onPanResponderMove: (_, gesture) => {
        if (gesture.dx >= 0 && gesture.dx <= MAX_SLIDE) {
          translateX.setValue(gesture.dx);
        }
      },

      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > MAX_SLIDE * 0.9) {
          Animated.timing(translateX, {
            toValue: MAX_SLIDE,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            setConfirmed(true);
            onConfirm();
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <View
      testID={testID}
      sx={{
        width: SLIDER_WIDTH,
        height: 56,
        bg: '$muted',
        borderRadius: 999,
        justifyContent: 'center',
        overflow: 'hidden',
        alignSelf: 'center',
      }}
    >
      {/* Text */}
      <Text
        sx={{
          position: 'absolute',
          alignSelf: 'center',
          color: disabled ? '$textMuted' : '$text',
          fontWeight: '600',
        }}
      >
        {confirmed ? '✅ Confirmed!' : text}
      </Text>

      {/* Progress */}
      <Animated.View
        style={{
          position: 'absolute',
          height: '100%',
          width: HANDLE_SIZE,
          backgroundColor: '#22c55e',
          opacity: 0.3,
          borderRadius: 999,
          transform: [{ translateX }],
        }}
      />

      {/* Handle */}
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          width: HANDLE_SIZE,
          height: HANDLE_SIZE,
          borderRadius: 999,
          backgroundColor: confirmed ? '#22c55e' : '#fff',
          justifyContent: 'center',
          alignItems: 'center',
          transform: [{ translateX }],
          marginLeft: 4,
          elevation: 3,
        }}
      >
        {confirmed ? (
          <CheckCircle size={22} color="white" />
        ) : (
          <ArrowRight size={22} color="#4b5563" />
        )}
      </Animated.View>
    </View>
  );
}
