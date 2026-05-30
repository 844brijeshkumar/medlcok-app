import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Heart,
  ShieldAlert,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

// --- Types ---
interface SlotType {
  id: string;
  date: string;
  time: string;
  location: string;
  zone: string;
}

interface DeferralAlertProps {
  reason: string;
  days: number;
  onBackToDashboard: () => void;
}

interface SlotBookingProps {
  onBookingComplete: () => void;
  onBackToDashboard: () => void;
}

interface DonateBookingScreenProps {
  onBackToDashboard: () => void;
}

// --- Native Date Helpers ---
const getFutureIsoDate = (daysToAdd: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysToAdd);
  return d.toISOString();
};

const formatToShortDate = (isoString: string): string => {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatToLongDate = (dateObj: Date): string => {
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

// --- Mock Axios Architecture Gateway ---
const mockAxios = {
  post: async (url: string, payload: any, config?: { headers?: { Authorization?: string } }) => {
    await new Promise((r) => setTimeout(r, 1200));
    if (!config?.headers?.Authorization) throw new Error('401 Unauthorized');
    return { data: { success: true, message: 'Operation successful' } };
  },
  get: async (url: string, config?: { headers?: { Authorization?: string } }) => {
    await new Promise((r) => setTimeout(r, 1000));
    if (!config?.headers?.Authorization) throw new Error('401 Unauthorized');

    return {
      data: {
        slots: [
          { id: 's1', date: getFutureIsoDate(1), time: '09:00 AM', location: 'City Care Multi-Specialty', zone: 'Zone A' },
          { id: 's2', date: getFutureIsoDate(1), time: '10:30 AM', location: 'LifeLine General Hospital', zone: 'Zone A' },
          { id: 's3', date: getFutureIsoDate(2), time: '01:00 PM', location: 'Apex Cardiac Center', zone: 'Zone B' },
          { id: 's4', date: getFutureIsoDate(3), time: '11:15 AM', location: 'Standard Diagnosis Clinic', zone: 'Zone C' },
          { id: 's5', date: getFutureIsoDate(3), time: '02:00 PM', location: 'Jeevan Jyoti Government Hospital', zone: 'Zone A' },
        ] as SlotType[],
      },
    };
  },
};

const QUESTIONS = [
  { id: 'infection', text: 'Are you currently taking antibiotics or recovering from an infection?', deferralDays: 14, trigger: 'ACTIVE_INFECTION' },
  { id: 'tattoo', text: 'Have you had a tattoo, piercing, or acupuncture in the last 6 months?', deferralDays: 180, trigger: 'RECENT_TATTOO' },
  { id: 'travel', text: 'Have you traveled outside the country in the last 3 months?', deferralDays: 90, trigger: 'INTERNATIONAL_TRAVEL' },
];

// --- Sub-Component 1: DeferralAlert ---
const DeferralAlert = ({ reason, days, onBackToDashboard }: DeferralAlertProps) => {
  const eligibleDate = new Date();
  eligibleDate.setDate(eligibleDate.getDate() + (days || 0));

  return (
    <View style={styles.deferralCardChassis}>
      <View style={styles.deferralTopLineIndicator} />
      <View style={styles.deferralPaddingContainer}>
        <View style={styles.deferralIconOuterCircle}>
          <ShieldAlert size={32} color="#d97706" />
        </View>
        <Text style={styles.deferralMainHeadingText}>Temporary Deferral</Text>
        <Text style={styles.deferralSecondaryDescriptionText}>
          For your safety and the safety of patients, we must pause your booking process.
        </Text>

        <View style={styles.deferralGrayMetadataTableBox}>
          <View style={styles.metadataCellGapBlock}>
            <Text style={styles.metadataLabelHeadlineText}>Reason Triggered</Text>
            <Text style={styles.metadataValueStringText}>{reason}</Text>
          </View>
          <View style={styles.metadataCellGapBlock}>
            <Text style={styles.metadataLabelHeadlineText}>Next Eligible Date</Text>
            <View style={styles.eligibleDateFlexRowInlineContainer}>
              <Calendar size={14} color="#059669" />
              <Text style={styles.eligibleDateValueStringText}>{formatToLongDate(eligibleDate)}</Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={onBackToDashboard}
          style={({ pressed }) => [styles.returnToDashboardPressableLinkButton, pressed && styles.returnButtonPressed]}
        >
          <Text style={styles.returnToDashboardActionButtonTextValueLabel}>Return to Dashboard</Text>
        </Pressable>
      </View>
    </View>
  );
};

// --- Sub-Component 2: SlotBooking ---
const SlotBooking = ({ onBookingComplete, onBackToDashboard }: SlotBookingProps) => {
  const [slots, setSlots] = useState<SlotType[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingSlotId, setBookingSlotId] = useState<string | null>(null);

  // Filter States
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedHospital, setSelectedHospital] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    let isMounted = true;
    mockAxios
      .get('/api/v1/clinics/slots', { headers: { Authorization: 'Bearer mock_jwt' } })
      .then((res) => {
        if (isMounted) {
          setSlots(res.data.slots);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to fetch slots', err);
          setLoading(false);
        }
      });
    return () => { isMounted = false; };
  }, []);

  const handleBook = async (slotId: string) => {
    setBookingSlotId(slotId);
    try {
      await mockAxios.post('/api/v1/appointments/book', { slot_id: slotId }, { headers: { Authorization: 'Bearer mock_jwt' } });

      const targetSlot = slots.find((s) => s.id === slotId);
      if (targetSlot) {
        const newId = `apt_${Date.now()}`;
        const randomTicketNum = Math.floor(1000 + Math.random() * 9000);
        const newApt = {
          Id: newId,
          Name: `BLD-2026-${randomTicketNum}`,
          HospitalName: targetSlot.location,
          Hospital__r: {
            Name: targetSlot.location,
            Address: targetSlot.location + ', Mumbai',
          },
          Doctor__r: { Name: 'Clinical Staff Lead' },
          Department__c: 'Blood Donation Intake',
          Date__c: targetSlot.date,
          Time__c: targetSlot.time,
          Status__c: 'Pending',
          Notes__c: `O+ whole blood donation. Slot secured in ${targetSlot.zone}.`,
        };

        try {
          if (typeof localStorage !== 'undefined') {
            const stored = localStorage.getItem('user_appointments_list');
            let list = stored ? JSON.parse(stored) : [];
            list.unshift(newApt);
            localStorage.setItem('user_appointments_list', JSON.stringify(list));
          }
          if (typeof window !== 'undefined' && typeof Event !== 'undefined') {
            window.dispatchEvent(new Event('storage'));
          }
        } catch (e) {
          console.warn('Storage layout save bypassed on native framework device modules:', e);
        }
      }
      onBookingComplete();
    } catch (err) {
      Alert.alert('Slot Unavailable', 'This slot was just booked by someone else! Please select another.');
      setBookingSlotId(null);
    }
  };

  const triggerZoneSelectorAlertMenu = () => {
    const uniqueZones = ['All', ...Array.from(new Set(slots.map((s) => s.zone)))];
    Alert.alert('Select Zone', 'Filter listings by sector territory region:', [
      ...uniqueZones.map((z) => ({
        text: z,
        onPress: () => { setSelectedZone(z); setSelectedHospital('All'); },
      })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const triggerHospitalSelectorAlertMenu = () => {
    const filteredHospitals = ['All', ...Array.from(new Set(slots.filter((s) => selectedZone === 'All' || s.zone === selectedZone).map((s) => s.location)))];
    Alert.alert('Select Hospital Facility', 'Direct OPD location filter assignment:', [
      ...filteredHospitals.map((h) => ({
        text: h,
        onPress: () => setSelectedHospital(h),
      })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loaderCentralizedPaddingWrapperFrame}>
        <ActivityIndicator size="large" color="#059669" style={{ marginBottom: 12 }} />
        <Text style={styles.loaderInformationalStringText}>Finding available donation slots near you...</Text>
      </View>
    );
  }

  const filteredSlots = slots.filter((slot) => {
    const slotDateStr = new Date(slot.date).toISOString().split('T')[0];
    const matchZone = selectedZone === 'All' || slot.zone === selectedZone;
    const matchHospital = selectedHospital === 'All' || slot.location === selectedHospital;
    const matchDate = !selectedDate || slotDateStr === selectedDate;
    return matchZone && matchHospital && matchDate;
  });

  return (
    <View style={styles.bookingModuleChassisChassisContainer}>
      <View style={styles.bookingTopLineAccentIndicatorBar} />
      <View style={styles.bookingPaddingContainer}>
        
        {/* THE FIX: Replaced <div> with <View> */}
        <View style={styles.bookingConfirmedHeaderWrapperFlexRow}>
          <View style={styles.bookingConfirmedIconCapsuleBoxBorderFrame}>
            <CheckCircle2 size={24} color="#059669" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bookingConfirmedHeaderMainTitleText}>Eligibility Confirmed!</Text>
            <Text style={styles.bookingConfirmedHeaderSecondarySubtitleText}>
              Select a hospital zone, specific hospital, and date to find available times.
            </Text>
          </View>
        </View>

        <View style={styles.filtersGrayCardChassisWrapperBlockRow}>
          <View style={styles.rowGridSplitCellHalfItem}>
            <Text style={styles.selectBoxLabelHeadlineFieldTitle}>Hospital Zone</Text>
            <Pressable onPress={triggerZoneSelectorAlertMenu} style={styles.simulatedSelectFieldContainerBox}>
              <Text style={styles.simulatedSelectActiveValueStringLabel} numberOfLines={1}>{selectedZone}</Text>
              <Text style={styles.dropdownMiniArrowIconSymbol}>▼</Text>
            </Pressable>
          </View>

          <View style={styles.rowGridSplitCellHalfItem}>
            <Text style={styles.selectBoxLabelHeadlineFieldTitle}>Hospital</Text>
            <Pressable onPress={triggerHospitalSelectorAlertMenu} style={styles.simulatedSelectFieldContainerBox}>
              <Text style={styles.simulatedSelectActiveValueStringLabel} numberOfLines={1}>{selectedHospital}</Text>
              <Text style={styles.dropdownMiniArrowIconSymbol}>▼</Text>
            </Pressable>
          </View>

          <View style={styles.rowGridSplitCellHalfItem}>
            <Text style={styles.selectBoxLabelHeadlineFieldTitle}>Specific Date</Text>
            <View style={styles.simulatedSelectFieldContainerBox}>
              <TextInput
                style={styles.dateTextInputEditableValueInputField}
                value={selectedDate}
                onChangeText={setSelectedDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>
        </View>

        <View style={styles.slotsCardsWrapperVerticalStackListContainer}>
          {filteredSlots.length === 0 ? (
            <View style={styles.emptyResultsChassisWidgetFrame}>
              <Calendar size={24} color="#cbd5e1" style={{ marginBottom: 6 }} />
              <Text style={styles.emptyStatePrimaryFeedbackText}>No slots found for this selection.</Text>
              <Pressable onPress={() => { setSelectedZone('All'); setSelectedHospital('All'); setSelectedDate(''); }}>
                <Text style={styles.emptyResultsResetActionAnchorLinkString}>Clear Filters</Text>
              </Pressable>
            </View>
          ) : (
            filteredSlots.map((slot) => (
              <View key={slot.id} style={styles.slotListItemRowLayoutChassisFrame}>
                <View style={styles.slotMetaDataContentColumnPayloadCluster}>
                  <View style={styles.slotMetaIconTextInlineRowItemBox}>
                    <Calendar size={14} color="#94a3b8" style={styles.cellInlineIcon} />
                    <Text style={styles.slotDateStringValueLabelText}>{formatToShortDate(slot.date)}</Text>
                  </View>
                  <View style={styles.slotMetaIconTextInlineRowItemBox}>
                    <Clock size={14} color="#94a3b8" style={styles.cellInlineIcon} />
                    <Text style={styles.slotTimeStringValueLabelText}>{slot.time}</Text>
                  </View>
                  <View style={styles.slotCapsuleLabelTagWrapperBadge}>
                    <Text style={styles.slotCapsuleTextLabelValueString} numberOfLines={1}>
                      <Text style={{ color: '#059669', fontWeight: 'bold' }}>{slot.zone}:</Text> {slot.location}
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => handleBook(slot.id)}
                  disabled={bookingSlotId !== null}
                  style={styles.slotConfirmActionButtonCapsuleTrigger}
                >
                  {bookingSlotId === slot.id ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.slotConfirmActionButtonTextValueLabel}>Confirm Slot</Text>
                  )}
                </Pressable>
              </View>
            ))
          )}
        </View>

        <View style={styles.bottomControlFooterActionToolbarRowGroup}>
          <Pressable onPress={onBackToDashboard}>
            <Text style={styles.cancelReturnSecondaryActionAnchorLinkString}>Cancel &amp; Return</Text>
          </Pressable>
        </View>

      </View>
    </View>
  );
};

// --- Main Primary Component Root Controller ---
export default function DonateBookingScreen({ onBackToDashboard }: DonateBookingScreenProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [deferralData, setDeferralData] = useState<{ reason: string; days: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [flowComplete, setFlowComplete] = useState(false);

  const isGatekeeperComplete = stepIndex >= QUESTIONS.length;
  const currentQuestion = QUESTIONS[stepIndex] || QUESTIONS[QUESTIONS.length - 1];

  const handleAnswer = async (answer: 'yes' | 'no') => {
    if (answer === 'yes') {
      setIsProcessing(true);
      try {
        const eligibleDate = new Date();
        eligibleDate.setDate(eligibleDate.getDate() + (currentQuestion?.deferralDays || 0));

        await mockAxios.post(
          '/api/v1/user/deferral',
          {
            deferral_trigger: currentQuestion?.trigger,
            calculated_eligibility_date: eligibleDate.toISOString(),
          },
          { headers: { Authorization: 'Bearer mock_jwt' } }
        );

        setDeferralData({ reason: currentQuestion?.text, days: currentQuestion?.deferralDays });
      } catch (err) {
        setDeferralData({ reason: currentQuestion?.text, days: currentQuestion?.deferralDays });
      } finally {
        // THE FIX: Added the 'finally' keyword here
        setIsProcessing(false);
      }
    } else {
      setStepIndex((prev) => prev + 1);
    }
  };

  if (flowComplete) {
    return (
      <View style={styles.successScreenCenterWidgetCanvasWrapperChassis}>
        <View style={styles.successFormGroupBlockDetailsCardSurface}>
          <View style={styles.successCircularGraphicIconOuterCircleContainerFrame}>
            <Heart size={32} color="#ffffff" fill="#ffffff" />
          </View>
          <Text style={styles.successHeaderHeadlineMainTitleLabelBoldText}>Appointment Confirmed!</Text>
          <Text style={styles.successSecondaryBodyDescriptionParagraphTextText}>
            Thank you for scheduling your life-saving blood donation appointment. Your booking has been registered.
          </Text>
          <Pressable
            onPress={onBackToDashboard}
            style={({ pressed }) => [styles.successActionSubmitPrimaryButtonField, pressed && styles.actionButtonPressed]}
          >
            <Text style={styles.successActionSubmitPrimaryButtonTextValueString}>Go to My Dashboard</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.masterWrapperFrameChassis}>
      <ScrollView style={styles.scrollCanvas} showsVerticalScrollIndicator={false}>
        
        {!deferralData && !isGatekeeperComplete && (
          <Pressable onPress={onBackToDashboard} style={styles.exitIntakeTopNavigationRowPressableLink}>
            <ArrowLeft size={14} color="#64748b" style={styles.cellInlineIcon} />
            <Text style={styles.exitIntakeTopNavigationRowLinkTextValueLabel}>Exit Intake Flow</Text>
          </Pressable>
        )}

        {deferralData ? (
          <DeferralAlert reason={deferralData.reason} days={deferralData.days} onBackToDashboard={onBackToDashboard} />
        ) : isGatekeeperComplete ? (
          <SlotBooking onBookingComplete={() => setFlowComplete(true)} onBackToDashboard={onBackToDashboard} />
        ) : (
          <View style={styles.questionCardChassisContainerChassisFrame}>
            <View style={styles.progressBarTrackContainerBackgroundField}>
              <View
                style={[
                  styles.progressBarActiveFilledNodeBar,
                  { width: `${((stepIndex + 1) / QUESTIONS.length) * 100}%` },
                ]}
              />
            </View>

            <View style={styles.questionPaddingContainerBlockCard}>
              <Text style={styles.questionIndexCounterHeadlineLabelTitleText}>
                Safety Check — Question {stepIndex + 1} of {QUESTIONS.length}
              </Text>

              <Text style={styles.questionMainHeaderContentTitleLabelBodyText}>
                {currentQuestion?.text}
              </Text>

              <View style={styles.questionActionsGridSplitRowFlexBoxContainer}>
                <Pressable
                  disabled={isProcessing}
                  onPress={() => handleAnswer('yes')}
                  style={styles.actionChoiceTriggerYesButtonCapsule}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="#ef4444" />
                  ) : (
                    <Text style={styles.actionChoiceTriggerYesButtonTextValueString}>Yes (Decline/Trigger)</Text>
                  )}
                </Pressable>

                <Pressable
                  disabled={isProcessing}
                  onPress={() => handleAnswer('no')}
                  style={styles.actionChoiceTriggerNoButtonCapsule}
                >
                  <Text style={styles.actionChoiceTriggerNoButtonTextValueString}>No (Pass Check)</Text>
                </Pressable>
              </View>

              <Text style={styles.disclaimerInformationalHelpParagraphTextStringText}>
                Please answer truthfully. These guidelines assure safe standards for your well-being and patients receiving therapy.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  masterWrapperFrameChassis: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollCanvas: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  exitIntakeTopNavigationRowPressableLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
    paddingVertical: 4,
  },
  exitIntakeTopNavigationRowLinkTextValueLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  cellInlineIcon: {
    marginRight: 2,
  },
  /* --- Deferral Screen Styles blocks --- */
  deferralCardChassis: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 4,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    marginTop: 20,
  },
  deferralTopLineIndicator: {
    height: 8,
    backgroundColor: '#f59e0b',
  },
  deferralPaddingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  deferralIconOuterCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  deferralMainHeadingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
  deferralSecondaryDescriptionText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 20,
  },
  deferralGrayMetadataTableBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    gap: 14,
    marginBottom: 20,
  },
  metadataCellGapBlock: {
    gap: 4,
  },
  metadataLabelHeadlineText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metadataValueStringText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  eligibleDateFlexRowInlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  eligibleDateValueStringText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
  returnToDashboardPressableLinkButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  returnButtonPressed: {
    backgroundColor: '#e2e8f0',
  },
  returnToDashboardActionButtonTextValueLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  /* --- Slot Booking Modules Elements block containers styles --- */
  loaderCentralizedPaddingWrapperFrame: {
    paddingVertical: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderInformationalStringText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  bookingModuleChassisChassisContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 4,
    width: '100%',
    alignSelf: 'center',
  },
  bookingTopLineAccentIndicatorBar: {
    height: 8,
    backgroundColor: '#059669',
  },
  bookingPaddingContainer: {
    padding: 20,
  },
  bookingConfirmedHeaderWrapperFlexRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 20,
  },
  bookingConfirmedIconCapsuleBoxBorderFrame: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: 'rgba(167, 243, 208, 0.5)',
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingConfirmedHeaderMainTitleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  bookingConfirmedHeaderSecondarySubtitleText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
    marginTop: 2,
  },
  filtersGrayCardChassisWrapperBlockRow: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    marginBottom: 20,
  },
  rowGridSplitCellHalfItem: {
    gap: 4,
  },
  selectBoxLabelHeadlineFieldTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 2,
  },
  simulatedSelectFieldContainerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  simulatedSelectActiveValueStringLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  dropdownMiniArrowIconSymbol: {
    fontSize: 8,
    color: '#94a3b8',
  },
  dateTextInputEditableValueInputField: {
    flex: 1,
    fontSize: 12,
    color: '#334155',
    paddingVertical: 0,
  },
  slotsCardsWrapperVerticalStackListContainer: {
    gap: 12,
  },
  emptyResultsChassisWidgetFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    borderRadius: 14,
    gap: 4,
  },
  emptyStatePrimaryFeedbackText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  emptyResultsResetActionAnchorLinkString: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
    marginTop: 4,
  },
  slotListItemRowLayoutChassisFrame: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  slotMetaDataContentColumnPayloadCluster: {
    flex: 1,
    gap: 6,
  },
  slotMetaIconTextInlineRowItemBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  slotDateStringValueLabelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
  },
  slotTimeStringValueLabelText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  slotCapsuleLabelTagWrapperBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  slotCapsuleTextLabelValueString: {
    fontSize: 10,
    fontWeight: '500',
    color: '#334155',
  },
  slotConfirmActionButtonCapsuleTrigger: {
    backgroundColor: '#00478d',
    borderRadius: 8,
    height: 36,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  slotConfirmActionButtonTextValueLabel: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '750',
  },
  bottomControlFooterActionToolbarRowGroup: {
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
    marginTop: 20,
    paddingTop: 14,
    alignItems: 'flex-end',
  },
  cancelReturnSecondaryActionAnchorLinkString: {
    fontSize: 12,
    fontWeight: '650',
    color: '#94a3b8',
  },
  /* --- Safety Check Questions Track Component styles --- */
  questionCardChassisContainerChassisFrame: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 4,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
    marginTop: 12,
  },
  progressBarTrackContainerBackgroundField: {
    height: 6,
    backgroundColor: '#f1f5f9',
    width: '100%',
  },
  progressBarActiveFilledNodeBar: {
    height: '105%',
    backgroundColor: '#dc2626',
    borderRadius: 99,
  },
  questionPaddingContainerBlockCard: {
    padding: 20,
  },
  questionIndexCounterHeadlineLabelTitleText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
    color: '#00478d',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  questionMainHeaderContentTitleLabelBodyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: 22,
    minHeight: 56,
  },
  questionActionsGridSplitRowFlexBoxContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  actionChoiceTriggerYesButtonCapsule: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionChoiceTriggerYesButtonTextValueString: {
    fontSize: 12,
    fontWeight: '750',
    color: '#b91c1c',
    textAlign: 'center',
  },
  actionChoiceTriggerNoButtonCapsule: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    backgroundColor: '#ecfdf5',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionChoiceTriggerNoButtonTextValueString: {
    fontSize: 12,
    fontWeight: '750',
    color: '#047857',
    textAlign: 'center',
  },
  disclaimerInformationalHelpParagraphTextStringText: {
    fontSize: 10,
    color: '#94a3b8',
    lineHeight: 14,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 4,
  },
  /* --- Success Portal Component layouts block elements styles --- */
  successScreenCenterWidgetCanvasWrapperChassis: {
    paddingVertical: 32,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  successFormGroupBlockDetailsCardSurface: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 5,
  },
  successCircularGraphicIconOuterCircleContainerFrame: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successHeaderHeadlineMainTitleLabelBoldText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  successSecondaryBodyDescriptionParagraphTextText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  successActionSubmitPrimaryButtonField: {
    backgroundColor: '#00478d',
    borderRadius: 12,
    height: 44,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonPressed: {
    opacity: 0.9,
    backgroundColor: '#003366',
  },
  successActionSubmitPrimaryButtonTextValueString: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});