import {
  DailyCheckIn,
  CycleState,
  Activity,
  ReadinessScore,
  ReadinessLevel,
  ReadinessFactor,
  DailyRecommendation,
  ActivityRecommendationType,
} from '../../types';

/**
 * Calculates a 0-100 explainable readiness score based on check-in, cycle state, and recovery.
 */
export function calculateReadinessScore(
  checkIn: DailyCheckIn | null,
  cycleState: CycleState,
  recentActivities: Activity[],
  userGoal: 'lose' | 'maintain' | 'gain' | 'wellness' = 'wellness'
): ReadinessScore {
  // 1. Establish Default/Neutral Inputs if Check-in is Missing
  const sleepDuration = checkIn ? checkIn.sleepDuration : 8; // Neutral: 8 hours
  const sleepQuality = checkIn ? checkIn.sleepQuality : 4;   // Neutral: 4/5
  const energy = checkIn ? checkIn.energy : 3;               // Neutral: 3/5
  const stress = checkIn ? checkIn.stress : 2;               // Neutral: 2/5 (low-moderate)
  const hydration = checkIn ? checkIn.hydration : 1.5;       // Neutral: 1.5 Litres
  const symptoms = checkIn ? checkIn.symptoms : [];

  // 2. Compute Individual Normalized Factors (0-100)

  // A. Sleep Score
  let sleepDurationScore = 100;
  if (sleepDuration < 7.5) {
    sleepDurationScore = Math.max(0, 100 - (7.5 - sleepDuration) * 25);
  } else if (sleepDuration > 9) {
    sleepDurationScore = Math.max(0, 100 - (sleepDuration - 9) * 15);
  }
  const sleepScore = Math.round(sleepDurationScore * (sleepQuality / 5));

  // B. Energy Score
  const energyScore = energy * 20;

  // C. Stress Score (Inverse: low stress = high score)
  const stressScore = (6 - stress) * 20;

  // D. Hydration Score
  const hydrationTarget = 2.0; // standard 2 Litres target
  const hydrationScore = Math.min(100, Math.round((hydration / hydrationTarget) * 100));

  // E. Recovery Score (Calculated from challenging workouts in the past 24 hours)
  let recoveryScore = 100;
  const challengingWorkouts = recentActivities.filter(
    (a) => a.intensity === 'challenging' && a.durationMinutes >= 30
  );
  if (challengingWorkouts.length >= 2) {
    recoveryScore = 30; // heavy strain
  } else if (challengingWorkouts.length === 1) {
    recoveryScore = 60; // moderate strain
  } else if (recentActivities.length > 0) {
    recoveryScore = 85; // light strain
  }

  // F. Cycle Score
  let cycleScore = 80; // neutral
  if (cycleState.phase === 'follicular' || cycleState.phase === 'ovulatory') {
    cycleScore = 100; // Estrogen peak, typically high energy baseline
  } else if (cycleState.phase === 'menstrual') {
    cycleScore = 60;  // System strain
  } else if (cycleState.phase === 'luteal') {
    cycleScore = 75;  // Baseline Progesterone load
  }

  // Symptoms penalty
  const symptomDeductions = symptoms.filter((s) =>
    ['cramps', 'bloating', 'fatigue', 'headache'].includes(s.toLowerCase())
  ).length * 15;
  cycleScore = Math.max(0, cycleScore - symptomDeductions);

  // 3. Weight Contributions
  const sleepContribution = sleepScore * 0.35;
  const energyContribution = energyScore * 0.25;
  const stressContribution = stressScore * 0.15;
  const hydrationContribution = hydrationScore * 0.10;
  const recoveryContribution = recoveryScore * 0.10;
  const cycleContribution = cycleScore * 0.05;

  const rawScore =
    sleepContribution +
    energyContribution +
    stressContribution +
    hydrationContribution +
    recoveryContribution +
    cycleContribution;

  const score = Math.round(rawScore);

  // Determine Level
  let level: ReadinessLevel = 'moderate';
  if (score >= 85) {
    level = 'high';
  } else if (score >= 65) {
    level = 'good';
  } else if (score >= 45) {
    level = 'moderate';
  } else {
    level = 'low';
  }

  // Factors List with explicit "WHY" explanations
  const factors: ReadinessFactor[] = [
    {
      name: 'Sleep Recovery',
      score: sleepScore,
      contribution: Math.round(sleepContribution),
      explanation: `${sleepDuration} hrs logged (Quality ${sleepQuality}/5). ${
        sleepScore >= 80
          ? 'Deep restorative sleep promotes cellular tissue repair and mental focus.'
          : 'Sub-optimal sleep increases physical fatigue and lowers muscular stamina.'
      }`,
    },
    {
      name: 'Energy & Vitality',
      score: energyScore,
      contribution: Math.round(energyContribution),
      explanation: `Self-rated energy level ${energy}/5. ${
        energyScore >= 80
          ? 'Optimal glycogen reserves and high baseline physical readiness.'
          : 'Lower glycogen availability; lighter movement is recommended.'
      }`,
    },
    {
      name: 'Stress Index',
      score: stressScore,
      contribution: Math.round(stressContribution),
      explanation: `Self-rated stress level ${stress}/5. ${
        stressScore >= 70
          ? 'Low systemic cortisol allows high-intensity effort without burnout.'
          : 'Elevated stress increases central nervous system recovery demands.'
      }`,
    },
    {
      name: 'Hydration Target',
      score: hydrationScore,
      contribution: Math.round(hydrationContribution),
      explanation: `${hydration} L logged today (Target ${hydrationTarget} L). ${
        hydrationScore >= 80
          ? 'Optimal hydration supports joint lubrication & nutrient delivery.'
          : 'Below target; mild dehydration impairs muscle endurance.'
      }`,
    },
    {
      name: 'Workout Recovery',
      score: recoveryScore,
      contribution: Math.round(recoveryContribution),
      explanation: `${
        recentActivities.length > 0
          ? `${recentActivities.length} recent activity record(s) in past 24 hrs.`
          : 'No heavy physical strain logged in past 24 hrs.'
      } ${
        recoveryScore >= 80
          ? 'Neuromuscular system is well recovered and ready for exertion.'
          : 'Significant muscular strain present; prioritize recovery.'
      }`,
    },
    {
      name: 'Cycle Synchronization',
      score: cycleScore,
      contribution: Math.round(cycleContribution),
      explanation: `Day ${cycleState.cycleDay} • ${cycleState.phase.toUpperCase()} phase. ${
        cycleState.phase === 'follicular' || cycleState.phase === 'ovulatory'
          ? 'Rising estrogen boosts strength output, endurance, and pain tolerance.'
          : cycleState.phase === 'menstrual'
          ? 'Low hormone baseline; active recovery or light mobility is ideal.'
          : 'Progesterone rise naturally elevates resting heart rate and body temp.'
      }`,
    },
  ];

  // 4. Generate Recommendation
  const recommendation = selectRecommendation(score, level, cycleState.phase, userGoal, symptoms);

  return {
    score,
    level,
    factors,
    recommendation,
  };
}

