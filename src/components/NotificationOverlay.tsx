import React, { useEffect, useRef, useState } from 'react';
import { 
  Animated, 
  Dimensions, 
  Pressable, 
  StyleSheet, 
  Text, 
  View, 
  Modal 
} from 'react-native';
import { X, Bell } from 'lucide-react-native';
import NotificationList from './NotificationList';

// THE FIX: We use insets manually instead of SafeAreaView which collapses inside Modals
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface NotificationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationOverlay({ isOpen, onClose }: NotificationOverlayProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // Gets the safe device padding (notch/status bar) safely
  const insets = useSafeAreaInsets(); 

  useEffect(() => {
    if (isOpen) {
      // 1. Mount Modal
      setIsModalVisible(true);
      
      // 2. Tiny delay ensures the Modal is fully rendered before sliding
      setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
      }, 10);
      
    } else {
      // 1. Slide up
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(() => {
        // 2. Unmount Modal
        setIsModalVisible(false);
      });
    }
  }, [isOpen]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_HEIGHT, 0],
  });

  return (
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="none" // We handle the slide manually
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <Animated.View style={[styles.animatedSheet, { transform: [{ translateY }] }]}>
          
          {/* THE FIX: Manual Safe Area Padding applied directly to a View */}
          <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 20) }]}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Bell size={24} color="#00478d" />
                <Text style={styles.headerTitle}>Notifications</Text>
              </View>
              <Pressable 
                onPress={onClose} 
                style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
              >
                <X size={24} color="#64748b" />
              </Pressable>
            </View>
          </View>

          {/* Notification Content */}
          <NotificationList />

        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  animatedSheet: {
    flex: 1, // Forces it to take up the whole screen
    backgroundColor: '#ffffff',
    width: '100%',
    height: '100%',
    elevation: 20, // Forces it to the top layer on Android
  },
  headerContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 99,
  },
  closeButtonPressed: {
    backgroundColor: '#e2e8f0',
  },
});