import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Switch,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Save, 
  Star,
  FileText,
  Pill,
  Apple,
  Activity,
  FolderOpen,
  Box,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

// Synchronized Categories with the main Locker screen
const CATEGORIES = [
  { id: 'NOTES', label: 'Notes', Icon: FileText, color: '#3b82f6', bg: '#eff6ff' },
  { id: 'MEDICINES', label: 'Medicines', Icon: Pill, color: '#ef4444', bg: '#fef2f2' },
  { id: 'DIET', label: 'Diet', Icon: Apple, color: '#10b981', bg: '#ecfdf5' },
  { id: 'EXERCISE', label: 'Exercise', Icon: Activity, color: '#f59e0b', bg: '#fffbeb' },
  { id: 'DOCUMENTS', label: 'Documents', Icon: FolderOpen, color: '#8b5cf6', bg: '#f5f3ff' },
  { id: 'OTHER', label: 'Other', Icon: Box, color: '#64748b', bg: '#f8fafc' },
];

export default function NewNoteScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('NOTES');
  const [tags, setTags] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

 const handleSave = async () => {
    if (!title.trim()) return;
    
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSaving(false);
    
    // THE FIX: Safe Navigation
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/locker');
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable 
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/locker');
              }
            }} 
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#0f172a" />
          </Pressable>
          <Text style={styles.headerTitle}>New Note</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          style={styles.scrollContainer} 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Doctor's Instructions"
              placeholderTextColor="#94a3b8"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => {
                const isActive = category === cat.id;
                return (
                  <Pressable 
                    key={cat.id} 
                    style={[
                      styles.categoryCard, 
                      isActive && styles.categoryCardActive,
                      isActive && { borderColor: cat.color }
                    ]}
                    onPress={() => setCategory(cat.id)}
                  >
                    <View style={[
                      styles.categoryIconBox, 
                      { backgroundColor: isActive ? cat.color : cat.bg }
                    ]}>
                      <cat.Icon size={20} color={isActive ? '#ffffff' : cat.color} />
                    </View>
                    <Text style={[styles.categoryLabel, isActive && { color: cat.color, fontWeight: '700' }]}>
                      {cat.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tags (comma separated)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. itching, powder, skin"
              placeholderTextColor="#94a3b8"
              value={tags}
              onChangeText={setTags}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Write your note here..."
              placeholderTextColor="#94a3b8"
              multiline={true}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.favoriteRow}>
            <View style={styles.favoriteLeft}>
              <Star size={20} color={isFavorite ? "#f59e0b" : "#94a3b8"} fill={isFavorite ? "#f59e0b" : "transparent"} />
              <Text style={styles.favoriteText}>Mark as Favorite</Text>
            </View>
            <Switch
              value={isFavorite}
              onValueChange={setIsFavorite}
              trackColor={{ false: '#e2e8f0', true: '#a7f3d0' }}
              thumbColor={isFavorite ? '#059669' : '#f8fafc'}
            />
          </View>

          {/* THE FIX: Moved the Footer INSIDE the ScrollView */}
          <View style={styles.footer}>
            <Pressable 
              style={({ pressed }) => [
                styles.saveButton, 
                (pressed || !title.trim() || isSaving) && styles.saveButtonDisabled
              ]}
              onPress={handleSave}
              disabled={!title.trim() || isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <View style={styles.saveButtonInner}>
                  <Save size={20} color="#ffffff" />
                  <Text style={styles.saveButtonText}>Save Note</Text>
                </View>
              )}
            </Pressable>
          </View>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  keyboardAvoid: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', backgroundColor: '#ffffff', zIndex: 10 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  headerSpacer: { width: 32 },
  
  scrollContainer: { flex: 1, backgroundColor: '#f8fafc' },
  // Increased bottom padding slightly to clear your global layout when fully scrolled
  scrollContent: {
    padding: 20,
    gap: 24,
    paddingBottom: 100, 
  },
  
  inputGroup: { gap: 8 },
  label: { fontSize: 13, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, height: 50, fontSize: 15, color: '#0f172a' },
  textArea: { height: 120, paddingTop: 16 },
  
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryCard: { width: '31%', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, padding: 12, alignItems: 'center', gap: 8 },
  categoryCardActive: { backgroundColor: '#ffffff', borderWidth: 2 },
  categoryIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  categoryLabel: { fontSize: 11, fontWeight: '600', color: '#334155' },
  
  favoriteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  favoriteLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  favoriteText: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  
  // Footer is now just a layout container inside the scroll view
  footer: {
    marginTop: 12, 
    width: '100%',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButton: { backgroundColor: '#00478d', borderRadius: 12, height: 54, justifyContent: 'center', alignItems: 'center' },
  saveButtonInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  saveButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});