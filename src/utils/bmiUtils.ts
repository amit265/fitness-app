/**
 * Calculates BMI based on weight (kg) and height (cm)
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  if (heightCm <= 0 || weightKg <= 0) return 0;
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export type BMICategory = 'underweight' | 'normal' | 'overweight' | 'obese' | 'unknown';

/**
 * Returns an i18n-safe key matching bmi.category.* in the translation files
 */
export function getBMICategory(bmi: number): BMICategory {
  if (bmi <= 0) return 'unknown';
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25.0) return 'normal';
  if (bmi < 30.0) return 'overweight';
  return 'obese';
}

/**
 * Returns a brief neutral scientific description of BMI
 */
export function getBMIDisclaimer(): string {
  return 'BMI is a height-to-weight screening measure. It does not account for muscle mass, body-fat distribution, or individual health factors.';
}
