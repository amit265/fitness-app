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
  imageName: string;
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
    imageUrl: require('../../../assets/images/workouts/menstrual_relief_flow.jpg'),
    imageName: 'menstrual_relief_flow.jpg',
    tutorialMarkdown: `## Overview
This gentle flow is designed specifically for the early days of your period to help you feel better. It focuses on opening the hips, releasing lower back tension, and promoting blood flow to the pelvic region to soothe cramps.

## Before You Begin
- **Equipment:** Yoga mat, a rolled blanket or pillow (optional)
- **Space:** Just enough room to lay down fully on your mat

## Warm-Up (3-5 min)
- **Neck Rolls:** Slowly roll your neck in circles, 5 times each direction.
- **Shoulder Shrugs:** Inhale shoulders to ears, exhale drop them down, 10 times.

## Step-by-Step Guide
- **Child's Pose (Balasana) — 3 mins**
  - **How to do it:** Kneel on the floor, bring your big toes together, and spread your knees wide apart. Reach your arms forward and rest your forehead on the mat, letting your belly soften between your thighs.
  - **Beginner modification:** Place a rolled blanket under your knees or between your thighs and calves if your knees or hips are tight.

- **Cat-Cow Stretch — 2 mins**
  - **How to do it:** Come to hands and knees with wrists under shoulders and knees under hips. Inhale as you drop your belly and lift your chest (Cow), then exhale as you round your spine toward the ceiling (Cat).
  - **Beginner modification:** Perform seated in a chair, arching and rounding your back gently.

- **Supine Twist — 2 mins per side**
  - **How to do it:** Lie on your back and hug your knees to your chest. Drop both knees out to the right side while extending your left arm out and gazing to the left.
  - **Beginner modification:** Place a pillow between your knees to reduce the twist's intensity.

## ⚠️ Precautions & Contraindications
- **Who Should Skip:** Avoid deep twists if you have acute spinal disc herniation.
- **Form Warning:** Never force a stretch; it should feel relieving, not painful. If your knees hurt in Child's Pose, use a blanket.

## Cool-Down (3-5 min)
- **Knees-to-Chest Hug:** Lie on your back, pull knees to your chest, and rock side to side gently to massage the lower back.
- **Savasana:** Lay flat on your back with arms by your sides and eyes closed for 2 minutes.

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
    imageUrl: require('../../../assets/images/workouts/luteal_de_stress_yoga.jpg'),
    imageName: 'luteal_de_stress_yoga.jpg',
    tutorialMarkdown: `## Overview
During the late luteal phase, cortisol levels naturally run higher, leaving you prone to stress and tension. This restorative flow focuses on forward folds and slow breathing to trigger the parasympathetic nervous system, helping you deeply relax.

## Before You Begin
- **Equipment:** Yoga mat, wall space, optional cushion
- **Space:** Enough room for a mat, preferably near an empty wall

## Warm-Up (3-5 min)
- **Seated Torso Circles:** Sit cross-legged and slowly circle your torso over your hips, 5 times each direction.
- **Wrist Rolls:** Roll wrists gently to release tension before bearing weight.

## Step-by-Step Guide
- **Seated Forward Fold — 3 mins**
  - **How to do it:** Sit with legs extended straight in front of you. Inhale to lengthen your spine, and exhale as you slowly hinge forward at the hips, reaching toward your feet.
  - **Beginner modification:** Keep a generous bend in your knees or sit on the edge of a cushion.

- **Pigeon Pose — 3 mins per side**
  - **How to do it:** From hands and knees, bring your right knee forward behind your right wrist. Extend your left leg straight back. Slowly fold your upper body over your front leg.
  - **Beginner modification:** Substitute with a Supine Figure 4 stretch (lying on your back, crossing one ankle over the opposite knee).

- **Legs Up the Wall (Viparita Karani) — 5 mins**
  - **How to do it:** Sit sideways next to a wall, then swing your legs up the wall as you lie back onto the floor. Let your arms rest by your sides, palms facing up.
  - **Beginner modification:** Place a folded blanket under your hips for extra support.

## ⚠️ Precautions & Contraindications
- **Who Should Skip:** Avoid Pigeon Pose if you have severe knee or hip injuries. 
- **Form Warning:** Do not force the forward fold. Keep a micro-bend in the knees if your hamstrings are tight.

## Cool-Down (3-5 min)
- **Happy Baby Pose:** Lie on your back, bring knees toward armpits, grab the outsides of your feet, and rock gently.
- **Deep Belly Breathing:** Lay still and take 10 slow, deep breaths into your belly.

## Coach's Tip
Breathe into the belly, not the chest. Long, slow exhales are the secret to lowering cortisol and fully relaxing.`
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
    imageUrl: require('../../../assets/images/workouts/follicular_build_circuit.jpg'),
    imageName: 'follicular_build_circuit.jpg',
    tutorialMarkdown: `## Overview
Estrogen builds muscle! As your estrogen levels rise in the follicular phase, your body recovers faster and has more stamina. This circuit pushes your muscles using just your bodyweight, perfect for capitalizing on this high-energy window.

## Before You Begin
- **Equipment:** Yoga mat
- **Space:** A standard mat-sized space

## Warm-Up (3-5 min)
- **Arm Circles:** 10 big circles forward, 10 backward.
- **Bodyweight Squats (Slow):** 10 reps to warm up the hips and knees.
- **High Plank Hold:** 30 seconds to activate the core.

## Step-by-Step Guide (Repeat 3x)
- **Push-ups — 10-15 reps**
  - **How to do it:** Start in a high plank with hands slightly wider than shoulders. Lower your body until your chest is just above the floor, keeping elbows tucked at a 45-degree angle. Push back up to the start.
  - **Beginner modification:** Drop to your knees, ensuring a straight line from your knees to your head.

- **Bodyweight Squats — 20 reps**
  - **How to do it:** Stand with feet shoulder-width apart. Push your hips back and bend your knees as if sitting in a chair. Drive through your heels to return to standing, keeping your chest up.
  - **Beginner modification:** Squat down onto a chair or bench, then stand back up.

- **Plank with Shoulder Taps — 20 taps**
  - **How to do it:** Start in a high plank position. Keeping your hips entirely stable, lift your right hand to tap your left shoulder, then return it. Alternate sides.
  - **Beginner modification:** Perform on your knees or widen your feet significantly for more balance.

## ⚠️ Precautions & Contraindications
- **Who Should Skip:** Avoid if recovering from an acute shoulder (rotator cuff) injury.
- **Form Warning:** During push-ups, do not let your lower back sag. If it does, elevate your hands on a bench or drop to your knees.

## Cool-Down (3-5 min)
- **Child's Pose:** 1 minute, reaching arms forward to stretch the lats.
- **Standing Quad Stretch:** Hold your ankle behind you, keeping knees together, 30 seconds per leg.

## Coach's Tip
Focus on the eccentric (lowering) phase of the squat. Take a full 3 seconds to lower down to maximize muscle growth!`
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
    imageUrl: require('../../../assets/images/workouts/luteal_slow_burn_pilates.jpg'),
    imageName: 'luteal_slow_burn_pilates.jpg',
    tutorialMarkdown: `## Overview
Intense, high-heart-rate workouts during the luteal phase can spike cortisol and worsen PMS symptoms. This slow burn pilates routine focuses on time-under-tension, allowing you to build incredible core and glute strength safely.

## Before You Begin
- **Equipment:** Yoga mat
- **Space:** A standard mat-sized space

## Warm-Up (3-5 min)
- **Cat-Cow:** 10 reps to mobilize the spine.
- **Gentle Torso Twists:** Sitting tall, twist gently side to side to warm up the core.

## Step-by-Step Guide
- **Clamshells — 20 reps per side**
  - **How to do it:** Lie on your side with hips stacked and knees bent at a 45-degree angle. Keeping your feet touching, lift your top knee as high as you can without rolling your hips back. Slowly lower.
  - **Beginner modification:** Perform fewer reps or limit the range of motion.

- **Bird-Dog — 15 reps per side**
  - **How to do it:** Start on all fours. Slowly extend your right arm forward and your left leg straight back simultaneously. Hold for a second, then return to the start. Alternate sides.
  - **Beginner modification:** Extend just the leg or just the arm until you feel balanced.

- **The Hundred — 10 breaths (100 pumps)**
  - **How to do it:** Lie on your back, bring legs into tabletop (knees bent 90 degrees), and lift your head and shoulders. Vigorously pump your arms up and down just above the floor while inhaling for 5 counts and exhaling for 5 counts.
  - **Beginner modification:** Keep your head resting on the mat and feet flat on the floor, just pumping the arms.

## ⚠️ Precautions & Contraindications
- **Who Should Skip:** Stop if you feel sharp lower back pain.
- **Form Warning:** Do not let your lower back arch off the floor during the Hundred. If your neck hurts, put your head down immediately.

## Cool-Down (3-5 min)
- **Supine Spinal Twist:** Lie on your back, drop knees to one side, 1 minute per side.
- **Full Body Stretch:** Lie flat and reach arms overhead and toes down, stretching as long as possible.

## Coach's Tip
The slower you go, the harder it is. Resist the urge to use momentum; make your muscles do all the work.`
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
    imageUrl: require('../../../assets/images/workouts/ovulatory_strength_pr.jpg'),
    imageName: 'ovulatory_strength_pr.jpg',
    tutorialMarkdown: `## Overview
Testosterone and estrogen peak around ovulation, making you stronger, more confident, and more resilient to muscle damage. This is the absolute best time in your cycle to lift heavy and hit personal records (PRs)!

