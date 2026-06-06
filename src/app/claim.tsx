import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Receipt, 
  Building2, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle,
  FileText,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

// --- Simplified User-Facing Types derived from NHCX Schema ---
type ClaimStatus = 'Approved' | 'Processing' | 'Rejected';
type FilterOption = 'All' | ClaimStatus; // Added for the filter toggle

interface UserClaim {
  id: string;
  nhcx_claim_id: string;
  hospital_name: string;
  insurance_provider: string;
  policy_number: string;
  total_billed_amount: number;
  approved_amount: number | null;
  claim_status: ClaimStatus;
  created_at: string;
  auditor_query_note?: string; 
}

// --- Mock Axios Gateway ---
const mockAxios = {
  get: async (url: string) => {
    await new Promise((r) => setTimeout(r, 800));
    return {
      data: {
        claims: [
          {
            id: 'CLM-88291',
            nhcx_claim_id: 'NHCX-10992-ABC',
            hospital_name: 'City Care Multi-Specialty Hospital',
            insurance_provider: 'HDFC Ergo Health',
            policy_number: 'POL-99281773',
            total_billed_amount: 45500.00,
            approved_amount: 42000.00,
            claim_status: 'Approved',
            created_at: '2026-05-10T10:30:00Z',
          },
          {
            id: 'CLM-88292',
            nhcx_claim_id: 'NHCX-11005-XYZ',
            hospital_name: 'Apex Cardiac Center',
            insurance_provider: 'Star Health Insurance',
            policy_number: 'SH-4451002',
            total_billed_amount: 12500.00,
            approved_amount: null,
            claim_status: 'Processing',
            created_at: '2026-06-02T14:15:00Z',
            auditor_query_note: 'Awaiting final discharge summary from the hospital desk.',
          },
          {
            id: 'CLM-88293',
            nhcx_claim_id: 'NHCX-09881-QWE',
            hospital_name: 'Jeevan Jyoti Clinic',
            insurance_provider: 'Care Health',
            policy_number: 'CH-119920',
            total_billed_amount: 8500.00,
            approved_amount: 0,
            claim_status: 'Rejected',
            created_at: '2026-02-15T09:00:00Z',
            auditor_query_note: 'OPD consultations are not covered under the current retail plan.',
          }
        ] as UserClaim[],
      },
    };
  }
};

// --- Formatters ---
const formatCurrency = (amount: number) => {
  return '₹' + amount.toLocaleString('en-IN', { maximumFractionDigits: 0 });
};

const formatDate = (isoString: string) => {
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
};