/**
 * Rules-based recommendation selection.
 */
function selectRecommendation(
  score: number,
  level: ReadinessLevel,
  phase: string,
  goal: string,
  symptoms: string[]
): DailyRecommendation {
  const hasCramps = symptoms.some((s) => s.toLowerCase() === 'cramps');
  if (hasCramps) {
    return {
      activityType: 'MOBILITY',
      durationMinutes: 20,
      intensity: 'easy',
      title: 'Cramp Relief Flow',
      recKey: 'crampRelief',
      explanation: 'Active cramps can make standard workouts uncomfortable. A gentle mobility session focusing on stretching the lower back and pelvis is recommended to help alleviate flow symptoms.',
      recoveryNote: 'Try gentle deep belly breathing in child\'s pose.',
    };
  }

  const hasCrampsOrFatigue = symptoms.some((s) =>
    ['cramps', 'fatigue'].includes(s.toLowerCase())
  );

  // LOW READINESS -> Prioritize Rest
  if (level === 'low' || hasCrampsOrFatigue && score < 50) {
    return {
      activityType: 'REST',
      intensity: 'easy',
      title: 'Rest & Restore',
      recKey: 'restRestore',
      explanation: 'Your readiness is low today. Taking a full rest day supports hormonal balance and rebuilds muscle stores. Give yourself some grace.',
      recoveryNote: 'Try 5 minutes of mindful box breathing or a warm bath tonight.',
    };
  }

  // MODERATE READINESS
  if (level === 'moderate') {
    if (phase === 'menstrual') {
      return {
        activityType: 'MOBILITY',
        durationMinutes: 20,
        intensity: 'easy',
        title: 'Gentle Mobility',
      recKey: 'gentleMobility',
        explanation: 'Gentle stretching and mobility work help alleviate menstrual cramps and bloating by improving blood circulation to the pelvic area.',
        recoveryNote: 'Focus on child pose and deep diaphragmatic breathing.',
      };
    }

    return {
      activityType: 'WALK',
      durationMinutes: 30,
      intensity: 'easy',
      title: 'Active Recovery Walk',
      recKey: 'activeWalk',
      explanation: 'A moderate active recovery day. An easy walk keeps consistency high without draining your battery or causing muscle fatigue.',
    };
  }

  // GOOD / HIGH READINESS -> Estrogen/Phase specific targets
  if (phase === 'follicular' || phase === 'ovulatory') {
    const isHigh = level === 'high';
    const duration = isHigh ? 45 : 35;
    
    if (goal === 'gain' || goal === 'lose') {
      return {
        activityType: isHigh ? 'HIGHER_INTENSITY_STRENGTH' : 'STRENGTH',
        durationMinutes: duration,
        intensity: isHigh ? 'challenging' : 'moderate',
        title: isHigh ? 'Progressive Strength Session' : 'Steady Strength Session',
      recKey: 'progStrength',
        explanation: 'You are in your Estrogen peak phase and your readiness is strong. Estrogen levels support muscle building and higher recovery, making this a prime day for strength load.',
        recoveryNote: 'Ensure you hydrate and consume adequate protein post-workout.',
      };
    }

    return {
      activityType: 'STRENGTH',
      durationMinutes: 40,
      intensity: 'moderate',
      title: 'Balanced Strength Workout',
      recKey: 'balancedStrength',
      explanation: 'Your hormone profiles are well-aligned for metabolic load and muscle output. Push with moderate weights and enjoy the flow.',
    };
  }

  if (phase === 'luteal') {
    return {
      activityType: 'STRENGTH',
      durationMinutes: 35,
      intensity: 'moderate',
      title: 'Focus Strength Session',
      recKey: 'focusStrength',
      explanation: 'Hormones are shifting, and progesterone levels mean baseline heart rates are slightly higher. A moderate strength session with longer rests is highly effective today.',
      recoveryNote: 'Progesterone makes body heat regulation harder, so work out in a cool space.',
    };
  }

  if (phase === 'menstrual') {
    return {
      activityType: 'LIGHT_MOVEMENT',
      durationMinutes: 25,
      intensity: 'easy',
      title: 'Light Strength / Flow',
      recKey: 'lightStrength',
      explanation: 'Your readiness is good, but keep in mind your body is actively menstruating. A light strength session or a gentle flow increases pelvic blood flow, which naturally reduces cramp severity.',
    };
  }

  // Default Fallback
  return {
    activityType: 'WALK',
    durationMinutes: 30,
    intensity: 'moderate',
    title: 'Easy Walk',
      recKey: 'easyWalk',
    explanation: 'A simple walk to get your body moving, keep joint mobility, and get fresh air.',
  };
}
