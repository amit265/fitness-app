/**
 * Calculates BMI based on weight (kg) and height (cm)
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  if (heightCm <= 0 || weightKg <= 0) return 0;
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export type BMICategory = 'Underweight' | 'Normal weight' | 'Overweight' | 'Obesity' | 'Unknown';

/**
 * Returns the standard adult BMI category name
 */
export function getBMICategory(bmi: number): BMICategory {
  if (bmi <= 0) return 'Unknown';
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25.0) return 'Normal weight';
  if (bmi < 30.0) return 'Overweight';
  return 'Obesity';
}

/**
 * Returns a brief neutral scientific description of BMI
 */
export function getBMIDisclaimer(): string {
  return 'BMI is a height-to-weight screening measure. It does not account for muscle mass, body-fat distribution, or individual health factors.';
}