export default function ClaimScreen() {
  const router = useRouter();
  const [claims, setClaims] = useState<UserClaim[]>([]);
  const [loading, setLoading] = useState(true);
  
  // THE FIX: New state for filtering
  const [activeFilter, setActiveFilter] = useState<FilterOption>('All');
  const filterOptions: FilterOption[] = ['All', 'Approved', 'Processing', 'Rejected'];

  useEffect(() => {
    let isMounted = true;
    requestAnimationFrame(() => {
      mockAxios.get('/api/v1/user/claims')
        .then((res) => {
          if (isMounted) {
            setClaims(res.data.claims);
            setLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) setLoading(false);
        });
    });
    return () => { isMounted = false; };
  }, []);

  const getStatusConfig = (status: ClaimStatus) => {
    switch (status) {
      case 'Approved':
        return { color: '#059669', bg: '#ecfdf5', icon: CheckCircle2, text: 'Approved' };
      case 'Processing':
        return { color: '#d97706', bg: '#fffbeb', icon: Clock, text: 'Processing' };
      case 'Rejected':
        return { color: '#dc2626', bg: '#fef2f2', icon: XCircle, text: 'Rejected' };
    }
  };

  // THE FIX: Filter claims based on active toggle
  const filteredClaims = claims.filter(claim => 
    activeFilter === 'All' ? true : claim.claim_status === activeFilter
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Page Summary Header */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryIconBox}>
            <ShieldCheck size={28} color="#00478d" />
          </View>
          <View style={styles.summaryTextContainer}>
            <Text style={styles.summaryTitle}>NHCX Claim Tracker</Text>
            <Text style={styles.summaryDesc}>
              Track your cashless approvals and reimbursement status in real-time.
            </Text>
          </View>
        </View>

        {/* THE FIX: Status Filter Toggle Buttons */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {filterOptions.map((option) => {
              const isActive = activeFilter === option;
              return (
                <Pressable
                  key={option}
                  style={[styles.filterPill, isActive && styles.filterPillActive]}
                  onPress={() => setActiveFilter(option)}
                >
                  <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00478d" />
            <Text style={styles.loadingText}>Fetching your claim records...</Text>
          </View>
        ) : filteredClaims.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Receipt size={40} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No Claims Found</Text>
            <Text style={styles.emptyDesc}>
              {claims.length === 0 
                ? "You have no active or past insurance claims linked to this profile." 
                : `No claims found with the status '${activeFilter}'.`}
            </Text>
          </View>
        ) : (
          <View style={styles.claimList}>
            {filteredClaims.map((claim) => {
              const statusConfig = getStatusConfig(claim.claim_status);
              const StatusIcon = statusConfig.icon;

              return (
                <View key={claim.id} style={styles.claimCard}>
                  
                  {/* Card Header: Hospital & Date */}
                  <View style={styles.cardHeader}>
                    <View style={styles.hospitalInfo}>
                      <Building2 size={16} color="#64748b" />
                      <Text style={styles.hospitalName} numberOfLines={1}>
                        {claim.hospital_name}
                      </Text>
                    </View>
                    <Text style={styles.dateText}>{formatDate(claim.created_at)}</Text>
                  </View>

                  {/* Card Body: Insurance & Amounts */}
                  <View style={styles.cardBody}>
                    <View style={styles.insuranceRow}>
                      <View style={styles.insuranceIconBadge}>
                        <ShieldCheck size={18} color="#00478d" />
                      </View>
                      <View>
                        <Text style={styles.insuranceName}>{claim.insurance_provider}</Text>
                        <Text style={styles.policyNumber}>Policy: {claim.policy_number}</Text>
                      </View>
                    </View>

                    <View style={styles.financialRow}>
                      <View style={styles.financialBlock}>
                        <Text style={styles.financialLabel}>Billed Amount</Text>
                        <Text style={styles.billedAmount}>{formatCurrency(claim.total_billed_amount)}</Text>
                      </View>
                      <View style={styles.financialDivider} />
                      <View style={styles.financialBlock}>
                        <Text style={styles.financialLabel}>Approved Amount</Text>
                        <Text style={[styles.approvedAmount, { color: claim.claim_status === 'Rejected' ? '#dc2626' : '#059669' }]}>
                          {claim.approved_amount !== null ? formatCurrency(claim.approved_amount) : '--'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Auditor Notes (If Processing/Rejected) */}
                  {claim.auditor_query_note && (
                    <View style={styles.auditorNoteBox}>
                      <FileText size={14} color="#d97706" style={{ marginTop: 2 }} />
                      <Text style={styles.auditorNoteText}>{claim.auditor_query_note}</Text>
                    </View>
                  )}

                  {/* Card Footer: Status & NHCX ID */}
                  <View style={styles.cardFooter}>
                    <View style={styles.nhcxBlock}>
                      <Text style={styles.nhcxLabel}>NHCX Tracking ID</Text>
                      <Text style={styles.nhcxId}>{claim.nhcx_claim_id}</Text>
                    </View>
                    
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                      <StatusIcon size={14} color={statusConfig.color} />
                      <Text style={[styles.statusText, { color: statusConfig.color }]}>
                        {statusConfig.text}
                      </Text>
                    </View>
                  </View>

                </View>
              );
            })}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', backgroundColor: '#ffffff', zIndex: 10 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  headerSpacer: { width: 32 },
  
  scrollContainer: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  
  summaryCard: { flexDirection: 'row', backgroundColor: '#ffffff', borderRadius: 16, padding: 16, alignItems: 'center', gap: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
  summaryIconBox: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  summaryTextContainer: { flex: 1 },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  summaryDesc: { fontSize: 12, color: '#64748b', lineHeight: 18 },
  
  // THE FIX: New Styles for Filter Toggle
  filterContainer: { marginBottom: 24, marginHorizontal: -20 }, // Negative margin to allow full-width scroll
  filterScroll: { paddingHorizontal: 20, gap: 10 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0' },
  filterPillActive: { backgroundColor: '#00478d', borderColor: '#00478d' },
  filterPillText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  filterPillTextActive: { color: '#ffffff' },

  loadingContainer: { paddingVertical: 60, alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 14, color: '#64748b', fontWeight: '500' },
  
  emptyContainer: { alignItems: 'center', padding: 40, backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'dashed', marginTop: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginTop: 16, marginBottom: 8 },
  emptyDesc: { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 20 },
  
  claimList: { gap: 16 },
  claimCard: { backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  hospitalInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, paddingRight: 16 },
  hospitalName: { fontSize: 13, fontWeight: '600', color: '#475569' },
  dateText: { fontSize: 12, fontWeight: '600', color: '#94a3b8' },
  
  cardBody: { padding: 16 },
  insuranceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  insuranceIconBadge: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  insuranceName: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
  policyNumber: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  
  financialRow: { flexDirection: 'row', backgroundColor: '#f8fafc', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  financialBlock: { flex: 1 },
  financialDivider: { width: 1, backgroundColor: '#e2e8f0', marginHorizontal: 16 },
  financialLabel: { fontSize: 11, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  billedAmount: { fontSize: 16, fontWeight: '700', color: '#334155' },
  approvedAmount: { fontSize: 16, fontWeight: '800' },
  
  auditorNoteBox: { flexDirection: 'row', backgroundColor: '#fffbeb', marginHorizontal: 16, marginBottom: 16, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#fde68a', gap: 8 },
  auditorNoteText: { fontSize: 12, color: '#92400e', flex: 1, lineHeight: 18 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  nhcxBlock: { flex: 1 },
  nhcxLabel: { fontSize: 10, fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
  nhcxId: { fontSize: 13, fontWeight: '700', color: '#0f172a', marginTop: 2, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99 },
  statusText: { fontSize: 12, fontWeight: '700' },
});