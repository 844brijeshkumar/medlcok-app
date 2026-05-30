
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
  Search,
  Calendar,
  User,
  Building,
  Eye,
  Download,
  AlertTriangle,
  ChevronDown,
  X,
} from 'lucide-react-native';

// --- Safe TypeScript Definition Overrides ---
interface MedicalRecord {
  id: string;
  title: string;
  category: 'Lab Tests' | 'Imaging' | 'Prescriptions' | 'Other';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  note: string;
  doctor: string;
  hospital: string;
  date: string;
}

interface ReportsScreenProps {
  selectedCategory?: string;
  searchQuery?: string;
}

// --- Inline Mock Data Fallback Blueprint (Prevents Import Resolution Skews) ---
const INITIAL_RECORDS_MOCK: MedicalRecord[] = [
  {
    id: 'rec_3',
    title: 'Complete Blood Count (CBC)',
    category: 'Lab Tests',
    priority: 'Critical',
    note: 'Note: Low hemoglobin levels detected. Requires immediate follow-up and dietary modification.',
    doctor: 'Dr. Sharma',
    hospital: 'City Diagnostic Labs',
    date: 'May 24, 2026',
  },
  {
    id: 'rec_2',
    title: 'High Resolution Chest CT Scan',
    category: 'Imaging',
    priority: 'High',
    note: 'Minor pulmonary irregularities tracked near left lower lobe base. Re-evaluate in 6 months.',
    doctor: 'Dr. Gupta',
    hospital: 'Apex Radiology Center',
    date: 'Apr 18, 2026',
  },
  {
    id: 'rec_1',
    title: 'Amoxicillin Prescription Record',
    category: 'Prescriptions',
    priority: 'Low',
    note: 'Standard dosage 500mg capsule regimen administered for acute upper respiratory infection management.',
    doctor: 'Dr. Reddy',
    hospital: 'Metro Health Care Clinic',
    date: 'Jan 12, 2026',
  },
];

