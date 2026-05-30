import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Vibration } from 'react-native';
import { Shield, Delete, Info } from 'lucide-react-native';
import { useSecurity } from '../context/SecurityContext';

export default function LockScreenOverlay() {
  const { isAppLockEnabled, isAuthenticated, verifyPinInput, lockoutExpiry, authenticateUser } = useSecurity();
  const [enteredPin, setEnteredPin] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Automatically triggers biometric validation options on launch
  useEffect(() => {
    if (isAppLockEnabled && !isAuthenticated) {
      authenticateUser();
    }
  }, [isAuthenticated, isAppLockEnabled]);

  // Manages the UI lock countdown timer state updates
  useEffect(() => {
    if (lockoutExpiry) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((lockoutExpiry - Date.now()) / 1000));
        setCountdown(remaining);
        if (remaining === 0) clearInterval(interval);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutExpiry]);

  if (!isAppLockEnabled || isAuthenticated) return null;

  const handleKeyPress = async (num: string) => {
    if (lockoutExpiry) return;
    const updatedPin = enteredPin + num;
    if (updatedPin.length <= 4) {
      setEnteredPin(updatedPin);
    }
    if (updatedPin.length === 4) {
      const isCorrect = await verifyPinInput(updatedPin);
      if (!isCorrect) {
        Vibration.vibrate(Platform.OS === 'ios' ? [0, 50, 100, 50] : 400);
        setEnteredPin('');
      }
    }
  };

  const handleBackspace = () => {
    setEnteredPin(enteredPin.slice(0, -1));
  };

  return (
    <View style={styles.fullscreenBarrier}>
      <View style={styles.brandingHeaderContainer}>
        <View style={styles.shieldIconFrame}>
          <Shield size={32} color="#2a9b94" />
        </View>
        <Text style={styles.brandTitleText}>MEDLOCK SECURE</Text>
        <Text style={styles.brandSubtitleText}>Encrypted Medical Records Vault</Text>
      </View>

      {/* PIN entry indicator circles */}
      <View style={styles.indicatorRow}>
        {[0, 1, 2, 3].map((idx) => (
          <View
            key={idx}
            style={[
              styles.indicatorCircle,
              enteredPin.length > idx ? styles.indicatorFilled : styles.indicatorEmpty,
            ]}
          />
        ))}
      </View>

      {/* Error or lock notice banner */}
      {lockoutExpiry ? (
        <View style={styles.alertNoticeContainer}>
          <Info size={14} color="#dc2626" style={{ marginRight: 6 }} />
          <Text style={styles.alertNoticeText}>Brute force lockout active. Retry in {countdown}s</Text>
        </View>
      ) : (
        <Text style={styles.pinEntryPromptText}>Enter security credentials to open application console</Text>
      )}

      {/* Full Core 3x4 Matrix Keypad Layout */}
      <View style={styles.keypadChassisGrid}>
        {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']].map((row, rIdx) => (
          <View key={rIdx} style={styles.keypadRow}>
            {row.map((num) => (
              <Pressable
                key={num}
                disabled={!!lockoutExpiry}
                onPress={() => handleKeyPress(num)}
                style={({ pressed }) => [styles.keyButton, pressed && styles.keyPressed]}
              >
                <Text style={styles.keyButtonText}>{num}</Text>
              </Pressable>
            ))}
          </View>
        ))}
        
        {/* Special Character System Row */}
        <View style={styles.keypadRow}>
          <Pressable onPress={authenticateUser} style={styles.keyButton}>
            <Text style={styles.auxiliaryKeyText}>BIO</Text>
          </Pressable>
          <Pressable
            disabled={!!lockoutExpiry}
            onPress={() => handleKeyPress('0')}
            style={({ pressed }) => [styles.keyButton, pressed && styles.keyPressed]}
          >
            <Text style={styles.keyButtonText}>0</Text>
          </Pressable>
          <Pressable onPress={handleBackspace} style={styles.keyButton}>
            <Delete size={22} color="#1e293b" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreenBarrier: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  brandingHeaderContainer: {
    alignItems: 'center',
    marginBottom: 40,
    gap: 8,
  },
  shieldIconFrame: {
    width: 64,
    height: 64,
    backgroundColor: '#f0fdfa',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccfbf1',
  },
  brandTitleText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#0f172a',
  },
  brandSubtitleText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  indicatorRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
    justifyContent: 'center',
  },
  indicatorCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  indicatorEmpty: {
    borderColor: '#cbd5e1',
    backgroundColor: 'transparent',
  },
  indicatorFilled: {
    borderColor: '#2a9b94',
    backgroundColor: '#2a9b94',
  },
  pinEntryPromptText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 32,
  },
  alertNoticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 40,
  },
  alertNoticeText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '700',
  },
  keypadChassisGrid: {
    width: '100%',
    maxWidth: 280,
    gap: 16,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  keyButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  keyPressed: {
    backgroundColor: '#cbd5e1',
  },
  keyButtonText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  auxiliaryKeyText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2a9b94',
  },
});