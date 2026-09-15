import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Pressable, Keyboard, Platform, KeyboardAvoidingView, ActivityIndicator,  } from 'react-native';
import { useRouter } from 'expo-router';
import { AppModal as Modal } from '../components/AppModal';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { InputField } from '../components/InputField';
import { useAppStore } from '../store/useAppStore';
import { parseUserInput } from '../services/ai/aiService';
import { lookupFood } from '../services/nutrition/nutritionService';
import { ParsedLogResult } from '../services/ai/regexParser';
import { getTodayStr } from '../utils/date';
import { PALETTE, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../context/ThemeContext';
import {
  Sparkles,
  Utensils,
  Flame,
  Scale,
  Plus,
  Send,
  Trash2,
  CheckCircle2,
  Activity as ActivityIcon,
  X,
} from 'lucide-react-native';
import { t, formatNumber } from '../i18n';
import { Alert } from '../utils/alertUtils';

import { useResponsive } from '../utils/responsive';

import { ScreenContainer } from '../components/ScreenContainer';
export default function LogScreen() {
  const { colors, isDark } = useAppTheme();
  const uiLanguage = useAppStore((state) => state.uiLanguage);
  const router = useRouter();

  // Store bindings
  const userProfile = useAppStore((state) => state.userProfile);
  const measurements = useAppStore((state) => state.measurements);
  const meals = useAppStore((state) => state.meals);
  const activities = useAppStore((state) => state.activities);
  const addMeal = useAppStore((state) => state.addMeal);
  const deleteMeal = useAppStore((state) => state.deleteMeal);
  const addActivity = useAppStore((state) => state.addActivity);
  const deleteActivity = useAppStore((state) => state.deleteActivity);
  const addMeasurement = useAppStore((state) => state.addMeasurement);
  const deleteMeasurement = useAppStore((state) => state.deleteMeasurement);

  const todayStr = getTodayStr();
  const todayMeals = meals.filter((m) => m.timestamp.split('T')[0] === todayStr);
  const todayActivities = activities.filter((a) => a.timestamp.split('T')[0] === todayStr);
  const todayMeasurements = measurements.filter((m) => m.date === todayStr);

  // TextInput & Loading state
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  // Drafts state
  const [draftLogs, setDraftLogs] = useState<ParsedLogResult[]>([]);
  const [draftError, setDraftError] = useState<string | null>(null);

  // Manual input modal states
  const [mealModalVisible, setMealModalVisible] = useState(false);
  const [workoutModalVisible, setWorkoutModalVisible] = useState(false);
  const [weightModalVisible, setWeightModalVisible] = useState(false);

  // Manual Form States
  const [manualMealName, setManualMealName] = useState('');
  const [manualMealCal, setManualMealCal] = useState('');
  const [manualMealProt, setManualMealProt] = useState('');
  const [manualMealCarb, setManualMealCarb] = useState('');
  const [manualMealFat, setManualMealFat] = useState('');

  const [manualWorkType, setManualWorkType] = useState<any>('strength');
  const [manualWorkDur, setManualWorkDur] = useState('');
  const [manualWorkInt, setManualWorkInt] = useState<any>('moderate');
  const [manualWorkCal, setManualWorkCal] = useState('');

  const [manualWeight, setManualWeight] = useState('');

  // Submit Text Input Parsing
  const handleParseInput = async () => {
    if (!inputText.trim()) return;
    Keyboard.dismiss();
    setLoading(true);
    setDraftLogs([]);
    setDraftError(null);

    try {
      const results = await parseUserInput(inputText, userProfile?.groqApiKey);
      const validResults = results.filter((item) => item.type !== 'unknown');
      if (validResults.length === 0) {
        setDraftError(t('log.parseError'));
      } else {
        setDraftLogs(validResults);
      }
    } catch (e) {
      setDraftError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const saveItemToStore = (item: ParsedLogResult) => {
    if (item.type === 'meal') {
      addMeal({
        name: item.payload.name || 'Meal',
        calories: Number(item.payload.calories) || 0,
        protein: Number(item.payload.protein) || 0,
        carbs: Number(item.payload.carbs) || 0,
        fat: Number(item.payload.fat) || 0,
      });
    } else if (item.type === 'activity') {
      addActivity({
        type: item.payload.type || 'other',
        durationMinutes: Number(item.payload.durationMinutes) || 30,
        intensity: item.payload.intensity || 'moderate',
        caloriesBurned: Number(item.payload.caloriesBurned) || 0,
        notes: item.payload.notes,
      });
    } else if (item.type === 'weight') {
      addMeasurement({
        weight: Number(item.payload.weight),
      });
    }
  };

  const handleConfirmAllDrafts = () => {
    if (draftLogs.length === 0) return;
    draftLogs.forEach((item) => saveItemToStore(item));
    Alert.alert(t('log.loggedSuccess'), t('log.addedItems', { count: draftLogs.length }));
    setDraftLogs([]);
    setInputText('');
  };

  const handleRemoveDraftIndex = (index: number) => {
    setDraftLogs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMealNameChange = (text: string) => {
    setManualMealName(text);
    if (text.length > 2) {
      const match = lookupFood(text);
      if (match) {
        setManualMealCal(match.calories.toString());
        setManualMealProt(match.protein.toString());
        setManualMealCarb(match.carbs.toString());
        setManualMealFat(match.fat.toString());
      }
    }
  };

  const handleManualMealSubmit = () => {
    if (!manualMealName.trim()) {
      Alert.alert(t('common.error'), t('log.missingName'));
      return;
    }
    addMeal({
      name: manualMealName.trim(),
      calories: parseFloat(manualMealCal) || 0,
      protein: parseFloat(manualMealProt) || 0,
      carbs: parseFloat(manualMealCarb) || 0,
      fat: parseFloat(manualMealFat) || 0,
      source: 'database',
    });
    Alert.alert(t('log.mealLogged'), t('log.mealSaved', { name: manualMealName.trim() }));
    setManualMealName('');
    setManualMealCal('');
    setManualMealProt('');
    setManualMealCarb('');
    setManualMealFat('');
    setMealModalVisible(false);
  };

  const handleManualWorkoutSubmit = () => {
    if (!manualWorkDur || isNaN(Number(manualWorkDur))) {
      Alert.alert(t('common.error'), t('log.missingDuration'));
      return;
    }
    const dur = parseInt(manualWorkDur) || 30;
    const cal = manualWorkCal ? parseFloat(manualWorkCal) : dur * (manualWorkType === 'strength' ? 6 : 8);

    addActivity({
      type: manualWorkType,
      durationMinutes: dur,
      intensity: manualWorkInt,
      caloriesBurned: cal,
      notes: 'Manual log',
    });
    Alert.alert(t('log.workoutLogged'), t('log.workoutSaved', { type: manualWorkType.toUpperCase() }));
    setManualWorkDur('');
    setManualWorkCal('');
    setWorkoutModalVisible(false);
  };

  const handleManualWeightSubmit = () => {
    if (!manualWeight || isNaN(Number(manualWeight))) {
      Alert.alert(t('common.error'), t('log.missingWeight'));
      return;
    }
    addMeasurement({
      weight: parseFloat(manualWeight),
    });
    Alert.alert(t('log.weightLogged'), t('log.weightSaved', { weight: manualWeight }));
    setManualWeight('');
    setWeightModalVisible(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScreenContainer contentStyle={styles.scrollContent}>

          {/* Header */}
          <View style={[styles.header, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }]}>
            <View>
              <Typography variant="h1" >{t('log.title')}</Typography>
              <Typography variant="bodyMedium" color={colors.subtext}>
                {t('log.subtitle')}
              </Typography>
            </View>
            <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
              <X size={24} color={colors.textPrimary} />
            </Pressable>
          </View>

          {/* Natural Language Input Card */}
          <Card style={styles.aiInputCard}>
            <View style={styles.aiHeaderRow}>
              <Sparkles color={colors.primary} size={20} />
              <Typography variant="h3" style={{ marginLeft: 8 }}>
                {t('log.tellSini')}
              </Typography>
            </View>

            <View style={styles.inputBoxRow}>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder={t('log.aiPlaceholder')}
                placeholderTextColor={colors.subtext}
                style={[
                  styles.nlpInput,
                  { borderColor: colors.border, color: colors.text, backgroundColor: colors.bg },
                ]}
                onSubmitEditing={handleParseInput}
                returnKeyType="send"
              />
              <Pressable
                onPress={handleParseInput}
                disabled={loading || !inputText.trim()}
                style={[
                  styles.sendBtn,
                  { backgroundColor: inputText.trim() ? colors.primary : colors.border },
                ]}
              >
                {loading ? <ActivityIndicator size="small" color={colors.primaryText} /> : <Send color={colors.primaryText} size={18} />}
              </Pressable>
            </View>

            <Typography variant="caption" color={colors.subtext} style={{ marginTop: 8 }}>
              {t('log.hint')}
            </Typography>
          </Card>

          {/* Optimistic "Analyzing…" pill — shows immediately on Log tap */}
          {loading && (
            <View
              style={[
                styles.analyzingPill,
                { backgroundColor: colors.primary + '22', borderColor: colors.primary + '55' },
              ]}
            >
              <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />
              <Typography variant="bodySmall" color={colors.primary}>
                {t('log.analyzing')}
              </Typography>
            </View>
          )}

          {/* Draft Results Preview */}
          {draftLogs.length > 0 && (
            <Card style={[styles.draftsCard, { borderColor: colors.primary }]}>
              <Typography variant="h3" style={{ marginBottom: 12 }}>{t('log.parsedDrafts', { count: draftLogs.length })}</Typography>
              {draftLogs.map((item, idx) => (
                <View key={idx} style={styles.draftItemRow}>
                  <View style={{ flex: 1 }}>
                    <Typography variant="bodyMedium" >
                      {item.type === 'meal' ? `🥗 ${item.payload.name}` : item.type === 'activity' ? `🏃 ${item.payload.type}` : `⚖️ ${item.payload.weight} kg`}
                    </Typography>
                    <Typography variant="caption" color={colors.subtext}>
                      {item.type === 'meal'
                        ? `${item.payload.calories} kcal • P:${item.payload.protein}g C:${item.payload.carbs}g F:${item.payload.fat}g`
                        : item.type === 'activity'
                        ? `${item.payload.durationMinutes}m • ~${item.payload.caloriesBurned} kcal`
                        : t('log.weightMeasurement')}
                    </Typography>
                  </View>
                  <Pressable onPress={() => handleRemoveDraftIndex(idx)} style={{ padding: 4 }}>
                    <Trash2 color={colors.error} size={18} />
                  </Pressable>
                </View>
              ))}
              <Button title={t('log.confirmAllSave')} variant="primary" onPress={handleConfirmAllDrafts} style={{ marginTop: 12 }} />
            </Card>
          )}

          {draftError && (
            <Typography variant="bodySmall" color={colors.error} style={{ textAlign: 'center' }}>
              {draftError}
            </Typography>
          )}

          {/* Manual Input Shortcut Buttons */}
          <Typography variant="h3" style={{ marginTop: SPACING.md }}>{t('log.manualQuickLogging')}</Typography>
          <View style={styles.quickButtonsGrid}>
            <Pressable
              style={[styles.quickBtnCard, { backgroundColor: colors.surface, borderColor: colors.nutrition }]}
              onPress={() => setMealModalVisible(true)}
            >
              <Utensils color={colors.nutrition} size={22} />
              <Typography variant="caption" color={colors.nutrition} style={{ marginTop: 6, textAlign: 'center' }}>
                {t('log.addFood')}
              </Typography>
            </Pressable>

            <Pressable
              style={[styles.quickBtnCard, { backgroundColor: colors.surface, borderColor: colors.activity }]}
              onPress={() => setWorkoutModalVisible(true)}
            >
              <Flame color={colors.activity} size={22} />
              <Typography variant="caption" color={colors.activity} style={{ marginTop: 6, textAlign: 'center' }}>
                {t('log.addWorkout')}
              </Typography>
            </Pressable>

            <Pressable
              style={[styles.quickBtnCard, { backgroundColor: colors.surface, borderColor: colors.period }]}
              onPress={() => setWeightModalVisible(true)}
            >
              <Scale color={colors.period} size={22} />
              <Typography variant="caption" color={colors.period} style={{ marginTop: 6, textAlign: 'center' }}>
                {t('log.addWeight')}
              </Typography>
            </Pressable>
          </View>

          {/* Today's Logged Items */}
          <Typography variant="h3" style={{ marginTop: SPACING.lg }}>{t('log.todaysEntries', { count: todayMeals.length + todayActivities.length })}</Typography>

          {todayMeals.map((meal) => (
            <Card key={meal.id} style={styles.entryCard}>
              <View style={styles.entryHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Typography variant="bodyLarge" >{meal.name}</Typography>
                  <Typography variant="caption" color={colors.nutrition} >
                    {meal.calories} kcal • P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                  </Typography>
                </View>
                <Pressable onPress={() => Alert.alert('Delete', 'Are you sure you want to delete this log?', [{ text: t('common.cancel'), style: 'cancel' }, { text: t('common.delete'), style: 'destructive', onPress: () => deleteMeal(meal.id) }])} style={{ padding: 4 }}>
                  <Trash2 color={colors.subtext} size={18} />
                </Pressable>
              </View>
            </Card>
          ))}

          {todayActivities.map((act) => (
            <Card key={act.id} style={styles.entryCard}>
              <View style={styles.entryHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Typography variant="bodyLarge" style={{ textTransform: 'capitalize' }}>
                    {act.type} ({act.durationMinutes} min)
                  </Typography>
                  <Typography variant="caption" color={colors.activity} >
                    ~{act.caloriesBurned} kcal burned • {act.intensity} intensity
                  </Typography>
                </View>
                <Pressable onPress={() => Alert.alert('Delete', 'Are you sure you want to delete this log?', [{ text: t('common.cancel'), style: 'cancel' }, { text: t('common.delete'), style: 'destructive', onPress: () => deleteActivity(act.id) }])} style={{ padding: 4 }}>
                  <Trash2 color={colors.subtext} size={18} />
                </Pressable>
              </View>
            </Card>
          ))}

          {/* BannerAdComponent removed per spec section 13 & 14 */}

        </ScreenContainer>
      </KeyboardAvoidingView>

      {/* Meal Manual Modal */}
      <Modal visible={mealModalVisible} animationType="slide" transparent={true} onRequestClose={() => setMealModalVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <KeyboardAvoidingView behavior="padding" style={{ maxHeight: '90%', backgroundColor: colors.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28 }}>
            {/* Drag Handle */}
            <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
            </View>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm }}>
              <Typography variant="h2" color={colors.textPrimary}>{t('log.logMealHeader')}</Typography>
              <Pressable onPress={() => setMealModalVisible(false)} style={{ padding: 6, borderRadius: 20, backgroundColor: colors.surface }}>
                <X size={18} color={colors.subtext} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={{ paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl }}>
              <InputField label={t('nutrition.mealName')} value={manualMealName} onChangeText={handleMealNameChange} placeholder={t('log.mealPlaceholder')} />
              <InputField label={t('nutrition.calories')} value={manualMealCal} onChangeText={setManualMealCal} keyboardType="numeric" placeholder={t('log.caloriesPlaceholder')} />
              <InputField label={t('nutrition.protein')} value={manualMealProt} onChangeText={setManualMealProt} keyboardType="numeric" placeholder="18" />
              <InputField label={t('nutrition.carbs')} value={manualMealCarb} onChangeText={setManualMealCarb} keyboardType="numeric" placeholder="30" />
              <InputField label={t('nutrition.fat')} value={manualMealFat} onChangeText={setManualMealFat} keyboardType="numeric" placeholder="12" />
              <View style={{ flexDirection: 'row', gap: 12, marginTop: SPACING.lg }}>
                <Button title={t('common.cancel')} variant="outline" onPress={() => setMealModalVisible(false)} style={{ flex: 1 }} />
                <Button title={t('common.save')} variant="nutrition" onPress={handleManualMealSubmit} style={{ flex: 1 }} />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Workout Manual Modal */}
      <Modal visible={workoutModalVisible} animationType="slide" transparent={true} onRequestClose={() => setWorkoutModalVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <KeyboardAvoidingView behavior="padding" style={{ maxHeight: '90%', backgroundColor: colors.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28 }}>
            {/* Drag Handle */}
            <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
            </View>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm }}>
              <Typography variant="h2" color={colors.textPrimary}>{t('log.logActivityHeader')}</Typography>
              <Pressable onPress={() => setWorkoutModalVisible(false)} style={{ padding: 6, borderRadius: 20, backgroundColor: colors.surface }}>
                <X size={18} color={colors.subtext} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={{ paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl }}>
              <InputField label={t('activity.duration')} value={manualWorkDur} onChangeText={setManualWorkDur} keyboardType="numeric" placeholder={t('log.durationPlaceholder')} />
              <InputField label={t('activity.caloriesBurned')} value={manualWorkCal} onChangeText={setManualWorkCal} keyboardType="numeric" placeholder={t('log.caloriesPlaceholder')} />
              <View style={{ flexDirection: 'row', gap: 12, marginTop: SPACING.lg }}>
                <Button title={t('common.cancel')} variant="outline" onPress={() => setWorkoutModalVisible(false)} style={{ flex: 1 }} />
                <Button title={t('common.save')} variant="positive" onPress={handleManualWorkoutSubmit} style={{ flex: 1 }} />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Weight Manual Modal */}
      <Modal visible={weightModalVisible} animationType="slide" transparent={true} onRequestClose={() => setWeightModalVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <KeyboardAvoidingView behavior="padding" style={{ maxHeight: '90%', backgroundColor: colors.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28 }}>
            {/* Drag Handle */}
            <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
            </View>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm }}>
              <Typography variant="h2" color={colors.textPrimary}>{t('log.logWeightHeader')}</Typography>
              <Pressable onPress={() => setWeightModalVisible(false)} style={{ padding: 6, borderRadius: 20, backgroundColor: colors.surface }}>
                <X size={18} color={colors.subtext} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={{ paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl }}>
              <InputField label={t('progress.currentWeight')} value={manualWeight} onChangeText={setManualWeight} keyboardType="decimal-pad" placeholder={t('log.weightPlaceholder')} />
              <View style={{ flexDirection: 'row', gap: 12, marginTop: SPACING.lg }}>
                <Button title={t('common.cancel')} variant="outline" onPress={() => setWeightModalVisible(false)} style={{ flex: 1 }} />
                <Button title={t('common.save')} variant="primary" onPress={handleManualWeightSubmit} style={{ flex: 1 }} />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
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
  aiInputCard: { padding: SPACING.md },
  aiHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  inputBoxRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  nlpInput: { flex: 1, height: 46, borderWidth: 1, borderRadius: 23, paddingHorizontal: SPACING.md, fontSize: 13, },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  draftsCard: { padding: SPACING.md, borderWidth: 1 },
  draftItemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
  analyzingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1,
    marginVertical: 4,
  },
  quickButtonsGrid: { flexDirection: 'row', gap: 10, marginTop: SPACING.sm },
  quickBtnCard: { flex: 1, padding: SPACING.md, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  entryCard: { padding: SPACING.md },
  entryHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalContainer: { flex: 1 },
});
