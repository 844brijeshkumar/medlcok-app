import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Calendar,
  Clock,
  FileText,
  Activity,
  Download,
  X,
  Stethoscope,
  CheckCircle2,
  ChevronDown,
  Printer,
} from 'lucide-react-native';

// --- Types ---
export interface AppointmentType {
  Id: string;
  Name: string;
  HospitalName: string; 
  Hospital__r: {
    Name: string;
    Address?: string;
  };
  Doctor__r?: {
    Name: string;
  };
  Department__c: string;
  Date__c: string;
  Time__c?: string;
  Status__c: "Pending" | "Successful" | "Cancelled";
  Notes__c?: string;
  PrescriptionFile?: string;
}

// Helper to standardise dates
const formatToLongDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  } catch (e) {
    return dateStr;
  }
};

// --- INITIAL MOCK TICKET SEED DATA ---
const INITIAL_APPOINTMENTS: AppointmentType[] = [
  {
    Id: "apt_1",
    Name: "OPD-2026-8941",
    Hospital__r: {
      Name: "City Care Multi-Specialty",
      Address: "12th Floor, Metro Tower, West Mumbai, Maharashtra - 400001"
    },
    HospitalName: "City Care Multi-Specialty",
    Doctor__r: { Name: "Alok Sharma" },
    Department__c: "Pathology & Tests",
    Date__c: "2026-05-30",
    Time__c: "10:30 AM",
    Status__c: "Pending",
    Notes__c: "Patient fasting is required for 12 hours prior to lipid pool measurements."
  },
  {
    Id: "apt_2",
    Name: "OPD-2026-3024",
    Hospital__r: {
      Name: "Apex Cardiac Center",
      Address: "Sector 8, Airoli, Navi Mumbai, Maharashtra - 400708"
    },
    HospitalName: "Apex Cardiac Center",
    Doctor__r: { Name: "Meenakshi Sen" },
    Department__c: "Cardiology Consultation",
    Date__c: "2026-05-12",
    Time__c: "02:00 PM",
    Status__c: "Successful",
    Notes__c: "Stable heart flow reading. Recommended regular 30m brisk walking.",
    PrescriptionFile: "rx_cardio_apex_2026.pdf"
  },
  {
    Id: "apt_3",
    Name: "BLD-2026-1025",
    Hospital__r: {
      Name: "Red Cross Blood Bank & Wellness Center",
      Address: "Hill Road, Bandra West, Mumbai, Maharashtra - 400050"
    },
    HospitalName: "Red Cross Blood Bank & Wellness Center",
    Doctor__r: { Name: "Clinical Staff Lead" },
    Department__c: "Blood Donation Intake",
    Date__c: "2026-05-20",
    Time__c: "11:15 AM",
    Status__c: "Successful",
    Notes__c: "O+ whole blood donation. Successfully extracted 450ml.",
    PrescriptionFile: "donor_certificate_redcross.pdf"
  },
  {
    Id: "apt_4",
    Name: "OPD-2026-5531",
    Hospital__r: {
      Name: "Standard Diagnosis Clinic",
      Address: "Vikas Marg, Sector 5, Vashi, Navi Mumbai, Maharashtra - 400703"
    },
    HospitalName: "Standard Diagnosis Clinic",
    Doctor__r: { Name: "Kunal Desai" },
    Department__c: "General Diagnostic Tests",
    Date__c: "2026-02-18",
    Time__c: "04:30 PM",
    Status__c: "Cancelled",
    Notes__c: "Cancelled by patient due to parallel emergency schedule conflict."
  }
];

// --- Status Badge Component ---
const StatusBadge = ({ status }: { status: "Pending" | "Successful" | "Cancelled" }) => {
  const badgeColors = {
    Pending: { bg: '#fffbeb', text: '#b45309', border: '#fef3c7' },
    Successful: { bg: '#ecfdf5', text: '#047857', border: '#d1fae5' },
    Cancelled: { bg: '#fef2f2', text: '#b91c1c', border: '#fee2e2' },
  };
  const config = badgeColors[status] || badgeColors.Pending;

  return (
    <View style={[styles.badgeBase, { backgroundColor: config.bg, borderColor: config.border }]}>
      <Text style={[styles.badgeText, { color: config.text }]}>{status}</Text>
    </View>
  );
};

