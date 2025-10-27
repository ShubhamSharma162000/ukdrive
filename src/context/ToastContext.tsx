import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Animated, Dimensions, Easing } from 'react-native';
import { View, Text } from 'dripsy';

type ToastType = 'success' | 'error' | 'info';

type ToastContextType = {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
};

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

type Props = { children: ReactNode };

export const ToastProvider = ({ children }: Props) => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('info');
  const [visible, setVisible] = useState(false);

  // Always define hooks at the top
  const slideAnim = useState(new Animated.Value(-150))[0];
  const opacityAnim = useState(new Animated.Value(0))[0];
  const { width } = Dimensions.get('window');

  const showToast = (
    msg: string,
    toastType: ToastType = 'info',
    duration = 3000,
  ) => {
    setMessage(msg);
    setType(toastType);
    setVisible(true);

    // Animate in
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -150,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => setVisible(false));
    }, duration);
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return '#4BB543';
      case 'error':
        return '#FF4C4C';
      default:
        return '#6C63FF';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {visible && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            width,
            transform: [{ translateY: slideAnim }],
            opacity: opacityAnim,
            zIndex: 1000,
          }}
        >
          <View
            sx={{
              backgroundColor: 'white',
              borderTopWidth: 6,
              borderTopColor: getBorderColor(),
              height: 120,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              sx={{
                color: 'black',
                fontSize: 18,
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              {message}
            </Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};
