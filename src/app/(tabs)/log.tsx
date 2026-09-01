import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  useColorScheme,
  ScrollView,
  TextInput,
  Pressable,
  Keyboard,
  Modal,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { Typography } from '../../components/Typography';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { InputField } from '../../components/InputField';
import { useAppStore } from '../../store/useAppStore';
import { parseUserInput } from '../../services/ai/aiService';
import { ParsedLogResult } from '../../services/ai/regexParser';
import { calculateActivityEquivalents } from '../../domain/calories/calorieEngine';
import { getTodayStr } from '../../utils/date';
import { BannerAdComponent } from '../../services/AdManager';
import { PALETTE, SPACING } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Sparkles,
  Apple,
  Flame,
  Scale,
  Smile,
  Plus,
  Send,
  Trash2,
} from 'lucide-react-native';

export default function LogScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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

  // Delete Confirmation Alert Handlers
  const confirmDeleteMeal = (id: string, name: string) => {
    Alert.alert(
      'Delete Meal Entry?',
      `Are you sure you want to delete "${name}" from today's log?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMeal(id) },
      ]
    );
  };

  const confirmDeleteActivity = (id: string, type: string) => {
    Alert.alert(
      'Delete Workout Entry?',
      `Are you sure you want to delete "${type}" from today's log?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteActivity(id) },
      ]
    );
  };

  const confirmDeleteMeasurement = (id: string, weight: number) => {
    Alert.alert(
      'Delete Weight Log?',
      `Are you sure you want to remove the weight log of ${weight} kg?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMeasurement(id) },
      ]
    );
  };

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
        setDraftError("We couldn't parse that text. Try adding details manually below!");
      } else {
        setDraftLogs(validResults);
      }
    } catch (e) {
      setDraftError('Parsing error. Try manual input.');
    } finally {
      setLoading(false);
    }
  };

  // Save single item
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

  // Confirm All parsed inputs
  const handleConfirmAllDrafts = () => {
    if (draftLogs.length === 0) return;
    draftLogs.forEach((item) => saveItemToStore(item));
    Alert.alert('Logs Saved', `Successfully logged ${draftLogs.length} items!`);
    setDraftLogs([]);
    setInputText('');
  };

  // Remove single item from drafts
  const handleRemoveDraftIndex = (index: number) => {
    setDraftLogs((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Manual Form handlers with validation
  const handleManualMealSubmit = () => {
    if (!manualMealName.trim()) {
      Alert.alert('Missing Name', 'Please enter a description or name for your meal.');
      return;
    }
    addMeal({
      name: manualMealName.trim(),
      calories: parseFloat(manualMealCal) || 0,
      protein: parseFloat(manualMealProt) || 0,
      carbs: parseFloat(manualMealCarb) || 0,
      fat: parseFloat(manualMealFat) || 0,
    });
    Alert.alert('Meal Logged', `${manualMealName.trim()} saved successfully!`);
    setManualMealName('');
    setManualMealCal('');
    setManualMealProt('');
    setManualMealCarb('');
    setManualMealFat('');
    setMealModalVisible(false);
  };

  const handleManualWorkoutSubmit = () => {
    if (!manualWorkDur || isNaN(Number(manualWorkDur))) {
      Alert.alert('Missing Duration', 'Please enter the workout duration in minutes.');
      return;
    }
    const dur = parseInt(manualWorkDur) || 30;
    const cal = manualWorkCal ? parseFloat(manualWorkCal) : dur * (manualWorkType === 'strength' ? 6 : 8);
    
    addActivity({
      type: manualWorkType,
      durationMinutes: dur,
      intensity: manualWorkInt,
      caloriesBurned: cal,
      notes: 'Logged manually',
    });
    Alert.alert('Workout Logged', `${manualWorkType.toUpperCase()} workout saved successfully!`);
    setManualWorkDur('');
    setManualWorkCal('');
    setWorkoutModalVisible(false);
  };

  const handleManualWeightSubmit = () => {
    if (!manualWeight || isNaN(Number(manualWeight))) {
      Alert.alert('Missing Weight', 'Please enter your current weight in kg.');
      return;
    }
    addMeasurement({
      weight: parseFloat(manualWeight),
    });
    Alert.alert('Weight Logged', `${manualWeight} kg logged successfully!`);
    setManualWeight('');
    setWeightModalVisible(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121110' : PALETTE.oat.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* Header Title */}
          <View style={styles.header}>
            <Typography variant="h1">Quick Log</Typography>
            <Typography variant="bodyMedium" color={PALETTE.charcoal.light}>
              Food, workouts, weight & checks
            </Typography>
          </View>

          {/* Dynamic Parse Card */}
          <Card style={styles.parseCard}>
            <Typography variant="h3" style={styles.parseTitle}>
              How was your day?
            </Typography>
            <Typography variant="caption" color={PALETTE.charcoal.light} style={styles.parseSubtitle}>
              Log meals or workouts in natural language (e.g. "two eggs and wheat toast" or "jogged for 40 mins")
            </Typography>

            <View style={styles.inputContainer}>
              <TextInput
                multiline
                value={inputText}
                onChangeText={setInputText}
                placeholder="What did you do or eat?"
                placeholderTextColor={isDark ? '#6B6256' : '#A89E90'}
                style={[
                  styles.parseInput,
                  {
                    borderColor: isDark ? '#2E2B28' : '#ECE9E4',
                    color: isDark ? PALETTE.cream : PALETTE.charcoal.default,
                  },
                ]}
              />
              <Pressable
                onPress={handleParseInput}
                disabled={loading || !inputText.trim()}
                style={[
                  styles.parseSubmitBtn,
                  { backgroundColor: inputText.trim() ? PALETTE.sage.default : isDark ? '#2E2B28' : '#E8E5DF' },
                ]}
              >
                <Send color={PALETTE.white} size={18} />
              </Pressable>
            </View>
          </Card>

          {/* Draft Confirmation Card Section */}
          {loading && (
            <Card style={[styles.draftLoadingCard, { backgroundColor: isDark ? '#25352A' : '#EAF0EC' }]}>
              <Typography variant="bodyMedium" align="center">
                🧠 Analyzing and structuring logs...
              </Typography>
            </Card>
          )}

          {draftError && (
            <Card style={[styles.draftErrorCard, { borderColor: PALETTE.error, backgroundColor: isDark ? '#3C1F1F' : '#FDF2F2' }]}>
              <Typography variant="bodySmall" color={isDark ? '#FF6B6B' : PALETTE.error} align="center">
                {draftError}
              </Typography>
            </Card>
          )}

          {draftLogs.length > 0 && (
            <View style={{ marginBottom: SPACING.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <Typography variant="h3">Parsed Drafts ({draftLogs.length})</Typography>
                <Pressable onPress={handleConfirmAllDrafts} style={{ backgroundColor: PALETTE.sage.default, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100 }}>
                  <Typography variant="caption" color={PALETTE.white} style={{ fontFamily: 'Outfit-Bold' }}>
                    Confirm All ({draftLogs.length})
                  </Typography>
                </Pressable>
              </View>

              {draftLogs.map((draftItem, index) => (
                <Card key={index} style={[styles.draftCard, { borderColor: PALETTE.sage.default, backgroundColor: isDark ? '#1C1A18' : '#FFFFFF', marginBottom: 12 }]}>
                  <View style={styles.draftHeaderRow}>
                    <Sparkles color={PALETTE.sage.default} size={18} />
                    <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold', flex: 1, marginLeft: 6 }}>
                      {draftItem.type === 'meal' ? '🍳 Meal Draft' : draftItem.type === 'activity' ? '🏋️ Workout Draft' : '⚖️ Weight Draft'}
                    </Typography>
                    <Pressable onPress={() => handleRemoveDraftIndex(index)}>
                      <Typography variant="caption" color={PALETTE.error}>Remove</Typography>
                    </Pressable>
                  </View>

                  {draftItem.type === 'meal' && (
                    <>
                      <View style={styles.draftFieldsContainer}>
                        <InputField
                          label="Meal Name"
                          value={draftItem.payload.name}
                          onChangeText={(t) => {
                            const updated = [...draftLogs];
                            updated[index].payload.name = t;
                            setDraftLogs(updated);
                          }}
                        />
                        <View style={styles.macroRow}>
                          <View style={styles.macroCol}>
                            <InputField
                              label="Calories"
                              value={String(draftItem.payload.calories)}
                              keyboardType="number-pad"
                              onChangeText={(t) => {
                                const updated = [...draftLogs];
                                updated[index].payload.calories = Number(t);
                                setDraftLogs(updated);
                              }}
                            />
                          </View>
                          <View style={styles.macroCol}>
                            <InputField
                              label="Protein (g)"
                              value={String(draftItem.payload.protein)}
                              keyboardType="decimal-pad"
                              onChangeText={(t) => {
                                const updated = [...draftLogs];
                                updated[index].payload.protein = Number(t);
                                setDraftLogs(updated);
                              }}
                            />
                          </View>
                        </View>
                      </View>

                      {draftItem.payload.calories > 0 && (() => {
                        const latestWeight = measurements[0]?.weight ?? 60;
                        const equiv = calculateActivityEquivalents(draftItem.payload.calories, latestWeight);
                        return (
                          <View style={[styles.equivBox, { backgroundColor: isDark ? '#282522' : '#FAF7F2' }]}>
                            <Typography variant="caption" color={PALETTE.sage.default} style={{ fontFamily: 'Outfit-Bold', letterSpacing: 0.5, marginBottom: 2 }}>
                              💡 ACTIVITY PERSPECTIVE (~{draftItem.payload.calories} KCAL)
                            </Typography>
                            <Typography variant="bodySmall" style={{ fontFamily: 'Outfit-Medium', color: isDark ? PALETTE.cream : PALETTE.charcoal.default }}>
                              🚶 {equiv.walkingMins}m walking • 🏊 {equiv.swimmingMins}m swimming • 🏋️ {equiv.workoutMins}m workout
                            </Typography>
                          </View>
                        );
                      })()}
                    </>
                  )}

                  {draftItem.type === 'activity' && (
                    <View style={styles.draftFieldsContainer}>
                      <Typography variant="bodySmall" style={styles.fieldLabel}>Type: {draftItem.payload.type?.toUpperCase()}</Typography>
                      <InputField
                        label="Duration (minutes)"
                        value={String(draftItem.payload.durationMinutes)}
                        keyboardType="number-pad"
                        onChangeText={(t) => {
                          const updated = [...draftLogs];
                          updated[index].payload.durationMinutes = Number(t);
                          setDraftLogs(updated);
                        }}
                      />
                      <InputField
                        label="Calories Burned (kcal)"
                        value={String(draftItem.payload.caloriesBurned)}
                        keyboardType="number-pad"
                        onChangeText={(t) => {
                          const updated = [...draftLogs];
                          updated[index].payload.caloriesBurned = Number(t);
                          setDraftLogs(updated);
                        }}
                      />
                    </View>
                  )}

                  {draftItem.type === 'weight' && (
                    <View style={styles.draftFieldsContainer}>
                      <InputField
                        label="Weight (kg)"
                        value={String(draftItem.payload.weight)}
                        keyboardType="decimal-pad"
                        onChangeText={(t) => {
                          const updated = [...draftLogs];
                          updated[index].payload.weight = Number(t);
                          setDraftLogs(updated);
                        }}
                      />
                    </View>
                  )}

                  <Button
                    title="Confirm This Item"
                    onPress={() => {
                      saveItemToStore(draftItem);
                      Alert.alert('Item Logged', `${draftItem.type.toUpperCase()} saved!`);
                      handleRemoveDraftIndex(index);
                    }}
                    style={{ marginTop: 8 }}
                  />
                </Card>
              ))}
            </View>
          )}

          {/* Manual Actions Grid */}
          <Typography variant="bodySmall" color={PALETTE.charcoal.light} style={styles.quickActionLabel}>
            MANUAL LOGGING
          </Typography>

          <View style={styles.actionsGrid}>
            <Pressable
              onPress={() => setMealModalVisible(true)}
              style={[
                styles.gridBtn,
                {
                  backgroundColor: isDark ? '#1C1A18' : '#FFFFFF',
                  borderColor: isDark ? '#2E2B28' : '#ECE9E4'
                }
              ]}
            >
              <Apple color={PALETTE.sage.default} size={24} />
              <Typography variant="bodyMedium" style={styles.gridBtnText}>+ Meal</Typography>
            </Pressable>

            <Pressable
              onPress={() => setWorkoutModalVisible(true)}
              style={[
                styles.gridBtn,
                {
                  backgroundColor: isDark ? '#1C1A18' : '#FFFFFF',
                  borderColor: isDark ? '#2E2B28' : '#ECE9E4'
                }
              ]}
            >
              <Flame color={PALETTE.sage.default} size={24} />
              <Typography variant="bodyMedium" style={styles.gridBtnText}>+ Workout</Typography>
            </Pressable>

            <Pressable
              onPress={() => setWeightModalVisible(true)}
              style={[
                styles.gridBtn,
                {
                  backgroundColor: isDark ? '#1C1A18' : '#FFFFFF',
                  borderColor: isDark ? '#2E2B28' : '#ECE9E4'
                }
              ]}
            >
              <Scale color={PALETTE.sage.default} size={24} />
              <Typography variant="bodyMedium" style={styles.gridBtnText}>+ Weight</Typography>
            </Pressable>
          </View>

          {/* Today's Logged Entries Feed */}
          <Typography variant="bodySmall" color={PALETTE.charcoal.light} style={[styles.quickActionLabel, { marginTop: SPACING.lg }]}>
            TODAY'S LOGGED ENTRIES
          </Typography>

          <Card style={[styles.loggedItemsCard, { backgroundColor: isDark ? '#1C1A18' : '#FFFFFF', borderColor: isDark ? '#2E2B28' : '#ECE9E4' }]}>
            {todayMeals.length === 0 && todayActivities.length === 0 && todayMeasurements.length === 0 ? (
              <Typography variant="bodyMedium" color={PALETTE.charcoal.light} align="center" style={{ paddingVertical: SPACING.md }}>
                No items logged today yet. Use quick text parse or manual logging above!
              </Typography>
            ) : (
              <View style={styles.loggedFeedList}>
                {/* Meals */}
                {todayMeals.map((m) => (
                  <View key={m.id} style={[styles.loggedFeedItem, { borderBottomColor: isDark ? '#2E2B28' : '#F5F3EF' }]}>
                    <View style={styles.loggedFeedLeft}>
                      <Apple color={PALETTE.sage.default} size={18} />
                      <View style={{ marginLeft: SPACING.xs }}>
                        <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold' }}>
                          {m.name}
                        </Typography>
                        <Typography variant="caption" color={PALETTE.charcoal.light}>
                          {m.calories} kcal • P:{m.protein}g C:{m.carbs}g F:{m.fat}g
                        </Typography>
                      </View>
                    </View>
                    <Pressable onPress={() => confirmDeleteMeal(m.id, m.name)} style={styles.deleteBtn}>
                      <Trash2 color="#C0392B" size={18} />
                    </Pressable>
                  </View>
                ))}

                {/* Activities */}
                {todayActivities.map((a) => (
                  <View key={a.id} style={[styles.loggedFeedItem, { borderBottomColor: isDark ? '#2E2B28' : '#F5F3EF' }]}>
                    <View style={styles.loggedFeedLeft}>
                      <Flame color={PALETTE.rose.default} size={18} />
                      <View style={{ marginLeft: SPACING.xs }}>
                        <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold' }}>
                          {a.type.toUpperCase()} ({a.durationMinutes} mins)
                        </Typography>
                        <Typography variant="caption" color={PALETTE.charcoal.light}>
                          ~{a.caloriesBurned || 0} kcal burned • Intensity: {a.intensity}
                        </Typography>
                      </View>
                    </View>
                    <Pressable onPress={() => confirmDeleteActivity(a.id, a.type)} style={styles.deleteBtn}>
                      <Trash2 color="#C0392B" size={18} />
                    </Pressable>
                  </View>
                ))}

                {/* Weight Entries */}
                {todayMeasurements.map((w) => (
                  <View key={w.id} style={[styles.loggedFeedItem, { borderBottomColor: isDark ? '#2E2B28' : '#F5F3EF' }]}>
                    <View style={styles.loggedFeedLeft}>
                      <Scale color={PALETTE.sage.dark} size={18} />
                      <View style={{ marginLeft: SPACING.xs }}>
                        <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold' }}>
                          Weight Log: {w.weight} kg
                        </Typography>
                        <Typography variant="caption" color={PALETTE.charcoal.light}>
                          Recorded for today ({w.date})
                        </Typography>
                      </View>
                    </View>
                    <Pressable onPress={() => confirmDeleteMeasurement(w.id, w.weight)} style={styles.deleteBtn}>
                      <Trash2 color="#C0392B" size={18} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </Card>

          <BannerAdComponent style={{ marginTop: SPACING.md }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Manual Meal Modal */}
      <Modal
        visible={mealModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMealModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[styles.modalContent, { backgroundColor: isDark ? '#1C1A18' : PALETTE.white }]}
          >
            <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
              <Typography variant="h2" style={styles.modalTitle}>Add Meal</Typography>
              
              <InputField label="Meal Description" value={manualMealName} onChangeText={setManualMealName} placeholder="e.g. Oatmeal with Protein" />
              <InputField label="Calories (kcal)" value={manualMealCal} onChangeText={setManualMealCal} keyboardType="number-pad" placeholder="350" />
              
              <View style={styles.row}>
                <View style={styles.flexThird}>
                  <InputField label="Protein (g)" value={manualMealProt} onChangeText={setManualMealProt} keyboardType="decimal-pad" placeholder="25" />
                </View>
                <View style={styles.flexThird}>
                  <InputField label="Carbs (g)" value={manualMealCarb} onChangeText={setManualMealCarb} keyboardType="decimal-pad" placeholder="40" />
                </View>
                <View style={styles.flexThird}>
                  <InputField label="Fat (g)" value={manualMealFat} onChangeText={setManualMealFat} keyboardType="decimal-pad" placeholder="8" />
                </View>
              </View>

              <View style={styles.modalActions}>
                <Button title="Cancel" variant="outline" onPress={() => setMealModalVisible(false)} style={styles.modalCancel} />
                <Button title="Save Meal" onPress={handleManualMealSubmit} style={styles.modalSave} />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Manual Workout Modal */}
      <Modal
        visible={workoutModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setWorkoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[styles.modalContent, { backgroundColor: isDark ? '#1C1A18' : PALETTE.white }]}
          >
            <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
              <Typography variant="h2" style={styles.modalTitle}>Add Workout</Typography>

              <Typography variant="bodySmall" style={styles.fieldLabel}>Workout Type</Typography>
              <View style={styles.tagsContainer}>
                {['strength', 'cardio', 'walking', 'running', 'yoga', 'mobility'].map((type) => {
                  const selected = manualWorkType === type;
                  return (
                    <Pressable
                      key={type}
                      onPress={() => setManualWorkType(type)}
                      style={[styles.tagItem, selected && styles.tagItemActive]}
                    >
                      <Typography variant="bodySmall" color={selected ? PALETTE.white : undefined}>
                        {type.toUpperCase()}
                      </Typography>
                    </Pressable>
                  );
                })}
              </View>

              <View style={{ height: SPACING.md }} />
              
              <InputField label="Duration (minutes)" value={manualWorkDur} onChangeText={setManualWorkDur} keyboardType="number-pad" placeholder="45" />

              <Typography variant="bodySmall" style={styles.fieldLabel}>Intensity</Typography>
              <View style={styles.tagsContainer}>
                {['easy', 'moderate', 'challenging'].map((int) => {
                  const selected = manualWorkInt === int;
                  return (
                    <Pressable
                      key={int}
                      onPress={() => setManualWorkInt(int)}
                      style={[styles.tagItem, selected && styles.tagItemActive]}
                    >
                      <Typography variant="bodySmall" color={selected ? PALETTE.white : undefined}>
                        {int.toUpperCase()}
                      </Typography>
                    </Pressable>
                  );
                })}
              </View>

              <View style={{ height: SPACING.md }} />

              <InputField label="Calories (kcal, optional)" value={manualWorkCal} onChangeText={setManualWorkCal} keyboardType="number-pad" placeholder="Calculated automatically" />

              <View style={styles.modalActions}>
                <Button title="Cancel" variant="outline" onPress={() => setWorkoutModalVisible(false)} style={styles.modalCancel} />
                <Button title="Save Workout" onPress={handleManualWorkoutSubmit} style={styles.modalSave} />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Manual Weight Modal */}
      <Modal
        visible={weightModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setWeightModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[styles.modalContent, { backgroundColor: isDark ? '#1C1A18' : PALETTE.white }]}
          >
            <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
              <Typography variant="h2" style={styles.modalTitle}>Add Weight Log</Typography>
              
              <InputField label="Current Weight (kg)" value={manualWeight} onChangeText={setManualWeight} keyboardType="decimal-pad" placeholder="62.5" />

              <View style={styles.modalActions}>
                <Button title="Cancel" variant="outline" onPress={() => setWeightModalVisible(false)} style={styles.modalCancel} />
                <Button title="Save Weight" onPress={handleManualWeightSubmit} style={styles.modalSave} />
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
    marginBottom: SPACING.lg,
    marginTop: SPACING.sm,
  },
  parseCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  parseTitle: {
    fontFamily: 'PlayfairDisplay-SemiBold',
    marginBottom: 4,
  },
  parseSubtitle: {
    lineHeight: 14,
    marginBottom: SPACING.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  parseInput: {
    flex: 1,
    height: 72,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 14,
    fontFamily: 'Outfit-Regular',
    textAlignVertical: 'top',
  },
  parseSubmitBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  draftLoadingCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: '#EAF0EC',
  },
  draftErrorCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    backgroundColor: '#FDF2F2',
  },
  draftCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  draftHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.md,
  },
  draftFieldsContainer: {
    marginBottom: SPACING.md,
  },
  fieldLabel: {
    fontFamily: 'Outfit-Medium',
    marginBottom: 4,
  },
  fieldTextValue: {
    fontFamily: 'Outfit-Bold',
    color: PALETTE.sage.default,
    marginBottom: SPACING.md,
  },
  macroRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  macroCol: {
    flex: 1,
  },
  draftActionsRow: {
    flexDirection: 'column',
    gap: SPACING.sm,
  },
  draftActionBtn: {
    width: '100%',
  },
  draftActionSaveBtn: {
    width: '100%',
  },
  quickActionLabel: {
    fontFamily: 'Outfit-Bold',
    letterSpacing: 1.0,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    marginLeft: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  gridBtn: {
    flex: 1,
    height: 84,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#ECE9E4',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  gridBtnText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 12,
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
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  flexThird: {
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: 4,
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
  equivBox: {
    padding: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#ECE9E4',
  },
  loggedItemsCard: {
    padding: SPACING.md,
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  loggedFeedList: {
    flexDirection: 'column',
  },
  loggedFeedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  loggedFeedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deleteBtn: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
});