## Before You Begin
- **Equipment:** Barbell, plates, dumbbells, pull-up bar (or lat pulldown machine)
- **Space:** Gym floor or well-equipped home gym

## Warm-Up (3-5 min)
- **Dynamic Lunges:** 10 reps per leg.
- **Arm Circles:** 15 forward, 15 backward.
- **Light warmup sets:** 1 set of 10 reps with just the empty barbell for squats/deadlifts.

## Step-by-Step Guide
- **Barbell Deadlifts — 5 sets of 5 reps**
  - **How to do it:** Stand with feet hip-width apart, barbell over your mid-foot. Hinge at the hips, grip the bar, keep your chest up and back flat. Drive through your feet to stand up, pulling the bar along your shins. Lower under control.
  - **Beginner modification:** Use dumbbells or kettlebells instead of a barbell to master the hip hinge first.

- **Overhead Press — 4 sets of 8 reps**
  - **How to do it:** Stand with a barbell or dumbbells at shoulder height. Brace your core and press the weight straight up overhead until your arms are locked out. Lower slowly back to your shoulders.
  - **Beginner modification:** Perform seated with dumbbells to protect the lower back.

- **Pull-ups (or Lat Pulldowns) — 4 sets of 8 reps**
  - **How to do it:** Grip the bar wider than shoulder-width. Pull your chest toward the bar by driving your elbows down. Lower slowly.
  - **Beginner modification:** Use an assisted pull-up machine, resistance bands, or a lat pulldown machine.

- **Weighted Lunges — 3 sets of 10 reps per leg**
  - **How to do it:** Hold dumbbells at your sides. Step one foot forward and lower your hips until both knees are bent at 90 degrees. Push off the front foot to return to the start.
  - **Beginner modification:** Perform bodyweight lunges and hold onto a wall for balance.

## ⚠️ Precautions & Contraindications
- **Who Should Skip:** Do not attempt heavy deadlifts if you have untreated pelvic floor dysfunction or acute lower back pain.
- **Form Warning:** Always use a spotter or safety racks when lifting near your 1-Rep Max. If form breaks down, drop the weight immediately.

## Cool-Down (3-5 min)
- **Forward Fold:** Let your upper body hang heavy to decompress the spine for 1 minute.
- **Chest Stretch:** Clasp hands behind your back and gently lift arms to open the chest.

## Coach's Tip
Rest for a full 2-3 minutes between sets. This workout is about maximal force production, not cardiovascular endurance!`
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
    imageUrl: require('../../../assets/images/workouts/ovulatory_hiit_spike.jpg'),
    imageName: 'ovulatory_hiit_spike.jpg',
    tutorialMarkdown: `## Overview
Quick, explosive bursts of cardio maximize fat burning and athletic conditioning. Your body is uniquely primed to handle and recover from high-stress intervals during ovulation, making this the perfect time to push your limits.

## Before You Begin
- **Equipment:** None
- **Space:** A small clear area (about 6x6 feet)

## Warm-Up (3-5 min)
- **Jumping Jacks:** 1 minute steady pace.
- **Dynamic Squats:** 10 reps to open the hips.
- **Arm Swings:** Cross arms over chest to warm up the shoulders.

## Step-by-Step Guide
**Perform each exercise for 40 seconds, followed by 20 seconds of rest. Repeat the entire 4-move circuit 4 times.**

- **Burpees**
  - **How to do it:** From standing, drop into a squat and place hands on the floor. Jump feet back into a plank, do a push-up (optional), jump feet forward to hands, and explosively jump straight up into the air.
  - **Beginner modification:** Step back into the plank instead of jumping, skip the push-up, and stand up on your toes instead of jumping at the end.

- **Jump Squats**
  - **How to do it:** Perform a standard bodyweight squat, but as you rise, explosively jump off the floor. Land softly with slightly bent knees and go straight into the next squat.
  - **Beginner modification:** Do fast-paced regular squats without the jump.

- **Mountain Climbers**
  - **How to do it:** Start in a high plank position. Quickly drive your right knee toward your chest, then switch and drive your left knee in, as if running in place horizontally.
  - **Beginner modification:** Perform slowly, stepping one foot in at a time without the "running" bounce.

- **High Knees**
  - **How to do it:** Run in place, driving your knees up as high as your chest with each step. Pump your arms vigorously to keep the rhythm.
  - **Beginner modification:** March in place, lifting knees high without the impact of running.

## ⚠️ Precautions & Contraindications
- **Who Should Skip:** Avoid if you have knee arthritis, ankle instability, or shin splints.
- **Form Warning:** Jumping can stress the pelvic floor. Substitute with fast-paced step-outs if you experience any leaking or heaviness.

## Cool-Down (3-5 min)
- **Slow Walking:** Walk around the room for 2 minutes to bring the heart rate down.
- **Standing Quad Stretch:** 30 seconds per leg to release leg tension.

## Coach's Tip
Pace yourself on round one. The goal is to survive and maintain intensity all the way through round four!`
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
    imageUrl: require('../../../assets/images/workouts/follicular_power_dance.jpg'),
    imageName: 'follicular_power_dance.jpg',
    tutorialMarkdown: `## Overview
A fun, rhythm-based aerobic workout to get your heart rate up and release endorphins. Your growing energy levels during the follicular phase make this the perfect time to let loose and move continuously.

## Before You Begin
- **Equipment:** None, but a good playlist is required!
- **Space:** Enough room to take a few wide steps side to side

## Warm-Up (3-5 min)
- **Shoulder Rolls:** 10 forward, 10 backward.
- **Torso Twists:** Twist side to side, letting your arms swing loosely for 1 minute.

## Step-by-Step Guide
**Put on a high-energy playlist (120-130 BPM). Keep moving for the full duration!**

- **Side-to-Side Step Touches — 5 mins (Warmup)**
  - **How to do it:** Step your right foot to the right, then bring your left foot to meet it. Step left, then right meets left. Pump your arms to the beat.
  - **Beginner modification:** Keep the steps small and arms low.

- **Grapevines with Arm Reaches — 5 mins**
  - **How to do it:** Step right foot to right, cross left foot behind, step right foot to right, and bring left foot together with a clap or reach. Repeat in the other direction.
  - **Beginner modification:** Stick to basic step touches if the crossover trips you up.

- **Continuous Jumping Jacks or Step-Jacks — 5 mins**
  - **How to do it:** Jump both feet out while raising arms overhead, then jump feet together while lowering arms.
  - **Beginner modification:** Tap one foot out at a time instead of jumping (Step-Jacks).

- **Freestyle / Free movement — 5 mins**
  - **How to do it:** Just dance! Move however feels good—bounce, shake, shimmy, or twist. The goal is just to keep your heart rate elevated.
  - **Beginner modification:** N/A – there are no wrong moves here!

## ⚠️ Precautions & Contraindications
- **Who Should Skip:** Safe for almost everyone; just keep the impact low if needed.
- **Form Warning:** Ensure your workout area is clear of rugs or tripping hazards before dancing. Wear supportive sneakers, even indoors.

## Cool-Down (3-5 min)
- **Slow Walking:** Walk around the room slowly for 3 minutes as the music slows down.
- **Side Body Stretch:** Reach one arm overhead and lean to the opposite side, 30 seconds per side.

## Coach's Tip
Don't worry about looking perfect. It's about keeping your heart rate elevated, expressing yourself, and having fun!`
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
    imageUrl: require('../../../assets/images/workouts/deep_rest_yin.jpg'),
    imageName: 'deep_rest_yin.jpg',
    tutorialMarkdown: `## Overview
Yin yoga targets the deep connective tissues (fascia) rather than the muscles. Postures are held passively for several minutes, grounding the nervous system and encouraging deep, meditative rest.

## Before You Begin
- **Equipment:** Yoga mat, 2 yoga blocks (or thick books), 1 firm pillow or bolster
- **Space:** A quiet, comfortable spot

## Warm-Up (3-5 min)
- **Deep Breathing:** Sit comfortably, close your eyes, and take 10 slow, deep breaths to transition into a state of rest.

## Step-by-Step Guide
- **Butterfly Pose — 5 mins**
  - **How to do it:** Sit up and bring the soles of your feet together, letting your knees drop open to the sides. Slowly fold forward over your legs. Let your spine round and your head hang heavy.
  - **Beginner modification:** Place a block or pillow under each knee for support so your hips don't strain.

- **Supported Bridge — 5 mins**
  - **How to do it:** Lie on your back with knees bent and feet flat on the floor. Lift your hips and slide a yoga block or firm pillow under your sacrum (the hard flat bone at the base of your spine). Rest your arms out wide, palms facing up.
  - **Beginner modification:** Use a softer pillow or lower the height of the block.

- **Savasana — 10 mins**
  - **How to do it:** Lie completely flat on your back, legs extended, arms by your sides. Total stillness.
  - **Beginner modification:** Place a rolled blanket under your knees to relieve lower back pressure.

## ⚠️ Precautions & Contraindications
- **Who Should Skip:** If you are hypermobile (e.g., Ehlers-Danlos), do not push to your end range of motion in Yin yoga. Back off by 20% to protect your joints.
- **Form Warning:** Use blocks or pillows to support your joints so the muscles can fully disengage. You should feel a dull stretch, never sharp pain.

## Cool-Down (3-5 min)
- **Fetal Position:** Roll onto your right side and rest there for 1 minute before sitting up.
- **Seated Meditation:** Sit cross-legged and observe how your body feels for 2 minutes.

## Coach's Tip
It is normal for the mind to wander during long holds. Notice the thoughts without judgment, then gently return your focus to your breath.`
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
    imageUrl: require('../../../assets/images/workouts/incline_walking_series.jpg'),
    imageName: 'incline_walking_series.jpg',
    tutorialMarkdown: `## Overview
