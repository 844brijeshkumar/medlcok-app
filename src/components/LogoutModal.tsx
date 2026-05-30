import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { LogOut } from 'lucide-react-native';

interface LogoutModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LogoutModal({ isOpen, onConfirm, onCancel }: LogoutModalProps) {
  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel} // Handles Android hardware back button
    >
      <View style={styles.overlayBackdrop}>
        {/* Invisible pressable area to close modal when clicking outside */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        
        {/* Modal Box Chassis */}
        <View style={styles.modalBoxCard}>
          
          <View style={styles.iconCenterWrapper}>
            <View style={styles.redIconCircleBadge}>
              <LogOut size={32} color="#dc2626" />
            </View>
          </View>

          <Text style={styles.modalTitleText}>Confirm Logout</Text>
          <Text style={styles.modalSubtitleText}>
            Are you sure you want to log out? Your current healthcare session will be ended.
          </Text>

          {/* Action Buttons Row */}
          <View style={styles.buttonActionRowFlex}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.cancelButtonSecondary,
                pressed && styles.buttonPressedOpacity
              ]}
            >
              <Text style={styles.cancelButtonText}>No, Stay</Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.confirmButtonPrimary,
                pressed && styles.buttonPressedOpacity
              ]}
            >
              <Text style={styles.confirmButtonText}>Yes, Logout</Text>
            </Pressable>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBoxCard: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  iconCenterWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  redIconCircleBadge: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 999,
  },
  modalTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitleText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
    lineHeight: 18,
  },
  buttonActionRowFlex: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButtonSecondary: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  confirmButtonPrimary: {
    flex: 1,
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  buttonPressedOpacity: {
    opacity: 0.7,
  },
});