export default function ReportsScreen({
  selectedCategory,
  searchQuery,
}: ReportsScreenProps) {
  // Use data import or fallback securely to prevent initial undefined crashes
  const [records, setRecords] = useState<MedicalRecord[]>(INITIAL_RECORDS_MOCK);
  const [localSearch, setLocalSearch] = useState('');
  const [localCategory, setLocalCategory] = useState('All Categories');
  const [priorityFilter, setPriorityFilter] = useState('All Priority');
  const [sortOrder, setSortOrder] = useState('Newest First');

  const searchTerm = searchQuery !== undefined ? searchQuery : localSearch;
  const setSearchTerm = setLocalSearch;

  // Exact fallback matrix translated directly from your web file architecture
  const categoryFilter = selectedCategory !== undefined
    ? (selectedCategory === 'all'
       ? 'All Categories'
       : (selectedCategory === 'Clinics / Blood Bank'
          ? 'Lab Tests'
          : (selectedCategory === 'Private Hospital'
             ? 'Prescriptions'
             : (selectedCategory === 'Gov. Hospital'
                ? 'Imaging'
                : 'All Categories'))))
    : localCategory;

  const setCategoryFilter = setLocalCategory;

  // Interactive Detailed Popover View States
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  // Core Delete Action Controller Handler
  const handleDeleteRecord = (id: string) => {
    setRecords(records.filter((r) => r.id !== id));
  };

  // --- Native Dropdown Alert Trigger Methods ---
  const triggerCategorySelector = () => {
    Alert.alert('Select Category', 'Filter items by classification group:', [
      { text: 'All Categories', onPress: () => setCategoryFilter('All Categories') },
      { text: 'Lab Tests', onPress: () => setCategoryFilter('Lab Tests') },
      { text: 'Imaging', onPress: () => setCategoryFilter('Imaging') },
      { text: 'Prescriptions', onPress: () => setCategoryFilter('Prescriptions') },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const triggerPrioritySelector = () => {
    Alert.alert('Select Severity Priority', 'Filter items by immediate escalation status:', [
      { text: 'All Priority', onPress: () => setPriorityFilter('All Priority') },
      { text: 'Critical', onPress: () => setPriorityFilter('Critical') },
      { text: 'High', onPress: () => setPriorityFilter('High') },
      { text: 'Medium', onPress: () => setPriorityFilter('Medium') },
      { text: 'Low', onPress: () => setPriorityFilter('Low') },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const triggerSortSelector = () => {
    Alert.alert('Change Display Sort Sequence', 'Organize card compilation items by:', [
      { text: 'Newest First', onPress: () => setSortOrder('Newest First') },
      { text: 'Priority High', onPress: () => setSortOrder('Priority High') },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  // Processing Filter & Array Sort pipeline logic
  const filteredRecords = records
    .filter((r) => {
      const matchesSearch =
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.doctor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === 'All Categories' || r.category === categoryFilter;
      const matchesPriority =
        priorityFilter === 'All Priority' || r.priority === priorityFilter;

      return matchesSearch && matchesCategory && matchesPriority;
    })
    .sort((a, b) => {
      if (sortOrder === 'Newest First') {
        return b.id.localeCompare(a.id);
      } else {
        const priorityScore = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        return priorityScore[b.priority] - priorityScore[a.priority];
      }
    });

  // Priority color styling token translation matrices
  const getPriorityBadgeStyles = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return { bg: '#fef2f2', text: '#dc2626', border: '#fee2e2' };
      case 'High':
        return { bg: '#fffbeb', text: '#d97706', border: '#fef3c7' };
      case 'Medium':
        return { bg: '#fefce8', text: '#ca8a04', border: '#fef08a' };
      case 'Low':
        return { bg: '#ecfdf5', text: '#059669', border: '#d1fae5' };
      default:
        return { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
    }
  };

  return (
    <View style={styles.masterWrapper}>
      <ScrollView style={styles.scrollCanvas} showsVerticalScrollIndicator={false}>
        
        {/* Title block */}
        <View style={styles.titleBlock}>
          <Text style={styles.screenHeadingTitle}>Medical History</Text>
          <Text style={styles.screenHeadingSubtitle}>
            Secure clinical record archive and reports management
          </Text>
        </View>

        {/* Advanced Filter Bar Section Container layout */}
        <View style={styles.filterCardChassis}>
          {/* Search Input */}
          <View style={styles.searchBoxContainer}>
            <Search size={16} color="#94a3b8" style={styles.searchBarIconLeft} />
            <TextInput
              style={styles.searchBarInputField}
              placeholder="Search reports, doctors, terms..."
              placeholderTextColor="#94a3b8"
              value={searchTerm}
              onChangeText={(text) => setSearchTerm(text)}
            />
          </View>

          {/* Selector Fields Simulated Grid Row Layout */}
          <View style={styles.selectFieldsRowContainer}>
            <Pressable onPress={triggerCategorySelector} style={styles.simulatedSelectFieldBox}>
              <Text style={styles.selectTextLabel} numberOfLines={1}>{categoryFilter}</Text>
              <ChevronDown size={12} color="#64748b" />
            </Pressable>

            <Pressable onPress={triggerPrioritySelector} style={styles.simulatedSelectFieldBox}>
              <Text style={styles.selectTextLabel} numberOfLines={1}>{priorityFilter}</Text>
              <ChevronDown size={12} color="#64748b" />
            </Pressable>

            <Pressable onPress={triggerSortSelector} style={styles.simulatedSelectFieldBox}>
              <Text style={styles.selectTextLabel} numberOfLines={1}>{sortOrder}</Text>
              <ChevronDown size={12} color="#64748b" />
            </Pressable>
          </View>
        </View>

        {/* Record Statistics Counter Badge */}
        <View style={styles.statsBadgeContainerRow}>
          <View style={styles.countBadgeFrame}>
            <Text style={styles.countBadgeTextValue}>
              {filteredRecords.length} Records Found
            </Text>
          </View>
        </View>

        {/* Dynamic Cards Record Layout list mapping container */}
        <View style={styles.cardsListVerticalStack}>
          {filteredRecords.map((record) => {
            const badgeStyles = getPriorityBadgeStyles(record.priority);
            return (
              <View key={record.id} style={styles.articleCardFrame}>
                {/* Priority Row Meta Flags Sub Section */}
                <View style={styles.cardHeaderMetaDataRow}>
                  <View style={[styles.badgeBase, { backgroundColor: badgeStyles.bg, borderColor: badgeStyles.border }]}>
                    <Text style={[styles.badgeTextLabel, { color: badgeStyles.text }]}>
                      {record.priority}
                    </Text>
                  </View>
                  <View style={styles.categoryBadgeWrapperBox}>
                    <Text style={styles.categoryBadgeTextLabel}>{record.category}</Text>
                  </View>
                </View>

                {/* Report Title */}
                <Text style={styles.recordMainHeaderTitleText}>{record.title}</Text>

                {/* Note summary descriptions */}
                <Text style={styles.recordSecondaryBodyNoteText} numberOfLines={2}>
                  {record.note}
                </Text>

                {/* Metadata Multi-Grid Footer Table Block */}
                <View style={styles.metadataCardTableFooterBlock}>
                  <View style={styles.footerDataColumnItem}>
                    <Text style={styles.footerMetaLabelHeadline}>Doctor</Text>
                    <Text style={styles.footerMetaValueStringText}>{record.doctor}</Text>
                  </View>
                  <View style={styles.footerDataColumnItem}>
                    <Text style={styles.footerMetaLabelHeadline}>Hospital</Text>
                    <Text style={styles.footerMetaValueStringText} numberOfLines={1}>
                      {record.hospital}
                    </Text>
                  </View>
                  <View style={styles.footerDataColumnItem}>
                    <Text style={styles.footerMetaLabelHeadline}>Issue Date</Text>
                    <Text style={styles.footerMetaValueDateStringText}>{record.date}</Text>
                  </View>

                  {/* Actions Utilities row segments */}
                  <View style={styles.footerCardActionButtonsWrapperFlexRow}>
                    <Pressable
                      onPress={() => setSelectedRecord(record)}
                      style={styles.viewActionButtonItemLink}
                    >
                      <Eye size={12} color="#00478d" />
                      <Text style={styles.viewActionButtonTextLabel}>View</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => Alert.alert('Downloading File', `Downloading a PDF copy of ${record.title}...`)}
                      style={styles.downloadIconActionButtonItemLink}
                    >
                      <Download size={12} color="#475569" />
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}

          {/* Empty State Exception Boundaries Handler layout */}
          {filteredRecords.length === 0 && (
            <View style={styles.emptyResultsChassisWidgetFrame}>
              <AlertTriangle size={32} color="#94a3b8" style={styles.emptyStateCenterIcon} />
              <Text style={styles.emptyStatePrimaryFeedbackText}>
                No matching records found.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* View Individual Record Diagnostics Detail overlay popover portal modal layout */}
      {selectedRecord && (
        <View style={styles.absoluteModalOverlayShutterWrapperPortal}>
          <View style={styles.modalFloatingDialogCardSurfaceWindow}>
            
            {/* Popover Header Details Title Row Block */}
            <View style={styles.modalHeaderBorderFlexRow}>
              <View style={styles.modalHeadingMetaColumnInfo}>
                <View style={styles.modalInlineMiniBadgeCategoryLayout}>
                  <Text style={styles.modalMiniBadgeTextValueString}>{selectedRecord.category}</Text>
                </View>
                <Text style={styles.modalMainTitleBoldHeadingText}>{selectedRecord.title}</Text>
              </View>
              
              <Pressable onPress={() => setSelectedRecord(null)} style={styles.modalClosePressableTargetCrossIcon}>
                <X size={18} color="#94a3b8" />
              </Pressable>
            </View>

            <ScrollView style={styles.modalInnerBodyScrollerContentMaxHeightBox} showsVerticalScrollIndicator={false}>
              <View style={styles.modalInnerBodyLayoutGapContentFrame}>
                
                {/* Patient and Hospital detailed tables */}
                <View style={styles.modalTwoColumnGrayDataGridCardLayout}>
                  <View style={styles.gridCellSplitHalfItem}>
                    <Text style={styles.gridCellLabelHeadline}>Physician</Text>
                    <Text style={styles.gridCellValueContentString}>{selectedRecord.doctor}</Text>
                  </View>
                  <View style={styles.gridCellSplitHalfItem}>
                    <Text style={styles.gridCellLabelHeadline}>Lab Facility</Text>
                    <Text style={styles.gridCellValueContentString} numberOfLines={1}>
                      {selectedRecord.hospital}
                    </Text>
                  </View>
                </View>

                {/* Simulated metrics diagnostic values ledger list panel view */}
                <View style={styles.metricsLedgerContainerBlockBorderTopLineSection}>
                  <Text style={styles.metricsHeaderSectionLabel}>Diagnostic Findings Metrics</Text>
                  
                  <View style={styles.metricsStripValueRowListItem}>
                    <Text style={styles.metricNameStringLabelTextText}>Hemoglobin</Text>
                    <Text style={styles.metricValueMonoBoldStringDataText}>
                      12.1 g/dL <Text style={styles.statusModifierWarningTextString}>(Low)</Text>
                    </Text>
                  </View>

                  <View style={styles.metricsStripValueRowListItem}>
                    <Text style={styles.metricNameStringLabelTextText}>Creatinine</Text>
                    <Text style={styles.metricValueMonoBoldStringDataText}>
                      1.4 mg/dL <Text style={styles.statusModifierCriticalTextString}>(Critical)</Text>
                    </Text>
                  </View>

                  <View style={styles.metricsStripValueRowListItemNoBorder}>
                    <Text style={styles.metricNameStringLabelTextText}>BP Rate</Text>
                    <Text style={styles.metricValueMonoBoldStringDataText}>
                      132/85 mmHg <Text style={styles.statusModifierBorderlineTextString}>(Borderline)</Text>
                    </Text>
                  </View>
                </View>

                {/* Narrative clinical texts memo area notes layout blocks */}
                <View style={styles.narrativeMemoBlueCardWidgetBoxContainerFrame}>
                  <Text style={styles.narrativeHeaderHeadlineLabelTitleBlueText}>Clinical Narrative Detail</Text>
                  <Text style={styles.narrativeMainContentStringParagraphBodyTextText}>
                    {selectedRecord.note}
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Bottom Actions execution trigger row button segment */}
            <View style={styles.modalFooterExecutionActionButtonsGridContainerRowLayout}>
              <Pressable
                onPress={() => Alert.alert('Success', 'Diagnostic report successfully downloaded.')}
                style={({ pressed }) => [styles.modalActionSubmitButtonPrimary, pressed && styles.actionSubmitPressed]}
              >
                <Text style={styles.modalActionSubmitButtonTextValue}>Download Report File</Text>
              </Pressable>
              
              <Pressable
                onPress={() => {
                  handleDeleteRecord(selectedRecord.id);
                  setSelectedRecord(null);
                }}
                style={({ pressed }) => [styles.modalActionDeleteButtonSecondary, pressed && styles.actionDeletePressed]}
              >
                <Text style={styles.modalActionDeleteButtonTextValue}>Delete</Text>
              </Pressable>
            </View>

          </View>
        </View>
      )}
    </View>
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
  titleBlock: {
    marginVertical: 16,
    gap: 4,
  },
  screenHeadingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  screenHeadingSubtitle: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  /* --- Advanced Filters Box layout container definitions --- */
  filterCardChassis: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  searchBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchBarIconLeft: {
    marginRight: 8,
  },
  searchBarInputField: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0f172a',
  },
  selectFieldsRowContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  simulatedSelectFieldBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  selectTextLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
    marginRight: 4,
  },
  statsBadgeContainerRow: {
    flexDirection: 'row',
    marginTop: 14,
    marginBottom: 4,
  },
  countBadgeFrame: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  countBadgeTextValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00478d',
  },
  /* --- Medical Records Card list container layout block styling --- */
  cardsListVerticalStack: {
    gap: 14,
    paddingTop: 12,
    paddingBottom: 110, // Clears the bottom persistent tab navigator space bounds
  },
  articleCardFrame: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeaderMetaDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeBase: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  badgeTextLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  categoryBadgeWrapperBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  categoryBadgeTextLabel: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '600',
    color: '#64748b',
  },
  recordMainHeaderTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 18,
  },
  recordSecondaryBodyNoteText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
    lineHeight: 18,
  },
  metadataCardTableFooterBlock: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    marginTop: 14,
    paddingTop: 12,
    alignItems: 'flex-end',
  },
  footerDataColumnItem: {
    flex: 1.2,
    gap: 2,
    marginRight: 4,
  },
  footerMetaLabelHeadline: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  footerMetaValueStringText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  footerMetaValueDateStringText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  footerCardActionButtonsWrapperFlexRow: {
    flex: 1.4,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 6,
  },
  viewActionButtonItemLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  viewActionButtonTextLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00478d',
  },
  downloadIconActionButtonItemLink: {
    backgroundColor: '#f1f5f9',
    padding: 7,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyResultsChassisWidgetFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateCenterIcon: {
    marginBottom: 8,
  },
  emptyStatePrimaryFeedbackText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  /* --- Floating Popover Dialog Overlay Layer Window Layout --- */
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
    maxHeight: '80%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 24,
  },
  modalHeaderBorderFlexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 12,
    marginBottom: 12,
  },
  modalHeadingMetaColumnInfo: {
    flex: 1,
    gap: 4,
    marginRight: 12,
  },
  modalInlineMiniBadgeCategoryLayout: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  modalMiniBadgeTextValueString: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
  },
  modalMainTitleBoldHeadingText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 20,
  },
  modalClosePressableTargetCrossIcon: {
    padding: 4,
    borderRadius: 999,
    backgroundColor: '#f8fafc',
  },
  modalInnerBodyScrollerContentMaxHeightBox: {
    flexGrow: 0,
    shrink: 1,
  },
  modalInnerBodyLayoutGapContentFrame: {
    gap: 16,
    paddingBottom: 8,
  },
  modalTwoColumnGrayDataGridCardLayout: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  gridCellSplitHalfItem: {
    flex: 1,
    gap: 2,
  },
  gridCellLabelHeadline: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  gridCellValueContentString: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  metricsLedgerContainerBlockBorderTopLineSection: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
    gap: 10,
  },
  metricsHeaderSectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metricsStripValueRowListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
    paddingBottom: 8,
  },
  metricsStripValueRowListItemNoBorder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricNameStringLabelTextText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
  },
  metricValueMonoBoldStringDataText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
    color: '#0f172a',
  },
  statusModifierWarningTextString: {
    fontSize: 11,
    fontWeight: '600',
    color: '#f59e0b',
  },
  statusModifierCriticalTextString: {
    fontSize: 11,
    fontWeight: '600',
    color: '#dc2626',
  },
  statusModifierBorderlineTextString: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ca8a04',
  },
  narrativeMemoBlueCardWidgetBoxContainerFrame: {
    backgroundColor: 'rgba(239, 246, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(191, 219, 254, 0.3)',
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  narrativeHeaderHeadlineLabelTitleBlueText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00478d',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  narrativeMainContentStringParagraphBodyTextText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  modalFooterExecutionActionButtonsGridContainerRowLayout: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  modalActionSubmitButtonPrimary: {
    flex: 2.5,
    backgroundColor: '#00478d',
    borderRadius: 10,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionSubmitPressed: {
    backgroundColor: '#003366',
  },
  modalActionSubmitButtonTextValue: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  modalActionDeleteButtonSecondary: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#fca5a5',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionDeletePressed: {
    backgroundColor: '#fef2f2',
  },
  modalActionDeleteButtonTextValue: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '700',
  },
});
