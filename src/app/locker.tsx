import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import {
  Search,
  Plus,
  Star,
  FileText,
  Pill,
  Apple,
  Activity,
  FolderOpen,
  Box,
  Image as ImageIcon,
  Camera,
  FileBox,
  Trash2,
  AlertTriangle,
  Eye, // <-- Imported Eye icon for "See"
  Download, // <-- Imported Download icon
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Types ---
type ItemType = 'NOTE' | 'PHOTO' | 'DOCUMENT';
type CategoryType = 'NOTES' | 'MEDICINES' | 'DIET' | 'EXERCISE' | 'DOCUMENTS' | 'OTHER';

interface LockerItem {
  id: string;
  title: string;
  type: ItemType;
  category: CategoryType;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
}

// --- Categories Configuration ---
const CATEGORIES = [
  { id: 'NOTES', label: 'Notes', Icon: FileText, color: '#3b82f6', bg: '#eff6ff' },
  { id: 'MEDICINES', label: 'Medicines', Icon: Pill, color: '#ef4444', bg: '#fef2f2' },
  { id: 'DIET', label: 'Diet', Icon: Apple, color: '#10b981', bg: '#ecfdf5' },
  { id: 'EXERCISE', label: 'Exercise', Icon: Activity, color: '#f59e0b', bg: '#fffbeb' },
  { id: 'DOCUMENTS', label: 'Documents', Icon: FolderOpen, color: '#8b5cf6', bg: '#f5f3ff' },
  { id: 'OTHER', label: 'Other', Icon: Box, color: '#64748b', bg: '#f8fafc' },
];

// --- Mock Axios Architecture Gateway ---
const mockAxios = {
  get: async (url: string) => {
    await new Promise((r) => setTimeout(r, 600));
    return {
      data: {
        items: [
          { id: '1', title: 'Candid Powder', type: 'NOTE', category: 'MEDICINES', tags: ['itching', 'powder'], is_favorite: true, created_at: '2026-05-22' },
          { id: '2', title: 'Diet Plan', type: 'DOCUMENT', category: 'DIET', tags: ['keto', 'monthly'], is_favorite: false, created_at: '2026-05-20' },
          { id: '3', title: 'Exercise Routine', type: 'NOTE', category: 'EXERCISE', tags: ['morning', 'cardio'], is_favorite: true, created_at: '2026-05-18' },
          { id: '4', title: 'Blood Test Bill', type: 'PHOTO', category: 'DOCUMENTS', tags: ['receipt', 'lab'], is_favorite: true, created_at: '2026-05-15' },
        ] as LockerItem[],
      },
    };
  },
  delete: async (url: string) => {
    await new Promise((r) => setTimeout(r, 400));
    return { success: true };
  }
};

export default function LockerScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<LockerItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  
  // Custom Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    requestAnimationFrame(() => {
      mockAxios.get('/api/v1/locker')
        .then((res) => {
          if (isMounted) {
            setItems(res.data.items);
            setLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) setLoading(false);
        });
    });
    return () => { isMounted = false; };
  }, []);

  // --- THE FIX: Custom Delete Flow ---
  const triggerDeletePrompt = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const id = itemToDelete;
    
    // Optimistic UI Update & Close Modal
    setItems((prevItems) => prevItems.filter(item => item.id !== id));
    setIsDeleteModalOpen(false);
    setItemToDelete(null);

    // Backend call
    await mockAxios.delete(`/api/v1/locker/${id}`);
  };

  const favoriteCount = items.filter(item => item.is_favorite).length;

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // --- Sub-Component: Add Item Bottom Sheet ---
  const AddBottomSheet = () => {
    const handleAction = (actionType: 'NOTE' | 'PHOTO' | 'DOCUMENT') => {
      setIsAddSheetOpen(false);
      setTimeout(() => {
        if (actionType === 'NOTE') {
          router.push('/locker/new-note');
        } else {
          router.push({ 
            pathname: '/locker/new-media', 
            params: { type: actionType } 
          });
        }
      }, 350); 
    };

    return (
      <Modal visible={isAddSheetOpen} transparent={true} animationType="slide" onRequestClose={() => setIsAddSheetOpen(false)}>
        <View style={styles.sheetOverlay}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setIsAddSheetOpen(false)} />
          <View style={styles.sheetContent}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Create New Item</Text>
            <Text style={styles.sheetSubtitle}>Choose the type of record to securely store</Text>

            <View style={styles.sheetActionGrid}>
              <Pressable style={({ pressed }) => [styles.sheetActionCard, pressed && styles.cardPressed]} onPress={() => handleAction('NOTE')}>
                <View style={[styles.sheetIconBox, { backgroundColor: '#eff6ff' }]}>
                  <FileText size={24} color="#3b82f6" />
                </View>
                <Text style={styles.sheetActionTitle}>Text Note</Text>
                <Text style={styles.sheetActionDesc}>Write a quick memo</Text>
              </Pressable>

              <Pressable style={({ pressed }) => [styles.sheetActionCard, pressed && styles.cardPressed]} onPress={() => handleAction('PHOTO')}>
                <View style={[styles.sheetIconBox, { backgroundColor: '#fef2f2' }]}>
                  <Camera size={24} color="#ef4444" />
                </View>
                <Text style={styles.sheetActionTitle}>Photo</Text>
                <Text style={styles.sheetActionDesc}>Camera or Gallery</Text>
              </Pressable>

              <Pressable style={({ pressed }) => [styles.sheetActionCard, pressed && styles.cardPressed]} onPress={() => handleAction('DOCUMENT')}>
                <View style={[styles.sheetIconBox, { backgroundColor: '#f5f3ff' }]}>
                  <FileBox size={24} color="#8b5cf6" />
                </View>
                <Text style={styles.sheetActionTitle}>Document</Text>
                <Text style={styles.sheetActionDesc}>PDF, JPG, PNG</Text>
              </Pressable>
            </View>

            <Pressable onPress={() => setIsAddSheetOpen(false)} style={styles.sheetCancelButton}>
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  };

  // --- Sub-Component: Custom Delete Modal ---
  const CustomDeleteModal = () => {
    return (
      <Modal visible={isDeleteModalOpen} transparent={true} animationType="fade" onRequestClose={() => setIsDeleteModalOpen(false)}>
        <View style={styles.deleteOverlay}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setIsDeleteModalOpen(false)} />
          <View style={styles.deleteModalContent}>
            <View style={styles.deleteIconCircle}>
              <AlertTriangle size={28} color="#ef4444" />
            </View>
            <Text style={styles.deleteTitle}>Delete Item?</Text>
            <Text style={styles.deleteSubtitle}>This action cannot be undone and will remove the item permanently from your locker.</Text>
            
            <View style={styles.deleteActionRow}>
              <Pressable style={({ pressed }) => [styles.deleteCancelBtn, pressed && { opacity: 0.8 }]} onPress={() => setIsDeleteModalOpen(false)}>
                <Text style={styles.deleteCancelText}>Cancel</Text>
              </Pressable>
              
              <Pressable style={({ pressed }) => [styles.deleteConfirmBtn, pressed && { opacity: 0.8 }]} onPress={confirmDelete}>
                <Text style={styles.deleteConfirmText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        
        <View style={styles.searchContainer}>
          <Search size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes, tags, descriptions..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Pressable 
          style={({ pressed }) => [styles.topAddButton, pressed && styles.topAddButtonPressed]}
          onPress={() => setIsAddSheetOpen(true)}
        >
          <Plus size={20} color="#ffffff" />
          <Text style={styles.topAddButtonText}>Add New Item to Locker</Text>
        </Pressable>

        {!searchQuery && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <Pressable 
                  key={cat.id} 
                  style={({ pressed }) => [styles.categoryCard, pressed && styles.cardPressed]}
                >
                  <View style={[styles.categoryIconBox, { backgroundColor: cat.bg }]}>
                    <cat.Icon size={20} color={cat.color} />
                  </View>
                  <Text style={styles.categoryLabel}>{cat.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {!searchQuery && (
          <Pressable 
            style={({ pressed }) => [styles.favoritesBanner, pressed && styles.cardPressed]}
          >
            <View style={styles.favoritesLeft}>
              <View style={styles.favoritesIconBox}>
                <Star size={18} color="#f59e0b" fill="#f59e0b" />
              </View>
              <Text style={styles.favoritesText}>Favorites</Text>
            </View>
            <View style={styles.favoritesBadge}>
              <Text style={styles.favoritesBadgeText}>{favoriteCount}</Text>
            </View>
          </Pressable>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{searchQuery ? 'Search Results' : 'Recent Items'}</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00478d" />
            </View>
          ) : filteredItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Box size={32} color="#cbd5e1" />
              <Text style={styles.emptyText}>No items found in your locker.</Text>
            </View>
          ) : (
            <View style={styles.itemList}>
              {filteredItems.map((item) => {
                const CatConfig = CATEGORIES.find(c => c.id === item.category) || CATEGORIES[5];
                
                return (
                  <Pressable 
                    key={item.id} 
                    style={({ pressed }) => [styles.itemCard, pressed && styles.cardPressed]}
                  >
                    <View style={[styles.itemIconBox, { backgroundColor: CatConfig.bg }]}>
                      {item.type === 'NOTE' && <FileText size={20} color={CatConfig.color} />}
                      {item.type === 'PHOTO' && <ImageIcon size={20} color={CatConfig.color} />}
                      {item.type === 'DOCUMENT' && <FileBox size={20} color={CatConfig.color} />}
                    </View>
                    
                    <View style={styles.itemContent}>
                      <View style={styles.itemHeader}>
                        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                        
                        <View style={styles.itemActions}>
                          
                          {/* THE FIX: Conditionally Render 'See' and 'Download' for Photos & Docs */}
                          {item.type !== 'NOTE' && (
                            <>
                              <Pressable 
                                style={styles.mediaButton} 
                                onPress={(e) => {
                                  if (e && e.stopPropagation) e.stopPropagation();
                                  Platform.OS === 'web' 
                                    ? window.alert(`Opening preview for ${item.title}`)
                                    : Alert.alert('Preview', `Opening ${item.title}...`);
                                }}
                                hitSlop={10}
                              >
                                <Eye size={16} color="#00478d" />
                              </Pressable>
                              
                              <Pressable 
                                style={styles.mediaButton} 
                                onPress={(e) => {
                                  if (e && e.stopPropagation) e.stopPropagation();
                                  Platform.OS === 'web' 
                                    ? window.alert(`Downloading ${item.title}`)
                                    : Alert.alert('Download', `Downloading ${item.title} to device...`);
                                }}
                                hitSlop={10}
                              >
                                <Download size={16} color="#00478d" />
                              </Pressable>
                            </>
                          )}

                          {item.is_favorite && <Star size={14} color="#f59e0b" fill="#f59e0b" />}
                          
                          <Pressable 
                            style={styles.deleteButton} 
                            onPress={(e) => {
                              if (e && e.stopPropagation) e.stopPropagation();
                              triggerDeletePrompt(item.id); 
                            }}
                            hitSlop={15}
                          >
                            <Trash2 size={16} color="#ef4444" />
                          </Pressable>
                        </View>
                      </View>
                      
                      <View style={styles.tagsContainer}>
                        {item.tags.map(tag => (
                          <View key={tag} style={styles.tagBadge}>
                            <Text style={styles.tagText}>#{tag}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Render Modals */}
      <AddBottomSheet />
      <CustomDeleteModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContainer: { flex: 1 },
  scrollContentContainer: { padding: 20, paddingBottom: 120 }, 
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, height: 50, marginBottom: 16 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 15, color: '#0f172a' },
  
  topAddButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#00478d', borderRadius: 12, height: 52, marginBottom: 28, gap: 8 },
  topAddButtonPressed: { backgroundColor: '#003366', opacity: 0.9 },
  topAddButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 },
  
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryCard: { width: '31%', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, padding: 12, alignItems: 'center', gap: 8 },
  categoryIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  categoryLabel: { fontSize: 11, fontWeight: '600', color: '#334155' },
  
  favoritesBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, padding: 16, marginBottom: 28 },
  favoritesLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  favoritesIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#fffbeb', alignItems: 'center', justifyContent: 'center' },
  favoritesText: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  favoritesBadge: { backgroundColor: '#f59e0b', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  favoritesBadgeText: { fontSize: 12, fontWeight: '800', color: '#ffffff' },
  
  loadingContainer: { padding: 40, alignItems: 'center' },
  emptyContainer: { alignItems: 'center', padding: 40, backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'dashed' },
  emptyText: { marginTop: 12, fontSize: 14, color: '#64748b', fontWeight: '500' },
  
  itemList: { gap: 12 },
  itemCard: { flexDirection: 'row', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, padding: 16, alignItems: 'center', gap: 16 },
  itemIconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  itemContent: { flex: 1, gap: 6 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', flex: 1, marginRight: 8 },
  
  itemActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  deleteButton: { padding: 4, backgroundColor: '#fef2f2', borderRadius: 6 },
  mediaButton: { padding: 4, backgroundColor: '#eff6ff', borderRadius: 6 }, // Added style for the new buttons
  
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 10, fontWeight: '600', color: '#475569' },
  
  cardPressed: { backgroundColor: '#f8fafc' },

  /* Bottom Sheet Styles */
  sheetOverlay: { flex: 1, justifyContent: 'flex-end' },
  sheetBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheetContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 10 },
  sheetHandle: { width: 40, height: 5, backgroundColor: '#e2e8f0', borderRadius: 3, alignSelf: 'center', marginBottom: 24 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a', textAlign: 'center' },
  sheetSubtitle: { fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 4, marginBottom: 24 },
  sheetActionGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  sheetActionCard: { width: '31%', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 8 },
  sheetIconBox: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  sheetActionTitle: { fontSize: 13, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
  sheetActionDesc: { fontSize: 10, color: '#64748b', textAlign: 'center' },
  sheetCancelButton: { backgroundColor: '#f1f5f9', borderRadius: 12, height: 50, alignItems: 'center', justifyContent: 'center' },
  sheetCancelText: { fontSize: 15, fontWeight: '700', color: '#475569' },

  /* Custom Delete Modal Styles */
  deleteOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  deleteModalContent: { width: '100%', maxWidth: 320, backgroundColor: '#ffffff', borderRadius: 24, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 10 },
  deleteIconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  deleteTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 8, textAlign: 'center' },
  deleteSubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  deleteActionRow: { flexDirection: 'row', gap: 12, width: '100%' },
  deleteCancelBtn: { flex: 1, backgroundColor: '#f1f5f9', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  deleteCancelText: { fontSize: 15, fontWeight: '700', color: '#475569' },
  deleteConfirmBtn: { flex: 1, backgroundColor: '#ef4444', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  deleteConfirmText: { fontSize: 15, fontWeight: '700', color: '#ffffff' },
});