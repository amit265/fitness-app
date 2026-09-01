import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { Typography } from './Typography';
import { Button } from './Button';
import { useAppTheme } from '../context/ThemeContext';
import { X } from 'lucide-react-native';
import { SPACING } from '../constants/theme';
import { t } from '../i18n';

interface CalculatorModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  result: string;
  subtitle?: string;
  explanation: string;
  onUseForSini?: () => void;
}

export function CalculatorModal({
  visible,
  onClose,
  title,
  result,
  subtitle,
  explanation,
  onUseForSini,
}: CalculatorModalProps) {
  const { colors } = useAppTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.sheet, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
              {/* Header */}
              <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Typography variant="h3">{title}</Typography>
                <Pressable onPress={onClose} style={styles.closeBtn}>
                  <X color={colors.textPrimary} size={24} />
                </Pressable>
              </View>

              <ScrollView contentContainerStyle={styles.content}>
                {/* Result Hero */}
                <View style={styles.resultContainer}>
                  <Typography variant="h1" color={colors.primary} style={{ textAlign: 'center' }}>
                    {result}
                  </Typography>
                  {subtitle && (
                    <Typography variant="bodyMedium" color={colors.subtext} style={{ textAlign: 'center', marginTop: 4 }}>
                      {subtitle}
                    </Typography>
                  )}
                </View>

                {/* Explanation */}
                <View style={[styles.explanationBox, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                  <Typography variant="caption" style={{ fontFamily: 'Outfit-Bold', marginBottom: 4 }}>
                    {t('profile.howCalculated')}
                  </Typography>
                  <Typography variant="bodyMedium" color={colors.subtext}>
                    {explanation}
                  </Typography>
                </View>

                {/* Action */}
                {onUseForSini && (
                  <View style={styles.actionContainer}>
                    <Typography variant="caption" color={colors.subtext} style={{ textAlign: 'center', marginBottom: 8 }}>
                      {t('profile.useForSiniDesc')}
                    </Typography>
                    <Button title={t('profile.useForSini')} onPress={onUseForSini} variant="primary" />
                  </View>
                )}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    minHeight: '40%',
    borderTopWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  resultContainer: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  explanationBox: {
    padding: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  actionContainer: {
    marginTop: SPACING.md,
  },
});
