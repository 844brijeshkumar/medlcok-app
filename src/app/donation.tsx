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
  Heart,
  Calendar,
  MapPin,
  CheckCircle2,
  Search,
} from 'lucide-react-native';

// --- TypeScript Layout Parameters Interfaces ---
interface DonationStep {
  label: string;
  status: 'completed' | 'active' | 'inactive';
}

interface DonationActivity {
  id: string;
  type: string;
  bloodGroup: string;
  location: string;
  date: string;
  steps: DonationStep[];
}

interface DonationScreenProps {
  onNavigateToBooking: () => void;
}

// --- SECURE INLINE MOCK SEED DATA (Guarantees zero-dependency compilation runtimes) ---
const DONATION_HISTORY_MOCK: DonationActivity[] = [
  {
    id: 'DON-2026-9921',
    type: 'Whole Blood Donation',
    bloodGroup: 'O+',
    location: 'Red Cross Blood Bank & Wellness Center, Bandra West',
    date: 'May 20, 2026',
    steps: [
      { label: 'Screening', status: 'completed' },
      { label: 'Collection', status: 'completed' },
      { label: 'Testing', status: 'completed' },
      { label: 'Dispatched', status: 'completed' },
    ],
  },
  {
    id: 'DON-2026-4012',
    type: 'Platelets Apheresis',
    bloodGroup: 'O+',
    location: 'Apex Cardiac & Diagnostics Center, Airoli',
    date: 'Mar 15, 2026',
    steps: [
      { label: 'Screening', status: 'completed' },
      { label: 'Collection', status: 'completed' },
      { label: 'Testing', status: 'active' },
      { label: 'Dispatched', status: 'inactive' },
    ],
  },
];

