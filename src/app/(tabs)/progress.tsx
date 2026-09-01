import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
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
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

type TimeWindow = 7 | 30 | 90;

export default function ProgressScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();

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
  const bmiCategory = getBMICategory(bmiScore);

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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Typography variant="h1" style={{ fontFamily: 'Outfit-Bold' }}>See how you're changing</Typography>
          <Typography variant="bodyMedium" color={colors.subtext}>
            Weight, body measurements, calories & physical rhythms
          </Typography>
        </View>

        {/* 1. Weight Trends Card */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Scale color={PALETTE.plum.default} size={20} />
              <Typography variant="h3" style={{ fontFamily: 'Outfit-Bold', marginLeft: 8 }}>
                Weight Progress
              </Typography>
            </View>
            <Pressable onPress={() => setMeasureModalVisible(true)} style={styles.addBtn}>
              <Plus size={16} color={PALETTE.plum.default} />
              <Typography variant="caption" color={PALETTE.plum.default} style={{ fontFamily: 'Outfit-Bold', marginLeft: 4 }}>
                Log Weight
              </Typography>
            </Pressable>
          </View>

          {/* Time Window Chips */}
          <View style={styles.timeWindowRow}>
            {[7, 30, 90].map((days) => (
              <Pressable
                key={days}
                style={[
                  styles.windowChip,
                  timeWindow === days && { backgroundColor: PALETTE.plum.default },
                ]}
                onPress={() => setTimeWindow(days as TimeWindow)}
              >
                <Typography variant="caption" color={timeWindow === days ? PALETTE.oat.default : colors.text}>
                  {days} Days
                </Typography>
              </Pressable>
            ))}
          </View>

          {/* Summary Stat Grid */}
          <View style={styles.statGrid}>
            <View style={styles.statBox}>
              <Typography variant="caption" color={colors.subtext}>Current Weight</Typography>
              <Typography variant="h2" style={{ fontFamily: 'Outfit-Bold' }}>
                {latestWeight ? `${latestWeight} kg` : '--'}
              </Typography>
            </View>
            <View style={styles.statBox}>
              <Typography variant="caption" color={colors.subtext}>Overall Change</Typography>
              <Typography variant="h2" color={weightChange && weightChange <= 0 ? PALETTE.sage.default : PALETTE.terracotta.default} style={{ fontFamily: 'Outfit-Bold' }}>
                {weightChange !== null ? `${weightChange > 0 ? '+' : ''}${weightChange} kg` : '--'}
              </Typography>
            </View>
            <View style={styles.statBox}>
              <Typography variant="caption" color={colors.subtext}>BMI Category</Typography>
              <Typography variant="h3" color={PALETTE.plum.default} style={{ fontFamily: 'Outfit-Bold', textTransform: 'capitalize' }}>
                {bmiCategory || '--'}
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
              <Ruler color={PALETTE.rose.default} size={20} />
              <Typography variant="h3" style={{ fontFamily: 'Outfit-Bold', marginLeft: 8 }}>
                Body Measurements (cm)
              </Typography>
            </View>
            <Pressable onPress={() => setMeasureModalVisible(true)}>
              <Typography variant="caption" color={PALETTE.rose.default} style={{ fontFamily: 'Outfit-Bold' }}>
                + Update
              </Typography>
            </Pressable>
          </View>

          <View style={styles.measurementsGrid}>
            <View style={[styles.measureCard, { backgroundColor: isDark ? PALETTE.darkCard : PALETTE.oat.bg }]}>
              <Typography variant="caption" color={colors.subtext}>Waist</Typography>
              <Typography variant="h2" style={{ fontFamily: 'Outfit-Bold', marginTop: 4 }}>
                {latestWaist ? `${latestWaist} cm` : '--'}
              </Typography>
            </View>
            <View style={[styles.measureCard, { backgroundColor: isDark ? PALETTE.darkCard : PALETTE.oat.bg }]}>
              <Typography variant="caption" color={colors.subtext}>Hips</Typography>
              <Typography variant="h2" style={{ fontFamily: 'Outfit-Bold', marginTop: 4 }}>
                {latestHips ? `${latestHips} cm` : '--'}
              </Typography>
            </View>
            <View style={[styles.measureCard, { backgroundColor: isDark ? PALETTE.darkCard : PALETTE.oat.bg }]}>
              <Typography variant="caption" color={colors.subtext}>Chest</Typography>
              <Typography variant="h2" style={{ fontFamily: 'Outfit-Bold', marginTop: 4 }}>
                {latestChest ? `${latestChest} cm` : '--'}
              </Typography>
            </View>
            <View style={[styles.measureCard, { backgroundColor: isDark ? PALETTE.darkCard : PALETTE.oat.bg }]}>
              <Typography variant="caption" color={colors.subtext}>Thigh</Typography>
              <Typography variant="h2" style={{ fontFamily: 'Outfit-Bold', marginTop: 4 }}>
                {latestThigh ? `${latestThigh} cm` : '--'}
              </Typography>
            </View>
          </View>
        </Card>

        {/* 3. Calories & Activity History */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Flame color={PALETTE.terracotta.default} size={20} />
              <Typography variant="h3" style={{ fontFamily: 'Outfit-Bold', marginLeft: 8 }}>
                Nutrition & Activity Summary
              </Typography>
            </View>
          </View>
          <Typography variant="bodyMedium" color={colors.subtext} style={{ marginTop: 4 }}>
            Total Logged Meals: {meals.length} · Workouts: {activities.length}
          </Typography>
        </Card>

        {/* 4. Sleep, Readiness & Cycle History */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CalendarIcon color={PALETTE.sage.default} size={20} />
              <Typography variant="h3" style={{ fontFamily: 'Outfit-Bold', marginLeft: 8 }}>
                Cycle & Recovery History
              </Typography>
            </View>
            <Pressable onPress={() => router.push('/cycle')}>
              <Typography variant="caption" color={PALETTE.sage.default} style={{ fontFamily: 'Outfit-Bold' }}>
                Full Calendar →
              </Typography>
            </Pressable>
          </View>
          <Typography variant="bodyMedium" color={colors.subtext} style={{ marginTop: 4 }}>
            Recorded Period Cycles: {periods.length} · Check-Ins: {Object.keys(dailyCheckIns).length}
          </Typography>
        </Card>

      </ScrollView>

      {/* Measurement Modal */}
      <Modal visible={measureModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setMeasureModalVisible(false)}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.bg }]}>
          <ScrollView contentContainerStyle={{ padding: SPACING.md }}>
            <Typography variant="h2" style={{ marginBottom: 16 }}>Log Weight & Body Measurements</Typography>
            <InputField label="Weight (kg)" value={weightInput} onChangeText={setWeightInput} keyboardType="decimal-pad" placeholder="e.g. 63.0" />
            <InputField label="Waist (cm)" value={waistInput} onChangeText={setWaistInput} keyboardType="decimal-pad" placeholder="e.g. 70" />
            <InputField label="Hips (cm)" value={hipsInput} onChangeText={setHipsInput} keyboardType="decimal-pad" placeholder="e.g. 95" />
            <InputField label="Chest (cm)" value={chestInput} onChangeText={setChestInput} keyboardType="decimal-pad" placeholder="e.g. 88" />
            <InputField label="Thigh (cm)" value={thighInput} onChangeText={setThighInput} keyboardType="decimal-pad" placeholder="e.g. 54" />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <Button title="Cancel" variant="outline" onPress={() => setMeasureModalVisible(false)} style={{ flex: 1 }} />
              <Button title="Save Measurements" variant="primary" onPress={handleSaveMeasurements} style={{ flex: 1 }} />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: SPACING.md, gap: SPACING.md },
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
