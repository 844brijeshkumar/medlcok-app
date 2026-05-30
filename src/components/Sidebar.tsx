import { useRouter } from 'expo-router'; // Added Expo Router import
import {
  Heart,
  History,
  LayoutDashboard,
  Lock,
  LogOut,
  Receipt,
  Settings,
  X
} from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Adjust these to match your actual types file
type ScreenType = 'dashboard' | 'donation' | 'donate_booking' | 'insurance' | 'locker' | 'settings';
interface UserProfile {
  name: string;
  role: string;
}

interface SidebarProps {
  user: UserProfile;
  isOpen: boolean;
  activeScreen: ScreenType;
  onClose: () => void;
  onNavigate: (screen: ScreenType) => void;
  onLogout: () => void;
}

const DRAWER_WIDTH = 288; // Equivalent to Tailwind's w-72

export default function Sidebar({
  user,
  isOpen,
  activeScreen,
  onClose,
  onNavigate,
  onLogout,
}: SidebarProps) {
  const router = useRouter(); // Initialize the native router instance
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 300,
      useNativeDriver: true, // Optimizes performance
    }).start();
  }, [isOpen]);

  // Interpolate animation values
  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-DRAWER_WIDTH, 0],
  });

  const backdropOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  // If not open and animation is done, we disable pointer events so it doesn't block UI
  const pointerEvents = isOpen ? 'auto' : 'none';

  return (
    <View style={[styles.masterContainer, StyleSheet.absoluteFill, { zIndex: 50 }]} pointerEvents={pointerEvents}>
      {/* Overlay Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={styles.backdropPressable} onPress={onClose} />
      </Animated.View>

      {/* Slide Drawer panel */}
      <Animated.View
        style={[styles.drawer, { transform: [{ translateX }] }]}
      >
        <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
          
          {/* Header containing User info */}
          <View style={styles.header}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.pressedState,
              ]}
            >
              <X size={20} color="#64748b" />
            </Pressable>

            <View style={styles.userInfoContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userRole}>{user.role}</Text>
              </View>
            </View>
          </View>

          {/* Navigation Elements */}
          <ScrollView style={styles.navContainer} contentContainerStyle={styles.navContent}>
            
            {/* Dashboard Link */}
            <Pressable
              onPress={() => {
                onNavigate('dashboard');
                router.push('/'); // Maps dashboard to root index route
                onClose();
              }}
              style={({ pressed }) => [
                styles.navItem,
                activeScreen === 'dashboard' && styles.navItemActive,
                pressed && !activeScreen && styles.pressedState,
              ]}
            >
              <LayoutDashboard size={20} color={activeScreen === 'dashboard' ? '#00478d' : '#64748b'} />
              <Text style={[styles.navText, activeScreen === 'dashboard' && styles.navTextActive]}>
                Dashboard
              </Text>
            </Pressable>

            {/* Donation History Link */}
            <Pressable
              onPress={() => {
                onNavigate('donation');
                router.push('/donation');
                onClose();
              }}
              style={({ pressed }) => [
                styles.navItem,
                activeScreen === 'donation' && styles.navItemActive,
                pressed && !activeScreen && styles.pressedState,
              ]}
            >
              <History size={20} color={activeScreen === 'donation' ? '#00478d' : '#64748b'} />
              <Text style={[styles.navText, activeScreen === 'donation' && styles.navTextActive]}>
                Donation History
              </Text>
            </Pressable>

            {/* Book Donation Intake Link */}
            <Pressable
              onPress={() => {
                onNavigate('donate_booking');
                router.push('/donating');
                onClose();
              }}
              style={({ pressed }) => [
                styles.navItem,
                activeScreen === 'donate_booking' && styles.navItemActive,
                pressed && !activeScreen && styles.pressedState,
              ]}
            >
              <Heart size={20} color="#dc2626" />
              <Text style={[styles.navText, activeScreen === 'donate_booking' && styles.navTextActive]}>
                Book Donation
              </Text>
            </Pressable>

            {/* Claims Link */}
            <Pressable
              onPress={() => {
                onNavigate('insurance');
                router.push('/claim');
                onClose();
              }}
              style={({ pressed }) => [
                styles.navItem,
                activeScreen === 'insurance' && styles.navItemActive,
                pressed && styles.pressedState,
              ]}
            >
              <Receipt size={20} color={activeScreen === 'insurance' ? '#00478d' : '#64748b'} />
              <Text style={[styles.navText, activeScreen === 'insurance' && styles.navTextActive]}>Claims</Text>
            </Pressable>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Locker */}
            <Pressable
              onPress={() => {
                Alert.alert('Medlock Locker', 'This feature is for personal use only.');
                onNavigate('locker');
                router.push('/locker');
                onClose();
              }}
              style={({ pressed }) => [
                styles.navItem,
                activeScreen === 'locker' && styles.navItemActive,
                pressed && styles.pressedState,
              ]}
            >
              <Lock size={20} color={activeScreen === 'locker' ? '#00478d' : '#64748b'} />
              <Text style={[styles.navText, activeScreen === 'locker' && styles.navTextActive]}>Locker</Text>
            </Pressable>

            {/* Settings */}
            <Pressable
              onPress={() => {
                onNavigate('settings');
                router.push('/setting');
                onClose();
              }}
              style={({ pressed }) => [
                styles.navItem,
                activeScreen === 'settings' && styles.navItemActive,
                pressed && styles.pressedState,
              ]}
            >
              <Settings size={20} color={activeScreen === 'settings' ? '#00478d' : '#64748b'} />
              <Text style={[styles.navText, activeScreen === 'settings' && styles.navTextActive]}>Settings</Text>
            </Pressable>

          </ScrollView>

          {/* Footer Logout Action */}
          <View style={styles.footer}>
            <Pressable
              onPress={() => {
                onLogout();
                onClose();
              }}
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.logoutPressed,
              ]}
            >
              <LogOut size={20} color="#dc2626" />
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </View>

        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  masterContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropPressable: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 24,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
    borderRadius: 999,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00478d',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  userRole: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d97706',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  navContainer: {
    flex: 1,
  },
  navContent: {
    padding: 16,
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 16,
  },
  navItemActive: {
    backgroundColor: '#eff6ff',
  },
  navText: {
    fontSize: 14,
    color: '#475569',
  },
  navTextActive: {
    color: '#00478d',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 16,
  },
  logoutPressed: {
    backgroundColor: '#fef2f2',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#dc2626',
  },
  pressedState: {
    backgroundColor: '#f8fafc',
  },
});