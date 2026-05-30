import { useRouter } from 'expo-router';
import {
  CalendarDays,
  FileText,
  LayoutDashboard,
  Receipt,
  ShieldAlert,
} from 'lucide-react-native';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Adjust to match your unified types
type ScreenType = 'dashboard' | 'reports' | 'booking' | 'insurance' | 'appointments';

interface FooterProps {
  activeScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
}

export default function Footer({ activeScreen, onNavigate }: FooterProps) {
  const router = useRouter(); // Initialize the native router instance
  const insets = useSafeAreaInsets();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { id: 'reports', label: 'Reports', Icon: FileText },
    { id: 'booking', label: 'Book', Icon: CalendarDays },
    { id: 'insurance', label: 'Insurance', Icon: ShieldAlert },
    { id: 'appointments', label: 'Tickets', Icon: Receipt },
  ] as const;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }]}>
      {tabs.map((tab) => {
        const isActive = activeScreen === tab.id;
        const color = isActive ? '#00478d' : '#94a3b8';

        return (
          <Pressable
            key={tab.id}
            onPress={() => {
              // 1. Fire the original state handler to update visual active states
              onNavigate(tab.id);
              
              // 2. Perform the actual router push transition
              // Maps 'dashboard' to root file '/' and other tabs to their folder files directly
              if (tab.id === 'dashboard') {
                router.push('/');
              } else {
                router.push(`/${tab.id}`);
              }
            }}
            style={styles.tabButton}
          >
            <tab.Icon size={20} color={color} />
            <Text style={[styles.tabLabel, { color }]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingTop: 12,
    zIndex: 40,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 12,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
  },
});