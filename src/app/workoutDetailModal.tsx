import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, ScrollView, Pressable, Platform, AppState, AppStateStatus, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Typography } from '../components/Typography';
import { useAppTheme } from '../context/ThemeContext';
import { SPACING } from '../constants/theme';
import { getWorkoutById } from '../domain/movement/movementLibrary';
import { X, Clock, Flame, Activity as ActivityIcon, Play, Pause, Check, RotateCcw } from 'lucide-react-native';
import { Button } from '../components/Button';
import Markdown from 'react-native-markdown-display';
import { useAppStore } from '../store/useAppStore';
import { getTodayStr } from '../utils/date';

export default function WorkoutDetailModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useAppTheme();
  const addActivity = useAppStore(state => state.addActivity);

  const activeWorkoutTimer = useAppStore(state => state.activeWorkoutTimer);
  const setActiveWorkoutTimer = useAppStore(state => state.setActiveWorkoutTimer);

  // Timer State
  const [timerState, setTimerState] = useState<'idle' | 'running' | 'paused'>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<any>(null);

  // Sync with global on mount
  useEffect(() => {
    if (activeWorkoutTimer && activeWorkoutTimer.workoutId === id) {
      if (activeWorkoutTimer.lastUpdatedDate !== getTodayStr()) {
        // Kill if from yesterday
        setActiveWorkoutTimer(null);
      } else {
        setTimerState(activeWorkoutTimer.status);
        if (activeWorkoutTimer.status === 'running') {
          // Calculate missed seconds while app was in background or navigated away
          const missedSeconds = Math.floor((Date.now() - activeWorkoutTimer.lastTickTimestamp) / 1000);
          setElapsedSeconds(activeWorkoutTimer.elapsedSeconds + missedSeconds);
        } else {
          setElapsedSeconds(activeWorkoutTimer.elapsedSeconds);
        }
      }
    } else if (activeWorkoutTimer && activeWorkoutTimer.workoutId !== id) {
       // If viewing a DIFFERENT workout while another is running, maybe clear it?
       // For now, let's just let it run in background and allow them to start a new one (overwrites)
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
    
    // Save to global on every state change and unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (timerState !== 'idle' && id) {
        // We use a functional approach to save state when unmounting
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

  // Handle app state changes (background/foreground) to catch up missed time
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && timerState === 'running' && activeWorkoutTimer) {
         // Re-calculate
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
      const intensityMap: Record<string, 'easy'|'moderate'|'challenging'> = {
        'low': 'easy',
        'moderate': 'moderate',
        'high': 'challenging'
      };

      addActivity({
        type: workout.activityType as any,
        durationMinutes: finalDurationMinutes,
        intensity: intensityMap[workout.intensity] || 'moderate',
        caloriesBurned: Math.round((workout.estimatedCalories / workout.durationMinutes) * finalDurationMinutes),
        notes: `Completed: ${workout.title}`,
        source: 'database'
      });
      
      // Clear global timer
      setActiveWorkoutTimer(null);
      router.back();
    };

    if (timerState !== 'idle' && trackedMinutes < workout.durationMinutes) {
      Alert.alert(
        "Log Workout",
        `You've tracked ${trackedMinutes} minutes, but the recommended duration is ${workout.durationMinutes} minutes. What would you like to log?`,
        [
          { text: `Log ${trackedMinutes} min`, onPress: () => logActivity(trackedMinutes) },
          { text: `Log ${workout.durationMinutes} min`, onPress: () => logActivity(workout.durationMinutes) },
          { text: "Cancel", style: "cancel" }
        ]
      );
    } else {
      // If idle, or tracked minutes matches/exceeds default
      logActivity(timerState === 'idle' ? workout.durationMinutes : trackedMinutes);
    }
  };

  const markdownStyles = {
    body: {
      color: colors.text,
      fontSize: 16,
      lineHeight: 24,
    },
    heading1: {
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
      fontWeight: '700' as const,
    },
    heading2: {
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
      fontWeight: '700' as const,
    },
    list_item: {
      marginBottom: 4,
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
      <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
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
          <View style={styles.tagsRow}>
            <View style={[styles.tag, { backgroundColor: colors.surface }]}>
              <Typography variant="caption" color={colors.primary}>{workout.intent.toUpperCase()}</Typography>
            </View>
            <View style={[styles.tag, { backgroundColor: colors.surface }]}>
              <Typography variant="caption" color={colors.text}>{workout.intensity.toUpperCase()} INTENSITY</Typography>
            </View>
          </View>

          <Typography variant="h1" style={styles.title}>{workout.title}</Typography>
          <Typography variant="bodyLarge" color={colors.subtext} style={styles.description}>
            {workout.description}
          </Typography>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Clock size={20} color={colors.primary} />
              <Typography variant="bodyMedium" style={styles.statText}>{workout.durationMinutes} min</Typography>
            </View>
            <View style={styles.statItem}>
              <Flame size={20} color={colors.activity} />
              <Typography variant="bodyMedium" style={styles.statText}>{workout.estimatedCalories} kcal</Typography>
            </View>
            <View style={styles.statItem}>
              <ActivityIcon size={20} color={colors.period} />
              <Typography variant="bodyMedium" style={[styles.statText, { textTransform: 'capitalize' }]}>{workout.activityType}</Typography>
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

      <View style={[styles.footer, { backgroundColor: colors.bg, borderTopColor: colors.border }]}>
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
              {/* Reset — restarts timer from 0 */}
              <Pressable
                onPress={() => { setElapsedSeconds(0); setTimerState('running'); }}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 20,
                  backgroundColor: colors.surface,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <RotateCcw size={14} color={colors.subtext} />
                <Typography variant="caption" color={colors.subtext}>Reset</Typography>
              </Pressable>

              {/* Close — destroys progress entirely */}
              <Pressable
                onPress={() => { setActiveWorkoutTimer(null); setTimerState('idle'); setElapsedSeconds(0); router.back(); }}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 20,
                  backgroundColor: colors.surface,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Typography variant="caption" color={colors.error ?? '#EF4444'}>Close</Typography>
                <X size={14} color={colors.error ?? '#EF4444'} />
              </Pressable>
            </View>

            {/* Elapsed time display */}
            <View style={{ alignItems: 'center', marginBottom: SPACING.md }}>
              <Typography variant="caption" color={colors.subtext}>ELAPSED TIME</Typography>
              <Typography variant="display" color={colors.primary}>{formatTime(elapsedSeconds)}</Typography>
            </View>

            {/* Pause/Resume + Finish */}
            <View style={{ flexDirection: 'row', gap: SPACING.md }}>
              {timerState === 'running' ? (
                <Button 
                  title="Pause"
                  variant="outline"
                  onPress={() => setTimerState('paused')}
                  style={{ flex: 1 }}
                />
              ) : (
                <Button 
                  title="Resume"
                  variant="outline"
                  onPress={() => setTimerState('running')}
                  style={{ flex: 1 }}
                />
              )}
              <Button 
                title="Finish & Log"
                variant="positive"
                onPress={() => handleFinish(workout)}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: SPACING.md, alignItems: 'flex-end' },
  closeBtn: { padding: 8, borderRadius: 20 },
  heroImage: { width: '100%', height: 300 },
  floatingCloseBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  content: { padding: SPACING.lg },
  tagsRow: { flexDirection: 'row', gap: 8, marginBottom: SPACING.sm },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  title: { marginBottom: SPACING.sm },
  description: { marginBottom: SPACING.lg, lineHeight: 24 },
  statsRow: { flexDirection: 'row', gap: SPACING.lg, marginBottom: SPACING.lg },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontWeight: '600' },
  divider: { height: 1, width: '100%', marginBottom: SPACING.lg },
  markdownContainer: { marginTop: SPACING.sm },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : SPACING.lg,
    borderTopWidth: 1,
  }
});
