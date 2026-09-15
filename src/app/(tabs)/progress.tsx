import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AppModal as Modal } from '../../components/AppModal';
import { Typography } from '../../components/Typography';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { InputField } from '../../components/InputField';
import { LineChart } from '../../components/LineChart';
import { useAppStore } from '../../store/useAppStore';
import { getCycleState } from '../../domain/cycle/cycleEngine';
import { getWeightTrend } from '../../utils/trends';
import { calculateBMI, getBMICategory } from '../../utils/bmiUtils';
import { PALETTE, SPACING } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../context/ThemeContext';
import {
  Scale,
  Ruler,
  TrendingUp,
  Flame,
  Activity as ActivityIcon,
  Moon,
  Zap,
  Calendar as CalendarIcon,
  Plus,
  ChevronRight,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { t, formatDate, formatNumber } from '../../i18n';
import { useResponsive } from '../../utils/responsive';

import { ScreenContainer } from '../../components/ScreenContainer';
type TimeWindow = 7 | 30 | 90;

export default function ProgressScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const uiLanguage = useAppStore((state) => state.uiLanguage);

  // Store bindings
  const measurements = useAppStore((state) => state.measurements);
  const periods = useAppStore((state) => state.periods);
  const cyclePreferences = useAppStore((state) => state.cyclePreferences);
  const dailyCheckIns = useAppStore((state) => state.dailyCheckIns);
  const activities = useAppStore((state) => state.activities);
  const meals = useAppStore((state) => state.meals);
  const userProfile = useAppStore((state) => state.userProfile);
  const addMeasurement = useAppStore((state) => state.addMeasurement);

  // States
  const [timeWindow, setTimeWindow] = useState<TimeWindow>(30);
  const [measureModalVisible, setMeasureModalVisible] = useState(false);

  // Manual Measurement Form State
  const [weightInput, setWeightInput] = useState('');
  const [waistInput, setWaistInput] = useState('');
  const [hipsInput, setHipsInput] = useState('');
  const [chestInput, setChestInput] = useState('');
  const [thighInput, setThighInput] = useState('');

  // Weight Trend Data
  const trendData = getWeightTrend(measurements, timeWindow);
  const latestWeight = measurements[0]?.weight ?? null;
  const sortedByAge = [...measurements].sort((a, b) => a.date.localeCompare(b.date));
  const baselineWeight = sortedByAge[0]?.weight ?? null;

  const weightChange = latestWeight !== null && baselineWeight !== null
    ? parseFloat((latestWeight - baselineWeight).toFixed(1))
    : null;

  // BMI calculations
  const currentHeight = userProfile?.height ?? 0;
  const bmiScore = latestWeight && currentHeight > 0 ? calculateBMI(latestWeight, currentHeight) : 0;
  const bmiCategoryKey = getBMICategory(bmiScore);
  const bmiCategoryTranslated = bmiCategoryKey ? t(`bmi.category.${bmiCategoryKey}` as any) : '--';

  // Latest Body Measurements
  const latestWaist = measurements.find((m) => m.waist !== undefined)?.waist;
  const latestHips = measurements.find((m) => m.hips !== undefined)?.hips;
  const latestChest = measurements.find((m) => m.chest !== undefined)?.chest;
  const latestThigh = measurements.find((m) => m.thigh !== undefined)?.thigh;

  const handleSaveMeasurements = () => {
    addMeasurement({
      weight: weightInput ? parseFloat(weightInput) : latestWeight || 60,
      waist: waistInput ? parseFloat(waistInput) : latestWaist,
      hips: hipsInput ? parseFloat(hipsInput) : latestHips,
      chest: chestInput ? parseFloat(chestInput) : latestChest,
      thigh: thighInput ? parseFloat(thighInput) : latestThigh,
    });
    setMeasureModalVisible(false);
    setWeightInput('');
    setWaistInput('');
    setHipsInput('');
    setChestInput('');
    setThighInput('');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScreenContainer>

        {/* Header */}
        <View style={styles.header}>
          <Typography variant="h1" >
            {t('progress.title')}
          </Typography>
          <Typography variant="caption" color={colors.subtext} style={{ marginTop: 2 }}>
            {t('progress.weightTrend')}
          </Typography>
        </View>

        {/* 1. Weight Trends Card */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TrendingUp color={colors.primary} size={20} />
              <Typography variant="h3" style={{ marginLeft: 8 }}>
                {t('progress.weightTrend')}
              </Typography>
            </View>
          </View>

          {/* Time Window Chips */}
          <View style={styles.timeWindowRow}>
            {[7, 30, 90].map((days) => (
              <Pressable
                key={days}
                style={[
                  styles.windowChip,
                  timeWindow === days ? { backgroundColor: colors.primary } : { backgroundColor: colors.surface },
                ]}
                onPress={() => setTimeWindow(days as TimeWindow)}
              >
                <Typography variant="caption" color={timeWindow === days ? colors.primaryText : colors.textPrimary}>
                  {days === 7 ? t('progress.range7d') : days === 30 ? t('progress.range30d') : t('progress.rangeAll')}
                </Typography>
              </Pressable>
            ))}
          </View>

          {/* Summary Stat Grid */}
          <View style={styles.statGrid}>
            <View style={styles.statBox}>
              <Typography variant="caption" color={colors.subtext}>{t('progress.currentWeight')}</Typography>
              <Typography variant="h2" >
                {latestWeight ? `${latestWeight} kg` : '--'}
              </Typography>
            </View>
            <View style={styles.statBox}>
              <Typography variant="caption" color={colors.subtext}>{t('progress.weightChange')}</Typography>
              <Typography variant="h2" color={weightChange && weightChange <= 0 ? colors.activity : colors.nutrition} >
                {weightChange !== null ? `${weightChange > 0 ? '+' : ''}${weightChange} kg` : '--'}
              </Typography>
            </View>
            <View style={styles.statBox}>
              <Typography variant="caption" color={colors.subtext}>{t('profile.bmiLabel')}</Typography>
              <Typography variant="h3" color={colors.primary} >
                {bmiCategoryTranslated}
              </Typography>
            </View>
          </View>

          {/* Line Chart */}
          <View style={{ marginTop: SPACING.md }}>
            <LineChart data={trendData.values} labels={trendData.labels} height={160} />
          </View>
        </Card>

        {/* 2. Body Measurements Card */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ruler color={colors.period} size={20} />
              <Typography variant="h3" style={{ marginLeft: 8 }}>
                {t('progress.logMeasurement')}
              </Typography>
            </View>
            <Pressable onPress={() => setMeasureModalVisible(true)}>
              <Typography variant="caption" color={colors.period} >
                + {t('common.edit')}
              </Typography>
            </Pressable>
          </View>

          <View style={styles.measurementsGrid}>
            <View style={[styles.measureCard, { backgroundColor: colors.surface }]}>
              <Typography variant="caption" color={colors.subtext}>{t('progress.waist')}</Typography>
              <Typography variant="h2" style={{ marginTop: 4 }}>
                {latestWaist ? `${latestWaist} cm` : '--'}
              </Typography>
            </View>
            <View style={[styles.measureCard, { backgroundColor: colors.surface }]}>
              <Typography variant="caption" color={colors.subtext}>{t('progress.hips')}</Typography>
              <Typography variant="h2" style={{ marginTop: 4 }}>
                {latestHips ? `${latestHips} cm` : '--'}
              </Typography>
            </View>
            <View style={[styles.measureCard, { backgroundColor: colors.surface }]}>
              <Typography variant="caption" color={colors.subtext}>{t('progress.chest')}</Typography>
              <Typography variant="h2" style={{ marginTop: 4 }}>
                {latestChest ? `${latestChest} cm` : '--'}
              </Typography>
            </View>
            <View style={[styles.measureCard, { backgroundColor: colors.surface }]}>
              <Typography variant="caption" color={colors.subtext}>{t('progress.thigh')}</Typography>
              <Typography variant="h2" style={{ marginTop: 4 }}>
                {latestThigh ? `${latestThigh} cm` : '--'}
              </Typography>
            </View>
          </View>
        </Card>

        {/* 3. Calories & Activity History */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Flame color={colors.nutrition} size={20} />
              <Typography variant="h3" style={{ marginLeft: 8 }}>
                {t('nutrition.title')} • {t('activity.title')}
              </Typography>
            </View>
          </View>
          <Typography variant="bodyMedium" color={colors.subtext} style={{ marginTop: 4 }}>
            {t('nutrition.recentMeals')}: {meals.length} · {t('activity.recentWorkouts')}: {activities.length}
          </Typography>
        </Card>

        {/* 4. Sleep, Readiness & Cycle History */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 }}>
              <CalendarIcon color={colors.activity} size={20} />
              <Typography variant="h3" style={{ marginLeft: 8, flexShrink: 1 }} numberOfLines={1}>
                {t('cycle.cycleHistory')}
              </Typography>
            </View>
            <Pressable onPress={() => router.push('/cycle')} style={{ padding: 6, backgroundColor: colors.surface, borderRadius: 8 }}>
              <ChevronRight color={colors.activity} size={20} />
            </Pressable>
          </View>
          <Typography variant="bodyMedium" color={colors.subtext} style={{ marginTop: 4 }}>
            {t('cycle.title')}: {periods.length}
          </Typography>
        </Card>

        {/* Native Ad Card */}
        
      </ScreenContainer>

      {/* Measurement Modal */}
      <Modal visible={measureModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setMeasureModalVisible(false)}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.bg }]}>
          <ScrollView contentContainerStyle={{ padding: SPACING.md }}>
            <Typography variant="h2" style={{ marginBottom: 16 }}>{t('progress.logMeasurement')}</Typography>
            <InputField label={t('progress.weightKg')} value={weightInput} onChangeText={setWeightInput} keyboardType="decimal-pad" placeholder={t('progress.egWeight')} />
            <InputField label={t('progress.waistCm')} value={waistInput} onChangeText={setWaistInput} keyboardType="decimal-pad" placeholder={t('progress.egWaist')} />
            <InputField label={t('progress.hipsCm')} value={hipsInput} onChangeText={setHipsInput} keyboardType="decimal-pad" placeholder={t('progress.egHips')} />
            <InputField label={t('progress.chestCm')} value={chestInput} onChangeText={setChestInput} keyboardType="decimal-pad" placeholder={t('progress.egChest')} />
            <InputField label={t('progress.thighCm')} value={thighInput} onChangeText={setThighInput} keyboardType="decimal-pad" placeholder={t('progress.egThigh')} />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <Button title={t('common.cancel')} variant="outline" onPress={() => setMeasureModalVisible(false)} style={{ flex: 1 }} />
              <Button title={t('progress.saveMeasurements')} variant="primary" onPress={handleSaveMeasurements} style={{ flex: 1 }} />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 140,
    gap: SPACING.md,
  },
  header: { marginBottom: SPACING.xs },
  card: { padding: SPACING.md },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  addBtn: { flexDirection: 'row', alignItems: 'center' },
  timeWindowRow: { flexDirection: 'row', gap: 8, marginBottom: SPACING.md },
  windowChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  statGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  statBox: { flex: 1, alignItems: 'center' },
  measurementsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: SPACING.sm },
  measureCard: { width: '47%', padding: SPACING.md, borderRadius: 16, alignItems: 'center' },
  modalContainer: { flex: 1 },
});
