import { Bell, Car, Home } from 'lucide-react-native';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { PassengerHamburgerButton } from '../../helper/PassengerHamburgerButton';
import { DriverHamburgerButton } from '../../helper/DriverHamburgerButton';

const PassengerLogInScreen = () => {
  const handlePress = async () => {
    console.log('hello');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to HomeScreen ff</Text>
      <Button title="Say Hello" onPress={handlePress} />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Icon name="home" size={60} color="#ff6600" />
        <Home size={40} color="blue" />
        <Car size={40} color="green" />
        <Bell size={40} color="red" />
      </View>
      <View
        style={{
          position: 'absolute',
          top: 60,
          left: 10,
          zIndex: 9999,
          elevation: 10,
        }}
      >
        <DriverHamburgerButton />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
});

export default PassengerLogInScreen;
