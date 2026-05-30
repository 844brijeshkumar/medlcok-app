import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

import {
  AppState,
  Platform,
} from 'react-native';

// ======================================================
// TYPES
// ======================================================

interface AppContextType {
  isSplashComplete: boolean;
  userToken: string | null;
  isAppLockEnabled: boolean;
  isUnlocked: boolean;
  isLoading: boolean;

  isBiometricEnabled: boolean;
  isFaceIdEnabled: boolean;
  isFingerprintEnabled: boolean;
  isDeviceLockEnabled: boolean;
  autoLockEnabled: boolean;

  setSplashComplete: (v: boolean) => void;

  login: (token: string) => Promise<void>;

  logout: () => Promise<void>;

  verifyPin: (
    pin: string
  ) => Promise<boolean>;

  setAppLock: (
    enabled: boolean
  ) => Promise<void>;

  triggerBiometrics: () => Promise<boolean>;

  savePin: (
    pin: string
  ) => Promise<void>;

  changePin: (
    pin: string
  ) => Promise<void>;

  resetPin: () => Promise<void>;

  setBiometricEnabled: (
    enabled: boolean
  ) => Promise<void>;

  setFaceIdEnabled: (
    enabled: boolean
  ) => Promise<void>;

  setFingerprintEnabled: (
    enabled: boolean
  ) => Promise<void>;

  setDeviceLockEnabled: (
    enabled: boolean
  ) => Promise<void>;

  setAutoLockEnabled: (
    enabled: boolean
  ) => Promise<void>;

  lockApp: () => void;
}

// ======================================================
// CONTEXT
// ======================================================

const AppContext =
  createContext<AppContextType | undefined>(
    undefined
  );

// ======================================================
// STORAGE KEYS
// ======================================================

const TOKEN_KEY =
  'medlock_user_token';

const LOCK_ENABLED_KEY =
  'medlock_lock_enabled';

const PIN_KEY =
  'medlock_secure_pin';

const BIOMETRIC_KEY =
  'medlock_biometric_enabled';

const FACE_ID_KEY =
  'medlock_faceid_enabled';

const FINGERPRINT_KEY =
  'medlock_fingerprint_enabled';

const DEVICE_LOCK_KEY =
  'medlock_device_lock_enabled';

const AUTO_LOCK_KEY =
  'medlock_auto_lock_enabled';

// ======================================================
// SECURE STORAGE HELPERS
// ======================================================

const secureGetItem = async (
  key: string
) => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }

    return await SecureStore.getItemAsync(
      key
    );
  } catch (error) {
    console.log(
      'Secure get error',
      error
    );

    return null;
  }
};

const secureSetItem = async (
  key: string,
  value: string
) => {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(
        key,
        value
      );

      return;
    }

    await SecureStore.setItemAsync(
      key,
      value
    );
  } catch (error) {
    console.log(
      'Secure set error',
      error
    );
  }
};

const secureDeleteItem =
  async (key: string) => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);

        return;
      }

      await SecureStore.deleteItemAsync(
        key
      );
    } catch (error) {
      console.log(
        'Secure delete error',
        error
      );
    }
  };

// ======================================================
// PROVIDER
// ======================================================

