import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppTheme } from '../context/ThemeContext';
import { Typography } from '../components/Typography';
import { SPACING, PALETTE, CYCLE_PHASE_COLORS } from '../constants/theme';
import { ArrowLeft, PlayCircle, Dumbbell, Home, Sparkles } from 'lucide-react-native';
import { getWorkoutPlanById, WorkoutPlan } from '../domain/movement/workoutPlans';
import { useAppStore } from '../store/useAppStore';

export default function PlanDetailModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const phaseColors = CYCLE_PHASE_COLORS[isDark ? 'dark' : 'light'];
  
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  
  const enrollInPlan = useAppStore(state => state.enrollInPlan);
  const activePlanId = useAppStore(state => state.activePlanId);
  
  useEffect(() => {
    if (id) {
      const foundPlan = getWorkoutPlanById(id);
      if (foundPlan) {
        setPlan(foundPlan);
      }
    }
  }, [id]);

  if (!plan) return null;

  const isEnrolled = activePlanId === plan.id;
  const isGym = plan.environment === 'gym';

  const handleStartPlan = () => {
    enrollInPlan(plan.id);
    useAppStore.getState().showAlert('Plan Started!', `You are now enrolled in ${plan.title}.`);
    router.dismissAll();
  };

  const renderPhaseSection = (phaseName: string, phaseKey: keyof WorkoutPlan['phaseWorkouts'], accentColor: string) => {
    const workouts = plan.phaseWorkouts[phaseKey];
    if (!workouts || workouts.length === 0) return null;

    return (
      <View style={styles.phaseSection}>
        <View style={styles.phaseHeaderRow}>
          <View style={[styles.phaseDot, { backgroundColor: accentColor }]} />
          <Typography variant="h3">{phaseName}</Typography>
        </View>
        
        {workouts.map((item, index) => {
          const isRest = item.workoutId === 'rest';
          return (
            <View key={index} style={[
              styles.workoutCard, 
              { backgroundColor: colors.card, borderColor: colors.border },
              isRest && { opacity: 0.7 }
            ]}>
              <View style={{ flex: 1 }}>
                <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>
                  {item.label || (isRest ? 'Rest Day' : 'Workout')}
                </Typography>
                {!isRest && (
                  <Typography variant="caption" color={colors.subtext} style={{ marginTop: 2 }}>
                    Included in pool
                  </Typography>
                )}
              </View>
              {!isRest && (
                <Pressable 
                  style={({ pressed }) => [styles.playBtn, pressed && { opacity: 0.7 }]}
                  onPress={() => router.push(`/workoutDetailModal?id=${item.workoutId}`)}
                >
                  <PlayCircle size={24} color={colors.primary} />
                </Pressable>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}>
          <ArrowLeft size={24} color={colors.primaryText} />
        </Pressable>
        <Typography variant="h3">{plan.title}</Typography>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <Typography variant="h1" style={styles.title}>{plan.title}</Typography>
          <Typography variant="bodyMedium" color={colors.subtext} style={styles.desc}>
            {plan.description}
          </Typography>
          
          <View style={styles.tagsRow}>
            <View style={[styles.tag, { backgroundColor: colors.surface }]}>
              {isGym ? <Dumbbell size={14} color={colors.primary} /> : <Home size={14} color={colors.primary} />}
              <Typography variant="caption" color={colors.primary} style={{ marginLeft: 4 }}>
                {plan.environment.toUpperCase()}
              </Typography>
            </View>
            <View style={[styles.tag, { backgroundColor: colors.surface }]}>
              <Sparkles size={14} color={colors.primary} />
              <Typography variant="caption" color={colors.primary} style={{ marginLeft: 4 }}>
                PHASE-ADAPTIVE
              </Typography>
            </View>
            <View style={[styles.tag, { backgroundColor: colors.surface }]}>
              <Typography variant="caption" color={colors.primary}>
                {plan.level.toUpperCase()}
              </Typography>
            </View>
          </View>
          
          <View style={[styles.explainerCard, { backgroundColor: colors.surface }]}>
            <Typography variant="bodyMedium" style={{ fontWeight: '600', marginBottom: 4 }}>How this works</Typography>
            <Typography variant="caption" color={colors.subtext} style={{ lineHeight: 18 }}>
              This isn't a rigid Day-by-Day plan. Instead, the app will automatically serve you the perfect workout from this program's pool based on your current menstrual phase. As your hormones shift, so does your daily workout.
            </Typography>
          </View>
        </View>

        <View style={styles.timelineSection}>
          <Typography variant="h2" style={styles.timelineTitle}>Phase Workouts</Typography>
          
          {renderPhaseSection('Menstrual Phase', 'menstrual', phaseColors.menstrual)}
          {renderPhaseSection('Follicular Phase', 'follicular', phaseColors.follicular)}
          {renderPhaseSection('Ovulatory Phase', 'ovulatory', phaseColors.ovulatory)}
          {renderPhaseSection('Luteal Phase', 'luteal', phaseColors.luteal)}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <Pressable 
          style={({ pressed }) => [
            styles.primaryBtn, 
            { backgroundColor: isEnrolled ? colors.surface : colors.primary },
            pressed && { opacity: 0.8 }
          ]}
          onPress={handleStartPlan}
          disabled={isEnrolled}
        >
          <Typography variant="h3" color={isEnrolled ? colors.primary : PALETTE.white}>
            {isEnrolled ? 'Currently Active' : 'Start Adaptive Plan'}
          </Typography>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: 60,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: SPACING.xs,
    marginLeft: -SPACING.xs,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroSection: {
    padding: SPACING.md,
  },
  title: {
    marginBottom: SPACING.xs,
  },
  desc: {
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.lg,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  explainerCard: {
    padding: SPACING.md,
    borderRadius: 12,
  },
  timelineSection: {
    padding: SPACING.md,
  },
  timelineTitle: {
    marginBottom: SPACING.lg,
  },
  phaseSection: {
    marginBottom: SPACING.xl,
  },
  phaseHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  phaseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  playBtn: {
    padding: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
    paddingBottom: 40,
    borderTopWidth: 1,
  },
  primaryBtn: {
    paddingVertical: SPACING.md,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
