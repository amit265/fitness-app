import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Image, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../components/Typography';
import { Button } from '../components/Button';
import { useAppStore } from '../store/useAppStore';
import { PALETTE, SPACING } from '../constants/theme';
import { ArrowLeft, Plus, X, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../context/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import ImageViewer from 'react-native-image-zoom-viewer';
import { formatDate } from '../i18n';
import { ScreenContainer } from '../components/ScreenContainer';

export default function ProgressPhotosScreen() {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();

  const progressPhotos = useAppStore((state) => state.progressPhotos) || [];
  const addProgressPhoto = useAppStore((state) => state.addProgressPhoto);
  const deleteProgressPhoto = useAppStore((state) => state.deleteProgressPhoto);

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const handleAddPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets[0]) {
      try {
        const sourceUri = result.assets[0].uri;
        const filename = sourceUri.split('/').pop() || `progress_${Date.now()}.jpg`;
        const destUri = `${FileSystem.documentDirectory}${filename}`;
        await FileSystem.copyAsync({ from: sourceUri, to: destUri });
        
        if (addProgressPhoto) {
          addProgressPhoto(destUri, new Date().toISOString());
        }
      } catch (e) {
        console.error('Failed to save photo', e);
      }
    }
  };

  const handleDeletePhoto = (id: string) => {
    useAppStore.getState().showAlert(
      'Delete Photo',
      'Are you sure you want to delete this progress photo? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => {
            if (deleteProgressPhoto) {
              deleteProgressPhoto(id);
            }
            if (selectedPhoto === id) {
              setSelectedPhoto(null);
            }
          }
        },
      ]
    );
  };

  // Sort photos by date (newest first)
  const sortedPhotos = [...progressPhotos].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121110' : PALETTE.oat.bg }]} edges={['top', 'bottom']}>
      <ScreenContainer contentStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft color={colors.primary} size={24} />
          </Pressable>
          <Typography variant="h2">Progress Photos</Typography>
          <Pressable onPress={handleAddPhoto} style={styles.addBtn}>
            <Plus color={colors.primary} size={24} />
          </Pressable>
        </View>

        {progressPhotos.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <Typography variant="h3" style={{ marginBottom: SPACING.sm }}>No Photos Yet</Typography>
            <Typography variant="bodyMedium" color={colors.subtext} style={{ textAlign: 'center', marginBottom: SPACING.lg }}>
              Start documenting your fitness journey by adding your first progress photo!
            </Typography>
            <Button title="Add Your First Photo" onPress={handleAddPhoto} />
          </View>
        ) : (
          <View style={styles.photoGrid}>
            {sortedPhotos.map((photo) => (
              <Pressable 
                key={photo.id} 
                style={styles.photoCard}
                onPress={() => setSelectedPhoto(photo.id)}
              >
                <Image source={{ uri: photo.uri }} style={styles.thumbnailImage} resizeMode="cover" />
                <View style={[styles.photoFooter, { backgroundColor: colors.card }]}>
                  <Typography variant="caption" style={{ fontWeight: '600' }}>
                    {formatDate(photo.date)}
                  </Typography>
                  <Pressable 
                    onPress={() => handleDeletePhoto(photo.id)}
                    hitSlop={10}
                  >
                    <Trash2 size={16} color="#FF3B30" />
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScreenContainer>

      {/* Full Screen Photo Viewer */}
      <Modal visible={!!selectedPhoto} transparent={true} animationType="fade">
        <View style={styles.fullScreenModal}>
          <SafeAreaView style={{ flex: 1, width: '100%' }} edges={['top', 'bottom']}>
            <View style={styles.fullScreenHeader}>
              <Pressable onPress={() => setSelectedPhoto(null)} style={styles.closeBtn}>
                <X color="#FFF" size={28} />
              </Pressable>
            </View>
            <View style={styles.fullScreenContent}>
              {selectedPhoto && (
                <ImageViewer 
                  imageUrls={sortedPhotos.map(p => ({ url: p.uri }))} 
                  index={Math.max(0, sortedPhotos.findIndex(p => p.id === selectedPhoto))}
                  backgroundColor="transparent"
                  enableSwipeDown={true}
                  onSwipeDown={() => setSelectedPhoto(null)}
                  renderIndicator={() => <View />}
                />
              )}
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  backBtn: {
    padding: SPACING.xs,
    borderRadius: 100,
    backgroundColor: '#FAF8F5',
  },
  addBtn: {
    padding: SPACING.xs,
  },
  emptyState: {
    padding: SPACING.xl,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoCard: {
    width: '48%',
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  thumbnailImage: {
    width: '100%',
    height: 200,
  },
  photoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.sm,
  },
  fullScreenModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  fullScreenHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: SPACING.md,
  },
  closeBtn: {
    padding: SPACING.sm,
  },
  fullScreenContent: {
    flex: 1,
    width: '100%',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
});
