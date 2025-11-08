import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { Menu } from 'lucide-react-native';

export const DriverHamburgerButton = () => {
  const navigation = useNavigation();

  const openPassengerDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <TouchableOpacity
      onPress={openPassengerDrawer}
      style={{
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#aa0ff8ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
    >
      <Menu size={28} color="#fff" />
    </TouchableOpacity>
  );
};
