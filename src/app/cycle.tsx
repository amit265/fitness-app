import React, { useState } from 'react';
import { View, StyleSheet, useColorScheme, ScrollView, Pressable, Switch,  } from 'react-native';
import { AppModal as Modal } from '../components/AppModal';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { InputField } from '../components/InputField';
import { useAppStore } from '../store/useAppStore';
import { CyclePhase } from '../types';
import {
  calculateCycleStats,
  getCycleState,
  isFertileDay,
  CycleStats,
} from '../domain/cycle/cycleEngine';
import { addDays, getTodayStr } from '../utils/date';
import { PALETTE, SPACING, CYCLE_PHASE_COLORS } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../context/ThemeContext';
import { t } from '../i18n';
import { Alert } from '../utils/alertUtils';
import { ScreenContainer } from '../components/ScreenContainer';
import { useResponsive } from '../utils/responsive';

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Smile,
  Moon,
  Droplet,
  Trash2,
  Heart,
  Activity as ActivityIcon,
  BookOpen,
  Zap,
  Utensils,
  Dumbbell,
  Sparkles,
  CheckCircle2,
  Edit3,
  Info,
  HelpCircle,
  X,
} from 'lucide-react-native';

const SYMPTOM_OPTIONS = [
  'cramps',
  'bloating',
  'fatigue',
  'headache',
  'cravings',
  'acne',
  'mood changes',
] as const;

interface CalendarCellState {
  cycleDay: number;
  phase: CyclePhase;
  daysUntilExpectedPeriod?: number;
  estimatedOvulationDay?: number;
  confidence: 'low' | 'medium' | 'high';
  isPeriodExpectedSoon: boolean;
  isConfirmed: boolean;
  flowIntensity?: 'light' | 'medium' | 'heavy' | 'spotting';
  periodLogId?: string;
  isFertile: boolean;
  isPeak: boolean;
  isOvulation: boolean;
  hasSymptoms?: boolean;
}

