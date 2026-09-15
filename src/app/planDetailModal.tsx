import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppTheme } from '../context/ThemeContext';
import { Typography } from '../components/Typography';
import { ScreenContainer } from '../components/ScreenContainer';
import { SPACING, PALETTE } from '../constants/theme';
import { ArrowLeft, CheckCircle2, PlayCircle, Calendar, Dumbbell, Home } from 'lucide-react-native';
import { getWorkoutPlanById, WorkoutPlan } from '../domain/movement/workoutPlans';
import { useAppStore } from '../store/useAppStore';

export default function PlanDetailModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useAppTheme();
  
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  
  const enrollInPlan = useAppStore(state => state.enrollInPlan);
  const activePlanId = useAppStore(state => state.activePlanId);
  const currentPlanDayIndex = useAppStore(state => state.currentPlanDayIndex);
  
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
              <Calendar size={14} color={colors.primary} />
              <Typography variant="caption" color={colors.primary} style={{ marginLeft: 4 }}>
                {plan.durationWeeks} WEEKS
              </Typography>
            </View>
            <View style={[styles.tag, { backgroundColor: colors.surface }]}>
              <Typography variant="caption" color={colors.primary}>
                {plan.level.toUpperCase()}
              </Typography>
            </View>
          </View>
        </View>

        <View style={styles.timelineSection}>
          <Typography variant="h2" style={styles.timelineTitle}>Plan Schedule</Typography>
          
          {plan.schedule.map((item, index) => {
            const isRest = item.workoutId === 'rest';
            const isCompleted = isEnrolled && item.dayIndex < currentPlanDayIndex;
            const isCurrent = isEnrolled && item.dayIndex === currentPlanDayIndex;
            
            return (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <Typography variant="caption" color={isCurrent ? colors.primary : colors.subtext} style={{ width: 40, textAlign: 'right' }}>
                    Day {item.dayIndex}
                  </Typography>
                  <View style={[
                    styles.timelineDot,
                    { borderColor: isCurrent ? colors.primary : colors.border },
                    isCompleted && { backgroundColor: colors.primary, borderColor: colors.primary },
                    isRest && !isCompleted && !isCurrent && { borderColor: 'transparent', backgroundColor: colors.surface }
                  ]}>
                    {isCompleted && <CheckCircle2 size={12} color={PALETTE.white} />}
                  </View>
                  {index < plan.schedule.length - 1 && (
                    <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                  )}
                </View>
                
                <View style={[
                  styles.timelineCard, 
                  { backgroundColor: colors.card, borderColor: isCurrent ? colors.primary : colors.border },
                  isRest && { opacity: 0.6 }
                ]}>
                  <View style={{ flex: 1 }}>
                    <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>
                      {item.label || (isRest ? 'Rest Day' : 'Workout')}
                    </Typography>
                    {!isRest && (
                      <Typography variant="caption" color={colors.subtext} style={{ marginTop: 2 }}>
                        View details
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
              </View>
            );
          })}
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
            {isEnrolled ? 'Currently Active' : 'Start This Plan'}
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
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timelineSection: {
    padding: SPACING.md,
  },
  timelineTitle: {
    marginBottom: SPACING.lg,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  timelineLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginRight: SPACING.md,
    position: 'relative',
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
    marginTop: 2,
    zIndex: 2,
    backgroundColor: '#fff' // Fallback
  },
  timelineLine: {
    position: 'absolute',
    left: 48 + 10, // width of text (40) + marginLeft (8) + half dot (10)
    top: 22,
    bottom: -16,
    width: 2,
    zIndex: 1,
  },
  timelineCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
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
