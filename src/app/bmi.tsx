import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  useColorScheme,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
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
import { BannerAdComponent } from '../services/AdManager';
import { t } from '../i18n';

export default function BMICalculatorScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();

  // Store data & actions
  const userProfile = useAppStore((state) => state.userProfile);
  const measurements = useAppStore((state) => state.measurements);
  const setUserProfile = useAppStore((state) => state.setUserProfile);
  const addMeasurement = useAppStore((state) => state.addMeasurement);

  // Pre-fill values
  const defaultHeight = userProfile?.height ? String(userProfile.height) : '';
  const defaultWeight = measurements[0]?.weight ? String(measurements[0].weight) : '';

  // Local calculation form states
  const [heightInput, setHeightInput] = useState(defaultHeight);
  const [weightInput, setWeightInput] = useState(defaultWeight);
  
  // Results states
  const [bmiResult, setBmiResult] = useState<number | null>(() => {
    const h = parseFloat(defaultHeight);
    const w = parseFloat(defaultWeight);
    if (h > 0 && w > 0) {
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
      setValidationError('Please enter a valid height greater than 0.');
      setBmiResult(null);
      return;
    }
    if (h > 300) {
      setValidationError('Please enter a realistic height (under 300 cm).');
      setBmiResult(null);
      return;
    }
    if (isNaN(w) || w <= 0) {
      setValidationError('Please enter a valid weight greater than 0.');
      setBmiResult(null);
      return;
    }
    if (w > 600) {
      setValidationError('Please enter a realistic weight (under 600 kg).');
      setBmiResult(null);
      return;
    }

    const calculated = calculateBMI(w, h);
    if (isNaN(calculated) || !isFinite(calculated)) {
      setValidationError('Invalid calculation results.');
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
      Alert.alert('Validation Error', 'Please perform a valid calculation before saving.');
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

    Alert.alert('Success', 'Height & weight updated in your metrics successfully.', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const currentCategory = bmiResult !== null ? getBMICategory(bmiResult) : 'Unknown';
  const userAge = userProfile?.age ?? 25;
  const isUnderage = userAge < 18;

  // Category Color Map
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Normal weight':
        return PALETTE.success;
      case 'Underweight':
        return '#D4A373';
      case 'Overweight':
        return '#E29578';
      case 'Obesity':
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
          <Typography variant="h3">BMI Calculator</Typography>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          <Card style={styles.card}>
            <Typography variant="bodyMedium" color={PALETTE.charcoal.light} style={{ marginBottom: SPACING.md }}>
              Calculate Body Mass Index (BMI) using your height and current weight.
            </Typography>

            <InputField
              label="Height (cm)"
              value={heightInput}
              onChangeText={setHeightInput}
              keyboardType="decimal-pad"
              placeholder="165"
            />

            <InputField
              label="Weight (kg)"
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
              <Button title="Calculate" onPress={handleCalculate} style={{ width: '100%' }} />
              <Button title="Save to Profile" variant="outline" onPress={handleSaveToProfile} style={{ width: '100%' }} />
            </View>
          </Card>

          {/* Results Summary */}
          {bmiResult !== null && (
            <Card style={styles.resultCard}>
              <Typography variant="caption" color={PALETTE.charcoal.light}>YOUR BMI</Typography>
              <Typography variant="dataValue" style={[styles.resultValue, { color: getCategoryColor(currentCategory) }]}>
                {bmiResult.toFixed(1)}
              </Typography>
              
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(currentCategory) + '15' }]}>
                <Typography variant="bodyLarge" style={{ fontFamily: 'Outfit-Bold', color: getCategoryColor(currentCategory) }}>
                  {currentCategory.toUpperCase()}
                </Typography>
              </View>

              {isUnderage && (
                <View style={styles.warningBox}>
                  <Typography variant="bodySmall" color="#D4A373" style={{ lineHeight: 16 }}>
                    ⚠️ Note: You are under 18 years of age. Standard adult BMI categories may not accurately reflect healthy growth ranges for children and teens.
                  </Typography>
                </View>
              )}
            </Card>
          )}

          {/* Reference Categories Table */}
          <Card style={styles.referenceCard}>
            <Typography variant="h3" style={{ marginBottom: SPACING.sm }}>
              Standard Adult BMI Categories
            </Typography>
            
            <View style={styles.tableRow}>
              <Typography variant="bodyMedium" color={PALETTE.charcoal.light}>Below 18.5</Typography>
              <Typography variant="bodyMedium" style={styles.boldText}>Underweight</Typography>
            </View>
            <View style={styles.tableRow}>
              <Typography variant="bodyMedium" color={PALETTE.charcoal.light}>18.5 – 24.9</Typography>
              <Typography variant="bodyMedium" style={[styles.boldText, { color: PALETTE.success }]}>Normal weight</Typography>
            </View>
            <View style={styles.tableRow}>
              <Typography variant="bodyMedium" color={PALETTE.charcoal.light}>25.0 – 29.9</Typography>
              <Typography variant="bodyMedium" style={styles.boldText}>Overweight</Typography>
            </View>
            <View style={styles.tableRow}>
              <Typography variant="bodyMedium" color={PALETTE.charcoal.light}>30.0+</Typography>
              <Typography variant="bodyMedium" style={styles.boldText}>Obesity</Typography>
            </View>

            <View style={styles.divider} />

            <View style={styles.disclaimerContainer}>
              <Info color={PALETTE.charcoal.light} size={16} style={{ marginTop: 2 }} />
              <Typography variant="caption" color={PALETTE.charcoal.light} style={styles.disclaimerText}>
                {getBMIDisclaimer()}
              </Typography>
            </View>
          </Card>

        </ScrollView>

        {/* STICKY BOTTOM BANNER AD */}
        <View style={[styles.bottomStickyBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <BannerAdComponent />
        </View>
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
    fontFamily: 'Outfit-Bold',
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