Incline walking elevates the heart rate and engages the glutes and calves heavily, all while keeping cortisol relatively stable compared to high-intensity running. It's perfect for building endurance during lower-energy phases.

## Before You Begin
- **Equipment:** Treadmill
- **Space:** Gym or home treadmill setup

## Warm-Up (3-5 min)
- **Ankle Rolls:** 10 circles each direction per foot.
- **Calf Raises:** 15 reps on the edge of a step.

## Step-by-Step Guide
- **Warmup Phase — 5 mins**
  - **How to do it:** Set the treadmill to 3.0 mph and 0% incline. Focus on taking long, even strides.

- **Climb Phase — 10 mins**
  - **How to do it:** Increase the incline to 5% while maintaining 3.0 mph. Engage your glutes with every step.
  - **Beginner modification:** Drop the speed to 2.5 mph if you feel yourself gasping for air.

- **Peak Phase — 15 mins**
  - **How to do it:** Increase the incline to 10-12% and speed to 3.2 mph. Pump your arms vigorously to help drive your legs forward.
  - **Beginner modification:** Keep the incline at 6-8% instead of pushing to the maximum.

- **Cooldown Phase — 10 mins**
  - **How to do it:** Lower the incline back to 0% and drop the speed to 2.5 mph. Let your heart rate slowly return to normal.

## ⚠️ Precautions & Contraindications
- **Who Should Skip:** Avoid if you have active Achilles tendonitis or severe plantar fasciitis.
- **Form Warning:** Do not hold onto the treadmill handrails and lean backward—this negates the benefit of the incline and ruins your posture. Keep your chest up! Lower the speed if you must hold on.

## Cool-Down (3-5 min)
- **Calf Stretch:** Stand facing a wall, put one foot back, press the heel down into the floor, and lean forward for 1 minute per leg.
- **Hamstring Stretch:** Prop one heel up on a low bench and gently hinge forward.

## Coach's Tip
Pump your arms to drive momentum. Strike with the heel and push off forcefully with the toes to maximize glute activation.`
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
    imageUrl: require('../../../assets/images/workouts/living_room_dumbbell_circuit.jpg'),
    imageName: 'living_room_dumbbell_circuit.jpg',
    tutorialMarkdown: `## Overview
Perfect for building lean muscle at home when your energy is rising. All you need is a pair of light to medium dumbbells and a mat to get a full-body strength session in just 30 minutes.

## Before You Begin
- **Equipment:** 1-2 pairs of dumbbells (light and medium), yoga mat
- **Space:** Enough room to step backward into a lunge

## Warm-Up (3-5 min)
- **High Knees:** 1 minute.
- **Arm Circles & Crosses:** 1 minute to loosen the upper body.
- **Bodyweight Squats:** 15 reps.

## Step-by-Step Guide (Repeat 3-4 times)
- **Goblet Squats — 12 reps**
  - **How to do it:** Hold one dumbbell vertically against your chest with both hands. Keep your chest up, push your hips back, and squat down until your thighs are parallel to the floor. Drive through heels to stand.
  - **Beginner modification:** Squat onto a chair while holding a lighter weight.

- **Dumbbell Floor Press — 10 reps**
  - **How to do it:** Lie on your back with knees bent and feet flat. Hold a dumbbell in each hand, elbows resting on the floor at a 45-degree angle from your body. Press the weights straight up until your arms are extended, then lower slowly until elbows tap the floor.
  - **Beginner modification:** Perform without weights to master the pressing motion.

- **Alternating Reverse Lunges — 10 reps per leg**
  - **How to do it:** Hold dumbbells by your sides. Step your right foot backward and lower your hips until both knees form 90-degree angles. Push off the back foot to return to standing. Alternate legs.
  - **Beginner modification:** Perform bodyweight only, using a wall for balance.

- **Bent Over Rows — 12 reps**
  - **How to do it:** Hold a dumbbell in each hand. Hinge forward at the hips, keeping your back perfectly flat and knees slightly bent. Let the weights hang down, then pull them up to your ribcage by driving your elbows to the ceiling. Lower slowly.
  - **Beginner modification:** Do single-arm rows while supporting your other hand and knee on a couch or bench.

## ⚠️ Precautions & Contraindications
- **Who Should Skip:** Skip lunges if you have severe knee pain; substitute with glute bridges.
- **Form Warning:** For Bent Over Rows, if you feel strain in your lower back, ensure you are hinging at the hips, not rounding your spine. 

## Cool-Down (3-5 min)
- **Child's Pose:** 1 minute.
- **Seated Forward Fold:** 1 minute.

## Coach's Tip
Focus on the mind-muscle connection. Lower the weight slowly (the eccentric phase) for maximum muscle engagement and growth.`
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
    imageUrl: require('../../../assets/images/workouts/bodyweight_core_glutes.jpg'),
    imageName: 'bodyweight_core_glutes.jpg',
    tutorialMarkdown: `## Overview
A fast, fiery workout that requires zero equipment. Ideal for ovulatory days when you have excess energy to burn but want to stay home and focus intensely on tightening the core and lifting the glutes.

## Before You Begin
- **Equipment:** Yoga mat
- **Space:** A standard mat-sized space

## Warm-Up (3-5 min)
- **Jumping Jacks:** 1 minute.
- **Hip Circles:** 10 wide circles in each direction.
- **Cat-Cow:** 10 reps to mobilize the spine.

## Step-by-Step Guide (45s work / 15s rest, Repeat 3 times)
- **Glute Bridges with Squeeze**
  - **How to do it:** Lie on your back with knees bent and feet flat on the floor, hip-width apart. Drive through your heels to lift your hips toward the ceiling. Squeeze your glutes hard at the top for 2 seconds, then lower down.
  - **Beginner modification:** Skip the hold at the top and just move continuously.

- **Plank Shoulder Taps**
  - **How to do it:** Start in a high plank position. Brace your core tightly so your hips don't sway. Lift your right hand and tap your left shoulder, then return it. Alternate sides.
  - **Beginner modification:** Perform on your knees or just hold a static plank.

- **Donkey Kicks**
  - **How to do it:** Start on all fours. Keeping your right knee bent at 90 degrees, lift your right leg up behind you until your thigh is parallel to the floor, stamping your footprint on the ceiling. Lower back down. (Switch legs halfway through the 45s).
  - **Beginner modification:** Keep the movement small and don't lift the leg as high.

- **Bicycle Crunches**
  - **How to do it:** Lie on your back, hands lightly behind your ears, legs in tabletop. Lift your head and shoulders. Extend your right leg straight out while twisting your upper body to bring your right elbow to your left knee. Alternate sides continuously.
  - **Beginner modification:** Keep your feet flat on the floor and just perform the twisting crunch motion.

## ⚠️ Precautions & Contraindications
- **Who Should Skip:** If you have Diastasis Recti (abdominal separation post-partum), avoid Bicycle Crunches and Planks. Substitute with dead bugs and heel slides.
- **Form Warning:** If planks hurt your wrists, perform them on your forearms (dolphin plank).

