import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { Typography } from '../Typography';
import { SPACING } from '../../constants/theme';
import { useRouter } from 'expo-router';
import { WORKOUT_PLANS, WorkoutPlan } from '../../domain/movement/workoutPlans';
import { Dumbbell, Home, ChevronRight, Sparkles } from 'lucide-react-native';

export function ProgramsLibrary() {
  const { colors } = useAppTheme();
  const router = useRouter();

  const renderPlanCard = (plan: WorkoutPlan) => {
    const isGym = plan.environment === 'gym';
    return (
      <Pressable 
        key={plan.id} 
        style={({ pressed }) => [
          styles.planCard, 
          { backgroundColor: colors.card, borderColor: colors.border },
          pressed && { opacity: 0.8 }
        ]}
        onPress={() => router.push(`/planDetailModal?id=${plan.id}`)}
      >
        <View style={styles.planHeader}>
          <View style={[styles.badge, { backgroundColor: colors.surface }]}>
             {isGym ? <Dumbbell size={14} color={colors.primary} /> : <Home size={14} color={colors.primary} />}
            <Typography variant="caption" color={colors.primary} style={{ marginLeft: 4 }}>
              {plan.environment.toUpperCase()}
            </Typography>
          </View>
          <View style={styles.badge}>
            <Sparkles size={14} color={colors.subtext} />
            <Typography variant="caption" color={colors.subtext} style={{ marginLeft: 4 }}>
              ADAPTIVE
            </Typography>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1, paddingRight: SPACING.md }}>
            <Typography variant="h3" style={styles.planTitle}>{plan.title}</Typography>
            <Typography variant="bodyMedium" color={colors.subtext} style={styles.planDesc}>
              {plan.description}
            </Typography>
          </View>
          <View style={[styles.chevronBtn, { backgroundColor: colors.surface }]}>
            <ChevronRight size={16} color={colors.primary} />
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingBottom: 100 }]}>
      <View style={styles.sectionContainer}>
        <Typography variant="h2" style={styles.sectionTitle}>Structured Workouts</Typography>
        <Typography variant="bodyMedium" color={colors.subtext} style={styles.sectionSubtitle}>
          Adaptive workout plans customized for your menstrual cycle.
        </Typography>
        {WORKOUT_PLANS.map(renderPlanCard)}
      </View>
      <View style={[styles.sectionContainer, { marginTop: SPACING.xl }]}>
        <Pressable 
          style={({ pressed }) => [
            styles.planCard, 
            { backgroundColor: colors.surface, borderColor: colors.border },
            pressed && { opacity: 0.8 }
          ]}
          onPress={() => router.push('/movementLibraryModal')}
        >
          <View style={styles.planHeader}>
            <View style={[styles.badge, { backgroundColor: colors.card }]}>
               <Dumbbell size={14} color={colors.primary} />
              <Typography variant="caption" color={colors.primary} style={{ marginLeft: 4 }}>
                ALL EXERCISES
              </Typography>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1, paddingRight: SPACING.md }}>
              <Typography variant="h3" style={styles.planTitle}>Exercise Bank</Typography>
              <Typography variant="bodyMedium" color={colors.subtext} style={styles.planDesc}>
                Explore all individual exercises and movements.
              </Typography>
            </View>
            <View style={[styles.chevronBtn, { backgroundColor: colors.card }]}>
              <ChevronRight size={16} color={colors.primary} />
            </View>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionContainer: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  sectionTitle: {
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    marginBottom: SPACING.md,
  },
  planCard: {
    padding: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  planTitle: {
    marginBottom: 4,
  },
  planDesc: {
    lineHeight: 20,
  },
  chevronBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
