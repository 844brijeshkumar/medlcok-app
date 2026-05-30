import { StatusBar } from 'expo-status-bar';
import { Shield } from 'lucide-react-native';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function SplashVideoScreen() {
  const { setSplashComplete } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashComplete(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <View style={styles.overlayLayer}>
        <View style={styles.logoCircle}>
          <Shield size={40} color="#ffffff" />
        </View>

        <Text style={styles.brandText}>
          MEDLOCK CLINICAL
        </Text>

        <ActivityIndicator
          size="small"
          color="#2a9b94"
          style={{ marginTop: 24 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#031417',
  },

  overlayLayer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#00478d',
    alignItems: 'center',
    justifyContent: 'center',
  },

  brandText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 2,
    marginTop: 16,
  },
});