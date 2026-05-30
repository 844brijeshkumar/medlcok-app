import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication'; // <-- IMPORT THIS
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';
import { SecurityEngine } from '../utils/securityEngine';

interface SecurityContextType {
  isAppLockEnabled: boolean;
  useCustomPin: boolean;
  useBiometrics: boolean;
  autoLockOnBackground: boolean;
  isAuthenticated: boolean;
  failedAttempts: number;
  lockoutExpiry: number | null;
  setAppLockEnabled: (v: boolean) => Promise<void>;
  setUseCustomPin: (v: boolean) => Promise<void>;
  setUseBiometrics: (v: boolean) => Promise<void>;
  setAutoLockOnBackground: (v: boolean) => Promise<void>;
  authenticateUser: () => Promise<boolean>;
  verifyPinInput: (pin: string) => Promise<boolean>;
  logOutUserSession: () => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

// Storage Keys
const LOCK_ENABLED_KEY = 'medlock_master_lock_enabled';
const PIN_TOGGLE_KEY = 'medlock_custom_pin_toggle';
const BIO_TOGGLE_KEY = 'medlock_biometric_toggle';
const AUTO_LOCK_KEY = 'medlock_auto_lock_bg';

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const [isAppLockEnabled, setAppLockEnabledState] = useState(false);
  const [useCustomPin, setUseCustomPinState] = useState(false);
  const [useBiometrics, setUseBiometricsState] = useState(false);
  const [autoLockOnBackground, setAutoLockOnBackgroundState] = useState(false);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutExpiry, setLockoutExpiry] = useState<number | null>(null);

  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    async function loadSecuritySettings() {
      try {
        const lockConfig = await AsyncStorage.getItem(LOCK_ENABLED_KEY);
        const pinConfig = await AsyncStorage.getItem(PIN_TOGGLE_KEY);
        const bioConfig = await AsyncStorage.getItem(BIO_TOGGLE_KEY);
        const autoConfig = await AsyncStorage.getItem(AUTO_LOCK_KEY);

        setAppLockEnabledState(lockConfig === 'true');
        setUseCustomPinState(pinConfig === 'true');
        setUseBiometricsState(bioConfig === 'true');
        setAutoLockOnBackgroundState(autoConfig === 'true');
      } catch (e) {
        console.error('Failed to load security settings', e);
      }
    }
    loadSecuritySettings();
  }, []);

  const setAppLockEnabled = async (v: boolean) => {
    setAppLockEnabledState(v);
    await AsyncStorage.setItem(LOCK_ENABLED_KEY, String(v));
  };

  const setUseCustomPin = async (v: boolean) => {
    setUseCustomPinState(v);
    await AsyncStorage.setItem(PIN_TOGGLE_KEY, String(v));
  };

  const setUseBiometrics = async (v: boolean) => {
    setUseBiometricsState(v);
    await AsyncStorage.setItem(BIO_TOGGLE_KEY, String(v));
  };

  const setAutoLockOnBackground = async (v: boolean) => {
    setAutoLockOnBackgroundState(v);
    await AsyncStorage.setItem(AUTO_LOCK_KEY, String(v));
  };

  useEffect(() => {
    const handleStateTransition = (nextAppState: AppStateStatus) => {
      if (appStateRef.current === 'active' && nextAppState.match(/inactive|background/)) {
        if (isAppLockEnabled && autoLockOnBackground) {
          setIsAuthenticated(false);
        }
      }
      appStateRef.current = nextAppState;
    };

    const monitoringSubscription = AppState.addEventListener('change', handleStateTransition);
    return () => monitoringSubscription.remove();
  }, [isAppLockEnabled, autoLockOnBackground]);

  useEffect(() => {
    if (lockoutExpiry) {
      const remainingTime = lockoutExpiry - Date.now();
      if (remainingTime <= 0) {
        setLockoutExpiry(null);
        setFailedAttempts(0);
        return;
      }
      const coolingTimer = setTimeout(() => {
        setLockoutExpiry(null);
        setFailedAttempts(0);
      }, remainingTime);
      return () => clearTimeout(coolingTimer);
    }
  }, [lockoutExpiry]);

  // ====================================================
  // THE FIX: Direct Expo Local Authentication
  // ====================================================
  const authenticateUser = async (): Promise<boolean> => {
    if (!isAppLockEnabled) {
      setIsAuthenticated(true);
      return true;
    }
    
    if (useBiometrics) {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        
        if (hasHardware && isEnrolled) {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Accessing encrypted clinical profile records',
            fallbackLabel: 'Use Security PIN',
            disableDeviceFallback: false,
          });

          if (result.success) {
            setIsAuthenticated(true);
            setFailedAttempts(0);
            return true;
          }
        } else {
          Alert.alert("Hardware Unavailable", "Biometric hardware is not enrolled or available on this device.");
        }
      } catch (error) {
        Alert.alert("Biometric Error", "An error occurred while launching biometrics.");
      }
    }
    return false;
  };

  const verifyPinInput = async (pin: string): Promise<boolean> => {
    if (lockoutExpiry && Date.now() < lockoutExpiry) return false;

    const absoluteSavedPin = await SecurityEngine.getPin();
    const correctPin = absoluteSavedPin || '1234'; 

    if (pin === correctPin) {
      setIsAuthenticated(true);
      setFailedAttempts(0);
      return true;
    } else {
      const nextFailedCount = failedAttempts + 1;
      setFailedAttempts(nextFailedCount);
      if (nextFailedCount >= 5) {
        setLockoutExpiry(Date.now() + 30000);
      }
      return false;
    }
  };

  const logOutUserSession = () => {
    setIsAuthenticated(false);
  };

  return (
    <SecurityContext.Provider
      value={{
        isAppLockEnabled,
        useCustomPin,
        useBiometrics,
        autoLockOnBackground,
        isAuthenticated,
        failedAttempts,
        lockoutExpiry,
        setAppLockEnabled,
        setUseCustomPin,
        setUseBiometrics,
        setAutoLockOnBackground,
        authenticateUser,
        verifyPinInput,
        logOutUserSession,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (!context) throw new Error('useSecurity must be used within a SecurityProvider');
  return context;
}