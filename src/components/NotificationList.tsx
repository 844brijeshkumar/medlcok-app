import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { 
  CheckCircle2, 
  XCircle, 
  Info, 
  FileText, 
  AlertTriangle, 
  CalendarCheck 
} from 'lucide-react-native';

// --- Notification Types ---
export type NotificationType = 
  | 'REPORT_UPLOAD' 
  | 'REPORT_EXPIRE' 
  | 'APPOINTMENT_APPROVED' 
  | 'CLAIM_APPROVED' 
  | 'CLAIM_REJECTED' 
  | 'GENERAL';

interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
}

// --- Mock Notification Data ---
const NOTIFICATIONS: NotificationData[] = [
  {
    id: '1',
    type: 'CLAIM_APPROVED',
    title: 'Claim Approved',
    description: 'Your claim for ₹42,000 has been successfully approved by HDFC Ergo Health.',
    time: '10 mins ago',
    isRead: false,
  },
  {
    id: '2',
    type: 'APPOINTMENT_APPROVED',
    title: 'Appointment Confirmed',
    description: 'Dr. Sharma has confirmed your appointment for tomorrow at 10:30 AM.',
    time: '2 hours ago',
    isRead: false,
  },
  {
    id: '3',
    type: 'REPORT_EXPIRE',
    title: 'Lab Report Expiring',
    description: 'Your Complete Blood Count (CBC) report will expire from the active locker in 2 days.',
    time: '5 hours ago',
    isRead: true,
  },
  {
    id: '4',
    type: 'REPORT_UPLOAD',
    title: 'New Report Uploaded',
    description: 'City Care Hospital has uploaded your MRI Scan results to your Locker.',
    time: '1 day ago',
    isRead: true,
  },
  {
    id: '5',
    type: 'CLAIM_REJECTED',
    title: 'Claim Update',
    description: 'Your recent claim for Jeevan Jyoti Clinic was rejected due to plan coverage limits.',
    time: '2 days ago',
    isRead: true,
  },
  {
    id: '6',
    type: 'GENERAL',
    title: 'System Update',
    description: 'Medlock CRM features have been updated. Tap to see what is new.',
    time: '3 days ago',
    isRead: true,
  },
];

// --- Helper to get UI config based on Notification Type ---
const getNotificationConfig = (type: NotificationType) => {
  switch (type) {
    case 'CLAIM_APPROVED':
    case 'APPOINTMENT_APPROVED':
      return { icon: CheckCircle2, color: '#059669', bg: '#ecfdf5' }; // Green
    case 'CLAIM_REJECTED':
    case 'REPORT_EXPIRE':
      return { icon: type === 'REPORT_EXPIRE' ? AlertTriangle : XCircle, color: '#dc2626', bg: '#fef2f2' }; // Red
    case 'REPORT_UPLOAD':
      return { icon: FileText, color: '#8b5cf6', bg: '#f5f3ff' }; // Purple
    case 'GENERAL':
    default:
      return { icon: Info, color: '#00478d', bg: '#eff6ff' }; // Blue
  }
};

export default function NotificationList() {
  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContent} 
      showsVerticalScrollIndicator={false}
    >
      {NOTIFICATIONS.map((notif) => {
        const Config = getNotificationConfig(notif.type);
        const IconComponent = Config.icon;

        return (
          <View 
            key={notif.id} 
            style={[
              styles.notificationCard, 
              !notif.isRead && styles.unreadCard
            ]}
          >
            <View style={[styles.iconBox, { backgroundColor: Config.bg }]}>
              <IconComponent size={20} color={Config.color} />
            </View>
            
            <View style={styles.textContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.notifTitle}>{notif.title}</Text>
                {!notif.isRead && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.notifDesc}>{notif.description}</Text>
              <Text style={styles.notifTime}>{notif.time}</Text>
            </View>
          </View>
        );
      })}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 16,
  },
  unreadCard: {
    backgroundColor: '#f4faff', // Slight blue tint for unread items
    borderColor: '#bfdbfe',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00478d',
  },
  notifDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 4,
  },
});