## Cool-Down (3-5 min)
- **Knees-to-Chest Hug:** 1 minute to release the lower back.
- **Figure 4 Stretch:** Lying on your back, cross one ankle over the opposite knee and pull the thigh toward you, 1 minute per leg.

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
    imageUrl: require('../../../assets/images/workouts/pms_evening_pilates.jpg'),
    imageName: 'pms_evening_pilates.jpg',
    tutorialMarkdown: `## Overview
When PMS hits, cortisol is naturally higher and your body craves rest. This gentle evening pilates routine keeps the intensity low, focusing on deep breathing, core stabilization, and pelvic floor relaxation to help you de-bloat and unwind before bed.

## Before You Begin
- **Equipment:** Yoga mat, a soft pillow
- **Space:** A standard mat-sized space

## Warm-Up (3-5 min)
- **Deep Belly Breathing:** Lie flat with hands on your stomach. Take 10 deep breaths, feeling your stomach rise and fall.

## Step-by-Step Guide
- **Pelvic Tilts — 2 mins**
  - **How to do it:** Lie on your back with knees bent and feet flat. Inhale to let your lower back naturally arch off the floor. Exhale and gently flatten your lower back completely against the mat by engaging your lower abs.
  - **Beginner modification:** Keep the movement extremely small and subtle.

- **Modified Dead Bug — 2 mins**
  - **How to do it:** Lie on your back with legs in tabletop (knees bent 90 degrees) and arms pointing to the ceiling. Slowly tap your right heel to the floor while reaching your left arm back behind your head. Return to center and switch sides. Keep your lower back pressed to the floor.
  - **Beginner modification:** Keep your arms resting on the floor and only move your legs.

- **Supine Figure 4 Stretch — 2 mins per leg**
  - **How to do it:** Lying on your back, bend both knees. Cross your right ankle over your left knee. Thread your hands around your left thigh and gently pull it toward your chest until you feel a deep stretch in your right glute.
  - **Beginner modification:** Leave your left foot flat on the floor and gently press the right knee away from you instead of pulling the leg in.

## ⚠️ Precautions & Contraindications
- **Who Should Skip:** If the Figure 4 stretch causes shooting pain down your leg (sciatica), release the stretch immediately.
- **Form Warning:** If you experience pelvic pain during your period, keep the pelvic tilts extremely small. Do not aggressively clench your pelvic floor; focus on the release.

## Cool-Down (3-5 min)
- **Child's Pose:** 2 minutes, using a pillow under your chest for maximum comfort.
- **Savasana:** 3 minutes of quiet rest.

## Coach's Tip
Sync your movement with your breath. Always inhale to prepare, and exhale on the exertion (the hardest part of the movement).`
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
    imageUrl: require('../../../assets/images/workouts/heavy_lower_body_glute_focus.jpg'),
    imageName: 'heavy_lower_body_glute_focus.jpg',
    tutorialMarkdown: `## Overview
Capitalize on your estrogen peak by lifting heavy! This is the perfect time in your cycle to push for Personal Records (PRs) and build serious leg and glute strength. High energy and fast recovery make this gym session incredibly effective.

## Before You Begin
- **Equipment:** Squat rack, barbell, plates, dumbbells, leg press machine
- **Space:** Gym floor

## Warm-Up (3-5 min)
- **Stationary Bike or Rower:** 3 minutes at a moderate pace.
- **Dynamic Leg Swings:** 15 swings forward/back and side-to-side per leg.
- **Bodyweight Squats:** 20 reps.

## Step-by-Step Guide
- **Barbell Squats — 4 sets of 6-8 reps**
  - **How to do it:** Rest the barbell across your upper back/traps. Unrack it, step back, and stand with feet shoulder-width apart. Keep your chest up, push your hips back, and squat until your hips drop below your knees. Drive through your mid-foot to stand back up.
  - **Beginner modification:** Perform Goblet Squats with a single dumbbell or use a Leg Press machine.

- **Romanian Deadlifts (RDLs) — 3 sets of 8-10 reps**
  - **How to do it:** Hold a barbell or heavy dumbbells in front of your thighs. Keep legs mostly straight (slight knee bend). Hinge backward at the hips, sliding the weight down your legs until you feel a deep stretch in your hamstrings. Squeeze your glutes to stand back up.
  - **Beginner modification:** Use lighter kettlebells and focus purely on pushing the hips backward to a wall.

- **Bulgarian Split Squats — 3 sets of 10 reps per leg**
  - **How to do it:** Stand a few feet in front of a bench. Place the top of your right foot on the bench behind you. Hold dumbbells at your sides. Lower your body straight down until your front thigh is parallel to the floor, then push back up.
  - **Beginner modification:** Perform regular stationary lunges on the floor without elevating the back foot.

- **Leg Press — 3 sets of 12 reps**
  - **How to do it:** Sit in the machine with your back flat against the pad. Place feet shoulder-width apart on the sled. Unlatch the safety, lower the weight until your knees are at 90 degrees, and forcefully press back up without locking your knees out.
  - **Beginner modification:** Start with just the empty sled to master the machine mechanics before adding weight.

## ⚠️ Precautions & Contraindications
- **Who Should Skip:** Skip heavy axial loading (barbell squats) if you have active spinal disc issues. Substitute with Leg Press or Hack Squat.
- **Form Warning:** Always squat inside a power rack with safety pins set, or use a spotter. Do not increase your working weight by more than 5-10% per week.

## Cool-Down (3-5 min)
- **Seated Forward Fold:** 1 minute.
- **Couch Stretch (Quad/Hip flexor stretch):** 1 minute per leg.

## Coach's Tip
Make sure you are properly fueled before this session. Eat a carb-rich snack (like a banana and peanut butter) 45 minutes prior!`
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
    imageUrl: require('../../../assets/images/workouts/upper_body_pull_push.jpg'),
    imageName: 'upper_body_pull_push.jpg',
    tutorialMarkdown: `## Overview
A comprehensive upper body session balancing pulling and pushing movements. This gym workout is designed to improve your posture, strengthen your back, and tone your shoulders, taking advantage of your follicular/ovulatory strength peak.

## Before You Begin
- **Equipment:** Lat pulldown machine, dumbbells, adjustable bench, cable machine
- **Space:** Gym floor

## Warm-Up (3-5 min)
- **Arm Circles:** 20 forward, 20 backward.
- **Band Pull-aparts:** 20 reps using a light resistance band to wake up the back muscles.
- **Push-ups (from knees or toes):** 10 reps.

## Step-by-Step Guide (3 Sets Each)
- **Lat Pulldowns — 10-12 reps**
  - **How to do it:** Sit at the machine with a wide grip on the bar. Keep your chest up and lean slightly back. Pull the bar down to your upper chest by driving your elbows down and back. Slowly let the bar back up until your arms are fully extended.
  - **Beginner modification:** Use a lighter weight and focus on squeezing your shoulder blades together.

- **Dumbbell Shoulder Press — 8-10 reps**
  - **How to do it:** Sit on a bench with back support. Hold dumbbells at shoulder height, palms facing forward. Press the weights straight up overhead until your arms are fully extended but not locked. Lower slowly back to shoulder height.
  - **Beginner modification:** Perform with very light weights or alternate pressing one arm at a time.

- **Seated Cable Rows — 12 reps**
  - **How to do it:** Sit at a cable row station with a V-grip handle. Keep your back straight and knees slightly bent. Pull the handle toward your belly button, squeezing your shoulder blades together. Slowly extend your arms back out.
  - **Beginner modification:** Use a resistance band looped around a pole if you find the machine intimidating.

- **Push-Ups (or assisted) — AMRAP (As Many Reps As Possible)**
  - **How to do it:** Start in a high plank with hands slightly wider than shoulders. Lower your chest to the floor, keeping elbows at a 45-degree angle. Push back up to the start.
  - **Beginner modification:** Elevate your hands on a bench or barbell in a rack, or perform from your knees.

## ⚠️ Precautions & Contraindications
- **Who Should Skip:** Avoid heavy overhead pressing if you have a history of rotator cuff impingement.
- **Form Warning:** Do not pull the Lat Pulldown bar behind your neck. Always pull it down to your clavicle (upper chest) to protect your rotator cuffs. If you have high blood pressure, avoid holding your breath; exhale smoothly on the push/pull.

## Cool-Down (3-5 min)
- **Child's Pose:** 1 minute, reaching arms far forward.
- **Chest Stretch in Doorway:** Place forearms on a doorframe and step forward slightly to stretch the chest, 1 minute.

## Coach's Tip
Keep your shoulders pulled down and away from your ears, especially during lat pulldowns and rows, to avoid straining your neck.`
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
    imageUrl: require('../../../assets/images/workouts/luteal_deload_machine_circuit.jpg'),
    imageName: 'luteal_deload_machine_circuit.jpg',
    tutorialMarkdown: `## Overview
During your luteal phase, recovery is slower and energy can dip. Machines offer stability, completely reducing the strain on your central nervous system while still allowing you to get a great muscle-building workout in safely.

## Before You Begin
- **Equipment:** Leg extension, hamstring curl, chest press, and pec deck machines
- **Space:** Gym floor

## Warm-Up (3-5 min)
- **Light Walking:** 3 minutes on the treadmill to get blood flowing.
- **Dynamic Stretching:** 10 leg swings per leg, 10 arm crosses.

## Step-by-Step Guide (2-3 Sets)
- **Leg Extension Machine — 12 reps**
  - **How to do it:** Adjust the seat so your knees align with the pivot point of the machine. Pad should rest on your lower shins. Extend your legs fully to lift the weight, squeeze your quads at the top, and lower slowly.
  - **Beginner modification:** Use a very light weight and limit the range of motion if you feel knee discomfort.

- **Hamstring Curl Machine (Seated or Lying) — 12 reps**
  - **How to do it:** Align your knees with the pivot point. Curl the pad toward your glutes by bending your knees. Squeeze your hamstrings hard, then slowly return to the starting position.
  - **Beginner modification:** Focus entirely on a slow 3-second release (eccentric) for better muscle connection.

- **Chest Press Machine — 12 reps**
  - **How to do it:** Adjust the seat so the handles align with your mid-chest. Press the handles straight out until your arms are extended, then slowly bring them back until you feel a stretch in your chest.
  - **Beginner modification:** Start with the lightest weight setting to get used to the machine's path of motion.

- **Pec Deck / Rear Delt Fly — 12 reps**
  - **How to do it:** Sit facing the machine pad. Grab the handles with arms slightly bent. Pull your arms backward as far as comfortable, squeezing your shoulder blades together to work the rear shoulders and upper back. Return slowly.
  - **Beginner modification:** Keep the weight light and focus purely on the squeeze between your shoulder blades.

## ⚠️ Precautions & Contraindications
- **Who Should Skip:** If you have Patellofemoral Pain Syndrome (runner's knee), lighten the weight on the Leg Extension or skip it entirely, as it places high sheer force on the kneecap.
- **Form Warning:** Always adjust the machine pivots to align precisely with your joints before lifting. If a machine feels awkward, the seat is likely at the wrong height.

## Cool-Down (3-5 min)
- **Standing Quad Stretch:** 1 minute per leg.
- **Overhead Triceps Stretch:** 1 minute per arm.

## Coach's Tip
Do not lift to failure today. Because your recovery is lower in the luteal phase, leave 2-3 reps in the tank on every single set.`
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
    imageUrl: require('../../../assets/images/workouts/neighborhood_power_walk.jpg'),
    imageName: 'neighborhood_power_walk.jpg',
    tutorialMarkdown: `## Overview
Low-Intensity Steady State (LISS) cardio is incredible for fat oxidation and nervous system regulation. This neighborhood power walk gets you moving outside, combining the benefits of fresh air and light cardio to leave you feeling refreshed.

## Before You Begin
- **Equipment:** Comfortable walking shoes
- **Space:** Neighborhood sidewalks, a local park, or a track

## Warm-Up (3-5 min)
- **Ankle Rolls:** 10 times each direction.
- **Slow Stroll:** Start with a casual 3-minute stroll before picking up the pace.

## Step-by-Step Guide
- **The Power Walk — 45 mins**
  - **How to do it:** Walk at a brisk pace where you can still comfortably hold a conversation, but you feel your heart rate elevate and perhaps break a light sweat. 
  - **Posture:** Pump your arms naturally at your sides. Strike the ground with your heel and roll through to push off with your toes. Keep your chest lifted and gaze forward, not down at your phone.
  - **Environment:** Try to walk outside in nature if possible; exposure to natural light helps regulate circadian rhythms and sleep cycles.
  - **Beginner modification:** Reduce the duration to 20-30 minutes if 45 minutes feels too long.

## ⚠️ Precautions & Contraindications
- **Who Should Skip:** Safe for almost everyone!
- **Form Warning:** Replace your walking shoes every 300-500 miles to prevent conditions like plantar fasciitis. If walking early in the morning or at night, wear reflective gear and stick to well-lit paths.

## Cool-Down (3-5 min)
- **Calf Stretch:** Find a curb, drop one heel off the edge, and stretch for 1 minute per leg.
- **Deep Breaths:** Take 5 deep breaths of fresh air before heading inside.

## Coach's Tip
Listen to a favorite podcast, an audiobook, or an upbeat playlist to make the time fly by.`
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
    imageUrl: require('../../../assets/images/workouts/three_k_run.jpg'),
    imageName: 'three_k_run.jpg',
    tutorialMarkdown: `## Overview
When your energy is high, hitting the pavement is a great way to clear your head, build endurance, and boost your cardiovascular health. This 3k (approx. 1.8 miles) run is the perfect moderate-distance challenge.

## Before You Begin
- **Equipment:** Running shoes
- **Space:** A running trail, track, or safe neighborhood route

## Warm-Up (3-5 min)
- **Brisk Walking:** 2 minutes.
- **High Knees & Butt Kicks:** 1 minute to prime the running muscles.
- **Dynamic Leg Swings:** 10 swings forward/back per leg.

## Step-by-Step Guide
- **The Run — 20-25 mins (3k distance)**
  - **How to do it:** Start jogging at a comfortable, consistent pace. Keep your shoulders relaxed and your arms swinging gently forward and back (not crossing your body). Maintain a slight forward lean from the ankles.
  - **Beginner modification:** Use the run/walk interval method! Run for 2 minutes, then walk for 1 minute. Repeat this until you hit the 3k distance or 30 minutes total time.

## ⚠️ Precautions & Contraindications
- **Who Should Skip:** Avoid running if you have active joint inflammation, severe flat feet without orthotics, or are recovering from pelvic floor prolapse.
- **Form Warning:** Ensure you are well hydrated. Drink 16oz of water 2-3 hours before your run, but avoid chugging water immediately before to prevent cramps.

## Cool-Down (3-5 min)
- **Slow Walk:** 5 minutes of slow walking to bring the heart rate down.
- **Static Stretches:** 1 minute of quad stretches and 1 minute of calf stretches per leg.

## Coach's Tip
Focus on your breathing pattern to prevent side stitches. Try to inhale for 3 steps, and exhale for 3 steps to maintain a steady rhythm.`
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
    imageUrl: require('../../../assets/images/workouts/steady_state_swimming.jpg'),
    imageName: 'steady_state_swimming.jpg',
    tutorialMarkdown: `## Overview
Swimming provides excellent resistance training and cardiovascular conditioning simultaneously, with absolutely zero joint impact. It's the perfect full-body workout, especially when you want to reduce gravitational pressure on a bloated luteal belly!

## Before You Begin
- **Equipment:** Swimsuit, goggles, swim cap (optional), towel
- **Space:** A lap pool

## Warm-Up (3-5 min)
- **Arm Swings:** 10 forward, 10 backward on the pool deck.
- **Slow Freestyle:** Swim 2-4 lengths of the pool at a very relaxed, easy pace.

## Step-by-Step Guide
- **Steady State Swim — 20-25 mins**
  - **How to do it:** Swim continuous laps at a moderate, sustainable pace. Focus on reaching long with your strokes and kicking from the hips, not just the knees. 
  - **Mix it up:** Alternate between Freestyle, Breaststroke, and Backstroke every few laps to engage different muscle groups and prevent boredom.
  - **Beginner modification:** Use a kickboard for half the time to focus purely on your leg endurance while giving your arms a rest. Take breaks at the wall as needed.

## ⚠️ Precautions & Contraindications
- **Who Should Skip:** Skip if you have open wounds or an active ear infection. 
- **Form Warning:** If you have a history of swimmer's shoulder (impingement), avoid the Butterfly stroke and excessive Freestyle. Stick primarily to Breaststroke and Backstroke. Always shower before and after entering a public pool.

## Cool-Down (3-5 min)
- **Easy Treading:** Tread water slowly in the deep end for 2 minutes.
- **Poolside Stretches:** Hang onto the wall and stretch your calves and quads in the water.

## Coach's Tip
Don't forget to hydrate! It's incredibly easy to forget to drink water when you're already in the pool, but you are still sweating. Have a water bottle at the end of your lane.`
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
    imageUrl: require('../../../assets/images/workouts/cycling_spin_class.jpg'),
    imageName: 'cycling_spin_class.jpg',
    tutorialMarkdown: `## Overview
A high-energy, sweat-inducing workout perfect for the days leading up to ovulation. Indoor cycling torches calories, builds incredible leg endurance, and is accompanied by motivating music to push your limits.

## Before You Begin
- **Equipment:** Stationary bike, water bottle, towel
- **Space:** Gym cycling room or home bike

## Warm-Up (3-5 min)
- **Warm Up Phase:** 5 mins of pedaling with light resistance at a high cadence (90+ RPM) to get the blood flowing into the legs.

## Step-by-Step Guide
- **Intervals — 30 mins**
  - **How to do it:** Alternate between heavy resistance and light resistance. 
  - **Climbs:** Crank the resistance up heavily, stand out of the saddle, and pedal slowly and powerfully as if climbing a steep hill (2 mins).
  - **Sprints:** Lower the resistance slightly, sit in the saddle, and pedal as fast as you can control (1 min). Repeat this cycle.
  - **Beginner modification:** Stay in the saddle the entire time and keep the resistance changes moderate rather than extreme.

## ⚠️ Precautions & Contraindications
- **Who Should Skip:** Generally safe, but skip high resistance if you have acute knee pain.
- **Form Warning:** Ensure your saddle height is correct! There should be a slight bend in your knee at the bottom of the pedal stroke. Riding too low causes knee pain; riding too high causes your hips to rock. Do not round your lower back when reaching for the handlebars; keep your chest open.

## Cool-Down (3-5 min)
- **Cooldown Spin:** 5-10 minutes with very light resistance. Let your heart rate drop below 100 BPM before getting off the bike.
- **Off-Bike Stretches:** Stretch your quads, hamstrings, and calves thoroughly.

## Coach's Tip
Drive through your heels on the downstroke and pull up slightly on the upstroke. This engages your glutes and hamstrings rather than just overworking your quads!`
  }
];


