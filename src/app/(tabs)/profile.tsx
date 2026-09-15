import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, KeyboardAvoidingView, Platform,  } from 'react-native';
import { Typography } from '../../components/Typography';
import { SiniAvatar } from '../../components/SiniAvatar';
import { useAppStore } from '../../store/useAppStore';
import { DestyaStudioFooter } from '../../components/DestyaStudioFooter';
import { DestyaStudioAppsHub } from '../../components/DestyaStudioAppsHub';
import { PALETTE, SPACING } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../context/ThemeContext';
import { useIAP } from '../../context/IAPContext';
import {
  Settings,
  Trash2,
  Ruler,
  Award,
  Calendar as CalendarIcon,
  Crown,
  Star,
  ChevronRight,
  User,
  Sliders,
  Sparkles,
  Flame,
  ShieldCheck,
  Moon,
  Zap,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { calculateBMI, getBMICategory } from '../../utils/bmiUtils';
import { t } from '../../i18n';
import { CalculatorModal } from '../../components/CalculatorModal';
import { Alert } from '../../utils/alertUtils';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useResponsive } from '../../utils/responsive';

import {
  calculateBMR,
  calculateDailyCalorieTarget,
  calculateHealthyWeightRange,
  calculateMacroTargets,
  estimateHydration
} from '../../domain/calories/calorieEngine';

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const uiLanguage = useAppStore((state) => state.uiLanguage);

  // Store bindings
  const userProfile = useAppStore((state) => state.userProfile);
  const cyclePreferences = useAppStore((state) => state.cyclePreferences);
  const measurements = useAppStore((state) => state.measurements);
  const streak = useAppStore((state) => state.streak);
  const resetStore = useAppStore((state) => state.resetStore);
    const { isPremium: isIapPremium, premiumProduct, requestPurchase, restorePurchases } = useIAP();


  const handleRestorePurchases = async () => {
    const res = await restorePurchases();
    Alert.alert(res.success ? t('settings.purchasesRestored') : t('settings.restoreNotice'), res.message);
  };


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
  const setUserProfile = useAppStore((state) => state.setUserProfile);

  const handleUseForSini = (goalOverride: 'lose' | 'gain' | 'maintain' | 'wellness') => {
    if (userProfile) {
      setUserProfile({ ...userProfile, weightGoal: goalOverride });
      Alert.alert(t('common.done'), 'Sini calorie target updated based on your goal.');
      setActiveModal(null);
    }
  };

  const handleResetData = () => {
    Alert.alert(
      t('settings.resetData'),
      t('settings.resetDataConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.resetData'),
          style: 'destructive',
          onPress: () => {
            resetStore();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        
        {/* Header Bar with Settings Gear Button */}
        <View style={[styles.headerBar, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
          <Typography variant="h2" >{t('profile.title')}</Typography>
          <Pressable
            style={({ pressed }) => [styles.settingsGearBtn, { backgroundColor: colors.surface }, pressed && { opacity: 0.7 }]}
            onPress={() => router.push('/settings')}
          >
            <Settings size={20} color={colors.primary} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Top Hero User Identity Card */}
          <View style={[styles.heroProfileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.avatarWrapper}>
              <SiniAvatar size={76} variant="plum" />
              <View style={styles.streakBadgeOverlay}>
                <Flame size={14} color={colors.ovulation} />
                <Typography variant="caption" color={colors.ovulation} style={{ marginLeft: 2 }}>
                  {streak?.currentStreak || 1}d
                </Typography>
              </View>
            </View>

            <Typography variant="h1" style={styles.userNameText}>
              {userProfile?.name || 'User'}
            </Typography>
            <View style={styles.memberTagPill}>
              <Sparkles size={13} color={colors.primary} />
              <Typography variant="caption" color={colors.primary} style={{ marginLeft: 4 }}>
                {t('common.appName')} · {t('common.tagline')}
              </Typography>
            </View>

            <View style={styles.biometricsStrip}>
              <View style={styles.bioItem}>
                <Typography variant="caption" color={colors.subtext}>{t('onboarding.ageLabel')}</Typography>
                <Typography variant="bodyMedium" style={styles.bioValue}>{userProfile?.age || 28} {t('common.yrs')}</Typography>
              </View>
              <View style={[styles.bioDivider, { backgroundColor: colors.border }]} />
              <View style={styles.bioItem}>
                <Typography variant="caption" color={colors.subtext}>{t('profile.heightLabel')}</Typography>
                <Typography variant="bodyMedium" style={styles.bioValue}>{currentHeight} cm</Typography>
              </View>
              <View style={[styles.bioDivider, { backgroundColor: colors.border }]} />
              <View style={styles.bioItem}>
                <Typography variant="caption" color={colors.subtext}>{t('profile.weightLabel')}</Typography>
                <Typography variant="bodyMedium" style={styles.bioValue}>{currentWeight} kg</Typography>
              </View>
              <View style={[styles.bioDivider, { backgroundColor: colors.border }]} />
              <View style={styles.bioItem}>
                <Typography variant="caption" color={colors.subtext}>{t('profile.bmiLabel')}</Typography>
                <Typography variant="bodyMedium" color={colors.primary} style={styles.bioValue}>{bmiVal.toFixed(1)}</Typography>
              </View>
            </View>
          </View>

          
          {/* MEMBERSHIP SECTION */}
{/* MEMBERSHIP & AD-FREE UNLOCK */}
        <Typography variant="caption" color={colors.subtext} style={styles.sectionHeaderTitle}>
          {t('settings.membershipHeader').toUpperCase()}
        </Typography>
        <View style={[styles.groupedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Pressable
            style={({ pressed }) => [styles.rowItem, pressed && styles.pressedRow]}
            onPress={requestPurchase}
          >
            <View style={[styles.rowIconCircle, { backgroundColor: colors.surface }]}>
              <Crown size={18} color={PALETTE.gold.default} />
            </View>
            <View style={styles.rowTextCol}>
              <Typography variant="bodyMedium" color={PALETTE.gold.default} >
                {t('settings.removeAdsTitle')}
              </Typography>
              <Typography variant="caption" color={colors.subtext}>
                {isIapPremium ? t('settings.lifetimeActive') : t('settings.lifetimeDesc')}
              </Typography>
            </View>
            <View style={styles.priceTagBadge}>
              <Typography variant="caption" color={PALETTE.white} >
                {premiumProduct?.displayPrice || '$2.99'}
              </Typography>
            </View>
          </Pressable>


          <View style={styles.rowSeparator} />

              <Pressable
                style={({ pressed }) => [styles.rowItem, pressed && styles.pressedRow]}
                onPress={handleRestorePurchases}
              >
                <View style={[styles.rowIconCircle, { backgroundColor: colors.surface }]}>
                  <Star size={18} color={colors.subtext} />
                </View>
                <View style={styles.rowTextCol}>
                  <Typography variant="bodyMedium" style={styles.rowTitle}>
                    {t('settings.restorePurchases')}
                  </Typography>
                  <Typography variant="caption" color={colors.subtext}>
                    {t('settings.restoreDesc')}
                  </Typography>
                </View>
              <ChevronRight size={18} color={colors.subtext} />
            </Pressable>
          </View>

        
          {/* GROUP 1: HEALTH & FITNESS TOOLS */}

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

            <View style={styles.rowSeparator} />

            {/* Nutrition & Goals (Original) */}
            <Pressable
              style={({ pressed }) => [styles.rowItem, pressed && styles.pressedRow]}
              onPress={() => router.push('/edit-profile')}
            >
              <View style={[styles.rowIconCircle, { backgroundColor: colors.surface }]}>
                <User size={18} color={colors.nutrition} />
              </View>
              <View style={styles.rowTextCol}>
                <Typography variant="bodyMedium" style={styles.rowTitle}>{t('profile.nutritionWeightGoals')}</Typography>
                <Typography variant="caption" color={colors.subtext}>
                  {(userProfile?.weightGoal || 'wellness').toUpperCase()} · {(userProfile?.regionalCuisine || 'indian').toUpperCase()} cuisine
                </Typography>
              </View>
              <ChevronRight size={18} color={colors.subtext} />
            </Pressable>
          </View>

          {/* GROUP 2: MENSTRUAL CYCLE PARAMETERS */}
          <Typography variant="caption" color={colors.subtext} style={styles.sectionHeaderTitle}>
            {t('profile.cycleSection')}
          </Typography>
          <View style={[styles.groupedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Pressable
              style={({ pressed }) => [styles.rowItem, pressed && styles.pressedRow]}
              onPress={() => router.push('/cycle')}
            >
              <View style={[styles.rowIconCircle, { backgroundColor: colors.surface }]}>
                <CalendarIcon size={18} color={colors.period} />
              </View>
              <View style={styles.rowTextCol}>
                <Typography variant="bodyMedium" style={styles.rowTitle}>{t('profile.cycleCalendarPredictions')}</Typography>
                <Typography variant="caption" color={colors.subtext}>
                  {cyclePreferences?.typicalCycleLength || 28}d typical cycle · {cyclePreferences?.typicalPeriodDuration || 5}d period
                </Typography>
              </View>
              <ChevronRight size={18} color={colors.subtext} />
            </Pressable>
          </View>

          {/* Native Ad Card */}
          
          {/* Destya Studio Footer */}
          <DestyaStudioFooter />

        </ScrollView>
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    borderBottomWidth: 1,
  },
  settingsGearBtn: {
    padding: 8,
    borderRadius: 100,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 140,
    gap: SPACING.sm,
  },
  heroProfileCard: {
    padding: SPACING.lg,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: SPACING.sm,
  },
  streakBadgeOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: PALETTE.gold.default,
  },
  userNameText: {
    fontSize: 26,
    lineHeight: 30,
  },
  memberTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.plum.bg,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    marginTop: 6,
  },
  biometricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  bioItem: {
    alignItems: 'center',
  },
  bioValue: {
    marginTop: 2,
  },
  bioDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.08)',
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
  priceTagBadge: { backgroundColor: PALETTE.gold.default, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' },
  rowSeparator: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginLeft: 62,
  },
});
