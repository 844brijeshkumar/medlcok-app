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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Save, 
  Star, 
  Camera, 
  FileBox, 
  X,
  FileText,
  Pill,
  Apple,
  Activity,
  FolderOpen,
  Box,
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

// --- THE FIX: Import Expo's native hardware modules ---
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

const CATEGORIES = [
  { id: 'NOTES', label: 'Notes', Icon: FileText, color: '#3b82f6', bg: '#eff6ff' },
  { id: 'MEDICINES', label: 'Medicines', Icon: Pill, color: '#ef4444', bg: '#fef2f2' },
  { id: 'DIET', label: 'Diet', Icon: Apple, color: '#10b981', bg: '#ecfdf5' },
  { id: 'EXERCISE', label: 'Exercise', Icon: Activity, color: '#f59e0b', bg: '#fffbeb' },
  { id: 'DOCUMENTS', label: 'Documents', Icon: FolderOpen, color: '#8b5cf6', bg: '#f5f3ff' },
  { id: 'OTHER', label: 'Other', Icon: Box, color: '#64748b', bg: '#f8fafc' },
];

export default function NewMediaScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams(); 
  const isPhoto = type === 'PHOTO';

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(isPhoto ? 'MEDICINES' : 'DOCUMENTS');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Stores the real file URI and Name now
  const [selectedFile, setSelectedFile] = useState<{ uri: string, name: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // --- THE FIX: Real Hardware File/Photo Picking Logic ---
  // --- THE FIX: Real Hardware File/Photo Picking Logic ---
  const handleFileUpload = async () => {
    try {
      if (isPhoto) {
        // Open Device Image Gallery
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'], // <-- THE FIX: Replaced the deprecated MediaTypeOptions
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          // Extract filename safely, fallback to URI split if missing
          const fileName = asset.fileName || asset.uri.split('/').pop() || 'photo_upload.jpg';
          setSelectedFile({ uri: asset.uri, name: fileName });
        }
      } else {
        // Open Device Document/File Picker
        const result = await DocumentPicker.getDocumentAsync({
          type: ['application/pdf', 'image/*'], // Restrict to safe types
          copyToCacheDirectory: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          setSelectedFile({ uri: asset.uri, name: asset.name });
        }
      }
    } catch (error) {
      if (Platform.OS !== 'web') {
        Alert.alert('Upload Failed', 'There was an error accessing the file system.');
      } else {
        console.error('File pick error:', error);
      }
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !selectedFile) return;
    
    setIsSaving(true);
    
    // In the future, this is where you append selectedFile.uri to a FormData object
    // Example: const formData = new FormData(); formData.append('file', { uri: selectedFile.uri, name: selectedFile.name, type: 'image/jpeg' } as any);
    
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSaving(false);
    
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
          <Text style={styles.headerTitle}>Upload {isPhoto ? 'Photo' : 'Document'}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          style={styles.scrollContainer} 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          
          {!selectedFile ? (
            <Pressable style={styles.uploadBox} onPress={handleFileUpload}>
              <View style={styles.uploadIconCircle}>
                {isPhoto ? <Camera size={28} color="#00478d" /> : <FileBox size={28} color="#00478d" />}
              </View>
              <Text style={styles.uploadTitle}>Tap to select {isPhoto ? 'a photo' : 'a document'}</Text>
              <Text style={styles.uploadSubtitle}>
                {isPhoto ? 'Device Gallery' : 'PDF, JPG, PNG allowed'}
              </Text>
            </Pressable>
          ) : (
            <View style={styles.fileSelectedBox}>
              <View style={styles.fileLeft}>
                {isPhoto ? <Camera size={24} color="#059669" /> : <FileBox size={24} color="#059669" />}
                <Text style={styles.fileName} numberOfLines={1}>{selectedFile.name}</Text>
              </View>
              <Pressable onPress={() => setSelectedFile(null)} style={styles.removeButton} hitSlop={10}>
                <X size={20} color="#ef4444" />
              </Pressable>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Skin Prescription"
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
              placeholder="e.g. receipt, lab report"
              placeholderTextColor="#94a3b8"
              value={tags}
              onChangeText={setTags}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add context to this file..."
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
          
          <View style={styles.footer}>
            <Pressable 
              style={({ pressed }) => [
                styles.saveButton, 
                (pressed || !title.trim() || !selectedFile || isSaving) && styles.saveButtonDisabled
              ]}
              onPress={handleSave}
              disabled={!title.trim() || !selectedFile || isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <View style={styles.saveButtonInner}>
                  <Save size={20} color="#ffffff" />
                  <Text style={styles.saveButtonText}>Save to Locker</Text>
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
  scrollContent: { padding: 20, gap: 24, paddingBottom: 100 },
  
  uploadBox: { backgroundColor: '#eff6ff', borderWidth: 2, borderColor: '#bfdbfe', borderStyle: 'dashed', borderRadius: 16, padding: 32, alignItems: 'center', justifyContent: 'center' },
  uploadIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  uploadTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
  uploadSubtitle: { fontSize: 13, color: '#64748b' },
  
  fileSelectedBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#a7f3d0', borderRadius: 12, padding: 16 },
  fileLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, paddingRight: 8 },
  fileName: { fontSize: 15, fontWeight: '600', color: '#065f46', flex: 1 },
  removeButton: { padding: 4, backgroundColor: '#fef2f2', borderRadius: 8 },

  inputGroup: { gap: 8 },
  label: { fontSize: 13, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, height: 50, fontSize: 15, color: '#0f172a' },
  textArea: { height: 100, paddingTop: 16 },
  
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryCard: { width: '31%', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, padding: 12, alignItems: 'center', gap: 8 },
  categoryCardActive: { backgroundColor: '#ffffff', borderWidth: 2 },
  categoryIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  categoryLabel: { fontSize: 11, fontWeight: '600', color: '#334155' },
  
  favoriteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  favoriteLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  favoriteText: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  
  footer: { marginTop: 12, width: '100%' },
  saveButtonDisabled: { opacity: 0.5 },
  saveButton: { backgroundColor: '#00478d', borderRadius: 12, height: 54, justifyContent: 'center', alignItems: 'center' },
  saveButtonInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  saveButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});