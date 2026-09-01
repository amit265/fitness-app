import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  useColorScheme,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { Typography } from '../../components/Typography';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { InputField } from '../../components/InputField';
import { CoachChat } from '../../components/CoachChat';
import { useAppStore } from '../../store/useAppStore';
import { getCycleState } from '../../domain/cycle/cycleEngine';
import { calculateReadinessScore } from '../../domain/readiness/readinessEngine';
import { generateDailyInsight } from '../../services/ai/aiService';
import { getTodayStr, diffInDays } from '../../utils/date';
import { PALETTE, SPACING } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { getDailyCalorieBalance } from '../../domain/calories/calorieEngine';
import { getRecommendedMealsForToday } from '../../domain/calories/mealRecommendationEngine';
import { triggerStoreReviewIfAppropriate } from '../../utils/storeReview';
import { logAnalyticsEvent } from '../../services/analyticsService';
import {
  Sparkles,
  Droplet,
  Flame,
  Smile,
  Activity as ActivityIcon,
  Bot,
  Apple,
  CheckCircle2,
  Circle as CircleIcon,
  Award,
  ChevronDown,
  ChevronUp,
  Utensils,
  ShieldCheck,
  Calendar as CalendarIcon,
} from 'lucide-react-native';

export default function TodayScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  // Store bindings
  const userProfile = useAppStore((state) => state.userProfile);
  const cyclePreferences = useAppStore((state) => state.cyclePreferences);
  const periods = useAppStore((state) => state.periods);
  const dailyCheckIns = useAppStore((state) => state.dailyCheckIns);
  const activities = useAppStore((state) => state.activities);
  const meals = useAppStore((state) => state.meals);
  const measurements = useAppStore((state) => state.measurements);
  const streak = useAppStore((state) => state.streak);
  const setDailyCheckIn = useAppStore((state) => state.setDailyCheckIn);
  const recordActivityStreak = useAppStore((state) => state.recordActivityStreak);

  // Modals state
  const [checkInModalVisible, setCheckInModalVisible] = useState(false);
  const [coachChatVisible, setCoachChatVisible] = useState(false);
  const [isTargetsFolded, setIsTargetsFolded] = useState(false);

  // AI Daily Insight state
  const [dailyInsight, setDailyInsight] = useState<string>('');
  const [insightLoading, setInsightLoading] = useState(false);

  // Today Date & Math
  const todayStr = getTodayStr();
  const cycleState = getCycleState(periods, cyclePreferences, todayStr);
  const calorieBalance = getDailyCalorieBalance(todayStr, meals, activities, userProfile, measurements);

  // Filter recent activities in past 24 hours
  const recentWorkouts = activities.filter((act) => {
    const hours = diffInDays(todayStr, act.timestamp.split('T')[0]);
    return hours === 0; // Same day activities
  });

  const todayCheckIn = dailyCheckIns[todayStr] || null;
  const readiness = calculateReadinessScore(
    todayCheckIn,
    cycleState,
    recentWorkouts,
    userProfile?.weightGoal
  );

  // Daily Targets Checklist Calculations
  const todayMeals = meals.filter((m) => m.timestamp.split('T')[0] === todayStr);
  const recentWorkoutMinutes = recentWorkouts.reduce((sum, a) => sum + a.durationMinutes, 0);

  const userWeight = measurements[0]?.weight ?? 60;
  const recommendedWaterL = parseFloat((userWeight * 0.035 + (recentWorkouts.length > 0 ? 0.5 : 0)).toFixed(1));

  const isCheckInMet = todayCheckIn !== null;
  const isWaterMet = (todayCheckIn?.hydration || 0) >= recommendedWaterL;
  const isExerciseMet = recentWorkoutMinutes >= (readiness.recommendation.durationMinutes || 20);
  const isNutritionMet = todayMeals.length > 0;

  const completedTargetsCount = [isCheckInMet, isWaterMet, isExerciseMet, isNutritionMet].filter(Boolean).length;

  const currentStreak = streak?.currentStreak || 0;

  useEffect(() => {
    if (completedTargetsCount >= 2) {
      recordActivityStreak(todayStr);
      if (currentStreak >= 3) {
        logAnalyticsEvent('streak_milestone_hit', { streak: currentStreak });
        triggerStoreReviewIfAppropriate('streak_milestone');
      }
    }
  }, [completedTargetsCount, todayStr, currentStreak]);

  const fetchDailyInsight = async () => {
    setInsightLoading(true);
    const context = {
      userGoal: userProfile?.weightGoal || 'wellness',
      cycleState,
      readinessScore: readiness.score,
      sleepDuration: todayCheckIn?.sleepDuration ?? 8,
      sleepQuality: todayCheckIn?.sleepQuality ?? 4,
      energy: todayCheckIn?.energy ?? 3,
      stress: todayCheckIn?.stress ?? 2,
      hydration: todayCheckIn?.hydration ?? 1.5,
      symptoms: todayCheckIn?.symptoms ?? [],
      recentWorkoutMinutes: recentWorkouts.reduce((sum, act) => sum + act.durationMinutes, 0),
    };

    try {
      const text = await generateDailyInsight(context, userProfile?.groqApiKey);
      setDailyInsight(text);
    } catch (e) {
      setDailyInsight('Focus on simple hydration and listen to your body today.');
    } finally {
      setInsightLoading(false);
    }
  };

  // Load Daily Insight on mount & check-in changes
  useEffect(() => {
    fetchDailyInsight();
  }, [todayCheckIn]);

  // Check-In Form State
  const [sleepDur, setSleepDur] = useState(todayCheckIn ? String(todayCheckIn.sleepDuration) : '8');
  const [sleepQual, setSleepQual] = useState(todayCheckIn ? todayCheckIn.sleepQuality : 4);
  const [energyVal, setEnergyVal] = useState(todayCheckIn ? todayCheckIn.energy : 3);
  const [stressVal, setStressVal] = useState(todayCheckIn ? todayCheckIn.stress : 2);
  const [waterVal, setWaterVal] = useState(todayCheckIn ? String(todayCheckIn.hydration) : '1.5');
  const [moodVal, setMoodVal] = useState<any>(todayCheckIn ? todayCheckIn.mood : 'good');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(todayCheckIn ? todayCheckIn.symptoms : []);

  // Water Modal State
  const [waterModalVisible, setWaterModalVisible] = useState(false);
  const [waterInputVal, setWaterInputVal] = useState(todayCheckIn ? String(todayCheckIn.hydration) : '1.5');

  // Open Water Modal
  const openWaterModal = () => {
    setWaterInputVal(todayCheckIn ? String(todayCheckIn.hydration) : '1.5');
    setWaterModalVisible(true);
  };

  // Explicit Water Modal Save Handler
  const handleSaveWaterModal = () => {
    const val = parseFloat(waterInputVal) || 1.5;
    setDailyCheckIn(todayStr, {
      sleepDuration: todayCheckIn ? todayCheckIn.sleepDuration : 8,
      sleepQuality: todayCheckIn ? todayCheckIn.sleepQuality : 4,
      energy: todayCheckIn ? todayCheckIn.energy : 3,
      stress: todayCheckIn ? todayCheckIn.stress : 2,
      hydration: parseFloat(val.toFixed(2)),
      mood: todayCheckIn ? todayCheckIn.mood : 'good',
      symptoms: todayCheckIn ? todayCheckIn.symptoms : [],
    });
    setWaterModalVisible(false);
  };

  // Add preset volume
  const addWaterPreset = (amountL: number) => {
    const current = parseFloat(waterInputVal) || 0;
    const next = (current + amountL).toFixed(2);
    setWaterInputVal(String(next));
  };

  // Symptoms toggle
  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  // Submit check-in
  const handleCheckInSubmit = () => {
    setDailyCheckIn(todayStr, {
      sleepDuration: parseFloat(sleepDur) || 8,
      sleepQuality: sleepQual,
      energy: energyVal,
      stress: stressVal,
      hydration: parseFloat(waterVal) || 1.5,
      mood: moodVal,
      symptoms: selectedSymptoms,
    });
    setCheckInModalVisible(false);
  };

  // Circular progress math
  const strokeWidth = 14;
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (readiness.score / 100) * circumference;

  // Calorie ring math
  const calStrokeWidth = 10;
  const calRadius = 48;
  const calCircumference = 2 * Math.PI * calRadius;
  const calProgress = Math.min(1, calorieBalance.consumedCalories / (calorieBalance.targetCalories || 1850));
  const calStrokeDashoffset = calCircumference - calProgress * calCircumference;

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchDailyInsight();
    } catch (e) {}
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121110' : PALETTE.oat.bg }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[PALETTE.sage.default]}
            tintColor={PALETTE.sage.default}
          />
        }
      >
        
        {/* Header Greeting */}
        <View style={styles.header}>
          <View>
            <Typography variant="bodyMedium" color={PALETTE.charcoal.light}>
              Today's Rhythm • 🔥 {streak?.currentStreak || 1}d Streak
            </Typography>
            <Typography variant="h1" style={styles.userName}>
              Hello, {userProfile?.name || 'Sarah'}
            </Typography>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {/* Cycle Phase Badge */}
            <Pressable
              onPress={() => router.push('/cycle')}
              style={[
                styles.phaseBadge,
                {
                  backgroundColor: userProfile?.pauseCycleTracking
                    ? (isDark ? '#2E2B28' : '#E8E5DF')
                    : cycleState.phase === 'menstrual'
                    ? PALETTE.rose.bg
                    : PALETTE.sage.bg,
                },
              ]}
            >
              <Typography
                variant="bodySmall"
                color={
                  userProfile?.pauseCycleTracking
                    ? PALETTE.charcoal.light
                    : cycleState.phase === 'menstrual'
                    ? PALETTE.rose.dark
                    : PALETTE.sage.dark
                }
                style={styles.phaseText}
              >
                {userProfile?.pauseCycleTracking
                  ? 'CYCLE PAUSED'
                  : `Day ${cycleState.cycleDay} • ${cycleState.phase.toUpperCase()}`}
              </Typography>
            </Pressable>

            {/* Calendar Icon Button in Top Right */}
            <Pressable
              style={styles.headerCalendarBtn}
              onPress={() => router.push('/cycle')}
            >
              <CalendarIcon color={PALETTE.rose.default} size={22} />
            </Pressable>
          </View>
        </View>

        {/* 1. Today's Calories Accountability Card (HERO TOP FOCUS) */}
        <Card style={styles.calorieCard}>
          <View style={styles.calorieHeaderRow}>
            <View style={styles.calorieHeaderLeft}>
              <Flame color={PALETTE.rose.default} size={20} />
              <Typography variant="h3" style={{ fontFamily: 'Outfit-Bold', marginLeft: SPACING.xs }}>
                Today's Calories
              </Typography>
            </View>
            <View style={[styles.percentagePill, { backgroundColor: calorieBalance.isOverTarget ? '#FADBD8' : PALETTE.sage.bg }]}>
              <Typography
                variant="caption"
                color={calorieBalance.isOverTarget ? '#C0392B' : PALETTE.sage.dark}
                style={{ fontFamily: 'Outfit-Bold' }}
              >
                {calorieBalance.percentageUsed}% USED
              </Typography>
            </View>
          </View>

          <View style={styles.calorieBodyRow}>
            {/* Visual Progress Ring */}
            <View style={styles.calRingContainer}>
              <Svg width={(calRadius + calStrokeWidth) * 2} height={(calRadius + calStrokeWidth) * 2}>
                <Circle
                  cx={calRadius + calStrokeWidth}
                  cy={calRadius + calStrokeWidth}
                  r={calRadius}
                  stroke={isDark ? '#2E2B28' : '#ECE9E4'}
                  strokeWidth={calStrokeWidth}
                  fill="transparent"
                />
                <Circle
                  cx={calRadius + calStrokeWidth}
                  cy={calRadius + calStrokeWidth}
                  r={calRadius}
                  stroke={calorieBalance.isOverTarget ? '#E74C3C' : PALETTE.sage.default}
                  strokeWidth={calStrokeWidth}
                  strokeDasharray={calCircumference}
                  strokeDashoffset={calStrokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  transform={`rotate(-90 ${calRadius + calStrokeWidth} ${calRadius + calStrokeWidth})`}
                />
              </Svg>
              <View style={styles.calRingLabelContainer}>
                <Typography variant="h3" align="center" style={{ fontFamily: 'Outfit-Bold' }}>
                  {calorieBalance.consumedCalories.toLocaleString()}
                </Typography>
                <Typography variant="caption" color={PALETTE.charcoal.light} align="center">
                  / {calorieBalance.targetCalories.toLocaleString()} kcal
                </Typography>
              </View>
            </View>

            {/* Hero Number & Stats Column */}
            <View style={styles.calStatsCol}>
              {/* HERO NUMBER */}
              <View style={styles.heroNumberBox}>
                <Typography variant="caption" color={PALETTE.charcoal.light} style={{ letterSpacing: 0.5 }}>
                  {calorieBalance.isOverTarget ? 'OVER TARGET' : 'REMAINING'}
                </Typography>
                <Typography
                  variant="h2"
                  style={{
                    fontFamily: 'Outfit-Bold',
                    color: calorieBalance.isOverTarget ? '#C0392B' : PALETTE.sage.default,
                    fontSize: 22,
                    marginTop: 2,
                  }}
                >
                  {calorieBalance.isOverTarget
                    ? `${calorieBalance.overAmount.toLocaleString()} kcal over`
                    : `${calorieBalance.remainingCalories.toLocaleString()} kcal`}
                </Typography>
              </View>

              <View style={styles.calBreakdownRow}>
                <View style={styles.calBreakdownItem}>
                  <Typography variant="caption" color={PALETTE.charcoal.light}>FOOD</Typography>
                  <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold' }}>
                    {calorieBalance.consumedCalories} kcal
                  </Typography>
                </View>
                <View style={styles.calBreakdownItem}>
                  <Typography variant="caption" color={PALETTE.charcoal.light}>ACTIVITY</Typography>
                  <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold' }}>
                    ~{calorieBalance.activityCalories} kcal
                  </Typography>
                </View>
              </View>
            </View>
          </View>

          {/* Supportive Over-Target Message */}
          {calorieBalance.isOverTarget && (
            <View style={styles.overTargetBox}>
              <Typography variant="bodySmall" color="#C0392B" style={{ lineHeight: 16 }}>
                💡 You're about {calorieBalance.overAmount} kcal above today's target. That's okay — one day doesn't determine your progress!
              </Typography>
            </View>
          )}

          {/* Action Buttons Row */}
          <View style={styles.calActionsRow}>
            <Button
              title="Log Meals & Activities"
              variant="primary"
              onPress={() => router.push('/(tabs)/log')}
              style={styles.calActionBtn}
            />
          </View>
        </Card>

        {/* 2. Detailed Recovery & Readiness Breakdown Card */}
        <Card style={styles.readinessCard}>
          <View style={styles.readinessHeaderRow}>
            <View style={styles.readinessHeaderLeft}>
              <ShieldCheck color={PALETTE.sage.default} size={22} />
              <Typography variant="h3" style={{ fontFamily: 'Outfit-Bold', flexShrink: 1 }}>
                Daily Readiness Breakdown
              </Typography>
            </View>
            <View style={[styles.percentagePill, { backgroundColor: PALETTE.sage.bg, alignSelf: 'flex-start' }]}>
              <Typography variant="caption" color={PALETTE.sage.dark} style={{ fontFamily: 'Outfit-Bold' }}>
                {readiness.level.toUpperCase()}
              </Typography>
            </View>
          </View>

          <View style={[styles.readinessHeroBox, { backgroundColor: isDark ? '#25211B' : '#FAF8F5', borderColor: isDark ? '#2E2B28' : '#ECE9E4' }]}>
            <Typography variant="h1" color={PALETTE.sage.default} style={{ fontFamily: 'Outfit-Bold', fontSize: 34 }}>
              {readiness.score}
            </Typography>
            <View style={{ marginLeft: SPACING.sm, flex: 1 }}>
              <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold' }}>
                Recovery Score: {readiness.score}/100
              </Typography>
              <Typography variant="caption" color={PALETTE.charcoal.light} style={{ marginTop: 2, flexWrap: 'wrap' }}>
                {readiness.recommendation.title}
              </Typography>
            </View>
          </View>

          {/* Detailed Full-Width Factor Cards */}
          <View style={styles.factorDetailList}>
            {readiness.factors.map((factor) => {
              const fillPct = Math.min(100, Math.max(10, factor.score));
              return (
                <View key={factor.name} style={[styles.fullWidthFactorCard, { backgroundColor: isDark ? '#25211B' : '#FAF8F5', borderColor: isDark ? '#2E2B28' : '#ECE9E4' }]}>
                  <View style={styles.factorDetailHeader}>
                    <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold', flex: 1, paddingRight: 6 }}>
                      {factor.name}
                    </Typography>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Typography variant="bodyMedium" color={PALETTE.sage.default} style={{ fontFamily: 'Outfit-Bold' }}>
                        {factor.score}/100
                      </Typography>
                      <Typography variant="caption" color={PALETTE.charcoal.light}>
                        +{factor.contribution} pts added
                      </Typography>
                    </View>
                  </View>

                  <View style={styles.factorProgressBarTrack}>
                    <View style={[styles.factorProgressBarFill, { width: `${fillPct}%` }]} />
                  </View>

                  {factor.explanation && (
                    <View style={styles.factorWhyBox}>
                      <Typography variant="caption" color={PALETTE.charcoal.light} style={{ lineHeight: 16 }}>
                        💡 {factor.explanation}
                      </Typography>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </Card>

        {/* 3. Recommendations Card (Movement + Food Recommendations) */}
        <Card style={styles.planCard}>
          <View style={styles.planTitleRow}>
            <ActivityIcon color={PALETTE.sage.default} size={22} />
            <Typography variant="h3" style={styles.planCardTitle}>Today's Plan</Typography>
          </View>
          
          <View style={styles.planBadgeRow}>
            <View style={[styles.intensityBadge, { backgroundColor: isDark ? '#25352A' : '#EAF0EC' }]}>
              <Typography variant="caption" color={isDark ? PALETTE.sage.light : PALETTE.sage.dark}>
                {readiness.recommendation.activityType.replace('_', ' ')}
              </Typography>
            </View>
            {readiness.recommendation.durationMinutes && (
              <View style={[styles.durationBadge, { backgroundColor: isDark ? '#2E2B28' : '#F5F3EF' }]}>
                <Typography variant="caption" color={isDark ? PALETTE.cream : PALETTE.charcoal.light}>
                  ⏱ {readiness.recommendation.durationMinutes} mins
                </Typography>
              </View>
            )}
          </View>

          <Typography variant="bodyLarge" style={styles.recTitle}>
            Recommended Movement: {readiness.recommendation.title}
          </Typography>
          <Typography variant="bodyMedium" color={PALETTE.charcoal.light} style={styles.recDesc}>
            {readiness.recommendation.explanation}
          </Typography>

          {/* Section 2: Phase & Calorie Synced Meal Recommendations */}
          <View style={styles.mealRecSection}>
            <View style={styles.mealRecHeaderRow}>
              <Utensils color={PALETTE.rose.default} size={18} />
              <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold', marginLeft: 6, flex: 1, flexWrap: 'wrap' }}>
                Recommended Meals for {cycleState.phase.toUpperCase()} Phase
              </Typography>
            </View>
            <Typography variant="caption" color={PALETTE.charcoal.light} style={{ marginBottom: SPACING.xs }}>
              Tailored to your {(userProfile?.regionalCuisine || 'indian').toUpperCase()} cuisine & {(userProfile?.dietaryPreference || 'anything').toUpperCase()} preference.
            </Typography>

            {getRecommendedMealsForToday(
              cycleState.phase,
              userProfile?.regionalCuisine || 'indian',
              userProfile?.dietaryPreference || 'anything'
            ).map((meal) => (
              <View key={meal.name} style={[styles.mealRecCard, { backgroundColor: isDark ? '#25211B' : '#FAF8F5' }]}>
                <View style={styles.mealRecCardTopRow}>
                  <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold', flex: 1, paddingRight: 6 }}>
                    {meal.name}
                  </Typography>
                  <View style={styles.mealCalPill}>
                    <Typography variant="caption" color={PALETTE.rose.default} style={{ fontFamily: 'Outfit-Bold' }}>
                      ~{meal.calories} kcal • {meal.protein}
                    </Typography>
                  </View>
                </View>
                <Typography variant="caption" color={PALETTE.charcoal.light} style={{ marginTop: 4 }}>
                  💡 {meal.reason}
                </Typography>
              </View>
            ))}
          </View>

          {!todayCheckIn && (
            <View style={styles.baselineIndicator}>
              <Typography variant="caption" color={PALETTE.charcoal.light} style={styles.baselineText}>
                ⚠️ Showing baseline estimate. Complete check-in for full personalization.
              </Typography>
            </View>
          )}
        </Card>

        {/* 4. AI Insight Card */}
        <Card style={[styles.insightCard, { backgroundColor: isDark ? '#1C1A18' : '#FAF7F2' }]}>
          <View style={styles.insightHeader}>
            <Sparkles color={PALETTE.sage.default} size={18} />
            <Typography variant="bodySmall" color={PALETTE.sage.default} style={styles.insightHeaderLabel}>
              DAILY INSIGHT
            </Typography>
          </View>
          {insightLoading ? (
            <ActivityIndicator size="small" color={PALETTE.sage.default} style={styles.insightLoader} />
          ) : (
            <Typography variant="bodyMedium" style={styles.insightText}>
              {dailyInsight}
            </Typography>
          )}
        </Card>

        {/* 5. Today's Daily Targets Checklist Card (FOLDABLE) */}
        <Card style={[styles.targetsChecklistCard, { backgroundColor: isDark ? '#1C1A18' : '#FFFFFF', borderColor: isDark ? '#2E2B28' : '#ECE9E4' }]}>
          <Pressable onPress={() => setIsTargetsFolded(!isTargetsFolded)} style={styles.targetsHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Award color={PALETTE.sage.default} size={20} />
              <Typography variant="h3" style={{ fontFamily: 'Outfit-Bold' }}>
                Today's Targets
              </Typography>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={[styles.targetCountBadge, { backgroundColor: completedTargetsCount >= 2 ? '#D1FAE5' : '#FEF3C7' }]}>
                <Typography variant="caption" color={completedTargetsCount >= 2 ? '#059669' : '#D97706'} style={{ fontFamily: 'Outfit-Bold' }}>
                  {completedTargetsCount}/4 Done
                </Typography>
              </View>

              {isTargetsFolded ? (
                <ChevronDown color={PALETTE.charcoal.light} size={20} />
              ) : (
                <ChevronUp color={PALETTE.charcoal.light} size={20} />
              )}
            </View>
          </Pressable>

          {!isTargetsFolded && (
            <View style={styles.targetsList}>
              {/* 1. Daily Check-In */}
              <Pressable onPress={() => setCheckInModalVisible(true)} style={styles.targetRowItem}>
                {isCheckInMet ? (
                  <CheckCircle2 color="#10B981" size={20} />
                ) : (
                  <CircleIcon color={PALETTE.charcoal.light} size={20} />
                )}
                <Typography variant="bodyMedium" style={{ marginLeft: 8, textDecorationLine: isCheckInMet ? 'line-through' : 'none', color: isCheckInMet ? PALETTE.charcoal.light : undefined }}>
                  Daily Wellness Check-In
                </Typography>
              </Pressable>

              {/* 2. Hydration Target */}
              <Pressable onPress={openWaterModal} style={styles.targetRowItem}>
                {isWaterMet ? (
                  <CheckCircle2 color="#10B981" size={20} />
                ) : (
                  <CircleIcon color={PALETTE.charcoal.light} size={20} />
                )}
                <View style={{ marginLeft: 8, flex: 1 }}>
                  <Typography variant="bodyMedium" style={{ textDecorationLine: isWaterMet ? 'line-through' : 'none', color: isWaterMet ? PALETTE.charcoal.light : undefined }}>
                    Water Target ({todayCheckIn?.hydration || 0} / {recommendedWaterL} L)
                  </Typography>
                </View>
                {isWaterMet && (
                  <View style={styles.successPill}>
                    <Typography variant="caption" color="#10B981" style={{ fontFamily: 'Outfit-Bold' }}>✓ Met!</Typography>
                  </View>
                )}
              </Pressable>

              {/* 3. Recommended Exercise */}
              <Pressable onPress={() => setCheckInModalVisible(true)} style={styles.targetRowItem}>
                {isExerciseMet ? (
                  <CheckCircle2 color="#10B981" size={20} />
                ) : (
                  <CircleIcon color={PALETTE.charcoal.light} size={20} />
                )}
                <Typography variant="bodyMedium" style={{ marginLeft: 8, textDecorationLine: isExerciseMet ? 'line-through' : 'none', color: isExerciseMet ? PALETTE.charcoal.light : undefined }}>
                  Movement ({recentWorkoutMinutes} / {readiness.recommendation.durationMinutes || 20} mins)
                </Typography>
              </Pressable>

              {/* 4. Food Log */}
              <Pressable onPress={() => router.push('/log')} style={styles.targetRowItem}>
                {isNutritionMet ? (
                  <CheckCircle2 color="#10B981" size={20} />
                ) : (
                  <CircleIcon color={PALETTE.charcoal.light} size={20} />
                )}
                <Typography variant="bodyMedium" style={{ marginLeft: 8, textDecorationLine: isNutritionMet ? 'line-through' : 'none', color: isNutritionMet ? PALETTE.charcoal.light : undefined }}>
                  Food Log ({todayMeals.length} logged)
                </Typography>
              </Pressable>
            </View>
          )}
        </Card>

        {/* Floating Coach Card */}
        <Pressable onPress={() => setCoachChatVisible(true)}>
          <Card style={[styles.coachCard, { borderColor: isDark ? '#2E2B28' : '#ECE9E4' }]}>
            <View style={styles.coachCardLeft}>
              <Bot color={PALETTE.sage.default} size={26} />
              <View>
                <Typography variant="bodyLarge" style={styles.coachCardTitle}>Chat with Aura</Typography>
                <Typography variant="caption" color={isDark ? PALETTE.sage.light : PALETTE.charcoal.light}>Your hormonal fitness companion</Typography>
              </View>
            </View>
            <View style={styles.coachCardChevron}>
              <Typography variant="bodyLarge" color={PALETTE.sage.default}>➔</Typography>
            </View>
          </Card>
        </Pressable>

        {/* Quick Logs Row */}
        <Typography variant="bodySmall" color={PALETTE.charcoal.light} style={styles.logTitleLabel}>
          QUICK ACTIONS
        </Typography>
        
        <View style={styles.quickLogsRow}>
          <Pressable
            onPress={() => setCheckInModalVisible(true)}
            style={[
              styles.quickLogBtn,
              {
                backgroundColor: todayCheckIn
                  ? (isDark ? '#25352A' : '#EAF0EC')
                  : (isDark ? '#1C1A18' : '#FFFFFF'),
                borderColor: isDark ? '#2E2B28' : '#ECE9E4'
              }
            ]}
          >
            <Smile color={PALETTE.sage.default} size={22} />
            <Typography
              variant="caption"
              color={todayCheckIn
                ? PALETTE.sage.default
                : (isDark ? PALETTE.cream : PALETTE.charcoal.default)}
              style={styles.quickLogText}
            >
              {todayCheckIn ? 'Checked-In' : 'Check-In'}
            </Typography>
          </Pressable>

          <Pressable
            onPress={openWaterModal}
            style={[
              styles.quickLogBtn,
              {
                backgroundColor: isDark ? '#1C1A18' : '#FFFFFF',
                borderColor: isDark ? '#2E2B28' : '#ECE9E4'
              }
            ]}
          >
            <View style={styles.waterQuickRow}>
              <Droplet color="#4A90E2" size={22} />
              {todayCheckIn && todayCheckIn.hydration > 0 && (
                <Typography variant="caption" color="#4A90E2" style={styles.waterCount}>
                  {todayCheckIn.hydration}L
                </Typography>
              )}
            </View>
            <Typography
              variant="caption"
              color={isDark ? PALETTE.cream : PALETTE.charcoal.default}
              style={styles.quickLogText}
            >
              Water Intake
            </Typography>
          </Pressable>
        </View>

      </ScrollView>

      {/* Explicit Water Intake Modal */}
      <Modal
        visible={waterModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setWaterModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setWaterModalVisible(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: isDark ? '#1C1A18' : PALETTE.white }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Droplet color="#4A90E2" size={24} />
                <Typography variant="h2">Water Intake Tracker</Typography>
              </View>
            </View>

            {/* Target Recommendation Box */}
            <View style={[styles.waterTargetBox, { backgroundColor: isDark ? '#182433' : '#EBF3FA' }]}>
              <Typography variant="caption" color="#4A90E2" style={{ fontFamily: 'Outfit-Bold', letterSpacing: 0.5 }}>
                RECOMMENDED DAILY TARGET
              </Typography>
              <Typography variant="h2" color="#2B6CB0" style={{ marginVertical: 2 }}>
                {recommendedWaterL} Litres
              </Typography>
              <Typography variant="caption" color={PALETTE.charcoal.light}>
                Calculated for your {userWeight}kg body weight {recentWorkouts.length > 0 ? '(includes +0.5L workout bonus)' : ''}
              </Typography>
            </View>

            {/* Current Input Display */}
            <View style={styles.waterInputGroup}>
              <InputField
                label="Water Consumed Today (Litres)"
                value={waterInputVal}
                onChangeText={setWaterInputVal}
                keyboardType="decimal-pad"
                placeholder="e.g. 2.1"
              />
            </View>

            {/* Volume Presets Row */}
            <Typography variant="bodySmall" color={PALETTE.charcoal.light} style={{ marginBottom: 6 }}>
              Quick Add Presets:
            </Typography>
            <View style={styles.waterPresetRow}>
              <Pressable style={styles.waterPresetBtn} onPress={() => addWaterPreset(0.25)}>
                <Typography variant="bodySmall" style={{ fontFamily: 'Outfit-Bold' }}>+0.25 L</Typography>
                <Typography variant="caption" color={PALETTE.charcoal.light} style={{ fontSize: 10 }}>1 Glass</Typography>
              </Pressable>
              <Pressable style={styles.waterPresetBtn} onPress={() => addWaterPreset(0.5)}>
                <Typography variant="bodySmall" style={{ fontFamily: 'Outfit-Bold' }}>+0.5 L</Typography>
                <Typography variant="caption" color={PALETTE.charcoal.light} style={{ fontSize: 10 }}>1 Bottle</Typography>
              </Pressable>
              <Pressable style={styles.waterPresetBtn} onPress={() => addWaterPreset(1.0)}>
                <Typography variant="bodySmall" style={{ fontFamily: 'Outfit-Bold' }}>+1.0 L</Typography>
                <Typography variant="caption" color={PALETTE.charcoal.light} style={{ fontSize: 10 }}>Large Bottle</Typography>
              </Pressable>
            </View>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <Button title="Save Water Intake" onPress={handleSaveWaterModal} style={styles.modalSave} />
              <Button title="Cancel" variant="outline" onPress={() => setWaterModalVisible(false)} style={styles.modalCancel} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Daily Check-In Overlay Modal */}
      <Modal
        visible={checkInModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCheckInModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[styles.modalContent, { backgroundColor: isDark ? '#1C1A18' : PALETTE.white }]}
          >
            <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
              
              <Typography variant="h2" style={styles.modalTitle}>Daily Check-In</Typography>
              <Typography variant="bodySmall" color={PALETTE.charcoal.light} style={styles.modalSubtitle}>
                Log how you feel today to refine your readiness profile.
              </Typography>

              {/* Sleep Duration */}
              <View style={styles.formGroup}>
                <Typography variant="bodyMedium" style={styles.formLabel}>How long did you sleep? (Hours)</Typography>
                <TextInput
                  value={sleepDur}
                  onChangeText={setSleepDur}
                  keyboardType="decimal-pad"
                  style={[styles.formInput, { color: isDark ? PALETTE.cream : PALETTE.charcoal.default }]}
                  placeholder="8"
                  placeholderTextColor={isDark ? '#6B6256' : '#A89E90'}
                />
              </View>

              {/* Sleep Quality */}
              <View style={styles.formGroup}>
                <Typography variant="bodyMedium" style={styles.formLabel}>Sleep Quality</Typography>
                <View style={styles.ratingsRow}>
                  {[1, 2, 3, 4, 5].map((val) => (
                    <Pressable
                      key={val}
                      onPress={() => setSleepQual(val)}
                      style={[styles.ratingBtn, sleepQual === val && styles.ratingBtnActive]}
                    >
                      <Typography variant="bodyMedium" color={sleepQual === val ? PALETTE.white : undefined}>
                        {val === 1 ? 'Poor' : val === 5 ? 'Great' : val}
                      </Typography>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Energy Levels */}
              <View style={styles.formGroup}>
                <Typography variant="bodyMedium" style={styles.formLabel}>Energy Levels</Typography>
                <View style={styles.ratingsRow}>
                  {[1, 2, 3, 4, 5].map((val) => (
                    <Pressable
                      key={val}
                      onPress={() => setEnergyVal(val)}
                      style={[styles.ratingBtn, energyVal === val && styles.ratingBtnActive]}
                    >
                      <Typography variant="bodyMedium" color={energyVal === val ? PALETTE.white : undefined}>
                        {val}
                      </Typography>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Stress Levels */}
              <View style={styles.formGroup}>
                <Typography variant="bodyMedium" style={styles.formLabel}>Stress Levels</Typography>
                <View style={styles.ratingsRow}>
                  {[1, 2, 3, 4, 5].map((val) => (
                    <Pressable
                      key={val}
                      onPress={() => setStressVal(val)}
                      style={[styles.ratingBtn, stressVal === val && styles.ratingBtnActive]}
                    >
                      <Typography variant="bodyMedium" color={stressVal === val ? PALETTE.white : undefined}>
                        {val === 1 ? 'Low' : val === 5 ? 'High' : val}
                      </Typography>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Hydration */}
              <View style={styles.formGroup}>
                <Typography variant="bodyMedium" style={styles.formLabel}>Hydration (Litres logged)</Typography>
                <TextInput
                  value={waterVal}
                  onChangeText={setWaterVal}
                  keyboardType="decimal-pad"
                  style={[styles.formInput, { color: isDark ? PALETTE.cream : PALETTE.charcoal.default }]}
                  placeholder="2.0"
                  placeholderTextColor={isDark ? '#6B6256' : '#A89E90'}
                />
              </View>

              {/* Mood Selection */}
              <View style={styles.formGroup}>
                <Typography variant="bodyMedium" style={styles.formLabel}>Current Mood</Typography>
                <View style={styles.tagsContainer}>
                  {(['great', 'good', 'okay', 'low', 'irritable', 'anxious', 'tired'] as const).map((mood) => {
                    const selected = moodVal === mood;
                    return (
                      <Pressable
                        key={mood}
                        onPress={() => setMoodVal(mood)}
                        style={[styles.tagItem, selected && styles.tagItemActive]}
                      >
                        <Typography variant="bodySmall" color={selected ? PALETTE.white : undefined}>
                          {mood.toUpperCase()}
                        </Typography>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Symptoms */}
              <View style={styles.formGroup}>
                <Typography variant="bodyMedium" style={styles.formLabel}>Active Symptoms</Typography>
                <View style={styles.tagsContainer}>
                  {(['cramps', 'bloating', 'fatigue', 'headache', 'cravings', 'acne'] as const).map((symptom) => {
                    const selected = selectedSymptoms.includes(symptom);
                    return (
                      <Pressable
                        key={symptom}
                        onPress={() => toggleSymptom(symptom)}
                        style={[styles.tagItem, selected && styles.tagItemActive]}
                      >
                        <Typography variant="bodySmall" color={selected ? PALETTE.white : undefined}>
                          {symptom.toUpperCase()}
                        </Typography>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Submit / Cancel buttons */}
              <View style={styles.modalActions}>
                <Button title="Save Check-In" onPress={handleCheckInSubmit} style={styles.modalSave} />
                <Button title="Cancel" variant="outline" onPress={() => setCheckInModalVisible(false)} style={styles.modalCancel} />
              </View>

            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* SLEEK CIRCULAR FLOATING AI COACH BUTTON (FAB) */}
      <Pressable
        style={[
          styles.floatingCoachFabCircle,
          { backgroundColor: isDark ? '#2E4C38' : PALETTE.sage.default },
        ]}
        onPress={() => setCoachChatVisible(true)}
      >
        <Sparkles color="#FFFFFF" size={24} />
        <View style={styles.fabPulseBadgeCircle} />
      </Pressable>

      {/* Aura Coach Chat Screen Modal */}
      <CoachChat
        visible={coachChatVisible}
        onClose={() => setCoachChatVisible(false)}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 130,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerCalendarBtn: {
    padding: 8,
    borderRadius: 100,
    backgroundColor: '#FCE7F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    marginTop: 2,
  },
  phaseBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 100,
  },
  phaseText: {
    fontFamily: 'Outfit-Bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  readinessCard: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardHeader: {
    marginBottom: SPACING.md,
  },
  dialContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 170,
    height: 170,
  },
  dialLabelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 44,
    lineHeight: 48,
  },
  levelText: {
    fontFamily: 'Outfit-Bold',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  factorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  factorCol: {
    flex: 1,
    alignItems: 'center',
  },
  factorVal: {
    fontFamily: 'Outfit-Bold',
    marginTop: 2,
  },
  insightCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: '#FAF7F2',
    borderLeftWidth: 3,
    borderLeftColor: PALETTE.sage.default,
    borderRadius: 12,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  insightHeaderLabel: {
    fontFamily: 'Outfit-Bold',
    letterSpacing: 0.8,
  },
  insightLoader: {
    paddingVertical: SPACING.sm,
  },
  insightText: {
    lineHeight: 18,
    fontStyle: 'italic',
  },
  planCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  planCardTitle: {
    fontFamily: 'PlayfairDisplay-SemiBold',
  },
  planBadgeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  intensityBadge: {
    backgroundColor: '#EAF0EC',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  durationBadge: {
    backgroundColor: '#F5F3EF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  recTitle: {
    fontFamily: 'Outfit-Medium',
    fontSize: 18,
    marginBottom: 6,
  },
  recDesc: {
    lineHeight: 20,
  },
  baselineIndicator: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1.0,
    borderTopColor: '#ECE9E4',
  },
  baselineText: {
    lineHeight: 14,
  },
  coachCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderColor: '#ECE9E4',
    borderWidth: 1.5,
  },
  coachCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coachCardTitle: {
    fontFamily: 'Outfit-Medium',
  },
  coachCardChevron: {
    paddingHorizontal: SPACING.sm,
  },
  logTitleLabel: {
    fontFamily: 'Outfit-Bold',
    letterSpacing: 1.0,
    marginBottom: SPACING.sm,
    marginLeft: 4,
  },
  quickLogsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  quickLogBtn: {
    flex: 1,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#ECE9E4',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  quickLogText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 10,
  },
  waterQuickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  waterCount: {
    fontSize: 10,
    fontFamily: 'Outfit-Bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(42,46,43,0.4)',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: '80%',
    padding: SPACING.lg,
  },
  modalScroll: {
    paddingBottom: SPACING.xl,
  },
  modalTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    marginBottom: 4,
  },
  modalSubtitle: {
    marginBottom: SPACING.lg,
  },
  formGroup: {
    marginBottom: SPACING.md,
  },
  formLabel: {
    fontFamily: 'Outfit-Medium',
    marginBottom: SPACING.xs,
  },
  formInput: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#ECE9E4',
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    fontFamily: 'Outfit-Regular',
    fontSize: 14,
  },
  ratingsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  ratingBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#ECE9E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingBtnActive: {
    backgroundColor: PALETTE.sage.default,
    borderColor: PALETTE.sage.default,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  tagItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: '#ECE9E4',
  },
  tagItemActive: {
    backgroundColor: PALETTE.sage.default,
    borderColor: PALETTE.sage.default,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalActions: {
    flexDirection: 'column',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    width: '100%',
  },
  modalCancel: {
    width: '100%',
  },
  modalSave: {
    width: '100%',
  },
  // Calorie Card Styles
  calorieCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  calorieHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  calorieHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  percentagePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  calorieBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  calRingContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calRingLabelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calStatsCol: {
    flex: 1,
    justifyContent: 'center',
  },
  heroNumberBox: {
    marginBottom: SPACING.sm,
  },
  calBreakdownRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: '#ECE9E4',
  },
  calBreakdownItem: {
    flex: 1,
  },
  overTargetBox: {
    backgroundColor: '#FDEDEC',
    padding: SPACING.sm,
    borderRadius: 8,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: '#FADBD8',
  },
  calActionsRow: {
    flexDirection: 'column',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  calActionBtn: {
    width: '100%',
  },
  // Water Modal Styles
  waterTargetBox: {
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  waterInputGroup: {
    marginBottom: SPACING.md,
  },
  waterPresetRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  waterPresetBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#ECE9E4',
    backgroundColor: '#FAF8F5',
  },
  // Streak & Checklist Styles
  streakHeaderBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetsChecklistCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  targetsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  targetCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  targetsList: {
    flexDirection: 'column',
    gap: SPACING.xs,
  },
  targetRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  successPill: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
  },
  // Detailed Readiness Factor Breakdown Styles
  readinessHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  readinessHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  readinessHeroBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    borderRadius: 12,
    borderWidth: 1,
  },
  factorDetailList: {
    flexDirection: 'column',
    gap: SPACING.sm,
  },
  fullWidthFactorCard: {
    width: '100%',
    padding: SPACING.sm,
    borderRadius: 12,
    borderWidth: 1,
  },
  factorDetailItem: {
    paddingVertical: 4,
  },
  factorDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  factorWhyBox: {
    marginTop: 6,
    paddingTop: 4,
  },
  factorProgressBarTrack: {
    height: 8,
    backgroundColor: '#ECE9E4',
    borderRadius: 100,
    overflow: 'hidden',
  },
  factorProgressBarFill: {
    height: '100%',
    backgroundColor: PALETTE.sage.default,
    borderRadius: 100,
  },
  // Meal Recommendations Styles
  mealRecSection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#ECE9E4',
  },
  mealRecHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  mealRecCard: {
    padding: SPACING.sm,
    borderRadius: 10,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: '#ECE9E4',
  },
  mealRecCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: SPACING.xs,
  },
  mealCalPill: {
    backgroundColor: '#FADBD8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
  // Sleek Circular Floating AI Coach Action Button (FAB)
  floatingCoachFabCircle: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 9999,
  },
  fabPulseBadgeCircle: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
