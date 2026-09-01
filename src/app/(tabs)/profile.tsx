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
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { SiniAvatar } from '../../components/SiniAvatar';
import { useAppStore } from '../../store/useAppStore';
import { DestyaStudioFooter } from '../../components/DestyaStudioFooter';
import { DestyaStudioAppsHub } from '../../components/DestyaStudioAppsHub';
import { PALETTE, SPACING } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../context/ThemeContext';
import {
  Settings,
  Trash2,
  Ruler,
  Award,
  Calendar as CalendarIcon,
  ChevronRight,
  Sliders,
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

  const currentHeight = userProfile?.height ?? 0;
  const currentWeight = measurements[0]?.weight ?? 0;
  const bmiVal = calculateBMI(currentWeight, currentHeight);
  const bmiCategory = getBMICategory(bmiVal);

  const handleResetData = () => {
    Alert.alert(
      'Reset App State?',
      'This will delete all saved logs, meals, workouts, weight data, and configuration. This action is permanent.',
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

          {/* Clean Screen Header */}
          <View style={styles.header}>
            <Typography variant="h1" style={{ fontFamily: 'Outfit-Bold' }}>Profile & Account</Typography>
            <Typography variant="bodyMedium" color={colors.subtext}>
              Sini AI biometrics, cycle parameters & preferences
            </Typography>
          </View>

          {/* 1. Quick Navigation Hub Buttons (Dedicated Calendar & Settings buttons inside screen) */}
          <View style={styles.quickNavRow}>
            <Pressable
              style={({ pressed }) => [
                styles.navTile,
                { backgroundColor: PALETTE.rose.bg, borderColor: PALETTE.rose.default },
                pressed && styles.pressedTile,
              ]}
              onPress={() => router.push('/cycle')}
            >
              <CalendarIcon color={PALETTE.plum.default} size={24} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Typography variant="bodyMedium" color={PALETTE.plum.default} style={{ fontFamily: 'Outfit-Bold' }}>
                  Cycle Calendar
                </Typography>
                <Typography variant="caption" color={colors.subtext}>
                  Phase history & tracking
                </Typography>
              </View>
              <ChevronRight color={PALETTE.plum.default} size={18} />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.navTile,
                { backgroundColor: isDark ? PALETTE.darkCard : PALETTE.oat.default, borderColor: colors.border },
                pressed && styles.pressedTile,
              ]}
              onPress={() => router.push('/settings')}
            >
              <Settings color={PALETTE.plum.default} size={24} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Typography variant="bodyMedium" color={PALETTE.plum.default} style={{ fontFamily: 'Outfit-Bold' }}>
                  App Settings
                </Typography>
                <Typography variant="caption" color={colors.subtext}>
                  AI key, theme & language
                </Typography>
              </View>
              <ChevronRight color={PALETTE.plum.default} size={18} />
            </Pressable>
          </View>

          {/* 2. Streak Banner */}
          <Card style={[styles.streakBannerCard, { backgroundColor: isDark ? PALETTE.darkCard : PALETTE.oat.bg, borderColor: colors.border }]}>
            <View style={styles.streakBannerRow}>
              <View style={{ flex: 1 }}>
                <Typography variant="h3" color={PALETTE.gold.default} style={{ fontFamily: 'Outfit-Bold' }}>
                  🔥 {streak?.currentStreak || 1} Day Active Streak
                </Typography>
                <Typography variant="caption" color={colors.subtext} style={{ marginTop: 2 }}>
                  Personal Best: {streak?.longestStreak || 1} consecutive days logged
                </Typography>
              </View>
              <Award color={PALETTE.gold.default} size={30} />
            </View>
          </Card>

          {/* 3. User Profile Summary */}
          <Card style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <SiniAvatar size={34} variant="plum" />
              <Typography variant="h3" style={{ fontFamily: 'Outfit-Bold', marginLeft: 10 }}>
                Sini Companion Profile
              </Typography>
            </View>

            <View style={styles.profileSummaryRow}>
              <View style={{ flex: 1 }}>
                <Typography variant="h2" style={{ fontFamily: 'Outfit-Bold' }}>
                  {userProfile?.name || 'Sarah'} ({userProfile?.age || 28} yrs)
                </Typography>
                <Typography variant="caption" color={colors.subtext} style={{ marginTop: 2 }}>
                  Goal: {(userProfile?.weightGoal || 'wellness').toUpperCase()} • {userProfile?.height || 165} cm
                </Typography>
                <Typography variant="caption" color={PALETTE.plum.default} style={{ marginTop: 4 }}>
                  Cuisine: {(userProfile?.regionalCuisine || 'indian').toUpperCase()} • Diet: {(userProfile?.dietaryPreference || 'anything').toUpperCase()}
                </Typography>
                <Typography variant="caption" color={PALETTE.rose.default} style={{ marginTop: 4, fontFamily: 'Outfit-Bold' }}>
                  Cycle: {cyclePreferences?.typicalCycleLength || 28}d length • Period: {cyclePreferences?.typicalPeriodDuration || 5}d
                </Typography>
              </View>
            </View>

            <Button
              title="Edit Profile & Preferences"
              variant="secondary"
              onPress={() => router.push('/edit-profile')}
              style={{ marginTop: SPACING.md }}
            />
          </Card>

          {/* 4. Health & Biometrics */}
          <Card style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Ruler color={PALETTE.sage.default} size={20} />
              <Typography variant="h3" style={{ fontFamily: 'Outfit-Bold', marginLeft: 8 }}>
                Biometrics
              </Typography>
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Typography variant="caption" color={colors.subtext}>HEIGHT</Typography>
                <Typography variant="bodyLarge" style={{ fontFamily: 'Outfit-Bold' }}>
                  {currentHeight > 0 ? `${currentHeight} cm` : 'Not set'}
                </Typography>
              </View>
              <View style={styles.metricItem}>
                <Typography variant="caption" color={colors.subtext}>WEIGHT</Typography>
                <Typography variant="bodyLarge" style={{ fontFamily: 'Outfit-Bold' }}>
                  {currentWeight > 0 ? `${currentWeight} kg` : 'Not logged'}
                </Typography>
              </View>
              <View style={styles.metricItem}>
                <Typography variant="caption" color={colors.subtext}>BMI</Typography>
                <Typography variant="bodyLarge" color={PALETTE.plum.default} style={{ fontFamily: 'Outfit-Bold' }}>
                  {bmiVal > 0 ? `${bmiVal.toFixed(1)}` : 'N/A'}
                </Typography>
              </View>
            </View>

            <Button
              title="Calculate BMI & Health Metrics"
              variant="outline"
              onPress={() => router.push('/bmi')}
              style={{ marginTop: SPACING.md }}
            />
          </Card>

          {/* Reset App Data */}
          <Pressable onPress={handleResetData} style={styles.resetBtn}>
            <Trash2 color={PALETTE.error} size={18} />
            <Typography variant="bodyMedium" color={PALETTE.error} style={{ marginLeft: 6, fontFamily: 'Outfit-Bold' }}>
              Reset All App Logs & Data
            </Typography>
          </Pressable>

          {/* Cross Promo & Footer */}
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
    paddingBottom: 140, // Increased bottom padding for comfortable scrollability past floating tab bar
    gap: SPACING.md,
  },
  header: { marginBottom: SPACING.xs },
  quickNavRow: { gap: 10 },
  navTile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
  },
  pressedTile: {
    opacity: 0.8,
  },
  streakBannerCard: { padding: SPACING.md, borderWidth: 1 },
  streakBannerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  card: { padding: SPACING.md },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  profileSummaryRow: { marginTop: 4 },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.sm },
  metricItem: { flex: 1, alignItems: 'center' },
  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
});
