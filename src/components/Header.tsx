import { Bell, Filter, Menu, Search, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

interface UserProfile {
  name: string;
}

interface HeaderProps {
  user: UserProfile;
  onMenuToggle: () => void;
  onFilterToggle?: () => void;
  isFilterActive?: boolean;
}

export default function Header({
  user,
  onMenuToggle,
  onFilterToggle,
  isFilterActive = false,
}: HeaderProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCount = 12; 

  const categories = [
    { id: 'all', label: 'All Types' },
    { id: 'private', label: 'Private Hospital' },
    { id: 'clinic', label: 'Clinics / Blood Bank' },
    { id: 'gov', label: 'Gov. Hospital' },
  ];

  return (
    <View style={styles.wrapper}>
      {/* --- Top App Bar --- */}
      <View style={styles.headerContainer}>
        <Pressable onPress={onMenuToggle} style={styles.iconButton}>
          <Menu size={24} color="#00478d" />
        </Pressable>

        <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
          {user.name}
        </Text>

        <View style={styles.actionsContainer}>
          <Pressable style={styles.iconButton}>
            <Bell size={20} color="#00478d" />
            <View style={styles.notificationDot} />
          </Pressable>

          {onFilterToggle && (
            <Pressable
              onPress={onFilterToggle}
              style={[styles.iconButton, isFilterActive && styles.iconButtonActive]}
            >
              {isFilterActive ? (
                <X size={20} color="#ef4444" />
              ) : (
                <Filter size={20} color="#00478d" />
              )}
            </Pressable>
          )}
        </View>
      </View>

      {/* --- Consolidated Filter & Search Section --- */}
      {isFilterActive && (
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  style={[
                    styles.categoryBadge,
                    isActive ? styles.categoryBadgeActive : styles.categoryBadgeInactive,
                  ]}
                >
                  <Text style={[styles.categoryText, isActive ? styles.categoryTextActive : styles.categoryTextInactive]}>
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.searchContainer}>
            <Search size={16} color="#94a3b8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Hospital Name or health centers..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.locationGrid}>
            <View style={styles.selectBox}><Text style={styles.selectText}>State</Text></View>
            <View style={styles.selectBox}><Text style={styles.selectText}>District</Text></View>
            <View style={styles.selectBox}><Text style={styles.selectText}>City</Text></View>
          </View>

          {searchQuery.length > 0 && (
            <Text style={styles.resultsText}>Found {filteredCount} matching health centers</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: '#ffffff', zIndex: 40 },
  headerContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    height: 64, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#00478d', flex: 1, textAlign: 'center' },
  actionsContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconButton: { padding: 8, borderRadius: 999 },
  iconButtonActive: { backgroundColor: 'rgba(0, 71, 141, 0.1)' },
  notificationDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, backgroundColor: '#ef4444', borderRadius: 4 },
  filterSection: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', gap: 16 },
  categoryScroll: { gap: 8 },
  categoryBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999 },
  categoryBadgeActive: { backgroundColor: '#00478d' },
  categoryBadgeInactive: { backgroundColor: '#f1f5f9' },
  categoryText: { fontSize: 12, fontWeight: '600' },
  categoryTextActive: { color: '#ffffff' },
  categoryTextInactive: { color: '#475569' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: '#0f172a' },
  locationGrid: { flexDirection: 'row', gap: 8 },
  selectBox: { flex: 1, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 8 },
  selectText: { fontSize: 12, color: '#334155' },
  resultsText: { fontSize: 12, color: '#64748b', marginTop: -4 },
});