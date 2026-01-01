import React, { createContext, useState, useEffect, useContext } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  lastLoginDate: number | null;
  sessionDurationDays: number; // e.g. 7 days
  setSessionDurationDays: (days: number) => void;
  updateLastLogin: () => Promise<void>;
  signOut: () => Promise<void>;
  isSessionExpired: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  lastLoginDate: null,
  sessionDurationDays: 7,
  setSessionDurationDays: () => {},
  updateLastLogin: async () => {},
  signOut: async () => {},
  isSessionExpired: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastLoginDate, setLastLoginDate] = useState<number | null>(null);
  const [sessionDurationDays, setSessionDurationDays] = useState(7);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  // keys
  const KEY_LAST_LOGIN = 'auth_last_login_timestamp';
  const KEY_SESSION_DAYS = 'auth_session_duration_days';

  // 1. Listen for Firebase Auth State
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (loading) setLoading(false);
    });
    return subscriber; // unsubscribe on unmount
  }, []);

  // 2. Load Persisted Session Settings
  useEffect(() => {
    loadSettings();
  }, []);

  // 3. Check for Expiry whenever user or settings change
  useEffect(() => {
    if (user) {
      checkExpiry();
    } else {
        setIsSessionExpired(false);
    }
  }, [user, lastLoginDate, sessionDurationDays]);

  const loadSettings = async () => {
    try {
      const storedDate = await AsyncStorage.getItem(KEY_LAST_LOGIN);
      const storedDays = await AsyncStorage.getItem(KEY_SESSION_DAYS);

      if (storedDate) setLastLoginDate(parseInt(storedDate, 10));
      if (storedDays) setSessionDurationDays(parseInt(storedDays, 10));
    } catch (e) {
      console.error("Failed to load auth settings", e);
    }
  };

  const updateLastLogin = async () => {
    const now = Date.now();
    setLastLoginDate(now);
    setIsSessionExpired(false);
    await AsyncStorage.setItem(KEY_LAST_LOGIN, now.toString());
  };

  const setDuration = async (days: number) => {
    setSessionDurationDays(days);
    await AsyncStorage.setItem(KEY_SESSION_DAYS, days.toString());
  };

  const checkExpiry = () => {
    if (!lastLoginDate) {
        // First time users or lost state -> Assume expired/requires login
        setIsSessionExpired(true); 
        return;
    }

    const now = Date.now();
    const expiryTime = lastLoginDate + (sessionDurationDays * 24 * 60 * 60 * 1000);
    
    if (now > expiryTime) {
        console.log("Session Expired. Forcing re-login.");
        setIsSessionExpired(true);
    } else {
        setIsSessionExpired(false);
    }
  };

  const signOut = async () => {
    try {
      await auth().signOut();
      await AsyncStorage.removeItem(KEY_LAST_LOGIN); // Clear session
      setLastLoginDate(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      lastLoginDate,
      sessionDurationDays,
      setSessionDurationDays: setDuration,
      updateLastLogin,
      signOut,
      isSessionExpired
    }}>
      {children}
    </AuthContext.Provider>
  );
};
