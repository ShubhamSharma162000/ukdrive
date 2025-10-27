import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [userType, setUserType] = useState(null);
  const [id, setId] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // const storedPhone = await SecureStore.getItemAsync('userPhone');
        // const storedUserType = await SecureStore.getItemAsync('userType');
        const storedPhone = await AsyncStorage.getItem('phoneNumber');
        const storedUserType = await SAsyncStorage.getItem('userType');
        if (storedPhone && storedUserType) {
          setPhoneNumber(storedPhone);
          setUserType(storedUserType);
          setUser(true);
        }
      } catch (e) {
        console.error('Failed to load user data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, []);

  const login = async (phoneNumber, userType, id) => {
    try {
      setPhoneNumber(phoneNumber);
      setUserType(userType);
      setUser({ phoneNumber, userType, id });
      setId(id);
      console.log(phoneNumber, userType, id);
      console.log('drivers login ');
    } catch (e) {
      console.error('Failed to save user data:', e);
    }
  };

  const logout = async () => {
    try {
      //   await SecureStore.deleteItemAsync('userPhone');
      //   await SecureStore.deleteItemAsync('userType');
      setPhoneNumber(null);
      setUserType(null);
      setUser(null);
    } catch (e) {
      console.error('Failed to clear user data:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, phoneNumber, userType, id, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
