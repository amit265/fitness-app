import { CyclePhase } from '../../types';

export type DietProtocol = 'balanced' | 'plant-based' | 'high-protein' | 'pcos-friendly' | 'mediterranean';

export interface PhaseNutritionGuide {
  phase: CyclePhase;
  focusTitle: string;
  focusDescription: string;
  keyNutrients: string[];
  foodsToPrioritize: string[];
  foodsToLimit: string[];
  dietaryAdaptations: Record<DietProtocol, string>;
}

export const NUTRITION_LIBRARY: Record<CyclePhase, PhaseNutritionGuide> = {
  menstrual: {
    phase: 'menstrual',
    focusTitle: 'Replenish & Comfort',
    focusDescription: 'Focus on warm, grounding foods. Replenish iron stores and prioritize anti-inflammatory ingredients to soothe cramps.',
    keyNutrients: ['Iron', 'Zinc', 'Vitamin C', 'Omega-3s'],
    foodsToPrioritize: ['Warm broths', 'Dark leafy greens', 'Root vegetables', 'Berries', 'Turmeric'],
    foodsToLimit: ['Cold/raw foods', 'Excess caffeine', 'Refined sugars', 'Alcohol'],
    dietaryAdaptations: {
      'balanced': 'Ensure lean red meats or dark poultry for heme iron.',
      'plant-based': 'Pair iron-rich plants (spinach, lentils) with Vitamin C (citrus, bell peppers) for absorption.',
      'high-protein': 'Opt for warm, easily digestible proteins like collagen peptides or bone broth.',
      'pcos-friendly': 'Keep carbs complex and paired with fats to avoid blood sugar spikes that worsen cramps.',
      'mediterranean': 'Lean heavily into fatty fish (salmon, sardines) for Omega-3 cramp relief.',
    }
  },
  follicular: {
    phase: 'follicular',
    focusTitle: 'Vibrant & Fresh',
    focusDescription: 'Your body is preparing to ovulate. Focus on fresh, vibrant foods and fermented ingredients to help metabolize rising estrogen.',
    keyNutrients: ['Probiotics', 'Lean Proteins', 'Phytoestrogens'],
    foodsToPrioritize: ['Kimchi/Kombucha', 'Fresh salads', 'Sprouted seeds', 'Avocado', 'Flaxseed'],
    foodsToLimit: ['Heavy, fried foods', 'Excess dairy (if sensitive)'],
    dietaryAdaptations: {
      'balanced': 'Incorporate a wide variety of colorful vegetables and lean proteins like chicken breast or tofu.',
      'plant-based': 'Focus on fermented soy (tempeh, miso) and a diverse range of plant fibers.',
      'high-protein': 'Increase lean protein intake to support the muscle growth stimulated by rising estrogen.',
      'pcos-friendly': 'Use flaxseeds daily to naturally balance hormones and improve insulin sensitivity.',
      'mediterranean': 'Use plenty of extra virgin olive oil and fresh herbs on vibrant salads.',
    }
  },
  ovulatory: {
    phase: 'ovulatory',
    focusTitle: 'Flush & Fuel',
    focusDescription: 'Energy is peaking! Focus on fiber-rich vegetables to help your liver flush out excess estrogen.',
    keyNutrients: ['Fiber', 'Antioxidants', 'B Vitamins'],
    foodsToPrioritize: ['Cruciferous veg (broccoli, cauliflower)', 'Quinoa', 'Berries', 'Light fish'],
    foodsToLimit: ['Excess sodium', 'Processed carbs'],
    dietaryAdaptations: {
      'balanced': 'Swap heavy starches for high-fiber cruciferous vegetables to support estrogen clearance.',
      'plant-based': 'Rely on quinoa and legumes for sustained energy during this high-activity phase.',
      'high-protein': 'Keep protein sources light and easily digestible (white fish, egg whites, plant proteins).',
      'pcos-friendly': 'Cruciferous vegetables are vital here to prevent estrogen dominance, a common PCOS issue.',
      'mediterranean': 'Enjoy abundant fresh salads, grilled fish, and antioxidant-rich olives/tomatoes.',
    }
  },
  luteal: {
    phase: 'luteal',
    focusTitle: 'Stabilize & Ground',
    focusDescription: 'Metabolism increases slightly, but so do cravings. Focus on complex carbs and magnesium to stabilize mood and blood sugar.',
    keyNutrients: ['Magnesium', 'Vitamin B6', 'Complex Carbs', 'Healthy Fats'],
    foodsToPrioritize: ['Sweet potatoes', 'Dark chocolate (70%+)', 'Pumpkin seeds', 'Salmon', 'Bananas'],
    foodsToLimit: ['Refined sugar', 'High sodium (worsens bloating)', 'Caffeine (worsens PMS anxiety)'],
    dietaryAdaptations: {
      'balanced': 'Increase complex carbohydrate portions slightly to feed the higher metabolic rate and curb cravings.',
      'plant-based': 'Use pumpkin seeds, walnuts, and dark chocolate to hit magnesium and fat requirements.',
      'high-protein': 'Pair proteins with healthy fats to keep you satiated and prevent sugar cravings.',
      'pcos-friendly': 'Cravings are highest here. Stick to complex, low-GI carbs (sweet potatoes) to prevent insulin spikes.',
      'mediterranean': 'Incorporate whole grains like farro or brown rice alongside healthy fats like tahini and walnuts.',
    }
  },
  unknown: {
    phase: 'unknown',
    focusTitle: 'Balanced Baseline',
    focusDescription: 'We need more data to determine your cycle phase. Focus on a general balanced diet.',
    keyNutrients: ['Water', 'Fiber', 'Protein'],
    foodsToPrioritize: ['Whole grains', 'Lean proteins', 'Vegetables'],
    foodsToLimit: ['Processed foods', 'Refined sugars'],
    dietaryAdaptations: {
      'balanced': 'Maintain a balanced macro split.',
      'plant-based': 'Ensure adequate protein and B12.',
      'high-protein': 'Focus on lean sources.',
      'pcos-friendly': 'Prioritize fiber and healthy fats.',
      'mediterranean': 'Follow general guidelines.',
    }
  }
};

