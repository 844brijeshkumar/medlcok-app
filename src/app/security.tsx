import { useRouter } from 'expo-router';
import { ArrowLeft, Cpu, Key, Layers, Lock, Shield } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSecurity } from '../context/SecurityContext';

export default function SecurityScreen() {
  const router = useRouter();
  const {
    isAppLockEnabled, setAppLockEnabled,
    useCustomPin, setUseCustomPin,
    useBiometrics, setUseBiometrics,
    autoLockOnBackground, setAutoLockOnBackground,
  } = useSecurity();

  // Intercept the PIN toggle to enforce setup before enabling
  const handlePinToggle = (newValue: boolean) => {
    if (newValue) {
      // If they want to turn it ON, force them to set it up first
      router.push('/pin-setup');
    } else {
      // If they want to turn it OFF, just turn it off
      setUseCustomPin(false);
    }
  };

  const trustedDevices = [
    { name: 'iPhone 15 Pro (Current)', location: 'Mumbai, India', date: 'Active Now' },
    { name: 'iPad Pro 11-inch', location: 'Pune, India', date: 'May 24, 2026' }
  ];

  const recentLogins = [
    { type: 'Biometric Access Granted', facility: 'Vault Entry Route', status: 'Success', date: 'Today, 08:32 PM' },
    { type: 'PIN Authentication Challenge', facility: 'Reports Extraction Gate', status: 'Success', date: 'Yesterday, 04:15 PM' }
  ];

  return (
    <View style={styles.layoutFrame}>
      <View style={styles.topNavigationRowHeaderBar}>
        <Pressable onPress={() => router.back()} style={styles.headerBackActionAnchor}>
          <ArrowLeft size={20} color="#0f172a" />
          <Text style={styles.headerLabelTextTitle}>Security & Privacy Console</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        <View style={styles.statusIndicatorCardCapsule}>
          <View style={styles.indicatorPulseCircle}>
            <Shield size={20} color={isAppLockEnabled ? "#059669" : "#94a3b8"} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusHeadlineMainTitleText, !isAppLockEnabled && { color: '#475569' }]}>
              {isAppLockEnabled ? 'System Integration Status: Secure' : 'System Unlocked (Not Recommended)'}
            </Text>
            <Text style={styles.statusHeadlineSecondarySubtitleText}>
              {isAppLockEnabled ? 'Hardware enclaves encrypted; cryptographic vaults active.' : 'Enable App Lock to secure clinical records.'}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionHeadingHeaderTitleText}>App Lock Configurations</Text>
        <View style={styles.formChassisGroupContainerCard}>
          
          {/* Master Lock */}
          <View style={styles.toggleRowBlockSegmentLine}>
            <View style={styles.rowIconCircleWrapperBox}><Lock size={18} color="#00478d" /></View>
            <View style={styles.toggleTextContentCluster}>
              <Text style={styles.toggleTextPrimaryTitleLabel}>Enable App Lock</Text>
              <Text style={styles.toggleTextSecondaryDescriptionLabel}>Master switch for workspace verification</Text>
            </View>
            <Switch 
              value={isAppLockEnabled} 
              onValueChange={(val) => {
                setAppLockEnabled(val);
                // Auto-disable sub-features if master is turned off
                if (!val) {
                  setUseCustomPin(false);
                  setUseBiometrics(false);
                  setAutoLockOnBackground(false);
                }
              }} 
              thumbColor="#ffffff" 
              trackColor={{ true: '#2a9b94', false: '#cbd5e1' }} 
            />
          </View>

          {/* Biometrics (Independent) */}
          <View style={styles.toggleRowBlockSegmentLine}>
            <View style={styles.rowIconCircleWrapperBox}><Cpu size={18} color="#00478d" /></View>
            <View style={styles.toggleTextContentCluster}>
              <Text style={styles.toggleTextPrimaryTitleLabel}>Enable Biometrics</Text>
              <Text style={styles.toggleTextSecondaryDescriptionLabel}>Use Fingerprint or FaceID to unlock</Text>
            </View>
            <Switch 
              value={useBiometrics} 
              onValueChange={setUseBiometrics} 
              disabled={!isAppLockEnabled} 
              thumbColor="#ffffff" 
              trackColor={{ true: '#2a9b94', false: '#cbd5e1' }} 
            />
          </View>

          {/* Custom PIN (Independent with setup intercept) */}
          <View style={styles.toggleRowBlockSegmentLine}>
            <View style={styles.rowIconCircleWrapperBox}><Key size={18} color="#2a9b94" /></View>
            <View style={styles.toggleTextContentCluster}>
              <Text style={styles.toggleTextPrimaryTitleLabel}>Use Custom Vault PIN</Text>
              <Text style={styles.toggleTextSecondaryDescriptionLabel}>Manual 4-digit code backup</Text>
            </View>
            <Switch 
              value={useCustomPin} 
              onValueChange={handlePinToggle} 
              disabled={!isAppLockEnabled} 
              thumbColor="#ffffff" 
              trackColor={{ true: '#2a9b94', false: '#cbd5e1' }} 
            />
          </View>

          {/* Change PIN Button (Only shows if PIN is already active) */}
          {useCustomPin && isAppLockEnabled && (
            <Pressable onPress={() => router.push('/pin-setup')} style={styles.setupSubRowActionLinkPressableBox}>
              <Text style={styles.setupSubRowActionLinkTextValueLabel}>Change Custom 4-Digit PIN Code</Text>
            </Pressable>
          )}

          {/* Auto Lock Background */}
          <View style={styles.toggleRowBlockSegmentLineNoBorder}>
            <View style={styles.rowIconCircleWrapperBox}><Layers size={18} color="#2a9b94" /></View>
            <View style={styles.toggleTextContentCluster}>
              <Text style={styles.toggleTextPrimaryTitleLabel}>Auto-Lock on Minimize</Text>
              <Text style={styles.toggleTextSecondaryDescriptionLabel}>Instantly re-lock when app goes to background</Text>
            </View>
            <Switch 
              value={autoLockOnBackground} 
              onValueChange={setAutoLockOnBackground} 
              disabled={!isAppLockEnabled} 
              thumbColor="#ffffff" 
              trackColor={{ true: '#2a9b94', false: '#cbd5e1' }} 
            />
          </View>
        </View>

        {/* ... (Keep your 2FA, Trusted Devices, and Ledger Logs sections exactly as they were) ... */}
        
      </ScrollView>
    </View>
  );
}

