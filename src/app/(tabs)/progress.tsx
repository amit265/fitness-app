import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { AppModal as Modal } from '../../components/AppModal';
import { Typography } from '../../components/Typography';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { InputField } from '../../components/InputField';
import { useAppStore } from '../../store/useAppStore';
import { getCycleState } from '../../domain/cycle/cycleEngine';
import { calculateBMI, getBMICategory } from '../../utils/bmiUtils';
import { getTodayStr } from '../../utils/date';
import { HistoryCard } from '../../components/progress/HistoryCard';
import { MeasurementTrendsCard, TimeWindow, MetricType } from '../../components/progress/MeasurementTrendsCard';
import { BodyMeasurementsCard } from '../../components/progress/BodyMeasurementsCard';
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
  Camera,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { t, formatDate, formatNumber } from '../../i18n';
import { useResponsive } from '../../utils/responsive';

import { ScreenContainer } from '../../components/ScreenContainer';

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
  const updateUserProfile = useAppStore((state) => state.updateUserProfile);
  const progressPhotos = useAppStore((state) => state.progressPhotos);
  const addProgressPhoto = useAppStore((state) => state.addProgressPhoto);
  const deleteProgressPhoto = useAppStore((state) => state.deleteProgressPhoto);

  // Weekly Reminder Logic
  useEffect(() => {
    if (!userProfile) return;
    
    const today = new Date(getTodayStr());
    const lastPromptStr = userProfile.lastMeasurementPromptDate;
    
    let shouldPrompt = false;
    if (!lastPromptStr) {
      shouldPrompt = true;
    } else {
      const lastPromptDate = new Date(lastPromptStr);
      const diffTime = Math.abs(today.getTime() - lastPromptDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      if (diffDays >= 7) {
        shouldPrompt = true;
      }
    }

    if (shouldPrompt) {
      useAppStore.getState().showAlert(
        t('progress.weeklyReminderTitle', { defaultValue: 'Weekly Check-in!' }),
        t('progress.weeklyReminderBody', { defaultValue: "It's time to log your latest body measurements to keep your progress on track. Want to do it now?" }),
        [
          {
            text: t('common.cancel', { defaultValue: 'Not Now' }),
            style: 'cancel',
            onPress: () => {
              useAppStore.getState().showAlert(
                t('progress.reminderWarningTitle', { defaultValue: 'Are you sure?' }),
                t('progress.reminderWarningBody', { defaultValue: 'Tracking measurements consistently is the best way to see real progress. We will remind you again next week.' }),
              );
              updateUserProfile({ lastMeasurementPromptDate: getTodayStr() });
            }
          },
          {
            text: t('common.yes', { defaultValue: 'Yes, Let\'s Go' }),
            onPress: () => {
              setMeasureModalVisible(true);
              updateUserProfile({ lastMeasurementPromptDate: getTodayStr() });
            }
          }
        ]
      );
    }
  }, [userProfile?.lastMeasurementPromptDate]);

  // States
  const [timeWindow, setTimeWindow] = useState<TimeWindow>(30);
  const [measureModalVisible, setMeasureModalVisible] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('weight');

  // Manual Measurement Form State
  const [weightInput, setWeightInput] = useState('');
  const [waistInput, setWaistInput] = useState('');
  const [hipsInput, setHipsInput] = useState('');
  const [chestInput, setChestInput] = useState('');
  const [thighInput, setThighInput] = useState('');

  const latestWeight = measurements[0]?.weight ?? null;

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

  const handleOpenMeasureModal = () => {
    setWeightInput(latestWeight ? latestWeight.toString() : '');
    setWaistInput(latestWaist ? latestWaist.toString() : '');
    setHipsInput(latestHips ? latestHips.toString() : '');
    setChestInput(latestChest ? latestChest.toString() : '');
    setThighInput(latestThigh ? latestThigh.toString() : '');
    setMeasureModalVisible(true);
  };

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

  const handleAddPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const sourceUri = result.assets[0].uri;
        const filename = sourceUri.split('/').pop() || `photo_${Date.now()}.jpg`;
        const destUri = `${FileSystem.documentDirectory}${filename}`;
        
        await FileSystem.copyAsync({
          from: sourceUri,
          to: destUri,
        });

        addProgressPhoto(destUri, getTodayStr());
      }
    } catch (error) {
      console.log('Error adding photo:', error);
      Alert.alert('Error', 'Failed to save progress photo.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScreenContainer contentStyle={styles.scrollContent}>

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
        <MeasurementTrendsCard
          measurements={measurements}
          bmiCategoryTranslated={bmiCategoryTranslated}
          timeWindow={timeWindow}
          setTimeWindow={setTimeWindow}
          selectedMetric={selectedMetric}
          setSelectedMetric={setSelectedMetric}
        />

        {/* 2. Body Measurements Card */}
        <BodyMeasurementsCard
          latestWaist={latestWaist}
          latestHips={latestHips}
          latestChest={latestChest}
          latestThigh={latestThigh}
          onEdit={handleOpenMeasureModal}
        />

        {/* 3. Progress Photos History */}
        <HistoryCard
          icon={<Camera color={colors.primary} size={20} />}
          title="Progress Photos"
          subtext={`Recent uploads: ${progressPhotos?.length || 0}`}
          onPress={() => router.push('/progress-photos')}
        />

        {/* 4. Calories & Activity History */}
        <HistoryCard
          icon={<Flame color={colors.nutrition} size={20} />}
          title={`${t('nutrition.title')} • ${t('activity.title')}`}
          subtext={`${t('nutrition.recentMeals')}: ${meals.length} · ${t('activity.recentWorkouts')}: ${activities.length}`}
        />

        {/* 5. Sleep, Readiness & Cycle History */}
        <HistoryCard
          icon={<CalendarIcon color={colors.activity} size={20} />}
          title={t('cycle.cycleHistory')}
          subtext={`${t('cycle.title')}: ${periods.length}`}
          onPress={() => router.push('/cycle')}
          chevronColor={colors.activity}
        />

        {/* Native Ad Card */}
        
      </ScreenContainer>

      {/* Measurement Modal */}
      <Modal visible={measureModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setMeasureModalVisible(false)}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.bg }]}>
          <ScrollView contentContainerStyle={{ padding: SPACING.md }}>
            <Typography variant="h2" style={{ marginBottom: 16 }}>{t('progress.logMeasurement')}</Typography>
            <InputField label={t('progress.weightKg')} value={weightInput} onChangeText={setWeightInput} keyboardType="decimal-pad" placeholder="e.g. 65" />
            <InputField label={t('progress.waistCm')} value={waistInput} onChangeText={setWaistInput} keyboardType="decimal-pad" placeholder="e.g. 75" />
            <InputField label={t('progress.hipsCm')} value={hipsInput} onChangeText={setHipsInput} keyboardType="decimal-pad" placeholder="e.g. 95" />
            <InputField label={t('progress.chestCm')} value={chestInput} onChangeText={setChestInput} keyboardType="decimal-pad" placeholder="e.g. 90" />
            <InputField label={t('progress.thighCm')} value={thighInput} onChangeText={setThighInput} keyboardType="decimal-pad" placeholder="e.g. 50" />
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
  modalContainer: { flex: 1 },
});
