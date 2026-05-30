import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  AppState,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Search } from 'lucide-react-native';

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
  // 1. Read User & Core State from AppContext
  const {
    isSplashComplete,
    userToken,
    isLoading,
    logout,
  } = useApp();

  // 2. Read Security State strictly from SecurityContext to fix the split-brain
  const {
    isAppLockEnabled,
    autoLockOnBackground,
    useCustomPin,
    useBiometrics,
    isAuthenticated, // Replaces 'isUnlocked'
    logOutUserSession // Replaces 'lockApp'
  } = useSecurity();

  // =====================================================
  // ROBUST BACKGROUND AUTO-LOCK LISTENER
  // =====================================================
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState) => {
        if (
          nextAppState.match(/inactive|background/) &&
          autoLockOnBackground &&
          isAppLockEnabled
        ) {
          logOutUserSession(); // Instantly locks the session state
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [autoLockOnBackground, isAppLockEnabled, logOutUserSession]);

  // ============================
  // UI STATES
  // ============================

  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [activeScreen, setActiveScreen] = useState<ScreenType>('dashboard');

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const user = {
    name: 'Brijesh Maurya',
    role: 'Premium Donor',
  };

  const categories = [
    { id: 'all', label: 'All Types' },
    { id: 'Private Hospital', label: 'Private Hospital' },
    { id: 'Clinics / Blood Bank', label: 'Clinics & Blood Bank' },
    { id: 'Gov. Hospital', label: 'Gov. Hospital' },
  ];

  const handleNavigate = (screen: ScreenType) => {
    setActiveScreen(screen);
    setIsSidebarOpen(false);
  };

  const renderGlobalFilterPanel = () => {
    if (!isFilterActive) return null;

    return (
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;

            return (
              <Pressable
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={[
                  styles.categoryBadge,
                  isActive ? styles.badgeActive : styles.badgeInactive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isActive ? styles.textWhite : styles.textSlate,
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.searchContainer}>
          <Search size={16} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search health centers..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
    );
  };

  // =====================================================
  // APP STARTUP FLOW
  // =====================================================

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

  // =====================================================
  // FIXED APP LOCK CHECK
  // =====================================================
  // Only demands lock screen if Master Lock is ON AND a method is configured
  const requiresSecurityClearance = isAppLockEnabled && (useCustomPin || useBiometrics);

  if (requiresSecurityClearance && !isAuthenticated) {
    return <LockScreen />;
  }

  // =====================================================
  // MAIN APP
  // =====================================================

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <Header
          user={user}
          isFilterActive={isFilterActive}
          onMenuToggle={() => setIsSidebarOpen(true)}
          onFilterToggle={() => setIsFilterActive(!isFilterActive)}
        />
        {renderGlobalFilterPanel()}
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

// ============================
// ROOT LAYOUT
// ============================

export default function RootLayout() {
  return (
    <AppProvider>
      <SecurityProvider>
        <AppLayoutContent />
      </SecurityProvider>
    </AppProvider>
  );
}

// ============================
// STYLES
// ============================

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
  filterSection: {
    padding: 16,
    backgroundColor: '#ffffff',
    gap: 14,
  },
  categoryScroll: {
    gap: 8,
    paddingBottom: 2,
  },
  categoryBadge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  badgeActive: {
    backgroundColor: '#00bfa5',
  },
  badgeInactive: {
    backgroundColor: '#f1f5f9',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  textWhite: {
    color: '#ffffff',
  },
  textSlate: {
    color: '#475569',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0f172a',
  },
});