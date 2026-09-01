import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  useColorScheme,
  ScrollView,
  Switch,
  Alert,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { InputField } from '../components/InputField';
import { useAppStore } from '../store/useAppStore';
import { PALETTE, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, Heart, Utensils, Target, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../context/ThemeContext';
import { BannerAdComponent } from '../services/AdManager';

export default function EditProfileScreen() {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();

  // Store data & actions
  const userProfile = useAppStore((state) => state.userProfile);
  const cyclePreferences = useAppStore((state) => state.cyclePreferences);
  const setUserProfile = useAppStore((state) => state.setUserProfile);
  const setCyclePreferences = useAppStore((state) => state.setCyclePreferences);

  // Form States
  const [name, setName] = useState(userProfile?.name || '');
  const [age, setAge] = useState(String(userProfile?.age || '28'));
  const [height, setHeight] = useState(String(userProfile?.height || '165'));
  const [weightGoal, setWeightGoal] = useState(userProfile?.weightGoal || 'wellness');
  const [regionalCuisine, setRegionalCuisine] = useState(userProfile?.regionalCuisine || 'indian');
  const [dietaryPreference, setDietaryPreference] = useState(userProfile?.dietaryPreference || 'anything');
  const [cycleLength, setCycleLength] = useState(String(cyclePreferences?.typicalCycleLength || '28'));
  const [periodDuration, setPeriodDuration] = useState(String(cyclePreferences?.typicalPeriodDuration || '5'));
  const [pauseCycle, setPauseCycle] = useState(userProfile?.pauseCycleTracking || false);

  // Modal selector states
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [cuisineModalVisible, setCuisineModalVisible] = useState(false);
  const [dietModalVisible, setDietModalVisible] = useState(false);

  const [saving, setSaving] = useState(false);

  const handleSaveProfile = () => {
    setSaving(true);

    // Update User Profile
    setUserProfile({
      name: name.trim() || 'Sarah',
      age: parseInt(age) || 28,
      height: parseFloat(height) || 165,
      weightGoal,
      regionalCuisine,
      dietaryPreference,
      groqApiKey: userProfile?.groqApiKey || '',
      hasCompletedOnboarding: true,
      pauseCycleTracking: pauseCycle,
    });

    // Update Cycle Preferences
    setCyclePreferences({
      typicalCycleLength: parseInt(cycleLength) || 28,
      typicalPeriodDuration: parseInt(periodDuration) || 5,
      isRegular: cyclePreferences?.isRegular ?? true,
    });

    setTimeout(() => {
      setSaving(false);
      Alert.alert('Saved', 'Profile and cycle parameters updated successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }, 300);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121110' : PALETTE.oat.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable style={styles.backBtn} onPress={() => router.back()}>
              <ArrowLeft color={colors.primary} size={24} />
            </Pressable>
            <Typography variant="h2" style={{ fontFamily: 'PlayfairDisplay-Bold' }}>
              Edit Profile
            </Typography>
            <View style={{ width: 40 }} />
          </View>

          {/* Section 1: Biometrics & Personal Info */}
          <Card style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <User color={colors.primary} size={20} />
              <Typography variant="h3">Personal Information</Typography>
            </View>

            <InputField
              label="Preferred Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Sarah"
            />

            <View style={styles.row}>
              <View style={styles.flexHalf}>
                <InputField
                  label="Age (Years)"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="number-pad"
                  placeholder="28"
                />
              </View>
              <View style={styles.flexHalf}>
                <InputField
                  label="Height (cm)"
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="number-pad"
                  placeholder="165"
                />
              </View>
            </View>
          </Card>

          {/* Section 2: Weight Goal & Nutrition Preferences */}
          <Card style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Utensils color={PALETTE.sage.default} size={20} />
              <Typography variant="h3">Goal & Cuisine Preferences</Typography>
            </View>

            {/* Goal Selector */}
            <Typography variant="bodySmall" style={styles.inputLabel}>Weight & Fitness Goal</Typography>
            <Pressable
              style={[styles.dropdownBtn, { backgroundColor: isDark ? '#1C1A18' : '#FAF8F5' }]}
              onPress={() => setGoalModalVisible(true)}
            >
              <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold' }}>
                {weightGoal.toUpperCase()}
              </Typography>
              <Typography variant="bodyMedium" color={PALETTE.charcoal.light}>▼</Typography>
            </Pressable>

            {/* Regional Cuisine Selector */}
            <Typography variant="bodySmall" style={styles.inputLabel}>Regional Cuisine</Typography>
            <Pressable
              style={[styles.dropdownBtn, { backgroundColor: isDark ? '#1C1A18' : '#FAF8F5' }]}
              onPress={() => setCuisineModalVisible(true)}
            >
              <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold' }}>
                {regionalCuisine.replace('_', ' ').toUpperCase()}
              </Typography>
              <Typography variant="bodyMedium" color={PALETTE.charcoal.light}>▼</Typography>
            </Pressable>

            {/* Dietary Preference Selector */}
            <Typography variant="bodySmall" style={styles.inputLabel}>Dietary Preference</Typography>
            <Pressable
              style={[styles.dropdownBtn, { backgroundColor: isDark ? '#1C1A18' : '#FAF8F5' }]}
              onPress={() => setDietModalVisible(true)}
            >
              <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold' }}>
                {dietaryPreference.replace('_', ' ').toUpperCase()}
              </Typography>
              <Typography variant="bodyMedium" color={PALETTE.charcoal.light}>▼</Typography>
            </Pressable>
          </Card>

          {/* Section 3: Cycle Parameters */}
          <Card style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Heart color={PALETTE.rose.default} size={20} />
              <Typography variant="h3">Cycle Parameters</Typography>
            </View>

            <View style={styles.row}>
              <View style={styles.flexHalf}>
                <InputField
                  label="Cycle Length (Days)"
                  value={cycleLength}
                  onChangeText={setCycleLength}
                  keyboardType="number-pad"
                  placeholder="28"
                />
              </View>
              <View style={styles.flexHalf}>
                <InputField
                  label="Period Duration (Days)"
                  value={periodDuration}
                  onChangeText={setPeriodDuration}
                  keyboardType="number-pad"
                  placeholder="5"
                />
              </View>
            </View>

            {/* Pause Cycle Predictions Toggle */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold' }}>
                  Pause Cycle Predictions
                </Typography>
                <Typography variant="caption" color={PALETTE.charcoal.light}>
                  Turn off predictions if pregnant or taking hormonal overrides.
                </Typography>
              </View>
              <Switch
                value={pauseCycle}
                onValueChange={setPauseCycle}
                trackColor={{ false: '#ECE9E4', true: PALETTE.sage.default }}
              />
            </View>
          </Card>

          {/* Action Buttons */}
          <View style={{ marginTop: SPACING.md, gap: SPACING.xs }}>
            <Button
              title={saving ? "Saving Changes..." : "Save Profile & Cycle Settings"}
              onPress={handleSaveProfile}
              disabled={saving}
            />
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => router.back()}
            />
          </View>

        </ScrollView>

        {/* STICKY BOTTOM BANNER AD */}
        <View style={[styles.bottomStickyBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <BannerAdComponent />
        </View>
      </KeyboardAvoidingView>

      {/* Goal Dropdown Modal */}
      <Modal visible={goalModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setGoalModalVisible(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: isDark ? '#1C1A18' : PALETTE.white }]}>
            <Typography variant="h3" style={{ marginBottom: SPACING.sm }}>Select Weight Goal</Typography>
            {['lose', 'maintain', 'gain', 'wellness'].map((g) => {
              const selected = weightGoal === g;
              return (
                <Pressable
                  key={g}
                  style={[styles.modalOption, selected && { backgroundColor: isDark ? '#25352A' : '#EAF0EC' }]}
                  onPress={() => {
                    setWeightGoal(g as any);
                    setGoalModalVisible(false);
                  }}
                >
                  <Typography
                    variant="bodyMedium"
                    color={selected ? PALETTE.sage.default : undefined}
                    style={{ fontFamily: selected ? 'Outfit-Bold' : 'Outfit-Medium' }}
                  >
                    {g.toUpperCase()}
                  </Typography>
                  {selected && <Check color={PALETTE.sage.default} size={18} />}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Cuisine Dropdown Modal */}
      <Modal visible={cuisineModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setCuisineModalVisible(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: isDark ? '#1C1A18' : PALETTE.white }]}>
            <Typography variant="h3" style={{ marginBottom: SPACING.sm }}>Select Regional Cuisine</Typography>
            {['indian', 'western', 'mediterranean', 'east_asian', 'latin_american', 'middle_eastern'].map((c) => {
              const selected = regionalCuisine === c;
              return (
                <Pressable
                  key={c}
                  style={[styles.modalOption, selected && { backgroundColor: isDark ? '#25352A' : '#EAF0EC' }]}
                  onPress={() => {
                    setRegionalCuisine(c as any);
                    setCuisineModalVisible(false);
                  }}
                >
                  <Typography
                    variant="bodyMedium"
                    color={selected ? PALETTE.sage.default : undefined}
                    style={{ fontFamily: selected ? 'Outfit-Bold' : 'Outfit-Medium' }}
                  >
                    {c.replace('_', ' ').toUpperCase()}
                  </Typography>
                  {selected && <Check color={PALETTE.sage.default} size={18} />}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Diet Dropdown Modal */}
      <Modal visible={dietModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setDietModalVisible(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: isDark ? '#1C1A18' : PALETTE.white }]}>
            <Typography variant="h3" style={{ marginBottom: SPACING.sm }}>Select Dietary Preference</Typography>
            {['anything', 'vegetarian', 'vegan', 'eggetarian', 'keto', 'high_protein'].map((d) => {
              const selected = dietaryPreference === d;
              return (
                <Pressable
                  key={d}
                  style={[styles.modalOption, selected && { backgroundColor: isDark ? '#25352A' : '#EAF0EC' }]}
                  onPress={() => {
                    setDietaryPreference(d as any);
                    setDietModalVisible(false);
                  }}
                >
                  <Typography
                    variant="bodyMedium"
                    color={selected ? PALETTE.sage.default : undefined}
                    style={{ fontFamily: selected ? 'Outfit-Bold' : 'Outfit-Medium' }}
                  >
                    {d.replace('_', ' ').toUpperCase()}
                  </Typography>
                  {selected && <Check color={PALETTE.sage.default} size={18} />}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
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
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  backBtn: {
    padding: SPACING.xs,
    borderRadius: 100,
    backgroundColor: '#FAF8F5',
  },
  card: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  flexHalf: {
    flex: 1,
  },
  inputLabel: {
    marginBottom: 4,
    marginTop: SPACING.xs,
  },
  dropdownBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECE9E4',
    marginBottom: SPACING.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.xs,
  },
  toggleLeft: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    borderRadius: 16,
    padding: SPACING.lg,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    marginVertical: 2,
  },
});