export default function DedicatedCyclePage() {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const uiLanguage = useAppStore((state) => state.uiLanguage);

  // Dedicated Cycle Phase Colors (Preserves semantic distinctness across all global themes)
  const phaseColors = isDark ? CYCLE_PHASE_COLORS.dark : CYCLE_PHASE_COLORS.light;

  const JEWEL_COLORS = {
    period: phaseColors.menstrual,
    periodBg: phaseColors.menstrualBg,
    periodText: phaseColors.menstrualText,

    fertile: phaseColors.follicular,
    fertileBg: phaseColors.follicularBg,
    fertileText: phaseColors.follicularText,

    ovulation: phaseColors.ovulatory,
    ovulationBg: phaseColors.ovulatoryBg,
    ovulationText: phaseColors.ovulatoryText,

    luteal: phaseColors.luteal,
    lutealBg: phaseColors.lutealBg,
    lutealText: phaseColors.lutealText,

    confirmed: phaseColors.confirmedPeriod,
    confirmedText: phaseColors.confirmedPeriodText,
    expected: isDark ? '#3D2D38' : '#F4D4D9',
  };

  // Store data & actions
  const periods = useAppStore((state) => state.periods);
  const cyclePreferences = useAppStore((state) => state.cyclePreferences);
  const dailyCheckIns = useAppStore((state) => state.dailyCheckIns);
  const userProfile = useAppStore((state) => state.userProfile);

  const addPeriodLog = useAppStore((state) => state.addPeriodLog);
  const updatePeriodLog = useAppStore((state) => state.updatePeriodLog);
  const deletePeriodLog = useAppStore((state) => state.deletePeriodLog);
  const setDailyCheckIn = useAppStore((state) => state.setDailyCheckIn);

  // States
  const todayStr = getTodayStr();
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);
  const [viewDate, setViewDate] = useState<Date>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  // Active guide tab for phase explanation section
  const [activeGuidePhase, setActiveGuidePhase] = useState<CyclePhase>('follicular');

  // Modal Visibility states
  const [periodModalVisible, setPeriodModalVisible] = useState(false);
  const [symptomModalVisible, setSymptomModalVisible] = useState(false);
  const [tutorialModalVisible, setTutorialModalVisible] = useState(false);

  // Period Form State
  const [periodStartDate, setPeriodStartDate] = useState(todayStr);
  const [periodEndDate, setPeriodEndDate] = useState('');
  const [isOngoing, setIsOngoing] = useState(true);
  const [flowIntensity, setFlowIntensity] = useState<'light' | 'medium' | 'heavy' | 'spotting'>('medium');
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);

  // Symptom Form State for selected date
  const selectedCheckIn = dailyCheckIns[selectedDateStr];
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(selectedCheckIn?.symptoms || []);

  // Sync symptoms when selected date changes
  React.useEffect(() => {
    const checkIn = dailyCheckIns[selectedDateStr];
    setSelectedSymptoms(checkIn?.symptoms || []);
  }, [selectedDateStr, dailyCheckIns]);

  // Calculate stats & today's cycle state (always fixed to TODAY)
  const stats: CycleStats = calculateCycleStats(periods, cyclePreferences);
  const todayCycleState = getCycleState(periods, cyclePreferences, todayStr);

  // Update guide phase to match today's date on mount
  React.useEffect(() => {
    if (todayCycleState.phase !== 'unknown') {
      setActiveGuidePhase(todayCycleState.phase);
    }
  }, [todayCycleState.phase]);

  // Calendar Helpers
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const getCellData = (dayNum: number): { cellDateStr: string; cellState: CalendarCellState } => {
    const cellDate = new Date(year, month, dayNum);
    const yyyy = cellDate.getFullYear();
    const mm = String(cellDate.getMonth() + 1).padStart(2, '0');
    const dd = String(cellDate.getDate()).padStart(2, '0');
    const cellDateStr = `${yyyy}-${mm}-${dd}`;

    const state = getCycleState(periods, cyclePreferences, cellDateStr);
    const confirmedLog = periods.find((p) => {
      if (p.endDate) {
        return cellDateStr >= p.startDate && cellDateStr <= p.endDate;
      }
      return cellDateStr === p.startDate;
    });

    const dayInCycle = state.cycleDay > 0 ? ((state.cycleDay - 1) % stats.averageCycleLength) + 1 : 1;
    const fertileInfo = isFertileDay(dayInCycle, stats.averageCycleLength);

    const checkIn = dailyCheckIns[cellDateStr];
    const hasSymptoms = checkIn && checkIn.symptoms && checkIn.symptoms.length > 0;

    const cellState: CalendarCellState = {
      ...state,
      isConfirmed: !!confirmedLog,
      flowIntensity: confirmedLog?.flowIntensity,
      periodLogId: confirmedLog?.id,
      isFertile: fertileInfo.isFertile,
      isPeak: fertileInfo.isPeak,
      isOvulation: fertileInfo.isPeak && dayInCycle === (stats.averageCycleLength - 14),
      hasSymptoms: !!hasSymptoms,
    };

    return { cellDateStr, cellState };
  };

  // Selected Day Details State
  const selectedDayCellData = getCellData(parseInt(selectedDateStr.split('-')[2]) || 1).cellState;
  const confirmedPeriodForSelectedDate = periods.find((p) => {
    if (p.endDate) {
      return selectedDateStr >= p.startDate && selectedDateStr <= p.endDate;
    }
    return selectedDateStr === p.startDate;
  });

  const handleOpenAddPeriod = () => {
    if (selectedDateStr > todayStr) {
      Alert.alert(t('cycle.futureDateRestriction'), '');
      return;
    }

    if (confirmedPeriodForSelectedDate) {
      setEditingPeriodId(confirmedPeriodForSelectedDate.id);
      setPeriodStartDate(confirmedPeriodForSelectedDate.startDate);
      setPeriodEndDate(confirmedPeriodForSelectedDate.endDate || '');
      setIsOngoing(!confirmedPeriodForSelectedDate.endDate);
      setFlowIntensity(confirmedPeriodForSelectedDate.flowIntensity || 'medium');
    } else {
      setEditingPeriodId(null);
      setPeriodStartDate(selectedDateStr);
      setPeriodEndDate('');
      setIsOngoing(true);
      setFlowIntensity('medium');
    }
    setPeriodModalVisible(true);
  };

  const handleSavePeriod = () => {
    if (!periodStartDate) {
      Alert.alert(t('common.error'), t('cycle.selectValidStartDate'));
      return;
    }

    if (periodStartDate > todayStr) {
      Alert.alert(t('cycle.futureDateStart'), '');
      return;
    }

    if (editingPeriodId) {
      updatePeriodLog(editingPeriodId, {
        startDate: periodStartDate,
        endDate: isOngoing ? undefined : periodEndDate || periodStartDate,
        flowIntensity,
      });
    } else {
      addPeriodLog({
        startDate: periodStartDate,
        endDate: isOngoing ? undefined : periodEndDate || periodStartDate,
        flowIntensity,
      });
    }

    setPeriodModalVisible(false);
  };

  const handleDeletePeriod = (id: string) => {
    Alert.alert(t('common.delete'), t('cycle.deleteLogConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => deletePeriodLog(id),
      },
    ]);
  };

  const handleToggleSymptom = (symptom: string) => {
    const exists = selectedSymptoms.includes(symptom);
    const updated = exists
      ? selectedSymptoms.filter((s) => s !== symptom)
      : [...selectedSymptoms, symptom];
    setSelectedSymptoms(updated);
  };

  const handleSaveSymptoms = () => {
    if (selectedDateStr > todayStr) {
      Alert.alert(t('cycle.futureDateSymptoms'), '');
      return;
    }

    const currentCheckIn = dailyCheckIns[selectedDateStr];
    setDailyCheckIn(selectedDateStr, {
      sleepDuration: currentCheckIn?.sleepDuration || 7.5,
      sleepQuality: currentCheckIn?.sleepQuality || 4,
      energy: currentCheckIn?.energy || 4,
      mood: currentCheckIn?.mood || 'good',
      stress: currentCheckIn?.stress || 2,
      hydration: currentCheckIn?.hydration || 2.0,
      symptoms: selectedSymptoms,
    });
    setSymptomModalVisible(false);
  };

  // Phase Guide Descriptions Data
  const phaseGuideDetails = {
    menstrual: {
      name: t('cycle.phase_menstrual_name', { defaultValue: 'Menstrual Phase' }),
      days: t('cycle.phase_menstrual_days', { defaultValue: 'Days 1 – 5' }),
      icon: Droplet,
      color: JEWEL_COLORS.period,
      bgColor: JEWEL_COLORS.periodBg,
      hormones: t('cycle.phase_menstrual_hormones', { defaultValue: 'Estrogen and Progesterone drop to baseline levels as the uterine lining sheds.' }),
      experience: t('cycle.phase_menstrual_experience', { defaultValue: 'Restorative phase. Energy is naturally lower, with potential mild cramping or lower back tightness. Introspective, calm mental focus.' }),
      workouts: t('cycle.phase_menstrual_workouts', { defaultValue: 'Gentle mobility, restorative yoga, light walking, active stretching, or complete rest.' }),
      nutrition: t('cycle.phase_menstrual_nutrition', { defaultValue: 'Iron-rich foods (spinach, lentils), Magnesium, warm broths & herbal teas.' }),
      mindEnergy: t('cycle.phase_menstrual_mindEnergy', { defaultValue: 'Introspective & calm. Low physical stamina, restorative mental focus.' }),
    },
    follicular: {
      name: t('cycle.phase_follicular_name', { defaultValue: 'Follicular Phase' }),
      days: t('cycle.phase_follicular_days', { defaultValue: 'Days 6 – 13' }),
      icon: Zap,
      color: JEWEL_COLORS.fertile,
      bgColor: JEWEL_COLORS.fertileBg,
      hormones: t('cycle.phase_follicular_hormones', { defaultValue: 'FSH stimulates egg follicles; Estrogen climbs steadily to build uterine lining.' }),
      experience: t('cycle.phase_follicular_experience', { defaultValue: 'Energy surge! High mental stamina, sharp cognitive focus, vibrant mood, and high social motivation.' }),
      workouts: t('cycle.phase_follicular_workouts', { defaultValue: 'Progressive strength training, heavy resistance, high-intensity intervals (HIIT), running, or trying new workout skills.' }),
      nutrition: t('cycle.phase_follicular_nutrition', { defaultValue: 'Lean proteins, fermented foods (kimchi, yogurt), fresh greens & complex carbs.' }),
      mindEnergy: t('cycle.phase_follicular_mindEnergy', { defaultValue: 'SURGE! Vibrant mood, high mental stamina & sharp cognitive focus.' }),
    },
    ovulatory: {
      name: t('cycle.phase_ovulatory_name', { defaultValue: 'Ovulatory Phase' }),
      days: t('cycle.phase_ovulatory_days', { defaultValue: 'Days 14 – 17' }),
      icon: Sparkles,
      color: JEWEL_COLORS.ovulation,
      bgColor: JEWEL_COLORS.ovulationBg,
      hormones: t('cycle.phase_ovulatory_hormones', { defaultValue: 'Peak Estrogen triggers an LH surge, releasing a mature egg. Peak fertility window.' }),
      experience: t('cycle.phase_ovulatory_experience', { defaultValue: 'Peak power and confidence! Heightened strength output, radiant energy, maximum libido, and high social presence.' }),
      workouts: t('cycle.phase_ovulatory_workouts', { defaultValue: 'Personal record (PR) strength lifts, intense cardio sessions, energetic group fitness, and high-output workouts.' }),
      nutrition: t('cycle.phase_ovulatory_nutrition', { defaultValue: 'Fiber-rich foods, antioxidant berries & anti-inflammatory cruciferous vegetables.' }),
      mindEnergy: t('cycle.phase_ovulatory_mindEnergy', { defaultValue: 'PEAK POWER! High confidence, radiant energy & social presence.' }),
    },
    luteal: {
      name: t('cycle.phase_luteal_name', { defaultValue: 'Luteal Phase' }),
      days: t('cycle.phase_luteal_days', { defaultValue: 'Days 18 – 28' }),
      icon: Moon,
      color: JEWEL_COLORS.luteal,
      bgColor: JEWEL_COLORS.lutealBg,
      hormones: t('cycle.phase_luteal_hormones', { defaultValue: 'Progesterone rises to maintain uterine lining; resting body temp and heart rate naturally increase.' }),
      experience: t('cycle.phase_luteal_experience', { defaultValue: 'Energy shifts inward. High stamina early luteal, transitioning to grounding near end. Possible PMS, bloating, or appetite changes.' }),
      workouts: t('cycle.phase_luteal_workouts', { defaultValue: 'Moderate resistance training, Pilates, steady-state cardio, Barre, and fluid yoga flows.' }),
      nutrition: t('cycle.phase_luteal_nutrition', { defaultValue: 'Complex carbohydrates (sweet potatoes, oats), B-vitamins & dark chocolate.' }),
      mindEnergy: t('cycle.phase_luteal_mindEnergy', { defaultValue: 'Grounding phase. High stamina early luteal, turning inward near end.' }),
    },
  };

  const validPhaseKey = (activeGuidePhase === 'unknown' ? 'follicular' : activeGuidePhase) as keyof typeof phaseGuideDetails;
  const selectedGuide = phaseGuideDetails[validPhaseKey] || phaseGuideDetails.follicular;

  // Calculate next predicted period start date string
  const latestPeriod = periods.length > 0 ? [...periods].sort((a, b) => b.startDate.localeCompare(a.startDate))[0] : null;
  const nextPeriodDateStr = latestPeriod ? addDays(latestPeriod.startDate, stats.averageCycleLength) : 'Not logged';

  const handleResetToToday = () => {
    const now = new Date();
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDateStr(todayStr);
  };

  const isCurrentMonthView = viewDate.getMonth() === new Date().getMonth() && viewDate.getFullYear() === new Date().getFullYear();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScreenContainer>
        
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.backBtn,
              { backgroundColor: colors.surface },
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => router.back()}
          >
            <ArrowLeft color={colors.primary} size={22} />
          </Pressable>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
              <Typography variant="h3" >
                Cycle Guide
              </Typography>
              <Pressable
                style={({ pressed }) => [
                  styles.howItWorksPill,
                  { backgroundColor: colors.surface },
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => setTutorialModalVisible(true)}
              >
                <HelpCircle color={colors.primary} size={14} />
                <Typography variant="caption" color={colors.primary} style={{ fontSize: 11 }}>
                  {t('cycle.howItWorks')}
                </Typography>
              </Pressable>
            </View>
            <Typography variant="caption" color={colors.subtext} style={{ marginTop: 2 }}>
              {t('cycle.guideSubtitle')}
            </Typography>
          </View>
        </View>

        {/* 1. Cycle Status Summary Card (FIXED TO TODAY) */}
        <Card style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.statusHeaderRow}>
            <View style={styles.statusTitleCol}>
              <Heart color={JEWEL_COLORS.period} size={22} />
              <Typography variant="h3" style={{ flexShrink: 1 }}>
                {userProfile?.pauseCycleTracking ? t('cycle.notLogged') : `${t('cycle.currentDay', { day: todayCycleState.cycleDay })} • ${t('cycle.phase.' + todayCycleState.phase)}`}
              </Typography>
            </View>
            <View style={[styles.confidenceBadge, { backgroundColor: stats.confidence === 'high' ? colors.successBg : colors.warningBg }]}>
              <Typography variant="caption" color={stats.confidence === 'high' ? colors.success : colors.warning} >
                {t('cycle.confidenceLabel')}: {stats.confidence.toUpperCase()}
              </Typography>
            </View>
          </View>

          <View style={styles.statusGrid}>
            <View style={[styles.statusGridItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Typography variant="caption" color={colors.subtext} style={styles.statusLabelText}>
                {t('cycle.nextPeriodLabel')}
              </Typography>
              <Typography
                variant="bodySmall"
                color={colors.textPrimary}
                style={styles.statusValueText}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {nextPeriodDateStr === 'Not logged' ? t('cycle.notLogged') : nextPeriodDateStr}
              </Typography>
            </View>
            <View style={[styles.statusGridItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Typography variant="caption" color={colors.subtext} style={styles.statusLabelText}>
                {t('cycle.cycleLengthLabel')}
              </Typography>
              <Typography
                variant="bodySmall"
                color={colors.textPrimary}
                style={styles.statusValueText}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                ~{stats.averageCycleLength} {t('common.days_other', { count: stats.averageCycleLength })}
              </Typography>
            </View>
            <View style={[styles.statusGridItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Typography variant="caption" color={colors.subtext} style={styles.statusLabelText}>
                {t('cycle.periodDurationLabel')}
              </Typography>
              <Typography
                variant="bodySmall"
                color={colors.textPrimary}
                style={styles.statusValueText}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                ~{stats.averagePeriodDuration} {t('common.days_other', { count: stats.averagePeriodDuration })}
              </Typography>
            </View>
          </View>
        </Card>

        {/* 2. Interactive Vibrant Jewel-Tone Calendar View */}
        <Card style={[styles.calendarCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.calendarHeaderRow}>
            <Pressable onPress={handlePrevMonth} style={[styles.monthNavBtn, { backgroundColor: colors.surface }]}>
              <ChevronLeft color={colors.primary} size={20} />
            </Pressable>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Typography variant="h3" >
                {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </Typography>
              {!isCurrentMonthView && (
                <Pressable style={[styles.todaySnapBtn, { backgroundColor: colors.surface }]} onPress={handleResetToToday}>
                  <Typography variant="caption" color={colors.primary} style={{ fontSize: 10 }}>
                    Today
                  </Typography>
                </Pressable>
              )}
            </View>

            <Pressable onPress={handleNextMonth} style={[styles.monthNavBtn, { backgroundColor: colors.surface }]}>
              <ChevronRight color={colors.primary} size={20} />
            </Pressable>
          </View>

          {/* Days of Week Header */}
          <View style={styles.weekdayHeaderRow}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
              <Typography key={idx} variant="caption" color={colors.subtext} style={styles.weekdayText}>
                {day}
              </Typography>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <View key={`empty-${idx}`} style={styles.calendarCell} />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const { cellDateStr, cellState } = getCellData(dayNum);
              const isSelected = cellDateStr === selectedDateStr;
              const isToday = cellDateStr === todayStr;

              // Vibrant Jewel Tones Color Logic for EVERY DAY
              let bgColor = isDark ? '#2E2B28' : '#F5F3EF';
              let textColor = isDark ? '#E5E0D8' : PALETTE.charcoal.default;

              if (cellState.isConfirmed) {
                bgColor = JEWEL_COLORS.confirmed;
                textColor = JEWEL_COLORS.confirmedText;
              } else if (cellState.phase === 'menstrual') {
                bgColor = JEWEL_COLORS.periodBg;
                textColor = JEWEL_COLORS.periodText;
              } else if (cellState.isOvulation || cellState.phase === 'ovulatory') {
                bgColor = JEWEL_COLORS.ovulationBg;
                textColor = JEWEL_COLORS.ovulationText;
              } else if (cellState.isFertile) {
                bgColor = JEWEL_COLORS.ovulationBg;
                textColor = JEWEL_COLORS.ovulationText;
              } else if (cellState.phase === 'follicular') {
                bgColor = JEWEL_COLORS.fertileBg;
                textColor = JEWEL_COLORS.fertileText;
              } else if (cellState.phase === 'luteal') {
                bgColor = JEWEL_COLORS.lutealBg;
                textColor = JEWEL_COLORS.lutealText;
              }

              return (
                <Pressable
                  key={`day-${dayNum}`}
                  style={[
                    styles.calendarCell,
                    { backgroundColor: bgColor },
                    isSelected && { borderWidth: 2.5, borderColor: colors.primary },
                    isToday && !isSelected && { borderWidth: 2, borderColor: colors.primary, borderStyle: 'dashed' },
                  ]}
                  onPress={() => setSelectedDateStr(cellDateStr)}
                >
                  <Typography
                    variant="caption"
                    style={{
                      fontFamily: isToday || isSelected ? 'Outfit-Bold' : 'Outfit-Medium',
                      color: textColor,
                    }}
                  >
                    {dayNum}
                  </Typography>

                  {/* Indicators */}
                  <View style={styles.indicatorRow}>
                    {(cellState.phase === 'menstrual' || cellState.isConfirmed) && (
                      <View style={[styles.jewelDot, { backgroundColor: JEWEL_COLORS.period }]} />
                    )}
                    {cellState.isFertile && (
                      <View style={[styles.jewelDot, { backgroundColor: JEWEL_COLORS.fertile }]} />
                    )}
                    {(cellState.isOvulation || cellState.phase === 'ovulatory') && (
                      <View style={[styles.jewelDot, { backgroundColor: JEWEL_COLORS.ovulation }]} />
                    )}
                    {cellState.phase === 'luteal' && (
                      <View style={[styles.jewelDot, { backgroundColor: JEWEL_COLORS.luteal }]} />
                    )}
                    {cellState.hasSymptoms && (
                      <View style={[styles.jewelDot, { backgroundColor: colors.primary }]} />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Color Legend Bar */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: JEWEL_COLORS.period }]} />
              <Typography variant="caption" color={colors.subtext}>{t('cycle.legendPeriod')}</Typography>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: JEWEL_COLORS.fertile }]} />
              <Typography variant="caption" color={colors.subtext}>{t('cycle.legendFertile')}</Typography>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: JEWEL_COLORS.ovulation }]} />
              <Typography variant="caption" color={colors.subtext}>{t('cycle.legendOvulation')}</Typography>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: JEWEL_COLORS.luteal }]} />
              <Typography variant="caption" color={colors.subtext}>{t('cycle.legendLuteal')}</Typography>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
              <Typography variant="caption" color={colors.subtext}>{t('cycle.legendLogged')}</Typography>
            </View>
          </View>
        </Card>

        {/* 3. Selected Day Detailed Inspector Card */}
        <Card style={styles.selectedDayCard}>
          <View style={styles.selectedDayHeader}>
            <View>
              <Typography variant="h3" >
                {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('default', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Typography>
              <Typography variant="caption" color={PALETTE.charcoal.light} style={{ marginTop: 2 }}>
                Day {selectedDayCellData.cycleDay} • {selectedDayCellData.phase.toUpperCase()} PHASE {selectedDateStr > todayStr ? '(PREDICTED)' : ''}
              </Typography>
            </View>

            <View
              style={[
                styles.phaseStatusPill,
                {
                  backgroundColor: confirmedPeriodForSelectedDate
                    ? JEWEL_COLORS.period
                    : selectedDayCellData.isFertile
                    ? JEWEL_COLORS.fertileBg
                    : isDark ? '#2E2B28' : '#F5F3EF',
                },
              ]}
            >
              <Typography
                variant="caption"
                color={confirmedPeriodForSelectedDate ? '#FFFFFF' : selectedDayCellData.isFertile ? JEWEL_COLORS.fertileText : PALETTE.charcoal.default}
                
              >
                {confirmedPeriodForSelectedDate
                  ? `PERIOD (${(confirmedPeriodForSelectedDate.flowIntensity || 'medium').toUpperCase()})`
                  : selectedDayCellData.isFertile
                  ? 'FERTILE WINDOW'
                  : selectedDayCellData.phase.toUpperCase()}
              </Typography>
            </View>
          </View>

          {/* Conditional Layout for Past/Today vs Future Dates */}
          {selectedDateStr <= todayStr ? (
            <>
              {/* Symptoms List for Selected Past/Today Date */}
              <View style={styles.symptomsSection}>
                {selectedSymptoms.length > 0 ? (
                  <View style={styles.symptomsChipWrap}>
                    {selectedSymptoms.map((sym) => (
                      <View key={sym} style={styles.symptomChip}>
                        <Typography variant="caption" color={PALETTE.rose.dark} >
                          • {sym}
                        </Typography>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Typography variant="caption" color={PALETTE.charcoal.light}>
                    No symptoms logged for this date.
                  </Typography>
                )}
              </View>

              {/* Symptom Impact Recalibration Notice */}
              {selectedSymptoms.includes('cramps') && (
                <View style={styles.symptomImpactNotice}>
                  <Info color="#D97706" size={14} />
                  <Typography variant="caption" color="#D97706" style={{ flex: 1, fontSize: 11 }}>
                    Cramps Logged • Daily readiness recommends restorative mobility & light stretching today.
                  </Typography>
                </View>
              )}

              {/* Modern Rounded Action Pill Buttons */}
              <View style={styles.dayActionsRow}>
                <Pressable
                  style={[styles.primaryActionPill, { backgroundColor: confirmedPeriodForSelectedDate ? '#D97706' : JEWEL_COLORS.period }]}
                  onPress={handleOpenAddPeriod}
                >
                  <Droplet color="#FFFFFF" size={16} />
                  <Typography variant="caption" color="#FFFFFF" style={styles.actionPillText}>
                    {confirmedPeriodForSelectedDate ? 'Edit Period' : 'Log Period Start'}
                  </Typography>
                </Pressable>

                <Pressable
                  style={styles.outlineActionPill}
                  onPress={() => setSymptomModalVisible(true)}
                >
                  <Plus color={PALETTE.sage.default} size={16} />
                  <Typography variant="caption" color={PALETTE.sage.dark} style={styles.actionPillText}>
                    Log Symptoms
                  </Typography>
                </Pressable>

                {confirmedPeriodForSelectedDate && (
                  <Pressable
                    style={styles.deletePillBtn}
                    onPress={() => handleDeletePeriod(confirmedPeriodForSelectedDate.id)}
                  >
                    <Trash2 color="#EF4444" size={18} />
                  </Pressable>
                )}
              </View>
            </>
          ) : (() => {
            const targetPhaseKey = (selectedDayCellData.phase === 'unknown' ? 'follicular' : selectedDayCellData.phase) as keyof typeof phaseGuideDetails;
            const targetGuide = phaseGuideDetails[targetPhaseKey] || phaseGuideDetails.follicular;
            return (
              /* Dynamic Future Date Preview Card (Movement & Nutrition Strategy) */
              <View style={[styles.futurePreviewCard, { backgroundColor: targetGuide.bgColor }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <targetGuide.icon color={targetGuide.color} size={18} />
                  <Typography variant="bodyMedium" style={{ color: targetGuide.color }}>
                    {targetGuide.name} (Predicted)
                  </Typography>
                </View>
                <View style={{ gap: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Zap color={targetGuide.color} size={14} />
                    <Typography variant="caption" style={{ color: targetGuide.color, flex: 1 }}>
                      {targetGuide.mindEnergy}
                    </Typography>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Dumbbell color={targetGuide.color} size={14} />
                    <Typography variant="caption" style={{ flex: 1 }}>
                      {targetGuide.workouts}
                    </Typography>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Utensils color={targetGuide.color} size={14} />
                    <Typography variant="caption" color={PALETTE.charcoal.light} style={{ flex: 1 }}>
                      Fueling: {targetGuide.nutrition}
                    </Typography>
                  </View>
                </View>
              </View>
            );
          })()}
        </Card>

        {/* 4. DEDICATED HORMONAL PHASES EXPLANATION & GUIDE SECTION */}
        <Card style={styles.guideContainerCard}>
          <View style={styles.guideHeaderRow}>
            <BookOpen color={PALETTE.sage.default} size={20} />
            <Typography variant="h3" style={{ marginLeft: 6 }}>
              {t('cycle.hormonalGuideTitle', { defaultValue: 'Hormonal Phases Guide' })}
            </Typography>
          </View>
          <Typography variant="caption" color={PALETTE.charcoal.light} style={{ marginBottom: SPACING.md }}>
            {t('cycle.hormonalGuideDesc')}
          </Typography>

          {/* Single-Line Responsive 4 Phase Segment Selector */}
          <View style={styles.phaseSegmentRow}>
            {(['menstrual', 'follicular', 'ovulatory', 'luteal'] as const).map((ph) => {
              const isSelected = activeGuidePhase === ph;
              const details = phaseGuideDetails[ph];
              return (
                <Pressable
                  key={ph}
                  style={[
                    styles.phaseSegmentBtn,
                    isSelected && { backgroundColor: details.color },
                  ]}
                  onPress={() => setActiveGuidePhase(ph)}
                >
                  <Typography
                    variant="caption"
                    color={isSelected ? '#FFFFFF' : (isDark ? '#E5E0D8' : PALETTE.charcoal.default)}
                    style={styles.phaseTabLabel}
                    numberOfLines={1}
                  >
                    {ph.toUpperCase()}
                  </Typography>
                </Pressable>
              );
            })}
          </View>

          {/* Active Phase Explanation Card */}
          <View style={[styles.activePhaseCard, { backgroundColor: selectedGuide.bgColor }]}>
            <View style={styles.activePhaseTopRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <selectedGuide.icon color={selectedGuide.color} size={26} />
                <View>
                  <Typography variant="h3" >
                    {selectedGuide.name}
                  </Typography>
                  <Typography variant="caption" color={selectedGuide.color} >
                    {selectedGuide.days}
                  </Typography>
                </View>
              </View>
            </View>

            {/* Detail Blocks */}
            <View style={styles.detailBlock}>
              <View style={styles.detailBlockTitleRow}>
                <ActivityIcon color={selectedGuide.color} size={16} />
                <Typography variant="bodySmall" style={{ marginLeft: 4 }}>
                  {t('cycle.hormonalLandscape', { defaultValue: 'Hormonal Landscape' })}
                </Typography>
              </View>
              <Typography variant="bodySmall" color={PALETTE.charcoal.light} style={styles.detailText}>
                {selectedGuide.hormones}
              </Typography>
            </View>

            <View style={styles.detailBlock}>
              <View style={styles.detailBlockTitleRow}>
                <Smile color={selectedGuide.color} size={16} />
                <Typography variant="bodySmall" style={{ marginLeft: 4 }}>
                  {t('cycle.mindEnergyExperience', { defaultValue: 'Mind & Energy Experience' })}
                </Typography>
              </View>
              <Typography variant="bodySmall" color={PALETTE.charcoal.light} style={styles.detailText}>
                {selectedGuide.experience}
              </Typography>
            </View>

            <View style={styles.detailBlock}>
              <View style={styles.detailBlockTitleRow}>
                <Dumbbell color={selectedGuide.color} size={16} />
                <Typography variant="bodySmall" style={{ marginLeft: 4 }}>
                  {t('cycle.recommendedWorkouts', { defaultValue: 'Recommended Workouts' })}
                </Typography>
              </View>
              <Typography variant="bodySmall" color={PALETTE.charcoal.light} style={styles.detailText}>
                {selectedGuide.workouts}
              </Typography>
            </View>

            <View style={styles.detailBlock}>
              <View style={styles.detailBlockTitleRow}>
                <Utensils color={selectedGuide.color} size={16} />
                <Typography variant="bodySmall" style={{ marginLeft: 4 }}>
                  Nutritional Strategy
                </Typography>
              </View>
              <Typography variant="bodySmall" color={PALETTE.charcoal.light} style={styles.detailText}>
                {selectedGuide.nutrition}
              </Typography>
            </View>
          </View>
        </Card>

      </ScreenContainer>


      {/* Log Period Modal */}
      <Modal visible={periodModalVisible} transparent animationType="slide" onRequestClose={() => setPeriodModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setPeriodModalVisible(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
            <Typography variant="h2" style={{ marginBottom: SPACING.md }}>
              {editingPeriodId ? 'Edit Period Record' : 'Log Period Record'}
            </Typography>

            <InputField
              label={t('cycle.periodStartLabel')}
              value={periodStartDate}
              onChangeText={setPeriodStartDate}
              placeholder={t('cycle.periodStartPlaceholder')}
            />

            <View style={styles.toggleRow}>
              <Typography variant="bodyMedium">{t('cycle.ongoingPeriod')}</Typography>
              <Switch value={isOngoing} onValueChange={setIsOngoing} trackColor={{ false: colors.borderLight, true: colors.primary }} />
            </View>

            {!isOngoing && (
              <InputField
                label={t('cycle.periodEndLabel')}
                value={periodEndDate}
                onChangeText={setPeriodEndDate}
                placeholder={t('cycle.periodEndPlaceholder')}
              />
            )}

            <Typography variant="bodySmall" style={{ marginTop: SPACING.sm, marginBottom: 4 }}>{t('cycle.flowIntensity')}</Typography>
            <View style={styles.flowIntensityRow}>
              {(['spotting', 'light', 'medium', 'heavy'] as const).map((flow) => (
                <Pressable
                  key={flow}
                  style={[styles.flowPill, { backgroundColor: flowIntensity === flow ? colors.primary : colors.surface }]}
                  onPress={() => setFlowIntensity(flow)}
                >
                  <Typography variant="caption" color={flowIntensity === flow ? colors.primaryText : colors.subtext}>
                    {flow.toUpperCase()}
                  </Typography>
                </Pressable>
              ))}
            </View>

            <View style={{ marginTop: SPACING.lg, gap: SPACING.xs }}>
              <Button title={t('cycle.saveRecord')} onPress={handleSavePeriod} />
              <Button title={t('common.cancel')} variant="outline" onPress={() => setPeriodModalVisible(false)} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Log Symptoms Modal */}
      <Modal visible={symptomModalVisible} transparent animationType="slide" onRequestClose={() => setSymptomModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setSymptomModalVisible(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
            <Typography variant="h2" style={{ marginBottom: 4 }}>{t('cycle.logSymptomsTitle')}</Typography>
            <Typography variant="caption" color={colors.subtext} style={{ marginBottom: SPACING.md }}>
              {t('cycle.logSymptomsDesc', { date: selectedDateStr })}
            </Typography>

            <View style={styles.symptomsChipWrap}>
              {SYMPTOM_OPTIONS.map((sym) => {
                const isSelected = selectedSymptoms.includes(sym);
                return (
                  <Pressable
                    key={sym}
                    style={[styles.symptomSelectChip, { backgroundColor: isSelected ? colors.primary : colors.surface, borderColor: isSelected ? colors.primary : colors.border }]}
                    onPress={() => handleToggleSymptom(sym)}
                  >
                    <Typography
                      variant="bodySmall"
                      color={isSelected ? colors.primaryText : colors.textPrimary}
                      style={{ fontFamily: isSelected ? 'Outfit-Bold' : 'Outfit-Medium' }}
                    >
                      {sym.toUpperCase()}
                    </Typography>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ marginTop: SPACING.lg, gap: SPACING.xs }}>
              <Button title={t('cycle.saveSymptoms')} onPress={handleSaveSymptoms} />
              <Button title={t('common.cancel')} variant="outline" onPress={() => setSymptomModalVisible(false)} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* How Cycle Tracking Works Tutorial Modal */}
      <Modal visible={tutorialModalVisible} transparent animationType="fade" onRequestClose={() => setTutorialModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setTutorialModalVisible(false)} />
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, maxHeight: '85%', paddingBottom: 16 }]}>
            
            {/* Sticky Header */}
            <View style={styles.stickyModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                <BookOpen color={colors.primary} size={22} />
                <Typography variant="h2">
                  {t('cycle.howCycleTrackingWorks')}
                </Typography>
              </View>
            </View>

            <Typography variant="caption" color={colors.subtext} style={{ marginBottom: SPACING.md }}>
              {t('cycle.howCycleTrackingDesc')}
            </Typography>

            <ScrollView showsVerticalScrollIndicator={true} contentContainerStyle={{ paddingBottom: 16 }}>
              {/* Tutorial Item 1 */}
              <View style={styles.tutorialItemBox}>
                <View style={styles.tutorialItemHeader}>
                  <Droplet color={JEWEL_COLORS.period} size={18} />
                  <Typography variant="bodyMedium" >
                    {t('cycle.tut1Title')}
                  </Typography>
                </View>
                <Typography variant="caption" color={PALETTE.charcoal.light} style={{ marginTop: 2, lineHeight: 16 }}>
                  {t('cycle.tutorialText')}
                </Typography>
              </View>

              {/* Tutorial Item 2 */}
              <View style={styles.tutorialItemBox}>
                <View style={styles.tutorialItemHeader}>
                  <Sparkles color="#D97706" size={18} />
                  <Typography variant="bodyMedium" >
                    {t('cycle.tut2Title')}
                  </Typography>
                </View>
                <Typography variant="caption" color={PALETTE.charcoal.light} style={{ marginTop: 2, lineHeight: 16 }}>
                  {t('cycle.tut2Desc')}
                </Typography>
              </View>

              {/* Tutorial Item 3 */}
              <View style={styles.tutorialItemBox}>
                <View style={styles.tutorialItemHeader}>
                  <Zap color={PALETTE.sage.default} size={18} />
                  <Typography variant="bodyMedium" >
                    {t('cycle.tut3Title')}
                  </Typography>
                </View>
                <Typography variant="caption" color={PALETTE.charcoal.light} style={{ marginTop: 2, lineHeight: 16 }}>
                  {t('cycle.tut3Desc')}
                </Typography>
              </View>

              {/* Tutorial Item 4 */}
              <View style={styles.tutorialItemBox}>
                <View style={styles.tutorialItemHeader}>
                  <Heart color={JEWEL_COLORS.period} size={18} />
                  <Typography variant="bodyMedium" >
                    {t('cycle.tut4Title')}
                  </Typography>
                </View>
                <Typography variant="caption" color={PALETTE.charcoal.light} style={{ marginTop: 2, lineHeight: 16 }}>
                  {t('cycle.tut4Desc1')}<Typography variant="caption" >{t('cycle.tut4Desc2')}</Typography>{t('cycle.tut4Desc3')}
                </Typography>
              </View>

              {/* Tutorial Item 5 */}
              <View style={styles.tutorialItemBox}>
                <View style={styles.tutorialItemHeader}>
                  <ActivityIcon color={PALETTE.sage.default} size={18} />
                  <Typography variant="bodyMedium" >
                    {t('cycle.tut5Title')}
                  </Typography>
                </View>
                <Typography variant="caption" color={PALETTE.charcoal.light} style={{ marginTop: 2, lineHeight: 16 }}>
                  {t('cycle.tut5Desc')}
                </Typography>
              </View>

              <View style={{ marginTop: SPACING.md }}>
                <Button title={t('cycle.gotIt')} onPress={() => setTutorialModalVisible(false)} />
              </View>
            </ScrollView>
          </View>
        </View>
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
    marginBottom: SPACING.md,
  },
  backBtn: {
    padding: SPACING.xs,
    borderRadius: 100,
    backgroundColor: '#FAF8F5',
  },
  howItWorksPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
    backgroundColor: '#EAF0EC',
  },
  todaySnapBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    backgroundColor: '#EAF0EC',
  },
  symptomImpactNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: SPACING.sm,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    marginBottom: SPACING.xs,
  },
  stickyModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 100,
    backgroundColor: '#F5F3EF',
  },
  tutorialItemBox: {
    padding: SPACING.sm,
    backgroundColor: '#F5F3EF',
    borderRadius: 12,
    marginTop: SPACING.xs,
  },
  tutorialItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.md,
  },
  statusTitleCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 180,
  },
  confidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  statusLabelText: {
    fontSize: 9.5,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  statusValueText: {
    fontSize: 12,
    marginTop: 3,
    textAlign: 'center',
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  statusGridItem: {
    flex: 1,
    minWidth: 90,
    paddingHorizontal: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 20,
    borderWidth: 1,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  monthNavBtn: {
    padding: 6,
    borderRadius: 100,
  },
  weekdayHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekdayText: {
    width: 36,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    width: '14.28%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginVertical: 2,
    position: 'relative',
  },
  selectedCellBorder: {
    borderWidth: 2,
    borderColor: PALETTE.sage.default,
  },
  todayCellHighlight: {
    borderWidth: 2.5,
    borderColor: '#10B981',
  },
  indicatorRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  jewelDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#ECE9E4',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // Selected Day Details Styles
  selectedDayCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  selectedDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  phaseStatusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  symptomsSection: {
    marginBottom: SPACING.md,
  },
  symptomsChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  symptomChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    backgroundColor: '#FCE7F3',
  },
  symptomSelectChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: '#F5F3EF',
  },
  symptomSelectChipActive: {
    backgroundColor: PALETTE.rose.default,
  },
  dayActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: 4,
  },
  primaryActionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 100,
  },
  outlineActionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: PALETTE.sage.default,
  },
  actionPillText: {
    },
  deletePillBtn: {
    padding: 10,
    borderRadius: 100,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  futurePreviewCard: {
    padding: SPACING.md,
    borderRadius: 12,
    marginTop: 4,
  },
  // Guide Styles
  guideContainerCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  guideHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  phaseSegmentRow: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: SPACING.md,
    backgroundColor: '#F5F3EF',
    padding: 3,
    borderRadius: 12,
  },
  phaseSegmentBtn: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  phaseTabLabel: {
    fontSize: 9.5,
    textAlign: 'center',
  },
  activePhaseCard: {
    padding: SPACING.lg,
    borderRadius: 16,
    gap: SPACING.md,
  },
  activePhaseTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailBlock: {
    gap: 2,
  },
  detailBlockTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    lineHeight: 18,
    marginTop: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  flowIntensityRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: SPACING.xs,
  },
  flowPill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECE9E4',
  },
  flowPillActive: {
    backgroundColor: PALETTE.rose.default,
    borderColor: PALETTE.rose.default,
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
});
