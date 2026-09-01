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
import { Sparkles, Calendar, Target, User, ShieldCheck } from 'lucide-react-native';

export default function OnboardingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
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
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!age || isNaN(Number(age)) || Number(age) <= 0) newErrors.age = 'Provide a valid age';
    if (!height || isNaN(Number(height)) || Number(height) <= 0) newErrors.height = 'Provide a valid height';
    if (!weight || isNaN(Number(weight)) || Number(weight) <= 0) newErrors.weight = 'Provide a valid weight';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    if (!cycleLength || isNaN(Number(cycleLength)) || Number(cycleLength) < 15 || Number(cycleLength) > 50) {
      newErrors.cycleLength = 'Length must be between 15 and 50 days';
    }
    if (!periodDuration || isNaN(Number(periodDuration)) || Number(periodDuration) < 2 || Number(periodDuration) > 15) {
      newErrors.periodDuration = 'Duration must be between 2 and 15 days';
    }
    if (!lastPeriodStart || !/^\d{4}-\d{2}-\d{2}$/.test(lastPeriodStart)) {
      newErrors.lastPeriodStart = 'Use YYYY-MM-DD format';
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
      if (validateStep3()) setStep(4);
    } else if (step === 4) {
      setStep(5);
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

    // 4. Save initial weight measurement
    addMeasurement({
      weight: Number(weight),
      date: new Date().toISOString().split('T')[0],
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
              STEP {step} OF 5
            </Typography>
            <View style={styles.progressContainer}>
              {[1, 2, 3, 4, 5].map((i) => (
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
                <Typography variant="h2" style={styles.stepTitle}>Tell Us About You</Typography>
              </View>
              <Typography variant="bodyMedium" color={PALETTE.charcoal.light} style={styles.subtitle}>
                We use this to customize calorie targets, water requirements, and basic readiness parameters.
              </Typography>

              <InputField
                label="What should we call you?"
                value={name}
                onChangeText={setName}
                placeholder="Name"
                error={errors.name}
              />
              <InputField
                label="Age (Years)"
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                placeholder="28"
                error={errors.age}
              />
              <View style={styles.row}>
                <View style={styles.flexHalf}>
                  <InputField
                    label="Height (cm)"
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="number-pad"
                    placeholder="165"
                    error={errors.height}
                  />
                </View>
                <View style={styles.flexHalf}>
                  <InputField
                    label="Weight (kg)"
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

          {/* Step 2: Goal Selection */}
          {step === 2 && (
            <Card style={styles.stepCard}>
              <View style={styles.titleRow}>
                <Target color={PALETTE.sage.default} size={28} />
                <Typography variant="h2" style={styles.stepTitle}>What is your goal?</Typography>
              </View>
              <Typography variant="bodyMedium" color={PALETTE.charcoal.light} style={styles.subtitle}>
                Choose a general focus. Sini AI supports healthy recomposition without scale anxiety.
              </Typography>

              {(
                [
                  { id: 'lose', title: 'Lean & Tone', desc: 'Promote fat loss while maintaining muscular fitness.' },
                  { id: 'gain', title: 'Build Strength', desc: 'Focus on gaining muscle density and energy levels.' },
                  { id: 'wellness', title: 'General Wellness', desc: 'Improve hydration, sleep, energy, and overall health.' },
                  { id: 'maintain', title: 'Maintain Weight', desc: 'Maintain body composition and build consistency.' },
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

          {/* Step 3: Cycle Tracking */}
          {step === 3 && (
            <Card style={styles.stepCard}>
              <View style={styles.titleRow}>
                <Calendar color={PALETTE.sage.default} size={28} />
                <Typography variant="h2" style={styles.stepTitle}>Menstrual Rhythm</Typography>
              </View>
              <Typography variant="bodyMedium" color={PALETTE.charcoal.light} style={styles.subtitle}>
                We use cycle day calculations to adjust training suggestions and explain fluctuations.
              </Typography>

              <InputField
                label="Typical Cycle Length (Days)"
                value={cycleLength}
                onChangeText={setCycleLength}
                keyboardType="number-pad"
                placeholder="28"
                error={errors.cycleLength}
              />
              <InputField
                label="Typical Period Duration (Days)"
                value={periodDuration}
                onChangeText={setPeriodDuration}
                keyboardType="number-pad"
                placeholder="5"
                error={errors.periodDuration}
              />
              
              <InputField
                label="Last Period Start Date (YYYY-MM-DD)"
                value={lastPeriodStart}
                onChangeText={setLastPeriodStart}
                placeholder="2026-08-15"
                error={errors.lastPeriodStart}
              />

              <Typography variant="bodySmall" color={PALETTE.charcoal.light} style={styles.toggleLabel}>
                Is your cycle generally regular?
              </Typography>
              <View style={styles.toggleRow}>
                <Pressable
                  onPress={() => setIsRegular(true)}
                  style={[
                    styles.toggleBtn,
                    isRegular && styles.toggleBtnActive,
                  ]}
                >
                  <Typography variant="bodyMedium" color={isRegular ? PALETTE.white : undefined}>Regular</Typography>
                </Pressable>
                <Pressable
                  onPress={() => setIsRegular(false)}
                  style={[
                    styles.toggleBtn,
                    !isRegular && styles.toggleBtnActive,
                  ]}
                >
                  <Typography variant="bodyMedium" color={!isRegular ? PALETTE.white : undefined}>Irregular</Typography>
                </Pressable>
              </View>
            </Card>
          )}

          {/* Step 4: Groq API Key Setup */}
          {step === 4 && (
            <Card style={styles.stepCard}>
              <View style={styles.titleRow}>
                <ShieldCheck color={PALETTE.sage.default} size={28} />
                <Typography variant="h2" style={styles.stepTitle}>Privacy & AI Setup</Typography>
              </View>
              <Typography variant="bodyMedium" color={PALETTE.charcoal.light} style={styles.subtitle}>
                Sini AI uses direct client-side AI integration to ensure your data stays 100% private. 
              </Typography>
              <Typography variant="bodySmall" color={PALETTE.charcoal.light} style={styles.infoText}>
                Input your free Groq API key to unlock natural-language meal/workout extraction and personalized advice. No subscription needed!
              </Typography>

              <InputField
                label="Groq API Key (Optional, starts with gsk_)"
                value={groqKey}
                onChangeText={setGroqKey}
                secureTextEntry
                placeholder="gsk_..."
              />

              <Typography variant="caption" color={PALETTE.charcoal.light} style={styles.helperText}>
                You can create a key at console.groq.com. If you leave this blank, the app will work locally using regex logging.
              </Typography>
            </Card>
          )}

          {/* Step 5: Summary */}
          {step === 5 && (
            <Card style={styles.stepCard}>
              <View style={styles.titleRow}>
                <Sparkles color={PALETTE.sage.default} size={28} />
                <Typography variant="h2" style={styles.stepTitle}>Welcome to Sini AI</Typography>
              </View>
              <Typography variant="bodyMedium" color={PALETTE.charcoal.light} style={styles.subtitle}>
                All set, {name}!
              </Typography>

              <View style={styles.summaryBox}>
                <Typography variant="bodyMedium" style={styles.summaryItem}>
                  ✨ Goal: <Typography variant="bodyLarge" style={styles.boldText}>{weightGoal.toUpperCase()}</Typography>
                </Typography>
                <Typography variant="bodyMedium" style={styles.summaryItem}>
                  🩸 Cycle Length: <Typography variant="bodyLarge" style={styles.boldText}>{cycleLength} Days</Typography>
                </Typography>
                <Typography variant="bodyMedium" style={styles.summaryItem}>
                  🧬 AI Integration: <Typography variant="bodyLarge" style={styles.boldText}>{groqKey ? 'Active (Groq Cloud)' : 'Offline/Local Mode'}</Typography>
                </Typography>
              </View>

              <Typography variant="bodySmall" color={PALETTE.charcoal.light} style={styles.disclaimer}>
                We will now synchronize daily recommendations based on your sleep, energy, stress, and cycle logs.
              </Typography>
            </Card>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            {step > 1 && (
              <Button
                title="Back"
                variant="outline"
                onPress={handleBack}
                style={styles.backButton}
              />
            )}
            {step < 5 ? (
              <Button
                title="Continue"
                onPress={handleNext}
                style={styles.nextButton}
              />
            ) : (
              <Button
                title="Get Started"
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
    fontFamily: 'Outfit-Bold',
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
    fontFamily: 'Outfit-Medium',
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