// -----------------------------------------------------------------------------
// PRANAYAMA & MEDITATION
// Low-calorie wellness practices designed to complement movement.
// These are not calorie-burning workouts; their value is relaxation, breathing
// awareness, recovery, focus and a calmer transition into or out of exercise.
// -----------------------------------------------------------------------------

export type WellnessIntensity = 'very-low' | 'low';
export type WellnessFocus =
  | 'relaxation'
  | 'rejuvenation'
  | 'breath-awareness'
  | 'focus'
  | 'sleep'
  | 'energy'
  | 'emotional-balance'
  | 'grounding';

export interface WellnessRoutine {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  durationMinutes: number;
  intensity: WellnessIntensity;
  focus: WellnessFocus[];
  recommendedPhases: CyclePhase[];
  estimatedCalories: number;
  calorieNote: string;
  imageUrl?: any;
  imageName: string;
  steps: string[];
  benefits: string[];
  safetyNotes: string[];
  coachTip: string;
}

export interface PranayamaRoutine extends WellnessRoutine {
  category: 'pranayama';
  breathingPattern?: string;
  beginnerDuration: string;
  advancedDuration?: string;
  breathRetention?: boolean;
}

export interface MeditationRoutine extends WellnessRoutine {
  category: 'meditation';
  meditationStyle:
    | 'breath-awareness'
    | 'mantra'
    | 'dharana'
    | 'body-scan'
    | 'yoga-nidra-inspired'
    | 'silent-observation';
  openingGuidance: string;
  closingGuidance: string;
}

