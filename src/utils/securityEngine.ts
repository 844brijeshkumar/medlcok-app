import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

import { Platform } from 'react-native';

// ======================================================
// STORAGE KEY
// ======================================================

const PIN_VAULT_KEY =
  'medlock_user_secure_pin';

// ======================================================
// CROSS PLATFORM SECURE HELPERS
// ======================================================

const secureSetItem = async (
  key: string,
  value: string
): Promise<void> => {
  try {
    // ==============================
    // WEB STORAGE
    // ==============================

    if (Platform.OS === 'web') {
      localStorage.setItem(
        key,
        value
      );

      return;
    }

    // ==============================
    // MOBILE SECURE STORAGE
    // ==============================

    await SecureStore.setItemAsync(
      key,
      value,
      {
        keychainAccessible:
          SecureStore.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
      }
    );
  } catch (error) {
    console.error(
      'Secure storage write error',
      error
    );

    throw error;
  }
};

const secureGetItem = async (
  key: string
): Promise<string | null> => {
  try {
    // ==============================
    // WEB STORAGE
    // ==============================

    if (Platform.OS === 'web') {
      return localStorage.getItem(
        key
      );
    }

    // ==============================
    // MOBILE SECURE STORAGE
    // ==============================

    return await SecureStore.getItemAsync(
      key
    );
  } catch (error) {
    console.error(
      'Secure storage read error',
      error
    );

    return null;
  }
};

const secureDeleteItem =
  async (
    key: string
  ): Promise<void> => {
    try {
      // ============================
      // WEB STORAGE
      // ============================

      if (Platform.OS === 'web') {
        localStorage.removeItem(
          key
        );

        return;
      }

      // ============================
      // MOBILE SECURE STORAGE
      // ============================

      await SecureStore.deleteItemAsync(
        key
      );
    } catch (error) {
      console.error(
        'Secure storage delete error',
        error
      );

      throw error;
    }
  };

// ======================================================
// SECURITY ENGINE
// ======================================================

export const SecurityEngine = {
  // ====================================================
  // SAVE PIN
  // ====================================================

  async savePin(
    pin: string
  ): Promise<void> {
    if (pin.length !== 4) {
      throw new Error(
        'PIN must be exactly 4 digits'
      );
    }

    await secureSetItem(
      PIN_VAULT_KEY,
      pin
    );
  },

  // ====================================================
  // GET PIN
  // ====================================================

  async getPin(): Promise<string | null> {
    return await secureGetItem(
      PIN_VAULT_KEY
    );
  },

  // ====================================================
  // DELETE PIN
  // ====================================================

  async deletePin(): Promise<void> {
    await secureDeleteItem(
      PIN_VAULT_KEY
    );
  },

  // ====================================================
  // BIOMETRIC SUPPORT
  // ====================================================

  async getBiometricHardwareSupport() {
    try {
      // ============================
      // WEB DOES NOT SUPPORT
      // ============================

      if (Platform.OS === 'web') {
        return {
          canAuthenticate: false,

          supportsFingerprint:
            false,

          supportsFaceId: false,
        };
      }

      // ============================
      // MOBILE CHECKS
      // ============================

      const hasHardware =
        await LocalAuthentication.hasHardwareAsync();

      const isEnrolled =
        await LocalAuthentication.isEnrolledAsync();

      const supportedTypes =
        await LocalAuthentication.supportedAuthenticationTypesAsync();

      return {
        canAuthenticate:
          hasHardware &&
          isEnrolled,

        supportsFingerprint:
          supportedTypes.includes(
            LocalAuthentication.AuthenticationType
              .FINGERPRINT
          ),

        supportsFaceId:
          supportedTypes.includes(
            LocalAuthentication.AuthenticationType
              .FACIAL_RECOGNITION
          ),
      };
    } catch (error) {
      console.error(
        'Biometric support error',
        error
      );

      return {
        canAuthenticate: false,

        supportsFingerprint:
          false,

        supportsFaceId: false,
      };
    }
  },

  // ====================================================
  // BIOMETRIC AUTH
  // ====================================================

  async triggerBiometricPrompt(
    promptMessage: string
  ): Promise<boolean> {
    try {
      // ============================
      // WEB FALLBACK
      // ============================

      if (Platform.OS === 'web') {
        return false;
      }

      // ============================
      // AUTH PROMPT
      // ============================

      const result =
        await LocalAuthentication.authenticateAsync(
          {
            promptMessage,

            fallbackLabel:
              'Use System Passcode',

            disableDeviceFallback:
              false,

            cancelLabel: 'Cancel',
          }
        );

      return result.success;
    } catch (error) {
      console.error(
        'Biometric auth error',
        error
      );

      return false;
    }
  },
};

// ======================================================
// DEFAULT EXPORT
// ======================================================

export default SecurityEngine;