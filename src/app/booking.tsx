import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import {
  MapPin,
  Building,
  Activity,
  Heart,
  Calendar,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react-native';

// --- TypeScript Configuration Boundaries ---
interface Hospital {
  id: string;
  name: string;
  type: string;
  address: string;
  iconName: 'clinical_notes' | 'emergency' | 'building';
}

interface UserProfile {
  name: string;
}

interface BookingScreenProps {
  user: UserProfile;
  selectedCategory?: string;
  setSelectedCategory?: (cat: string) => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  selectedState?: string;
  setSelectedState?: (s: string) => void;
  selectedDistrict?: string;
  setSelectedDistrict?: (d: string) => void;
}

// --- SECURE INLINE DATA BLUEPRINT (Guarantees immediate zero-error compilation) ---
const HOSPITALS_MOCK_LIST: Hospital[] = [
  {
    id: 'h1',
    name: 'City Care Multi-Specialty Hospital',
    type: 'Private Hospital',
    address: '12th Floor, Metro Tower, West Mumbai, Maharashtra - 400001',
    iconName: 'building',
  },
  {
    id: 'h2',
    name: 'Apex Cardiac & Imaging Center',
    type: 'Private Hospital',
    address: 'Sector 8, Airoli, Navi Mumbai, Maharashtra - 400708',
    iconName: 'emergency',
  },
  {
    id: 'h3',
    name: 'Red Cross Blood Bank & Wellness Center',
    type: 'Clinics / Blood Bank',
    address: 'Hill Road, Bandra West, Mumbai, Maharashtra - 400050',
    iconName: 'clinical_notes',
  },
  {
    id: 'h4',
    name: 'General Government District Infirmary',
    type: 'Gov. Hospital',
    address: 'Vikas Marg, Sector 5, Vashi, Navi Mumbai, Maharashtra - 400703',
    iconName: 'building',
  },
];

export default function BookingScreen({
  user,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  selectedState: propState,
  setSelectedState: setSelectedStateProp,
  selectedDistrict: propDistrict,
  setSelectedDistrict: setSelectedDistrictProp,
}: BookingScreenProps) {
  const [localType, setLocalType] = useState<string>('');
  const [localTerm, setLocalTerm] = useState<string>('');
  const [localState, setLocalState] = useState<string>('');
  const [localDistrict, setLocalDistrict] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Fallback mappings mirroring original web architecture logic exactly
  const selectedType = selectedCategory !== undefined
    ? (selectedCategory === 'all' ? '' : selectedCategory)
    : localType;
  const setSelectedType = setSelectedCategory
    ? (type: string) => setSelectedCategory(type)
    : setLocalType;

  const searchTerm = searchQuery !== undefined ? searchQuery : localTerm;
  const setSearchTerm = setSearchQuery ? (q: string) => setSearchQuery(q) : setLocalTerm;

  const selectedState = propState !== undefined
    ? (propState === 'MH' ? 'Maharashtra' : propState === 'DL' ? 'Delhi' : propState)
    : localState;
  const setSelectedState = setSelectedStateProp
    ? (state: string) => setSelectedStateProp(state === 'Maharashtra' ? 'MH' : state === 'Delhi' ? 'DL' : state)
    : setLocalState;

  const selectedDistrict = propDistrict !== undefined
    ? (propDistrict === 'mum' ? 'Mumbai' : propDistrict === 'pune' ? 'Pune' : propDistrict)
    : localDistrict;
  const setSelectedDistrict = setSelectedDistrictProp
    ? (dist: string) => setSelectedDistrictProp(dist === 'Mumbai' ? 'mum' : dist === 'Pune' ? 'pune' : dist)
    : setLocalDistrict;

  // Active dialogue flow controller states
  const [activeHospital, setActiveHospital] = useState<Hospital | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('2026-05-28');
  const [selectedTime, setSelectedTime] = useState<string>('10:00 AM');
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

  // Filtering computational list pipeline array matching web requirements
  const filteredHospitals = HOSPITALS_MOCK_LIST.filter((h) => {
    const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          h.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || h.type === selectedType;
    const matchesState = !selectedState || h.address.toLowerCase().includes(selectedState.toLowerCase());
    
    return matchesSearch && matchesType && matchesState;
  });

  const handleBookClick = (hospital: Hospital) => {
    setActiveHospital(hospital);
    setBookingSuccess(false);
  };

  // Safe Appointment Storage Commit Pipeline Guarding Against Native Storage Skews
  const handleConfirmBooking = () => {
    if (activeHospital) {
      const newId = `apt_${Date.now()}`;
      const randomTicketNum = Math.floor(1000 + Math.random() * 9000);
      const newApt = {
        Id: newId,
        Name: `OPD-2026-${randomTicketNum}`,
        HospitalName: activeHospital.name,
        Hospital__r: {
          Name: activeHospital.name,
          Address: activeHospital.address
        },
        Doctor__r: { Name: "Alok Sharma" },
        Department__c: activeHospital.type === 'Clinics / Blood Bank' ? "Pathology & Tests" : "General OPD Consulta.",
        Date__c: selectedDate,
        Time__c: selectedTime,
        Status__c: "Pending",
        Notes__c: "Scheduled successfully. Please carry your dynamic card QR."
      };

      try {
        if (typeof localStorage !== 'undefined') {
          const stored = localStorage.getItem("user_appointments_list");
          let list = stored ? JSON.parse(stored) : [];
          list.unshift(newApt);
          localStorage.setItem("user_appointments_list", JSON.stringify(list));
        }
        if (typeof window !== 'undefined' && typeof Event !== 'undefined') {
          window.dispatchEvent(new Event("storage"));
        }
      } catch (e) {
        console.warn('Local storage write bypassed on native device framework platform:', e);
      }
    }

    setBookingSuccess(true);
    setTimeout(() => {
      setActiveHospital(null);
      setBookingSuccess(false);
    }, 2500);
  };

  // --- Native Dropdown Prompt Pickers ---
  const triggerTimeSlotPicker = () => {
    Alert.alert('Select Consultation Window Slot', 'Available reservation listings:', [
      { text: '09:00 AM - 10:00 AM', onPress: () => setSelectedTime('09:00 AM') },
      { text: '10:00 AM - 11:00 AM', onPress: () => setSelectedTime('10:00 AM') },
      { text: '11:00 AM - 12:00 PM', onPress: () => setSelectedTime('11:00 AM') },
      { text: '02:00 PM - 03:00 PM', onPress: () => setSelectedTime('02:00 PM') },
      { text: '04:00 PM - 05:00 PM', onPress: () => setSelectedTime('04:00 PM') },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  return (
    <View style={styles.screenFrameChassis}>
      <ScrollView style={styles.scrollCanvas} showsVerticalScrollIndicator={false}>
        
        {/* Title Block */}
        <View style={styles.titleContainerBlock}>
          <Text style={styles.headerPrimaryTitleText}>Book Appointment</Text>
          <Text style={styles.headerSecondarySubtitleText}>
            Search and book diagnostic tests or consultations near you
          </Text>
        </View>

        {/* Center Counter Metrics Badge Layout */}
        <View style={styles.badgeContainerRowLayout}>
          <View style={styles.metricsBadgeCapsule}>
            <Text style={styles.metricsBadgeTextValue}>
              {filteredHospitals.length} centers found
            </Text>
          </View>
        </View>

        {/* List Content Panel Section Stack */}
        <View style={styles.listVerticalStackLayout}>
          {filteredHospitals.length > 0 ? (
            filteredHospitals.map((hospital) => (
              <View key={hospital.id} style={styles.centerItemCardLayoutFrame}>
                
                {/* Graphics Vector Context Indicator Container */}
                <View style={styles.graphicIconWrapperFrameBox}>
                  {hospital.iconName === 'clinical_notes' ? (
                    <Activity size={30} color="#00478d" />
                  ) : hospital.iconName === 'emergency' ? (
                    <Heart size={30} color="#f43f5e" />
                  ) : (
                    <Building size={30} color="#00478d" />
                  )}
                </View>

                {/* Data Description Cluster Info Blocks */}
                <View style={styles.centerDescriptionPayloadBlock}>
                  <Text style={styles.centerMainHeaderTitleText} numberOfLines={1}>
                    {hospital.name}
                  </Text>
                  
                  <View style={styles.locationSubRowContainer}>
                    <MapPin size={14} color="#94a3b8" style={styles.locationMapPinIconInline} />
                    <Text style={styles.locationAddressStringValueText} numberOfLines={1}>
                      {hospital.address}
                    </Text>
                  </View>

                  {/* Actions Trigger Booking Execute Area buttons row */}
                  <View style={styles.cardActionAlignmentControlFooterRow}>
                    <Pressable
                      onPress={() => handleBookClick(hospital)}
                      style={({ pressed }) => [styles.bookingSubmitButtonCapsule, pressed && styles.actionButtonPressed]}
                    >
                      <Text style={styles.bookingSubmitButtonTextValue}>Book</Text>
                    </Pressable>
                  </View>
                </View>

              </View>
            ))
          ) : (
            /* Empty Exception Boundary Fallback layout */
            <View style={styles.emptyResultsFeedbackChassisCenterBlock}>
              <Text style={styles.emptyResultsPrimaryFeedbackTextString}>
                No hospitals found matching current criteria.
              </Text>
              <Pressable
                onPress={() => {
                  setSearchTerm('');
                  setSelectedType('');
                  if (setSelectedStateProp) setSelectedStateProp('');
                  if (setSelectedDistrictProp) setSelectedDistrictProp('');
                }}
              >
                <Text style={styles.emptyResultsResetActionAnchorLinkString}>Reset Filters</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Bottom Pagination Interface Navigation Row Controls elements */}
        <View style={styles.paginationControlsContainerFlexRow}>
          <Pressable
            onPress={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            style={styles.paginationCircleArrowNavActionIconButton}
          >
            <ChevronLeft size={16} color="#64748b" />
          </Pressable>

          {[1, 2, 3].map((pageNum) => (
            <Pressable
              key={pageNum}
              onPress={() => setCurrentPage(pageNum)}
              style={[
                styles.paginationCircleNumberNavActionIconButton,
                currentPage === pageNum ? styles.pageIndexCircleActive : styles.pageIndexCircleInactive
              ]}
            >
              <Text style={[styles.paginationNumericLabelText, currentPage === pageNum ? styles.textWhite : styles.textSlateDark]}>
                {pageNum}
              </Text>
            </Pressable>
          ))}

          <Pressable
            onPress={() => currentPage < 3 && setCurrentPage(currentPage + 1)}
            style={styles.paginationCircleArrowNavActionIconButton}
          >
            <ChevronRight size={16} color="#64748b" />
          </Pressable>
        </View>

      </ScrollView>

      {/* Scheduler Dialog Overlay Popover Panel Module portal structure */}
      {activeHospital && (
        <View style={styles.absoluteModalOverlayShutterWrapperPortal}>
          <View style={styles.modalFloatingDialogCardSurfaceWindow}>
            
            {!bookingSuccess ? (
              <View style={styles.modalInteractiveMainLayoutFormLayoutGapFrame}>
                <View style={styles.modalHeaderBorderFlexRow}>
                  <Text style={styles.modalMainTitleBoldHeadingText}>Schedule Appointment</Text>
                  <Pressable onPress={() => setActiveHospital(null)} style={styles.modalClosePressableTargetCrossIcon}>
                    <X size={18} color="#94a3b8" />
                  </Pressable>
                </View>

                {/* Selected Clinical Center Banner summary information tag box */}
                <View style={styles.modalSelectedFacilityContainerInfoBoxBanner}>
                  <Text style={styles.modalSelectedFacilityLabelTitleBlueText}>Clinic Selected</Text>
                  <Text style={styles.modalSelectedFacilityValueStringText} numberOfLines={1}>
                    {activeHospital.name}
                  </Text>
                </View>

                {/* Form Inputs Scheduler Fields rows elements stack layouts */}
                <View style={styles.formGroupInputsWrapperStackFieldRows}>
                  <View style={styles.inputFieldBlockLabelWrapperControlRow}>
                    <Text style={styles.inputFieldBlockLabelHeadlineText}>Pick Date</Text>
                    <View style={styles.inputBoxContainerChassisRow}>
                      <Calendar size={16} color="#94a3b8" style={styles.inputFieldIconInlineLeft} />
                      <TextInput
                        style={styles.inputFieldEditableValueStringTextInput}
                        value={selectedDate}
                        onChangeText={setSelectedDate}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#94a3b8"
                      />
                    </View>
                  </View>

                  <View style={styles.inputFieldBlockLabelWrapperControlRow}>
                    <Text style={styles.inputFieldBlockLabelHeadlineText}>Pick Time Slot</Text>
                    <Pressable onPress={triggerTimeSlotPicker} style={styles.simulatedSelectContainerChassisRowField}>
                      <View style={styles.simulatedSelectIconLabelLeftWrapperFlexRow}>
                        <Clock size={16} color="#94a3b8" style={styles.inputFieldIconInlineLeft} />
                        <Text style={styles.simulatedSelectActiveValueStringText}>{selectedTime}</Text>
                      </View>
                      <ChevronDown size={14} color="#64748b" />
                    </Pressable>
                  </View>
                </View>

                {/* Submission Execution Call Button block */}
                <Pressable
                  onPress={handleConfirmBooking}
                  style={({ pressed }) => [styles.modalActionSubmitButtonPrimary, pressed && styles.actionSubmitPressed]}
                >
                  <Text style={styles.modalActionSubmitButtonTextValue}>Confirm Booking Now</Text>
                </Pressable>
              </View>
            ) : (
              /* Success Status Animation Notification feedback screens layers overlay window */
              <View style={styles.successNotificationLayoutCenterWidgetChassisFrame}>
                <View style={styles.successNotificationCircularIconBoxCheckCircleWrapper}>
                  <CheckCircle size={32} color="#059669" />
                </View>
                <View style={styles.successNotificationTextMessagesVerticalStackCluster}>
                  <Text style={styles.successNotificationHeaderMainTitleLabelBoldText}>Booking Confirmed!</Text>
                  <Text style={styles.successNotificationSecondaryBodyDescriptionParagraphText}>
                    Your spot is secured at {activeHospital.name} for {selectedDate} at {selectedTime}.
                  </Text>
                </View>
              </View>
            )}

          </View>
        </View>
      )}
    </View>
  );
}

// Simulated icon styling replacement token logic tracking configurations 
const ChevronDown = ({ size, color }: { size: number; color: string }) => (
  <View style={{ transform: [{ rotate: '0deg' }] }}><Text style={{ fontSize: size, color: color }}>▼</Text></View>
);

const styles = StyleSheet.create({
  screenFrameChassis: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollCanvas: {
    flex: 1,
    paddingHorizontal: 16,
  },
  titleContainerBlock: {
    marginVertical: 16,
    gap: 4,
  },
  headerPrimaryTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  headerSecondarySubtitleText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  badgeContainerRowLayout: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  metricsBadgeCapsule: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  metricsBadgeTextValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  listVerticalStackLayout: {
    gap: 14,
    paddingBottom: 24,
  },
  centerItemCardLayoutFrame: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  graphicIconWrapperFrameBox: {
    width: 64,
    height: 64,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: 'rgba(191, 219, 254, 0.5)',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDescriptionPayloadBlock: {
    flex: 1,
    minWidth: 0,
  },
  centerMainHeaderTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  locationSubRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  locationMapPinIconInline: {
    marginTop: 1,
  },
  locationAddressStringValueText: {
    fontSize: 12,
    color: '#94a3b8',
    flex: 1,
  },
  cardActionAlignmentControlFooterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  bookingSubmitButtonCapsule: {
    backgroundColor: '#00478d',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonPressed: {
    opacity: 0.85,
  },
  bookingSubmitButtonTextValue: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyResultsFeedbackChassisCenterBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyResultsPrimaryFeedbackTextString: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
  },
  emptyResultsResetActionAnchorLinkString: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00478d',
    textDecorationLine: 'underline',
  },
  /* --- Pagination Bottom Segments Controls UI --- */
  paginationControlsContainerFlexRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingBottom: 110, // Safeguards the layout bounds spacing clear from native bottom footer overlaps
  },
  paginationCircleArrowNavActionIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  paginationCircleNumberNavActionIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageIndexCircleActive: {
    backgroundColor: '#00478d',
  },
  pageIndexCircleInactive: {
    backgroundColor: 'transparent',
  },
  paginationNumericLabelText: {
    fontSize: 12,
    fontWeight: '700',
  },
  textWhite: { color: '#ffffff' },
  textSlateDark: { color: '#475569' },
  /* --- Floating popover dialogue overlays layers layout window --- */
  absoluteModalOverlayShutterWrapperPortal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalFloatingDialogCardSurfaceWindow: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: '100%',
    maxWidth: 360,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 24,
  },
  modalInteractiveMainLayoutFormLayoutGapFrame: {
    gap: 16,
  },
  modalHeaderBorderFlexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalMainTitleBoldHeadingText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalClosePressableTargetCrossIcon: {
    padding: 4,
    borderRadius: 999,
    backgroundColor: '#f8fafc',
  },
  modalSelectedFacilityContainerInfoBoxBanner: {
    backgroundColor: 'rgba(239, 246, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(191, 219, 254, 0.3)',
    borderRadius: 12,
    padding: 12,
  },
  modalSelectedFacilityLabelTitleBlueText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00478d',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  modalSelectedFacilityValueStringText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginTop: 6,
  },
  formGroupInputsWrapperStackFieldRows: {
    gap: 14,
  },
  inputFieldBlockLabelWrapperControlRow: {
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
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputFieldIconInlineLeft: {
    marginRight: 8,
  },
  inputFieldEditableValueStringTextInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: '#334155',
  },
  simulatedSelectContainerChassisRowField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  simulatedSelectIconLabelLeftWrapperFlexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  simulatedSelectActiveValueStringText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
  },
  modalActionSubmitButtonPrimary: {
    backgroundColor: '#00478d',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  actionSubmitPressed: {
    backgroundColor: '#003366',
  },
  modalActionSubmitButtonTextValue: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  /* --- Success Notification Card Modules --- */
  successNotificationLayoutCenterWidgetChassisFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 16,
  },
  successNotificationCircularIconBoxCheckCircleWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successNotificationTextMessagesVerticalStackCluster: {
    alignItems: 'center',
    gap: 6,
  },
  successNotificationHeaderMainTitleLabelBoldText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  successNotificationSecondaryBodyDescriptionParagraphText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
});