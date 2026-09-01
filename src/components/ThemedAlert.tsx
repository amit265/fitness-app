import React from 'react';
import { View, StyleSheet, Modal, Pressable } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { useAppTheme } from '../context/ThemeContext';
import { Typography } from './Typography';
import { SPACING } from '../constants/theme';
import { t } from '../i18n';

export const ThemedAlert = () => {
  const { alertState, hideAlert } = useAppStore();
  const { colors } = useAppTheme();

  if (!alertState.visible) return null;

  const buttons = alertState.buttons && alertState.buttons.length > 0 
    ? alertState.buttons 
    : [{ text: t('common.ok') || 'OK' }]; // default to single OK button

  return (
    <Modal
      transparent
      visible={alertState.visible}
      animationType="fade"
      onRequestClose={hideAlert}
    >
      <View style={styles.overlay}>
        <View style={[styles.alertBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.contentArea}>
            <Typography variant="h3" style={styles.title} align="center">
              {alertState.title}
            </Typography>
            {!!alertState.message && (
              <Typography variant="bodyMedium" color={colors.subtext} align="center" style={styles.message}>
                {alertState.message}
              </Typography>
            )}
          </View>

          <View style={[styles.buttonsContainer, { borderTopColor: colors.border }]}>
            {buttons.map((btn, index) => {
              const isLast = index === buttons.length - 1;
              const isDestructive = btn.style === 'destructive';
              const isCancel = btn.style === 'cancel';

              let textColor = colors.primary;
              if (isDestructive) textColor = colors.error || '#ef4444';
              if (isCancel) textColor = colors.textPrimary;

              return (
                <Pressable
                  key={index}
                  style={({ pressed }) => [
                    styles.button,
                    { borderRightColor: colors.border },
                    !isLast && styles.buttonBorder,
                    pressed && { backgroundColor: colors.surface }
                  ]}
                  onPress={() => {
                    hideAlert();
                    if (btn.onPress) {
                      // Slight delay to allow modal to close before executing action
                      setTimeout(btn.onPress, 100);
                    }
                  }}
                >
                  <Typography 
                    variant="bodyLarge" 
                    color={textColor} 
                    align="center"
                    style={{ fontFamily: isCancel ? 'Outfit-Regular' : 'Outfit-Bold' }}
                  >
                    {btn.text}
                  </Typography>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  alertBox: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  contentArea: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Outfit-Bold',
    marginBottom: 8,
  },
  message: {
    marginTop: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonBorder: {
    borderRightWidth: 1,
  },
});
