import { createContext, useContext, useEffect, useState } from 'react';
import * as Keychain from 'react-native-keychain';

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
        const credentials = await Keychain.getGenericPassword();
        console.log(credentials);
        const storedData = JSON.parse(credentials.password);
        console.log(storedData);
        const storedPhone = storedData.phoneNumber;
        console.log(storedPhone);
        const storedUserType = storedData.userType;
        console.log(storedUserType);
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
    } catch (e) {
      console.error('Failed to save user data:', e);
    }
  };

  const logout = async () => {
    try {
      await Keychain.resetGenericPassword();
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
