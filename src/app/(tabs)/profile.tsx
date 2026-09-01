import React, { useState, useEffect } from 'react';
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
import { Typography } from '../../components/Typography';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { InputField } from '../../components/InputField';
import { useAppStore } from '../../store/useAppStore';
import { PALETTE, SPACING } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Settings,
  Key,
  Heart,
  Trash2,
  ShieldAlert,
  Ruler,
  HelpCircle,
  BookOpen,
  Edit3,
  Flame,
  Award,
  ExternalLink,
  Calendar as CalendarIcon,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { calculateBMI, getBMICategory } from '../../utils/bmiUtils';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  // Store actions & data
  const userProfile = useAppStore((state) => state.userProfile);
  const cyclePreferences = useAppStore((state) => state.cyclePreferences);
  const periods = useAppStore((state) => state.periods);
  const dailyCheckIns = useAppStore((state) => state.dailyCheckIns);
  const meals = useAppStore((state) => state.meals);
  const activities = useAppStore((state) => state.activities);
  const measurements = useAppStore((state) => state.measurements);
  const streak = useAppStore((state) => state.streak);
  
  const setUserProfile = useAppStore((state) => state.setUserProfile);
  const setCyclePreferences = useAppStore((state) => state.setCyclePreferences);
  const resetStore = useAppStore((state) => state.resetStore);

  const currentHeight = userProfile?.height ?? 0;
  const currentWeight = measurements[0]?.weight ?? 0;
  const bmiVal = calculateBMI(currentWeight, currentHeight);
  const bmiCategory = getBMICategory(bmiVal);

  // Reset Confirmation Alert
  const handleResetData = () => {
    Alert.alert(
      'Reset App State?',
      'This will delete all logs, meals, workouts, weight points, and configuration data. This action is irreversible.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => {
            resetStore();
          },
        },
      ]
    );
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
            <View>
              <Typography variant="h1">User Profile</Typography>
              <Typography variant="bodyMedium" color={PALETTE.charcoal.light}>
                Manage your biometrics and cycle parameters
              </Typography>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Pressable style={styles.settingsNavBtn} onPress={() => router.push('/cycle')}>
                <CalendarIcon color={PALETTE.rose.default} size={24} />
              </Pressable>
              <Pressable style={styles.settingsNavBtn} onPress={() => router.push('/settings')}>
                <Settings color={PALETTE.sage.default} size={24} />
              </Pressable>
            </View>
          </View>

          {/* 1. Streak & Consistency Banner Card */}
          <Card style={[styles.streakBannerCard, { backgroundColor: isDark ? '#25211B' : '#FEF8EE', borderColor: isDark ? '#3D3425' : '#FDE68A' }]}>
            <View style={styles.streakBannerRow}>
              <View style={styles.streakLeftCol}>
                <View style={styles.streakPill}>
                  <Flame color="#D97706" size={20} />
                  <Typography variant="h3" color="#D97706" style={{ fontFamily: 'Outfit-Bold' }}>
                    {streak?.currentStreak || 1} Day Active Streak
                  </Typography>
                </View>
                <Typography variant="caption" color={PALETTE.charcoal.light} style={{ marginTop: 4 }}>
                  Personal Best: {streak?.longestStreak || 1} consecutive days
                </Typography>
              </View>
              <Award color="#F59E0B" size={32} />
            </View>
          </Card>

          {/* 2. Personal Information Summary Card */}
          <Card style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Settings color={PALETTE.sage.default} size={20} />
              <Typography variant="h3">User Profile</Typography>
            </View>

            <View style={styles.profileSummaryRow}>
              <View style={styles.avatarCircle}>
                <Typography variant="h2" color={PALETTE.white} style={{ fontFamily: 'Outfit-Bold' }}>
                  {(userProfile?.name || 'S').charAt(0).toUpperCase()}
                </Typography>
              </View>
              <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                <Typography variant="h3" style={{ fontFamily: 'Outfit-Bold' }}>
                  {userProfile?.name || 'Sarah'} ({userProfile?.age || 28} yrs)
                </Typography>
                <Typography variant="caption" color={PALETTE.charcoal.light}>
                  Goal: {(userProfile?.weightGoal || 'wellness').toUpperCase()} • {userProfile?.height || 165} cm
                </Typography>
                <Typography variant="caption" color={PALETTE.sage.default} style={{ marginTop: 2 }}>
                  Cuisine: {(userProfile?.regionalCuisine || 'indian').toUpperCase()} • Diet: {(userProfile?.dietaryPreference || 'anything').toUpperCase()}
                </Typography>
                <Typography variant="caption" color={PALETTE.rose.default} style={{ marginTop: 2, fontFamily: 'Outfit-Bold' }}>
                  Cycle: {cyclePreferences?.typicalCycleLength || 28}d • Period: {cyclePreferences?.typicalPeriodDuration || 5}d • {userProfile?.pauseCycleTracking ? 'PAUSED' : 'ACTIVE'}
                </Typography>
              </View>
            </View>

            <Button
              title="Edit Profile Details"
              variant="outline"
              onPress={() => router.push('/edit-profile')}
              style={{ marginTop: SPACING.md }}
            />
          </Card>

          {/* Health Metrics Section */}
          <Card style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Ruler color={PALETTE.sage.default} size={20} />
              <Typography variant="h3">Health Metrics</Typography>
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Typography variant="caption" color={PALETTE.charcoal.light}>HEIGHT</Typography>
                <Typography variant="bodyLarge" style={styles.boldText}>
                  {currentHeight > 0 ? `${currentHeight} cm` : 'Not set'}
                </Typography>
              </View>
              <View style={styles.metricItem}>
                <Typography variant="caption" color={PALETTE.charcoal.light}>CURRENT WEIGHT</Typography>
                <Typography variant="bodyLarge" style={styles.boldText}>
                  {currentWeight > 0 ? `${currentWeight} kg` : 'Not logged'}
                </Typography>
              </View>
              <View style={styles.metricItem}>
                <Typography variant="caption" color={PALETTE.charcoal.light}>BMI</Typography>
                <Typography variant="bodyLarge" style={[styles.boldText, { color: bmiVal > 0 ? PALETTE.sage.default : PALETTE.charcoal.light }]}>
                  {bmiVal > 0 ? `${bmiVal.toFixed(1)} (${bmiCategory})` : 'N/A'}
                </Typography>
              </View>
            </View>

            <Button
              title="BMI Calculator"
              variant="outline"
              onPress={() => router.push('/bmi')}
              style={{ marginTop: SPACING.md }}
            />
          </Card>

          <View style={{ height: SPACING.xl }} />

        </ScrollView>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 130,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    marginTop: SPACING.sm,
  },
  settingsNavBtn: {
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
  goalLabel: {
    fontFamily: 'Outfit-Medium',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  dropdownBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  modalContent: {
    borderRadius: 16,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#ECE9E4',
  },
  modalOption: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
  },
  modalOptionActive: {
    backgroundColor: '#FAF7F2',
  },
  captionText: {
    marginTop: SPACING.xs,
    lineHeight: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1.0,
    borderTopColor: '#ECE9E4',
  },
  toggleLeft: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  diagnosticCard: {
    padding: SPACING.lg,
    borderColor: '#FADBD8',
    borderWidth: 1.5,
    marginBottom: SPACING.lg,
  },
  diagnosticRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  boldText: {
    fontFamily: 'Outfit-Bold',
  },
  btnDivider: {
    height: 1.5,
    backgroundColor: '#FADBD8',
    marginVertical: SPACING.md,
  },
  dangerBtn: {
    backgroundColor: '#C0392B',
    borderColor: '#C0392B',
  },
  saveBtn: {
    height: 52,
    borderRadius: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  metricItem: {
    flex: 1,
    alignItems: 'flex-start',
  },
  // Streak & Profile Styles
  streakBannerCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
  },
  streakBannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakLeftCol: {
    flex: 1,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PALETTE.sage.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tutorialTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  tutorialStepItem: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#ECE9E4',
  },
});
