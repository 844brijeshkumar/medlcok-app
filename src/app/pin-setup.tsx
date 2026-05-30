import { useRouter } from 'expo-router';
import { ArrowLeft, Delete, ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSecurity } from '../context/SecurityContext'; // Added context
import { SecurityEngine } from '../utils/securityEngine';

export default function PinSetupScreen() {
  const router = useRouter();
  const { setUseCustomPin } = useSecurity(); // Pull in the state setter

  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [firstPin, setFirstPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const activePinString = step === 'create' ? firstPin : confirmPin;

  const handleKeyPress = async (num: string) => {
    const updated = activePinString + num;
    if (updated.length > 4) return;

    if (step === 'create') {
      setFirstPin(updated);
      if (updated.length === 4) {
        setStep('confirm');
      }
    } else {
      setConfirmPin(updated);
      if (updated.length === 4) {
        if (firstPin === updated) {
          
          // 1. Save it to device storage
          await SecurityEngine.savePin(updated); 
          
          // 2. Enable it in the global state (Flips the switch to ON)
          setUseCustomPin(true); 

          Alert.alert('PIN Configuration Saved', 'Your 4-digit custom entry lock PIN is now cryptographically linked.', [
            { text: 'Complete Workspace', onPress: () => router.back() }
          ]);
        } else {
          Alert.alert('Verification Match Mismatch', 'The PINs you typed do not match. Please restart the registration step.');
          setFirstPin('');
          setConfirmPin('');
          setStep('create');
        }
      }
    }
  };

  const handleBackspace = () => {
    if (step === 'create') {
      setFirstPin(firstPin.slice(0, -1));
    } else {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  return (
    <View style={styles.masterWrapperContainer}>
      <Pressable onPress={() => router.back()} style={styles.backButtonActionHeader}>
        <ArrowLeft size={20} color="#475569" />
        <Text style={styles.backButtonTextLabel}>Return</Text>
      </Pressable>

      <View style={styles.brandingHeaderContainer}>
        <View style={styles.iconCircleWidget}>
          <ShieldCheck size={32} color="#00478d" />
        </View>
        <Text style={styles.screenHeadingTitle}>
          {step === 'create' ? 'Establish Application PIN' : 'Verify Operational PIN'}
        </Text>
        <Text style={styles.screenHeadingSubtitle}>
          {step === 'create' 
            ? 'Set a custom access pin passcode to secure clinical record lookups' 
            : 'Type the identical four digit compilation key sequence code to verify'}
        </Text>
      </View>

      {/* Graphical Indicators Row */}
      <View style={styles.indicatorRow}>
        {[0, 1, 2, 3].map((idx) => (
          <View
            key={idx}
            style={[
              styles.indicatorCircle,
              activePinString.length > idx ? styles.indicatorFilled : styles.indicatorEmpty,
            ]}
          />
        ))}
      </View>

      {/* Numeric Matrix Board Keypad Panel */}
      <View style={styles.keypadChassisGrid}>
        {[
          ['1', '2', '3'],
          ['4', '5', '6'],
          ['7', '8', '9']
        ].map((row, rIdx) => (
          <View key={rIdx} style={styles.keypadRow}>
            {row.map((num) => (
              <Pressable
                key={num}
                onPress={() => handleKeyPress(num)}
                style={({ pressed }) => [styles.keyButton, pressed && styles.keyPressed]}
              >
                <Text style={styles.keyButtonText}>{num}</Text>
              </Pressable>
            ))}
          </View>
        ))}
        <View style={styles.keypadRow}>
          <View style={[styles.keyButton, { backgroundColor: 'transparent', borderColor: 'transparent' }]} />
          <Pressable
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

// Keep your exact StyleSheet here

const styles = StyleSheet.create({
  masterWrapperContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backButtonActionHeader: {
    position: 'absolute',
    top: 60,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backButtonTextLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  brandingHeaderContainer: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 10,
  },
  iconCircleWidget: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenHeadingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  screenHeadingSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 18,
  },
  indicatorRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 48,
  },
  indicatorCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  indicatorEmpty: {
    borderColor: '#cbd5e1',
    backgroundColor: 'transparent',
  },
  indicatorFilled: {
    borderColor: '#00478d',
    backgroundColor: '#00478d',
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
});