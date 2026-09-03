import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, useColorScheme, Platform } from 'react-native';
import { AppModal as Modal } from './AppModal';
import * as Updates from 'expo-updates';
import { Typography } from './Typography';
import { Button } from './Button';
import { PALETTE, SPACING } from '../constants/theme';
import { RefreshCw, Sparkles } from 'lucide-react-native';

import { useAppTheme } from '../context/ThemeContext';
import { t } from '../i18n';

export const EasUpdateModal: React.FC = () => {
  const { colors } = useAppTheme();
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
        <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
          <View style={[styles.iconCircle, { backgroundColor: colors.surface }]}>
            <Sparkles color={colors.primary} size={28} />
          </View>

          <Typography variant="h2" style={{ fontFamily: 'PlayfairDisplay-Bold', textAlign: 'center', marginBottom: 4 }}>
            {t('eas.updateReady')}
          </Typography>
          <Typography variant="caption" color={colors.subtext} style={{ textAlign: 'center', lineHeight: 18, marginBottom: SPACING.lg }}>
            {t('eas.updateDesc')}
          </Typography>

          <Button
            title={updating ? t('eas.restarting') : t('eas.restartBtn')}
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
