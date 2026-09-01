export interface MealRecommendation {
  name: string;
  calories: number;
  protein: string;
  reason: string;
}

export function getRecommendedMealsForToday(
  phase: string,
  cuisine: string = 'indian',
  diet: string = 'anything'
): MealRecommendation[] {
  const isVeg = diet === 'vegetarian' || diet === 'vegan' || diet === 'eggetarian';
  const normCuisine = cuisine.toLowerCase();

  if (normCuisine.includes('indian')) {
    if (phase === 'menstrual') {
      return [
        {
          name: 'Warm Moong Dal & Spinach Soup',
          calories: 290,
          protein: '14g protein',
          reason: 'Rich in iron and zinc to replenish menstrual blood loss & soothe cramps.',
        },
        {
          name: 'Turmeric Milk & Roasted Makhana',
          calories: 180,
          protein: '8g protein',
          reason: 'Anti-inflammatory curcumin to reduce uterine inflammation.',
        },
      ];
    } else if (phase === 'follicular') {
      return [
        {
          name: isVeg ? 'Paneer Tikka & Sprouted Salad' : 'Tandoori Chicken Breast & Salad',
          calories: 380,
          protein: '28g protein',
          reason: 'High protein to support lean muscle gain during rising estrogen.',
        },
        {
          name: 'Poha with Peanuts & Curry Leaves',
          calories: 310,
          protein: '10g protein',
          reason: 'Clean complex carbs for high-intensity workout stamina.',
        },
      ];
    } else if (phase === 'ovulatory') {
      return [
        {
          name: 'Quinoa & Chana Masala Bowl',
          calories: 360,
          protein: '16g protein',
          reason: 'B-vitamins and fiber to metabolize estrogen peak smoothly.',
        },
        {
          name: 'Mixed Berry & Flaxseed Lassi',
          calories: 210,
          protein: '9g protein',
          reason: 'Antioxidants and omega-3s for peak cellular vitality.',
        },
      ];
    } else {
      // Luteal
      return [
        {
          name: 'Sweet Potato Chaat with Pumpkin Seeds',
          calories: 270,
          protein: '7g protein',
          reason: 'Magnesium and B6 to prevent pre-menstrual water retention & cravings.',
        },
        {
          name: isVeg ? 'Rajma Masala with Brown Rice' : 'Egg Curry with Brown Rice',
          calories: 420,
          protein: '20g protein',
          reason: 'Sustained energy to match higher luteal metabolic rate.',
        },
      ];
    }
  }

  // General / Western / Global default
  if (phase === 'menstrual') {
    return [
      {
        name: 'Warm Lentil & Veggie Stew',
        calories: 320,
        protein: '18g protein',
        reason: 'Iron-rich bioavailable nutrients to support blood loss recovery.',
      },
      {
        name: 'Dark Chocolate & Almond Smoothie',
        calories: 240,
        protein: '10g protein',
        reason: 'Magnesium boost to relieve uterine muscle tension.',
      },
    ];
  } else if (phase === 'follicular') {
    return [
      {
        name: isVeg ? 'Tofu & Broccoli Stir Fry' : 'Grilled Salmon & Quinoa',
        calories: 410,
        protein: '32g protein',
        reason: 'Optimal protein synthesis during high-estrogen recovery window.',
      },
      {
        name: 'Overnight Oats with Berries & Chia',
        calories: 290,
        protein: '12g protein',
        reason: 'Glycogen loading for strength training stamina.',
      },
    ];
  } else {
    return [
      {
        name: 'Avocado & Chickpea Grain Bowl',
        calories: 390,
        protein: '15g protein',
        reason: 'Healthy fats to support progesterone production.',
      },
      {
        name: 'Greek Yogurt with Walnuts & Honey',
        calories: 230,
        protein: '18g protein',
        reason: 'Satiating protein to curb luteal appetite spikes.',
      },
    ];
  }
}
