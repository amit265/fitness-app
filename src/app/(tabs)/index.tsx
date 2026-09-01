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
  Alert,
} from 'react-native';
import { Typography } from '../../components/Typography';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { InputField } from '../../components/InputField';
import { CoachChat } from '../../components/CoachChat';
import { SiniAvatar } from '../../components/SiniAvatar';
import { useAppStore } from '../../store/useAppStore';
import { getCycleState } from '../../domain/cycle/cycleEngine';
import { calculateReadinessScore } from '../../domain/readiness/readinessEngine';
import { generateDailyInsight } from '../../services/ai/aiService';
import { generateContextHash } from '../../services/ai/aiContextBuilder';
import { getTodayStr, diffInDays } from '../../utils/date';
import { PALETTE, SPACING, SEMANTICS, SHADOWS } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { getDailyCalorieBalance } from '../../domain/calories/calorieEngine';
import { getRecommendedMealsForToday } from '../../domain/calories/mealRecommendationEngine';
import { triggerStoreReviewIfAppropriate } from '../../utils/storeReview';
import { logAnalyticsEvent } from '../../services/analyticsService';
import { NativeAdComponent } from '../../services/AdManager';
import {
  Sparkles,
  Droplet,
  Flame,
  Activity as ActivityIcon,
  CheckCircle2,
  Circle as CircleIcon,
  Award,
  ChevronDown,
  ChevronUp,
  Utensils,
  Calendar as CalendarIcon,
  Settings,
  Zap,
  MessageSquare,
} from 'lucide-react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { t, formatNumber } from '../../i18n';

