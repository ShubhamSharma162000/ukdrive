// import Api from '../../../api/Api';
import { Button, StyleSheet, Text, View } from 'react-native';

const PassengerLogInScreen = () => {
  const handlePress = async () => {
    // const response = await Api.get('/auth/test');
    console.log('hello');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to HomeScreen</Text>
      <Button title="Say Hello" onPress={handlePress} />
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
