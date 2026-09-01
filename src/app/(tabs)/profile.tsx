import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Typography } from '../../components/Typography';
import { SiniAvatar } from '../../components/SiniAvatar';
import { useAppStore } from '../../store/useAppStore';
import { DestyaStudioFooter } from '../../components/DestyaStudioFooter';
import { DestyaStudioAppsHub } from '../../components/DestyaStudioAppsHub';
import { PALETTE, SPACING } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../context/ThemeContext';
import { BannerAdComponent } from '../../services/AdManager';
import {
  Settings,
  Trash2,
  Ruler,
  Award,
  Calendar as CalendarIcon,
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

export default function ProfileScreen() {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();

  // Store actions & data
  const userProfile = useAppStore((state) => state.userProfile);
  const cyclePreferences = useAppStore((state) => state.cyclePreferences);
  const measurements = useAppStore((state) => state.measurements);
  const streak = useAppStore((state) => state.streak);
  const resetStore = useAppStore((state) => state.resetStore);

  const currentHeight = userProfile?.height ?? 165;
  const currentWeight = measurements[0]?.weight ?? 62;
  const bmiVal = calculateBMI(currentWeight, currentHeight);
  const bmiCategory = getBMICategory(bmiVal);

  const handleResetData = () => {
    Alert.alert(
      'Reset All App Data?',
      'This will permanently delete all logged meals, workouts, weight points, and cycle records. This action cannot be undone.',
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Top Hero User Identity Card */}
          <View style={[styles.heroProfileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.avatarWrapper}>
              <SiniAvatar size={76} variant="plum" />
              <View style={styles.streakBadgeOverlay}>
                <Flame size={14} color={colors.ovulation} />
                <Typography variant="caption" color={colors.ovulation} style={{ fontFamily: 'Outfit-Bold', marginLeft: 2 }}>
                  {streak?.currentStreak || 1}d
                </Typography>
              </View>
            </View>

            <Typography variant="h1" style={styles.userNameText}>
              {userProfile?.name || 'Sarah'}
            </Typography>
            <View style={styles.memberTagPill}>
              <Sparkles size={13} color={colors.primary} />
              <Typography variant="caption" color={colors.primary} style={{ fontFamily: 'Outfit-Bold', marginLeft: 4 }}>
                Sini AI Member · Cycle-Aware Fitness
              </Typography>
            </View>

            <View style={styles.biometricsStrip}>
              <View style={styles.bioItem}>
                <Typography variant="caption" color={colors.subtext}>AGE</Typography>
                <Typography variant="bodyMedium" style={styles.bioValue}>{userProfile?.age || 28} yrs</Typography>
              </View>
              <View style={[styles.bioDivider, { backgroundColor: colors.border }]} />
              <View style={styles.bioItem}>
                <Typography variant="caption" color={colors.subtext}>HEIGHT</Typography>
                <Typography variant="bodyMedium" style={styles.bioValue}>{currentHeight} cm</Typography>
              </View>
              <View style={[styles.bioDivider, { backgroundColor: colors.border }]} />
              <View style={styles.bioItem}>
                <Typography variant="caption" color={colors.subtext}>WEIGHT</Typography>
                <Typography variant="bodyMedium" style={styles.bioValue}>{currentWeight} kg</Typography>
              </View>
              <View style={[styles.bioDivider, { backgroundColor: colors.border }]} />
              <View style={styles.bioItem}>
                <Typography variant="caption" color={colors.subtext}>BMI</Typography>
                <Typography variant="bodyMedium" color={colors.primary} style={styles.bioValue}>{bmiVal.toFixed(1)}</Typography>
              </View>
            </View>
          </View>

          {/* GROUP 1: HEALTH & CYCLE PROFILE */}
          <Typography variant="caption" color={colors.subtext} style={styles.sectionHeaderTitle}>
            HEALTH & CYCLE PROFILE
          </Typography>
          <View style={[styles.groupedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Pressable
              style={({ pressed }) => [styles.rowItem, pressed && styles.pressedRow]}
              onPress={() => router.push('/edit-profile')}
            >
              <View style={[styles.rowIconCircle, { backgroundColor: colors.surface }]}>
                <User size={18} color={colors.nutrition} />
              </View>
              <View style={styles.rowTextCol}>
                <Typography variant="bodyMedium" style={styles.rowTitle}>Profile & Goals</Typography>
                <Typography variant="caption" color={colors.subtext}>
                  {(userProfile?.weightGoal || 'wellness').toUpperCase()} · {(userProfile?.regionalCuisine || 'indian').toUpperCase()} cuisine
                </Typography>
              </View>
              <ChevronRight size={18} color={colors.subtext} />
            </Pressable>

            <View style={styles.rowSeparator} />

            <Pressable
              style={({ pressed }) => [styles.rowItem, pressed && styles.pressedRow]}
              onPress={() => router.push('/cycle')}
            >
              <View style={[styles.rowIconCircle, { backgroundColor: colors.surface }]}>
                <CalendarIcon size={18} color={colors.period} />
              </View>
              <View style={styles.rowTextCol}>
                <Typography variant="bodyMedium" style={styles.rowTitle}>Cycle Parameters</Typography>
                <Typography variant="caption" color={colors.subtext}>
                  {cyclePreferences?.typicalCycleLength || 28}d cycle · {cyclePreferences?.typicalPeriodDuration || 5}d period
                </Typography>
              </View>
              <ChevronRight size={18} color={colors.subtext} />
            </Pressable>

            <View style={styles.rowSeparator} />

            <Pressable
              style={({ pressed }) => [styles.rowItem, pressed && styles.pressedRow]}
              onPress={() => router.push('/bmi')}
            >
              <View style={[styles.rowIconCircle, { backgroundColor: colors.surface }]}>
                <Ruler size={18} color={colors.activity} />
              </View>
              <View style={styles.rowTextCol}>
                <Typography variant="bodyMedium" style={styles.rowTitle}>BMI & Body Composition</Typography>
                <Typography variant="caption" color={colors.subtext}>
                  {bmiCategory} ({bmiVal.toFixed(1)})
                </Typography>
              </View>
              <ChevronRight size={18} color={colors.subtext} />
            </Pressable>
          </View>

          {/* GROUP 2: APP PREFERENCES & AI INTEGRATION */}
          <Typography variant="caption" color={colors.subtext} style={styles.sectionHeaderTitle}>
            APP & PREFERENCES
          </Typography>
          <View style={[styles.groupedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Pressable
              style={({ pressed }) => [styles.rowItem, pressed && styles.pressedRow]}
              onPress={() => router.push('/settings')}
            >
              <View style={[styles.rowIconCircle, { backgroundColor: colors.surface }]}>
                <Settings size={18} color={colors.primary} />
              </View>
              <View style={styles.rowTextCol}>
                <Typography variant="bodyMedium" style={styles.rowTitle}>App Settings & Groq AI Key</Typography>
                <Typography variant="caption" color={colors.subtext}>
                  {userProfile?.groqApiKey ? '✓ Groq API Key Connected' : 'Local Offline Mode (Tap to add key)'}
                </Typography>
              </View>
              <ChevronRight size={18} color={colors.subtext} />
            </Pressable>
          </View>

          {/* GROUP 3: DATA & ACCOUNT ACTIONS */}
          <Typography variant="caption" color={colors.subtext} style={styles.sectionHeaderTitle}>
            DATA & ECOSYSTEM
          </Typography>
          <View style={[styles.groupedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Pressable
              style={({ pressed }) => [styles.rowItem, pressed && styles.pressedRow]}
              onPress={handleResetData}
            >
              <View style={[styles.rowIconCircle, { backgroundColor: colors.errorBg }]}>
                <Trash2 size={18} color={colors.error} />
              </View>
              <View style={styles.rowTextCol}>
                <Typography variant="bodyMedium" color={colors.error} style={{ fontFamily: 'Outfit-Bold' }}>
                  Reset All Logs & App Data
                </Typography>
                <Typography variant="caption" color={colors.subtext}>
                  Clear all meals, workouts, weight points & cycle history
                </Typography>
              </View>
              <ChevronRight size={18} color={colors.subtext} />
            </Pressable>
          </View>

          {/* SPONSORED BANNER AD */}
          <BannerAdComponent />

          {/* Cross Promotion Hub & Destya Footer */}
          <DestyaStudioAppsHub />
          <DestyaStudioFooter />

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    fontFamily: 'Outfit-Bold',
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
    fontFamily: 'Outfit-Bold',
    marginTop: 2,
  },
  bioDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  sectionHeaderTitle: {
    fontFamily: 'Outfit-Bold',
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
  rowTitle: {
    fontFamily: 'Outfit-Bold',
  },
  rowSeparator: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginLeft: 62,
  },
});
