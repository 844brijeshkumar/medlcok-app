import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Shield,
  Smartphone,
  Mail,
  CheckCircle2,
  ArrowRight,
  Plus,
} from 'lucide-react-native';

// --- Local Data Interface Layouts ---
interface Policy {
  id: string;
  name: string;
  planName: string;
  policyNumber: string;
  sumInsured: string;
  validity: string;
  logoUrl: string;
}

// Secure inline data fallback to ensure absolute zero-dependency compilation execution
const POLICIES_MOCK_DATA: Policy[] = [
  {
    id: 'p1',
    name: 'Star Health Insurance',
    planName: 'Family Health Optima',
    policyNumber: 'SH-99281-002',
    sumInsured: '₹10,00,000',
    validity: '14 Oct 2025',
    logoUrl: 'https://placehold.co/100x100/eff6ff/00478d?text=Star',
  },
  {
    id: 'p2',
    name: 'Care Health',
    planName: 'Care Supreme',
    policyNumber: 'CH-A129-99',
    sumInsured: '₹5,00,000',
    validity: '02 Jan 2025',
    logoUrl: 'https://placehold.co/100x100/e0f2fe/0369a1?text=Care',
  },
];

export default function InsuranceScreen() {
  const [currentStep, setCurrentStep] = useState<number>(4); // Default to Results as shown in your mock setup
  const [abhaId, setAbhaId] = useState('91-1234-5678-9012');
  const [verificationMethod, setVerificationMethod] = useState<'mobile' | 'email'>('mobile');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState<number>(59);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const otpInputsRef = useRef<(TextInput | null)[]>([]);

  // Timer countdown hook logic matching your exact execution intervals
  useEffect(() => {
    if (currentStep === 3) {
      setTimer(59);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentStep]);

  // Native input change tracker with automated focus step-forward mapping arrays
  const handleOtpChange = (value: string, index: number) => {
    let cleanValue = value;
    if (cleanValue.length > 1) {
      cleanValue = cleanValue.charAt(cleanValue.length - 1);
    }
    const newOtp = [...otp];
    newOtp[index] = cleanValue;
    setOtp(newOtp);

    if (cleanValue !== '' && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  // Automated backspace key tracking handling step-back focus routing changes
  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && otp[index] === '' && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleSelectMethod = (method: 'mobile' | 'email') => {
    setVerificationMethod(method);
  };

  const handleRestartLinking = () => {
    setOtp(['', '', '', '', '', '']);
    setCurrentStep(1);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.masterWrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollCanvas} showsVerticalScrollIndicator={false}>
        
        {/* --- Unified Shared Insurance Header --- */}
        <View style={styles.headerContainerBox}>
          <View style={styles.headerIconSquareWidget}>
            <Shield size={24} color="#ffffff" />
          </View>
          <View style={styles.headerTitleTextCluster}>
            <Text style={styles.headerMainTitleText}>Health Insurance</Text>
            <Text style={styles.headerSecondarySubtitleText}>
              Manage and link your medical policies
            </Text>
          </View>
        </View>

        {/* --- Stepper Progress Dots Indicator Bar Row --- */}
        <View style={styles.stepperProgressRowChassis}>
          <Pressable onPress={() => setCurrentStep(1)} style={styles.stepDotButtonContainer}>
            <View style={[styles.stepDotIndicatorNode, currentStep >= 1 ? styles.stepDotActive : styles.stepDotInactive]} />
          </Pressable>
          <View style={styles.stepConnectorHorizontalLineBar} />

          <Pressable onPress={() => currentStep >= 2 && setCurrentStep(2)} style={styles.stepDotButtonContainer}>
            <View style={[styles.stepDotIndicatorNode, currentStep >= 2 ? styles.stepDotActive : styles.stepDotInactive]} />
          </Pressable>
          <View style={styles.stepConnectorHorizontalLineBar} />

          <Pressable onPress={() => currentStep >= 3 && setCurrentStep(3)} style={styles.stepDotButtonContainer}>
            <View style={[styles.stepDotIndicatorNode, currentStep >= 3 ? styles.stepDotActive : styles.stepDotInactive]} />
          </Pressable>
        </View>

        {/* --- STEP 1: National Health Authority Identity ID Input Verification Layout --- */}
        {currentStep === 1 && (
          <View style={styles.stepFadeAnimationWrapperChassis}>
            <View style={styles.formGroupInputsCardChassisContainer}>
              <Text style={styles.inputFieldHeadlineLabelTitle}>Enter 14-digit ABHA ID</Text>
              <View style={styles.inputFieldRowFlexHorizontalBox}>
                <TextInput
                  style={styles.abhaIdCustomMonospaceTextInput}
                  value={abhaId}
                  onChangeText={setAbhaId}
                  placeholder="XX-XXXX-XXXX-XXXX"
                  placeholderTextColor="#bfdbfe"
                  autoCapitalize="none"
                />
                <View style={styles.validatedGreenCircleMarkInlineBadge}>
                  <CheckCircle2 size={20} color="#10b981" />
                </View>
              </View>
              <Text style={styles.fieldInformationalHelpParagraphText}>
                Your ABHA ID is required to fetch linked insurance records from the national health gateway securely.
              </Text>
            </View>

            <Pressable
              onPress={() => setCurrentStep(2)}
              style={({ pressed }) => [styles.executionSubmitActionButtonPrimary, pressed && styles.actionButtonPressed]}
            >
              <Text style={styles.executionSubmitActionButtonTextValue}>Fetch My Insurance Policies</Text>
              <ArrowRight size={16} color="#ffffff" />
            </Pressable>
          </View>
        )}

        {/* --- STEP 2: Channel Identification Communications Selector View --- */}
        {currentStep === 2 && (
          <View style={styles.stepFadeAnimationWrapperChassis}>
            <View style={styles.titleSectionBlockLabelRow}>
              <Text style={styles.sectionHeaderHeadlineMainTitleText}>Identity Verification</Text>
              <Text style={styles.sectionHeaderSecondarySubtitleText}>
                Choose a method to receive your verification code.
              </Text>
            </View>

            <View style={styles.selectionCardsVerticalStackList}>
              {/* Linked Mobile Channels Select Block Option */}
              <Pressable
                onPress={() => handleSelectMethod('mobile')}
                style={[styles.selectionOptionRowCardFrame, verificationMethod === 'mobile' ? styles.optionActiveBorderColor : styles.optionInactiveBorderColor]}
              >
                <View style={styles.selectionOptionCircularGraphicIconWrapperBox}>
                  <Smartphone size={20} color="#00478d" />
                </View>
                <View style={styles.selectionOptionTextContentPayloadCluster}>
                  <Text style={styles.selectionCardMainHeaderTitleText}>Linked Mobile</Text>
                  <Text style={styles.selectionCardSecondaryDescriptionStringText}>OTP will be sent to ******4589</Text>
                </View>
                <View style={[styles.radioOuterCircleNodeFrame, verificationMethod === 'mobile' ? styles.radioOuterCircleActiveColor : styles.radioOuterCircleInactiveColor]}>
                  {verificationMethod === 'mobile' && <View style={styles.radioInnerCenterDotValueMarkFilledNode} />}
                </View>
              </Pressable>

              {/* Registered Backup Communications Email Select Block Option */}
              <Pressable
                onPress={() => handleSelectMethod('email')}
                style={[styles.selectionOptionRowCardFrame, verificationMethod === 'email' ? styles.optionActiveBorderColor : styles.optionInactiveBorderColor]}
              >
                <View style={styles.selectionOptionCircularGraphicIconWrapperBox}>
                  <Mail size={20} color="#00478d" />
                </View>
                <View style={styles.selectionOptionTextContentPayloadCluster}>
                  <Text style={styles.selectionCardMainHeaderTitleText}>Registered Email Address</Text>
                  <Text style={styles.selectionCardSecondaryDescriptionStringText}>OTP will be sent to brij***@gmail.com</Text>
                </View>
                <View style={[styles.radioOuterCircleNodeFrame, verificationMethod === 'email' ? styles.radioOuterCircleActiveColor : styles.radioOuterCircleInactiveColor]}>
                  {verificationMethod === 'email' && <View style={styles.radioInnerCenterDotValueMarkFilledNode} />}
                </View>
              </Pressable>
            </View>

            <Pressable
              onPress={() => setCurrentStep(3)}
              style={({ pressed }) => [styles.executionSubmitActionButtonPrimary, pressed && styles.actionButtonPressed]}
            >
              <Text style={styles.executionSubmitActionButtonTextValue}>Send OTP</Text>
            </Pressable>
          </View>
        )}

        {/* --- STEP 3: Cryptographic Otp Token Input Box Verification Ledger --- */}
        {currentStep === 3 && (
          <View style={styles.stepFadeAnimationWrapperChassis}>
            <View style={styles.titleSectionBlockLabelRow}>
              <Text style={styles.sectionHeaderHeadlineMainTitleText}>Enter 6-digit OTP</Text>
              <Text style={styles.sectionHeaderSecondarySubtitleText}>
                A healthcare verification code has been dispatched to your designated contact point.
              </Text>
            </View>

            {/* Split horizontal grids for digit mapping characters outputs layout */}
            <View style={styles.otpHorizontalInputsRowContainer}>
              {otp.map((num, idx) => (
                <TextInput
                  key={idx}
                  ref={(el) => { otpInputsRef.current[idx] = el; }}
                  style={styles.otpSingleDigitCustomBoxInputField}
                  keyboardType="numeric"
                  maxLength={1}
                  value={num}
                  onChangeText={(text) => handleOtpChange(text, idx)}
                  onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, idx)}
                />
              ))}
            </View>

            {/* Countdown timers and trigger action components views */}
            <View style={styles.timerCenterFeedbackWrapperBoxContainer}>
              <Text style={styles.timerDisplayInformationalStringText}>
                Resend verification code in{' '}
                <Text style={styles.timerClockStringNumericMonoValueText}>
                  00:{timer < 10 ? `0${timer}` : timer}
                </Text>
              </Text>
              {timer === 0 && (
                <Pressable onPress={() => setTimer(59)}>
                  <Text style={styles.resendSMSActionAnchorLinkStringText}>Resend SMS OTP Now</Text>
                </Pressable>
              )}
            </View>

            <Pressable
              onPress={() => setCurrentStep(4)}
              style={({ pressed }) => [styles.executionSubmitActionButtonPrimary, pressed && styles.actionButtonPressed]}
            >
              <Text style={styles.executionSubmitActionButtonTextValue}>Verify &amp; Discover Policies</Text>
            </Pressable>
          </View>
        )}

        {/* --- STEP 4: Live Verified Policy Discovery Output Cards Listings --- */}
        {currentStep === 4 && (
          <View style={styles.stepFadeAnimationWrapperChassis}>
            <View style={styles.accountVerifiedSummaryStatusBadgeFlexRowCard}>
              <Text style={styles.accountVerifiedTotalCountTextLabel}>Policies Found (2)</Text>
              <View style={styles.accountVerifiedLabelCapsuleBadge}>
                <CheckCircle2 size={12} color="#047857" />
                <Text style={styles.accountVerifiedLabelTextValue}>Verified Account</Text>
              </View>
            </View>

            {/* Render loop mapping dynamically to items cards layouts grids arrays structures definitions */}
            <View style={styles.insuranceCardsListVerticalStackLayout}>
              {POLICIES_MOCK_DATA.map((policy) => (
                <View key={policy.id} style={styles.policyCardFrameChassisContainer}>
                  {/* Card Section Header Content Title parameters row block */}
                  <View style={styles.policyCardHeaderBlockFlexRow}>
                    <View style={styles.policyCardHeaderInsurerLogoWrapperRowLayout}>
                      <View style={styles.insurerImageLogoBoundingBoxWidgetFrameContainer}>
                        <Image
                          style={styles.insurerImageLogoNativeElementGraphic}
                          source={{ uri: policy.logoUrl }}
                          resizeMode="contain"
                        />
                      </View>
                      <View style={styles.insurerTextMetaDataClusterBox}>
                        <Text style={styles.insurerMainCompanyTitleTextHeadline}>{policy.name}</Text>
                        <Text style={styles.insurerActivePlanNameSubStringText}>{policy.planName}</Text>
                      </View>
                    </View>
                    <View style={styles.activeStatusLabelFlagBadgeCapsule}>
                      <Text style={styles.activeStatusLabelFlagBadgeTextValue}>Active</Text>
                    </View>
                  </View>

                  {/* Quantitative Data Value Tables Grid Parameters columns block segment */}
                  <View style={styles.policyCardMetricsGridContainerTableBlock}>
                    <View style={styles.policyMetricGridCellSplitHalfItem}>
                      <Text style={styles.policyMetricCellLabelHeadlineText}>Policy Number</Text>
                      <Text style={styles.policyMetricCellMainValueMonoBoldStringText}>{policy.policyNumber}</Text>
                    </View>
                    <View style={styles.policyMetricGridCellSplitHalfItem}>
                      <Text style={styles.policyMetricCellLabelHeadlineText}>Sum Insured</Text>
                      <Text style={styles.policyMetricCellMainValueNumericBlueStringText}>{policy.sumInsured}</Text>
                    </View>
                    <View style={styles.policyMetricGridCellSplitHalfItem}>
                      <Text style={styles.policyMetricCellLabelHeadlineText}>Validity Limit</Text>
                      <Text style={styles.policyMetricCellMainValueDateStringText}>{policy.validity}</Text>
                    </View>
                    <View style={styles.policyMetricGridCellSplitHalfItemBtnLinkRowRightAligned}>
                      <Pressable style={styles.viewBenefitsAnchorPressableInlineLink}>
                        <Text style={styles.viewBenefitsAnchorLinkTextLabelValue}>View Benefits</Text>
                        <ArrowRight size={10} color="#00478d" />
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}

              {/* Reset layout linking loop trigger buttons component segment elements */}
              <Pressable
                onPress={handleRestartLinking}
                style={({ pressed }) => [styles.linkAnotherPolicyDashedActionButtonBox, pressed && styles.dashedCardPressed]}
              >
                <Plus size={16} color="#475569" />
                <Text style={styles.linkAnotherPolicyActionButtonTextValueLabel}>Link Another Policy</Text>
              </Pressable>
            </View>
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  masterWrapper: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollCanvas: {
    flex: 1,
    paddingHorizontal: 16,
  },
  /* --- Unified Brand Header Section Layout Styles --- */
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
    marginTop: 2,
  },
  /* --- Stepper Progress Dots Track Styles --- */
  stepperProgressRowChassis: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  stepDotButtonContainer: {
    padding: 4,
  },
  stepDotIndicatorNode: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  stepDotActive: {
    backgroundColor: '#00478d',
    borderWidth: 4,
    borderColor: '#dbeafe',
  },
  stepDotInactive: {
    backgroundColor: '#cbd5e1',
  },
  stepConnectorHorizontalLineBar: {
    flex: 1,
    height: 2,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
  },
  stepFadeAnimationWrapperChassis: {
    gap: 16,
  },
  /* --- STEP 1: Inputs and Fields Boxes Content layout --- */
  formGroupInputsCardChassisContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 20,
    gap: 14,
  },
  inputFieldHeadlineLabelTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: '#94a3b8',
  },
  inputFieldRowFlexHorizontalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  abhaIdCustomMonospaceTextInput: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#00478d',
    paddingVertical: 0,
  },
  validatedGreenCircleMarkInlineBadge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldInformationalHelpParagraphText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
  executionSubmitActionButtonPrimary: {
    backgroundColor: '#00478d',
    borderRadius: 14,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonPressed: {
    opacity: 0.9,
    backgroundColor: '#003366',
  },
  executionSubmitActionButtonTextValue: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  /* --- STEP 2: Selection Options Configurations Block Layout --- */
  titleSectionBlockLabelRow: {
    gap: 4,
    marginBottom: 8,
  },
  sectionHeaderHeadlineMainTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  sectionHeaderSecondarySubtitleText: {
    fontSize: 12,
    color: '#64748b',
  },
  selectionCardsVerticalStackList: {
    gap: 12,
  },
  selectionOptionRowCardFrame: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  optionActiveBorderColor: {
    borderColor: '#00478d',
    backgroundColor: '#eff6ff',
  },
  optionInactiveBorderColor: {
    borderColor: '#e2e8f0',
  },
  selectionOptionCircularGraphicIconWrapperBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionOptionTextContentPayloadCluster: {
    flex: 1,
    gap: 2,
  },
  selectionCardMainHeaderTitleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  selectionCardSecondaryDescriptionStringText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  radioOuterCircleNodeFrame: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterCircleActiveColor: {
    borderColor: '#00478d',
    backgroundColor: '#00478d',
  },
  radioOuterCircleInactiveColor: {
    borderColor: '#cbd5e1',
    backgroundColor: 'transparent',
  },
  radioInnerCenterDotValueMarkFilledNode: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  /* --- STEP 3: Verification Ledger Inputs And Clocks Timer --- */
  otpHorizontalInputsRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  otpSingleDigitCustomBoxInputField: {
    flex: 1,
    height: 56,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#00478d',
    paddingVertical: 0,
  },
  timerCenterFeedbackWrapperBoxContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    gap: 6,
  },
  timerDisplayInformationalStringText: {
    fontSize: 12,
    color: '#64748b',
  },
  timerClockStringNumericMonoValueText: {
    fontWeight: '700',
    color: '#00478d',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  resendSMSActionAnchorLinkStringText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00478d',
    textDecorationLine: 'underline',
  },
  /* --- STEP 4: Policy Card Viewports Layout Table Elements --- */
  accountVerifiedSummaryStatusBadgeFlexRowCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 1,
  },
  accountVerifiedTotalCountTextLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  accountVerifiedLabelCapsuleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#d1fae5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 4,
  },
  accountVerifiedLabelTextValue: {
    fontSize: 10,
    fontWeight: '700',
    color: '#047857',
  },
  insuranceCardsListVerticalStackLayout: {
    gap: 14,
    paddingBottom: 110, // Safeguards clearance boundaries from the sticky navigation footer layout nodes
  },
  policyCardFrameChassisContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  policyCardHeaderBlockFlexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 12,
    marginBottom: 12,
  },
  policyCardHeaderInsurerLogoWrapperRowLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  insurerImageLogoBoundingBoxWidgetFrameContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
  },
  insurerImageLogoNativeElementGraphic: {
    width: 32,
    height: 32,
  },
  insurerTextMetaDataClusterBox: {
    flex: 1,
    gap: 2,
  },
  insurerMainCompanyTitleTextHeadline: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  insurerActivePlanNameSubStringText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  activeStatusLabelFlagBadgeCapsule: {
    backgroundColor: '#d1fae5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  activeStatusLabelFlagBadgeTextValue: {
    fontSize: 10,
    fontWeight: '700',
    color: '#064e3b',
    textTransform: 'uppercase',
  },
  policyCardMetricsGridContainerTableBlock: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 14,
  },
  policyMetricGridCellSplitHalfItem: {
    width: '50%',
    gap: 2,
  },
  policyMetricGridCellSplitHalfItemBtnLinkRowRightAligned: {
    width: '50%',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  policyMetricCellLabelHeadlineText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
  },
  policyMetricCellMainValueMonoBoldStringText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
    color: '#334155',
    letterSpacing: 0.3,
  },
  policyMetricCellMainValueNumericBlueStringText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00478d',
  },
  policyMetricCellMainValueDateStringText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  viewBenefitsAnchorPressableInlineLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  viewBenefitsAnchorLinkTextLabelValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00478d',
  },
  linkAnotherPolicyDashedActionButtonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    borderRadius: 16,
    height: 56,
    gap: 8,
    marginTop: 4,
    backgroundColor: '#ffffff',
  },
  dashedCardPressed: {
    backgroundColor: '#f8fafc',
    borderColor: '#00478d',
  },
  linkAnotherPolicyActionButtonTextValueLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
});