export const PRANAYAMA_LIBRARY: PranayamaRoutine[] = [
  {
    id: 'p1',
    category: 'pranayama',
    title: 'Bhastrika — Bellows Breath',
    shortDescription: 'A short, rhythmic breathing practice to awaken the body and bring attention to the breath.',
    description:
      'Practice upright, with relaxed shoulders and a comfortable seated posture. Bhastrika uses active inhalation and active exhalation. Keep the pace controlled rather than forceful, especially when learning.',
    durationMinutes: 5,
    intensity: 'low',
    focus: ['energy', 'breath-awareness', 'focus'],
    recommendedPhases: ['follicular', 'ovulatory', 'luteal', 'menstrual'],
    estimatedCalories: 0,
    calorieNote: 'Not a calorie-burning workout. Calorie estimates are intentionally not used as a performance metric.',
    imageUrl: require('../../../assets/images/pranayama/bhastrika_bellows_breath.jpg'),
    imageName: 'bhastrika_bellows_breath.jpg',
    breathingPattern: 'Active, rhythmic inhale + active, rhythmic exhale; never strain.',
    beginnerDuration: '2–3 minutes',
    advancedDuration: 'Up to 5 minutes if comfortable',
    breathRetention: false,
    steps: [
      'Sit tall in Sukhasana, on a cushion, or on a stable chair with both feet supported.',
      'Take 3–5 slow natural breaths to settle.',
      'Begin gentle, rhythmic inhalations and exhalations with the abdomen moving naturally.',
      'Keep the face, jaw and shoulders relaxed; stop if you feel dizzy, breathless or uncomfortable.',
      'Finish with 3 slow natural breaths before moving to the next practice.'
    ],
    benefits: [
      'Builds awareness of diaphragmatic breathing',
      'Can create a feeling of alertness and readiness',
      'Provides a structured transition into a breathwork session'
    ],
    safetyNotes: [
      'Do not force the breath or chase a fast pace.',
      'Skip or get qualified guidance first if you have significant cardiovascular or respiratory problems, uncontrolled blood pressure, are pregnant, or have recently had surgery.',
      'Stop immediately for chest pain, faintness, severe headache or unusual breathlessness.'
    ],
    coachTip: 'Quality beats speed. A smooth rhythm is more valuable than powerful-looking breaths.'
  },
  {
    id: 'p2',
    category: 'pranayama',
    title: 'Kapalbhati — Active Exhalation',
    shortDescription: 'A traditional cleansing-style breathing technique centered on gentle, active exhalations.',
    description:
      'Kapalbhati is different from ordinary deep breathing: exhalation is active and the inhalation is passive. Begin slowly and learn the abdominal action before increasing repetitions.',
    durationMinutes: 10,
    intensity: 'low',
    focus: ['energy', 'breath-awareness', 'focus'],
    recommendedPhases: ['follicular', 'ovulatory'],
    estimatedCalories: 0,
    calorieNote: 'Not a calorie-burning workout.',
    imageUrl: require('../../../assets/images/pranayama/kapalbhati_active_exhalation.jpg'),
    imageName: 'kapalbhati_active_exhalation.jpg',
    breathingPattern: 'Passive inhale + gentle, active exhale through the nose.',
    beginnerDuration: '2–5 minutes with frequent pauses',
    advancedDuration: 'Up to 10 minutes only if well tolerated',
    breathRetention: false,
    steps: [
      'Sit upright with the abdomen relaxed.',
      'Take one comfortable natural inhale.',
      'Gently contract the abdomen to produce a short active exhalation.',
      'Allow the next inhalation to happen naturally; do not pull air in forcefully.',
      'Start with short rounds and rest between them.'
    ],
    benefits: [
      'Improves awareness of abdominal breathing mechanics',
      'Can feel invigorating when performed gently',
      'Creates a focused rhythmic practice'
    ],
    safetyNotes: [
      'Do not perform forcefully or to the point of dizziness.',
      'Avoid breath retention during this practice.',
      'Use professional guidance if pregnant or if you have uncontrolled blood pressure, significant heart or lung disease, a hernia, recent abdominal surgery, or another condition affected by forceful breathing.'
    ],
    coachTip: 'Think “short and controlled,” not “hard and fast.”'
  },
  {
    id: 'p3',
    category: 'pranayama',
    title: 'Bahya Pranayama — External Retention',
    shortDescription: 'A brief traditional practice involving exhalation followed by a comfortable pause before inhaling.',
    description:
      'Bahya includes an exhale followed by external breath retention and is traditionally practiced with bandha work. Because retention can change pressure and cardiovascular responses, the beginner version should omit locks and remain very gentle.',
    durationMinutes: 3,
    intensity: 'low',
    focus: ['focus', 'breath-awareness', 'grounding'],
    recommendedPhases: ['follicular', 'ovulatory'],
    estimatedCalories: 0,
    calorieNote: 'Not a calorie-burning workout.',
    imageUrl: require('../../../assets/images/pranayama/bahya_pranayama_external_retention.jpg'),
    imageName: 'bahya_pranayama_external_retention.jpg',
    breathingPattern: 'Comfortable exhale → brief, unforced pause → relaxed inhale.',
    beginnerDuration: '3 gentle repetitions without bandhas',
    advancedDuration: '3–5 repetitions with qualified instruction',
    breathRetention: true,
    steps: [
      'Sit comfortably upright and take 2–3 natural breaths.',
      'Exhale normally without squeezing the lungs empty.',
      'If experienced and comfortable, pause briefly after the exhale; beginners should keep this pause very short.',
      'Release the pause and inhale smoothly without gasping.',
      'Rest with normal breathing between repetitions.'
    ],
    benefits: [
      'Develops breath control and concentration',
      'Encourages awareness of the pause between breaths',
      'Can provide a quiet transition from active pranayama to meditation'
    ],
    safetyNotes: [
      'Do not strain, compete for longer retention, or practice while standing.',
      'Do not use prolonged retention without qualified instruction.',
      'Avoid retention if pregnant or if you have cardiovascular disease, uncontrolled blood pressure, fainting history, or another condition for which breath holding is unsuitable.'
    ],
    coachTip: 'The pause should feel calm, never like a test of willpower.'
  },
  {
    id: 'p4',
    category: 'pranayama',
    title: 'Anulom Vilom — Alternate Nostril Breathing',
    shortDescription: 'Slow alternate-nostril breathing for steadiness, breath awareness and a calm mental rhythm.',
    description:
      'Use a comfortable, unforced breath while alternating nostrils. The beginner version does not require breath retention or complex ratios.',
    durationMinutes: 10,
    intensity: 'very-low',
    focus: ['relaxation', 'breath-awareness', 'emotional-balance', 'focus'],
    recommendedPhases: ['menstrual', 'luteal', 'follicular', 'ovulatory'],
    estimatedCalories: 0,
    calorieNote: 'Not a calorie-burning workout.',
    imageUrl: require('../../../assets/images/pranayama/anulom_vilom_alternate_nostril.jpg'),
    imageName: 'anulom_vilom_alternate_nostril.jpg',
    breathingPattern: 'Left inhale → right exhale → right inhale → left exhale; slow and comfortable.',
    beginnerDuration: '5 minutes',
    advancedDuration: '10–15 minutes',
    breathRetention: false,
    steps: [
      'Sit tall and relax your shoulders.',
      'Close the right nostril gently and inhale through the left.',
      'Close the left nostril and exhale through the right.',
      'Inhale through the right, then exhale through the left.',
      'Continue slowly without forcing the breath or adding retention.'
    ],
    benefits: [
      'Encourages slow, deliberate breathing',
      'Useful as a transition from exercise into relaxation',
      'Supports breath-focused attention and mental settling'
    ],
    safetyNotes: [
      'Keep the breath natural and comfortable.',
      'Do not pinch the nose hard or create nasal discomfort.',
      'If nasal congestion, dizziness or breathlessness develops, stop and return to normal breathing.'
    ],
    coachTip: 'Make the exhale soft and unhurried; the goal is steadiness, not volume.'
  },
  {
    id: 'p5',
    category: 'pranayama',
    title: 'Bhramari — Humming Bee Breath',
    shortDescription: 'A soothing humming practice that creates a gentle vibration during exhalation.',
    description:
      'Bhramari pairs a comfortable inhale with a slow humming exhale. The sound gives the mind an easy point of focus and works especially well before meditation or bedtime.',
    durationMinutes: 5,
    intensity: 'very-low',
    focus: ['relaxation', 'rejuvenation', 'emotional-balance'],
    recommendedPhases: ['menstrual', 'luteal', 'follicular', 'ovulatory'],
    estimatedCalories: 0,
    calorieNote: 'Not a calorie-burning workout.',
    imageUrl: require('../../../assets/images/pranayama/bhramari_humming_bee_breath.jpg'),
    imageName: 'bhramari_humming_bee_breath.jpg',
    breathingPattern: 'Comfortable inhale → long, smooth humming exhale.',
    beginnerDuration: '5 rounds',
    advancedDuration: '7–10 rounds',
    breathRetention: false,
    steps: [
      'Sit comfortably and take a gentle inhale through the nose.',
      'Exhale slowly while making a soft, steady humming sound.',
      'Keep the sound smooth rather than loud.',
      'Optionally close the ears gently with the thumbs; never press hard.',
      'Pause for one natural breath and repeat.'
    ],
    benefits: [
      'Provides a simple anchor for attention',
      'Can feel calming and soothing',
      'Pairs naturally with meditation and evening wind-down routines'
    ],
    safetyNotes: [
      'Do not press on the ears or eyes.',
      'Keep the humming comfortable if you have sinus, ear or jaw discomfort.',
      'Stop if the vibration causes pain or significant pressure.'
    ],
    coachTip: 'Let the exhale become longer naturally; do not force a very long breath.'
  },
  {
    id: 'p6',
    category: 'pranayama',
    title: 'Udgeeth — OM Chanting',
    shortDescription: 'Slow breathing with a resonant OM chant to settle attention and create a peaceful rhythm.',
    description:
      'Udgeeth combines a comfortable inhale with a prolonged OM on the exhale. It can be practiced alone or immediately before silent meditation.',
    durationMinutes: 5,
    intensity: 'very-low',
    focus: ['relaxation', 'rejuvenation', 'focus', 'grounding'],
    recommendedPhases: ['menstrual', 'luteal', 'follicular', 'ovulatory'],
    estimatedCalories: 0,
    calorieNote: 'Not a calorie-burning workout.',
    imageUrl: require('../../../assets/images/pranayama/udgeeth_om_chanting.jpg'),
    imageName: 'udgeeth_om_chanting.jpg',
    breathingPattern: 'Comfortable inhale → slow OM chant on the exhale.',
    beginnerDuration: '5 rounds',
    advancedDuration: '7–10 rounds',
    breathRetention: false,
    steps: [
      'Sit upright with the spine comfortable and stable.',
      'Inhale gently through the nose.',
      'Exhale while chanting “OM” at a comfortable volume.',
      'Let the final sound fade naturally rather than forcing the breath empty.',
      'Sit quietly for one or two breaths before repeating.'
    ],
    benefits: [
      'Creates an audible focus point',
      'Can help shift attention away from mental clutter',
      'Works well as a bridge from pranayama into meditation'
    ],
    safetyNotes: [
      'Do not force the volume or duration of the chant.',
      'A silent mental OM is a suitable alternative if chanting is uncomfortable.'
    ],
    coachTip: 'Prioritize resonance and ease over making the OM last as long as possible.'
  },
  {
    id: 'p7',
    category: 'pranayama',
    title: 'Pranav — Silent Breath Awareness',
    shortDescription: 'A quiet, meditation-like breath observation practice to finish pranayama.',
    description:
      'Pranav is the still, silent phase of the sequence. No special breathing technique is required: simply sit upright and observe the natural breath without manipulating it.',
    durationMinutes: 5,
    intensity: 'very-low',
    focus: ['rejuvenation', 'relaxation', 'breath-awareness', 'grounding'],
    recommendedPhases: ['menstrual', 'luteal', 'follicular', 'ovulatory'],
    estimatedCalories: 0,
    calorieNote: 'Not a calorie-burning workout.',
    imageUrl: require('../../../assets/images/pranayama/pranav_silent_breath_awareness.jpg'),
    imageName: 'pranav_silent_breath_awareness.jpg',
    breathingPattern: 'Natural breathing; no intentional ratio or retention.',
    beginnerDuration: '2–5 minutes',
    advancedDuration: '5–10 minutes',
    breathRetention: false,
    steps: [
      'Stop all active breath techniques.',
      'Let the breath return to its natural rhythm.',
      'Notice the sensation of breathing at the nostrils, chest or abdomen.',
      'When thoughts appear, acknowledge them and gently return to the breath.',
      'Finish without abruptly changing your breathing.'
    ],
    benefits: [
      'Creates a calm landing after active pranayama',
      'Builds mindfulness and interoceptive awareness',
      'Requires almost no physical effort'
    ],
    safetyNotes: [
      'There is no need to control or deepen the breath.',
      'If sitting still is uncomfortable, use a chair or lie down safely.'
    ],
    coachTip: 'Nothing to achieve here. Observe, soften and allow.'
  }
];

