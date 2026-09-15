import { CyclePhase } from '../../types';

export type WorkoutIntent = 'debloat' | 'strength' | 'energy' | 'restorative';
export type WeightGoal = 'lose' | 'maintain' | 'gain' | 'wellness';

export interface WorkoutRoutine {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  intensity: 'low' | 'moderate' | 'high';
  intent: WorkoutIntent;
  recommendedPhases: CyclePhase[];
  weightGoalTags: WeightGoal[];
  estimatedCalories: number;
  activityType: 'yoga' | 'strength' | 'cardio' | 'walking';
  imageUrl?: any;
  tutorialMarkdown?: string;
}

export const MOVEMENT_LIBRARY: WorkoutRoutine[] = [
  // De-Bloat & Mobility Flows
  {
    id: 'm1',
    title: 'Menstrual Relief Flow',
    description: 'Gentle stretches focusing on the lower back and pelvic floor to ease cramps and reduce bloating.',
    durationMinutes: 15,
    intensity: 'low',
    intent: 'debloat',
    recommendedPhases: ['menstrual'],
    weightGoalTags: ['lose', 'maintain', 'gain', 'wellness'],
    estimatedCalories: 60,
    activityType: 'yoga',
    imageUrl: require('../../../assets/images/workout_placeholder.jpg'),
    tutorialMarkdown: `## Overview
This gentle flow is designed specifically for the early days of your period. It focuses on opening the hips, releasing lower back tension, and promoting blood flow to the pelvic region to soothe cramps.

## Step-by-Step Guide
1. **Child's Pose (Balasana) - 3 mins**
   * Kneel on the floor, toes together, knees wide apart. Reach your arms forward and rest your forehead on the mat.
2. **Cat-Cow Stretch - 2 mins**
   * Move to hands and knees. Inhale to arch back (Cow), exhale to round spine (Cat).
3. **Supine Twist - 2 mins per side**
   * Lie on your back, hug knees to chest. Drop both knees to the right, gaze to the left.

## ⚠️ Precautions & Contraindications
- **Who Should Skip**: Avoid deep twists if you have acute spinal disc herniation.
- **Modifications**: If your knees hurt in Child's Pose, place a rolled blanket behind your knees.

## Coach's Tip
Don't push yourself today. If a stretch feels too intense, back off. Your primary goal is relaxation and nervous system down-regulation.`
  },
  {
    id: 'm2',
    title: 'Luteal De-Stress Yoga',
    description: 'A calming flow to release tension and lower cortisol during the PMS window.',
    durationMinutes: 20,
    intensity: 'low',
    intent: 'debloat',
    recommendedPhases: ['luteal'],
    weightGoalTags: ['lose', 'maintain', 'gain', 'wellness'],
    estimatedCalories: 80,
    activityType: 'yoga',
    imageUrl: require('../../../assets/images/workout_placeholder.jpg'),
    tutorialMarkdown: `## Overview
During the late luteal phase, cortisol levels naturally run higher. This flow focuses on forward folds and slow breathing to trigger the parasympathetic nervous system.

## Step-by-Step Guide
1. **Seated Forward Fold - 3 mins**
   * Sit with legs extended. Inhale to lengthen spine, exhale to hinge forward at the hips.
2. **Pigeon Pose - 3 mins per side**
   * Bring your right knee behind your right wrist. Extend left leg back. Fold over your front leg.
3. **Legs Up the Wall (Viparita Karani) - 5 mins**
   * Lie on your back with your hips close to a wall, legs extended straight up the wall.

## ⚠️ Precautions & Contraindications
- **Who Should Skip**: Avoid Pigeon Pose if you have severe knee or hip injuries. Substitute with a Supine Figure 4 stretch.
- **Safety**: Do not force the forward fold. Keep a micro-bend in the knees if your hamstrings are tight.

## Coach's Tip
Breathe into the belly, not the chest. Long, slow exhales are the secret to lowering cortisol.`
  },
  
  // Hormone-Safe Strength Circuits
  {
    id: 's1',
    title: 'Follicular Build Circuit',
    description: 'Progressive bodyweight strength training to capitalize on rising estrogen.',
    durationMinutes: 30,
    intensity: 'moderate',
    intent: 'strength',
    recommendedPhases: ['follicular'],
    weightGoalTags: ['maintain', 'gain', 'wellness'],
    estimatedCalories: 180,
    activityType: 'strength',
    imageUrl: require('../../../assets/images/workout_placeholder.jpg'),
    tutorialMarkdown: `## Overview
Estrogen builds muscle! As it rises in your follicular phase, your body recovers faster. This circuit pushes your muscles without heavy equipment.

## Step-by-Step Guide (Repeat 3x)
1. **Push-ups - 10-15 reps**
   * Keep elbows at a 45-degree angle. Drop to knees if needed.
2. **Bodyweight Squats - 20 reps**
   * Drive through the heels. Keep chest up.
3. **Plank with Shoulder Taps - 20 taps**
   * Keep hips entirely stable. Widen feet for more balance.

## ⚠️ Precautions & Contraindications
- **Who Should Skip**: Avoid if recovering from acute shoulder (rotator cuff) injury.
- **Form Warning**: During push-ups, do not let your lower back sag. If it does, elevate your hands on a bench or drop to your knees.

## Coach's Tip
Focus on the eccentric (lowering) phase of the squat. Take 3 full seconds to lower down.`
  },
  {
    id: 's2',
    title: 'Luteal Slow Burn Pilates',
    description: 'Low-impact resistance work that builds strength without spiking cortisol.',
    durationMinutes: 25,
    intensity: 'moderate',
    intent: 'strength',
    recommendedPhases: ['luteal', 'follicular'],
    weightGoalTags: ['lose', 'maintain', 'wellness'],
    estimatedCalories: 140,
    activityType: 'yoga',
    imageUrl: require('../../../assets/images/workout_placeholder.jpg'),
    tutorialMarkdown: `## Overview
Intense workouts during the luteal phase can spike cortisol and worsen PMS. This pilates routine focuses on time-under-tension to build strength safely.

## Step-by-Step Guide
1. **Clamshells - 20 reps per side**
   * Lie on your side, knees bent. Keeping feet together, lift the top knee.
2. **Bird-Dog - 15 reps per side**
   * On all fours. Extend right arm and left leg simultaneously.
3. **Hundred - 10 breaths**
   * Lie on back, legs in tabletop, head lifted. Pump arms while inhaling for 5 counts and exhaling for 5.

## ⚠️ Precautions & Contraindications
- **Neck Pain**: If your neck hurts during the Hundred, keep your head resting on the mat.
- **Lower Back**: Do not let your lower back arch off the floor during core exercises.

## Coach's Tip
The slower you go, the harder it is. Resist the urge to use momentum.`
  },
  {
    id: 's3',
    title: 'Peak Ovulatory PRs',
    description: 'Heavy resistance and compound movements when testosterone and estrogen are highest.',
    durationMinutes: 45,
    intensity: 'high',
    intent: 'strength',
    recommendedPhases: ['ovulatory'],
    weightGoalTags: ['gain', 'maintain', 'wellness'],
    estimatedCalories: 280,
    activityType: 'strength',
    imageUrl: require('../../../assets/images/workout_placeholder.jpg'),
    tutorialMarkdown: `## Overview
Testosterone and estrogen peak around ovulation, making you stronger and more resilient to muscle damage. This is the time to lift heavy!

## Step-by-Step Guide
1. **Barbell Deadlifts - 5 sets of 5 reps**
2. **Overhead Press - 4 sets of 8 reps**
3. **Pull-ups (or Lat Pulldowns) - 4 sets of 8 reps**
4. **Weighted Lunges - 3 sets of 10 per leg**

## ⚠️ Precautions & Contraindications
- **Spotter Required**: Always use a spotter or safety racks when lifting near your 1-Rep Max.
- **Who Should Skip**: Do not attempt heavy deadlifts if you have untreated pelvic floor dysfunction or acute lower back pain.
- **Weight Limits**: Ensure you can maintain perfect form for the first 3 reps. If form breaks down, drop the weight immediately.

## Coach's Tip
Rest for a full 2-3 minutes between sets. This is about maximal force production, not cardiovascular endurance.`
  },

  // Energy-Burst Combos
  {
    id: 'e1',
    title: 'Ovulatory HIIT Spike',
    description: 'High-intensity intervals designed for your peak energy days.',
    durationMinutes: 20,
    intensity: 'high',
    intent: 'energy',
    recommendedPhases: ['ovulatory'],
    weightGoalTags: ['lose', 'wellness'],
    estimatedCalories: 220,
    activityType: 'cardio',
    imageUrl: require('../../../assets/images/workout_placeholder.jpg'),
    tutorialMarkdown: `## Overview
Quick, explosive bursts of cardio to maximize fat burning when your body is primed to handle high-stress intervals.

## Step-by-Step Guide (40s work, 20s rest)
1. **Burpees**
2. **Jump Squats**
3. **Mountain Climbers**
4. **High Knees**
*Repeat the entire circuit 4 times.*

## ⚠️ Precautions & Contraindications
- **Joint Health**: High impact! Avoid if you have knee arthritis, ankle instability, or shin splints.
- **Pelvic Floor**: Jumping can stress the pelvic floor. Substitute with fast-paced step-outs if you experience any leaking or heaviness.

## Coach's Tip
Pace yourself on round one. You want to survive until round four!`
  },
  {
    id: 'e2',
    title: 'Follicular Power Dance',
    description: 'Upbeat, continuous movement to match your growing energy levels.',
    durationMinutes: 25,
    intensity: 'moderate',
    intent: 'energy',
    recommendedPhases: ['follicular', 'ovulatory'],
    weightGoalTags: ['lose', 'maintain', 'wellness'],
    estimatedCalories: 160,
    activityType: 'cardio',
    imageUrl: require('../../../assets/images/workout_placeholder.jpg'),
    tutorialMarkdown: `## Overview
A fun, rhythm-based aerobic workout to get your heart rate up and release endorphins.

## Step-by-Step Guide
Put on a high-energy playlist (120-130 BPM). 
1. **Side-to-Side Step Touches - 5 mins** (Warmup)
2. **Grapevines with Arm Reaches - 5 mins**
3. **Continuous Jumping Jacks or Step-Jacks - 5 mins**
4. **Freestyle / Free movement - 5 mins**
5. **Slow Walking - 5 mins** (Cooldown)

## ⚠️ Precautions & Contraindications
- **Safety**: Ensure your workout area is clear of rugs or tripping hazards before dancing.
- **Footwear**: Wear supportive sneakers, even indoors, to protect your arches.

## Coach's Tip
Don't worry about looking perfect. It's about keeping your heart rate elevated and having fun.`
  },

  // Restorative
  {
    id: 'r1',
    title: 'Deep Rest Yin',
    description: 'Long-hold stretches to ground the nervous system.',
    durationMinutes: 30,
    intensity: 'low',
    intent: 'restorative',
    recommendedPhases: ['menstrual', 'luteal'],
    weightGoalTags: ['lose', 'maintain', 'gain', 'wellness'],
    estimatedCalories: 90,
    activityType: 'yoga',
    imageUrl: require('../../../assets/images/workout_placeholder.jpg'),
    tutorialMarkdown: `## Overview
Yin yoga targets the deep connective tissues (fascia) rather than the muscles. Postures are held passively for several minutes.

## Step-by-Step Guide
1. **Butterfly Pose - 5 mins**
   * Soles of feet together, fold forward. Let the spine round.
2. **Supported Bridge - 5 mins**
   * Place a block or firm pillow under your sacrum. Rest arms out wide.
3. **Savasana - 10 mins**
   * Total stillness.

## ⚠️ Precautions & Contraindications
- **Hypermobility**: If you are hypermobile (e.g., Ehlers-Danlos), do not push to your end range of motion in Yin yoga. Back off by 20% to protect your joints.
- **Props**: Use blocks or pillows to support your joints so the muscles can fully disengage.

## Coach's Tip
It is normal for the mind to wander during long holds. Notice the thoughts, then return focus to your breath.`
  },
  {
    id: 'r2',
    title: 'Incline Walking Series',
    description: 'Steady-state cardio that burns energy without stressing the adrenals.',
    durationMinutes: 40,
    intensity: 'moderate',
    intent: 'restorative',
    recommendedPhases: ['luteal', 'menstrual'],
    weightGoalTags: ['lose', 'maintain', 'wellness'],
    estimatedCalories: 200,
    activityType: 'walking',
    imageUrl: require('../../../assets/images/workout_placeholder.jpg'),
    tutorialMarkdown: `## Overview
Incline walking elevates the heart rate and engages the glutes and calves heavily, all while keeping cortisol relatively stable compared to running.

## Step-by-Step Guide
1. **Warmup**: 5 mins at 3.0 mph, 0% incline.
2. **Climb**: 10 mins at 3.0 mph, 5% incline.
3. **Peak**: 15 mins at 3.2 mph, 10-12% incline.
4. **Cooldown**: 10 mins at 2.5 mph, 0% incline.

## ⚠️ Precautions & Contraindications
- **Lower Back**: Walking at a steep incline can cause you to lean forward and strain your lower back. Keep your chest up!
- **Handrails**: Do not hold onto the treadmill handrails and lean backward—this negates the benefit of the incline and ruins your posture. Lower the speed if you must hold on.

## Coach's Tip
Pump your arms to drive momentum. Strike with the heel and push off forcefully with the toes.`
  },

  // -- NEW HOME WORKOUTS --
  {
    id: 'h1',
    title: 'Living Room Dumbbell Circuit',
    description: 'A quick 30m circuit using light dumbbells to build strength without leaving home.',
    durationMinutes: 30,
    intensity: 'moderate',
    intent: 'strength',
    recommendedPhases: ['follicular', 'ovulatory'],
    weightGoalTags: ['lose', 'maintain', 'gain', 'wellness'],
    estimatedCalories: 200,
    activityType: 'strength',
    imageUrl: require('../../../assets/images/workout_placeholder.jpg'),
    tutorialMarkdown: `## Overview
Perfect for building lean muscle at home when your energy is rising. All you need is a pair of light to medium dumbbells and a mat.

## Step-by-Step Guide (Repeat 3-4 times)
1. **Goblet Squats** - 12 reps
   * Hold one dumbbell vertically at your chest. Keep your chest up and squat down until your thighs are parallel to the floor.
2. **Dumbbell Floor Press** - 10 reps
   * Lie on your back, knees bent. Press both dumbbells up until your arms are straight.
3. **Alternating Reverse Lunges** - 10 reps per leg
   * Hold dumbbells by your sides. Step one foot back and lower your hips.
4. **Bent Over Rows** - 12 reps
   * Hinge at the hips, keeping your back flat. Pull the dumbbells up to your ribcage.
   
## ⚠️ Precautions & Contraindications
- **Lower Back Safety**: For Bent Over Rows, if you feel strain in your lower back, support your chest on an incline bench or substitute with single-arm rows leaning on a couch.
- **Knee Safety**: During lunges, ensure your front knee tracks over your toes but does not cave inward.

## Coach's Tip
Focus on the mind-muscle connection. Lower the weight slowly (eccentric phase) for maximum muscle engagement.`
  },
  {
    id: 'h2',
    title: 'Bodyweight Core & Glutes',
    description: 'High-burn mat workout to target the core and glutes using just your bodyweight.',
    durationMinutes: 20,
    intensity: 'high',
    intent: 'energy',
    recommendedPhases: ['ovulatory'],
    weightGoalTags: ['lose', 'maintain', 'wellness'],
    estimatedCalories: 150,
    activityType: 'strength',
    imageUrl: require('../../../assets/images/workout_placeholder.jpg'),
    tutorialMarkdown: `## Overview
A fast, fiery workout that requires zero equipment. Ideal for ovulatory days when you have energy to burn but don't want to use heavy weights.

## Step-by-Step Guide (45s work / 15s rest, Repeat 3 times)
1. **Glute Bridges with Squeeze**
2. **Plank Shoulder Taps**
3. **Donkey Kicks**
4. **Bicycle Crunches**
   
## ⚠️ Precautions & Contraindications
- **Who Should Skip**: If you have Diastasis Recti (abdominal separation post-partum), avoid Bicycle Crunches and Planks. Substitute with dead bugs and heel slides.
- **Wrist Pain**: If planks hurt your wrists, perform them on your forearms (dolphin plank).

## Coach's Tip
Keep your core braced the entire time. Imagine pulling your belly button towards your spine during the glute exercises to protect your lower back.`
  },
  {
    id: 'h3',
    title: 'PMS Evening Pilates',
    description: 'Gentle mat flow focusing on deep core and pelvic floor relaxation.',
    durationMinutes: 25,
    intensity: 'low',
    intent: 'debloat',
    recommendedPhases: ['luteal', 'menstrual'],
    weightGoalTags: ['lose', 'maintain', 'gain', 'wellness'],
    estimatedCalories: 100,
    activityType: 'yoga',
    imageUrl: require('../../../assets/images/workout_placeholder.jpg'),
    tutorialMarkdown: `## Overview
When PMS hits, cortisol is naturally higher. This pilates routine keeps the intensity low, focusing on deep breathing and stretching.

## Step-by-Step Guide
1. **Pelvic Tilts - 2 mins**
2. **Modified Dead Bug - 2 mins**
3. **Supine Figure 4 Stretch - 2 mins per leg**
   
## ⚠️ Precautions & Contraindications
- **Pelvic Floor Safety**: If you experience pelvic pain during your period, keep the pelvic tilts extremely small. Do not aggressively clench your pelvic floor; focus on the release.
- **Sciatica**: If the Figure 4 stretch causes shooting pain down your leg, release the stretch immediately.

## Coach's Tip
Sync your movement with your breath. Inhale to prepare, exhale on the exertion.`
  },

  // -- NEW GYM WORKOUTS --
  {
    id: 'g1',
    title: 'Heavy Lower Body / Glute Focus',
    description: 'Squats, deadlifts, and heavy resistance for peak hormone days.',
    durationMinutes: 45,
    intensity: 'high',
    intent: 'strength',
    recommendedPhases: ['follicular', 'ovulatory'],
    weightGoalTags: ['gain', 'maintain', 'wellness'],
    estimatedCalories: 280,
    activityType: 'strength',
    imageUrl: require('../../../assets/images/workout_placeholder.jpg'),
    tutorialMarkdown: `## Overview
Capitalize on your estrogen peak by lifting heavy! This is the perfect time in your cycle to push for Personal Records (PRs) and build strength.

## Step-by-Step Guide
1. **Barbell Squats** - 4 sets of 6-8 reps
2. **Romanian Deadlifts (RDLs)** - 3 sets of 8-10 reps
3. **Bulgarian Split Squats** - 3 sets of 10 reps per leg
4. **Leg Press** - 3 sets of 12 reps

## ⚠️ Precautions & Contraindications
- **Spotter Required**: Always squat inside a power rack with safety pins set, or use a spotter.
- **Weight Limits**: Do not increase your working weight by more than 5-10% per week.
- **Contraindications**: Skip heavy axial loading (barbell squats) if you have active spinal disc issues. Substitute with Leg Press or Hack Squat.

## Coach's Tip
Make sure you are properly fueled before this session. Eat a carb-rich snack 45 minutes prior!`
  },
  {
    id: 'g2',
    title: 'Upper Body Pull & Push',
    description: 'Machine and dumbbell upper body split to build a strong, toned back and shoulders.',
    durationMinutes: 40,
    intensity: 'moderate',
    intent: 'strength',
    recommendedPhases: ['follicular', 'ovulatory'],
    weightGoalTags: ['lose', 'maintain', 'gain', 'wellness'],
    estimatedCalories: 220,
    activityType: 'strength',
    imageUrl: require('../../../assets/images/workout_placeholder.jpg'),
    tutorialMarkdown: `## Overview
A comprehensive upper body session balancing pulling and pushing movements to improve posture and upper body strength.

## Step-by-Step Guide (3 Sets Each)
1. **Lat Pulldowns** - 10-12 reps
2. **Dumbbell Shoulder Press** - 8-10 reps
3. **Seated Cable Rows** - 12 reps
4. **Push-Ups (or assisted)** - AMRAP (As Many Reps As Possible)

## ⚠️ Precautions & Contraindications
- **Shoulder Safety**: Do not pull the Lat Pulldown bar behind your neck. Always pull it down to your clavicle (upper chest) to protect your rotator cuffs.
- **Hypertension**: If you have high blood pressure, avoid holding your breath (Valsalva maneuver). Exhale smoothly on the push/pull.

## Coach's Tip
Keep your shoulders pulled down and away from your ears, especially during lat pulldowns and rows.`
  },
  {
    id: 'g3',
    title: 'Luteal Deload Machine Circuit',
    description: 'Machine-only circuit to maintain strength safely without spiking cortisol.',
    durationMinutes: 30,
    intensity: 'moderate',
    intent: 'strength',
    recommendedPhases: ['luteal'],
    weightGoalTags: ['lose', 'maintain', 'wellness'],
    estimatedCalories: 180,
    activityType: 'strength',
    imageUrl: require('../../../assets/images/workout_placeholder.jpg'),
    tutorialMarkdown: `## Overview
During your luteal phase, recovery is slower. Machines offer stability, reducing the strain on your central nervous system while still allowing you to lift.

## Step-by-Step Guide (2-3 Sets)
1. **Leg Extension Machine** - 12 reps
2. **Hamstring Curl Machine** - 12 reps
3. **Chest Press Machine** - 12 reps
4. **Pec Deck / Rear Delt Fly** - 12 reps

## ⚠️ Precautions & Contraindications
- **Knee Health**: If you have Patellofemoral Pain Syndrome (runner's knee), lighten the weight on the Leg Extension or skip it entirely, as it places high sheer force on the kneecap.
- **Adjustment**: Always adjust the machine pivots to align precisely with your joints before lifting.

## Coach's Tip
Do not lift to failure today. Leave 2-3 reps in the tank on every set.`
  },

  // -- NEW BASIC CARDIO --
  {
    id: 'c1',
    title: 'Neighborhood Power Walk',
    description: '45m LISS cardio for fat burning and active recovery.',
    durationMinutes: 45,
    intensity: 'low',
    intent: 'restorative',
    recommendedPhases: ['luteal', 'menstrual', 'follicular'],
    weightGoalTags: ['lose', 'maintain', 'wellness'],
    estimatedCalories: 250,
    activityType: 'walking',
    imageUrl: require('../../../assets/images/workout_placeholder.jpg'),
    tutorialMarkdown: `## Overview
Low-Intensity Steady State (LISS) cardio is incredible for fat oxidation and nervous system regulation.

## Step-by-Step Guide
* **Pace:** Maintain a brisk pace where you can still hold a conversation, but you feel your heart rate elevate.
* **Posture:** Pump your arms and strike with your heel, rolling through to the toe.
* **Environment:** Try to walk outside if possible to regulate circadian rhythms.

## ⚠️ Precautions & Contraindications
- **Safety First**: If walking early in the morning or at night, wear reflective gear and stick to well-lit paths.
- **Footwear**: Replace your walking shoes every 300-500 miles to prevent plantar fasciitis.

## Coach's Tip
Listen to a podcast or an audiobook to make the time fly by.`
  },
  {
    id: 'c2',
    title: '3k Jog / Run',
    description: '30m steady state run to boost cardiovascular health.',
    durationMinutes: 30,
    intensity: 'high',
    intent: 'energy',
    recommendedPhases: ['follicular', 'ovulatory'],
    weightGoalTags: ['lose', 'maintain', 'wellness'],
    estimatedCalories: 300,
    activityType: 'cardio',
    imageUrl: require('../../../assets/images/workout_placeholder.jpg'),
    tutorialMarkdown: `## Overview
When your energy is high, hitting the pavement is a great way to clear your head and build endurance.

## Step-by-Step Guide
1. **Warm Up (5 mins):** Brisk walking, high knees, dynamic leg swings.
2. **Run (20 mins):** Aim for a consistent pace. If you need to stop and walk, that's perfectly fine! Try intervals (e.g., run 2 mins, walk 1 min).
3. **Cool Down (5 mins):** Slow walk and static calf/quad stretches.

## ⚠️ Precautions & Contraindications
- **Who Should Skip**: Avoid running if you have active joint inflammation, severe flat feet without orthotics, or are recovering from pelvic floor prolapse.
- **Hydration**: Drink 16oz of water 2 hours before your run.

## Coach's Tip
Focus on your breathing. Try to inhale for 3 steps, exhale for 3 steps.`
  },
  {
    id: 'c3',
    title: 'Steady State Swimming',
    description: 'Zero-impact full body conditioning.',
    durationMinutes: 30,
    intensity: 'moderate',
    intent: 'restorative',
    recommendedPhases: ['menstrual', 'luteal', 'follicular', 'ovulatory'],
    weightGoalTags: ['lose', 'maintain', 'gain', 'wellness'],
    estimatedCalories: 250,
    activityType: 'cardio',
    imageUrl: require('../../../assets/images/workout_placeholder.jpg'),
    tutorialMarkdown: `## Overview
Swimming provides resistance training and cardio simultaneously with absolutely zero joint impact. Perfect for luteal bloating!

## Step-by-Step Guide
* Swim continuous laps at a moderate pace. 
* Mix up your strokes (Freestyle, Breaststroke, Backstroke) to engage different muscle groups.

## ⚠️ Precautions & Contraindications
- **Shoulder Health**: If you have a history of swimmer's shoulder (impingement), avoid Butterfly and excessive Freestyle. Stick to Breaststroke.
- **Hygiene**: Always shower before and after entering a public pool.

## Coach's Tip
Don't forget to hydrate! It's easy to forget to drink water when you're in the pool.`
  },
  {
    id: 'c4',
    title: 'Cycling / Spin Class',
    description: 'High energy indoor cycling to torch calories and build leg endurance.',
    durationMinutes: 45,
    intensity: 'high',
    intent: 'energy',
    recommendedPhases: ['follicular', 'ovulatory'],
    weightGoalTags: ['lose', 'maintain', 'wellness'],
    estimatedCalories: 400,
    activityType: 'cardio',
    imageUrl: require('../../../assets/images/workout_placeholder.jpg'),
    tutorialMarkdown: `## Overview
A high-energy, sweat-inducing workout perfect for the days leading up to ovulation.

## Step-by-Step Guide
* **Warm Up (5 mins):** Light resistance, high cadence (90+ RPM).
* **Intervals (30 mins):** Alternate between heavy resistance (climbs) and low resistance/fast pace (sprints).
* **Cool Down (10 mins):** Light resistance, let your heart rate drop below 100 BPM before getting off the bike.

## ⚠️ Precautions & Contraindications
- **Bike Setup**: Ensure your saddle height is correct (slight bend in the knee at the bottom of the stroke). Riding too low causes knee pain; riding too high causes hip rocking.
- **Lower Back**: Do not round your lower back when reaching for the handlebars. Keep your chest open.

## Coach's Tip
Drive through your heels, not your toes, to engage your glutes rather than overworking your quads.`
  }
];

export const getRecommendedWorkoutsForPhase = (phase: CyclePhase, weightGoal?: string): WorkoutRoutine[] => {
  let recommended = MOVEMENT_LIBRARY.filter(w => w.recommendedPhases.includes(phase));
  
  if (weightGoal) {
    recommended.sort((a, b) => {
      const aMatches = a.weightGoalTags.includes(weightGoal as WeightGoal);
      const bMatches = b.weightGoalTags.includes(weightGoal as WeightGoal);
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0;
    });
  }
  
  return recommended;
};

export const getWorkoutsByIntent = (intent: WorkoutIntent): WorkoutRoutine[] => {
  return MOVEMENT_LIBRARY.filter(w => w.intent === intent);
};

export const getWorkoutById = (id: string): WorkoutRoutine | undefined => {
  return MOVEMENT_LIBRARY.find(w => w.id === id);
};
