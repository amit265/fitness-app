import { CyclePhase } from '../../types';

/**
 * Sini Nutrition Library
 * ---------------------------------------------------------------------------
 * Product philosophy:
 * - Cycle-aware without claiming that every person needs a different diet
 *   in every cycle phase.
 * - Food-first, practical and flexible.
 * - Recipes emphasize protein, fiber, minimally processed foods, hydration,
 *   iron-rich foods during menstruation, and magnesium-rich foods during the
 *   luteal phase.
 * - "Foods to limit" means optional moderation, not prohibition.
 * - Calorie/protein values are estimates and should not be treated as medical
 *   or laboratory measurements.
 *
 * Important: cycle-phase nutrition is a personalization layer, not a medical
 * treatment. PCOS-friendly is used here to describe a balanced, fiber-rich,
 * protein-paired eating pattern; it does not imply that food alone treats PCOS.
 */

export type DietProtocol =
  | 'balanced'
  | 'plant-based'
  | 'high-protein'
  | 'pcos-friendly'
  | 'mediterranean';

export type WeightGoal = 'lose' | 'maintain' | 'gain' | 'wellness';

export type MealType =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snack'
  | 'drink';

export type NutritionFocus =
  | 'iron'
  | 'protein'
  | 'fiber'
  | 'omega-3'
  | 'magnesium'
  | 'vitamin-c'
  | 'hydration'
  | 'steady-energy'
  | 'comfort'
  | 'gut-health'
  | 'antioxidants'
  | 'healthy-fats'
  | 'recovery';

export interface PhaseNutritionGuide {
  phase: CyclePhase;
  focusTitle: string;
  focusDescription: string;
  practicalGoal: string;
  keyNutrients: string[];
  foodsToPrioritize: string[];
  foodsToLimit: string[];
  hydrationGuidance: string;
  mealStrategy: string;
  cravingStrategy: string;
  dietaryAdaptations: Record<DietProtocol, string>;
  simplePlateGuide: string;
  notes: string[];
}