export default function DonationScreen({ onNavigateToBooking }: DonationScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('2023');

  // Unified Search computational sorting pipeline logic mapping directly to inputs
  const filteredDonations = DONATION_HISTORY_MOCK.filter((don) => {
    return (
      don.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      don.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Native Cross-Platform Year Picker Dialog Trigger Channel
  const triggerYearSelectorAlertMenu = () => {
    Alert.alert('Select Filter Year', 'Choose an archive log timeline threshold:', [
      { text: '2026', onPress: () => setSelectedYear('2026') },
      { text: '2025', onPress: () => setSelectedYear('2025') },
      { text: '2024', onPress: () => setSelectedYear('2024') },
      { text: '2023', onPress: () => setSelectedYear('2023') },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  return (
    <View style={styles.masterWrapperFrameChassis}>
      <ScrollView style={styles.scrollCanvas} showsVerticalScrollIndicator={false}>
        
        {/* Page Title Header Block Section */}
        <View style={styles.titleSectionBlockLabelRow}>
          <Text style={styles.screenHeadingTitle}>Eligibility to Donate</Text>
        </View>

        {/* --- 1. Eligibility Banner Card (emerald-50 feel tokens matching web markup) --- */}
        <View style={styles.eligibilityCardChassis}>
          <View style={styles.eligibilityCircularIconOuterCircleContainerFrame}>
            <CheckCircle2 size={20} color="#ffffff" />
          </View>
          <View style={styles.eligibilityTextPayloadClusterColumn}>
            <Text style={styles.eligibilityHeaderMainTitleLabelBoldText}>You are eligible!</Text>
            <Text style={styles.eligibilitySecondaryBodyDescriptionText}>
              Your next blood donation session can be booked today.
            </Text>
            <Pressable
              onPress={onNavigateToBooking}
              style={({ pressed }) => [styles.bookingSubmitButtonCapsule, pressed && styles.actionButtonPressed]}
            >
              <Text style={styles.bookingSubmitButtonTextValue}>Book Now</Text>
            </Pressable>
          </View>
        </View>

        {/* --- 2. Solid Deep Blue Heart Impact Counter Metric Panel Dashboard --- */}
        <View style={styles.impactCardChassisContainerFrame}>
          {/* Background watermark icon absolute offset mapping */}
          <View style={styles.absoluteWatermarkHeartIconGraphicWrapperBox}>
            <Heart size={144} color="rgba(255, 255, 255, 0.08)" fill="rgba(255, 255, 255, 0.08)" />
          </View>

          <View style={styles.impactContentZIndexWrapperBoxStackColumn}>
            <Text style={styles.impactHeaderSectionLabel}>Lifetime Impact Score</Text>
            
            <View style={styles.impactMetricsFlexRowSplitLayoutGrid}>
              <View style={styles.gridCellColumnSplitHalfItem}>
                <Text style={styles.impactNumericValueDisplayBigStringText}>4</Text>
                <Text style={styles.impactMetricLabelHeadlineSubText}>Total Donations</Text>
              </View>
              <View style={styles.gridCellColumnSplitHalfItem}>
                <Text style={styles.impactNumericValueDisplayBigStringText}>12</Text>
                <Text style={styles.impactMetricLabelHeadlineSubText}>Estimated Lives Saved</Text>
              </View>
            </View>
          </View>
        </View>

        {/* --- 3. Search Inputs & Filter Control Bar Layout Blocks --- */}
        <View style={styles.searchBarFilterControlsFlexRowContainerRow}>
          <View style={styles.searchBoxContainerChassisRow}>
            <Search size={16} color="#94a3b8" style={styles.searchIconInlineLeft} />
            <TextInput
              style={styles.searchBarInputFieldEditableStringValue}
              placeholder="Search donation history..."
              placeholderTextColor="#94a3b8"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>

          <Pressable onPress={triggerYearSelectorAlertMenu} style={styles.simulatedSelectContainerChassisRowField}>
            <Calendar size={14} color="#64748b" style={styles.cellInlineIcon} />
            <Text style={styles.simulatedSelectActiveValueStringText}>{selectedYear}</Text>
          </Pressable>
        </View>

        {/* --- 4. Donation History Timeline List Stack Component --- */}
        <View style={styles.timelineListVerticalStackContainerBlock}>
          <Text style={styles.recentActivityLogsHeadlineSectionTitle}>Recent Activity Logs</Text>

          {filteredDonations.map((don) => {
            // Calculates horizontal width fills explicitly using your computational rules logic
            const completedCount = don.steps.filter((s) => s.status === 'completed').length;
            const activeLineWidth = completedCount === 4 ? '100%' : completedCount === 2 ? '33%' : '0%';

            return (
              <View key={don.id} style={styles.articleDonationItemCardFrameChassis}>
                <View style={styles.cardHeaderFlexRowContainerBlock}>
                  <View style={styles.headerLeftClusterBoxInfo}>
                    <View style={styles.donationTypeRowFlexInlineBox}>
                      <Text style={styles.donationMainTitleHeaderText}>{don.type}</Text>
                      <View style={styles.bloodGroupMiniBadgeCapsuleFrameNode}>
                        <Text style={styles.bloodGroupMiniBadgeTextValueString}>{don.bloodGroup}</Text>
                      </View>
                    </View>

                    <View style={styles.locationSubRowContainerFlexRow}>
                      <MapPin size={12} color="#94a3b8" style={styles.cellInlineIcon} />
                      <Text style={styles.locationAddressStringValueText}>{don.location}</Text>
                    </View>
                  </View>

                  <View style={styles.headerRightClusterBoxDate}>
                    <Text style={styles.dateStampStringValueText}>{don.date}</Text>
                    <Text style={styles.idCodeMonoStringValueText}>{don.id}</Text>
                  </View>
                </View>

                {/* Journey Tracker Timeline Sub Widget Framework */}
                <View style={styles.trackerJourneyTimelineComponentContainer}>
                  {/* Visual Background track horizontal rails vectors */}
                  <View style={styles.trackerTimelineBackgroundPassiveRailTrackBar} />
                  <View style={[styles.trackerTimelineActiveFilledRailTrackBar, { width: activeLineWidth }]} />

                  <View style={styles.trackerTimelineNodesHorizontalFlexRowDistributionLayout}>
                    {don.steps.map((step, idx) => {
                      let circleStyle = styles.nodeCircleInactive;
                      let labelStyle = styles.nodeLabelInactive;

                      if (step.status === 'completed') {
                        circleStyle = styles.nodeCircleCompleted;
                        labelStyle = styles.nodeLabelCompleted;
                      } else if (step.status === 'active') {
                        circleStyle = styles.nodeCircleActive;
                        labelStyle = styles.nodeLabelActive;
                      }

                      return (
                        <View key={idx} style={styles.nodeElementVerticalStackCenterCluster}>
                          <View style={[styles.nodeIndicatorDotBaseCircle, circleStyle]} />
                          <Text style={[styles.nodeTextLabelStringValue, labelStyle]}>
                            {step.label}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

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
  },
  titleSectionBlockLabelRow: {
    marginVertical: 16,
  },
  screenHeadingTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    color: '#94a3b8',
    letterSpacing: 0.8,
  },
  /* --- 1. Eligibility Card Elements Layout --- */
  eligibilityCardChassis: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
  },
  eligibilityCircularIconOuterCircleContainerFrame: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.2)',
  },
  eligibilityTextPayloadClusterColumn: {
    flex: 1,
    gap: 4,
  },
  eligibilityHeaderMainTitleLabelBoldText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#064e3b',
  },
  eligibilitySecondaryBodyDescriptionText: {
    fontSize: 12,
    color: '#059669',
    lineHeight: 16,
  },
  bookingSubmitButtonCapsule: {
    backgroundColor: '#00478d',
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  actionButtonPressed: {
    opacity: 0.9,
    backgroundColor: '#003366',
  },
  bookingSubmitButtonTextValue: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  /* --- 2. Impact Dashboard Matrix Banner Elements --- */
  impactCardChassisContainerFrame: {
    backgroundColor: '#00478d',
    borderRadius: 16,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  absoluteWatermarkHeartIconGraphicWrapperBox: {
    position: 'absolute',
    right: -16,
    bottom: -24,
  },
  impactContentZIndexWrapperBoxStackColumn: {
    zIndex: 10,
    gap: 16,
  },
  impactHeaderSectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#bfdbfe',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  impactMetricsFlexRowSplitLayoutGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridCellColumnSplitHalfItem: {
    flex: 1,
    gap: 2,
  },
  impactNumericValueDisplayBigStringText: {
    fontSize: 30,
    fontWeight: '700',
    color: '#ffffff',
  },
  impactItemLabelTextHeadlineSubText: {
    fontSize: 10,
    color: '#93c5fd',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  impactMetricLabelHeadlineSubText: {
    fontSize: 10,
    color: '#93c5fd',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  /* --- 3. Filter Toolbars Inputs Fields --- */
  searchBarFilterControlsFlexRowContainerRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  searchBoxContainerChassisRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIconInlineLeft: {
    marginRight: 8,
  },
  searchBarInputFieldEditableStringValue: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
    paddingVertical: 0,
  },
  simulatedSelectContainerChassisRowField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 44,
    gap: 6,
  },
  cellInlineIcon: {
    marginRight: 2,
  },
  simulatedSelectActiveValueStringText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  /* --- 4. History Activity Lists Timeline tracks logs --- */
  timelineListVerticalStackContainerBlock: {
    gap: 14,
    paddingBottom: 110, // Safeguards scrolling bounds spacing clear from persistent bottom tab layout components
  },
  recentActivityLogsHeadlineSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: '#94a3b8',
    marginBottom: 2,
  },
  articleDonationItemCardFrameChassis: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  cardHeaderFlexRowContainerBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeftClusterBoxInfo: {
    flex: 1.5,
    gap: 4,
    minWidth: 0,
  },
  donationTypeRowFlexInlineBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  donationMainTitleHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  bloodGroupMiniBadgeCapsuleFrameNode: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  bloodGroupMiniBadgeTextValueString: {
    fontSize: 10,
    fontWeight: '700',
    color: '#dc2626',
  },
  locationSubRowContainerFlexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationAddressStringValueText: {
    fontSize: 11,
    color: '#64748b',
    flex: 1,
  },
  headerRightClusterBoxDate: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 4,
  },
  dateStampStringValueText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  idCodeMonoStringValueText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#94a3b8',
    fontWeight: '500',
  },
  /* --- Horizontal Journey Timeline Tracks Elements Layout --- */
  trackerJourneyTimelineComponentContainer: {
    position: 'relative',
    paddingTop: 4,
    paddingBottom: 2,
  },
  trackerTimelineBackgroundPassiveRailTrackBar: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    height: 2,
    backgroundColor: '#f1f5f9',
    zIndex: 0,
  },
  trackerTimelineActiveFilledRailTrackBar: {
    position: 'absolute',
    top: 10,
    left: 12,
    height: 2,
    backgroundColor: '#10b981',
    zIndex: 0,
  },
  trackerTimelineNodesHorizontalFlexRowDistributionLayout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  nodeElementVerticalStackCenterCluster: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  nodeIndicatorDotBaseCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  /* Timeline State Colors interpolation variants definitions tokens */
  nodeCircleInactive: { backgroundColor: '#cbd5e1' },
  nodeLabelInactive: { color: '#94a3b8' },

  nodeCircleCompleted: { backgroundColor: '#10b981' },
  nodeLabelCompleted: { color: '#059669', fontWeight: '700' },

  nodeCircleActive: {
    backgroundColor: '#2563eb',
    borderWidth: 0,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  nodeLabelActive: { color: '#00478d', fontWeight: '700' },

  nodeTextLabelStringValue: {
    fontSize: 9,
    textAlign: 'center',
  },
});