export default function TodayScreen() {
  const { colors, isDark } = useAppTheme();
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
  const uiLanguage = useAppStore((state) => state.uiLanguage);
  const dailyInsightCache = useAppStore((state) => state.dailyInsightCache);
  const setCachedInsight = useAppStore((state) => state.setCachedInsight);
  const setDailyCheckIn = useAppStore((state) => state.setDailyCheckIn);
  const recordActivityStreak = useAppStore((state) => state.recordActivityStreak);

  // Modals state
  const [checkInModalVisible, setCheckInModalVisible] = useState(false);
  const [coachChatVisible, setCoachChatVisible] = useState(false);
  const [coachInitialQuery, setCoachInitialQuery] = useState<string | undefined>(undefined);
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
    return hours === 0;
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
  const currentStreak = streak?.currentStreak || 1;

  useEffect(() => {
    if (completedTargetsCount >= 2) {
      recordActivityStreak(todayStr);
      if (currentStreak >= 3) {
        logAnalyticsEvent('streak_milestone_hit', { streak: currentStreak });
        triggerStoreReviewIfAppropriate('streak_milestone');
      }
    }
  }, [completedTargetsCount, todayStr, currentStreak]);

  const fetchDailyInsight = async (forceRefresh: boolean = false) => {
    const context = {
      userName: userProfile?.name,
      userGoal: userProfile?.weightGoal || 'wellness',
      cycleState,
      readinessScore: readiness.score,
      sleepDuration: todayCheckIn?.sleepDuration ?? 8,
      sleepQuality: todayCheckIn?.sleepQuality ?? 4,
      energy: todayCheckIn?.energy ?? 3,
      stress: todayCheckIn?.stress ?? 2,
      hydration: todayCheckIn?.hydration ?? 1.5,
      symptoms: todayCheckIn?.symptoms ?? [],
      recentWorkoutMinutes,
      remainingCalories: calorieBalance.remainingCalories,
    };

    const contextHash = generateContextHash(context) + '_' + uiLanguage;
    const cached = dailyInsightCache[todayStr];

    // Use cached insight if available and context hasn't changed (unless force refresh requested)
    if (!forceRefresh && cached && cached.contextHash === contextHash && cached.content) {
      setDailyInsight(cached.content);
      return;
    }

    setInsightLoading(true);
    try {
      const text = await generateDailyInsight(context, userProfile?.groqApiKey);
      setDailyInsight(text);
      setCachedInsight(todayStr, {
        date: todayStr,
        generatedAt: new Date().toISOString(),
        contextHash,
        content: text,
      });
    } catch (e) {
      const fallbackText = `FACT: You have ${calorieBalance.remainingCalories} kcal remaining today.\nCONTEXT: You're in your ${cycleState.phase} phase (Day ${cycleState.cycleDay}) with energy ${todayCheckIn?.energy || 3}/5.\nCHOICE: A protein-dense dinner will fit comfortably. If you want movement, a gentle 20-minute walk is ideal.`;
      setDailyInsight(fallbackText);
    } finally {
      setInsightLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyInsight(false);
  }, [todayStr, uiLanguage, calorieBalance.remainingCalories, readiness.score]);


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

  const openWaterModal = () => {
    setWaterInputVal(todayCheckIn ? String(todayCheckIn.hydration) : '1.5');
    setWaterModalVisible(true);
  };

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

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

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
    fetchDailyInsight(true);
  };

  // Calorie Circular Arc Math
  const calStrokeWidth = 14;
  const calRadius = 56;
  const calCircumference = 2 * Math.PI * calRadius;
  const calProgress = Math.min(1, calorieBalance.consumedCalories / (calorieBalance.targetCalories || 1850));
  const calStrokeDashoffset = calCircumference - calProgress * calCircumference;

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchDailyInsight(true);
    } catch (e) {}
    setRefreshing(false);
  };


  const openSiniWithQuery = (query?: string) => {
    setCoachInitialQuery(query);
    setCoachChatVisible(true);
  };

  // Split insight text into FACT, CONTEXT, CHOICE if structured
  const renderFormattedInsight = (text: string) => {
    if (!text) return null;
    const hasFact = text.includes('FACT:') || text.includes('**FACT**');
    if (!hasFact) {
      return (
        <Typography variant="bodyMedium" style={{ lineHeight: 22 }}>
          {text}
        </Typography>
      );
    }

    const sections = text.split(/(FACT:|CONTEXT:|CHOICE:|\*\*FACT\*\*|\*\*CONTEXT\*\*|\*\*CHOICE\*\*)/gi);
    let currentKey = '';
    const parsed: Record<string, string> = {};

    sections.forEach((part) => {
      const p = part.trim().toUpperCase();
      if (p.includes('FACT')) currentKey = 'FACT';
      else if (p.includes('CONTEXT')) currentKey = 'CONTEXT';
      else if (p.includes('CHOICE')) currentKey = 'CHOICE';
      else if (currentKey && part.trim()) {
        parsed[currentKey] = part.trim();
      }
    });

    return (
      <View style={{ gap: 10 }}>
        {parsed.FACT && (
          <View style={styles.insightBlock}>
            <Typography variant="caption" color={PALETTE.plum.default} style={styles.insightBlockTag}>
              FACT
            </Typography>
            <Typography variant="bodyMedium" style={styles.insightBlockText}>
              {parsed.FACT}
            </Typography>
          </View>
        )}
        {parsed.CONTEXT && (
          <View style={styles.insightBlock}>
            <Typography variant="caption" color={PALETTE.rose.default} style={styles.insightBlockTag}>
              CONTEXT
            </Typography>
            <Typography variant="bodyMedium" style={styles.insightBlockText}>
              {parsed.CONTEXT}
            </Typography>
          </View>
        )}
        {parsed.CHOICE && (
          <View style={styles.insightBlock}>
            <Typography variant="caption" color={PALETTE.sage.default} style={styles.insightBlockTag}>
              CHOICE
            </Typography>
            <Typography variant="bodyMedium" style={styles.insightBlockText}>
              {parsed.CHOICE}
            </Typography>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[PALETTE.plum.default]}
            tintColor={PALETTE.plum.default}
          />
        }
      >

        {/* Top Branding Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Typography variant="caption" color={colors.subtext} style={{ letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Sini AI: Cycle & Fitness • 🔥 {streak?.currentStreak || 1}d Streak
            </Typography>
            <Typography variant="h1" style={styles.userName}>
              Good morning, {userProfile?.name || 'Sarah'}
            </Typography>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {/* Cycle Calendar Link Icon */}
            <Pressable
              style={styles.headerIconBtn}
              onPress={() => router.push('/cycle')}
            >
              <CalendarIcon color={colors.primary} size={22} />
            </Pressable>

            {/* Settings Link Icon */}
            <Pressable
              style={styles.headerIconBtn}
              onPress={() => router.push('/settings')}
            >
              <Settings color={colors.primary} size={22} />
            </Pressable>
          </View>
        </View>

        {/* 1. CURRENT CYCLE & HOW I FEEL (PRIORITY 1) */}
        <Card style={styles.cycleStatusCard}>
          <View style={styles.cycleHeaderRow}>
            <View style={styles.cycleBadgeRow}>
              <Pressable
                onPress={() => router.push('/cycle')}
                style={[
                  styles.phasePill,
                  {
                    backgroundColor: colors.surface,
                  },
                ]}
              >
                <Typography
                  variant="caption"
                  color={colors.primary}
                  style={{ fontFamily: 'Outfit-Bold', textTransform: 'uppercase' }}
                >
                  {cycleState.phase.toUpperCase()} · DAY {cycleState.cycleDay}
                </Typography>
              </Pressable>

              <View style={[styles.energyPill, { backgroundColor: colors.surface }]}>
                <Zap size={14} color={colors.ovulation} />
                <Typography variant="caption" color={colors.textPrimary} style={{ fontFamily: 'Outfit-Bold', marginLeft: 4 }}>
                  Energy {todayCheckIn ? todayCheckIn.energy : 3}/5
                </Typography>
              </View>
            </View>

            <Pressable
              style={styles.checkInBtn}
              onPress={() => setCheckInModalVisible(true)}
            >
              <Typography variant="caption" color={colors.primary} style={{ fontFamily: 'Outfit-Bold' }}>
                {todayCheckIn ? 'Edit Check-In' : '+ Log Feeling'}
              </Typography>
            </Pressable>
          </View>

          <View style={styles.feelingSummaryRow}>
            <View style={styles.feelingStat}>
              <Typography variant="caption" color={colors.subtext}>Readiness</Typography>
              <Typography variant="h2" color={colors.activity} style={{ fontFamily: 'Outfit-Bold' }}>
                {readiness.score}/100
              </Typography>
            </View>
            <View style={[styles.feelingDivider, { backgroundColor: colors.border }]} />
            <View style={styles.feelingStat}>
              <Typography variant="caption" color={colors.subtext}>Sleep</Typography>
              <Typography variant="h3" style={{ fontFamily: 'Outfit-Bold' }}>
                {todayCheckIn ? `${todayCheckIn.sleepDuration}h` : '8.0h'}
              </Typography>
            </View>
            <View style={[styles.feelingDivider, { backgroundColor: colors.border }]} />
            <View style={styles.feelingStat}>
              <Typography variant="caption" color={colors.subtext}>Hydration</Typography>
              <Typography variant="h3" style={{ fontFamily: 'Outfit-Bold' }}>
                {todayCheckIn ? `${todayCheckIn.hydration}L` : '1.5L'}
              </Typography>
            </View>
          </View>
        </Card>

        {/* 2. TODAY'S CALORIES HERO VISUAL (PRIORITY 2) */}
        <Card style={styles.heroCalorieCard}>
          <View style={styles.calorieHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Flame color={colors.nutrition} size={20} />
              <Typography variant="h3" style={{ fontFamily: 'Outfit-Bold', marginLeft: 6 }}>
                TODAY'S CALORIES
              </Typography>
            </View>
            <View style={[styles.targetPill, { backgroundColor: calorieBalance.isOverTarget ? colors.errorBg : colors.successBg }]}>
              <Typography
                variant="caption"
                color={calorieBalance.isOverTarget ? colors.error : colors.success}
                style={{ fontFamily: 'Outfit-Bold' }}
              >
                {calorieBalance.percentageUsed}% TARGET
              </Typography>
            </View>
          </View>

          <View style={styles.heroCalorieContent}>
            {/* Elegant Circular Progress Indicator */}
            <View style={styles.calRingContainer}>
              <Svg width={(calRadius + calStrokeWidth) * 2} height={(calRadius + calStrokeWidth) * 2}>
                <Circle
                  cx={calRadius + calStrokeWidth}
                  cy={calRadius + calStrokeWidth}
                  r={calRadius}
                  stroke={colors.border}
                  strokeWidth={calStrokeWidth}
                  fill="transparent"
                />
                <Circle
                  cx={calRadius + calStrokeWidth}
                  cy={calRadius + calStrokeWidth}
                  r={calRadius}
                  stroke={calorieBalance.isOverTarget ? colors.error : colors.nutrition}
                  strokeWidth={calStrokeWidth}
                  strokeDasharray={calCircumference}
                  strokeDashoffset={calStrokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  transform={`rotate(-90 ${calRadius + calStrokeWidth} ${calRadius + calStrokeWidth})`}
                />
              </Svg>
              <View style={styles.calRingLabelContainer}>
                <Typography variant="h1" style={{ fontFamily: 'Outfit-Bold', fontSize: 26 }}>
                  {calorieBalance.consumedCalories.toLocaleString()}
                </Typography>
                <Typography variant="caption" color={colors.subtext}>
                  / {calorieBalance.targetCalories.toLocaleString()} kcal
                </Typography>
              </View>
            </View>

            {/* Calories Hierarchy & Stats */}
            <View style={styles.heroCalorieStatsCol}>
              <Typography variant="display" color={calorieBalance.isOverTarget ? colors.error : colors.primary} style={styles.remainingHeroNumber}>
                {calorieBalance.isOverTarget
                  ? `${calorieBalance.overAmount}`
                  : `${calorieBalance.remainingCalories}`}
              </Typography>
              <Typography variant="bodyMedium" color={colors.subtext} style={{ fontFamily: 'Outfit-Medium' }}>
                {calorieBalance.isOverTarget ? 'kcal over target' : 'kcal remaining'}
              </Typography>

              <View style={styles.macroMiniRow}>
                <View style={styles.macroMiniItem}>
                  <Typography variant="caption" color={colors.subtext}>Food</Typography>
                  <Typography variant="bodyMedium" color={colors.nutrition} style={{ fontFamily: 'Outfit-Bold' }}>
                    {calorieBalance.consumedCalories} kcal
                  </Typography>
                </View>
                <View style={styles.macroMiniItem}>
                  <Typography variant="caption" color={colors.subtext}>Activity</Typography>
                  <Typography variant="bodyMedium" color={colors.activity} style={{ fontFamily: 'Outfit-Bold' }}>
                    ~{calorieBalance.activityCalories} kcal
                  </Typography>
                </View>
              </View>
            </View>
          </View>

          {/* Quick Log Action Buttons Row */}
          <View style={styles.quickLogButtonsRow}>
            <Button
              title={`+ ${t('nutrition.logFood')}`}
              variant="nutrition"
              onPress={() => router.push('/(tabs)/log')}
              style={styles.heroActionBtn}
            />
            <Button
              title={`+ ${t('activity.logWorkout')}`}
              variant="positive"
              onPress={() => router.push('/(tabs)/log')}
              style={styles.heroActionBtn}
            />
          </View>
        </Card>

        {/* 3. SINI'S SUGGESTION CARD (FACT · CONTEXT · CHOICE) */}
        <Card style={[styles.siniSuggestionCard, { backgroundColor: colors.surface }]}>
          <View style={styles.siniHeaderRow}>
            <SiniAvatar size={30} variant="plum" />
            <Typography variant="h3" style={{ fontFamily: 'Outfit-Bold', marginLeft: 10 }}>
              {t('home.dailyInsightTitle')}
            </Typography>
          </View>

          <View style={{ marginTop: SPACING.xs }}>
            {insightLoading ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 12 }} />
            ) : (
              renderFormattedInsight(dailyInsight)
            )}
          </View>

          <Pressable
            style={styles.askSiniSubBtn}
            onPress={() => openSiniWithQuery('Explain my remaining calories for today')}
          >
            <Sparkles size={14} color={colors.primary} />
            <Typography variant="caption" color={colors.primary} style={{ fontFamily: 'Outfit-Bold', marginLeft: 6 }}>
              {t('home.askSiniAction')}
            </Typography>
          </Pressable>
        </Card>

        {/* SPONSORED NATIVE AD */}
        <NativeAdComponent screen="home" />

        {/* 4. ACTIVITY & RECOVERY PLAN */}
        <Card style={styles.activityPlanCard}>
          <View style={styles.cardTitleRow}>
            <ActivityIcon color={colors.activity} size={20} />
            <Typography variant="h3" style={{ fontFamily: 'Outfit-Bold', marginLeft: 8 }}>
              Activity & Movement
            </Typography>
          </View>

          <View style={styles.activityBadgeRow}>
            <View style={[styles.actBadge, { backgroundColor: colors.surface }]}>
              <Typography variant="caption" color={colors.activity} style={{ fontFamily: 'Outfit-Bold' }}>
                {readiness.recommendation.activityType.replace('_', ' ').toUpperCase()}
              </Typography>
            </View>
            {readiness.recommendation.durationMinutes && (
              <View style={[styles.actBadge, { backgroundColor: colors.surface }]}>
                <Typography variant="caption" color={colors.textPrimary} style={{ fontFamily: 'Outfit-Bold' }}>
                  ⏱ {readiness.recommendation.durationMinutes} mins
                </Typography>
              </View>
            )}
          </View>

          <Typography variant="bodyLarge" style={{ fontFamily: 'Outfit-Bold', marginTop: 8 }}>
            {readiness.recommendation.title}
          </Typography>
          <Typography variant="bodyMedium" color={colors.subtext} style={{ marginTop: 4, lineHeight: 20 }}>
            {readiness.recommendation.explanation}
          </Typography>

          {/* Quick Hydration Tracker */}
          <View style={styles.hydrationBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Droplet color={colors.activity} size={18} />
              <Typography variant="bodyMedium" style={{ marginLeft: 8, fontFamily: 'Outfit-Medium' }}>
                Hydration Target: {recommendedWaterL}L
              </Typography>
            </View>
            <Pressable onPress={openWaterModal} style={styles.quickAddWaterBtn}>
              <Typography variant="caption" color={colors.activity} style={{ fontFamily: 'Outfit-Bold' }}>
                + Add Water
              </Typography>
            </Pressable>
          </View>
        </Card>

        {/* 5. TODAY'S TARGETS CHECKLIST */}
        <Card style={styles.targetsCard}>
          <Pressable onPress={() => setIsTargetsFolded(!isTargetsFolded)} style={styles.targetsHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Award color={colors.ovulation} size={20} />
              <Typography variant="h3" style={{ fontFamily: 'Outfit-Bold' }}>
                Today's Targets
              </Typography>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={[styles.targetCountBadge, { backgroundColor: completedTargetsCount >= 2 ? colors.successBg : colors.warningBg }]}>
                <Typography variant="caption" color={completedTargetsCount >= 2 ? colors.success : colors.warning} style={{ fontFamily: 'Outfit-Bold' }}>
                  {completedTargetsCount}/4 Done
                </Typography>
              </View>
              {isTargetsFolded ? <ChevronDown color={colors.subtext} size={18} /> : <ChevronUp color={colors.subtext} size={18} />}
            </View>
          </Pressable>

          {!isTargetsFolded && (
            <View style={styles.targetsList}>
              <View style={styles.targetItem}>
                {isCheckInMet ? <CheckCircle2 color={colors.activity} size={20} /> : <CircleIcon color={colors.border} size={20} />}
                <Typography variant="bodyMedium" style={styles.targetLabel}>Check-in & Energy logged</Typography>
              </View>
              <View style={styles.targetItem}>
                {isWaterMet ? <CheckCircle2 color={colors.activity} size={20} /> : <CircleIcon color={colors.border} size={20} />}
                <Typography variant="bodyMedium" style={styles.targetLabel}>Hydration target ({recommendedWaterL}L)</Typography>
              </View>
              <View style={styles.targetItem}>
                {isExerciseMet ? <CheckCircle2 color={colors.activity} size={20} /> : <CircleIcon color={colors.border} size={20} />}
                <Typography variant="bodyMedium" style={styles.targetLabel}>Movement ({readiness.recommendation.durationMinutes || 20}m)</Typography>
              </View>
              <View style={styles.targetItem}>
                {isNutritionMet ? <CheckCircle2 color={colors.activity} size={20} /> : <CircleIcon color={colors.border} size={20} />}
                <Typography variant="bodyMedium" style={styles.targetLabel}>Nutrition logged</Typography>
              </View>
            </View>
          )}
        </Card>

        {/* Native Ad Card */}
        <NativeAdComponent screen="home" style={{ marginVertical: SPACING.md }} />

      </ScrollView>

      {/* FLOATING ACTION BUTTON (FAB) FOR SINI AI CHAT */}
      <Pressable
        style={({ pressed }) => [
          styles.siniFloatingFab,
          { backgroundColor: colors.primary },
          pressed && styles.pressedFab,
        ]}
        onPress={() => openSiniWithQuery()}
      >
        <SiniAvatar size={34} variant="plum" />
        <Typography variant="caption" color={colors.primaryText} style={{ fontFamily: 'Outfit-Bold', marginLeft: 6 }}>
          Ask Sini
        </Typography>
      </Pressable>

      {/* Sini AI Coach Chat Modal */}
      <CoachChat
        visible={coachChatVisible}
        onClose={() => setCoachChatVisible(false)}
        initialQuery={coachInitialQuery}
      />

      {/* Daily Check-In Modal */}
      <Modal visible={checkInModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setCheckInModalVisible(false)}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.bg }]}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalHeader}>
              <Typography variant="h2" style={{ fontFamily: 'Outfit-Bold' }}>{t('home.dailyCheckInTitle')}</Typography>
              <Pressable onPress={() => setCheckInModalVisible(false)}>
                <Typography variant="bodyMedium" color={colors.primary}>{t('common.done')}</Typography>
              </Pressable>
            </View>

            <Typography variant="bodyMedium" color={colors.subtext} style={{ marginBottom: SPACING.md }}>
              {t('home.moodLabel')}
            </Typography>

            <Card style={{ marginBottom: SPACING.md }}>
              <Typography variant="h3" style={{ marginBottom: 12 }}>{t('home.energyLabel')} ({energyVal}/5)</Typography>
              <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <Pressable
                    key={level}
                    style={[styles.ratingChip, energyVal === level && { backgroundColor: PALETTE.plum.default }]}
                    onPress={() => setEnergyVal(level)}
                  >
                    <Typography variant="bodyMedium" color={energyVal === level ? PALETTE.oat.default : colors.text}>
                      {level}
                    </Typography>
                  </Pressable>
                ))}
              </View>
            </Card>

            <Card style={{ marginBottom: SPACING.md }}>
              <Typography variant="h3" style={{ marginBottom: 12 }}>{t('home.symptomsLabel')}</Typography>
              <View style={styles.symptomsGrid}>
                {['Cramps', 'Bloating', 'Fatigue', 'Headache', 'Cravings', 'Acne', 'Mood Swings', 'Backache'].map((sym) => {
                  const isSel = selectedSymptoms.includes(sym);
                  return (
                    <Pressable
                      key={sym}
                      style={[
                        styles.symptomChip,
                        { borderColor: colors.border },
                        isSel && { backgroundColor: PALETTE.rose.bg, borderColor: PALETTE.rose.default },
                      ]}
                      onPress={() => toggleSymptom(sym)}
                    >
                      <Typography variant="bodySmall" color={isSel ? PALETTE.rose.default : colors.text}>
                        {sym}
                      </Typography>
                    </Pressable>
                  );
                })}
              </View>
            </Card>

            <Button
              title={t('common.save')}
              variant="primary"
              onPress={handleCheckInSubmit}
              style={{ marginTop: SPACING.md }}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Water Add Modal */}
      <Modal visible={waterModalVisible} transparent animationType="fade" onRequestClose={() => setWaterModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Card style={styles.waterDialog}>
            <Typography variant="h3" style={{ marginBottom: 8 }}>{t('nutrition.water')}</Typography>
            <InputField
              label={t('common.litres')}
              value={waterInputVal}
              onChangeText={setWaterInputVal}
              keyboardType="decimal-pad"
            />
            <View style={styles.waterDialogButtons}>
              <Button title={t('common.cancel')} variant="outline" onPress={() => setWaterModalVisible(false)} style={{ flex: 1 }} />
              <Button title={t('common.save')} variant="positive" onPress={handleSaveWaterModal} style={{ flex: 1 }} />
            </View>
          </Card>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 140, // Increased bottom padding for full scrollability past tab bar & FAB
    gap: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  userName: {
    fontFamily: 'Outfit-Bold',
    fontSize: 26,
    lineHeight: 32,
    marginTop: 2,
  },
  headerIconBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: PALETTE.oat.default,
  },
  siniFloatingFab: {
    position: 'absolute',
    bottom: 92,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
    paddingRight: 14,
    paddingVertical: 4,
    borderRadius: 100,
    elevation: 8,
    shadowColor: PALETTE.plum.default,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    zIndex: 99,
  },
  pressedFab: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  // 1. Cycle & Feeling Card
  cycleStatusCard: {
    padding: SPACING.md,
  },
  cycleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  cycleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  phasePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  energyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
  },
  checkInBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: PALETTE.plum.bg,
  },
  feelingSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
  },
  feelingStat: {
    alignItems: 'center',
  },
  feelingDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  // 2. Hero Calorie Card
  heroCalorieCard: {
    padding: SPACING.md,
  },
  calorieHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  targetPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  heroCalorieContent: {
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
  heroCalorieStatsCol: {
    flex: 1,
  },
  remainingHeroNumber: {
    fontSize: 42,
    fontFamily: 'Outfit-Bold',
    lineHeight: 46,
  },
  macroMiniRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  macroMiniItem: {},
  quickLogButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  heroActionBtn: {
    flex: 1,
  },
  // 3. Sini's Suggestion Card
  siniSuggestionCard: {
    padding: SPACING.md,
  },
  siniHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  insightBlock: {
    marginBottom: 6,
  },
  insightBlockTag: {
    fontFamily: 'Outfit-Bold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  insightBlockText: {
    lineHeight: 20,
    marginTop: 2,
  },
  askSiniSubBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  // 4. Activity Card
  activityPlanCard: {
    padding: SPACING.md,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: SPACING.sm,
  },
  actBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  hydrationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  quickAddWaterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: PALETTE.sage.bg,
  },
  // 5. Targets Card
  targetsCard: {
    padding: SPACING.md,
  },
  targetsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  targetCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  targetsList: {
    marginTop: SPACING.sm,
    gap: 10,
  },
  targetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  targetLabel: {
    fontFamily: 'Outfit-Regular',
  },
  // Check-In Modal
  modalContainer: {
    flex: 1,
  },
  modalScroll: {
    padding: SPACING.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  waterDialog: {
    width: '100%',
    padding: SPACING.lg,
  },
  waterDialogButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
});