export const NUTRITION_LIBRARY: Record<CyclePhase, PhaseNutritionGuide> = {
  menstrual: {
    phase: 'menstrual',
    focusTitle: 'Replenish & Comfort',
    focusDescription:
      'Choose nourishing, satisfying meals that are easy to enjoy during your period. Give extra attention to iron-rich foods, vitamin-C-rich produce, protein, omega-3-rich foods and fluids.',
    practicalGoal:
      'Build meals around protein + iron-rich food + colorful produce + a satisfying carbohydrate source.',
    keyNutrients: ['Iron', 'Vitamin C', 'Protein', 'Omega-3s', 'Magnesium'],
    foodsToPrioritize: [
      'Lentils, beans and chickpeas',
      'Lean meat or poultry if eaten',
      'Eggs',
      'Spinach and other leafy greens',
      'Lemon, oranges and bell peppers',
      'Salmon, sardines and other oily fish',
      'Pumpkin seeds and sesame',
      'Oats, rice, potatoes and other satisfying whole-food carbohydrates',
      'Soups, dal and warm meals',
      'Water and unsweetened fluids'
    ],
    foodsToLimit: [
      'Large amounts of alcohol',
      'Very salty ultra-processed meals if they worsen bloating',
      'Large amounts of added sugar',
      'Excess caffeine if it worsens sleep, anxiety or discomfort'
    ],
    hydrationGuidance:
      'Drink regularly across the day. Water, unsweetened tea and water-rich foods can all contribute to hydration.',
    mealStrategy:
      'Favor warm, familiar meals when appetite or digestion feels sensitive. Pair plant-based iron sources with vitamin-C-rich foods to support iron absorption.',
    cravingStrategy:
      'If you want something sweet, pair fruit or a small portion of dark chocolate with yogurt, nuts, seeds or another protein/fat source for a more satisfying snack.',
    dietaryAdaptations: {
      balanced:
        'Include an iron-rich protein or plant food at least once or twice across the day and pair plant iron with vitamin-C-rich produce.',
      'plant-based':
        'Build around lentils, beans, tofu, tempeh, leafy greens and seeds. Pair iron-rich foods with lemon, citrus, tomatoes or peppers. Ensure reliable vitamin B12 intake.',
      'high-protein':
        'Use eggs, fish, poultry, Greek yogurt or lean meat as convenient protein anchors while keeping vegetables and whole-food carbohydrates in the meal.',
      'pcos-friendly':
        'Pair carbohydrate foods with protein, fiber and healthy fats rather than eating large portions of refined carbohydrate alone.',
      mediterranean:
        'Use olive oil, legumes, leafy greens, tomatoes, whole grains and oily fish as the foundation of comforting meals.'
    },
    simplePlateGuide:
      '½ colorful vegetables/fruit, ¼ protein, ¼ whole-food carbohydrate, plus a small source of healthy fat.',
    notes: [
      'Iron needs vary considerably between people. Persistent fatigue or suspected iron deficiency should be evaluated by a clinician rather than treated through diet alone.',
      'Warm foods are a comfort preference, not a requirement for menstrual health.'
    ]
  },

  follicular: {
    phase: 'follicular',
    focusTitle: 'Fresh & Energizing',
    focusDescription:
      'As energy and appetite change through the follicular phase, build a varied diet around colorful plants, adequate protein, whole-food carbohydrates and healthy fats.',
    practicalGoal:
      'Use variety and freshness to make balanced eating easy and enjoyable.',
    keyNutrients: ['Protein', 'Fiber', 'Antioxidants', 'Healthy Fats', 'B Vitamins'],
    foodsToPrioritize: [
      'Colorful vegetables',
      'Berries and seasonal fruit',
      'Leafy greens',
      'Whole grains',
      'Eggs, fish, tofu, yogurt or lean poultry',
      'Fermented foods such as plain yogurt, kefir or kimchi',
      'Flaxseed and chia seeds',
      'Avocado and extra-virgin olive oil',
      'Beans and lentils'
    ],
    foodsToLimit: [
      'Frequent deep-fried foods',
      'Highly processed snack foods replacing balanced meals',
      'Large amounts of added sugar',
      'Alcohol in excess'
    ],
    hydrationGuidance:
      'Keep fluids steady throughout the day, especially around workouts. Use thirst, activity and climate as practical guides.',
    mealStrategy:
      'Build colorful bowls, salads, grain plates, stir-fries and yogurt/oat breakfasts with a clear protein source.',
    cravingStrategy:
      'Use naturally sweet fruit, yogurt bowls, oats or smoothies instead of relying on sugary drinks and desserts for quick energy.',
    dietaryAdaptations: {
      balanced:
        'Rotate different vegetables, fruits, legumes, whole grains and protein sources across the week.',
      'plant-based':
        'Use tofu, tempeh, lentils, beans, edamame, nuts and seeds. Include a dependable B12 source.',
      'high-protein':
        'Add a protein anchor to every main meal, such as eggs, Greek yogurt, fish, chicken, tofu or cottage cheese.',
      'pcos-friendly':
        'Emphasize high-fiber carbohydrates and pair them with protein or healthy fats for steadier energy.',
      mediterranean:
        'Lean into vegetables, legumes, whole grains, olive oil, herbs, yogurt and fish.'
    },
    simplePlateGuide:
      '½ vegetables/fruit, ¼ protein, ¼ whole grain or starchy vegetable, with olive oil, nuts or seeds as needed.',
    notes: [
      'Fermented foods can be useful additions, but probiotic foods do not need to be consumed every day to make a diet healthy.',
      'There is no need to eliminate dairy or gluten unless they cause symptoms or are medically indicated.'
    ]
  },

  ovulatory: {
    phase: 'ovulatory',
    focusTitle: 'Bright, Balanced & Hydrated',
    focusDescription:
      'Use the high-energy feeling some people experience around ovulation to keep meals colorful, fiber-rich and satisfying without turning the phase into a restrictive "detox" period.',
    practicalGoal:
      'Prioritize produce, protein, whole-food carbohydrates, healthy fats and fluids.',
    keyNutrients: ['Fiber', 'Antioxidants', 'Protein', 'Healthy Fats', 'Hydration'],
    foodsToPrioritize: [
      'Broccoli, cauliflower and other cruciferous vegetables',
      'Berries and citrus',
      'Tomatoes and peppers',
      'Beans and lentils',
      'Quinoa, oats and brown rice',
      'Fish, eggs, tofu or lean poultry',
      'Olive oil',
      'Nuts and seeds',
      'Water-rich fruits and vegetables'
    ],
    foodsToLimit: [
      'Highly processed meals that are low in fiber',
      'Excess sodium if it contributes to bloating',
      'Large amounts of added sugar',
      'Alcohol in excess'
    ],
    hydrationGuidance:
      'Increase attention to fluids during hot weather or active days. Water is the default; electrolytes can be useful for prolonged heavy sweating.',
    mealStrategy:
      'Choose lighter-feeling meals when preferred, but do not intentionally under-eat because energy expenditure or appetite may change from day to day.',
    cravingStrategy:
      'If hunger is high, add a real carbohydrate source such as rice, potatoes, oats, fruit or whole grains instead of trying to suppress appetite.',
    dietaryAdaptations: {
      balanced:
        'Build colorful meals with a mix of vegetables, whole grains, protein and healthy fats.',
      'plant-based':
        'Use legumes, tofu, tempeh, edamame and quinoa for protein while keeping produce variety high.',
      'high-protein':
        'Keep protein consistent but include enough carbohydrate to support training and recovery.',
      'pcos-friendly':
        'Prefer high-fiber carbohydrate sources and pair them with protein, vegetables and healthy fats.',
      mediterranean:
        'Combine large vegetable-based salads or bowls with beans, olive oil, whole grains and fish.'
    },
    simplePlateGuide:
      '½ vegetables, ¼ protein, ¼ whole-food carbohydrate, plus olive oil, nuts or seeds.',
    notes: [
      'The body does not need a food "detox" to remove hormones. The liver and kidneys already perform metabolic and excretory functions.',
      'Cruciferous vegetables are nutritious, but they are not a treatment for estrogen dominance or PCOS.'
    ]
  },

  luteal: {
    phase: 'luteal',
    focusTitle: 'Satisfying & Grounding',
    focusDescription:
      'Support changing appetite and PMS symptoms with regular balanced meals, adequate protein, complex carbohydrate foods, magnesium-rich foods and satisfying healthy fats.',
    practicalGoal:
      'Avoid getting overly hungry: combine protein + fiber + carbohydrate + healthy fat at meals and snacks.',
    keyNutrients: ['Magnesium', 'Protein', 'Fiber', 'Vitamin B6', 'Healthy Fats'],
    foodsToPrioritize: [
      'Sweet potatoes',
      'Oats and whole grains',
      'Pumpkin seeds',
      'Walnuts and almonds',
      'Beans and lentils',
      'Bananas',
      'Leafy greens',
      'Salmon and other oily fish',
      'Plain yogurt or fortified alternatives',
      'Dark chocolate in a modest portion if desired'
    ],
    foodsToLimit: [
      'Large amounts of added sugar',
      'Very salty processed foods if they worsen bloating',
      'Excess caffeine if it worsens sleep, anxiety or breast tenderness',
      'Skipping meals and then relying on highly processed snack foods'
    ],
    hydrationGuidance:
      'Drink consistently rather than dramatically increasing water at one time. Hydration can support normal digestion and help you feel better when bloated.',
    mealStrategy:
      'Do not fear carbohydrates. Pair oats, rice, potatoes, fruit or whole grains with protein and healthy fats for satisfying meals.',
    cravingStrategy:
      'Plan satisfying snacks before cravings become urgent: banana + nut butter, yogurt + berries, roasted chickpeas, or a small dark-chocolate + nut combination.',
    dietaryAdaptations: {
      balanced:
        'Keep meal timing regular and allow slightly larger portions when genuinely hungrier rather than trying to suppress appetite.',
      'plant-based':
        'Use beans, lentils, tofu, tempeh, pumpkin seeds, walnuts and fortified soy foods for protein and micronutrients.',
      'high-protein':
        'Keep protein consistent while adding enough carbohydrate and fat to prevent the diet from becoming unnecessarily restrictive.',
      'pcos-friendly':
        'Choose high-fiber, minimally processed carbohydrates and pair them with protein and healthy fats. A craving is not a failure.',
      mediterranean:
        'Use whole grains, legumes, vegetables, olive oil, nuts, seeds, yogurt and fish for satisfying meals.'
    },
    simplePlateGuide:
      '½ vegetables/fruit, ¼ protein, ¼ carbohydrate, plus a generous but comfortable source of healthy fat.',
    notes: [
      'Energy needs and appetite can change during the luteal phase, but the size of the change varies. Use hunger, activity and individual goals rather than a fixed calorie rule.',
      'Dark chocolate is optional; it is not required for magnesium intake.'
    ]
  },

  unknown: {
    phase: 'unknown',
    focusTitle: 'Balanced Baseline',
    focusDescription:
      'When cycle timing is unknown, use a flexible balanced eating pattern built around protein, vegetables and fruit, whole-food carbohydrates, healthy fats and adequate fluids.',
    practicalGoal:
      'Create a reliable everyday meal pattern before adding cycle-specific suggestions.',
    keyNutrients: ['Protein', 'Fiber', 'Iron', 'Calcium', 'Healthy Fats', 'Water'],
    foodsToPrioritize: [
      'Vegetables and fruit',
      'Whole grains and potatoes',
      'Beans and lentils',
      'Eggs, dairy, fish, poultry or plant proteins',
      'Nuts and seeds',
      'Olive oil and other unsaturated fats',
      'Water and unsweetened beverages'
    ],
    foodsToLimit: [
      'Highly processed foods as the main source of calories',
      'Excess added sugar',
      'Excess alcohol',
      'Frequent meal skipping if it leads to overeating later'
    ],
    hydrationGuidance:
      'Drink according to thirst and activity, with extra attention in hot weather or during prolonged exercise.',
    mealStrategy:
      'Use the simple plate guide at most meals and adjust portions to hunger, activity and your personal goal.',
    cravingStrategy:
      'Cravings are normal. Start with a balanced snack or meal and include the desired food in a reasonable portion when you want it.',
    dietaryAdaptations: {
      balanced:
        'Use a broad variety of foods and adjust portions to your hunger and activity.',
      'plant-based':
        'Prioritize legumes, tofu, tempeh, whole grains, nuts and seeds and ensure dependable B12 intake.',
      'high-protein':
        'Add a clear protein source to each main meal and distribute protein across the day.',
      'pcos-friendly':
        'Emphasize fiber-rich carbohydrates, protein, healthy fats and minimally processed foods.',
      mediterranean:
        'Center meals on vegetables, legumes, whole grains, olive oil, nuts, fish and other minimally processed foods.'
    },
    simplePlateGuide:
      '½ vegetables/fruit, ¼ protein, ¼ whole-food carbohydrate, plus healthy fat according to hunger and meal.',
    notes: [
      'A balanced baseline is appropriate when cycle data is unavailable or irregular.',
      'No single food or dietary pattern is required for everyone.'
    ]
  }
};

