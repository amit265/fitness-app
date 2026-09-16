import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, ScrollView, Pressable, Platform, AppState, AppStateStatus, Modal, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Typography } from '../components/Typography';
import { useAppTheme } from '../context/ThemeContext';
import { SPACING } from '../constants/theme';
import { getWorkoutById } from '../domain/movement/movementLibrary';
import { X, Clock, Flame, Activity as ActivityIcon, RotateCcw } from 'lucide-react-native';
import { Button } from '../components/Button';
import Markdown from 'react-native-markdown-display';
import { useAppStore } from '../store/useAppStore';
import { getTodayStr } from '../utils/date';
import { Card } from '../components/Card';

export default function WorkoutDetailModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const addActivity = useAppStore(state => state.addActivity);

  const activeWorkoutTimer = useAppStore(state => state.activeWorkoutTimer);
  const setActiveWorkoutTimer = useAppStore(state => state.setActiveWorkoutTimer);

  // Timer State
  const [timerState, setTimerState] = useState<'idle' | 'running' | 'paused'>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<any>(null);
  // When true the cleanup effect skips saving to global store (used by Close)
  const destroyedRef = useRef(false);

  // Custom themed "Log Workout" dialog state
  const [logDialogVisible, setLogDialogVisible] = useState(false);
  const [pendingTrackedMinutes, setPendingTrackedMinutes] = useState(0);
  const [pendingRecommendedMinutes, setPendingRecommendedMinutes] = useState(0);
  const [pendingLogCallback, setPendingLogCallback] = useState<((min: number) => void) | null>(null);

  // Footer height estimate: idle = ~80, timer active = ~185
  const footerHeight = timerState === 'idle'
    ? (Platform.OS === 'ios' ? 120 : 100)
    : (Platform.OS === 'ios' ? 230 : 210);

  // Sync with global on mount
  useEffect(() => {
    if (activeWorkoutTimer && activeWorkoutTimer.workoutId === id) {
      if (activeWorkoutTimer.lastUpdatedDate !== getTodayStr()) {
        setActiveWorkoutTimer(null);
      } else {
        setTimerState(activeWorkoutTimer.status);
        if (activeWorkoutTimer.status === 'running') {
          const missedSeconds = Math.floor((Date.now() - activeWorkoutTimer.lastTickTimestamp) / 1000);
          setElapsedSeconds(activeWorkoutTimer.elapsedSeconds + missedSeconds);
        } else {
          setElapsedSeconds(activeWorkoutTimer.elapsedSeconds);
        }
      }
    }
  }, []);

  // Timer interval
  useEffect(() => {
    if (timerState === 'running') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      // Skip saving if user explicitly destroyed the timer via Close
      if (!destroyedRef.current && timerState !== 'idle' && id) {
        setActiveWorkoutTimer({
          workoutId: typeof id === 'string' ? id : id[0],
          elapsedSeconds: elapsedSeconds,
          status: timerState,
          lastUpdatedDate: getTodayStr(),
          lastTickTimestamp: Date.now()
        });
      }
    };
  }, [timerState, elapsedSeconds, id]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && timerState === 'running' && activeWorkoutTimer) {
        const missedSeconds = Math.floor((Date.now() - activeWorkoutTimer.lastTickTimestamp) / 1000);
        setElapsedSeconds(activeWorkoutTimer.elapsedSeconds + missedSeconds);
      } else if (nextAppState === 'background' && timerState !== 'idle' && id) {
        setActiveWorkoutTimer({
          workoutId: typeof id === 'string' ? id : id[0],
          elapsedSeconds,
          status: timerState,
          lastUpdatedDate: getTodayStr(),
          lastTickTimestamp: Date.now()
        });
      }
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [timerState, elapsedSeconds, activeWorkoutTimer, id]);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleFinish = (workout: any) => {
    let trackedMinutes = 0;
    if (elapsedSeconds > 60) {
      trackedMinutes = Math.round(elapsedSeconds / 60);
    } else if (timerState !== 'idle') {
      trackedMinutes = 1;
    }

    const logActivity = (finalDurationMinutes: number) => {
      const intensityMap: Record<string, 'easy' | 'moderate' | 'challenging'> = {
        'low': 'easy', 'moderate': 'moderate', 'high': 'challenging'
      };
      addActivity({
        type: workout.activityType as any,
        durationMinutes: finalDurationMinutes,
        intensity: intensityMap[workout.intensity] || 'moderate',
        caloriesBurned: Math.round((workout.estimatedCalories / workout.durationMinutes) * finalDurationMinutes),
        notes: `Completed: ${workout.title}`,
        source: 'database'
      });
      // Mark as destroyed so the cleanup effect does NOT re-save the timer
      destroyedRef.current = true;
      setActiveWorkoutTimer(null);
      // Reset local timer state so cleanup sees 'idle' even if it runs
      setTimerState('idle');
      router.back();
    };

    if (timerState !== 'idle' && trackedMinutes < workout.durationMinutes) {
      // Show themed dialog instead of native Alert
      setPendingTrackedMinutes(trackedMinutes);
      setPendingRecommendedMinutes(workout.durationMinutes);
      setPendingLogCallback(() => logActivity);
      setLogDialogVisible(true);
    } else {
      // If timer is idle, log the full recommended duration; otherwise log what was tracked
      logActivity(timerState === 'idle' ? workout.durationMinutes : trackedMinutes);
    }
  };

  const markdownStyles = {
    body: {
      color: colors.text,
      fontSize: Math.min(15, width * 0.038),
      lineHeight: Math.min(24, width * 0.06),
    },
    heading1: {
      color: colors.textPrimary,
      fontSize: Math.min(20, width * 0.05),
      marginTop: 20,
      marginBottom: 8,
      fontWeight: '700' as const,
    },
    heading2: {
      color: colors.textPrimary,
      fontSize: Math.min(17, width * 0.043),
      marginTop: 18,
      marginBottom: 6,
      fontWeight: '700' as const,
    },
    heading3: {
      color: colors.textPrimary,
      fontSize: Math.min(15, width * 0.038),
      marginTop: 14,
      marginBottom: 4,
      fontWeight: '600' as const,
    },
    list_item: {
      marginBottom: 6,
      color: colors.text,
    },
    bullet_list: {
      marginBottom: 8,
    },
    ordered_list: {
      marginBottom: 8,
    },
    strong: {
      color: colors.textPrimary,
      fontWeight: '700' as const,
    },
    em: {
      color: colors.subtext,
      fontStyle: 'italic' as const,
    },
    blockquote: {
      backgroundColor: colors.surface,
      borderLeftColor: colors.primary,
      borderLeftWidth: 3,
      paddingLeft: 12,
      paddingVertical: 6,
      borderRadius: 4,
      marginVertical: 8,
    },
    code_inline: {
      backgroundColor: colors.surface,
      color: colors.primary,
      borderRadius: 4,
      paddingHorizontal: 4,
    },
    hr: {
      backgroundColor: colors.border,
      marginVertical: 12,
    },
  };

  const workout = id ? getWorkoutById(id) : undefined;

  if (!workout) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.closeBtn, { backgroundColor: colors.surface }]}>
            <X size={24} color={colors.text} />
          </Pressable>
        </View>
        <View style={styles.center}>
          <Typography variant="bodyLarge">Workout not found.</Typography>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Dynamic bottom padding so content never hides behind footer */}
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: footerHeight }}
      >
        {workout.imageUrl ? (
          <Image source={workout.imageUrl} style={styles.heroImage} resizeMode="cover" />
        ) : (
          <View style={[styles.heroImage, { backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIcon size={48} color={colors.subtext} />
          </View>
        )}

        <Pressable onPress={() => router.back()} style={[styles.floatingCloseBtn, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <X size={20} color="#FFF" />
        </Pressable>

        <View style={styles.content}>
          {/* Tags */}
          <View style={styles.tagsRow}>
            <View style={[styles.tag, { backgroundColor: colors.surface }]}>
              <Typography variant="caption" color={colors.primary}>{workout.intent.toUpperCase()}</Typography>
            </View>
            <View style={[styles.tag, { backgroundColor: colors.surface }]}>
              <Typography variant="caption" color={colors.subtext}>{workout.intensity.toUpperCase()} INTENSITY</Typography>
            </View>
          </View>

          <Typography variant="h1" style={styles.title}>{workout.title}</Typography>
          <Typography variant="bodyLarge" color={colors.subtext} style={styles.description}>
            {workout.description}
          </Typography>

          {/* Stats row */}
          <View style={[styles.statsRow, { backgroundColor: colors.surface, borderRadius: 16 }]}>
            <View style={styles.statItem}>
              <Clock size={18} color={colors.primary} />
              <Typography variant="bodySmall" style={styles.statText}>{workout.durationMinutes} min</Typography>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Flame size={18} color={colors.activity} />
              <Typography variant="bodySmall" style={styles.statText}>{workout.estimatedCalories} kcal</Typography>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <ActivityIcon size={18} color={colors.period} />
              <Typography variant="bodySmall" style={[styles.statText, { textTransform: 'capitalize' }]}>{workout.activityType}</Typography>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {workout.tutorialMarkdown ? (
            <View style={styles.markdownContainer}>
              <Markdown style={markdownStyles}>
                {workout.tutorialMarkdown}
              </Markdown>
            </View>
          ) : (
            <Typography variant="bodyMedium" color={colors.subtext}>
              Detailed tutorial coming soon.
            </Typography>
          )}
        </View>
      </ScrollView>

      {/* Sticky footer */}
      <View style={[styles.footer, { backgroundColor: colors.bg, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom + 16, SPACING.lg) }]}>
        {timerState === 'idle' ? (
          <Button
            title="Start Workout"
            onPress={() => setTimerState('running')}
            style={{ width: '100%' }}
          />
        ) : (
          <View>
            {/* Top row: Reset (left) · Close/destroy (right) */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm }}>
              <Pressable
                onPress={() => { setElapsedSeconds(0); setTimerState('running'); }}
                style={({ pressed }) => ({
                  flexDirection: 'row', alignItems: 'center', gap: 5,
                  paddingHorizontal: 12, paddingVertical: 7,
                  borderRadius: 20, backgroundColor: colors.surface,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <RotateCcw size={14} color={colors.subtext} />
                <Typography variant="caption" color={colors.subtext}>Reset</Typography>
              </Pressable>

              <Pressable
                onPress={() => {
                  destroyedRef.current = true;   // prevent cleanup re-save
                  setActiveWorkoutTimer(null);
                  setTimerState('idle');
                  setElapsedSeconds(0);
                  router.back();
                }}
                style={({ pressed }) => ({
                  flexDirection: 'row', alignItems: 'center', gap: 5,
                  paddingHorizontal: 12, paddingVertical: 7,
                  borderRadius: 20, backgroundColor: colors.surface,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Typography variant="caption" color={colors.error ?? '#EF4444'}>Close</Typography>
                <X size={14} color={colors.error ?? '#EF4444'} />
              </Pressable>
            </View>

            <View style={{ alignItems: 'center', marginBottom: SPACING.sm }}>
              <Typography variant="caption" color={colors.subtext}>ELAPSED TIME</Typography>
              <Typography variant="display" color={colors.primary}>{formatTime(elapsedSeconds)}</Typography>
            </View>

            <View style={{ flexDirection: 'row', gap: SPACING.md }}>
              {timerState === 'running' ? (
                <Button title="Pause" variant="outline" onPress={() => setTimerState('paused')} style={{ flex: 1 }} />
              ) : (
                <Button title="Resume" variant="outline" onPress={() => setTimerState('running')} style={{ flex: 1 }} />
              )}
              <Button title="Finish & Log" variant="positive" onPress={() => handleFinish(workout)} style={{ flex: 1 }} />
            </View>
          </View>
        )}
      </View>

      {/* ─── Themed "Log Workout" Dialog ─── */}
      <Modal visible={logDialogVisible} transparent animationType="fade" onRequestClose={() => setLogDialogVisible(false)}>
        <View style={styles.dialogOverlay}>
          <Card style={[styles.dialogCard, { backgroundColor: colors.bg }]}>
            {/* Header */}
            <View style={[styles.dialogHeader, { borderBottomColor: colors.border }]}>
              <Typography variant="h2" color={colors.textPrimary}>Log Workout</Typography>
            </View>

            {/* Body */}
            <View style={styles.dialogBody}>
              <Typography variant="bodyMedium" color={colors.subtext} style={{ lineHeight: 22, textAlign: 'center' }}>
                You tracked{' '}
                <Typography variant="bodyMedium" color={colors.primary} style={{ fontWeight: '700' }}>
                  {pendingTrackedMinutes} min
                </Typography>
                , but the recommended duration is{' '}
                <Typography variant="bodyMedium" color={colors.textPrimary} style={{ fontWeight: '700' }}>
                  {pendingRecommendedMinutes} min
                </Typography>
                .{'\n\n'}What would you like to log?
              </Typography>
            </View>

            {/* Buttons */}
            <View style={styles.dialogButtons}>
              <Button
                title={`Log ${pendingTrackedMinutes} min`}
                variant="outline"
                onPress={() => {
                  setLogDialogVisible(false);
                  pendingLogCallback?.(pendingTrackedMinutes);
                }}
                style={{ flex: 1 }}
              />
              <Button
                title={`Log ${pendingRecommendedMinutes} min`}
                variant="positive"
                onPress={() => {
                  setLogDialogVisible(false);
                  pendingLogCallback?.(pendingRecommendedMinutes);
                }}
                style={{ flex: 1 }}
              />
            </View>

            {/* Cancel */}
            <Pressable
              onPress={() => setLogDialogVisible(false)}
              style={({ pressed }) => ({
                alignItems: 'center',
                marginHorizontal: SPACING.lg,
                marginBottom: SPACING.lg,
                paddingVertical: SPACING.sm,
                borderRadius: 100,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Typography variant="bodySmall" color={colors.subtext}>Cancel</Typography>
            </Pressable>
          </Card>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: SPACING.md, alignItems: 'flex-end' },
  closeBtn: { padding: 8, borderRadius: 20 },
  heroImage: { width: '100%', height: 260 },
  floatingCloseBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    width: 36, height: 36,
    borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    zIndex: 10,
  },
  content: { padding: SPACING.lg },
  tagsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: SPACING.sm },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  title: { marginBottom: SPACING.sm },
  description: { marginBottom: SPACING.lg, lineHeight: 24 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center' },
  statDivider: { width: 1, height: 24 },
  statText: { fontWeight: '600' },
  divider: { height: 1, width: '100%', marginBottom: SPACING.lg },
  markdownContainer: { marginTop: SPACING.sm },
  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: SPACING.lg,
    borderTopWidth: 1,
  },
  // Dialog styles
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  dialogCard: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    padding: 0,
  },
  dialogHeader: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  dialogBody: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  dialogButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
});
