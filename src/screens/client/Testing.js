import React from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';

const Testing = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>👋 Hello World from React Native CLI!</Text>
    </SafeAreaView>
  );
};

export default Testing;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
});
