import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Platform, KeyboardAvoidingView } from 'react-native';
import { Typography } from '../components/Typography';
import { useAppStore } from '../store/useAppStore';
import { PALETTE, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../context/ThemeContext';
import {
  Ruler,
  Award,
  ChevronRight,
  Flame,
  ShieldCheck,
  Moon,
  Zap,
  ArrowLeft,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { calculateBMI, getBMICategory } from '../utils/bmiUtils';
import { t } from '../i18n';
import { CalculatorModal } from '../components/CalculatorModal';
import { ScreenContainer } from '../components/ScreenContainer';

import {
  calculateBMR,
  calculateDailyCalorieTarget,
  calculateHealthyWeightRange,
  calculateMacroTargets,
  estimateHydration
} from '../domain/calories/calorieEngine';

export default function HealthToolsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();

  // Store bindings
  const userProfile = useAppStore((state) => state.userProfile);
  const measurements = useAppStore((state) => state.measurements);
  const setUserProfile = useAppStore((state) => state.setUserProfile);

  const currentHeight = userProfile?.height ?? 165;
  const currentWeight = measurements[0]?.weight ?? 62;
  const currentAge = userProfile?.age ?? 28;
  const currentGoal = userProfile?.weightGoal ?? 'wellness';
  const bmiVal = calculateBMI(currentWeight, currentHeight);
  const bmiCategoryKey = getBMICategory(bmiVal);

  const bmr = calculateBMR(currentWeight, currentHeight, currentAge);
  const tdee = calculateDailyCalorieTarget(userProfile, currentWeight);
  const healthyWeight = calculateHealthyWeightRange(currentHeight);
  const macros = calculateMacroTargets(tdee, currentWeight, currentGoal);
  const waterTarget = estimateHydration(currentWeight);

  const [activeModal, setActiveModal] = useState<'bmr' | 'tdee' | 'healthyWeight' | 'macros' | 'water' | null>(null);

  const handleUseForSini = (goalOverride: 'lose' | 'gain' | 'maintain' | 'wellness') => {
    if (userProfile) {
      setUserProfile({ ...userProfile, weightGoal: goalOverride });
      useAppStore.getState().showAlert(t('common.done'), 'Sini calorie target updated based on your goal.');
      setActiveModal(null);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScreenContainer contentStyle={styles.scrollContent}>
          {/* Header Bar */}
          <View style={styles.header}>
            <Pressable
              style={({ pressed }) => [styles.backBtn, { backgroundColor: colors.surface }, pressed && { opacity: 0.7 }]}
              onPress={() => router.back()}
            >
              <ArrowLeft size={20} color={colors.primary} />
            </Pressable>
            <Typography variant="h2">Health Tools & Calculators</Typography>
            <View style={{ width: 36 }} /> {/* Spacer */}
          </View>

          <Typography variant="caption" color={colors.subtext} style={styles.sectionHeaderTitle}>
            {t('profile.healthSection') || 'My Nutrition & Body Goals'}
          </Typography>
          <View style={[styles.groupedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* BMI */}
            <Pressable
              style={({ pressed }) => [styles.rowItem, pressed && styles.pressedRow]}
              onPress={() => router.push('/bmi')}
            >
              <View style={[styles.rowIconCircle, { backgroundColor: colors.surface }]}>
                <Ruler size={18} color={colors.activity} />
              </View>
              <View style={styles.rowTextCol}>
                <Typography variant="bodyMedium" style={styles.rowTitle}>{t('profile.bmiComposition')}</Typography>
                <Typography variant="caption" color={colors.subtext}>
                  {bmiVal.toFixed(1)} · {t(`bmi.category.${bmiCategoryKey}` as any)}
                </Typography>
              </View>
              <ChevronRight size={18} color={colors.subtext} />
            </Pressable>

            <View style={styles.rowSeparator} />

            {/* BMR */}
            <Pressable
              style={({ pressed }) => [styles.rowItem, pressed && styles.pressedRow]}
              onPress={() => setActiveModal('bmr')}
            >
              <View style={[styles.rowIconCircle, { backgroundColor: colors.surface }]}>
                <Moon size={18} color={colors.primary} />
              </View>
              <View style={styles.rowTextCol}>
                <Typography variant="bodyMedium" style={styles.rowTitle}>{t('profile.bmr')}</Typography>
                <Typography variant="caption" color={colors.subtext}>
                  ≈ {bmr.toLocaleString()} kcal/day
                </Typography>
              </View>
              <ChevronRight size={18} color={colors.subtext} />
            </Pressable>

            <View style={styles.rowSeparator} />

            {/* TDEE */}
            <Pressable
              style={({ pressed }) => [styles.rowItem, pressed && styles.pressedRow]}
              onPress={() => setActiveModal('tdee')}
            >
              <View style={[styles.rowIconCircle, { backgroundColor: colors.surface }]}>
                <Flame size={18} color={colors.activity} />
              </View>
              <View style={styles.rowTextCol}>
                <Typography variant="bodyMedium" style={styles.rowTitle}>{t('profile.tdee')}</Typography>
                <Typography variant="caption" color={colors.subtext}>
                  ≈ {tdee.toLocaleString()} kcal/day
                </Typography>
              </View>
              <ChevronRight size={18} color={colors.subtext} />
            </Pressable>

            <View style={styles.rowSeparator} />

            {/* Healthy Weight Range */}
            <Pressable
              style={({ pressed }) => [styles.rowItem, pressed && styles.pressedRow]}
              onPress={() => setActiveModal('healthyWeight')}
            >
              <View style={[styles.rowIconCircle, { backgroundColor: colors.surface }]}>
                <ShieldCheck size={18} color={colors.success} />
              </View>
              <View style={styles.rowTextCol}>
                <Typography variant="bodyMedium" style={styles.rowTitle}>{t('profile.healthyWeight')}</Typography>
                <Typography variant="caption" color={colors.subtext}>
                  ≈ {healthyWeight.minKg} – {healthyWeight.maxKg} kg
                </Typography>
              </View>
              <ChevronRight size={18} color={colors.subtext} />
            </Pressable>

            <View style={styles.rowSeparator} />

            {/* Macro Targets */}
            <Pressable
              style={({ pressed }) => [styles.rowItem, pressed && styles.pressedRow]}
              onPress={() => setActiveModal('macros')}
            >
              <View style={[styles.rowIconCircle, { backgroundColor: colors.surface }]}>
                <Award size={18} color={colors.nutrition} />
              </View>
              <View style={styles.rowTextCol}>
                <Typography variant="bodyMedium" style={styles.rowTitle}>{t('profile.macroTargets')}</Typography>
                <Typography variant="caption" color={colors.subtext}>
                  {macros.proteinG}g P · {macros.carbsG}g C · {macros.fatG}g F
                </Typography>
              </View>
              <ChevronRight size={18} color={colors.subtext} />
            </Pressable>
            
            <View style={styles.rowSeparator} />

            {/* Water Target */}
            <Pressable
              style={({ pressed }) => [styles.rowItem, pressed && styles.pressedRow]}
              onPress={() => setActiveModal('water')}
            >
              <View style={[styles.rowIconCircle, { backgroundColor: colors.surface }]}>
                <Zap size={18} color={'#4FC3F7'} />
              </View>
              <View style={styles.rowTextCol}>
                <Typography variant="bodyMedium" style={styles.rowTitle}>{t('profile.waterTarget')}</Typography>
                <Typography variant="caption" color={colors.subtext}>
                  ≈ {waterTarget} L/day
                </Typography>
              </View>
              <ChevronRight size={18} color={colors.subtext} />
            </Pressable>

          </View>
        </ScreenContainer>
      </KeyboardAvoidingView>

      {/* Calculator Modals */}
      <CalculatorModal
        visible={activeModal === 'bmr'}
        onClose={() => setActiveModal(null)}
        title={t('profile.bmr')}
        result={`≈ ${bmr.toLocaleString()} kcal/day`}
        subtitle="Basal Metabolic Rate"
        explanation={`Calculated using the Mifflin-St Jeor equation based on your height (${currentHeight}cm), weight (${currentWeight}kg), and age (${currentAge}). This is an estimate of the energy your body uses completely at rest.`}
      />

      <CalculatorModal
        visible={activeModal === 'tdee'}
        onClose={() => setActiveModal(null)}
        title={t('profile.tdee')}
        result={`≈ ${tdee.toLocaleString()} kcal/day`}
        subtitle="Total Daily Energy Expenditure"
        explanation="Calculated by multiplying your BMR by your estimated activity level. If your goal is weight loss, this number is automatically reduced by ~400 kcal to create a safe deficit."
        onUseForSini={() => handleUseForSini(currentGoal)}
      />

      <CalculatorModal
        visible={activeModal === 'healthyWeight'}
        onClose={() => setActiveModal(null)}
        title={t('profile.healthyWeight')}
        result={`≈ ${healthyWeight.minKg} – ${healthyWeight.maxKg} kg`}
        explanation={`Approximate weight range corresponding to the standard healthy adult BMI range (18.5 – 24.9) for your height of ${currentHeight} cm. There is no single "perfect" weight, and this is just a general scientific guideline.`}
      />

      <CalculatorModal
        visible={activeModal === 'macros'}
        onClose={() => setActiveModal(null)}
        title={t('profile.macroTargets')}
        result={`${macros.proteinG}g P · ${macros.carbsG}g C · ${macros.fatG}g F`}
        explanation={`Suggested starting macro distribution based on your daily calorie target of ${tdee} kcal and goal (${currentGoal}). These are not medical requirements, just a helpful structure for nutrition.`}
      />

      <CalculatorModal
        visible={activeModal === 'water'}
        onClose={() => setActiveModal(null)}
        title={t('profile.waterTarget')}
        result={`≈ ${waterTarget} L/day`}
        explanation={`Estimated daily hydration target based on approximately 35ml per kg of your body weight (${currentWeight}kg).`}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  backBtn: {
    padding: 8,
    borderRadius: 100,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 40,
    gap: SPACING.sm,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    letterSpacing: 0.8,
    marginTop: SPACING.xs,
    marginLeft: 4,
  },
  groupedCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  pressedRow: {
    opacity: 0.75,
  },
  rowIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTextCol: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  rowTitle: { },
  rowSeparator: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginLeft: 62,
  },
});
