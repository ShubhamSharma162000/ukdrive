import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Image } from 'dripsy';
import { TouchableOpacity } from 'react-native';

export const PassengerHamburgerButton = () => {
  const navigation = useNavigation();

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };
  return (
    <TouchableOpacity
      style={{ position: 'absolute', zIndex: 100 }}
      onPress={openDrawer}
    >
      <Image
        source={require('../assets/icons/passengerHamBurger.png')}
        style={{ width: 28, height: 28 }}
      />
    </TouchableOpacity>
  );
};