export const PRANAYAMA_PACKAGE: PranayamaRoutine[] = [
  PRANAYAMA_LIBRARY.find(p => p.id === 'p1')!,
  PRANAYAMA_LIBRARY.find(p => p.id === 'p2')!,
  PRANAYAMA_LIBRARY.find(p => p.id === 'p3')!,
  PRANAYAMA_LIBRARY.find(p => p.id === 'p4')!,
  PRANAYAMA_LIBRARY.find(p => p.id === 'p5')!,
  PRANAYAMA_LIBRARY.find(p => p.id === 'p6')!,
  PRANAYAMA_LIBRARY.find(p => p.id === 'p7')!
];

export const MEDITATION_LIBRARY: MeditationRoutine[] = [
  {
    id: 'med1',
    category: 'meditation',
    title: 'Prana Sanchar — Conscious Breathing',
    shortDescription: 'A gentle 5-minute arrival practice to settle the body before meditation.',
    description: 'Use slow, quiet diaphragmatic breathing to transition from daily activity into stillness.',
    durationMinutes: 5,
    intensity: 'very-low',
    focus: ['relaxation', 'breath-awareness', 'grounding'],
    recommendedPhases: ['menstrual', 'luteal', 'follicular', 'ovulatory'],
    estimatedCalories: 0,
    calorieNote: 'Meditation is not intended for calorie expenditure.',
    imageUrl: require('../../../assets/images/meditation/prana_sanchar_conscious_breathing.jpg'),
    imageName: 'prana_sanchar_conscious_breathing.jpg',
    meditationStyle: 'breath-awareness',
    openingGuidance: 'Sit tall, soften the shoulders and allow the breath to become slow and quiet.',
    closingGuidance: 'Take one slightly deeper breath, notice the room around you, and open your eyes gently.',
    steps: [
      'Sit in Sukhasana, Padmasana, or comfortably on a chair.',
      'Place the hands in a relaxed position such as Gyan Mudra.',
      'Breathe slowly through the nose without forcing the inhale.',
      'Notice the abdomen and lower ribs expanding and softening.',
      'Allow physical restlessness to settle.'
    ],
    benefits: [
      'Creates a clear transition into meditation',
      'Encourages relaxed breathing',
      'Helps establish a consistent mindfulness ritual'
    ],
    safetyNotes: [
      'Use a chair or back support if floor sitting is uncomfortable.',
      'Do not deliberately over-breathe or take unusually large breaths.'
    ],
    coachTip: 'Arrive first; meditation becomes easier when you stop trying to rush into it.'
  },
  {
    id: 'med2',
    category: 'meditation',
    title: 'Bhramari & OM Meditation',
    shortDescription: 'A 5-minute sound-based practice using humming and OM to gather attention.',
    description: 'Begin with gentle Bhramari, continue with slow OM chanting, and then sit quietly for a few breaths.',
    durationMinutes: 5,
    intensity: 'very-low',
    focus: ['relaxation', 'focus', 'emotional-balance'],
    recommendedPhases: ['menstrual', 'luteal', 'follicular', 'ovulatory'],
    estimatedCalories: 0,
    calorieNote: 'Meditation is not intended for calorie expenditure.',
    imageUrl: require('../../../assets/images/meditation/bhramari_om_meditation.jpg'),
    imageName: 'bhramari_om_meditation.jpg',
    meditationStyle: 'mantra',
    openingGuidance: 'Settle the body and take two comfortable breaths before beginning the sound practice.',
    closingGuidance: 'Allow the final OM to fade completely, then rest in silence.',
    steps: [
      'Complete 3–5 gentle Bhramari rounds.',
      'Continue with 3 slow OM chants.',
      'After the final chant, stop deliberately controlling the breath.',
      'Notice the quiet that follows the sound.'
    ],
    benefits: [
      'Gives the mind a simple auditory anchor',
      'Creates a calming transition into silence',
      'Can be used as a short evening reset'
    ],
    safetyNotes: [
      'Keep the sound comfortable and moderate.',
      'Mental repetition of OM is fine if vocal chanting is not appropriate.'
    ],
    coachTip: 'Notice the silence after the sound instead of immediately creating the next thought.'
  },
  {
    id: 'med3',
    category: 'meditation',
    title: 'Ajna Dharana — Gentle Focus',
    shortDescription: 'A focused-attention meditation using a soft point of awareness between the eyebrows.',
    description: 'Rest attention gently at the area between the eyebrows while repeating a chosen neutral mantra such as OM. The point is concentration, not physical strain or visual pressure.',
    durationMinutes: 8,
    intensity: 'very-low',
    focus: ['focus', 'grounding', 'emotional-balance'],
    recommendedPhases: ['follicular', 'ovulatory', 'luteal'],
    estimatedCalories: 0,
    calorieNote: 'Meditation is not intended for calorie expenditure.',
    imageUrl: require('../../../assets/images/meditation/ajna_dharana_gentle_focus.jpg'),
    imageName: 'ajna_dharana_gentle_focus.jpg',
    meditationStyle: 'dharana',
    openingGuidance: 'Close the eyes naturally and let the facial muscles soften.',
    closingGuidance: 'Release the focus point and feel the whole body for a few breaths.',
    steps: [
      'Sit comfortably with the spine upright but not rigid.',
      'Choose one gentle point of attention between the eyebrows.',
      'Optionally repeat OM mentally with each natural breath.',
      'When the mind wanders, return without frustration.',
      'Keep the forehead, eyes and jaw relaxed.'
    ],
    benefits: [
      'Trains sustained attention',
      'Provides a simple structure for a busy mind',
      'Can be shortened to 3–5 minutes on low-energy days'
    ],
    safetyNotes: [
      'Do not cross or strain the eyes.',
      'If the forehead or eyes become tense, move attention back to the breath.'
    ],
    coachTip: 'The focus should feel soft. Concentration is not the same as forcing attention.'
  },
  {
    id: 'med4',
    category: 'meditation',
    title: 'Pranav Dhyana — Pure Observation',
    shortDescription: 'A 10-minute silent meditation for observing breath, thoughts and sensations without judgment.',
    description: 'After the active techniques are complete, drop the mantra and simply observe experience as it changes.',
    durationMinutes: 10,
    intensity: 'very-low',
    focus: ['rejuvenation', 'relaxation', 'breath-awareness', 'emotional-balance'],
    recommendedPhases: ['menstrual', 'luteal', 'follicular', 'ovulatory'],
    estimatedCalories: 0,
    calorieNote: 'Meditation is not intended for calorie expenditure.',
    imageUrl: require('../../../assets/images/meditation/pranav_dhyana_pure_observation.jpg'),
    imageName: 'pranav_dhyana_pure_observation.jpg',
    meditationStyle: 'silent-observation',
    openingGuidance: 'Let the breath become completely natural and allow the body to be still.',
    closingGuidance: 'Notice your surroundings before moving; do not jump immediately into activity.',
    steps: [
      'Sit still and let the breath happen by itself.',
      'Observe thoughts, sounds, sensations and emotions as passing events.',
      'Do not fight thoughts and do not deliberately follow them.',
      'When you notice you have drifted, return to simple awareness.',
      'Remain a neutral witness rather than judging the meditation.'
    ],
    benefits: [
      'Encourages non-reactive awareness',
      'Supports mental decompression',
      'Pairs especially well with a complete pranayama session'
    ],
    safetyNotes: [
      'If stillness feels uncomfortable, practice for 3–5 minutes and gradually increase.',
      'If meditation brings up intense distress, stop and seek appropriate support rather than forcing the session.'
    ],
    coachTip: 'A wandering mind is not a failed meditation. Returning is the practice.'
  },
  {
    id: 'med5',
    category: 'meditation',
    title: 'Body Scan Rejuvenation',
    shortDescription: 'A low-effort body scan to release unnecessary tension from head to feet.',
    description: 'Move attention slowly through the body, noticing areas of tension without trying to change every sensation.',
    durationMinutes: 10,
    intensity: 'very-low',
    focus: ['rejuvenation', 'relaxation', 'grounding'],
    recommendedPhases: ['menstrual', 'luteal'],
    estimatedCalories: 0,
    calorieNote: 'Meditation is not intended for calorie expenditure.',
    imageUrl: require('../../../assets/images/meditation/body_scan_rejuvenation.jpg'),
    imageName: 'body_scan_rejuvenation.jpg',
    meditationStyle: 'body-scan',
    openingGuidance: 'Lie down or sit comfortably and let your breathing become natural.',
    closingGuidance: 'Move fingers and toes slowly, then sit up gradually if lying down.',
    steps: [
      'Bring attention to the face and jaw and consciously soften them.',
      'Notice the neck, shoulders and arms.',
      'Move attention through the chest, abdomen and pelvis.',
      'Continue through the thighs, knees, calves, ankles and feet.',
      'Finish by sensing the whole body at once.'
    ],
    benefits: [
      'Encourages awareness of physical tension',
      'Requires minimal physical effort',
      'Useful on tired or low-energy days'
    ],
    safetyNotes: [
      'You do not need to change or suppress any sensation.',
      'Choose a comfortable position and avoid lying down somewhere unsafe if you may fall asleep.'
    ],
    coachTip: 'Think “notice and soften,” not “fix everything.”'
  },
  {
    id: 'med6',
    category: 'meditation',
    title: 'Night Calm — Sleep Wind-Down',
    shortDescription: 'A quiet 10-minute practice designed to help transition from an active day toward rest.',
    description: 'Use gentle breathing, progressive relaxation and open awareness without trying to force sleep.',
    durationMinutes: 10,
    intensity: 'very-low',
    focus: ['sleep', 'relaxation', 'rejuvenation'],
    recommendedPhases: ['menstrual', 'luteal', 'follicular', 'ovulatory'],
    estimatedCalories: 0,
    calorieNote: 'Meditation is not intended for calorie expenditure.',
    imageUrl: require('../../../assets/images/meditation/night_calm_sleep_wind_down.jpg'),
    imageName: 'night_calm_sleep_wind_down.jpg',
    meditationStyle: 'yoga-nidra-inspired',
    openingGuidance: 'Lie comfortably with the room dim and your phone away from reach.',
    closingGuidance: 'If practicing in bed, simply allow the session to end and continue resting.',
    steps: [
      'Take several natural breaths without deliberately increasing their size.',
      'Relax the forehead, jaw, shoulders and hands.',
      'Notice the weight of the body against the bed or floor.',
      'Let thoughts come and go without solving problems.',
      'Gradually shift from active attention to effortless awareness.'
    ],
    benefits: [
      'Creates a consistent pre-sleep ritual',
      'Encourages physical and mental downshifting',
      'Pairs well with evening Bhramari or gentle OM chanting'
    ],
    safetyNotes: [
      'Do not practice breath retention when preparing for sleep.',
      'The goal is relaxation, not forcing yourself to fall asleep.'
    ],
    coachTip: 'Make the environment part of the practice: dim light, low stimulation and no need to “perform.”'
  }
];

