import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Modal, Pressable, useColorScheme, Platform } from 'react-native';
import * as Updates from 'expo-updates';
import { Typography } from './Typography';
import { Button } from './Button';
import { PALETTE, SPACING } from '../constants/theme';
import { RefreshCw, Sparkles } from 'lucide-react-native';

export const EasUpdateModal: React.FC = () => {
  const isDark = useColorScheme() === 'dark';
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (__DEV__ || Platform.OS === 'web') return; // Skip in dev or web mode

    async function checkEasUpdate() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          setUpdateAvailable(true);
        }
      } catch (error) {
        // Silently catch network or dev server update check failures
        console.log('[EAS Updates] Check error:', error);
      }
    }

    checkEasUpdate();
  }, []);

  const handleApplyUpdate = async () => {
    try {
      setUpdating(true);
      await Updates.reloadAsync();
    } catch (error) {
      console.warn('[EAS Updates] Reload error:', error);
      setUpdating(false);
    }
  };

  if (!updateAvailable) return null;

  return (
    <Modal visible={updateAvailable} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: isDark ? '#1C1A18' : PALETTE.white }]}>
          <View style={styles.iconCircle}>
            <Sparkles color={PALETTE.sage.default} size={28} />
          </View>

          <Typography variant="h2" style={{ fontFamily: 'PlayfairDisplay-Bold', textAlign: 'center', marginBottom: 4 }}>
            App Update Ready!
          </Typography>
          <Typography variant="caption" color={PALETTE.charcoal.light} style={{ textAlign: 'center', lineHeight: 18, marginBottom: SPACING.lg }}>
            A new version with performance improvements and feature updates has been downloaded. Restart now to apply!
          </Typography>

          <Button
            title={updating ? 'Restarting App...' : '🚀 Restart & Update Now'}
            onPress={handleApplyUpdate}
            disabled={updating}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    padding: SPACING.xl,
    borderRadius: 24,
    alignItems: 'center',
    elevation: 16,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EAF0EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
});
