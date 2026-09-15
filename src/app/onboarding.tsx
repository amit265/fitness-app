import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  useColorScheme,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { InputField } from '../components/InputField';
import { useAppStore } from '../store/useAppStore';
import { PALETTE, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Sparkles, Calendar, Target, User, ShieldCheck, Scale } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { t } from '../i18n';

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const uiLanguage = useAppStore((state) => state.uiLanguage);
  const setUserProfile = useAppStore((state) => state.setUserProfile);
  const setCyclePreferences = useAppStore((state) => state.setCyclePreferences);
  const addPeriodLog = useAppStore((state) => state.addPeriodLog);
  const addMeasurement = useAppStore((state) => state.addMeasurement);

  const [step, setStep] = useState(1);

  // Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  
  // Optional measurements
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [chest, setChest] = useState('');
  const [thigh, setThigh] = useState('');

  const [weightGoal, setWeightGoal] = useState<'lose' | 'maintain' | 'gain' | 'wellness'>('wellness');

  const [cycleLength, setCycleLength] = useState('28');
  const [periodDuration, setPeriodDuration] = useState('5');
  const [isRegular, setIsRegular] = useState(true);
  const [lastPeriodStart, setLastPeriodStart] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Default to today
  });

  const [groqKey, setGroqKey] = useState('');

  // Errors State
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = t('onboarding.errName');
    if (!age || isNaN(Number(age)) || Number(age) <= 0) newErrors.age = t('onboarding.errAge');
    if (!height || isNaN(Number(height)) || Number(height) <= 0) newErrors.height = t('onboarding.errHeight');
    if (!weight || isNaN(Number(weight)) || Number(weight) <= 0) newErrors.weight = t('onboarding.errWeight');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    if (!cycleLength || isNaN(Number(cycleLength)) || Number(cycleLength) < 15 || Number(cycleLength) > 50) {
      newErrors.cycleLength = t('onboarding.errCycleLength');
    }
    if (!periodDuration || isNaN(Number(periodDuration)) || Number(periodDuration) < 2 || Number(periodDuration) > 15) {
      newErrors.periodDuration = t('onboarding.errPeriodDuration');
    }
    if (!lastPeriodStart || !/^\d{4}-\d{2}-\d{2}$/.test(lastPeriodStart)) {
      newErrors.lastPeriodStart = t('onboarding.errDateFormat');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      if (validateStep3()) setStep(5);
    } else if (step === 5) {
      setStep(6);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    // 1. Save User Profile
    setUserProfile({
      name: name.trim(),
      age: Number(age),
      height: Number(height),
      weightGoal,
      groqApiKey: groqKey.trim() || undefined,
      hasCompletedOnboarding: true,
    });

    // 2. Save Cycle Preferences
    setCyclePreferences({
      typicalCycleLength: Number(cycleLength),
      typicalPeriodDuration: Number(periodDuration),
      isRegular,
    });

    // 3. Save initial period start date
    addPeriodLog({
      startDate: lastPeriodStart,
      flowIntensity: 'medium',
    });

    // 4. Save initial measurements
    addMeasurement({
      date: new Date().toISOString().split('T')[0],
      weight: Number(weight),
      ...(waist ? { waist: Number(waist) } : {}),
      ...(hips ? { hips: Number(hips) } : {}),
      ...(chest ? { chest: Number(chest) } : {}),
      ...(thigh ? { thigh: Number(thigh) } : {}),
    });

    // 5. Navigate to Home
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121110' : PALETTE.oat.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* Header Step Counter */}
          <View style={styles.stepHeader}>
            <Typography variant="bodySmall" color={PALETTE.sage.default} style={styles.stepText}>
              {t('onboarding.stepLabel')} {step} {t('onboarding.stepOf')}
            </Typography>
            <View style={styles.progressContainer}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.progressDot,
                    {
                      backgroundColor: i <= step ? PALETTE.sage.default : isDark ? '#2E2B28' : '#ECE9E4',
                      flex: i === step ? 2 : 1,
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Step 1: Biometrics */}
          {step === 1 && (
            <Card style={styles.stepCard}>
              <View style={styles.titleRow}>
                <User color={PALETTE.sage.default} size={28} />
                <Typography variant="h2" style={styles.stepTitle}>{t('onboarding.step1Title')}</Typography>
              </View>
              <Typography variant="bodyMedium" color={PALETTE.charcoal.light} style={styles.subtitle}>
                {t('onboarding.step1Desc')}
              </Typography>

              <InputField
                label={t('onboarding.namePrompt')}
                value={name}
                onChangeText={setName}
                placeholder={t('onboarding.namePlaceholder')}
                error={errors.name}
              />
              <InputField
                label={t('onboarding.ageLabel')}
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                placeholder="28"
                error={errors.age}
              />
              <View style={styles.row}>
                <View style={styles.flexHalf}>
                  <InputField
                    label={t('onboarding.heightLabel')}
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="number-pad"
                    placeholder="165"
                    error={errors.height}
                  />
                </View>
                <View style={styles.flexHalf}>
                  <InputField
                    label={t('onboarding.weightLabel')}
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="decimal-pad"
                    placeholder="60"
                    error={errors.weight}
                  />
                </View>
              </View>
            </Card>
          )}

          {/* Step 2: Optional Measurements */}
          {step === 2 && (
            <Card style={styles.stepCard}>
              <View style={styles.titleRow}>
                <Scale color={PALETTE.sage.default} size={28} />
                <Typography variant="h2" style={styles.stepTitle}>{t('progress.logMeasurement', { defaultValue: 'Initial Measurements' })}</Typography>
              </View>
              <Typography variant="bodyMedium" color={PALETTE.charcoal.light} style={styles.subtitle}>
                {t('onboarding.step2Optional', { defaultValue: 'Tracking these allows us to show you real progress over time. (Optional)' })}
              </Typography>

              <View style={styles.row}>
                <View style={styles.flexHalf}>
                  <InputField label={t('progress.waistCm', { defaultValue: 'Waist (cm)' })} value={waist} onChangeText={setWaist} keyboardType="decimal-pad" placeholder="e.g. 75" />
                </View>
                <View style={styles.flexHalf}>
                  <InputField label={t('progress.hipsCm', { defaultValue: 'Hips (cm)' })} value={hips} onChangeText={setHips} keyboardType="decimal-pad" placeholder="e.g. 95" />
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.flexHalf}>
                  <InputField label={t('progress.chestCm', { defaultValue: 'Chest (cm)' })} value={chest} onChangeText={setChest} keyboardType="decimal-pad" placeholder="e.g. 90" />
                </View>
                <View style={styles.flexHalf}>
                  <InputField label={t('progress.thighCm', { defaultValue: 'Thigh (cm)' })} value={thigh} onChangeText={setThigh} keyboardType="decimal-pad" placeholder="e.g. 50" />
                </View>
              </View>
            </Card>
          )}

          {/* Step 3: Goal Selection */}
          {step === 3 && (
            <Card style={styles.stepCard}>
              <View style={styles.titleRow}>
                <Target color={PALETTE.sage.default} size={28} />
                <Typography variant="h2" style={styles.stepTitle}>{t('onboarding.step2Title')}</Typography>
              </View>
              <Typography variant="bodyMedium" color={PALETTE.charcoal.light} style={styles.subtitle}>
                {t('onboarding.step2Desc')}
              </Typography>

              {(
                [
                  { id: 'lose', title: t('onboarding.goalLoseTitle'), desc: t('onboarding.goalLoseDesc') },
                  { id: 'gain', title: t('onboarding.goalGainTitle'), desc: t('onboarding.goalGainDesc') },
                  { id: 'wellness', title: t('onboarding.goalWellnessTitle'), desc: t('onboarding.goalWellnessDesc') },
                  { id: 'maintain', title: t('onboarding.goalMaintainTitle'), desc: t('onboarding.goalMaintainDesc') },
                ] as const
              ).map((goal) => {
                const selected = weightGoal === goal.id;
                return (
                  <Pressable
                    key={goal.id}
                    onPress={() => setWeightGoal(goal.id)}
                    style={[
                      styles.goalCard,
                      {
                        borderColor: selected ? PALETTE.sage.default : isDark ? '#2E2B28' : '#ECE9E4',
                        backgroundColor: selected ? (isDark ? '#25352A' : '#EAF0EC') : 'transparent',
                      },
                    ]}
                  >
                    <Typography variant="bodyLarge" style={styles.goalTitle} color={selected ? PALETTE.sage.dark : undefined}>
                      {goal.title}
                    </Typography>
                    <Typography variant="bodySmall" color={PALETTE.charcoal.light}>
                      {goal.desc}
                    </Typography>
                  </Pressable>
                );
              })}
            </Card>
          )}

          {/* Step 4: Cycle Tracking */}
          {step === 4 && (
            <Card style={styles.stepCard}>
              <View style={styles.titleRow}>
                <Calendar color={PALETTE.sage.default} size={28} />
                <Typography variant="h2" style={styles.stepTitle}>{t('onboarding.step3Title')}</Typography>
              </View>
              <Typography variant="bodyMedium" color={PALETTE.charcoal.light} style={styles.subtitle}>
                {t('onboarding.step3Desc')}
              </Typography>

              <InputField
                label={t('onboarding.cycleLengthLabel')}
                value={cycleLength}
                onChangeText={setCycleLength}
                keyboardType="number-pad"
                placeholder="28"
                error={errors.cycleLength}
              />
              <InputField
                label={t('onboarding.periodDurationLabel')}
                value={periodDuration}
                onChangeText={setPeriodDuration}
                keyboardType="number-pad"
                placeholder="5"
                error={errors.periodDuration}
              />
              
              <InputField
                label={t('onboarding.lastPeriodStartLabel')}
                value={lastPeriodStart}
                onChangeText={setLastPeriodStart}
                placeholder="2026-08-15"
                error={errors.lastPeriodStart}
              />

              <Typography variant="bodySmall" color={PALETTE.charcoal.light} style={styles.toggleLabel}>
                {t('onboarding.isRegularLabel')}
              </Typography>
              <View style={styles.toggleRow}>
                <Pressable
                  onPress={() => setIsRegular(true)}
                  style={[
                    styles.toggleBtn,
                    isRegular && styles.toggleBtnActive,
                  ]}
                >
                  <Typography variant="bodyMedium" color={isRegular ? PALETTE.white : undefined}>{t('onboarding.regularOption')}</Typography>
                </Pressable>
                <Pressable
                  onPress={() => setIsRegular(false)}
                  style={[
                    styles.toggleBtn,
                    !isRegular && styles.toggleBtnActive,
                  ]}
                >
                  <Typography variant="bodyMedium" color={!isRegular ? PALETTE.white : undefined}>{t('onboarding.irregularOption')}</Typography>
                </Pressable>
              </View>
            </Card>
          )}

          {/* Step 5: Groq API Key Setup */}
          {step === 5 && (
            <Card style={styles.stepCard}>
              <View style={styles.titleRow}>
                <ShieldCheck color={PALETTE.sage.default} size={28} />
                <Typography variant="h2" style={styles.stepTitle}>{t('onboarding.step4Title')}</Typography>
              </View>
              <Typography variant="bodyMedium" color={PALETTE.charcoal.light} style={styles.subtitle}>
                {t('onboarding.step4Desc1')}
              </Typography>
              <Typography variant="bodySmall" color={PALETTE.charcoal.light} style={styles.infoText}>
                {t('onboarding.step4Desc2')}
              </Typography>

              <InputField
                label={t('onboarding.groqLabel')}
                value={groqKey}
                onChangeText={setGroqKey}
                secureTextEntry
                placeholder="gsk_..."
              />

              <Typography variant="caption" color={PALETTE.charcoal.light} style={styles.helperText}>
                {t('onboarding.groqHint')}
              </Typography>
            </Card>
          )}

          {/* Step 6: Summary */}
          {step === 6 && (
            <Card style={styles.stepCard}>
              <View style={styles.titleRow}>
                <Sparkles color={PALETTE.sage.default} size={28} />
                <Typography variant="h2" style={styles.stepTitle}>{t('onboarding.welcomeTitle')}</Typography>
              </View>
              <Typography variant="bodyMedium" color={PALETTE.charcoal.light} style={styles.subtitle}>
                {t('onboarding.allSet', { name: name || 'there' })}
              </Typography>

              <View style={styles.summaryBox}>
                <Typography variant="bodyMedium" style={styles.summaryItem}>
                  {t('onboarding.summaryGoal')}<Typography variant="bodyLarge" style={styles.boldText}>{weightGoal.toUpperCase()}</Typography>
                </Typography>
                <Typography variant="bodyMedium" style={styles.summaryItem}>
                  {t('onboarding.summaryCycleLength')}<Typography variant="bodyLarge" style={styles.boldText}>{cycleLength}{t('onboarding.summaryDays')}</Typography>
                </Typography>
                <Typography variant="bodyMedium" style={styles.summaryItem}>
                  {t('onboarding.summaryAi')}<Typography variant="bodyLarge" style={styles.boldText}>{groqKey ? t('onboarding.aiActive') : t('onboarding.aiOffline')}</Typography>
                </Typography>
              </View>

              <Typography variant="bodySmall" color={PALETTE.charcoal.light} style={styles.disclaimer}>
                {t('onboarding.syncDesc')}
              </Typography>
            </Card>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            {step > 1 && (
              <Button
                title={t('common.back')}
                variant="outline"
                onPress={handleBack}
                style={styles.backButton}
              />
            )}
            {step < 6 ? (
              <Button
                title={t('common.next')}
                onPress={handleNext}
                style={styles.nextButton}
              />
            ) : (
              <Button
                title={t('onboarding.startBtn')}
                onPress={handleComplete}
                style={styles.nextButton}
              />
            )}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  stepHeader: {
    marginBottom: SPACING.lg,
  },
  stepText: {
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  progressContainer: {
    flexDirection: 'row',
    height: 6,
    width: '100%',
  },
  progressDot: {
    height: '100%',
    borderRadius: 3,
    marginHorizontal: 3,
  },
  stepCard: {
    padding: SPACING.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: 8,
  },
  stepTitle: {
    flex: 1,
  },
  subtitle: {
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  infoText: {
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  flexHalf: {
    flex: 1,
  },
  goalCard: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  goalTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  toggleLabel: {
    marginBottom: SPACING.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  toggleBtn: {
    flex: 1,
    height: 44,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: '#ECE9E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: PALETTE.sage.default,
    borderColor: PALETTE.sage.default,
  },
  helperText: {
    lineHeight: 14,
    marginTop: -SPACING.sm,
    marginBottom: SPACING.md,
  },
  summaryBox: {
    backgroundColor: '#EAF0EC',
    borderRadius: 16,
    padding: SPACING.md,
    marginVertical: SPACING.lg,
  },
  summaryItem: {
    marginBottom: SPACING.xs,
  },
  boldText: {
    fontWeight: '700',
  },
  disclaimer: {
    lineHeight: 16,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'column',
    marginTop: SPACING.xl,
    gap: SPACING.sm,
  },
  backButton: {
    width: '100%',
  },
  nextButton: {
    width: '100%',
  },
});