export const COMPLETE_PRANAYAMA_MEDITATION_SESSION = {
  title: 'Pranayama + Meditation — Feel Good Reset',
  durationMinutes: 35,
  description:
    'A complete low-effort wellness session that moves from conscious breathing into gentle pranayama, sound, and finally silent meditation.',
  calorieNote:
    'This session is for relaxation, breath awareness, mental reset and rejuvenation—not calorie burning.',
  sequence: [
    { order: 1, routineId: 'med1', durationMinutes: 5, title: 'Prana Sanchar — Conscious Breathing' },
    { order: 2, routineId: 'p1', durationMinutes: 3, title: 'Bhastrika — Gentle Bellows Breath' },
    { order: 3, routineId: 'p2', durationMinutes: 5, title: 'Kapalbhati — Gentle Active Exhalation' },
    { order: 4, routineId: 'p3', durationMinutes: 2, title: 'Bahya — Short External Pause' },
    { order: 5, routineId: 'p4', durationMinutes: 7, title: 'Anulom Vilom — Alternate Nostril Breathing' },
    { order: 6, routineId: 'p5', durationMinutes: 2, title: 'Bhramari — Humming Breath' },
    { order: 7, routineId: 'p6', durationMinutes: 3, title: 'Udgeeth — OM Chanting' },
    { order: 8, routineId: 'med4', durationMinutes: 6, title: 'Pranav Dhyana — Pure Observation' },
    { order: 9, routineId: 'grounding', durationMinutes: 2, title: 'Closing & Grounding' }
  ],
  practiceGuidelines: [
    'Traditionally, pranayama is practiced on a relatively empty stomach and in a comfortable upright posture.',
    'Beginners should not treat breath retention as a challenge. The complete session can omit Bahya entirely.',
    'Keep the session gentle on days of fatigue, cramps, dizziness or discomfort.',
    'Finish with a slow transition back to normal activity.'
  ]
};

export const MEDITATION_SEQUENCE = {
  title: 'Classical-Inspired Meditation Flow',
  durationMinutes: 30,
  description:
    'A structured progression from settling the body, to sound, to focused attention, and finally effortless observation.',
  phases: [
    {
      order: 1,
      title: 'Stabilization',
      routineId: 'med1',
      durationMinutes: 5,
      focus: 'Slow conscious breathing and physical settling.'
    },
    {
      order: 2,
      title: 'Resonance',
      routineId: 'med2',
      durationMinutes: 5,
      focus: 'Bhramari followed by gentle OM chanting.'
    },
    {
      order: 3,
      title: 'Fixed Focus',
      routineId: 'med3',
      durationMinutes: 8,
      focus: 'Soft Ajna-area attention with optional mental mantra repetition.'
    },
    {
      order: 4,
      title: 'Absorption',
      routineId: 'med4',
      durationMinutes: 10,
      focus: 'Silent observation without mantra or breath manipulation.'
    },
    {
      order: 5,
      title: 'Closing',
      routineId: 'grounding',
      durationMinutes: 2,
      focus: 'Gentle grounding and transition back to the day.'
    }
  ]
};

// Keep these as UI-friendly helpers for the new sections.
export const getPranayamaById = (id: string): PranayamaRoutine | undefined =>
  PRANAYAMA_LIBRARY.find(p => p.id === id);

export const getMeditationById = (id: string): MeditationRoutine | undefined =>
  MEDITATION_LIBRARY.find(m => m.id === id);

export const getPranayamaForPhase = (phase: CyclePhase): PranayamaRoutine[] =>
  PRANAYAMA_LIBRARY.filter(p => p.recommendedPhases.includes(phase));

export const getMeditationForPhase = (phase: CyclePhase): MeditationRoutine[] =>
  MEDITATION_LIBRARY.filter(m => m.recommendedPhases.includes(phase));

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


/*
 * IMAGE ASSET MANIFEST
 * Place these files under:
 *   assets/images/workouts/
 *   assets/images/pranayama/
 *   assets/images/meditation/
 *
 * Keep the visual language consistent: premium, calm, natural lighting,
 * clean background, anatomically correct posture, no text inside the image.
 */
export const WELLNESS_IMAGE_ASSETS = {
  workouts: [
    'menstrual_relief_flow.jpg',
    'luteal_de_stress_yoga.jpg',
    'follicular_build_circuit.jpg',
    'luteal_slow_burn_pilates.jpg',
    'ovulatory_strength_pr.jpg',
    'ovulatory_hiit_spike.jpg',
    'follicular_power_dance.jpg',
    'deep_rest_yin.jpg',
    'incline_walking_series.jpg',
    'living_room_dumbbell_circuit.jpg',
    'bodyweight_core_glutes.jpg',
    'pms_evening_pilates.jpg',
    'heavy_lower_body_glute_focus.jpg',
    'upper_body_pull_push.jpg',
    'luteal_deload_machine_circuit.jpg',
    'neighborhood_power_walk.jpg',
    'three_k_run.jpg',
    'steady_state_swimming.jpg',
    'cycling_spin_class.jpg'
  ],
  pranayama: [
    'bhastrika_bellows_breath.jpg',
    'kapalbhati_active_exhalation.jpg',
    'bahya_pranayama_external_retention.jpg',
    'anulom_vilom_alternate_nostril.jpg',
    'bhramari_humming_bee_breath.jpg',
    'udgeeth_om_chanting.jpg',
    'pranav_silent_breath_awareness.jpg'
  ],
  meditation: [
    'prana_sanchar_conscious_breathing.jpg',
    'bhramari_om_meditation.jpg',
    'ajna_dharana_gentle_focus.jpg',
    'pranav_dhyana_pure_observation.jpg',
    'body_scan_rejuvenation.jpg',
    'night_calm_sleep_wind_down.jpg'
  ]
};