export function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // ====================================================
  // CORE STATES
  // ====================================================

  const [
    isSplashComplete,
    setSplashComplete,
  ] = useState(false);

  const [userToken, setUserToken] =
    useState<string | null>(null);

  // CHANGED TO FALSE BY DEFAULT
  const [
    isAppLockEnabled,
    setAppLockEnabled,
  ] = useState(false); 

  const [isUnlocked, setIsUnlocked] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  // ====================================================
  // SECURITY STATES (CHANGED TO FALSE BY DEFAULT)
  // ====================================================

  const [
    isBiometricEnabled,
    setBiometricState,
  ] = useState(false);

  const [
    isFaceIdEnabled,
    setFaceIdState,
  ] = useState(false);

  const [
    isFingerprintEnabled,
    setFingerprintState,
  ] = useState(false);

  const [
    isDeviceLockEnabled,
    setDeviceLockState,
  ] = useState(false);

  const [
    autoLockEnabled,
    setAutoLockState,
  ] = useState(false);

  // ====================================================
  // SECURITY TRACKING
  // ====================================================

  const [
    failedAttempts,
    setFailedAttempts,
  ] = useState(0);

  const [
    isTemporarilyLocked,
    setIsTemporarilyLocked,
  ] = useState(false);

  // ====================================================
  // AUTO LOCK
  // ====================================================

  useEffect(() => {
    const subscription =
      AppState.addEventListener(
        'change',
        async (state) => {
          if (
            state === 'background' &&
            autoLockEnabled &&
            isAppLockEnabled
          ) {
            setIsUnlocked(false);
          }
        }
      );

    return () => {
      subscription.remove();
    };
  }, [
    autoLockEnabled,
    isAppLockEnabled,
  ]);

  // ====================================================
  // INITIALIZE
  // ====================================================

  useEffect(() => {
    async function initializeSystemData() {
      try {
        const token =
          await secureGetItem(
            TOKEN_KEY
          );

        setUserToken(token);

        const lockConfig =
          await AsyncStorage.getItem(
            LOCK_ENABLED_KEY
          );

        const biometricConfig =
          await AsyncStorage.getItem(
            BIOMETRIC_KEY
          );

        const faceIdConfig =
          await AsyncStorage.getItem(
            FACE_ID_KEY
          );

        const fingerprintConfig =
          await AsyncStorage.getItem(
            FINGERPRINT_KEY
          );

        const deviceLockConfig =
          await AsyncStorage.getItem(
            DEVICE_LOCK_KEY
          );

        const autoLockConfig =
          await AsyncStorage.getItem(
            AUTO_LOCK_KEY
          );

        // MODIFIED TO ONLY ACTIVATE IF EXPLICITLY SET TO 'true'
        setAppLockEnabled(
          lockConfig === 'true'
        );

        setBiometricState(
          biometricConfig === 'true'
        );

        setFaceIdState(
          faceIdConfig === 'true'
        );

        setFingerprintState(
          fingerprintConfig === 'true'
        );

        setDeviceLockState(
          deviceLockConfig === 'true'
        );

        setAutoLockState(
          autoLockConfig === 'true'
        );
      } catch (e) {
        console.error(
          'Security initialization failure',
          e
        );
      } finally {
        setIsLoading(false);
      }
    }

    initializeSystemData();
  }, []);

  // ====================================================
  // LOGIN
  // ====================================================

  const login = async (
    token: string
  ) => {
    await secureSetItem(
      TOKEN_KEY,
      token
    );

    setUserToken(token);

    // Bypass the lock screen immediately after a fresh login
    setIsUnlocked(true); 
  };

  // ====================================================
  // LOGOUT
  // ====================================================

  const logout = async () => {
    await secureDeleteItem(
      TOKEN_KEY
    );

    setUserToken(null);
    setIsUnlocked(false);
  };

  // ====================================================
  // SAVE PIN
  // ====================================================

  const savePin = async (
    pin: string
  ) => {
    await secureSetItem(
      PIN_KEY,
      pin
    );
  };

  const changePin = async (
    pin: string
  ) => {
    await secureSetItem(
      PIN_KEY,
      pin
    );
  };

  const resetPin = async () => {
    await secureDeleteItem(
      PIN_KEY
    );
  };

  // ====================================================
  // VERIFY PIN
  // ====================================================

  const verifyPin = async (
    pin: string
  ): Promise<boolean> => {
    if (isTemporarilyLocked) {
      return false;
    }

    const storedPin =
      await secureGetItem(
        PIN_KEY
      );

    const correctPin =
      storedPin || '1234';

    if (pin === correctPin) {
      setFailedAttempts(0);

      setIsUnlocked(true);

      return true;
    }

    const attempts =
      failedAttempts + 1;

    setFailedAttempts(attempts);

    if (attempts >= 5) {
      setIsTemporarilyLocked(true);

      setTimeout(() => {
        setIsTemporarilyLocked(false);
        setFailedAttempts(0);
      }, 30000);
    }

    return false;
  };

  // ====================================================
  // APP LOCK
  // ====================================================

  const setAppLock = async (
    enabled: boolean
  ) => {
    await AsyncStorage.setItem(
      LOCK_ENABLED_KEY,
      String(enabled)
    );

    setAppLockEnabled(enabled);
  };

  // ====================================================
  // BIOMETRICS
  // ====================================================

  const triggerBiometrics =
    async (): Promise<boolean> => {
      try {
        if (
          Platform.OS === 'web'
        ) {
          return false;
        }

        const hasHardware =
          await LocalAuthentication.hasHardwareAsync();

        const isEnrolled =
          await LocalAuthentication.isEnrolledAsync();

        if (
          !hasHardware ||
          !isEnrolled
        ) {
          return false;
        }

        const result =
          await LocalAuthentication.authenticateAsync(
            {
              promptMessage:
                'Authenticate to access Medlock',

              fallbackLabel:
                'Use Security PIN',

              disableDeviceFallback:
                false,
            }
          );

        if (result.success) {
          setIsUnlocked(true);

          return true;
        }

        return false;
      } catch (error) {
        console.error(
          'Biometric auth error',
          error
        );

        return false;
      }
    };

  // ====================================================
  // LOCK APP
  // ====================================================

  const lockApp = () => {
    setIsUnlocked(false);
  };

  // ====================================================
  // SECURITY SETTERS
  // ====================================================

  const setBiometricEnabled =
    async (enabled: boolean) => {
      await AsyncStorage.setItem(
        BIOMETRIC_KEY,
        String(enabled)
      );

      setBiometricState(enabled);
    };

  const setFaceIdEnabled =
    async (enabled: boolean) => {
      await AsyncStorage.setItem(
        FACE_ID_KEY,
        String(enabled)
      );

      setFaceIdState(enabled);
    };

  const setFingerprintEnabled =
    async (enabled: boolean) => {
      await AsyncStorage.setItem(
        FINGERPRINT_KEY,
        String(enabled)
      );

      setFingerprintState(enabled);
    };

  const setDeviceLockEnabled =
    async (enabled: boolean) => {
      await AsyncStorage.setItem(
        DEVICE_LOCK_KEY,
        String(enabled)
      );

      setDeviceLockState(enabled);
    };

  const setAutoLockEnabled =
    async (enabled: boolean) => {
      await AsyncStorage.setItem(
        AUTO_LOCK_KEY,
        String(enabled)
      );

      setAutoLockState(enabled);
    };

  // ====================================================
  // PROVIDER
  // ====================================================

  return (
    <AppContext.Provider
      value={{
        isSplashComplete,
        userToken,
        isAppLockEnabled,
        isUnlocked,
        isLoading,

        isBiometricEnabled,
        isFaceIdEnabled,
        isFingerprintEnabled,
        isDeviceLockEnabled,
        autoLockEnabled,

        setSplashComplete,

        login,
        logout,

        verifyPin,

        setAppLock,

        triggerBiometrics,

        savePin,
        changePin,
        resetPin,

        setBiometricEnabled,
        setFaceIdEnabled,
        setFingerprintEnabled,
        setDeviceLockEnabled,
        setAutoLockEnabled,

        lockApp,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ======================================================
// HOOK
// ======================================================

export function useApp() {
  const context =
    useContext(AppContext);

  if (!context) {
    throw new Error(
      'useApp must be used inside AppProvider'
    );
  }

  return context;
}