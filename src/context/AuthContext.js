import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Keychain from 'react-native-keychain';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const credentials = await Keychain.getGenericPassword();
        if (credentials) {
          const storedData = JSON.parse(credentials.password);
          setUser(storedData);
          console.log(storedData);
          setUserType(storedData);
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
      const userData = { phoneNumber, userType, id };
      await Keychain.setGenericPassword('user', JSON.stringify(userData));
      setUser(userData);
    } catch (e) {
      console.error('Failed to save user data:', e);
    }
  };

  const logout = async () => {
    try {
      await Keychain.resetGenericPassword();
      setUser(null);
    } catch (e) {
      console.error('Failed to clear user data:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
