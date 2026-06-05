import {
  Activity,
  AlertOctagon,
  Building,
  CalendarDays,
  FileText,
  Heart,
  PhoneCall,
  TrendingUp,
  User,
} from 'lucide-react-native';
import { memo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// --- TYPES ---
interface UserProfile {
  age: number;
  bloodGroup: string;
  gender: string;
  emergencyLabel: string;
  emergencyContact: string;
}

interface DashboardScreenProps {
  user?: UserProfile;
  onNavigateToHistory: () => void;
  onNavigateToBooking: () => void;
  onNavigateToAppointments: () => void;
}

// --- STATIC MOCK DATA (Hoisted to prevent memory reallocation on re-renders) ---
// Note: When moving to a real backend, this will be replaced by data passed via props or a fetching hook.
const STATS = {
  totalReports: '24',
  highPriority: '03',
  appointments: '05',
};

const RECENT_REPORTS = [
  {
    id: '1',
    title: 'Complete Blood Count',
    status: 'CRITICAL',
    statusColor: '#dc2626',
    statusBg: '#fef2f2',
    note: 'Note: Low hemoglobin levels detected. Requires immediate follow-up.',
    doctor: 'Dr. Sharma',
    facility: 'City Labs',
    Icon: Activity,
    iconColor: '#9333ea',
    iconBg: '#f3e8ff',
  },
  {
    id: '2',
    title: 'ECG Report',
    status: 'HIGH',
    statusColor: '#d97706',
    statusBg: '#fffbeb',
    note: 'Note: Regular sinus rhythm, minor irregularities observed during stress test.',
    doctor: 'Dr. Gupta',
    facility: 'Heart Care Center',
    Icon: Heart,
    iconColor: '#2563eb',
    iconBg: '#eff6ff',
  },
  {
    id: '3',
    title: 'Chest X-Ray',
    status: 'LOW',
    statusColor: '#059669',
    statusBg: '#ecfdf5',
    note: 'Note: Lungs appear clear. No evidence of inflammation or fluid trace.',
    doctor: 'Dr. Reddy',
    facility: 'Apex Hospital',
    Icon: TrendingUp,
    iconColor: '#10b981',
    iconBg: '#ecfdf5',
  },
];

const DEFAULT_USER: UserProfile = {
  age: 0,
  bloodGroup: 'Pending',
  gender: 'Unknown',
  emergencyLabel: 'None',
  emergencyContact: 'Not Available',
};

// --- COMPONENT (Wrapped in memo to prevent unnecessary re-renders) ---
const DashboardScreen = memo(function DashboardScreen({
  user = DEFAULT_USER,
  onNavigateToHistory,
  onNavigateToBooking,
  onNavigateToAppointments,
}: DashboardScreenProps) {
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* --- 1. Stats Row --- */}
      <View style={styles.statsRow}>
        <Pressable onPress={onNavigateToHistory} style={[styles.statCard, styles.bgBlue]}>
          <View style={[styles.statIconContainer, styles.iconBgBlue]}>
            <FileText size={20} color="#2563eb" />
          </View>
          <Text style={[styles.statNumber, styles.textBlueNav]}>{STATS.totalReports}</Text>
          <Text style={[styles.statLabel, styles.textBlueLabel]}>Total Reports</Text>
        </Pressable>

        <Pressable onPress={onNavigateToHistory} style={[styles.statCard, styles.bgRed]}>
          <View style={[styles.statIconContainer, styles.iconBgRed]}>
            <AlertOctagon size={20} color="#dc2626" />
          </View>
          <Text style={[styles.statNumber, styles.textRedNav]}>{STATS.highPriority}</Text>
          <Text style={[styles.statLabel, styles.textRedLabel]}>High Priority</Text>
        </Pressable>

        <Pressable onPress={onNavigateToAppointments} style={[styles.statCard, styles.bgEmerald]}>
          <View style={[styles.statIconContainer, styles.iconBgEmerald]}>
            <CalendarDays size={20} color="#059669" />
          </View>
          <Text style={[styles.statNumber, styles.textEmeraldNav]}>{STATS.appointments}</Text>
          <Text style={[styles.statLabel, styles.textEmeraldLabel]}>Appointments</Text>
        </Pressable>
      </View>

      {/* --- 2. Personal Bio Info Card --- */}
      <View style={styles.bioCard}>
        <View style={styles.bioIndicatorLine} />
        <View style={styles.bioPadding}>
          
          <View style={styles.bioGrid}>
            <View style={styles.bioColumn}>
              <Text style={styles.bioLabel}>Age</Text>
              <Text style={styles.bioValue}>{user.age} Years</Text>
            </View>
            <View style={styles.bioColumn}>
              <Text style={styles.bioLabel}>Blood Group</Text>
              <Text style={[styles.bioValue, { color: '#dc2626' }]}>{user.bloodGroup}</Text>
            </View>
            <View style={styles.bioColumn}>
              <Text style={styles.bioLabel}>Gender</Text>
              <Text style={styles.bioValue}>{user.gender}</Text>
            </View>
          </View>

          <View style={styles.emergencyContainer}>
            <View style={styles.emergencyIconBox}>
              <PhoneCall size={16} color="#dc2626" />
            </View>
            <View>
              <Text style={styles.emergencyLabel}>
                Emergency Contact ({user.emergencyLabel})
              </Text>
              <Text style={styles.emergencyNumber}>{user.emergencyContact}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* --- 3. Recent Reports Section --- */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Reports</Text>
        <Pressable onPress={onNavigateToHistory}>
          <Text style={styles.viewAllText}>View All</Text>
        </Pressable>
      </View>

      <View style={styles.listContainer}>
        {RECENT_REPORTS.map((report) => {
          const ReportIcon = report.Icon; // Capitalized for JSX
          return (
            <Pressable
              key={report.id}
              onPress={onNavigateToHistory}
              style={({ pressed }) => [styles.reportCard, pressed && styles.cardPressed]}
            >
              <View style={[styles.reportIconContainer, { backgroundColor: report.iconBg }]}>
                <ReportIcon size={24} color={report.iconColor} />
              </View>

              <View style={styles.reportContent}>
                <View style={styles.reportHeaderRow}>
                  <Text style={styles.reportTitle} numberOfLines={1}>
                    {report.title}
                  </Text>
                  <View style={[styles.badge, { backgroundColor: report.statusBg }]}>
                    <Text style={[styles.badgeText, { color: report.statusColor }]}>
                      {report.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.reportNote} numberOfLines={2}>
                  {report.note}
                </Text>

                <View style={styles.metadataRow}>
                  <View style={styles.metaItem}>
                    <User size={14} color="#94a3b8" />
                    <Text style={styles.metaText}>{report.doctor}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Building size={14} color="#94a3b8" />
                    <Text style={styles.metaText}>{report.facility}</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
});

export default DashboardScreen;

// --- STYLESHEET ---
const styles = StyleSheet.create({
  // Added paddingHorizontal here to create the side margins
  container: { 
    flex: 1, 
    paddingVertical: 16, 
    paddingHorizontal: 16 
  },
  
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 12, alignItems: 'center' },
  statIconContainer: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statNumber: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 6, textAlign: 'center' },
  
  bgBlue: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
  iconBgBlue: { backgroundColor: 'rgba(37, 99, 235, 0.1)' },
  textBlueNav: { color: '#1e3a8a' },
  textBlueLabel: { color: '#1d4ed8' },

  bgRed: { backgroundColor: '#fef2f2', borderColor: '#fca5a5' },
  iconBgRed: { backgroundColor: 'rgba(220, 38, 38, 0.1)' },
  textRedNav: { color: '#7f1d1d' },
  textRedLabel: { color: '#b91c1c' },

  bgEmerald: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
  iconBgEmerald: { backgroundColor: 'rgba(5, 150, 105, 0.1)' },
  textEmeraldNav: { color: '#064e3b' },
  textEmeraldLabel: { color: '#047857' },

  bioCard: { backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden', marginBottom: 24 },
  bioIndicatorLine: { height: 4, backgroundColor: '#f87171' },
  bioPadding: { padding: 16 },
  bioGrid: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 16, marginBottom: 16 },
  bioColumn: { flex: 1 },
  bioLabel: { fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: 0.5, marginBottom: 4 },
  bioValue: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  emergencyContainer: { backgroundColor: 'rgba(254, 242, 242, 0.7)', borderWidth: 1, borderColor: 'rgba(252, 165, 165, 0.2)', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  emergencyIconBox: { padding: 8, backgroundColor: '#fef2f2', borderRadius: 8 },
  emergencyLabel: { fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5, color: '#b91c1c', textTransform: 'uppercase' },
  emergencyNumber: { fontSize: 14, fontWeight: '600', color: '#7f1d1d', marginTop: 2 },
  
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  viewAllText: { color: '#00478d', fontWeight: '600', fontSize: 12 },
  
  listContainer: { gap: 12, paddingBottom: 40 },
  reportCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  cardPressed: { backgroundColor: '#f8fafc' },
  reportIconContainer: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  reportContent: { flex: 1 },
  reportHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, gap: 8 },
  reportTitle: { fontSize: 14, fontWeight: '600', color: '#1e293b', flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  badgeText: { fontSize: 9, fontWeight: 'bold', letterSpacing: 0.5 },
  reportNote: { fontSize: 12, color: '#64748b', marginBottom: 10, lineHeight: 16 },
  metadataRow: { flexDirection: 'row', gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 10, color: '#94a3b8' },
});