// Keep your exact StyleSheet here (Omitted for brevity to keep the response light, reuse your exact styles)

const styles = StyleSheet.create({
  layoutFrame: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  topNavigationRowHeaderBar: {
    backgroundColor: '#ffffff',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  headerBackActionAnchor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerLabelTextTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  /* Security flag indicators components styling rules */
  statusIndicatorCardCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    marginVertical: 16,
  },
  indicatorPulseCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusHeadlineMainTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#064e3b',
  },
  statusHeadlineSecondarySubtitleText: {
    fontSize: 11,
    color: '#059669',
    lineHeight: 15,
    marginTop: 1,
  },
  sectionHeadingHeaderTitleText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    color: '#64748b',
    letterSpacing: 0.6,
    marginBottom: 10,
    marginLeft: 4,
  },
  formChassisGroupContainerCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 24,
  },
  toggleRowBlockSegmentLine: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  toggleRowBlockSegmentLineNoBorder: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  rowIconCircleWrapperBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  toggleTextContentCluster: {
    flex: 1,
    gap: 2,
    marginRight: 8,
  },
  toggleTextPrimaryTitleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  toggleTextSecondaryDescriptionLabel: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 15,
  },
  setupSubRowActionLinkPressableBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  setupSubRowActionLinkTextValueLabel: {
    color: '#00478d',
    fontSize: 11,
    fontWeight: '700',
  },
  activeStatusCapsuleIndicatorNode: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeStatusCapsuleIndicatorTextLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#047857',
    textTransform: 'uppercase',
  },
  /* List entries grid layouts tables styling parameters */
  listElementChassisItemRowFrameLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  listElementChassisItemRowFrameNoBorder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  listElementItemDescriptionClusterPayload: {
    flex: 1,
    gap: 2,
    marginRight: 12,
  },
  listElementItemMainHeaderTitleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  listElementItemSecondarySubtitleText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  listElementItemRightSideTrailingValueText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
});