import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  useColorScheme,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ImageBackground,
  Image,
} from 'react-native';
import { AppModal as Modal } from '../../components/AppModal';
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { getDailyCalorieBalance, calculateMacroTargets } from '../../domain/calories/calorieEngine';
import { getRecommendedMealsForToday } from '../../domain/calories/mealRecommendationEngine';
import { triggerStoreReviewIfAppropriate } from '../../utils/storeReview';
import { getTodayPlanWorkout, getWorkoutPlanById } from '../../domain/movement/workoutPlans';
import { logAnalyticsEvent } from '../../services/analyticsService';
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
  Droplets,
  ChevronRight,
  Smile,
  Info,
  Brain,
  Lightbulb,
} from 'lucide-react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { t, formatNumber } from '../../i18n';
import { useFocusEffect } from 'expo-router';
import { useResponsive } from '../../utils/responsive';
import { ScreenContainer } from '../../components/ScreenContainer';
import Markdown from 'react-native-markdown-display';

export default function TodayScreen() {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const { isTablet, rs } = useResponsive();
  const insets = useSafeAreaInsets();

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
  
  const markdownStyles = {
    body: {
      color: colors.textPrimary,
      fontSize: 14,
      lineHeight: 20,
    },
    strong: {
      color: colors.textPrimary,
      fontWeight: '700' as const,
    },
    paragraph: {
      marginTop: 2,
      marginBottom: 0,
    }
  };
  const dailyInsightCache = useAppStore((state) => state.dailyInsightCache);
  const setCachedInsight = useAppStore((state) => state.setCachedInsight);
  const setDailyCheckIn = useAppStore((state) => state.setDailyCheckIn);
  const recordActivityStreak = useAppStore((state) => state.recordActivityStreak);
  const activeWorkoutTimer = useAppStore((state) => state.activeWorkoutTimer);
  const setActiveWorkoutTimer = useAppStore((state) => state.setActiveWorkoutTimer);

  useEffect(() => {
    // Midnight kill-switch for timer
    if (activeWorkoutTimer && activeWorkoutTimer.lastUpdatedDate !== getTodayStr()) {
      setActiveWorkoutTimer(null);
    }
  }, [activeWorkoutTimer]);

  // Modals state
  const [targetsExpanded, setTargetsExpanded] = useState(false);
  const [checkInModalVisible, setCheckInModalVisible] = useState(false);
  const [coachChatVisible, setCoachChatVisible] = useState(false);
  const [coachInitialQuery, setCoachInitialQuery] = useState<string | undefined>(undefined);
  
  // Targets Info Modal
  const [targetModalVisible, setTargetModalVisible] = useState(false);
  const [targetModalType, setTargetModalType] = useState<'checkin'|'water'|'move'|'food'>('checkin');

  const openTargetModal = (type: 'checkin'|'water'|'move'|'food') => {
    setTargetModalType(type);
    setTargetModalVisible(true);
  };

  // AI Daily Insight state
  const [dailyInsight, setDailyInsight] = useState<string>('');
  const [insightLoading, setInsightLoading] = useState(false);

  // Workout Plan State
  const activePlanId = useAppStore(state => state.activePlanId);
  const currentPlanDayIndex = useAppStore(state => state.currentPlanDayIndex);
  
  // Today Date & Math
  const todayStr = getTodayStr();
  const cycleState = getCycleState(periods, cyclePreferences, todayStr);
  const calorieBalance = getDailyCalorieBalance(todayStr, meals, activities, userProfile, measurements);

  const todayPlanItem = activePlanId ? getTodayPlanWorkout(activePlanId, cycleState.phase, currentPlanDayIndex) : null;
  const activePlan = activePlanId ? getWorkoutPlanById(activePlanId) : null;

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

  const macroTargets = calculateMacroTargets(calorieBalance.targetCalories, userWeight, userProfile?.weightGoal || 'wellness');

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
    const cacheKey = `${todayStr}_${uiLanguage}`;
    const cached = dailyInsightCache[cacheKey];

    // Use cached insight if available and context hasn't changed (unless force refresh requested)
    if (!forceRefresh && cached && cached.contextHash === contextHash && cached.content) {
      setDailyInsight(cached.content);
      return;
    }

    setInsightLoading(true);
    try {
      const text = await generateDailyInsight(context, userProfile?.groqApiKey);
      setDailyInsight(text);
      setCachedInsight(cacheKey, {
        date: todayStr,
        generatedAt: new Date().toISOString(),
        contextHash,
        content: text,
      });
    } catch (e) {
      const fallbackText = `FACT: You have ${calorieBalance.remainingCalories} kcal remaining today.\nCONTEXT: You're in your ${cycleState.phase} phase (Day ${cycleState.cycleDay}) with energy ${todayCheckIn?.energy || 3}/5.\nCHOICE: A protein-dense dinner will fit comfortably. If you want movement, a gentle 20-minute walk is ideal.`;
      setDailyInsight(fallbackText);
      setCachedInsight(cacheKey, {
        date: todayStr,
        generatedAt: new Date().toISOString(),
        contextHash,
        content: fallbackText,
      });
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
      sleepQuality: todayCheckIn ? todayCheckIn.sleepQuality : 4,
      energy: energyVal,
      stress: todayCheckIn ? todayCheckIn.stress : 2,
      hydration: parseFloat(waterVal) || 1.5,
      mood: todayCheckIn ? todayCheckIn.mood : 'good',
      symptoms: selectedSymptoms,
    });
    setCheckInModalVisible(false);
    fetchDailyInsight(true);
      };

  // Calorie Circular Arc Math
  const calStrokeWidth = rs(14, 16);
  const calRadius = rs(56, 72);
  const calCircumference = 2 * Math.PI * calRadius;
  const calProgress = Math.min(1, calorieBalance.consumedCalories / (calorieBalance.targetCalories || 1850));
  const calStrokeDashoffset = calCircumference - calProgress * calCircumference;

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
        <Markdown style={markdownStyles}>
          {text}
        </Markdown>
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
      <View style={{ gap: 12 }}>
        {parsed.FACT && (
          <View style={[styles.insightRow, { backgroundColor: colors.surface + '80' }]}>
            <View style={[styles.insightIconWrapper, { backgroundColor: PALETTE.plum.default + '20' }]}>
              <Info size={18} color={PALETTE.plum.default} />
            </View>
            <View style={{ flex: 1 }}>
              <Typography variant="caption" color={PALETTE.plum.default} style={{ fontWeight: '700', marginBottom: 2 }}>FACT</Typography>
              <Markdown style={markdownStyles}>{parsed.FACT}</Markdown>
            </View>
          </View>
        )}
        {parsed.CONTEXT && (
          <View style={[styles.insightRow, { backgroundColor: colors.surface + '80' }]}>
            <View style={[styles.insightIconWrapper, { backgroundColor: PALETTE.rose.default + '20' }]}>
              <Brain size={18} color={PALETTE.rose.default} />
            </View>
            <View style={{ flex: 1 }}>
              <Typography variant="caption" color={PALETTE.rose.default} style={{ fontWeight: '700', marginBottom: 2 }}>CONTEXT</Typography>
              <Markdown style={markdownStyles}>{parsed.CONTEXT}</Markdown>
            </View>
          </View>
        )}
        {parsed.CHOICE && (
          <View style={[styles.insightRow, { backgroundColor: colors.surface + '80' }]}>
            <View style={[styles.insightIconWrapper, { backgroundColor: PALETTE.sage.default + '20' }]}>
              <Lightbulb size={18} color={PALETTE.sage.default} />
            </View>
            <View style={{ flex: 1 }}>
              <Typography variant="caption" color={PALETTE.sage.default} style={{ fontWeight: '700', marginBottom: 2 }}>CHOICE</Typography>
              <Markdown style={markdownStyles}>{parsed.CHOICE}</Markdown>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScreenContainer contentStyle={styles.scrollContent}>

        {/* Top Branding Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Typography variant="caption" color={colors.primary} style={{ letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: '700' }}>
              {t('cycle.phase.' + cycleState.phase.toLowerCase(), { defaultValue: cycleState.phase }).toUpperCase()} · {t('cycle.currentDay', { day: cycleState.cycleDay }).toUpperCase()}
            </Typography>
            <Typography variant="h1" style={styles.userName}>
              {userProfile?.name ? t('home.greeting', { name: userProfile.name }) : t('home.greetingDefault')}
            </Typography>
            <Typography variant="caption" color={colors.subtext} style={{ letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 2 }}>
              🔥 {streak?.currentStreak || 1} Day Streak
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

        {/* 1. ENERGY BALANCE */}
        <Card style={styles.heroCalorieCard}>
          <View style={styles.calorieHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1, paddingRight: 8 }}>
              <Flame color={colors.nutrition} size={20} />
              <Typography variant="h3" style={{ marginLeft: 6 }} numberOfLines={1} adjustsFontSizeToFit={true}>
                {t('home.energyBalance', { defaultValue: "Energy Balance" })}
              </Typography>
            </View>
            <View style={[styles.targetPill, { backgroundColor: calorieBalance.isOverTarget ? colors.errorBg : colors.successBg }]}>
              <Typography
                variant="caption"
                color={calorieBalance.isOverTarget ? colors.error : colors.success}
                
              >
                {calorieBalance.percentageUsed}% {t('home.target').toUpperCase()}
              </Typography>
            </View>
          </View>

          {activeWorkoutTimer && activeWorkoutTimer.lastUpdatedDate === getTodayStr() && (
            <Pressable 
              style={[styles.resumeBanner, { backgroundColor: colors.activity }]}
              onPress={() => router.push(`/workoutDetailModal?id=${activeWorkoutTimer.workoutId}`)}
            >
              <ActivityIcon color="#FFF" size={20} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Typography variant="bodyMedium" style={{ color: '#FFF', fontWeight: '600' }}>Workout in Progress</Typography>
                <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.8)' }}>Tap to resume or finish</Typography>
              </View>
              <ChevronRight color="#FFF" size={20} />
            </Pressable>
          )}

          <View style={styles.heroCalorieContent}>
            {/* Elegant Circular Progress Indicator */}
            <View style={styles.calRingContainer}>
              <Svg width={(calRadius + calStrokeWidth * 1.5) * 2} height={(calRadius + calStrokeWidth * 1.5) * 2}>
                <Circle
                  cx={calRadius + calStrokeWidth * 1.5}
                  cy={calRadius + calStrokeWidth * 1.5}
                  r={calRadius}
                  stroke={colors.border}
                  strokeWidth={calStrokeWidth}
                  fill="transparent"
                />
                {/* Glow Layer */}
                <Circle
                  cx={calRadius + calStrokeWidth * 1.5}
                  cy={calRadius + calStrokeWidth * 1.5}
                  r={calRadius}
                  stroke={calorieBalance.isOverTarget ? colors.error : colors.nutrition}
                  strokeWidth={calStrokeWidth * 2.5}
                  strokeDasharray={calCircumference}
                  strokeDashoffset={calStrokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  opacity={0.25}
                  transform={`rotate(-90 ${calRadius + calStrokeWidth * 1.5} ${calRadius + calStrokeWidth * 1.5})`}
                />
                {/* Main Progress Ring */}
                <Circle
                  cx={calRadius + calStrokeWidth * 1.5}
                  cy={calRadius + calStrokeWidth * 1.5}
                  r={calRadius}
                  stroke={calorieBalance.isOverTarget ? colors.error : colors.nutrition}
                  strokeWidth={calStrokeWidth}
                  strokeDasharray={calCircumference}
                  strokeDashoffset={calStrokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  transform={`rotate(-90 ${calRadius + calStrokeWidth * 1.5} ${calRadius + calStrokeWidth * 1.5})`}
                />
              </Svg>
              <View style={styles.calRingLabelContainer}>
                <Typography variant="h1" style={{ fontSize: 26 }}>
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
              <Typography variant="bodyMedium" color={colors.subtext} >
                {calorieBalance.isOverTarget ? t('home.kcalOver') : t('home.kcalRemaining')}
              </Typography>

              <View style={[styles.macroMiniRow, { gap: 6, flexWrap: 'nowrap' }]}>
                <View style={[styles.macroMiniItem, { backgroundColor: colors.surface + '60', padding: 6, borderRadius: 8, minWidth: 0 }]}>
                  <Typography variant="caption" color={colors.subtext}>{t('home.food')}</Typography>
                  <Typography variant="bodyMedium" color={colors.nutrition} style={{ fontWeight: '700' }} >
                    {calorieBalance.consumedCalories}
                  </Typography>
                </View>
                <View style={[styles.macroMiniItem, { backgroundColor: colors.surface + '60', padding: 6, borderRadius: 8, minWidth: 0 }]}>
                  <Typography variant="caption" color={colors.subtext}>{t('home.activity')}</Typography>
                  <Typography variant="bodyMedium" color={colors.activity} style={{ fontWeight: '700' }} >
                    ~{calorieBalance.activityCalories}
                  </Typography>
                </View>
              </View>

              <View style={[styles.macroMiniRow, { marginTop: 6, gap: 4, flexWrap: 'nowrap' }]}>
                <View style={[styles.macroMiniItem, { backgroundColor: colors.surface + '60', padding: 4, borderRadius: 8, minWidth: 0 }]}>
                  <Typography variant="caption" color={colors.subtext} style={{ fontSize: 10 }}>Protein</Typography>
                  <Typography variant="bodySmall" color={colors.textPrimary} style={{ fontWeight: '600', fontSize: 11 }} adjustsFontSizeToFit={true} numberOfLines={1}>
                    {Math.round(calorieBalance.proteinConsumed)}/{macroTargets.proteinG}g
                  </Typography>
                </View>
                <View style={[styles.macroMiniItem, { backgroundColor: colors.surface + '60', padding: 4, borderRadius: 8, minWidth: 0 }]}>
                  <Typography variant="caption" color={colors.subtext} style={{ fontSize: 10 }}>Carbs</Typography>
                  <Typography variant="bodySmall" color={colors.textPrimary} style={{ fontWeight: '600', fontSize: 11 }} adjustsFontSizeToFit={true} numberOfLines={1}>
                    {Math.round(calorieBalance.carbsConsumed)}/{macroTargets.carbsG}g
                  </Typography>
                </View>
                <View style={[styles.macroMiniItem, { backgroundColor: colors.surface + '60', padding: 4, borderRadius: 8, minWidth: 0 }]}>
                  <Typography variant="caption" color={colors.subtext} style={{ fontSize: 10 }}>Fat</Typography>
                  <Typography variant="bodySmall" color={colors.textPrimary} style={{ fontWeight: '600', fontSize: 11 }} adjustsFontSizeToFit={true} numberOfLines={1}>
                    {Math.round(calorieBalance.fatConsumed)}/{macroTargets.fatG}g
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
              onPress={() => router.push('/logModal?tab=food')}
              style={styles.heroActionBtn}
            />
            <Button
              title={`+ ${t('activity.logWorkout')}`}
              variant="positive"
              onPress={() => router.push('/logModal?tab=activity')}
              style={styles.heroActionBtn}
            />
          </View>
          
          <Button
            title={todayCheckIn ? t('home.editCheckIn', { defaultValue: 'Edit Check-In' }) : t('home.logFeeling', { defaultValue: 'Log Daily Check-In' })}
            variant={todayCheckIn ? 'secondary' : 'primary'}
            onPress={() => setCheckInModalVisible(true)}
            style={{ marginTop: SPACING.md }}
            adjustsFontSizeToFit={true}
          />
        </Card>

        {/* 2. ACTIVITY & RECOVERY PLAN */}
        <Card style={[styles.activityPlanCard, { padding: 0, overflow: 'hidden' }]}>
          <Image 
            source={todayPlanItem?.workout?.imageUrl ? { uri: todayPlanItem.workout.imageUrl } : require('../../../assets/images/workouts/ovulatory_strength_pr.jpg')}
            style={{ width: '100%', height: isTablet ? 300 : 200 }}
            resizeMode="cover"
          />
          <View style={{ padding: SPACING.md }}>
            <View style={styles.cardTitleRow}>
              <ActivityIcon color={colors.activity} size={20} />
              <Typography variant="h3" style={{ marginLeft: 8 }}>
                {activePlan ? `${cycleState.phase.charAt(0).toUpperCase() + cycleState.phase.slice(1)} Phase: ${activePlan.title}` : 'Recommended Workout'}
              </Typography>
            </View>

            {activePlan && todayPlanItem ? (
              <>
                <View style={styles.activityBadgeRow}>
                  <View style={[styles.actBadge, { backgroundColor: colors.surface }]}>
                    <Typography variant="caption" color={colors.activity}>
                      DAY {currentPlanDayIndex}
                    </Typography>
                  </View>
                  {!todayPlanItem.isRest && todayPlanItem.workout && (
                    <View style={[styles.actBadge, { backgroundColor: colors.surface }]}>
                      <Typography variant="caption" color={colors.textPrimary}>
                        ⏱ {todayPlanItem.workout.durationMinutes} mins
                      </Typography>
                    </View>
                  )}
                </View>

                <Typography variant="bodyLarge" style={{ marginTop: 8 }}>
                  {todayPlanItem.label}
                </Typography>
                <Typography variant="bodyMedium" color={colors.subtext} style={{ marginTop: 4, lineHeight: 20 }}>
                  {todayPlanItem.isRest 
                    ? 'Take today to recover, hydrate, and prepare for your next session.'
                    : todayPlanItem.workout?.description}
                </Typography>
              </>
            ) : (
              <>
                <View style={styles.activityBadgeRow}>
                  <View style={[styles.actBadge, { backgroundColor: colors.surface }]}>
                    <Typography variant="caption" color={colors.activity} >
                      {t(`readiness.activityType_${readiness.recommendation.activityType}`, { defaultValue: readiness.recommendation.activityType.replace('_', ' ') }).toUpperCase()}
                    </Typography>
                  </View>
                  {readiness.recommendation.durationMinutes && (
                    <View style={[styles.actBadge, { backgroundColor: colors.surface }]}>
                      <Typography variant="caption" color={colors.textPrimary} >
                        ⏱ {readiness.recommendation.durationMinutes} mins
                      </Typography>
                    </View>
                  )}
                </View>

                <Typography variant="bodyLarge" style={{ marginTop: 8 }}>
                  {t(`readiness.rec_${readiness.recommendation.recKey}_title`, { defaultValue: readiness.recommendation.title })}
                </Typography>
                <Typography variant="bodyMedium" color={colors.subtext} style={{ marginTop: 4, lineHeight: 20 }}>
                  {t(`readiness.rec_${readiness.recommendation.recKey}_desc`, { defaultValue: readiness.recommendation.explanation })}
                </Typography>
              </>
            )}

            <View>
               {activePlan && todayPlanItem && !todayPlanItem.isRest && todayPlanItem.workout && (
                 <Pressable 
                   style={({ pressed }) => [
                     styles.libraryLinkBtn, 
                     { backgroundColor: colors.primary, marginTop: SPACING.md, alignItems: 'center' },
                     pressed && { opacity: 0.8 }
                   ]}
                   onPress={() => router.push(`/workoutDetailModal?id=${todayPlanItem.workout?.id}`)}
                 >
                   <Typography variant="bodyMedium" color={PALETTE.white} style={{ fontWeight: '700', fontSize: 16 }}>
                     Start Workout
                   </Typography>
                 </Pressable>
              )}
              <Pressable 
                style={({ pressed }) => [
                  styles.libraryLinkBtn, 
                  { backgroundColor: colors.surface, marginTop: SPACING.md, borderWidth: 1, borderColor: colors.border },
                  pressed && { opacity: 0.8 }
                ]}
                onPress={() => router.push('/explore')}
              >
                <Typography variant="bodyMedium" color={colors.textPrimary} style={{ fontWeight: '600' }}>
                  Explore Movement Library
                </Typography>
              </Pressable>
            </View>
          </View>
        </Card>

        {/* 3. NUTRITION & FUEL CARD */}
        <Card style={[styles.nutritionPlanCard, { padding: 0, overflow: 'hidden' }]}>
          <Image 
            source={require('../../../assets/images/nutrition_placeholder.jpg')}
            style={{ width: '100%', height: isTablet ? 300 : 160 }}
            resizeMode="cover"
          />
          <View style={{ padding: SPACING.md }}>
            <View style={styles.cardTitleRow}>
              <Utensils color={colors.nutrition} size={20} />
              <Typography variant="h3" style={{ marginLeft: 8 }}>
                Recommended Diet
              </Typography>
            </View>
            <Typography variant="bodyMedium" color={colors.subtext} style={{ marginTop: 4, lineHeight: 20, marginBottom: SPACING.md }}>
              Discover the best foods and dietary protocols for your current {cycleState.phase} phase.
            </Typography>
            <Pressable 
              style={({ pressed }) => [
                styles.libraryLinkBtn, 
                { backgroundColor: colors.surface, marginTop: SPACING.xs, borderWidth: 1, borderColor: colors.border },
                pressed && { opacity: 0.8 }
              ]}
              onPress={() => router.push('/explore')}
            >
              <Typography variant="bodyMedium" color={colors.textPrimary} style={{ fontWeight: '600' }}>
                Explore Phase Nutrition Guides
              </Typography>
            </Pressable>
          </View>
        </Card>

        {/* 4. DAILY MILESTONES (NEW HORIZONTAL REDESIGN) */}
        <Card style={styles.targetsCard}>
          <Pressable style={styles.targetsHeaderRow} onPress={() => setTargetsExpanded(!targetsExpanded)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1, paddingRight: 8 }}>
              <Award color={colors.ovulation} size={20} />
              <Typography variant="h3" numberOfLines={1} adjustsFontSizeToFit={true}>
                {t('home.dailyMilestones', { defaultValue: "Daily Milestones" })}
              </Typography>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={[styles.targetCountBadge, { backgroundColor: completedTargetsCount >= 4 ? colors.successBg : colors.warningBg }]}>
                <Typography variant="caption" color={completedTargetsCount >= 4 ? colors.success : colors.warning} >
                  {completedTargetsCount}/4 {t('common.done')}
                </Typography>
              </View>
              {targetsExpanded ? <ChevronUp size={20} color={colors.subtext} /> : <ChevronDown size={20} color={colors.subtext} />}
            </View>
          </Pressable>
          
          {targetsExpanded && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.md }}>
              <Pressable onPress={() => openTargetModal('checkin')} style={{ alignItems: 'center', gap: 6, flex: 1 }}>
              <View style={[styles.targetIconCircle, { backgroundColor: isCheckInMet ? colors.successBg : colors.surface }]}>
                {isCheckInMet ? <CheckCircle2 color={colors.success} size={22} /> : <Smile color={colors.subtext} size={22} />}
              </View>
              <Typography variant="caption" color={isCheckInMet ? colors.textPrimary : colors.subtext} style={{ textAlign: 'center' }}>Check-In</Typography>
            </Pressable>

            <Pressable onPress={() => openTargetModal('water')} style={{ alignItems: 'center', gap: 6, flex: 1 }}>
              <View style={[styles.targetIconCircle, { backgroundColor: isWaterMet ? colors.successBg : colors.surface }]}>
                {isWaterMet ? <CheckCircle2 color={colors.success} size={22} /> : <Droplet color={colors.subtext} size={22} />}
              </View>
              <Typography variant="caption" color={isWaterMet ? colors.textPrimary : colors.subtext} style={{ textAlign: 'center' }}>Water</Typography>
            </Pressable>

            <Pressable onPress={() => openTargetModal('move')} style={{ alignItems: 'center', gap: 6, flex: 1 }}>
              <View style={[styles.targetIconCircle, { backgroundColor: isExerciseMet ? colors.successBg : colors.surface }]}>
                {isExerciseMet ? <CheckCircle2 color={colors.success} size={22} /> : <ActivityIcon color={colors.subtext} size={22} />}
              </View>
              <Typography variant="caption" color={isExerciseMet ? colors.textPrimary : colors.subtext} style={{ textAlign: 'center' }}>Move</Typography>
            </Pressable>

            <Pressable onPress={() => openTargetModal('food')} style={{ alignItems: 'center', gap: 6, flex: 1 }}>
              <View style={[styles.targetIconCircle, { backgroundColor: isNutritionMet ? colors.successBg : colors.surface }]}>
                {isNutritionMet ? <CheckCircle2 color={colors.success} size={22} /> : <Utensils color={colors.subtext} size={22} />}
              </View>
              <Typography variant="caption" color={isNutritionMet ? colors.textPrimary : colors.subtext} style={{ textAlign: 'center' }}>Food</Typography>
            </Pressable>
          </View>
          )}
        </Card>

        {/* 5. SINI'S SUGGESTION CARD (FACT · CONTEXT · CHOICE) MOVED TO BOTTOM */}
        <Card style={[styles.siniSuggestionCard, { backgroundColor: colors.surface }]}>
          <View style={styles.siniHeaderRow}>
            <SiniAvatar size={30} variant="plum" />
            <Typography variant="h3" style={{ marginLeft: 10 }}>
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
            <Typography variant="caption" color={colors.primary} style={{ marginLeft: 6 }}>
              {t('home.askSiniAction')}
            </Typography>
          </Pressable>
        </Card>

        {/* 6. DAILY READINESS CARD */}
        <Card style={{ padding: SPACING.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Typography variant="caption" color={colors.subtext} style={{ marginBottom: 4 }}>
                {t('home.readiness', { defaultValue: 'Daily Readiness' })}
              </Typography>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 4 }}>
                <Typography variant="display" color={colors.textPrimary} style={{ fontSize: 28, lineHeight: 32 }} adjustsFontSizeToFit={true} numberOfLines={2}>
                  {readiness.score >= 80 
                    ? "Prime for Movement" 
                    : readiness.score >= 50 
                      ? "Holding Steady" 
                      : "Prioritize Recovery"}
                </Typography>
              </View>
            </View>
            
            <View style={[styles.readinessIconCircle, { backgroundColor: colors.surface }]}>
              <Zap 
                size={32} 
                color={readiness.score >= 80 ? colors.success : readiness.score >= 50 ? colors.primary : colors.warning} 
                fill={readiness.score >= 80 ? colors.success : readiness.score >= 50 ? colors.primary : colors.warning}
              />
            </View>
          </View>
        </Card>

        {/* End of Cards */}
        {/* Native Ad Card */}
        
      </ScreenContainer>

      {/* FLOATING ACTION BUTTON (FAB) FOR SINI CHAT */}
      <Pressable
        style={({ pressed }) => [
          styles.siniFloatingFab,
          { backgroundColor: colors.primary, bottom: 92 + insets.bottom },
          pressed && styles.pressedFab,
        ]}
        onPress={() => openSiniWithQuery()}
      >
        <SiniAvatar size={34} variant="plum" />
        <Typography variant="caption" color={colors.primaryText} style={{ marginLeft: 6 }}>
          {t('home.askSini')}
        </Typography>
      </Pressable>

      {/* Sini Coach Chat Modal */}
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
              <Typography variant="h2" >{t('home.dailyCheckInTitle')}</Typography>
              <Pressable onPress={() => setCheckInModalVisible(false)}>
                <Typography variant="bodyMedium" color={colors.primary}>{t('common.done')}</Typography>
              </Pressable>
            </View>

            {/* SLEEP SECTION */}
            <Card style={{ marginBottom: SPACING.md }}>
              <Typography variant="h3" style={{ marginBottom: 16 }}>{t('home.sleep', { defaultValue: 'Sleep (Hours)' })}</Typography>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
                <Pressable
                  onPress={() => setSleepDur(prev => Math.max(0, parseFloat(prev || '0') - 0.5).toString())}
                  style={[styles.stepperBtn, { backgroundColor: colors.surface }]}
                >
                  <Typography variant="h2" color={colors.textPrimary}>-</Typography>
                </Pressable>
                <Typography variant="display" style={{ minWidth: 80, textAlign: 'center' }}>{sleepDur}h</Typography>
                <Pressable
                  onPress={() => setSleepDur(prev => Math.min(24, parseFloat(prev || '0') + 0.5).toString())}
                  style={[styles.stepperBtn, { backgroundColor: colors.surface }]}
                >
                  <Typography variant="h2" color={colors.textPrimary}>+</Typography>
                </Pressable>
              </View>
            </Card>

            {/* WATER SECTION */}
            <Card style={{ marginBottom: SPACING.md }}>
              <Typography variant="h3" style={{ marginBottom: 16 }}>{t('home.hydration', { defaultValue: 'Hydration (Liters)' })}</Typography>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
                <Pressable
                  onPress={() => setWaterVal(prev => Math.max(0, parseFloat(prev || '0') - 0.25).toString())}
                  style={[styles.stepperBtn, { backgroundColor: colors.surface }]}
                >
                  <Typography variant="h2" color={colors.textPrimary}>-</Typography>
                </Pressable>
                <Typography variant="display" style={{ minWidth: 80, textAlign: 'center' }}>{waterVal}L</Typography>
                <Pressable
                  onPress={() => setWaterVal(prev => Math.min(10, parseFloat(prev || '0') + 0.25).toString())}
                  style={[styles.stepperBtn, { backgroundColor: colors.surface }]}
                >
                  <Typography variant="h2" color={colors.textPrimary}>+</Typography>
                </Pressable>
              </View>
            </Card>

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
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 12 }}>
              <Pressable onPress={() => setWaterModalVisible(false)} style={{ padding: 8 }}>
                <Typography color={colors.subtext}>{t('common.cancel')}</Typography>
              </Pressable>
              <Button title={t('common.save')} onPress={handleSaveWaterModal} style={{ paddingHorizontal: 20 }} />
            </View>
          </Card>
        </View>
      </Modal>

      {/* Target Info Modal */}
      <Modal visible={targetModalVisible} transparent animationType="fade" onRequestClose={() => setTargetModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Card style={styles.waterDialog}>
            {targetModalType === 'checkin' && (
              <>
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8}}>
                  <Smile color={colors.textPrimary} size={24} />
                  <Typography variant="h2">Check-In</Typography>
                </View>
                <Typography variant="bodyMedium" style={{marginBottom: 8}}>Log your mood, energy, sleep, and symptoms for today.</Typography>
                <Typography variant="caption" color={isCheckInMet ? colors.success : colors.subtext}>Status: {isCheckInMet ? 'Completed' : 'Not yet logged'}</Typography>
              </>
            )}
            {targetModalType === 'water' && (
              <>
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8}}>
                  <Droplet color={colors.textPrimary} size={24} />
                  <Typography variant="h2">Water Intake</Typography>
                </View>
                <Typography variant="bodyMedium" style={{marginBottom: 8}}>Drink at least {recommendedWaterL}L of water today based on your body weight and activity level.</Typography>
                <Typography variant="caption" color={isWaterMet ? colors.success : colors.subtext}>Status: {(todayCheckIn?.hydration || 0)}L / {recommendedWaterL}L</Typography>
              </>
            )}
            {targetModalType === 'move' && (
              <>
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8}}>
                  <ActivityIcon color={colors.textPrimary} size={24} />
                  <Typography variant="h2">Movement</Typography>
                </View>
                <Typography variant="bodyMedium" style={{marginBottom: 8}}>Engage in {readiness.recommendation.durationMinutes || 20} minutes of {readiness.recommendation.activityType.replace('_', ' ')} based on your cycle phase.</Typography>
                <Typography variant="caption" color={isExerciseMet ? colors.success : colors.subtext}>Status: {recentWorkoutMinutes}m / {readiness.recommendation.durationMinutes || 20}m</Typography>
              </>
            )}
            {targetModalType === 'food' && (
              <>
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8}}>
                  <Utensils color={colors.textPrimary} size={24} />
                  <Typography variant="h2">Nutrition</Typography>
                </View>
                <Typography variant="bodyMedium" style={{marginBottom: 8}}>Log at least one meal to track your macros and cycle-sync your nutrition.</Typography>
                <Typography variant="caption" color={isNutritionMet ? colors.success : colors.subtext}>Status: {isNutritionMet ? 'Completed' : 'No meals logged'}</Typography>
              </>
            )}
            
            <Button title="Got it" onPress={() => setTargetModalVisible(false)} style={{ marginTop: 20 }} />
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
  readinessIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
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
    lineHeight: 46,
  },
  macroMiniRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 12,
  },
  macroMiniItem: {
    flex: 1,
    minWidth: 75,
  },
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
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 12,
  },
  insightIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
  resumeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
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
  libraryLinkBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  nutritionPlanCard: {
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  // 6. Targets Card
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
    },
  // Check-In Modal
  targetIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
