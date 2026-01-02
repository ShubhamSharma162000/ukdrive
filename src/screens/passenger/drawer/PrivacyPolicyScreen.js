import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function PrivacyPolicyScreen() {
  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={require('../../../assets/passenger-privacy-policy.html')}
        style={{ flex: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
