import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router'; // Added missing Expo Router import
import {
  Settings,
  User,
  Shield,
  Check,
  X,
  Edit3,
} from 'lucide-react-native';

// --- Structural Configuration Types ---
interface UserProfile {
  name: string;
  role: string;
  age: number;
  bloodGroup: string;
  gender: string;
  emergencyContact: string;
  emergencyLabel: string;
}

interface SettingsScreenProps {
  user: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

export default function SettingsScreen({
  // Defensive profile data fallback mapping to prevent undefined crashes
  user = {
    name: 'Brijesh Maurya',
    role: 'Premium Donor',
    age: 24,
    bloodGroup: 'O+',
    gender: 'Male',
    emergencyContact: '+91 98765 43210',
    emergencyLabel: 'Father',
  },
  onUpdateProfile,
}: SettingsScreenProps) {
  const router = useRouter(); // Initialized missing router hook instance
  const [isEditing, setIsEditing] = useState(false);

  // Form states initialized with secure hooks fallbacks
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [age, setAge] = useState(String(user.age));
  const [bloodGroup, setBloodGroup] = useState(user.bloodGroup);
  const [gender, setGender] = useState(user.gender);
  const [emergencyContact, setEmergencyContact] = useState(user.emergencyContact);
  const [emergencyLabel, setEmergencyLabel] = useState(user.emergencyLabel);

  const handleSaveSubmit = () => {
    if (!name.trim()) return;
    
    onUpdateProfile({
      name,
      role,
      age: Number(age) || 0,
      bloodGroup,
      gender,
      emergencyContact,
      emergencyLabel,
    });
    setIsEditing(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardMasterContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollCanvas} showsVerticalScrollIndicator={false}>
        
        {/* --- 1. Settings Section Brand Header Box --- */}
        <View style={styles.headerContainerBox}>
          <View style={styles.headerIconSquareWidget}>
            <Settings size={24} color="#ffffff" />
          </View>
          <View style={styles.headerTitleTextCluster}>
            <Text style={styles.headerMainTitleText}>Settings</Text>
            <Text style={styles.headerSecondarySubtitleText}>
              Manage your personal profile, security preferences, and account access.
            </Text>
          </View>
        </View>

        {/* --- 2. Primary Information Card Panel Layout --- */}
        <View style={styles.cardChassisContainer}>
          {!isEditing ? (
            /* --- View Mode Layer Container --- */
            <View style={styles.contentPayloadWrapper}>
              <View style={styles.cardSectionHeaderRow}>
                <View style={styles.sectionHeaderIconBoxCircle}>
                  <User size={20} color="#00478d" />
                </View>
                <View style={styles.sectionTitleBlockInfoText}>
                  <Text style={styles.sectionHeadingCardTitle}>Profile Information</Text>
                  <Text style={styles.sectionHeadingCardSubtitle}>
                    View and update your personal details, medical history references, and emergency contacts.
                  </Text>
                </View>
              </View>

              {/* Account Metadata Detail Table Grid */}
              <View style={styles.grayDataGridCardLedger}>
                <View style={styles.ledgerStripRowListItem}>
                  <Text style={styles.ledgerCellLabelText}>Username</Text>
                  <Text style={styles.ledgerCellValueBoldText}>{user.name}</Text>
                </View>
                
                <View style={styles.ledgerStripRowListItem}>
                  <Text style={styles.ledgerCellLabelText}>Donor Rank</Text>
                  <Text style={[styles.ledgerCellValueBoldText, { color: '#d97706' }]}>{user.role}</Text>
                </View>

                <View style={styles.ledgerStripRowListItem}>
                  <Text style={styles.ledgerCellLabelText}>Age Limit</Text>
                  <Text style={styles.ledgerCellValueBoldText}>{user.age} Years</Text>
                </View>

                <View style={styles.ledgerStripRowListItem}>
                  <Text style={styles.ledgerCellLabelText}>Blood Group</Text>
                  <Text style={[styles.ledgerCellValueBoldText, { color: '#dc2626' }]}>{user.bloodGroup}</Text>
                </View>

                <View style={styles.ledgerStripRowListItemNoBorder}>
                  <Text style={styles.ledgerCellLabelText}>Emergency Contact</Text>
                  <Text style={styles.ledgerCellValueBoldText} numberOfLines={1}>
                    {user.emergencyContact} ({user.emergencyLabel})
                  </Text>
                </View>
              </View>

              {/* Trigger Edit Action button link */}
              <Pressable
                onPress={() => setIsEditing(true)}
                style={({ pressed }) => [styles.actionButtonTriggerCapsulePrimary, pressed && styles.actionButtonPressed]}
              >
                <Edit3 size={14} color="#ffffff" style={styles.inlineButtonIconSpacing} />
                <Text style={styles.actionButtonTriggerTextValueLabel}>Edit Profile</Text>
              </Pressable>
            </View>
          ) : (
            /* --- Edit Mode Form Layer Container --- */
            <View style={styles.contentPayloadWrapper}>
              <View style={styles.formHeaderBorderFlexRow}>
                <Text style={styles.formHeadingCardTitle}>Edit Personal Details</Text>
                <Pressable onPress={() => setIsEditing(false)} style={styles.formCloseTargetCrossIcon}>
                  <X size={18} color="#94a3b8" />
                </Pressable>
              </View>

              {/* Forms input components fields vertical layouts stacks stack */}
              <View style={styles.formFieldsVerticalStackContainer}>
                
                {/* Full Name field */}
                <View style={styles.inputFieldBlockLabelControlRow}>
                  <Text style={styles.inputFieldBlockLabelHeadlineText}>Patient Full Name</Text>
                  <View style={styles.inputBoxContainerChassisRow}>
                    <TextInput
                      style={styles.inputFieldEditableValueStringTextInput}
                      value={name}
                      onChangeText={setName}
                      placeholder="Enter full name"
                    />
                  </View>
                </View>

                {/* Age & Gender Row grid layout splits */}
                <View style={styles.rowGridSplitLayoutHalfContainerRow}>
                  <View style={styles.rowGridSplitCellHalfItem}>
                    <Text style={styles.inputFieldBlockLabelHeadlineText}>Age</Text>
                    <View style={styles.inputBoxContainerChassisRow}>
                      <TextInput
                        style={styles.inputFieldEditableValueStringTextInput}
                        value={age}
                        onChangeText={setAge}
                        keyboardType="numeric"
                        placeholder="24"
                      />
                    </View>
                  </View>
                  
                  <View style={styles.rowGridSplitCellHalfItem}>
                    <Text style={styles.inputFieldBlockLabelHeadlineText}>Gender</Text>
                    <View style={styles.inputBoxContainerChassisRow}>
                      <TextInput
                        style={styles.inputFieldEditableValueStringTextInput}
                        value={gender}
                        onChangeText={setGender}
                        placeholder="Gender"
                      />
                    </View>
                  </View>
                </View>

                {/* Blood Group & Rank Row split grids inputs layouts */}
                <View style={styles.rowGridSplitLayoutHalfContainerRow}>
                  <View style={styles.rowGridSplitCellHalfItem}>
                    <Text style={styles.inputFieldBlockLabelHeadlineText}>Blood Group</Text>
                    <View style={styles.inputBoxContainerChassisRow}>
                      <TextInput
                        style={[styles.inputFieldEditableValueStringTextInput, { color: '#dc2626', fontWeight: 'bold' }]}
                        value={bloodGroup}
                        onChangeText={setBloodGroup}
                        autoCapitalize="characters"
                        placeholder="O+"
                      />
                    </View>
                  </View>

                  <View style={styles.rowGridSplitCellHalfItem}>
                    <Text style={styles.inputFieldBlockLabelHeadlineText}>Member Rank/Tag</Text>
                    <View style={styles.inputBoxContainerChassisRow}>
                      <TextInput
                        style={[styles.inputFieldEditableValueStringTextInput, { color: '#b45309', fontWeight: 'bold' }]}
                        value={role}
                        onChangeText={setRole}
                        placeholder="Rank"
                      />
                    </View>
                  </View>
                </View>

                {/* Emergency Phone & Label relationship mappings blocks splits rows */}
                <View style={styles.rowGridSplitLayoutHalfContainerRow}>
                  <View style={styles.rowGridSplitCellHalfItem}>
                    <Text style={styles.inputFieldBlockLabelHeadlineText}>Emergency Contact</Text>
                    <View style={styles.inputBoxContainerChassisRow}>
                      <TextInput
                        style={styles.inputFieldEditableValueStringTextInput}
                        value={emergencyContact}
                        onChangeText={setEmergencyContact}
                        keyboardType="phone-pad"
                        placeholder="Phone number"
                      />
                    </View>
                  </View>

                  <View style={styles.rowGridSplitCellHalfItem}>
                    <Text style={styles.inputFieldBlockLabelHeadlineText}>Contact Relation Tag</Text>
                    <View style={styles.inputBoxContainerChassisRow}>
                      <TextInput
                        style={styles.inputFieldEditableValueStringTextInput}
                        value={emergencyLabel}
                        onChangeText={setEmergencyLabel}
                        placeholder="e.g., Father"
                      />
                    </View>
                  </View>
                </View>

              </View>

              {/* Form Commitment Toolbar controls group footer buttons layouts rows */}
              <View style={styles.formActionButtonsFooterToolbarContainerFlexRow}>
                <Pressable
                  onPress={handleSaveSubmit}
                  style={({ pressed }) => [styles.formSubmitSaveActionButtonPrimary, pressed && styles.actionButtonPressed]}
                >
                  <Check size={16} color="#ffffff" style={styles.inlineButtonIconSpacing} />
                  <Text style={styles.formSubmitSaveActionButtonTextValueLabel}>Save Changes</Text>
                </Pressable>

                <Pressable
                  onPress={() => setIsEditing(false)}
                  style={styles.formCancelActionButtonSecondary}
                >
                  <Text style={styles.formCancelActionButtonTextValueLabel}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* --- 3. Security & Privacy Action Settings Panel View Component Block --- */}
        <Text style={styles.sectionHeading}>Security Preferences</Text>
        <View style={styles.formGroupCard}>
          <Pressable 
            onPress={() => router.push('/security')}
            style={({ pressed }) => [
              styles.inputBoxContainerChassisRowFieldActionLink,
              pressed && styles.pressedStateActiveColorHighlight
            ]}
          >
            <View style={styles.cardSectionHeaderRowFlexHorizontalBoxAlignment}>
              <View style={[styles.sectionHeaderIconBoxCircle, { backgroundColor: '#f0fdfa' }]}>
                <Shield size={20} color="#2a9b94" />
              </View>
              <View style={styles.sectionTitleBlockInfoText}>
                <Text style={styles.sectionHeadingCardTitle}>Security &amp; Privacy Console</Text>
                <Text style={styles.sectionHeadingCardSubtitle}>
                  Manage cryptographic PIN code enclaves, biometrics TouchID hardware integration mappings, and live system log sessions.
                </Text>
              </View>
            </View>
          </Pressable>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardMasterContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollCanvas: {
    flex: 1,
    paddingHorizontal: 16,
  },
  /* --- Shared Brand Layout App Shell Header Widget --- */
  headerContainerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: 'rgba(191, 219, 254, 0.4)',
    borderRadius: 16,
    padding: 16,
    marginVertical: 16,
    gap: 12,
  },
  headerIconSquareWidget: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#00478d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleTextCluster: {
    flex: 1,
  },
  headerMainTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  headerSecondarySubtitleText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 16,
  },
  /* --- Centralized Base Card Panels Frames rules configurations --- */
  cardChassisContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 16,
  },
  formGroupCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    color: '#64748b',
    letterSpacing: 0.6,
    marginBottom: 10,
    marginLeft: 4,
  },
  contentPayloadWrapper: {
    width: '100%',
  },
  cardSectionHeaderRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  sectionHeaderIconBoxCircle: {
    backgroundColor: '#eff6ff',
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitleBlockInfoText: {
    flex: 1,
    gap: 4,
  },
  sectionHeadingCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  sectionHeadingCardSubtitle: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
  /* --- View Mode Ledger display lists --- */
  grayDataGridCardLedger: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    marginTop: 16,
  },
  ledgerStripRowListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 10,
  },
  ledgerStripRowListItemNoBorder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ledgerCellLabelText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  ledgerCellValueBoldText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  actionButtonTriggerCapsulePrimary: {
    flexDirection: 'row',
    backgroundColor: '#00478d',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  actionButtonPressed: {
    opacity: 0.9,
    backgroundColor: '#003366',
  },
  actionButtonTriggerTextValueLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  inlineButtonIconSpacing: {
    marginRight: 6,
  },
  /* --- Edit Mode Components Fields layouts rules block --- */
  formHeaderBorderFlexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 12,
    marginBottom: 16,
  },
  formHeadingCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  formCloseTargetCrossIcon: {
    padding: 4,
    borderRadius: 999,
    backgroundColor: '#f8fafc',
  },
  formFieldsVerticalStackContainer: {
    gap: 14,
  },
  inputFieldBlockLabelControlRow: {
    gap: 6,
  },
  inputFieldBlockLabelHeadlineText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 2,
  },
  inputBoxContainerChassisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
  },
  inputFieldEditableValueStringTextInput: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    paddingVertical: 0,
  },
  rowGridSplitLayoutHalfContainerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  rowGridSplitCellHalfItem: {
    flex: 1,
    gap: 6,
  },
  formActionButtonsFooterToolbarContainerFlexRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
  },
  formSubmitSaveActionButtonPrimary: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: '#00478d',
    borderRadius: 10,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formSubmitSaveActionButtonTextValueLabel: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  formCancelActionButtonSecondary: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formCancelActionButtonTextValueLabel: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
  },
  /* --- Passive states passive button metrics badges --- */
  comingSoonPassiveStateButtonBadgeCapsule: {
    backgroundColor: '#f1f5f9',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 12,
  },
  comingSoonPassiveStateButtonBadgeTextLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputBoxContainerChassisRowFieldActionLink: {
    backgroundColor: '#ffffff',
    paddingVertical: 4,
    borderRadius: 12,
  },
  pressedStateActiveColorHighlight: {
    opacity: 0.8,
  },
  cardSectionHeaderRowFlexHorizontalBoxAlignment: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
});