import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  useColorScheme,
  ScrollView,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { Typography } from '../../components/Typography';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { InputField } from '../../components/InputField';
import { LineChart } from '../../components/LineChart';
import { useAppStore } from '../../store/useAppStore';
import { getCycleState } from '../../domain/cycle/cycleEngine';
import { calculateReadinessScore } from '../../domain/readiness/readinessEngine';
import { getWeightTrend } from '../../utils/trends';
import { calculateBMI, getBMICategory } from '../../utils/bmiUtils';
import { calculateDailyCalorieTarget } from '../../domain/calories/calorieEngine';
import { diffInDays, getTodayStr } from '../../utils/date';
import { PALETTE, SPACING } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Info,
  Scale,
  Ruler,
  Sparkles,
  Moon,
  Droplet,
  Flame,
  Activity as ActivityIcon,
  Heart,
  TrendingUp,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

type TimeWindow = 7 | 30 | 90;
type MeasureKey = 'waist' | 'hips' | 'chest' | 'thigh';

export default function ProgressScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
  const [selectedMeasureKey, setSelectedMeasureKey] = useState<MeasureKey>('waist');
  const [measureModalVisible, setMeasureModalVisible] = useState(false);

  // Manual Measurement Form State
  const [weightInput, setWeightInput] = useState('');
  const [waistInput, setWaistInput] = useState('');
  const [hipsInput, setHipsInput] = useState('');
  const [chestInput, setChestInput] = useState('');
  const [thighInput, setThighInput] = useState('');

  // 1. Process Weight Chart Data
  const trendData = getWeightTrend(measurements, timeWindow);

  // Correlate weight dates with cycle phases for overlay
  const cyclePhases = trendData.labels.map((_, index) => {
    const m = measurements
      .filter((item) => item.date.split('-').length === 3)
      .sort((a, b) => a.date.localeCompare(b.date))[index];
      
    if (!m) return 'unknown';
    const state = getCycleState(periods, cyclePreferences, m.date);
    return state.phase;
  });

  // Calculate statistics
  const latestWeight = measurements[0]?.weight ?? null;
  const sortedByAge = [...measurements].sort((a, b) => a.date.localeCompare(b.date));
  const baselineWeight = sortedByAge[0]?.weight ?? null;
  
  const weightChange = latestWeight !== null && baselineWeight !== null
    ? parseFloat((latestWeight - baselineWeight).toFixed(1))
    : null;

  // BMI calculations
  const currentHeight = userProfile?.height ?? 0;
  const bmiScore = latestWeight && currentHeight > 0 ? calculateBMI(latestWeight, currentHeight) : 0;
  const bmiCategory = getBMICategory(bmiScore);

  // Find baseline measurements
  const baselineChest = sortedByAge.find((m) => m.chest)?.chest ?? null;
  const baselineWaist = sortedByAge.find((m) => m.waist)?.waist ?? null;
  const baselineHips = sortedByAge.find((m) => m.hips)?.hips ?? null;
  const baselineThigh = sortedByAge.find((m) => m.thigh)?.thigh ?? null;

  // Find current measurements
  const latestChest = measurements.find((m) => m.chest)?.chest ?? null;
  const latestWaist = measurements.find((m) => m.waist)?.waist ?? null;
  const latestHips = measurements.find((m) => m.hips)?.hips ?? null;
  const latestThigh = measurements.find((m) => m.thigh)?.thigh ?? null;

  // Selected measurement values
  const getMeasurementValues = (key: MeasureKey) => {
    switch (key) {
      case 'waist': return { label: 'Waist', base: baselineWaist, curr: latestWaist };
      case 'hips': return { label: 'Hips', base: baselineHips, curr: latestHips };
      case 'chest': return { label: 'Chest', base: baselineChest, curr: latestChest };
      case 'thigh': return { label: 'Thigh', base: baselineThigh, curr: latestThigh };
    }
  };
  const activeMeasure = getMeasurementValues(selectedMeasureKey);

  // Logged habits calculations
  const checkInList = Object.values(dailyCheckIns);
  const totalSleep = checkInList.reduce((sum, item) => sum + item.sleepDuration, 0);
  const avgSleep = checkInList.length > 0 ? (totalSleep / checkInList.length).toFixed(1) : null;
  
  const totalHydration = checkInList.reduce((sum, item) => sum + item.hydration, 0);
  const avgHydration = checkInList.length > 0 ? (totalHydration / checkInList.length).toFixed(1) : null;

  // Workouts this week (past 7 days)
  const todayStr = getTodayStr();
  const weeklyWorkouts = activities.filter((act) => {
    const daysDiff = diffInDays(todayStr, act.timestamp.split('T')[0]);
    return daysDiff >= 0 && daysDiff <= 7;
  });

  // Calculate average readiness score
  const getAverageReadiness = () => {
    const scores: number[] = [];
    checkInList.forEach((c) => {
      const cDateStr = c.date;
      const cState = getCycleState(periods, cyclePreferences, cDateStr);
      const cWorkouts = activities.filter((act) => diffInDays(cDateStr, act.timestamp.split('T')[0]) === 0);
      const scoreObj = calculateReadinessScore(c, cState, cWorkouts, userProfile?.weightGoal);
      scores.push(scoreObj.score);
    });
    return scores.length > 0 ? Math.round(scores.reduce((acc, s) => acc + s, 0) / scores.length) : null;
  };
  const avgReadiness = getAverageReadiness();

  // Cycle History Statistics
  const getCycleStats = () => {
    const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
    const lengths: number[] = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const duration = diffInDays(sorted[i + 1].startDate, sorted[i].startDate);
      if (duration >= 15 && duration <= 60) {
        lengths.push(duration);
      }
    }
    const avg = lengths.length > 0 ? parseFloat((lengths.reduce((s, l) => s + l, 0) / lengths.length).toFixed(1)) : null;
    const shortest = lengths.length > 0 ? Math.min(...lengths) : null;
    const longest = lengths.length > 0 ? Math.max(...lengths) : null;
    return { avg, shortest, longest, history: lengths };
  };
  const cycleStats = getCycleStats();

  // Process measurement trend chart data
  const getMeasurementTrendData = (key: MeasureKey) => {
    const filtered = measurements
      .filter((m) => m[key] !== undefined)
      .sort((a, b) => a.date.localeCompare(b.date));
    
    const values = filtered.map((m) => m[key] as number);
    const labels = filtered.map((m) => {
      const parts = m.date.split('-');
      return parts.length === 3 ? `${parts[1]}-${parts[2]}` : m.date;
    });

    return { values, labels };
  };
  const measureChartData = getMeasurementTrendData(selectedMeasureKey);

  // Save new biometrics
  const handleSaveMeasurements = () => {
    if (!weightInput && !waistInput && !hipsInput && !chestInput && !thighInput) return;

    addMeasurement({
      weight: weightInput ? parseFloat(weightInput) : (latestWeight || 0),
      chest: chestInput ? parseFloat(chestInput) : undefined,
      waist: waistInput ? parseFloat(waistInput) : undefined,
      hips: hipsInput ? parseFloat(hipsInput) : undefined,
      thigh: thighInput ? parseFloat(thighInput) : undefined,
    });

    // Reset Form
    setWeightInput('');
    setWaistInput('');
    setHipsInput('');
    setChestInput('');
    setThighInput('');
    setMeasureModalVisible(false);
  };

  // 6. Calorie Intake Trend Calculation
  const targetCalories = calculateDailyCalorieTarget(userProfile, latestWeight);
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
  const dailyCalorieTotals = past7Days.map((dateStr) => {
    const dayMeals = meals.filter((m) => m.timestamp.split('T')[0] === dateStr);
    return dayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
  });
  const loggedCalorieDays = dailyCalorieTotals.filter((c) => c > 0);
  const avgCalorieIntake = loggedCalorieDays.length > 0
    ? Math.round(loggedCalorieDays.reduce((sum, c) => sum + c, 0) / loggedCalorieDays.length)
    : 0;

  const getChangeColor = (diff: number) => {
    if (diff < 0) return PALETTE.success;
    if (diff > 0) return '#C0392B';
    return PALETTE.charcoal.light;
  };

  const formatDiff = (diff: number) => {
    if (diff > 0) return `+${diff}`;
    return String(diff);
  };

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
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
        
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="h1">Progress</Typography>
          <Typography variant="bodyMedium" color={PALETTE.charcoal.light}>
            Health trends, BMI & wellness patterns
          </Typography>
        </View>

        {/* 1. "What Actually Matters" Summary Dashboard */}
        <Card style={styles.mattersCard}>
          <View style={styles.mattersTitleRow}>
            <Sparkles color={PALETTE.sage.default} size={20} />
            <Typography variant="h3">Your Progress Summary</Typography>
          </View>
          
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Typography variant="caption" color={PALETTE.charcoal.light}>WEIGHT</Typography>
              <Typography variant="bodyLarge" style={styles.boldText}>
                {latestWeight ? `${latestWeight} kg` : '--'}
              </Typography>
              {weightChange !== null && (
                <Typography variant="caption" color={getChangeColor(weightChange)} style={styles.summaryDiff}>
                  {formatDiff(weightChange)} kg
                </Typography>
              )}
            </View>

            <View style={styles.summaryItem}>
              <Typography variant="caption" color={PALETTE.charcoal.light}>{selectedMeasureKey.toUpperCase()}</Typography>
              <Typography variant="bodyLarge" style={styles.boldText}>
                {activeMeasure.curr ? `${activeMeasure.curr} cm` : '--'}
              </Typography>
              {activeMeasure.curr !== null && activeMeasure.base !== null && (
                <Typography variant="caption" color={getChangeColor(activeMeasure.curr - activeMeasure.base)} style={styles.summaryDiff}>
                  {formatDiff(parseFloat((activeMeasure.curr - activeMeasure.base).toFixed(1)))} cm
                </Typography>
              )}
            </View>

            <View style={styles.summaryItem}>
              <Typography variant="caption" color={PALETTE.charcoal.light}>SLEEP</Typography>
              <Typography variant="bodyLarge" style={styles.boldText}>
                {avgSleep ? `${avgSleep} hrs` : '--'}
              </Typography>
              <Typography variant="caption" color={PALETTE.charcoal.light} style={styles.summarySub}>
                average
              </Typography>
            </View>

            <View style={styles.summaryItem}>
              <Typography variant="caption" color={PALETTE.charcoal.light}>WORKOUTS</Typography>
              <Typography variant="bodyLarge" style={styles.boldText}>
                {weeklyWorkouts.length}
              </Typography>
              <Typography variant="caption" color={PALETTE.charcoal.light} style={styles.summarySub}>
                this week
              </Typography>
            </View>
          </View>
        </Card>

        {/* 2. Weight Trend Card Section */}
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleRow}>
              <Scale color={PALETTE.sage.default} size={18} />
              <Typography variant="h3">Weight Trend</Typography>
            </View>
            <Typography variant="caption" color={PALETTE.charcoal.light}>
              Solid line: weight trend • Dots: cycle phase color
            </Typography>
          </View>

          {/* Timeframe Selector */}
          <View style={[styles.segmentedControl, { backgroundColor: isDark ? '#1C1A18' : '#FAF8F5', borderColor: isDark ? '#2E2B28' : '#ECE9E4' }]}>
            {([7, 30, 90] as const).map((w) => (
              <Pressable
                key={w}
                onPress={() => setTimeWindow(w)}
                style={[styles.segmentBtn, timeWindow === w && styles.segmentBtnActive]}
              >
                <Typography variant="bodySmall" color={timeWindow === w ? PALETTE.white : undefined}>
                  {w} DAYS
                </Typography>
              </Pressable>
            ))}
          </View>
          
          <LineChart
            data={trendData.movingAverages}
            labels={trendData.labels}
            cyclePhases={cyclePhases}
          />
        </Card>

        {/* 3. Compact BMI Card Summary */}
        <Card style={[styles.bmiCard, { backgroundColor: isDark ? '#1C1A18' : '#FAF8F5', borderColor: isDark ? '#2E2B28' : '#ECE9E4' }]}>
          <View style={styles.bmiLeft}>
            <Typography variant="caption" color={PALETTE.charcoal.light}>CURRENT BMI</Typography>
            {bmiScore > 0 ? (
              <View style={styles.bmiValueRow}>
                <Typography variant="h2" style={styles.boldText}>{bmiScore.toFixed(1)}</Typography>
                <View style={styles.bmiTag}>
                  <Typography variant="caption" color={PALETTE.sage.default} style={{ fontFamily: 'Outfit-Bold' }}>
                    {bmiCategory.toUpperCase()}
                  </Typography>
                </View>
              </View>
            ) : (
              <Typography variant="bodyMedium" color={PALETTE.charcoal.light} style={{ marginTop: 2 }}>
                Add height in profile to calculate BMI.
              </Typography>
            )}
            
            {currentHeight > 0 && latestWeight && (
              <Typography variant="caption" color={PALETTE.charcoal.light} style={{ marginTop: 2 }}>
                {latestWeight} kg · {currentHeight} cm
              </Typography>
            )}
          </View>
          <Button
            title="View Details"
            variant="outline"
            onPress={() => router.push('/bmi')}
            style={styles.bmiBtn}
          />
        </Card>

        {/* Scale Anxiety Education */}
        <Card style={[styles.infoCard, { backgroundColor: isDark ? '#1C1A18' : '#FAF5EF', borderColor: isDark ? '#2E2B28' : '#E8D5C4' }]}>
          <View style={styles.infoTitleRow}>
            <Info color={PALETTE.sage.default} size={20} />
            <Typography variant="h3" style={styles.infoTitle}>Scale Fluctuations</Typography>
          </View>
          <Typography variant="bodyMedium" color={isDark ? PALETTE.cream : PALETTE.charcoal.light} style={styles.infoText}>
            Your scale weight can fluctuate by <Typography variant="bodyLarge" style={[styles.boldText, { color: isDark ? PALETTE.sage.light : PALETTE.sage.dark }]}>2 to 3 kilograms</Typography> during the Luteal and Menstrual phases due to Progesterone-induced water retention. Track the moving average trend line above instead of daily spikes.
          </Typography>
        </Card>

        {/* 4. Selectable Body Measurement Trend Chart */}
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleRow}>
              <Ruler color={PALETTE.sage.default} size={18} />
              <Typography variant="h3">Measurement Trends</Typography>
            </View>
            <Typography variant="caption" color={PALETTE.charcoal.light}>
              View change details and progress lines for specific areas
            </Typography>
          </View>

          {/* Selectable Dropdown Row */}
          <View style={[styles.segmentedControl, { backgroundColor: isDark ? '#1C1A18' : '#FAF8F5', borderColor: isDark ? '#2E2B28' : '#ECE9E4' }]}>
            {(['waist', 'hips', 'chest', 'thigh'] as const).map((key) => (
              <Pressable
                key={key}
                onPress={() => setSelectedMeasureKey(key)}
                style={[styles.segmentBtn, selectedMeasureKey === key && styles.segmentBtnActive]}
              >
                <Typography variant="bodySmall" color={selectedMeasureKey === key ? PALETTE.white : undefined}>
                  {key.toUpperCase()}
                </Typography>
              </Pressable>
            ))}
          </View>

          {measureChartData.values.length > 1 ? (
            <LineChart
              data={measureChartData.values}
              labels={measureChartData.labels}
            />
          ) : (
            <View style={styles.chartEmpty}>
              <Typography variant="bodySmall" color={PALETTE.charcoal.light} align="center">
                Not enough measurement points logged. Log waist or chest measurements over time to visualize your trend graph.
              </Typography>
            </View>
          )}

          <View style={styles.measureInfoRow}>
            <View style={styles.measureInfoBox}>
              <Typography variant="caption" color={PALETTE.charcoal.light}>BASELINE</Typography>
              <Typography variant="bodyLarge" style={styles.boldText}>
                {activeMeasure.base ? `${activeMeasure.base} cm` : '--'}
              </Typography>
            </View>
            <View style={styles.measureInfoBox}>
              <Typography variant="caption" color={PALETTE.charcoal.light}>CURRENT</Typography>
              <Typography variant="bodyLarge" style={styles.boldText}>
                {activeMeasure.curr ? `${activeMeasure.curr} cm` : '--'}
              </Typography>
            </View>
            <View style={styles.measureInfoBox}>
              <Typography variant="caption" color={PALETTE.charcoal.light}>TOTAL CHANGE</Typography>
              {activeMeasure.curr !== null && activeMeasure.base !== null ? (
                <Typography variant="bodyLarge" color={getChangeColor(activeMeasure.curr - activeMeasure.base)} style={styles.boldText}>
                  {formatDiff(parseFloat((activeMeasure.curr - activeMeasure.base).toFixed(1)))} cm
                </Typography>
              ) : (
                <Typography variant="bodyLarge">--</Typography>
              )}
            </View>
          </View>

          <Button
            title="+ Log Body Measurements"
            variant="outline"
            onPress={() => setMeasureModalVisible(true)}
            style={{ marginHorizontal: SPACING.md, marginTop: SPACING.sm }}
          />
        </Card>

        {/* 5. Health Habits Dashboard Section */}
        <Card style={styles.habitsCard}>
          <View style={styles.mattersTitleRow}>
            <TrendingUp color={PALETTE.sage.default} size={20} />
            <Typography variant="h3">Health Habits & Recovery</Typography>
          </View>

          <View style={styles.habitRow}>
            <Moon color={PALETTE.sage.default} size={20} />
            <View style={styles.habitContent}>
              <Typography variant="bodyLarge" style={styles.boldText}>Sleep Habits</Typography>
              <Typography variant="bodySmall" color={PALETTE.charcoal.light}>
                Average duration: {avgSleep ? `${avgSleep} hours` : 'No logs yet.'}
              </Typography>
            </View>
          </View>

          <View style={styles.habitRow}>
            <Droplet color={PALETTE.sage.default} size={20} />
            <View style={styles.habitContent}>
              <Typography variant="bodyLarge" style={styles.boldText}>Hydration Intake</Typography>
              <Typography variant="bodySmall" color={PALETTE.charcoal.light}>
                Average daily water: {avgHydration ? `${avgHydration} Litres` : 'No logs yet.'}
              </Typography>
            </View>
          </View>

          <View style={styles.habitRow}>
            <Heart color={PALETTE.sage.default} size={20} />
            <View style={styles.habitContent}>
              <Typography variant="bodyLarge" style={styles.boldText}>Readiness Averages</Typography>
              <Typography variant="bodySmall" color={PALETTE.charcoal.light}>
                Average recovery index: {avgReadiness ? `${avgReadiness}/100` : 'Log daily details to generate score.'}
              </Typography>
            </View>
          </View>
        </Card>

        {/* Calorie Intake & Energy Balance Section */}
        <Card style={styles.habitsCard}>
          <View style={styles.mattersTitleRow}>
            <Flame color={PALETTE.rose.default} size={20} />
            <Typography variant="h3">Calorie & Energy Balance</Typography>
          </View>

          <View style={styles.cycleStatsRow}>
            <View style={styles.cycleStatBox}>
              <Typography variant="caption" color={PALETTE.charcoal.light}>7-DAY AVG INTAKE</Typography>
              <Typography variant="h2">{avgCalorieIntake > 0 ? `${avgCalorieIntake} kcal` : '--'}</Typography>
            </View>
            <View style={styles.cycleStatBox}>
              <Typography variant="caption" color={PALETTE.charcoal.light}>DAILY TARGET</Typography>
              <Typography variant="h2">{targetCalories} kcal</Typography>
            </View>
          </View>

          <Typography variant="bodySmall" color={PALETTE.charcoal.light} style={{ marginTop: SPACING.xs, fontStyle: 'italic', lineHeight: 16 }}>
            {avgCalorieIntake > 0
              ? `Your 7-day average intake is ${avgCalorieIntake} kcal vs target of ${targetCalories} kcal. Consistency over time matters most!`
              : 'Log daily food meals to view your 7-day calorie consistency trend.'}
          </Typography>
        </Card>

        {/* 6. Cycle Length History Section */}
        <Card style={styles.cycleHistoryCard}>
          <View style={styles.mattersTitleRow}>
            <Heart color={PALETTE.rose.default} size={20} />
            <Typography variant="h3">Menstrual Cycle History</Typography>
          </View>

          <View style={styles.cycleStatsRow}>
            <View style={styles.cycleStatBox}>
              <Typography variant="caption" color={PALETTE.charcoal.light}>AVERAGE LENGTH</Typography>
              <Typography variant="h2">{cycleStats.avg ? `${cycleStats.avg} days` : '28 days'}</Typography>
            </View>
            <View style={styles.cycleStatBox}>
              <Typography variant="caption" color={PALETTE.charcoal.light}>SHORTEST</Typography>
              <Typography variant="h2">{cycleStats.shortest ? `${cycleStats.shortest} days` : '--'}</Typography>
            </View>
            <View style={styles.cycleStatBox}>
              <Typography variant="caption" color={PALETTE.charcoal.light}>LONGEST</Typography>
              <Typography variant="h2">{cycleStats.longest ? `${cycleStats.longest} days` : '--'}</Typography>
            </View>
          </View>

          {periods.length > 0 ? (
            <View style={styles.historyList}>
              <Typography variant="bodySmall" color={PALETTE.charcoal.light} style={{ marginBottom: SPACING.sm }}>
                PREVIOUS CYCLES LOGS
              </Typography>
              {periods.slice(0, 3).map((p, idx) => (
                <View key={p.id} style={styles.cycleHistoryItem}>
                  <Typography variant="bodyMedium">
                    Period started: {new Date(p.startDate + 'T00:00:00Z').toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Typography>
                  <View style={styles.flowBadge}>
                    <Typography variant="caption" color={PALETTE.rose.dark} style={{ fontFamily: 'Outfit-Bold' }}>
                      {p.flowIntensity.toUpperCase()}
                    </Typography>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Typography variant="bodySmall" color={PALETTE.charcoal.light} align="center" style={{ marginTop: SPACING.md }}>
              No logged periods yet. Set up cycle parameters inside Calendar tab.
            </Typography>
          )}
        </Card>

      </ScrollView>

      {/* Manual Measurement Modal Overlay */}
      <Modal
        visible={measureModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMeasureModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[styles.modalContent, { backgroundColor: isDark ? '#1C1A18' : PALETTE.white }]}
          >
            <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
              <Typography variant="h2" style={styles.modalTitle}>Body Progress Logs</Typography>
              
              <InputField label="Weight (kg)" value={weightInput} onChangeText={setWeightInput} keyboardType="decimal-pad" placeholder={latestWeight ? String(latestWeight) : '60.0'} />
              <InputField label="Waist (cm)" value={waistInput} onChangeText={setWaistInput} keyboardType="decimal-pad" placeholder={latestWaist ? String(latestWaist) : '70.0'} />
              <InputField label="Hips (cm)" value={hipsInput} onChangeText={setHipsInput} keyboardType="decimal-pad" placeholder={latestHips ? String(latestHips) : '95.0'} />
              <InputField label="Chest (cm)" value={chestInput} onChangeText={setChestInput} keyboardType="decimal-pad" placeholder={latestChest ? String(latestChest) : '90.0'} />
              <InputField label="Thigh (cm)" value={thighInput} onChangeText={setThighInput} keyboardType="decimal-pad" placeholder={latestThigh ? String(latestThigh) : '55.0'} />

              <View style={styles.modalActions}>
                <Button title="Cancel" variant="outline" onPress={() => setMeasureModalVisible(false)} style={styles.modalCancel} />
                <Button title="Save Logs" onPress={handleSaveMeasurements} style={styles.modalSave} />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
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
    paddingBottom: 130,
  },
  header: {
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  mattersCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  mattersTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  summaryItem: {
    width: '48%',
    backgroundColor: '#FAF8F5',
    borderColor: '#ECE9E4',
    borderWidth: 1,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    justifyContent: 'center',
  },
  summaryDiff: {
    fontFamily: 'Outfit-Bold',
    marginTop: 2,
  },
  summarySub: {
    marginTop: 2,
  },
  segmentedControl: {
    flexDirection: 'row',
    height: 40,
    backgroundColor: '#FAF8F5',
    borderWidth: 1.5,
    borderColor: '#ECE9E4',
    borderRadius: 12,
    padding: 2,
    marginBottom: SPACING.md,
    marginHorizontal: SPACING.sm,
  },
  segmentBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: PALETTE.sage.default,
  },
  chartCard: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
    marginBottom: SPACING.md,
  },
  chartHeader: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  chartTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  chartEmpty: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  measureInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1.5,
    borderTopColor: '#FAF8F5',
  },
  measureInfoBox: {
    alignItems: 'center',
  },
  bmiCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: SPACING.md,
  },
  bmiLeft: {
    flex: 1,
  },
  bmiValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  bmiTag: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    backgroundColor: PALETTE.sage.bg,
    borderRadius: 100,
  },
  bmiBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  infoCard: {
    padding: SPACING.lg,
    backgroundColor: '#FAF5EF',
    borderColor: '#E8D5C4',
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  infoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  infoTitle: {
    fontFamily: 'PlayfairDisplay-SemiBold',
  },
  infoText: {
    lineHeight: 18,
  },
  boldText: {
    fontFamily: 'Outfit-Bold',
  },
  habitsCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 0.5,
    borderBottomColor: '#FAF8F5',
  },
  habitContent: {
    flex: 1,
  },
  cycleHistoryCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  cycleStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
    marginTop: SPACING.sm,
  },
  cycleStatBox: {
    alignItems: 'center',
  },
  historyList: {
    borderTopWidth: 1.5,
    borderTopColor: '#FAF8F5',
    paddingTop: SPACING.md,
  },
  cycleHistoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: '#FAF8F5',
  },
  flowBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    backgroundColor: PALETTE.rose.bg,
    borderRadius: 100,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(42,46,43,0.4)',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: '65%',
    padding: SPACING.lg,
  },
  modalScroll: {
    paddingBottom: SPACING.xl,
  },
  modalTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    marginBottom: SPACING.md,
  },
  modalActions: {
    flexDirection: 'column',
    gap: SPACING.sm,
    marginTop: SPACING.xl,
  },
  modalCancel: {
    width: '100%',
  },
  modalSave: {
    width: '100%',
  },
});
