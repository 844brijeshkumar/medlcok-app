import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Menu, Bell, Filter, X, Search } from 'lucide-react-native';

// Adjust this type based on your actual user structure
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
  // Local state for the filter section
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Simulated hospital count for the UI
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
        {/* Menu Hamburger */}
        <Pressable
          onPress={onMenuToggle}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.iconButtonPressed,
          ]}
        >
          <Menu size={24} color="#00478d" />
        </Pressable>

        {/* Dynamic Profile Name title */}
        <Text
          style={styles.headerTitle}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {user.name}
        </Text>

        {/* Utility Actions */}
        <View style={styles.actionsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.iconButtonPressed,
            ]}
          >
            <Bell size={20} color="#00478d" />
            <View style={styles.notificationDot} />
          </Pressable>

          {onFilterToggle && (
            <Pressable
              onPress={onFilterToggle}
              style={({ pressed }) => [
                styles.iconButton,
                isFilterActive && styles.iconButtonActive,
                pressed && styles.iconButtonPressed,
              ]}
            >
              {isFilterActive ? (
                <X size={20} color="#ef4444" /> // Red X
              ) : (
                <Filter size={20} color="#00478d" />
              )}
            </Pressable>
          )}
        </View>
      </View>

      {/* --- Advanced Search / Category Filter Section --- */}
      {isFilterActive && (
        <View style={styles.filterSection}>
          {/* Categories ScrollView */}
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
                  <Text
                    style={[
                      styles.categoryText,
                      isActive ? styles.categoryTextActive : styles.categoryTextInactive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Search size={16} color="#94a3b8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Hospital Name"
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Location Selectors (Mocked as standard Views for UI parity) */}
          <View style={styles.locationGrid}>
            <View style={styles.selectBox}>
              <Text style={styles.selectText}>State</Text>
            </View>
            <View style={styles.selectBox}>
              <Text style={styles.selectText}>District</Text>
            </View>
            <View style={styles.selectBox}>
              <Text style={styles.selectText}>City</Text>
            </View>
          </View>

          {/* Results Count */}
          {searchQuery.length > 0 && (
            <Text style={styles.resultsText}>
              Found {filteredCount} matching health centers
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#ffffff',
    zIndex: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00478d',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    padding: 8,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonPressed: {
    backgroundColor: '#f8fafc',
  },
  iconButtonActive: {
    backgroundColor: 'rgba(0, 71, 141, 0.1)', // #00478d with 10% opacity
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    backgroundColor: '#ef4444',
    borderRadius: 4,
  },
  filterSection: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 16,
  },
  categoryScroll: {
    gap: 8,
    paddingBottom: 4,
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadgeActive: {
    backgroundColor: '#00478d',
  },
  categoryBadgeInactive: {
    backgroundColor: '#f1f5f9',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  categoryTextInactive: {
    color: '#475569',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  locationGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  selectBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  selectText: {
    fontSize: 12,
    color: '#334155',
  },
  resultsText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: -4,
  },
});