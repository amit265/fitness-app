import React, { useState } from 'react';
import { View, StyleSheet, useColorScheme, ScrollView, Pressable, KeyboardAvoidingView, Platform,  } from 'react-native';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { InputField } from '../components/InputField';
import { useAppStore } from '../store/useAppStore';
import { calculateBMI, getBMICategory, getBMIDisclaimer } from '../utils/bmiUtils';
import { getTodayStr } from '../utils/date';
import { PALETTE, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Info, HelpCircle } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { t } from '../i18n';
import { Alert } from '../utils/alertUtils';



import { useResponsive } from '../utils/responsive';

import { ScreenContainer } from '../components/ScreenContainer';
export default function BMICalculatorScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const uiLanguage = useAppStore((state) => state.uiLanguage);

  // Store data & actions
  const userProfile = useAppStore((state) => state.userProfile);
  const measurements = useAppStore((state) => state.measurements);
  const setUserProfile = useAppStore((state) => state.setUserProfile);
  const addMeasurement = useAppStore((state) => state.addMeasurement);

  // Pre-fill values
  const [heightInput, setHeightInput] = useState<string>(() =>
    userProfile?.height ? String(userProfile.height) : ''
  );
  const [weightInput, setWeightInput] = useState<string>(() => {
    const latestWeight = measurements[0]?.weight;
    return latestWeight ? String(latestWeight) : '';
  });
  
  // Results states
  const [bmiResult, setBmiResult] = useState<number | null>(() => {
    const h = userProfile?.height;
    const w = measurements[0]?.weight;
    if (h && w) {
      return calculateBMI(w, h);
    }
    return null;
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  // Handle local calculation
  const handleCalculate = () => {
    setValidationError(null);
    const h = parseFloat(heightInput);
    const w = parseFloat(weightInput);

    if (isNaN(h) || h <= 0) {
      setValidationError(t('validation.minHeight'));
      setBmiResult(null);
      return;
    }
    if (isNaN(w) || w <= 0) {
      setValidationError(t('validation.minWeight'));
      setBmiResult(null);
      return;
    }

    const calculated = calculateBMI(w, h);
    if (isNaN(calculated) || !isFinite(calculated)) {
      setValidationError(t('errors.saveFailed'));
      setBmiResult(null);
      return;
    }

    setBmiResult(calculated);
  };

  // Save to user profile & measurements
  const handleSaveToProfile = () => {
    const h = parseFloat(heightInput);
    const w = parseFloat(weightInput);

    if (isNaN(h) || h <= 0 || isNaN(w) || w <= 0) {
      useAppStore.getState().showAlert(t('common.error'), t('validation.required'));
      return;
    }

    // Save height in user profile
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        height: h,
      });
    }

    // Save weight in body measurements
    addMeasurement({
      weight: w,
      date: getTodayStr(),
    });

    useAppStore.getState().showAlert(t('common.done'), t('profile.saveProfile'), [
      { text: t('common.done'), onPress: () => router.back() }
    ]);
  };

  const currentCategoryKey = bmiResult !== null ? getBMICategory(bmiResult) : null;
  const currentCategoryTranslated = currentCategoryKey ? t(`bmi.category.${currentCategoryKey}` as any) : '--';
  const userAge = userProfile?.age ?? 25;
  const isUnderage = userAge < 18;

  // Category Color Map
  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'normal':
        return PALETTE.success;
      case 'underweight':
        return '#D4A373';
      case 'overweight':
        return '#E29578';
      case 'obese':
        return PALETTE.error;
      default:
        return PALETTE.charcoal.light;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Navigation Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft color={colors.textPrimary} size={24} />
          </Pressable>
          <Typography variant="h3">{t('bmi.title')}</Typography>
          <View style={{ width: 24 }} />
        </View>

        <ScreenContainer contentStyle={styles.scrollContent}>
          
          <Card style={styles.card}>
            <Typography variant="bodyMedium" color={PALETTE.charcoal.light} style={{ marginBottom: SPACING.md }}>
              {t('bmi.explanation')}
            </Typography>

            <InputField
              label={t('bmi.heightLabel')}
              value={heightInput}
              onChangeText={setHeightInput}
              keyboardType="decimal-pad"
              placeholder="165"
            />

            <InputField
              label={t('bmi.weightLabel')}
              value={weightInput}
              onChangeText={setWeightInput}
              keyboardType="decimal-pad"
              placeholder="60.0"
            />

            {validationError && (
              <Typography variant="bodySmall" color={PALETTE.error} style={styles.errorText}>
                ⚠️ {validationError}
              </Typography>
            )}

            <View style={styles.buttonRow}>
              <Button title={t('common.confirm')} onPress={handleCalculate} style={{ width: '100%' }} />
              <Button title={t('profile.saveProfile')} variant="outline" onPress={handleSaveToProfile} style={{ width: '100%' }} />
            </View>
          </Card>

          {/* Results Summary */}
          {bmiResult !== null && (
            <Card style={styles.resultCard}>
              <Typography variant="caption" color={PALETTE.charcoal.light}>{t('bmi.resultTitle')}</Typography>
              <Typography variant="dataValue" style={[styles.resultValue, { color: getCategoryColor(currentCategoryKey) }]}>
                {bmiResult.toFixed(1)}
              </Typography>
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(currentCategoryKey) + '15' }]}>
                <Typography variant="bodyLarge" style={{ color: getCategoryColor(currentCategoryKey) }}>
                  {currentCategoryTranslated.toUpperCase()}
                </Typography>
              </View>

              {isUnderage && (
                <View style={styles.warningBox}>
                  <Typography variant="bodySmall" color="#D4A373" style={{ lineHeight: 16 }}>
                    ⚠️ {t('bmi.underageWarning')}
                  </Typography>
                </View>
              )}
            </Card>
          )}

          {/* Reference Categories Table */}
          <Card style={styles.referenceCard}>
            <Typography variant="h3" style={{ marginBottom: SPACING.sm }}>
              {t('bmi.categoryBreakdown')}
            </Typography>
            
            <View style={styles.tableRow}>
              <Typography variant="bodyMedium" color={PALETTE.charcoal.light}>{t('bmi.rangeUnderweight')}</Typography>
              <Typography variant="bodyMedium" style={styles.boldText}>{t('bmi.category.underweight')}</Typography>
            </View>
            <View style={styles.tableRow}>
              <Typography variant="bodyMedium" color={PALETTE.charcoal.light}>{t('bmi.rangeNormal')}</Typography>
              <Typography variant="bodyMedium" style={[styles.boldText, { color: PALETTE.success }]}>{t('bmi.category.normal')}</Typography>
            </View>
            <View style={styles.tableRow}>
              <Typography variant="bodyMedium" color={PALETTE.charcoal.light}>{t('bmi.rangeOverweight')}</Typography>
              <Typography variant="bodyMedium" style={styles.boldText}>{t('bmi.category.overweight')}</Typography>
            </View>
            <View style={styles.tableRow}>
              <Typography variant="bodyMedium" color={PALETTE.charcoal.light}>{t('bmi.rangeObese')}</Typography>
              <Typography variant="bodyMedium" style={styles.boldText}>{t('bmi.category.obese')}</Typography>
            </View>

            <View style={styles.divider} />

            <View style={styles.disclaimerContainer}>
              <Info color={PALETTE.charcoal.light} size={16} style={{ marginTop: 2 }} />
              <Typography variant="caption" color={PALETTE.charcoal.light} style={styles.disclaimerText}>
                {getBMIDisclaimer()}
              </Typography>
            </View>
          </Card>

        </ScreenContainer>

      </KeyboardAvoidingView>
          </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomStickyBanner: {
    borderTopWidth: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ECE9E4',
  },
  backBtn: {
    padding: SPACING.xs,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  card: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  buttonRow: {
    flexDirection: 'column',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  errorText: {
    marginVertical: SPACING.xs,
  },
  resultCard: {
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    backgroundColor: '#FAF7F2',
  },
  resultValue: {
    fontSize: 48,
    marginVertical: SPACING.xs,
  },
  categoryBadge: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 100,
    marginBottom: SPACING.xs,
  },
  warningBox: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: '#FFFDF5',
    borderWidth: 1,
    borderColor: '#FFF1C5',
    borderRadius: 12,
  },
  referenceCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: '#FAF8F5',
  },
  boldText: {
    },
  divider: {
    height: 1,
    backgroundColor: '#ECE9E4',
    marginVertical: SPACING.md,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: 2,
  },
  disclaimerText: {
    flex: 1,
    lineHeight: 15,
  },
});