export const getNutritionGuideForPhase = (phase: CyclePhase): PhaseNutritionGuide => {
  return NUTRITION_LIBRARY[phase] ?? NUTRITION_LIBRARY.unknown;
};

// ---------------------------------------------------------------------------
// RECIPE LIBRARY
// ---------------------------------------------------------------------------

export interface NutritionRecipe {
  id: string;
  title: string;
  description: string;
  mealType: MealType;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  servings: number;
  recommendedPhases: CyclePhase[];
  weightGoalTags: WeightGoal[];
  estimatedCalories: number;
  proteinGrams: number;
  fiberGrams: number;
  dietaryTags: string[];
  nutritionFocus: NutritionFocus[];
  ingredients: string[];
  instructions: string[];
  substitutions: string[];
  storageTip: string;
  coachTip: string;
  imageUrl?: any;
  imageName: string;
  tutorialMarkdown?: string;
}

export const NUTRITION_RECIPES: NutritionRecipe[] = [
  {
    id: 'n1',
    title: 'Luteal Salmon Grain Bowl',
    description:
      'A satisfying bowl with salmon, quinoa, roasted vegetables, avocado and pumpkin seeds for protein, fiber, healthy fats and magnesium.',
    mealType: 'dinner',
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    totalTimeMinutes: 30,
    servings: 1,
    recommendedPhases: ['luteal', 'ovulatory', 'menstrual'],
    weightGoalTags: ['lose', 'maintain', 'gain', 'wellness'],
    estimatedCalories: 520,
    proteinGrams: 35,
    fiberGrams: 10,
    dietaryTags: ['Pescatarian', 'High-Protein', 'Gluten-Free'],
    nutritionFocus: ['protein', 'omega-3', 'magnesium', 'fiber', 'healthy-fats'],
    ingredients: [
      '5 oz / 140 g salmon fillet',
      '½ cup cooked quinoa',
      '½ avocado',
      '1 cup broccoli and sweet potato, cubed',
      '1 tbsp pumpkin seeds',
      '1 tsp olive oil',
      '½ lemon',
      'Salt and black pepper'
    ],
    instructions: [
      'Cook quinoa according to package instructions.',
      'Toss broccoli and sweet potato with olive oil, salt and pepper. Roast at 200°C / 400°F until tender.',
      'Season salmon and cook until opaque and cooked through.',
      'Assemble quinoa, roasted vegetables, salmon and avocado.',
      'Finish with pumpkin seeds and fresh lemon.'
    ],
    substitutions: [
      'Replace salmon with tofu, tempeh or chickpeas for a plant-based bowl.',
      'Replace quinoa with brown rice, millet or another whole grain.'
    ],
    storageTip: 'Store cooked components separately in the refrigerator and add avocado just before serving.',
    coachTip: 'If you are genuinely hungrier during the luteal phase, add more quinoa or sweet potato rather than trying to suppress the craving.',
    imageUrl: require('../../../assets/images/nutrition/luteal_salmon_grain_bowl.jpg'),
    imageName: 'luteal_salmon_grain_bowl.jpg'
  },

  {
    id: 'n2',
    title: 'Follicular Berry Protein Smoothie',
    description:
      'A quick berry smoothie combining protein, fruit, seeds and leafy greens for an easy breakfast or post-workout option.',
    mealType: 'breakfast',
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    totalTimeMinutes: 5,
    servings: 1,
    recommendedPhases: ['follicular', 'ovulatory'],
    weightGoalTags: ['lose', 'maintain', 'wellness'],
    estimatedCalories: 320,
    proteinGrams: 24,
    fiberGrams: 8,
    dietaryTags: ['Vegetarian', 'Quick', 'High-Protein'],
    nutritionFocus: ['protein', 'fiber', 'antioxidants', 'healthy-fats'],
    ingredients: [
      '1 cup berries',
      '¾ cup plain Greek yogurt or unsweetened soy yogurt',
      '½ banana',
      '1 tbsp ground flaxseed',
      '1 cup unsweetened milk or soy milk',
      'Handful of spinach',
      'Ice as desired'
    ],
    instructions: [
      'Add all ingredients to a blender.',
      'Blend until smooth and creamy.',
      'Add a little more milk if needed for texture.',
      'Serve immediately.'
    ],
    substitutions: [
      'Use fortified soy milk for a higher-protein plant-based version.',
      'Use frozen berries for a colder, thicker smoothie.'
    ],
    storageTip: 'Best consumed immediately; if needed, refrigerate for up to 24 hours and shake before drinking.',
    coachTip: 'A smoothie is more satisfying when it contains protein and fiber rather than fruit juice alone.',
    imageUrl: require('../../../assets/images/nutrition/follicular_berry_protein_smoothie.jpg'),
    imageName: 'follicular_berry_protein_smoothie.jpg'
  },

  {
    id: 'n3',
    title: 'Menstrual Iron-Rich Lentil Dal',
    description:
      'A comforting lentil dal paired with spinach, tomato and lemon to provide plant-based iron, protein and fiber.',
    mealType: 'dinner',
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    totalTimeMinutes: 35,
    servings: 2,
    recommendedPhases: ['menstrual', 'unknown'],
    weightGoalTags: ['lose', 'maintain', 'gain', 'wellness'],
    estimatedCalories: 390,
    proteinGrams: 19,
    fiberGrams: 15,
    dietaryTags: ['Vegan', 'High-Fiber', 'Indian-Inspired'],
    nutritionFocus: ['iron', 'vitamin-c', 'fiber', 'protein'],
    ingredients: [
      '1 cup dry red lentils, rinsed',
      '2 cups water or low-sodium vegetable stock',
      '1 tomato, chopped',
      '2 cups spinach',
      '½ tsp turmeric',
      '½ tsp cumin',
      '1 tsp grated ginger',
      '1 tsp olive or mustard oil',
      '½ lemon',
      'Salt to taste'
    ],
    instructions: [
      'Simmer lentils with water or stock until soft.',
      'Add tomato, turmeric, cumin and ginger and cook until fragrant.',
      'Stir in spinach until wilted.',
      'Season lightly and finish with fresh lemon juice.',
      'Serve with brown rice or roti if desired.'
    ],
    substitutions: [
      'Use yellow moong dal or another lentil.',
      'Add tofu or yogurt on the side for extra protein if desired.'
    ],
    storageTip: 'Refrigerate for up to 3 days and reheat with a splash of water.',
    coachTip: 'The lemon is more than a garnish: vitamin-C-rich foods can help support absorption of non-heme iron from plant foods.',
    imageUrl: require('../../../assets/images/nutrition/menstrual_iron_rich_lentil_dal.jpg'),
    imageName: 'menstrual_iron_rich_lentil_dal.jpg'
  },

  {
    id: 'n4',
    title: 'Magnesium Banana Oat Bowl',
    description:
      'Warm oats with banana, pumpkin seeds, chia and yogurt for a comforting breakfast with fiber, protein and magnesium-rich ingredients.',
    mealType: 'breakfast',
    prepTimeMinutes: 5,
    cookTimeMinutes: 7,
    totalTimeMinutes: 12,
    servings: 1,
    recommendedPhases: ['luteal', 'menstrual'],
    weightGoalTags: ['lose', 'maintain', 'gain', 'wellness'],
    estimatedCalories: 390,
    proteinGrams: 20,
    fiberGrams: 10,
    dietaryTags: ['Vegetarian', 'High-Fiber'],
    nutritionFocus: ['magnesium', 'fiber', 'protein', 'steady-energy'],
    ingredients: [
      '½ cup rolled oats',
      '1 cup milk or fortified soy milk',
      '1 banana, sliced',
      '1 tbsp pumpkin seeds',
      '1 tsp chia seeds',
      '½ tsp cinnamon',
      '2 tbsp Greek yogurt or soy yogurt'
    ],
    instructions: [
      'Simmer oats with milk until creamy.',
      'Top with banana, pumpkin seeds and chia.',
      'Add cinnamon and yogurt.',
      'Serve warm.'
    ],
    substitutions: [
      'Use peanut or almond butter instead of yogurt.',
      'Use certified gluten-free oats if needed.'
    ],
    storageTip: 'Prepare overnight in the refrigerator or store cooked oats for up to 2 days.',
    coachTip: 'This is a good example of a craving-friendly breakfast: carbohydrate, protein, fiber and fat arrive together.',
    imageUrl: require('../../../assets/images/nutrition/magnesium_banana_oat_bowl.jpg'),
    imageName: 'magnesium_banana_oat_bowl.jpg'
  },

  {
    id: 'n5',
    title: 'Mediterranean Chickpea Power Salad',
    description:
      'A colorful chickpea salad with cucumber, tomato, greens, olive oil, herbs and feta for a fast fiber-rich meal.',
    mealType: 'lunch',
    prepTimeMinutes: 12,
    cookTimeMinutes: 0,
    totalTimeMinutes: 12,
    servings: 1,
    recommendedPhases: ['follicular', 'ovulatory', 'unknown'],
    weightGoalTags: ['lose', 'maintain', 'wellness'],
    estimatedCalories: 430,
    proteinGrams: 18,
    fiberGrams: 14,
    dietaryTags: ['Vegetarian', 'Mediterranean', 'High-Fiber'],
    nutritionFocus: ['fiber', 'healthy-fats', 'antioxidants', 'protein'],
    ingredients: [
      '1 cup cooked chickpeas',
      '1 cup cucumber, chopped',
      '1 cup tomato, chopped',
      '2 cups leafy greens',
      '30 g feta',
      '1 tbsp extra-virgin olive oil',
      '½ lemon',
      'Fresh parsley',
      'Black pepper'
    ],
    instructions: [
      'Combine chickpeas, cucumber, tomato and greens.',
      'Add feta and parsley.',
      'Dress with olive oil and lemon.',
      'Toss and serve.'
    ],
    substitutions: [
      'Use tofu or white beans instead of chickpeas.',
      'Skip feta or use a plant-based alternative.'
    ],
    storageTip: 'Keep dressing separate if preparing ahead.',
    coachTip: 'Add a whole-grain pita or cooked grain if you need a larger meal around training.',
    imageUrl: require('../../../assets/images/nutrition/mediterranean_chickpea_power_salad.jpg'),
    imageName: 'mediterranean_chickpea_power_salad.jpg'
  },

  {
    id: 'n6',
    title: 'PCOS-Friendly Chicken & Quinoa Bowl',
    description:
      'A protein-and-fiber-rich bowl built around chicken, quinoa, greens, roasted vegetables and tahini-lemon dressing.',
    mealType: 'lunch',
    prepTimeMinutes: 10,
    cookTimeMinutes: 18,
    totalTimeMinutes: 28,
    servings: 1,
    recommendedPhases: ['follicular', 'ovulatory', 'luteal', 'unknown'],
    weightGoalTags: ['lose', 'maintain', 'wellness'],
    estimatedCalories: 480,
    proteinGrams: 38,
    fiberGrams: 9,
    dietaryTags: ['High-Protein', 'PCOS-Friendly', 'Gluten-Free'],
    nutritionFocus: ['protein', 'fiber', 'steady-energy', 'healthy-fats'],
    ingredients: [
      '120 g cooked chicken breast',
      '½ cup cooked quinoa',
      '1 cup roasted bell peppers and zucchini',
      '1 cup spinach',
      '1 tbsp tahini',
      '½ lemon',
      '1 tsp olive oil',
      'Black pepper and herbs'
    ],
    instructions: [
      'Cook or reheat the chicken and quinoa.',
      'Roast or sauté the vegetables until tender.',
      'Layer greens, quinoa, vegetables and chicken.',
      'Mix tahini with lemon and a little water to make a dressing.',
      'Drizzle over the bowl.'
    ],
    substitutions: [
      'Replace chicken with tofu, tempeh or lentils.',
      'Replace quinoa with brown rice or barley.'
    ],
    storageTip: 'Store dressing separately for up to 3 days.',
    coachTip: '“PCOS-friendly” here means a balanced, fiber-rich pattern—not a special cure diet.',
    imageUrl: require('../../../assets/images/nutrition/pcos_friendly_chicken_quinoa_bowl.jpg'),
    imageName: 'pcos_friendly_chicken_quinoa_bowl.jpg'
  },

  {
    id: 'n7',
    title: 'Salmon Spinach Egg Breakfast',
    description:
      'A savory high-protein breakfast combining eggs, salmon, spinach and whole-grain toast.',
    mealType: 'breakfast',
    prepTimeMinutes: 5,
    cookTimeMinutes: 8,
    totalTimeMinutes: 13,
    servings: 1,
    recommendedPhases: ['menstrual', 'follicular', 'ovulatory', 'luteal'],
    weightGoalTags: ['maintain', 'gain', 'wellness'],
    estimatedCalories: 420,
    proteinGrams: 31,
    fiberGrams: 6,
    dietaryTags: ['Pescatarian', 'High-Protein'],
    nutritionFocus: ['protein', 'omega-3', 'iron', 'recovery'],
    ingredients: [
      '2 eggs',
      '60 g cooked or smoked salmon',
      '1 cup spinach',
      '1 slice whole-grain toast',
      '1 tsp olive oil',
      'Black pepper',
      'Lemon'
    ],
    instructions: [
      'Wilt spinach in olive oil.',
      'Cook eggs to your preferred doneness.',
      'Serve eggs and salmon over or beside spinach.',
      'Add whole-grain toast and lemon.'
    ],
    substitutions: [
      'Use tofu scramble instead of eggs.',
      'Use beans or lentil spread instead of salmon for a plant-based plate.'
    ],
    storageTip: 'Best served fresh.',
    coachTip: 'Savory breakfasts can be especially useful when sweet foods do not keep you satisfied.',
    imageUrl: require('../../../assets/images/nutrition/salmon_spinach_egg_breakfast.jpg'),
    imageName: 'salmon_spinach_egg_breakfast.jpg'
  },

  {
    id: 'n8',
    title: 'Tofu Tempeh Stir-Fry',
    description:
      'A colorful plant-based stir-fry combining tofu, tempeh, broccoli, peppers and brown rice.',
    mealType: 'dinner',
    prepTimeMinutes: 10,
    cookTimeMinutes: 12,
    totalTimeMinutes: 22,
    servings: 2,
    recommendedPhases: ['follicular', 'ovulatory', 'luteal', 'unknown'],
    weightGoalTags: ['lose', 'maintain', 'gain', 'wellness'],
    estimatedCalories: 460,
    proteinGrams: 30,
    fiberGrams: 11,
    dietaryTags: ['Vegan', 'High-Protein', 'High-Fiber'],
    nutritionFocus: ['protein', 'fiber', 'antioxidants', 'healthy-fats'],
    ingredients: [
      '150 g firm tofu, cubed',
      '100 g tempeh, sliced',
      '1 cup broccoli',
      '1 bell pepper',
      '1 cup cooked brown rice',
      '1 tsp sesame oil',
      '1 tbsp low-sodium soy sauce or tamari',
      'Fresh ginger and garlic'
    ],
    instructions: [
      'Brown tofu and tempeh in a hot pan.',
      'Add broccoli and bell pepper and stir-fry until crisp-tender.',
      'Add ginger, garlic and soy sauce.',
      'Serve over brown rice.'
    ],
    substitutions: [
      'Use edamame in place of tempeh.',
      'Use tamari for a gluten-free option.'
    ],
    storageTip: 'Refrigerate for up to 3 days.',
    coachTip: 'Combining two plant protein sources makes it easier to build a satisfying protein-rich meal.',
    imageUrl: require('../../../assets/images/nutrition/tofu_tempeh_stir_fry.jpg'),
    imageName: 'tofu_tempeh_stir_fry.jpg'
  },

  {
    id: 'n9',
    title: 'Luteal Sweet Potato Chaat Bowl',
    description:
      'A satisfying Indian-inspired bowl with sweet potato, chickpeas, yogurt, cucumber, herbs and seeds.',
    mealType: 'lunch',
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    totalTimeMinutes: 30,
    servings: 1,
    recommendedPhases: ['luteal', 'menstrual'],
    weightGoalTags: ['lose', 'maintain', 'wellness'],
    estimatedCalories: 440,
    proteinGrams: 19,
    fiberGrams: 12,
    dietaryTags: ['Vegetarian', 'Indian-Inspired', 'High-Fiber'],
    nutritionFocus: ['magnesium', 'fiber', 'steady-energy', 'protein'],
    ingredients: [
      '1 medium sweet potato',
      '½ cup cooked chickpeas',
      '½ cup plain yogurt',
      '½ cucumber',
      'Fresh coriander',
      '1 tbsp pumpkin seeds',
      'Lemon juice',
      'Roasted cumin',
      'Chaat masala, optional'
    ],
    instructions: [
      'Roast or steam the sweet potato until tender.',
      'Cut into bite-sized pieces.',
      'Top with chickpeas, cucumber, yogurt and coriander.',
      'Finish with lemon, cumin and pumpkin seeds.'
    ],
    substitutions: [
      'Use soy yogurt for a plant-based version.',
      'Use roasted lentils instead of chickpeas.'
    ],
    storageTip: 'Store components separately and assemble before eating.',
    coachTip: 'This gives you the familiar comfort of chaat while keeping protein and fiber in the meal.',
    imageUrl: require('../../../assets/images/nutrition/luteal_sweet_potato_chaat_bowl.jpg'),
    imageName: 'luteal_sweet_potato_chaat_bowl.jpg'
  },

  {
    id: 'n10',
    title: 'Berry Chia Yogurt Cup',
    description:
      'A quick snack or breakfast cup with yogurt, berries, chia and nuts.',
    mealType: 'snack',
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    totalTimeMinutes: 5,
    servings: 1,
    recommendedPhases: ['follicular', 'ovulatory', 'luteal', 'menstrual', 'unknown'],
    weightGoalTags: ['lose', 'maintain', 'wellness'],
    estimatedCalories: 260,
    proteinGrams: 17,
    fiberGrams: 7,
    dietaryTags: ['Vegetarian', 'Quick', 'High-Fiber'],
    nutritionFocus: ['protein', 'fiber', 'antioxidants', 'healthy-fats'],
    ingredients: [
      '¾ cup plain Greek yogurt or soy yogurt',
      '½ cup berries',
      '1 tbsp chia seeds',
      '1 tbsp chopped walnuts',
      'Cinnamon, optional'
    ],
    instructions: [
      'Layer yogurt and berries in a bowl or jar.',
      'Add chia and walnuts.',
      'Finish with cinnamon if desired.'
    ],
    substitutions: [
      'Use fortified soy yogurt for a plant-based option.',
      'Use pumpkin seeds instead of walnuts.'
    ],
    storageTip: 'Refrigerate for up to 24 hours.',
    coachTip: 'Keep this ready for the moment you need a snack, rather than waiting until you are extremely hungry.',
    imageUrl: require('../../../assets/images/nutrition/berry_chia_yogurt_cup.jpg'),
    imageName: 'berry_chia_yogurt_cup.jpg'
  },

  {
    id: 'n11',
    title: 'Comforting Vegetable Khichdi',
    description:
      'A gentle rice-and-lentil one-pot meal with vegetables and warming spices.',
    mealType: 'dinner',
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    totalTimeMinutes: 35,
    servings: 2,
    recommendedPhases: ['menstrual', 'luteal', 'unknown'],
    weightGoalTags: ['lose', 'maintain', 'wellness'],
    estimatedCalories: 360,
    proteinGrams: 15,
    fiberGrams: 9,
    dietaryTags: ['Vegan', 'Indian-Inspired', 'Comfort Food'],
    nutritionFocus: ['comfort', 'fiber', 'protein', 'hydration'],
    ingredients: [
      '½ cup rice',
      '½ cup moong dal',
      '1 cup mixed vegetables',
      '½ tsp turmeric',
      '½ tsp cumin',
      '1 tsp ghee or olive oil',
      '3–4 cups water',
      'Salt to taste'
    ],
    instructions: [
      'Rinse rice and dal.',
      'Add rice, dal, vegetables, spices and water to a pot or pressure cooker.',
      'Cook until very soft and porridge-like.',
      'Finish with ghee or olive oil.'
    ],
    substitutions: [
      'Use more lentils and less rice for higher protein and fiber.',
      'Add spinach or peas for extra vegetables.'
    ],
    storageTip: 'Refrigerate for up to 3 days; add water when reheating.',
    coachTip: 'Soft texture and familiar flavors can make this an excellent low-effort meal on lower-energy days.',
    imageUrl: require('../../../assets/images/nutrition/comforting_vegetable_khichdi.jpg'),
    imageName: 'comforting_vegetable_khichdi.jpg'
  },

  {
    id: 'n12',
    title: 'Omega-3 Sardine Toast',
    description:
      'A quick savory toast with sardines, avocado, tomato and lemon for protein and omega-3 fats.',
    mealType: 'lunch',
    prepTimeMinutes: 8,
    cookTimeMinutes: 2,
    totalTimeMinutes: 10,
    servings: 1,
    recommendedPhases: ['menstrual', 'ovulatory', 'unknown'],
    weightGoalTags: ['lose', 'maintain', 'wellness'],
    estimatedCalories: 390,
    proteinGrams: 27,
    fiberGrams: 8,
    dietaryTags: ['Pescatarian', 'High-Protein'],
    nutritionFocus: ['omega-3', 'protein', 'healthy-fats', 'fiber'],
    ingredients: [
      '2 slices whole-grain toast',
      '1 small tin sardines',
      '½ avocado',
      '½ tomato',
      '½ lemon',
      'Black pepper',
      'Fresh herbs'
    ],
    instructions: [
      'Toast the bread.',
      'Mash avocado onto the toast.',
      'Top with sardines and sliced tomato.',
      'Finish with lemon, herbs and black pepper.'
    ],
    substitutions: [
      'Use salmon or tuna if preferred.',
      'Use mashed chickpeas for a plant-based alternative, though the omega-3 profile will differ.'
    ],
    storageTip: 'Assemble just before serving.',
    coachTip: 'Small oily fish are a convenient way to include omega-3-rich seafood.',
    imageUrl: require('../../../assets/images/nutrition/omega3_sardine_avocado_toast.jpg'),
    imageName: 'omega3_sardine_avocado_toast.jpg'
  },

  {
    id: 'n13',
    title: 'High-Protein Paneer Veggie Wrap',
    description:
      'A filling vegetarian wrap with paneer, crunchy vegetables, mint yogurt and whole-grain roti.',
    mealType: 'lunch',
    prepTimeMinutes: 10,
    cookTimeMinutes: 8,
    totalTimeMinutes: 18,
    servings: 1,
    recommendedPhases: ['follicular', 'ovulatory', 'luteal', 'unknown'],
    weightGoalTags: ['maintain', 'gain', 'wellness'],
    estimatedCalories: 470,
    proteinGrams: 29,
    fiberGrams: 7,
    dietaryTags: ['Vegetarian', 'High-Protein', 'Indian-Inspired'],
    nutritionFocus: ['protein', 'fiber', 'steady-energy'],
    ingredients: [
      '100 g paneer',
      '1 whole-grain roti',
      '½ bell pepper',
      '½ cup shredded cabbage',
      '½ cucumber',
      '2 tbsp plain yogurt',
      'Mint and coriander',
      'Lemon juice'
    ],
    instructions: [
      'Pan-sear paneer and sliced pepper until lightly browned.',
      'Mix yogurt with mint, coriander and lemon.',
      'Layer vegetables, paneer and yogurt sauce on the roti.',
      'Roll tightly and serve.'
    ],
    substitutions: [
      'Use tofu for a vegan version.',
      'Use a whole-wheat tortilla if preferred.'
    ],
    storageTip: 'Store filling separately and assemble when ready.',
    coachTip: 'A balanced wrap is easier to build when you start with a substantial protein source.',
    imageUrl: require('../../../assets/images/nutrition/high_protein_paneer_veggie_wrap.jpg'),
    imageName: 'high_protein_paneer_veggie_wrap.jpg'
  },

  {
    id: 'n14',
    title: 'Green Moong Sprout Bowl',
    description:
      'A crunchy plant-based bowl with moong sprouts, vegetables, seeds and lemon dressing.',
    mealType: 'lunch',
    prepTimeMinutes: 12,
    cookTimeMinutes: 5,
    totalTimeMinutes: 17,
    servings: 1,
    recommendedPhases: ['follicular', 'ovulatory', 'unknown'],
    weightGoalTags: ['lose', 'maintain', 'wellness'],
    estimatedCalories: 310,
    proteinGrams: 16,
    fiberGrams: 11,
    dietaryTags: ['Vegan', 'High-Fiber', 'Indian-Inspired'],
    nutritionFocus: ['fiber', 'vitamin-c', 'protein', 'antioxidants'],
    ingredients: [
      '1 cup cooked or safely prepared moong sprouts',
      '½ cucumber',
      '1 tomato',
      '½ bell pepper',
      '1 tbsp pumpkin seeds',
      'Lemon juice',
      'Fresh coriander',
      'Roasted cumin'
    ],
    instructions: [
      'Combine sprouts and chopped vegetables.',
      'Add pumpkin seeds and coriander.',
      'Dress with lemon and cumin.',
      'Serve immediately.'
    ],
    substitutions: [
      'Use cooked lentils or chickpeas.',
      'Add tofu for more protein.'
    ],
    storageTip: 'Keep chilled and consume promptly; follow safe food-handling practices for sprouts.',
    coachTip: 'Sprouts are optional—cooked legumes provide the same broad food-category benefits with easier storage and preparation.',
    imageUrl: require('../../../assets/images/nutrition/green_moong_sprout_bowl.jpg'),
    imageName: 'green_moong_sprout_bowl.jpg'
  },

  {
    id: 'n15',
    title: 'Luteal Cocoa Nut Energy Bites',
    description:
      'Small no-bake bites made from oats, dates, peanut butter, cocoa and pumpkin seeds for a satisfying sweet snack.',
    mealType: 'snack',
    prepTimeMinutes: 10,
    cookTimeMinutes: 0,
    totalTimeMinutes: 10,
    servings: 6,
    recommendedPhases: ['luteal', 'menstrual'],
    weightGoalTags: ['maintain', 'wellness', 'gain'],
    estimatedCalories: 145,
    proteinGrams: 5,
    fiberGrams: 3,
    dietaryTags: ['Vegan', 'No-Bake', 'Snack'],
    nutritionFocus: ['magnesium', 'healthy-fats', 'steady-energy'],
    ingredients: [
      '1 cup rolled oats',
      '½ cup soft dates',
      '2 tbsp peanut butter',
      '1 tbsp unsweetened cocoa',
      '2 tbsp pumpkin seeds',
      '1–2 tbsp water as needed'
    ],
    instructions: [
      'Blend or mash dates until sticky.',
      'Mix with oats, peanut butter, cocoa and pumpkin seeds.',
      'Add a little water if needed.',
      'Roll into 6 small balls and chill.'
    ],
    substitutions: [
      'Use almond or seed butter.',
      'Use ground flaxseed instead of some of the pumpkin seeds.'
    ],
    storageTip: 'Refrigerate in an airtight container for up to 5 days.',
    coachTip: 'These are a snack, not a “free” food—portion them according to your hunger and goals.',
    imageUrl: require('../../../assets/images/nutrition/luteal_cocoa_nut_energy_bites.jpg'),
    imageName: 'luteal_cocoa_nut_energy_bites.jpg'
  },

  {
    id: 'n16',
    title: 'Golden Turmeric Lentil Soup',
    description:
      'A warming lentil and vegetable soup with turmeric, ginger and lemon for a comforting high-fiber meal.',
    mealType: 'dinner',
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    totalTimeMinutes: 35,
    servings: 3,
    recommendedPhases: ['menstrual', 'luteal', 'unknown'],
    weightGoalTags: ['lose', 'maintain', 'wellness'],
    estimatedCalories: 330,
    proteinGrams: 18,
    fiberGrams: 13,
    dietaryTags: ['Vegan', 'High-Fiber', 'Indian-Inspired'],
    nutritionFocus: ['iron', 'fiber', 'vitamin-c', 'comfort'],
    ingredients: [
      '1 cup red or brown lentils',
      '1 carrot',
      '1 tomato',
      '1 cup spinach',
      '½ tsp turmeric',
      '1 tsp grated ginger',
      '½ tsp cumin',
      '4 cups water or low-sodium stock',
      '½ lemon'
    ],
    instructions: [
      'Simmer lentils, carrot, tomato, turmeric, ginger and cumin until tender.',
      'Add spinach near the end.',
      'Season to taste.',
      'Finish each serving with lemon.'
    ],
    substitutions: [
      'Use chickpeas or split peas.',
      'Add a spoonful of yogurt if a vegetarian version is preferred.'
    ],
    storageTip: 'Refrigerate for up to 3 days or freeze individual portions.',
    coachTip: 'Soup can be an easy way to increase fluids and vegetables while keeping the meal satisfying.',
    imageUrl: require('../../../assets/images/nutrition/golden_turmeric_lentil_soup.jpg'),
    imageName: 'golden_turmeric_lentil_soup.jpg'
  },

  {
    id: 'n17',
    title: 'Mediterranean Salmon Couscous Plate',
    description:
      'Grilled salmon with whole-grain couscous, tomato, cucumber, herbs and olive oil.',
    mealType: 'dinner',
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    totalTimeMinutes: 25,
    servings: 1,
    recommendedPhases: ['ovulatory', 'follicular', 'menstrual'],
    weightGoalTags: ['maintain', 'gain', 'wellness'],
    estimatedCalories: 500,
    proteinGrams: 36,
    fiberGrams: 7,
    dietaryTags: ['Pescatarian', 'Mediterranean', 'High-Protein'],
    nutritionFocus: ['omega-3', 'protein', 'healthy-fats', 'antioxidants'],
    ingredients: [
      '140 g salmon',
      '½ cup cooked whole-grain couscous',
      '½ cucumber',
      '1 tomato',
      'Fresh parsley',
      '1 tbsp olive oil',
      '½ lemon'
    ],
    instructions: [
      'Cook salmon until opaque and cooked through.',
      'Prepare couscous according to package directions.',
      'Combine cucumber, tomato and parsley.',
      'Serve with olive oil and lemon.'
    ],
    substitutions: [
      'Use quinoa or brown rice.',
      'Use tofu or white beans instead of salmon.'
    ],
    storageTip: 'Refrigerate components separately for up to 2 days.',
    coachTip: 'A simple plate with protein, grain, vegetables and olive oil is enough—you do not need a complicated “cycle recipe.”',
    imageUrl: require('../../../assets/images/nutrition/mediterranean_salmon_couscous_plate.jpg'),
    imageName: 'mediterranean_salmon_couscous_plate.jpg'
  },

  {
    id: 'n18',
    title: 'Apple Cinnamon Peanut Butter Oats',
    description:
      'A warm oat breakfast with apple, cinnamon and peanut butter for steady, satisfying energy.',
    mealType: 'breakfast',
    prepTimeMinutes: 5,
    cookTimeMinutes: 7,
    totalTimeMinutes: 12,
    servings: 1,
    recommendedPhases: ['luteal', 'follicular', 'unknown'],
    weightGoalTags: ['lose', 'maintain', 'gain', 'wellness'],
    estimatedCalories: 370,
    proteinGrams: 14,
    fiberGrams: 9,
    dietaryTags: ['Vegan', 'Quick'],
    nutritionFocus: ['fiber', 'steady-energy', 'healthy-fats'],
    ingredients: [
      '½ cup rolled oats',
      '1 cup fortified soy milk or milk',
      '1 small apple, chopped',
      '1 tbsp peanut butter',
      '1 tsp chia seeds',
      'Cinnamon'
    ],
    instructions: [
      'Simmer oats, milk and chopped apple until creamy.',
      'Stir in cinnamon.',
      'Top with peanut butter and chia seeds.'
    ],
    substitutions: [
      'Use almond or seed butter.',
      'Use pear instead of apple.'
    ],
    storageTip: 'Refrigerate cooked oats for up to 2 days.',
    coachTip: 'Add Greek yogurt or soy yogurt if you want to increase protein.',
    imageUrl: require('../../../assets/images/nutrition/apple_cinnamon_peanut_butter_oats.jpg'),
    imageName: 'apple_cinnamon_peanut_butter_oats.jpg'
  },

  {
    id: 'n19',
    title: 'Hydrating Cucumber Mint Raita',
    description:
      'A cooling yogurt side with cucumber, mint and roasted cumin that works with lunch, dinner or a snack plate.',
    mealType: 'snack',
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    totalTimeMinutes: 5,
    servings: 2,
    recommendedPhases: ['ovulatory', 'follicular', 'luteal', 'menstrual'],
    weightGoalTags: ['lose', 'maintain', 'wellness'],
    estimatedCalories: 110,
    proteinGrams: 7,
    fiberGrams: 1,
    dietaryTags: ['Vegetarian', 'Quick', 'Indian-Inspired'],
    nutritionFocus: ['hydration', 'protein', 'comfort'],
    ingredients: [
      '1 cup plain yogurt',
      '½ cucumber, grated',
      'Fresh mint',
      'Roasted cumin',
      'Pinch of salt',
      'Water as needed'
    ],
    instructions: [
      'Whisk yogurt until smooth.',
      'Stir in cucumber, mint and cumin.',
      'Thin with a little water if desired.',
      'Serve chilled.'
    ],
    substitutions: [
      'Use unsweetened soy yogurt.',
      'Add grated carrot or herbs for variety.'
    ],
    storageTip: 'Refrigerate and consume within 24 hours for best texture.',
    coachTip: 'Think of raita as a side that adds protein and freshness, not as a replacement for a complete meal.',
    imageUrl: require('../../../assets/images/nutrition/hydrating_cucumber_mint_raita.jpg'),
    imageName: 'hydrating_cucumber_mint_raita.jpg'
  },

  {
    id: 'n20',
    title: 'Recovery Paneer Lentil Power Bowl',
    description:
      'A high-protein vegetarian bowl combining paneer, lentils, brown rice and colorful vegetables.',
    mealType: 'dinner',
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    totalTimeMinutes: 25,
    servings: 1,
    recommendedPhases: ['follicular', 'ovulatory', 'luteal', 'unknown'],
    weightGoalTags: ['gain', 'maintain', 'wellness'],
    estimatedCalories: 560,
    proteinGrams: 34,
    fiberGrams: 12,
    dietaryTags: ['Vegetarian', 'High-Protein', 'Indian-Inspired'],
    nutritionFocus: ['protein', 'fiber', 'recovery', 'iron'],
    ingredients: [
      '100 g paneer',
      '½ cup cooked lentils',
      '½ cup cooked brown rice',
      '1 cup mixed vegetables',
      '1 tsp olive oil or ghee',
      'Lemon',
      'Coriander and spices'
    ],
    instructions: [
      'Sear paneer until lightly golden.',
      'Heat lentils and rice.',
      'Cook vegetables until tender-crisp.',
      'Combine everything in a bowl.',
      'Finish with lemon and coriander.'
    ],
    substitutions: [
      'Replace paneer with tofu.',
      'Use quinoa instead of brown rice.'
    ],
    storageTip: 'Refrigerate in an airtight container for up to 3 days.',
    coachTip: 'This is a useful larger meal after strength training when you want protein plus carbohydrates rather than protein alone.',
    imageUrl: require('../../../assets/images/nutrition/recovery_paneer_lentil_power_bowl.jpg'),
    imageName: 'recovery_paneer_lentil_power_bowl.jpg'
  }
];

