import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { Typography } from '../Typography';
import { SPACING, PALETTE } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';
import { getTodayStr } from '../../utils/date';
import { getCycleState } from '../../domain/cycle/cycleEngine';
import { useRouter } from 'expo-router';
import { 
  MOVEMENT_LIBRARY, 
  WorkoutIntent, 
  WorkoutRoutine, 
  getRecommendedWorkoutsForPhase,
  getWorkoutsByIntent 
} from '../../domain/movement/movementLibrary';
import { t } from '../../i18n';
import { Play, Activity as ActivityIcon, ArrowLeft, CheckCircle2, ChevronRight } from 'lucide-react-native';

export function MovementLibrary() {
  const { colors } = useAppTheme();
  const router = useRouter();

  const cyclePreferences = useAppStore((state) => state.cyclePreferences);
  const periods = useAppStore((state) => state.periods);
  const userProfile = useAppStore((state) => state.userProfile);
  
  const todayStr = getTodayStr();
  const cycleState = getCycleState(periods, cyclePreferences, todayStr);
  const recommendedWorkouts = getRecommendedWorkoutsForPhase(cycleState.phase, userProfile?.weightGoal);

  const renderWorkoutCard = (workout: WorkoutRoutine, isHorizontal = false) => {
    return (
      <Pressable 
        key={workout.id} 
        style={({ pressed }) => [
          styles.workoutCard, 
          { backgroundColor: colors.card, borderColor: colors.border },
          isHorizontal && { width: 280, marginRight: SPACING.md },
          pressed && { opacity: 0.8 }
        ]}
        onPress={() => router.push(`/workoutDetailModal?id=${workout.id}`)}
      >
        <View style={styles.workoutHeader}>
          <View style={[styles.intentBadge, { backgroundColor: colors.surface }]}>
            <Typography variant="caption" color={colors.primary}>{workout.intent.toUpperCase()}</Typography>
          </View>
          <View style={styles.statsRow}>
            <ActivityIcon size={14} color={colors.subtext} />
            <Typography variant="caption" color={colors.subtext} style={{ marginLeft: 4 }}>
              {workout.durationMinutes}m • {workout.intensity}
            </Typography>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1, paddingRight: SPACING.md }}>
            <Typography variant="h3" style={styles.workoutTitle}>{workout.title}</Typography>
            <Typography variant="bodyMedium" color={colors.subtext} style={styles.workoutDesc}>
              {workout.description}
            </Typography>
          </View>
          <View style={[styles.chevronBtn, { backgroundColor: colors.surface }]}>
            <ChevronRight size={16} color={colors.primary} />
          </View>
        </View>
      </Pressable>
    );
  };

  const renderSection = (title: string, intent: WorkoutIntent) => {
    const workouts = getWorkoutsByIntent(intent);
    if (workouts.length === 0) return null;

    return (
      <View style={styles.sectionContainer}>
        <Typography variant="h2" style={styles.sectionTitle}>{title}</Typography>
        {workouts.map(w => renderWorkoutCard(w, false))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingBottom: 100 }]}>
        {/* Recommended Carousel */}
        {recommendedWorkouts.length > 0 && (
          <View style={styles.recommendedContainer}>
            <View style={styles.recommendedHeader}>
              <Typography variant="h2">Recommended for Your Phase</Typography>
              <Typography variant="bodyMedium" color={colors.subtext} style={{ marginTop: 4 }}>
                Optimized for the {cycleState.phase} phase
              </Typography>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselScroll}>
              {recommendedWorkouts.map(w => renderWorkoutCard(w, true))}
            </ScrollView>
          </View>
        )}

        {/* Library Sections */}
        {renderSection('De-Bloat & Mobility Flows', 'debloat')}
        {renderSection('Hormone-Safe Strength Circuits', 'strength')}
        {renderSection('Energy-Burst Combos', 'energy')}
        {renderSection('Restorative & Grounding', 'restorative')}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  recommendedContainer: {
    marginVertical: SPACING.lg,
  },
  recommendedHeader: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  carouselScroll: {
    paddingHorizontal: SPACING.md,
    paddingRight: SPACING.xl,
  },
  sectionContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
  },
  workoutCard: {
    padding: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  intentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutTitle: {
    marginBottom: SPACING.xs,
  },
  workoutDesc: {
    lineHeight: 20,
  },
  chevronBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
