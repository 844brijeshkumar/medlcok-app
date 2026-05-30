import { Delete, Fingerprint, Shield, Smartphone } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, Vibration, View } from 'react-native';
import { useSecurity } from '../context/SecurityContext';

export default function LockScreen() {
  const { verifyPinInput, authenticateUser, useCustomPin, useBiometrics } = useSecurity();
  const [enteredPin, setEnteredPin] = useState('');
  const [isPromptingBio, setIsPromptingBio] = useState(false);

  // THE FIX: Bulletproof Debouncer
  const triggerSafeBiometrics = async () => {
    if (isPromptingBio) return; 
    
    setIsPromptingBio(true);
    try {
      await authenticateUser();
    } finally {
      // ALWAYS unlock the button so it can be pressed again, even if the user cancels
      setTimeout(() => {
        setIsPromptingBio(false);
      }, 500);
    }
  };

  // THE FIX: Added a 300ms delay so the screen finishes loading before triggering FaceID
  useEffect(() => {
    if (useBiometrics) {
      const timer = setTimeout(() => {
        triggerSafeBiometrics();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [useBiometrics]);

  const handleKeyPress = async (num: string) => {
    const nextPin = enteredPin + num;
    if (nextPin.length <= 4) setEnteredPin(nextPin);

    if (nextPin.length === 4) {
      const success = await verifyPinInput(nextPin);
      if (!success) {
        Vibration.vibrate(200);
        setEnteredPin('');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.brandingHeader}>
        <View style={styles.logoBox}>
          <Shield size={32} color="#2a9b94" />
        </View>

        <Text style={styles.titleText}>Verification Required</Text>
        <Text style={styles.subtitleText}>
          {useCustomPin ? 'Enter your security PIN' : 'Unlock with your device credentials'}
        </Text>
      </View>

      {useCustomPin ? (
        <>
          <View style={styles.indicatorRow}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[styles.dot, enteredPin.length > i ? styles.dotFilled : styles.dotEmpty]} />
            ))}
          </View>

          <View style={styles.keypadChassis}>
            {[
              ['1', '2', '3'],
              ['4', '5', '6'],
              ['7', '8', '9'],
            ].map((row, idx) => (
              <View key={idx} style={styles.keypadRow}>
                {row.map((num) => (
                  <Pressable key={num} onPress={() => handleKeyPress(num)} style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}>
                    <Text style={styles.keyText}>{num}</Text>
                  </Pressable>
                ))}
              </View>
            ))}

            <View style={styles.keypadRow}>
              {useBiometrics ? (
                <Pressable onPress={triggerSafeBiometrics} style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}>
                  <Fingerprint size={24} color={isPromptingBio ? "#94a3b8" : "#00478d"} />
                </Pressable>
              ) : (
                <View style={[styles.key, { backgroundColor: 'transparent', borderColor: 'transparent' }]} />
              )}

              <Pressable onPress={() => handleKeyPress('0')} style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}>
                <Text style={styles.keyText}>0</Text>
              </Pressable>

              <Pressable onPress={() => setEnteredPin(enteredPin.slice(0, -1))} style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}>
                <Delete size={20} color="#475569" />
              </Pressable>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.biometricOnlyContainer}>
          <Pressable onPress={triggerSafeBiometrics} style={({ pressed }) => [styles.largeBiometricButton, pressed && styles.keyPressed]}>
            <Smartphone size={32} color={isPromptingBio ? "#94a3b8" : "#00478d"} style={{ marginBottom: 12 }} />
            <Text style={styles.biometricButtonSubText}>Tap to Use FaceID, TouchID, or Passcode</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  brandingHeader: { alignItems: 'center', marginBottom: 40, gap: 8 },
  logoBox: { width: 60, height: 60, borderRadius: 14, backgroundColor: '#f0fdfa', alignItems: 'center', justifyContent: 'center' },
  titleText: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  subtitleText: { fontSize: 12, color: '#64748b' },
  indicatorRow: { flexDirection: 'row', gap: 24, marginBottom: 48 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  dotEmpty: { borderColor: '#cbd5e1' },
  dotFilled: { borderColor: '#2a9b94', backgroundColor: '#2a9b94' },
  keypadChassis: { width: '100%', maxWidth: 260, gap: 16 },
  keypadRow: { flexDirection: 'row', justifyContent: 'space-between' },
  key: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  keyPressed: { backgroundColor: '#e2e8f0' },
  keyText: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  biometricOnlyContainer: { marginTop: 20, alignItems: 'center' },
  largeBiometricButton: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 20, paddingVertical: 32, paddingHorizontal: 40, alignItems: 'center', justifyContent: 'center' },
  biometricButtonText: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  biometricButtonSubText: { fontSize: 11, color: '#64748b' },
});