// --- Sub-Components ---
interface AppointmentCardProps {
  appointment: AppointmentType;
  onViewTicket: (apt: AppointmentType) => void;
  onViewPrescription: (apt: AppointmentType) => void;
}

const AppointmentCard = ({ appointment, onViewTicket, onViewPrescription }: AppointmentCardProps) => {
  const leftIndicatorColor = 
    appointment.Status__c === "Successful" ? "#059669" : 
    appointment.Status__c === "Pending" ? "#f59e0b" : "#ef4444";

  return (
    <View style={styles.cardContainer}>
      {/* Category Side Accent Border */}
      <View style={[styles.cardLeftIndicator, { backgroundColor: leftIndicatorColor }]} />
      
      <View style={styles.cardContentLayout}>
        {/* Core Description Column Block */}
        <View style={styles.cardMainInfoColumn}>
          <View style={styles.cardHeaderMetaRow}>
            <View style={styles.ticketCodeBadge}>
              <Text style={styles.ticketCodeText}>{appointment.Name}</Text>
            </View>
            <StatusBadge status={appointment.Status__c} />
          </View>

          <Text style={styles.hospitalTitleText}>
            {appointment.Hospital__r?.Name || appointment.HospitalName}
          </Text>

          <View style={styles.doctorSubRow}>
            <View style={styles.stethoscopeIconBox}>
              <Stethoscope size={12} color="#475569" />
            </View>
            <Text style={styles.doctorNameValueStringText}>
              {appointment.Doctor__r?.Name ? `Dr. ${appointment.Doctor__r?.Name}` : "Staff Assisted Desk"}
            </Text>
          </View>
        </View>

        {/* Clinical Grid Split Details Column Row Section */}
        <View style={styles.cardMiddleDataDividerSection}>
          <View style={styles.gridDataCellHalfItem}>
            <Text style={styles.cellLabelHeadline}>Department</Text>
            <View style={styles.cellIconValueFlexRow}>
              <Activity size={12} color="#00478d" style={styles.cellInlineIcon} />
              <Text style={styles.cellValueTextString} numberOfLines={1}>
                {appointment.Department__c}
              </Text>
            </View>
          </View>

          <View style={styles.gridDataCellHalfItem}>
            <Text style={styles.cellLabelHeadline}>Assigned Date</Text>
            <View style={styles.cellIconValueFlexRow}>
              <Calendar size={12} color="#00478d" style={styles.cellInlineIcon} />
              <Text style={styles.cellValueTextString} numberOfLines={1}>
                {appointment.Date__c} {appointment.Time__c ? `| ${appointment.Time__c}` : ""}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions Execution Triggers Layout Block Footer */}
        <View style={styles.cardActionsWrapperFooterRow}>
          {appointment.Status__c === "Pending" ? (
            <View style={styles.awaitingVisitPassiveStateButtonCapsule}>
              <Clock size={12} color="#b45309" style={styles.cellInlineIcon} />
              <Text style={styles.awaitingVisitPassiveStateButtonText}>Awaiting Visit</Text>
            </View>
          ) : (
            <View style={styles.activeActionsGridFlexRow}>
              <Pressable onPress={() => onViewTicket(appointment)} style={styles.viewTicketPrimaryActionButton}>
                <FileText size={12} color="#ffffff" style={styles.cellInlineIcon} />
                <Text style={styles.viewTicketActionButtonTextValue}>View Ticket</Text>
              </Pressable>
              
              {appointment.Status__c === "Successful" && (
                <Pressable onPress={() => onViewPrescription(appointment)} style={styles.downloadPrescriptionSecondaryActionButton}>
                  <Download size={12} color="#334155" style={styles.cellInlineIcon} />
                  <Text style={styles.downloadPrescriptionActionButtonTextValue}>Certificate / Rx</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

// --- Main Appointments Screen ---
export default function AppointmentsScreen() {
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("All"); 
  const [searchMonth, setSearchMonth] = useState(""); 
  const [ticketDetailsModal, setTicketDetailsModal] = useState<AppointmentType | null>(null);
  const [certModal, setCertModal] = useState<AppointmentType | null>(null);
  
  const insets = useSafeAreaInsets();

  // Distinct YYYY-MM matrix generator
  const availableMonths: string[] = Array.from(
    new Set<string>(
      appointments.map((apt) => (apt.Date__c && apt.Date__c.length >= 7 ? apt.Date__c.substring(0, 7) : ""))
    )
  )
    .filter((m: string) => m && m.length === 7 && m.includes("-"))
    .sort((a: string, b: string) => b.localeCompare(a));

  const getMonthLabel = (ym: string) => {
    try {
      const [year, month] = ym.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    } catch (e) {
      return ym;
    }
  };

  // Sync state initialization with storage safety bounds checks
  useEffect(() => {
    const loadAppointments = () => {
      setIsLoading(true);
      try {
        if (typeof localStorage !== 'undefined') {
          const stored = localStorage.getItem("user_appointments_list");
          if (stored) {
            setAppointments(JSON.parse(stored));
          } else {
            localStorage.setItem("user_appointments_list", JSON.stringify(INITIAL_APPOINTMENTS));
            setAppointments(INITIAL_APPOINTMENTS);
          }
        } else {
          setAppointments(INITIAL_APPOINTMENTS);
        }
      } catch (e) {
        console.warn("Storage runtime error skipped on native platform engine layout hooks:", e);
        setAppointments(INITIAL_APPOINTMENTS);
      } finally {
        setTimeout(() => setIsLoading(false), 600);
      }
    };
    
    loadAppointments();
    
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener("storage", loadAppointments);
      return () => window.removeEventListener("storage", loadAppointments);
    }
  }, []);

  // Multi-Conditional Calculation Filtering Matrix
  const filteredAppointments = appointments.filter((apt) => {
    if (searchMonth) return apt.Date__c.startsWith(searchMonth);
    if (filter === "All") return true;
    
    const aptDate = new Date(apt.Date__c);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filter === "Upcoming") return apt.Status__c === "Pending" || aptDate >= today;
    if (filter === "Past") return apt.Status__c === "Successful" || apt.Status__c === "Cancelled" || aptDate < today;
    return true;
  });

  // Native Month Prompt Alert Picker
  const triggerMonthFilterPicker = () => {
    const optionButtons = availableMonths.map(m => ({
      text: getMonthLabel(m),
      onPress: () => { setFilter("All"); setSearchMonth(m); }
    }));
    Alert.alert('Filter by Month', 'Select a month segment archive list:', [
      { text: 'All Months', onPress: () => setSearchMonth("") },
      ...optionButtons,
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  return (
    <View style={styles.masterWrapperFrameChassis}>
      <ScrollView style={styles.scrollCanvas} showsVerticalScrollIndicator={false}>
        
        {/* Shared Layout App Shell Brand Header */}
        <View style={styles.headerContainerBox}>
          <View style={styles.headerIconSquareWidget}>
            <Calendar size={24} color="#ffffff" />
          </View>
          <View style={styles.headerTitleTextCluster}>
            <Text style={styles.headerMainTitleText}>My Appointments</Text>
            <Text style={styles.headerSecondarySubtitleText}>
              Review, print, and track your booked OPD tickets and wellness consultations
            </Text>
          </View>
        </View>

        {/* Tab Selection Filter Controls card layout row */}
        <View style={styles.filterControlBarChassisRowCard}>
          <View style={styles.tabButtonsSegmentContainer}>
            {["All", "Upcoming", "Past"].map((f) => {
              const isSelected = filter === f && !searchMonth;
              return (
                <Pressable
                  key={f}
                  onPress={() => { setFilter(f); setSearchMonth(""); }}
                  style={[styles.tabButtonNode, isSelected ? styles.tabActiveNode : styles.tabInactiveNode]}
                >
                  <Text style={[styles.tabButtonTextLabel, isSelected ? styles.textWhite : styles.textSlateDark]}>
                    {f}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Month selector prompt button selector */}
          <Pressable onPress={triggerMonthFilterPicker} style={styles.monthPickerPressableAnchorFieldRow}>
            <Calendar size={14} color="#94a3b8" style={styles.cellInlineIcon} />
            <Text style={styles.monthPickerValueLabelStringText} numberOfLines={1}>
              {searchMonth ? getMonthLabel(searchMonth) : "All Months"}
            </Text>
            <ChevronDown size={12} color="#64748b" style={{ marginLeft: 4 }} />
          </Pressable>
        </View>

        {/* Loading Content skeleton placeholder logic flags */}
        {isLoading ? (
          <View style={styles.loaderSpacingBlockChassisFrame}>
            <ActivityIndicator size="large" color="#00478d" />
          </View>
        ) : filteredAppointments.length > 0 ? (
          <View style={styles.listVerticalStackLayout}>
            {filteredAppointments.map((apt) => (
              <AppointmentCard
                key={apt.Id}
                appointment={apt}
                onViewTicket={(x) => setTicketDetailsModal(x)}
                onViewPrescription={(x) => setCertModal(x)}
              />
            ))}
          </View>
        ) : (
          /* Empty Exception Boundaries Layout Widget Frame */
          <View style={styles.emptyResultsFeedbackChassisCenterBlock}>
            <View style={styles.emptyIconBoxContainerCircle}>
              <Calendar size={24} color="#94a3b8" />
            </View>
            <Text style={styles.emptyStateHeaderHeadlineBoldTitleText}>No appointments found</Text>
            <Text style={styles.emptyStateSecondaryFeedbackParagraphTextText}>
              {searchMonth
                ? "No slots or reservations matches current month selection."
                : "You haven't initialized or booked any appointments yet."}
            </Text>
            <Pressable
              onPress={() => { setFilter("All"); setSearchMonth(""); }}
              style={styles.clearFiltersActionSubmitButtonCapsule}
            >
              <Text style={styles.clearFiltersActionButtonTextValueString}>Clear Filters</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* --- POPULAR POPOVER MODAL 1: Patient Diagnostic Documents CertModal Rx --- */}
      {certModal && (
        <View style={styles.absoluteModalOverlayShutterWrapperPortal}>
          <View style={styles.modalFloatingDialogCardSurfaceWindow}>
            <Pressable onPress={() => setCertModal(null)} style={styles.modalCrossCloseAbsoluteTargetBoxButton}>
              <X size={16} color="#94a3b8" />
            </Pressable>
            
            <View style={styles.modalInnerBodyLayoutGapContentFrameCenterAligned}>
              <View style={styles.modalSuccessCheckCircleIconOuterContainerFrame}>
                <CheckCircle2 size={24} color="#059669" />
              </View>

              <View style={styles.modalHeaderClusterBlockTextInfoText}>
                <Text style={styles.modalMainTitleBoldHeadingText}>Patient Diagnostic Document</Text>
                <Text style={styles.modalMiniBadgeTextValueString}>Generated electronically &amp; digitally signed</Text>
              </View>

              <View style={styles.modalGrayBillingGridTableBlockDetailsCard}>
                <View style={styles.gridCellSplitHalfItemRowFlexBox}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.gridCellLabelHeadline}>Reference Code</Text>
                    <Text style={styles.gridCellValueContentString}>{certModal.Name}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.gridCellLabelHeadline}>Completed Date</Text>
                    <Text style={styles.gridCellValueContentString}>{certModal.Date__c}</Text>
                  </View>
                </View>
                
                <View style={styles.innerModalDataCellSeparatorBorderTopLine}>
                  <Text style={styles.gridCellLabelHeadline}>Document Title</Text>
                  <Text style={styles.gridCellValueContentString}>
                    {certModal.Department__c.includes("Donation") 
                      ? "O+ Blood Donation Contributor Receipt" 
                      : "Outpatient Medical Therapy Summary"}
                  </Text>
                </View>

                <View style={styles.innerModalDataCellSeparatorBorderTopLine}>
                  <Text style={styles.gridCellLabelHeadline}>Digital Signature Note</Text>
                  <Text style={styles.modalInnerNarrativeDescriptionParagraphTextString}>
                    {certModal.Notes__c || "Verified and authorized for recovery. No abnormalities recorded."}
                  </Text>
                </View>
              </View>

              <View style={styles.modalFooterActionsTriggerButtonsRowGroup}>
                <Pressable
                  onPress={() => { Alert.alert("Success", "📄 PDF download simulated successfully in file system."); setCertModal(null); }}
                  style={styles.modalActionSubmitButtonPrimaryFlexOne}
                >
                  <Download size={14} color="#ffffff" style={styles.cellInlineIcon} />
                  <Text style={styles.modalActionSubmitButtonTextValue}>Download PDF</Text>
                </Pressable>
                
                <Pressable
                  onPress={() => Alert.alert("Print Command", "🖨️ Printing instruction sent to registered hospital device pool.")}
                  style={styles.modalActionPrintButtonIconSecondarySquareBox}
                >
                  <Printer size={16} color="#475569" />
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* --- POPULAR POPOVER MODAL 2: OPD Entry Voucher Ticket Token Details --- */}
      {ticketDetailsModal && (
        <View style={styles.absoluteModalOverlayShutterWrapperPortal}>
          <View style={[styles.modalFloatingDialogCardSurfaceWindow, { padding: 0 }]}>
            
            {/* Ticket Header accent theme blocks color styles */}
            <View style={styles.ticketThemeMainTopColorAccentHeaderBanner}>
              <Pressable onPress={() => setTicketDetailsModal(null)} style={styles.modalCrossCloseAbsoluteTargetBoxButton}>
                <X size={16} color="#ffffff" />
              </Pressable>
              <View style={styles.ticketMiniLabelBadgeCapsuleFrameNode}>
                <Text style={styles.ticketMiniLabelBadgeTextValueString}>Official OPD Entry Token</Text>
              </View>
              <Text style={styles.ticketMainNumericCodeHeaderMonoHeadlineText}>{ticketDetailsModal.Name}</Text>
              <Text style={styles.ticketSubRowFacilityNameTextText} numberOfLines={1}>
                {ticketDetailsModal.Hospital__r?.Name || ticketDetailsModal.HospitalName}
              </Text>
            </View>

            {/* Simulated hardware dash coupon punch holes dividers line row */}
            <View style={styles.couponPunchHoleDashedLineSeparatorContainerRow}>
              <View style={styles.couponPunchHoleCircleCutoutNodeLeft} />
              <View style={styles.couponHorizontalDashedLineBar} />
              <View style={styles.couponPunchHoleCircleCutoutNodeRight} />
            </View>

            {/* Ticket Body Ledger Tables Section */}
            <View style={styles.ticketInnerBodyGrayCanvasGridBlock}>
              <View style={styles.ticketGridSystemMetadataFlexRowCard}>
                <View style={styles.gridCellSplitHalfItem}>
                  <Text style={styles.gridCellLabelHeadline}>Department</Text>
                  <Text style={styles.gridCellValueContentString} numberOfLines={1}>{ticketDetailsModal.Department__c}</Text>
                </View>
                <View style={styles.gridCellSplitHalfItem}>
                  <Text style={styles.gridCellLabelHeadline}>Medical Officer</Text>
                  <Text style={styles.gridCellValueContentString} numberOfLines={1}>
                    {ticketDetailsModal.Doctor__r?.Name ? `Dr. ${ticketDetailsModal.Doctor__r?.Name}` : "Clinical Assis."}
                  </Text>
                </View>
              </View>

              <View style={[styles.ticketGridSystemMetadataFlexRowCard, { marginTop: 12 }]}>
                <View style={styles.gridCellSplitHalfItem}>
                  <Text style={styles.gridCellLabelHeadline}>Arranged Date</Text>
                  <Text style={styles.gridCellValueContentString} numberOfLines={1}>{formatToLongDate(ticketDetailsModal.Date__c)}</Text>
                </View>
                <View style={styles.gridCellSplitHalfItem}>
                  <Text style={styles.gridCellLabelHeadline}>Suggested Slot</Text>
                  <Text style={styles.gridCellValueContentString} numberOfLines={1}>{ticketDetailsModal.Time__c || "09:00 AM - 10:00 AM"}</Text>
                </View>
              </View>

              <View style={styles.ticketWhiteCardInstructionsWarningAlertBox}>
                <Text style={styles.instructionsHeadlineLabelHeaderTitleText}>Important Instructions:</Text>
                <Text style={styles.instructionsBodyParagraphStringBulletItemText}>• Please reach the reception desk at least 15 minutes before your time slot.</Text>
                <Text style={styles.instructionsBodyParagraphStringBulletItemText}>• Present this digital checkout token reference securely on your device console.</Text>
                <Text style={styles.instructionsBodyParagraphStringBulletItemText}>• Keep related previous therapy records or prescriptions accessible.</Text>
              </View>

              {/* High-craft bar code simulator flex row vector strip items layout */}
              <View style={styles.barcodeWidgetChassisCenterBoxContainerStackColumn}>
                <View style={styles.barcodeStripBoundingWhiteRowFrameCanvas}>
                  <View style={styles.barcodeVerticalLinesFlexRowFlexLayoutContainer}>
                    {[1, 3, 1, 2, 4, 1, 3, 2, 1, 1, 4, 2, 2, 1, 3, 1, 4, 1, 2, 3, 1, 4, 1].map((weight, k) => (
                      <View 
                        key={k} 
                        style={[
                          styles.barcodeSingleVerticalLineNodeElement, 
                          { width: weight === 1 ? 1 : weight === 2 ? 2 : weight === 3 ? 3 : 4 }
                        ]} 
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.barcodeSubLabelStringValueMonoText}>
                  *OPD89{ticketDetailsModal.Id.toUpperCase()}*
                </Text>
              </View>
            </View>

            {/* Layout Footer Commit buttons trigger bars elements options group */}
            <View style={styles.ticketActionButtonsFooterToolbarContainerRow}>
              <Pressable
                onPress={() => Alert.alert("Print Queue", "🖨️ Verification ticket sent to printer service spool successfully.")}
                style={styles.ticketActionPrintButtonSecondary}
              >
                <Text style={styles.ticketActionPrintButtonTextValueLabel}>Print Token</Text>
              </Pressable>
              
              <Pressable
                onPress={() => setTicketDetailsModal(null)}
                style={styles.ticketActionDoneButtonPrimary}
              >
                <Text style={styles.ticketActionDoneButtonTextValueLabel}>Done</Text>
              </Pressable>
            </View>

          </View>
        </View>
      )}

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
  },
  /* --- Shared Header Brand Card Blocks --- */
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
  /* --- Tab filters headers component block rules layout --- */
  filterControlBarChassisRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 6,
    gap: 10,
  },
  tabButtonsSegmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 2,
    flex: 1.5,
  },
  tabButtonNode: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActiveNode: {
    backgroundColor: '#00478d',
  },
  tabInactiveNode: {
    backgroundColor: 'transparent',
  },
  tabButtonTextLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textWhite: { color: '#ffffff' },
  textSlateDark: { color: '#64748b' },
  monthPickerPressableAnchorFieldRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  monthPickerValueLabelStringText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  loaderSpacingBlockChassisFrame: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /* --- Appointments Card Stack Chassis Item rules --- */
  listVerticalStackLayout: {
    gap: 14,
    paddingTop: 16,
    paddingBottom: 110, // Clears layout space boundaries safely away from navigation nodes overlays
  },
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 2,
    elevation: 1,
  },
  cardLeftIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
  },
  cardContentLayout: {
    paddingLeft: 18,
    paddingRight: 14,
    paddingVertical: 14,
    gap: 12,
  },
  cardMainInfoColumn: {
    gap: 6,
  },
  cardHeaderMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ticketCodeBadge: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ticketCodeText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
    color: '#00478d',
  },
  badgeBase: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  hospitalTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: 18,
  },
  doctorSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  stethoscopeIconBox: {
    backgroundColor: '#f1f5f9',
    padding: 3,
    borderRadius: 4,
  },
  doctorNameValueStringText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
  },
  cardMiddleDataDividerSection: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#e2e8f0',
    paddingVertical: 10,
    gap: 12,
  },
  gridDataCellHalfItem: {
    flex: 1,
    gap: 4,
  },
  cellLabelHeadline: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  cellIconValueFlexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cellInlineIcon: {
    marginRight: 4,
  },
  cellValueTextString: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  cardActionsWrapperFooterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  awaitingVisitPassiveStateButtonCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  awaitingVisitPassiveStateButtonText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#b45309',
  },
  activeActionsGridFlexRow: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  viewTicketPrimaryActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    paddingVertical: 8,
  },
  viewTicketActionButtonTextValue: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  downloadPrescriptionSecondaryActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingVertical: 8,
  },
  downloadPrescriptionActionButtonTextValue: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  /* --- Empty State Components Rules Block --- */
  emptyResultsFeedbackChassisCenterBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    borderRadius: 20,
    padding: 32,
    marginVertical: 24,
  },
  emptyIconBoxContainerCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyStateHeaderHeadlineBoldTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  emptyStateSecondaryFeedbackParagraphTextText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  clearFiltersActionSubmitButtonCapsule: {
    backgroundColor: '#00478d',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  clearFiltersActionButtonTextValueString: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '750',
  },
  /* --- Interactive Popover Floating Dialog Overlay Portals --- */
  absoluteModalOverlayShutterWrapperPortal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 200,
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
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 24,
  },
  modalCrossCloseAbsoluteTargetBoxButton: {
    position: 'absolute',
    right: 14,
    top: 14,
    padding: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(241, 245, 249, 0.8)',
    zIndex: 10,
  },
  modalInnerBodyLayoutGapContentFrameCenterAligned: {
    alignItems: 'center',
    gap: 16,
  },
  modalSuccessCheckCircleIconOuterContainerFrame: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(167, 243, 208, 0.5)',
  },
  modalHeaderClusterBlockTextInfoText: {
    alignItems: 'center',
    gap: 4,
  },
  modalMainTitleBoldHeadingText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
  modalMiniBadgeTextValueString: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
  modalGrayBillingGridTableBlockDetailsCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
    width: '100%',
    gap: 10,
  },
  gridCellSplitHalfItemRowFlexBox: {
    flexDirection: 'row',
    gap: 12,
  },
  gridCellValueContentString: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginTop: 2,
  },
  innerModalDataCellSeparatorBorderTopLine: {
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
    paddingTop: 8,
  },
  modalInnerNarrativeDescriptionParagraphTextString: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginTop: 2,
  },
  modalFooterActionsTriggerButtonsRowGroup: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  modalActionSubmitButtonPrimaryFlexOne: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#00478d',
    borderRadius: 12,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActionSubmitButtonTextValue: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  modalActionPrintButtonIconSecondarySquareBox: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  /* --- POPULAR MODAL 2 LAYOUTS: Official OPD Token card style assets --- */
  ticketThemeMainTopColorAccentHeaderBanner: {
    backgroundColor: '#00478d',
    padding: 20,
    alignItems: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  ticketMiniLabelBadgeCapsuleFrameNode: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 999,
  },
  ticketMiniLabelBadgeTextValueString: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ticketMainNumericCodeHeaderMonoHeadlineText: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 10,
    letterSpacing: 0.5,
  },
  ticketSubRowFacilityNameTextText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  couponPunchHoleDashedLineSeparatorContainerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    height: 16,
    position: 'relative',
  },
  couponPunchHoleCircleCutoutNodeLeft: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    marginLeft: -8,
  },
  couponPunchHoleCircleCutoutNodeRight: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    marginRight: -8,
  },
  couponHorizontalDashedLineBar: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    marginHorizontal: 10,
  },
  ticketInnerBodyGrayCanvasGridBlock: {
    backgroundColor: '#f8fafc',
    padding: 16,
    gap: 12,
  },
  ticketGridSystemMetadataFlexRowCard: {
    flexDirection: 'row',
    gap: 10,
  },
  gridDataCellHalfItem: {
    flex: 1,
  },
  ticketWhiteCardInstructionsWarningAlertBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    gap: 4,
    marginTop: 4,
  },
  instructionsHeadlineLabelHeaderTitleText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    color: '#475569',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  instructionsBodyParagraphStringBulletItemText: {
    fontSize: 10,
    color: '#64748b',
    lineHeight: 14,
  },
  /* --- Barcode simulator vector view configurations --- */
  barcodeWidgetChassisCenterBoxContainerStackColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 6,
  },
  barcodeStripBoundingWhiteRowFrameCanvas: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: '100%',
    height: 44,
  },
  barcodeVerticalLinesFlexRowFlexLayoutContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    height: '100%',
    width: '100%',
  },
  barcodeSingleVerticalLineNodeElement: {
    backgroundColor: '#1e293b',
    marginHorizontal: 0.5,
    opacity: 0.85,
  },
  barcodeSubLabelStringValueMonoText: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1.5,
  },
  ticketActionButtonsFooterToolbarContainerRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 14,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'flex-end',
    gap: 8,
  },
  ticketActionPrintButtonSecondary: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketActionPrintButtonTextValueLabel: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  ticketActionDoneButtonPrimary: {
    backgroundColor: '#00478d',
    borderRadius: 8,
    paddingHorizontal: 24,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketActionDoneButtonTextValueLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});