// ---------------------------------------------------------------------------
// RECIPE / NUTRITION HELPERS
// ---------------------------------------------------------------------------

export const getRecommendedRecipesForPhase = (
  phase: CyclePhase,
  weightGoal?: string
): NutritionRecipe[] => {
  const recommended = NUTRITION_RECIPES.filter(
    recipe => recipe.recommendedPhases.includes(phase)
  );

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

export const getRecipesByMealType = (mealType: MealType): NutritionRecipe[] =>
  NUTRITION_RECIPES.filter(recipe => recipe.mealType === mealType);

export const getRecipesByDiet = (diet: DietProtocol): NutritionRecipe[] => {
  const tagMap: Record<DietProtocol, string[]> = {
    balanced: [],
    'plant-based': ['Vegan', 'Vegetarian'],
    'high-protein': ['High-Protein'],
    'pcos-friendly': ['PCOS-Friendly'],
    mediterranean: ['Mediterranean']
  };

  const tags = tagMap[diet];

  if (diet === 'balanced') {
    return [...NUTRITION_RECIPES];
  }

  return NUTRITION_RECIPES.filter(recipe =>
    tags.some(tag => recipe.dietaryTags.includes(tag))
  );
};

export const getRecipesByFocus = (
  focus: NutritionFocus
): NutritionRecipe[] =>
  NUTRITION_RECIPES.filter(recipe => recipe.nutritionFocus.includes(focus));

export const getRecipeById = (id: string): NutritionRecipe | undefined =>
  NUTRITION_RECIPES.find(recipe => recipe.id === id);

export const getNutritionSummaryForPhase = (phase: CyclePhase) => {
  const guide = NUTRITION_LIBRARY[phase] ?? NUTRITION_LIBRARY.unknown;

  return {
    title: guide.focusTitle,
    description: guide.focusDescription,
    practicalGoal: guide.practicalGoal,
    nutrients: guide.keyNutrients,
    hydration: guide.hydrationGuidance,
    plateGuide: guide.simplePlateGuide
  };
};

/**
 * Image asset manifest.
 *
 * Put these files under:
 *   assets/images/nutrition/
 *
 * Keep the image system consistent with the workout/pranayama/meditation
 * library: premium editorial wellness photography, warm oat/deep plum accents,
 * natural food styling, no text and no logos.
 */
export const NUTRITION_IMAGE_ASSETS = [
  'luteal_salmon_grain_bowl.jpg',
  'follicular_berry_protein_smoothie.jpg',
  'menstrual_iron_rich_lentil_dal.jpg',
  'magnesium_banana_oat_bowl.jpg',
  'mediterranean_chickpea_power_salad.jpg',
  'pcos_friendly_chicken_quinoa_bowl.jpg',
  'salmon_spinach_egg_breakfast.jpg',
  'tofu_tempeh_stir_fry.jpg',
  'luteal_sweet_potato_chaat_bowl.jpg',
  'berry_chia_yogurt_cup.jpg',
  'comforting_vegetable_khichdi.jpg',
  'omega3_sardine_avocado_toast.jpg',
  'high_protein_paneer_veggie_wrap.jpg',
  'green_moong_sprout_bowl.jpg',
  'luteal_cocoa_nut_energy_bites.jpg',
  'golden_turmeric_lentil_soup.jpg',
  'mediterranean_salmon_couscous_plate.jpg',
  'apple_cinnamon_peanut_butter_oats.jpg',
  'hydrating_cucumber_mint_raita.jpg',
  'recovery_paneer_lentil_power_bowl.jpg'
];
