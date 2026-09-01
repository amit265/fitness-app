import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Keyboard,
  Modal,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Typography } from '../../components/Typography';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { InputField } from '../../components/InputField';
import { useAppStore } from '../../store/useAppStore';
import { parseUserInput } from '../../services/ai/aiService';
import { ParsedLogResult } from '../../services/ai/regexParser';
import { getTodayStr } from '../../utils/date';
import { PALETTE, SPACING } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../context/ThemeContext';
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
} from 'lucide-react-native';
import { t, formatNumber } from '../../i18n';

export default function LogScreen() {
  const { colors, isDark } = useAppTheme();

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
        setDraftError("Sini couldn't parse that sentence. Try entering details manually below!");
      } else {
        setDraftLogs(validResults);
      }
    } catch (e) {
      setDraftError('Parsing error. Try manual input.');
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
    Alert.alert('Logged Successfully', `Added ${draftLogs.length} items to Sini AI!`);
    setDraftLogs([]);
    setInputText('');
  };

  const handleRemoveDraftIndex = (index: number) => {
    setDraftLogs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleManualMealSubmit = () => {
    if (!manualMealName.trim()) {
      Alert.alert('Missing Name', 'Please enter a meal description.');
      return;
    }
    addMeal({
      name: manualMealName.trim(),
      calories: parseFloat(manualMealCal) || 0,
      protein: parseFloat(manualMealProt) || 0,
      carbs: parseFloat(manualMealCarb) || 0,
      fat: parseFloat(manualMealFat) || 0,
    });
    Alert.alert('Meal Logged', `${manualMealName.trim()} saved!`);
    setManualMealName('');
    setManualMealCal('');
    setManualMealProt('');
    setManualMealCarb('');
    setManualMealFat('');
    setMealModalVisible(false);
  };

  const handleManualWorkoutSubmit = () => {
    if (!manualWorkDur || isNaN(Number(manualWorkDur))) {
      Alert.alert('Missing Duration', 'Please enter duration in minutes.');
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
    Alert.alert('Workout Logged', `${manualWorkType.toUpperCase()} saved!`);
    setManualWorkDur('');
    setManualWorkCal('');
    setWorkoutModalVisible(false);
  };

  const handleManualWeightSubmit = () => {
    if (!manualWeight || isNaN(Number(manualWeight))) {
      Alert.alert('Missing Weight', 'Please enter weight in kg.');
      return;
    }
    addMeasurement({
      weight: parseFloat(manualWeight),
    });
    Alert.alert('Weight Logged', `${manualWeight} kg recorded!`);
    setManualWeight('');
    setWeightModalVisible(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={styles.header}>
            <Typography variant="h1" style={{ fontFamily: 'Outfit-Bold' }}>Log & Track</Typography>
            <Typography variant="bodyMedium" color={colors.subtext}>
              Natural language food, workout & body logging
            </Typography>
          </View>

          {/* Natural Language Input Card */}
          <Card style={styles.aiInputCard}>
            <View style={styles.aiHeaderRow}>
              <Sparkles color={colors.primary} size={20} />
              <Typography variant="h3" style={{ fontFamily: 'Outfit-Bold', marginLeft: 8 }}>
                Tell Sini what you ate or did
              </Typography>
            </View>

            <View style={styles.inputBoxRow}>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="e.g. Ate 2 eggs and walked 30 minutes"
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
              💡 Mention food and workouts together (e.g. "quinoa salad and 45 min yoga").
            </Typography>
          </Card>

          {/* Draft Results Preview */}
          {draftLogs.length > 0 && (
            <Card style={[styles.draftsCard, { borderColor: colors.primary }]}>
              <Typography variant="h3" style={{ marginBottom: 12 }}>Parsed Drafts ({draftLogs.length})</Typography>
              {draftLogs.map((item, idx) => (
                <View key={idx} style={styles.draftItemRow}>
                  <View style={{ flex: 1 }}>
                    <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold' }}>
                      {item.type === 'meal' ? `🥗 ${item.payload.name}` : item.type === 'activity' ? `🏃 ${item.payload.type}` : `⚖️ ${item.payload.weight} kg`}
                    </Typography>
                    <Typography variant="caption" color={colors.subtext}>
                      {item.type === 'meal'
                        ? `${item.payload.calories} kcal • P:${item.payload.protein}g C:${item.payload.carbs}g F:${item.payload.fat}g`
                        : item.type === 'activity'
                        ? `${item.payload.durationMinutes}m • ~${item.payload.caloriesBurned} kcal burned`
                        : 'Weight measurement'}
                    </Typography>
                  </View>
                  <Pressable onPress={() => handleRemoveDraftIndex(idx)} style={{ padding: 4 }}>
                    <Trash2 color={colors.error} size={18} />
                  </Pressable>
                </View>
              ))}
              <Button title="Confirm All & Save" variant="primary" onPress={handleConfirmAllDrafts} style={{ marginTop: 12 }} />
            </Card>
          )}

          {draftError && (
            <Typography variant="bodySmall" color={colors.error} style={{ textAlign: 'center' }}>
              {draftError}
            </Typography>
          )}

          {/* Manual Input Shortcut Buttons */}
          <Typography variant="h3" style={{ marginTop: SPACING.md }}>Manual Quick Logging</Typography>
          <View style={styles.quickButtonsGrid}>
            <Pressable
              style={[styles.quickBtnCard, { backgroundColor: colors.surface, borderColor: colors.nutrition }]}
              onPress={() => setMealModalVisible(true)}
            >
              <Utensils color={colors.nutrition} size={22} />
              <Typography variant="dataLabel" color={colors.nutrition} style={{ marginTop: 6 }}>
                + Food & Meal
              </Typography>
            </Pressable>

            <Pressable
              style={[styles.quickBtnCard, { backgroundColor: colors.surface, borderColor: colors.activity }]}
              onPress={() => setWorkoutModalVisible(true)}
            >
              <Flame color={colors.activity} size={22} />
              <Typography variant="dataLabel" color={colors.activity} style={{ marginTop: 6 }}>
                + Workout
              </Typography>
            </Pressable>

            <Pressable
              style={[styles.quickBtnCard, { backgroundColor: colors.surface, borderColor: colors.period }]}
              onPress={() => setWeightModalVisible(true)}
            >
              <Scale color={colors.period} size={22} />
              <Typography variant="dataLabel" color={colors.period} style={{ marginTop: 6 }}>
                + Weight Log
              </Typography>
            </Pressable>
          </View>

          {/* Today's Logged Items */}
          <Typography variant="h3" style={{ marginTop: SPACING.lg }}>Today's Entries ({todayMeals.length + todayActivities.length})</Typography>

          {todayMeals.map((meal) => (
            <Card key={meal.id} style={styles.entryCard}>
              <View style={styles.entryHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Typography variant="bodyLarge" style={{ fontFamily: 'Outfit-Bold' }}>{meal.name}</Typography>
                  <Typography variant="caption" color={colors.nutrition} style={{ fontFamily: 'Outfit-Bold' }}>
                    {meal.calories} kcal • P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                  </Typography>
                </View>
                <Pressable onPress={() => deleteMeal(meal.id)} style={{ padding: 4 }}>
                  <Trash2 color={colors.subtext} size={18} />
                </Pressable>
              </View>
            </Card>
          ))}

          {todayActivities.map((act) => (
            <Card key={act.id} style={styles.entryCard}>
              <View style={styles.entryHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Typography variant="bodyLarge" style={{ fontFamily: 'Outfit-Bold', textTransform: 'capitalize' }}>
                    {act.type} ({act.durationMinutes} min)
                  </Typography>
                  <Typography variant="caption" color={colors.activity} style={{ fontFamily: 'Outfit-Bold' }}>
                    ~{act.caloriesBurned} kcal burned • {act.intensity} intensity
                  </Typography>
                </View>
                <Pressable onPress={() => deleteActivity(act.id)} style={{ padding: 4 }}>
                  <Trash2 color={colors.subtext} size={18} />
                </Pressable>
              </View>
            </Card>
          ))}

          {/* BannerAdComponent removed per spec section 13 & 14 */}

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Meal Manual Modal */}
      <Modal visible={mealModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setMealModalVisible(false)}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.bg }]}>
          <ScrollView contentContainerStyle={{ padding: SPACING.md }}>
            <Typography variant="h2" style={{ marginBottom: 16 }}>Log Meal</Typography>
            <InputField label="Food Description" value={manualMealName} onChangeText={setManualMealName} placeholder="e.g. Avocado Toast" />
            <InputField label="Calories (kcal)" value={manualMealCal} onChangeText={setManualMealCal} keyboardType="numeric" placeholder="e.g. 350" />
            <InputField label="Protein (g)" value={manualMealProt} onChangeText={setManualMealProt} keyboardType="numeric" placeholder="e.g. 18" />
            <InputField label="Carbs (g)" value={manualMealCarb} onChangeText={setManualMealCarb} keyboardType="numeric" placeholder="e.g. 30" />
            <InputField label="Fat (g)" value={manualMealFat} onChangeText={setManualMealFat} keyboardType="numeric" placeholder="e.g. 12" />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <Button title="Cancel" variant="outline" onPress={() => setMealModalVisible(false)} style={{ flex: 1 }} />
              <Button title="Save Meal" variant="nutrition" onPress={handleManualMealSubmit} style={{ flex: 1 }} />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Workout Manual Modal */}
      <Modal visible={workoutModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setWorkoutModalVisible(false)}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.bg }]}>
          <ScrollView contentContainerStyle={{ padding: SPACING.md }}>
            <Typography variant="h2" style={{ marginBottom: 16 }}>Log Workout</Typography>
            <InputField label="Duration (minutes)" value={manualWorkDur} onChangeText={setManualWorkDur} keyboardType="numeric" placeholder="e.g. 45" />
            <InputField label="Calories Burned (~kcal optional)" value={manualWorkCal} onChangeText={setManualWorkCal} keyboardType="numeric" placeholder="Auto estimated if empty" />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <Button title="Cancel" variant="outline" onPress={() => setWorkoutModalVisible(false)} style={{ flex: 1 }} />
              <Button title="Save Workout" variant="positive" onPress={handleManualWorkoutSubmit} style={{ flex: 1 }} />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Weight Manual Modal */}
      <Modal visible={weightModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setWeightModalVisible(false)}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.bg }]}>
          <ScrollView contentContainerStyle={{ padding: SPACING.md }}>
            <Typography variant="h2" style={{ marginBottom: 16 }}>Log Weight</Typography>
            <InputField label="Weight (kg)" value={manualWeight} onChangeText={setManualWeight} keyboardType="decimal-pad" placeholder="e.g. 62.5" />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <Button title="Cancel" variant="outline" onPress={() => setWeightModalVisible(false)} style={{ flex: 1 }} />
              <Button title="Save Weight" variant="primary" onPress={handleManualWeightSubmit} style={{ flex: 1 }} />
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
  aiInputCard: { padding: SPACING.md },
  aiHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  inputBoxRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  nlpInput: { flex: 1, height: 46, borderWidth: 1, borderRadius: 23, paddingHorizontal: SPACING.md, fontSize: 14, fontFamily: 'Outfit-Regular' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  draftsCard: { padding: SPACING.md, borderWidth: 1 },
  draftItemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
  quickButtonsGrid: { flexDirection: 'row', gap: 10, marginTop: SPACING.sm },
  quickBtnCard: { flex: 1, padding: SPACING.md, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  entryCard: { padding: SPACING.md },
  entryHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalContainer: { flex: 1 },
});
