export interface CuratedFood {
  name: string;
  calories: number; // base per unit
  protein: number;  // grams
  carbs: number;
  fat: number;
  servingUnit: string; // e.g. "100g", "unit", "scoop"
}

export const CURATED_FOODS: Record<string, CuratedFood> = {
  // Global Basics
  egg: { name: 'Whole Egg', calories: 70, protein: 6, carbs: 0.6, fat: 5, servingUnit: 'unit' },
  eggs: { name: 'Whole Egg', calories: 70, protein: 6, carbs: 0.6, fat: 5, servingUnit: 'unit' },
  chicken: { name: 'Chicken Breast (Cooked)', calories: 165, protein: 31, carbs: 0, fat: 3.6, servingUnit: '100g' },
  rice: { name: 'White Rice (Cooked)', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, servingUnit: '100g' },
  banana: { name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.3, servingUnit: 'unit' },
  oatmeal: { name: 'Oatmeal (Cooked)', calories: 120, protein: 4, carbs: 22, fat: 2.2, servingUnit: '100g' },
  oats: { name: 'Oatmeal (Cooked)', calories: 120, protein: 4, carbs: 22, fat: 2.2, servingUnit: '100g' },
  avocado: { name: 'Avocado', calories: 240, protein: 3, carbs: 12, fat: 22, servingUnit: 'unit' },
  protein: { name: 'Whey Protein Powder', calories: 120, protein: 24, carbs: 3, fat: 1.5, servingUnit: 'scoop' },
  salmon: { name: 'Salmon Fillet (Cooked)', calories: 208, protein: 22, carbs: 0, fat: 13, servingUnit: '100g' },
  yogurt: { name: 'Greek Yogurt (Plain)', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, servingUnit: '100g' },
  greek: { name: 'Greek Yogurt (Plain)', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, servingUnit: '100g' },
  almonds: { name: 'Almonds', calories: 160, protein: 6, carbs: 6, fat: 14, servingUnit: '30g' },
  apple: { name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, servingUnit: 'unit' },
  bread: { name: 'White Bread', calories: 79, protein: 2.7, carbs: 15, fat: 1, servingUnit: 'slice' },
  milk: { name: 'Whole Milk', calories: 149, protein: 8, carbs: 12, fat: 8, servingUnit: '240ml' },
  pizza: { name: 'Pizza Slice (Cheese)', calories: 285, protein: 12, carbs: 36, fat: 10, servingUnit: 'slice' },
  burger: { name: 'Hamburger', calories: 250, protein: 12, carbs: 31, fat: 9, servingUnit: 'unit' },
  
  // Indonesian / Southeast Asian
  'nasi putih': { name: 'Nasi Putih', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, servingUnit: '100g' },
  'nasi goreng': { name: 'Nasi Goreng', calories: 250, protein: 5, carbs: 35, fat: 10, servingUnit: '100g' },
  'mie goreng': { name: 'Mie Goreng', calories: 380, protein: 8, carbs: 54, fat: 14, servingUnit: 'plate' },
  'mie instan': { name: 'Mie Instan (Indomie)', calories: 380, protein: 8, carbs: 54, fat: 14, servingUnit: 'pack' },
  rendang: { name: 'Beef Rendang', calories: 195, protein: 15, carbs: 5, fat: 13, servingUnit: '100g' },
  'ayam goreng': { name: 'Ayam Goreng', calories: 260, protein: 18, carbs: 5, fat: 18, servingUnit: '100g' },
  'ayam bakar': { name: 'Ayam Bakar', calories: 200, protein: 22, carbs: 5, fat: 10, servingUnit: '100g' },
  tempe: { name: 'Tempe Goreng', calories: 193, protein: 19, carbs: 9, fat: 11, servingUnit: '100g' },
  tahu: { name: 'Tahu Goreng', calories: 144, protein: 10, carbs: 3, fat: 10, servingUnit: '100g' },
  'gado-gado': { name: 'Gado-Gado', calories: 318, protein: 12, carbs: 28, fat: 18, servingUnit: 'plate' },
  soto: { name: 'Soto Ayam', calories: 312, protein: 15, carbs: 25, fat: 15, servingUnit: 'bowl' },
  bakso: { name: 'Bakso (Meatball Soup)', calories: 300, protein: 15, carbs: 20, fat: 18, servingUnit: 'bowl' },
  martabak: { name: 'Martabak Manis', calories: 350, protein: 5, carbs: 50, fat: 15, servingUnit: 'piece' },
  'pisang goreng': { name: 'Pisang Goreng', calories: 200, protein: 2, carbs: 35, fat: 8, servingUnit: 'piece' },
  kerupuk: { name: 'Kerupuk', calories: 65, protein: 1, carbs: 10, fat: 2, servingUnit: 'piece' },
  sambal: { name: 'Sambal', calories: 20, protein: 0, carbs: 4, fat: 0, servingUnit: 'tbsp' },
  'es teh manis': { name: 'Es Teh Manis', calories: 90, protein: 0, carbs: 22, fat: 0, servingUnit: 'glass' },
  'kopi susu': { name: 'Kopi Susu', calories: 120, protein: 3, carbs: 18, fat: 4, servingUnit: 'glass' },
  'roti canai': { name: 'Roti Canai', calories: 300, protein: 6, carbs: 40, fat: 12, servingUnit: 'piece' },
  dal: { name: 'Dal (Lentils)', calories: 116, protein: 9, carbs: 20, fat: 0.4, servingUnit: '100g' },
};

/**
 * Searches the curated food list for matching keywords.
 * Returns parsed macro estimates based on quantity multiplier.
 */
export function lookupFood(
  input: string
): { name: string; calories: number; protein: number; carbs: number; fat: number } | null {
  const cleanInput = input.toLowerCase().trim();

  // Extract count/amount if present (e.g. "2 eggs" or "300g chicken")
  const countRegex = /^(\d+(?:\.\d+)?)\s*(?:x\s*)?([a-zA-Z\s]+)/;
  const match = cleanInput.match(countRegex);

  let multiplier = 1;
  let foodKey = cleanInput;

  if (match) {
    multiplier = parseFloat(match[1]);
    foodKey = match[2].trim();
  }

  // Find matches in key tokens
  const matchedKey = Object.keys(CURATED_FOODS).find((key) =>
    foodKey.includes(key) || key.includes(foodKey)
  );

  if (!matchedKey) return null;

  const food = CURATED_FOODS[matchedKey];
  
  // If unit is grams (e.g. 100g) and multiplier is large, treat it as weight in grams
  if (food.servingUnit === '100g' && multiplier >= 10) {
    multiplier = multiplier / 100; // e.g. 200g chicken -> multiplier 2.0
  }

  return {
    name: `${food.name} (x${multiplier})`,
    calories: Math.round(food.calories * multiplier),
    protein: parseFloat((food.protein * multiplier).toFixed(1)),
    carbs: parseFloat((food.carbs * multiplier).toFixed(1)),
    fat: parseFloat((food.fat * multiplier).toFixed(1)),
  };
}
