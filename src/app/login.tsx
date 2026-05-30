import { Lock, Mail, Shield } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useApp } from '../context/AppContext';

export default function Login() {
  const { login } = useApp();
  
  // Minimal state requirements
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    // 1. Client-Side Validation (Saves a useless trip to the server)
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter both email and password.');
      return;
    }

    setIsLoggingIn(true);

    try {
      // ==========================================
      // BACKEND CONNECTION READY (Thin Client Logic)
      // ==========================================
      /*
      const response = await fetch('http://YOUR_SERVER_IP:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      
      if (data.success) {
        await login(data.token);
      } else {
        Alert.alert('Access Denied', data.message);
      }
      */

      // --- TEMPORARY MOCK DELAY (Remove when connecting backend) ---
      setTimeout(async () => {
        if (email === 'doctor@medlock.com' && password === 'password123') {
          await login('secure_mock_token_123'); // Triggers AppContext to unlock the app
        } else {
          Alert.alert('Access Denied', 'Invalid credentials. Use doctor@medlock.com / password123');
        }
        setIsLoggingIn(false);
      }, 1200);

    } catch (error) {
      Alert.alert('Network Error', 'Could not connect to the Medlock servers.');
      setIsLoggingIn(false);
    }
  };

  return (
    <View style={styles.loginContainer}>
      
      {/* Branding Header */}
      <View style={styles.brandingHeader}>
        <View style={styles.logoBox}>
          <Shield size={32} color="#00478d" />
        </View>
        <Text style={styles.titleText}>Welcome to Medlock</Text>
        <Text style={styles.subtitleText}>
          Authorized clinical healthcare terminal access portal
        </Text>
      </View>

      {/* Login Form Chassis */}
      <View style={styles.formCard}>
        
        {/* Email Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Account Email</Text>
          <View style={styles.inputRow}>
            <Mail size={18} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="doctor@medlock.com"
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoggingIn} // Locks input while fetching
            />
          </View>
        </View>

        {/* Password Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputRow}>
            <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              editable={!isLoggingIn} // Locks input while fetching
            />
          </View>
        </View>

        {/* Action Button */}
        <Pressable
          onPress={handleLogin}
          disabled={isLoggingIn}
          style={({ pressed }) => [
            styles.submitButton,
            (pressed || isLoggingIn) && styles.submitButtonDisabled,
          ]}
        >
          {isLoggingIn ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>Authorize Terminal Session</Text>
          )}
        </Pressable>

      </View>
    </View>
  );
}

// --- LIGHTWEIGHT STYLESHEET ---
const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  brandingHeader: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  titleText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitleText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
  },
  submitButton: {
    backgroundColor: '#00478d',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});