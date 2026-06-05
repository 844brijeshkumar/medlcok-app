import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  AppState,
  StyleSheet,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

// ============================
// COMPONENT IMPORTS
// ============================

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import LogoutModal from '@/components/LogoutModal';
import Sidebar from '@/components/Sidebar';

// ============================
// AUTH / STARTUP SCREENS
// ============================

import LockScreen from '@/app/lock-screen';
import LoginScreen from '@/app/login';
import SplashVideoScreen from '@/app/splash-video';

// ============================
// GLOBAL STATE PROVIDERS
// ============================

import { AppProvider, useApp } from '@/context/AppContext';
import { SecurityProvider, useSecurity } from '@/context/SecurityContext';

// ============================
// TYPES
// ============================

type ScreenType =
  | 'dashboard'
  | 'reports'
  | 'booking'
  | 'insurance'
  | 'appointments'
  | 'donation'
  | 'donate_booking'
  | 'settings'
  | 'security';

// ============================
// MAIN APP CONTENT
// ============================

function AppLayoutContent() {
  const {
    isSplashComplete,
    userToken,
    isLoading,
    logout,
  } = useApp();

  const {
    isAppLockEnabled,
    autoLockOnBackground,
    useCustomPin,
    useBiometrics,
    isAuthenticated,
    logOutUserSession 
  } = useSecurity();

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState) => {
        if (
          nextAppState.match(/inactive|background/) &&
          autoLockOnBackground &&
          isAppLockEnabled
        ) {
          logOutUserSession();
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [autoLockOnBackground, isAppLockEnabled, logOutUserSession]);

  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [activeScreen, setActiveScreen] = useState<ScreenType>('dashboard');

  const user = {
    name: 'Brijesh Maurya',
    role: 'Premium Donor',
  };

  const handleNavigate = (screen: ScreenType) => {
    setActiveScreen(screen);
    setIsSidebarOpen(false);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00d5c0" />
      </View>
    );
  }

  if (!isSplashComplete) {
    return <SplashVideoScreen />;
  }

  if (!userToken) {
    return <LoginScreen />;
  }

  const requiresSecurityClearance = isAppLockEnabled && (useCustomPin || useBiometrics);

  if (requiresSecurityClearance && !isAuthenticated) {
    return <LockScreen />;
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <Header
          user={user}
          isFilterActive={isFilterActive}
          onMenuToggle={() => setIsSidebarOpen(true)}
          onFilterToggle={() => setIsFilterActive(!isFilterActive)}
        />
      </SafeAreaView>

      <View style={styles.stackContainer}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>

      <Footer activeScreen={activeScreen} onNavigate={handleNavigate} />

      <Sidebar
        user={user}
        isOpen={isSidebarOpen}
        activeScreen={activeScreen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={handleNavigate}
        onLogout={() => {
          setIsSidebarOpen(false);
          setIsLogoutModalOpen(true);
        }}
      />

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onCancel={() => setIsLogoutModalOpen(false)}
        onConfirm={async () => {
          setIsLogoutModalOpen(false);
          await logout();
        }}
      />
    </View>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <SecurityProvider>
        <AppLayoutContent />
      </SecurityProvider>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  stackContainer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#031417',
  },
  headerSafeArea: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
});