export const getNutritionGuideForPhase = (phase: CyclePhase): PhaseNutritionGuide => {
  return NUTRITION_LIBRARY[phase];
};

export type WeightGoal = 'lose' | 'maintain' | 'gain' | 'wellness';

export interface NutritionRecipe {
  id: string;
  title: string;
  description: string;
  prepTimeMinutes: number;
  recommendedPhases: CyclePhase[];
  weightGoalTags: WeightGoal[];
  estimatedCalories: number;
  proteinGrams: number;
  dietaryTags: string[];
  imageUrl?: any;
  tutorialMarkdown?: string;
}

export const NUTRITION_RECIPES: NutritionRecipe[] = [
  {
    id: 'n1',
    title: 'Luteal Salmon Grain Bowl',
    description: 'Rich in Omega-3s and complex carbs to stabilize blood sugar and curb PMS cravings.',
    prepTimeMinutes: 20,
    recommendedPhases: ['luteal'],
    weightGoalTags: ['lose', 'maintain', 'gain', 'wellness'],
    estimatedCalories: 450,
    proteinGrams: 35,
    dietaryTags: ['Pescatarian', 'High-Protein', 'Gluten-Free'],
    imageUrl: require('../../../assets/images/nutrition_placeholder.jpg'),
    tutorialMarkdown: `## Overview
This nourishing bowl is perfectly designed for the Luteal phase. The healthy fats from the salmon help reduce inflammation, while the complex carbohydrates from the quinoa keep your blood sugar stable, preventing energy crashes and sugar cravings.

## Ingredients
* 1 wild-caught salmon fillet (5 oz)
* 1/2 cup cooked quinoa
* 1/2 avocado, sliced
* 1 cup roasted sweet potatoes and broccoli
* 1 tbsp pumpkin seeds (great for magnesium!)
* Olive oil, lemon, salt, and pepper

## Instructions
1. **Prep the Base**: Cook the quinoa according to package instructions. 
2. **Roast Veggies**: Toss sweet potatoes and broccoli in olive oil, salt, and pepper. Roast at 400°F (200°C) for 20 minutes.
3. **Sear the Salmon**: Heat a skillet over medium-high heat. Season salmon and sear skin-side down for 4 minutes, then flip for 2-3 minutes until cooked through.
4. **Assemble**: Layer quinoa, topped with roasted veggies, salmon, and sliced avocado. Sprinkle pumpkin seeds on top and drizzle with lemon juice.

## Coach's Tip
If your cravings are very strong today, don't be afraid to slightly increase the quinoa or sweet potato portion. Your metabolism is slightly elevated during the luteal phase!`,
  },
  {
    id: 'n2',
    title: 'Follicular Power Smoothie',
    description: 'Light, vibrant, and packed with phytoestrogens to support rising energy.',
    prepTimeMinutes: 5,
    recommendedPhases: ['follicular'],
    weightGoalTags: ['lose', 'maintain', 'wellness'],
    estimatedCalories: 280,
    proteinGrams: 20,
    dietaryTags: ['Vegan', 'Quick'],
    tutorialMarkdown: `## Overview\nA fresh smoothie... (Add your content here)`,
  }
];

export const getRecommendedRecipesForPhase = (phase: CyclePhase, weightGoal?: string): NutritionRecipe[] => {
  let recommended = NUTRITION_RECIPES.filter(r => r.recommendedPhases.includes(phase));
  
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

export const getRecipeById = (id: string): NutritionRecipe | undefined => {
  return NUTRITION_RECIPES.find(r => r.id === id);
};
