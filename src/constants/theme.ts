/**
 * Sini AI — Brand & Visual Design System Tokens
 * Core brand promise: "Fitness that understands your cycle."
 * Emotional direction: Warm · Grounded · Feminine · Natural · Modern
 */

export const PALETTE = {
  // Deep Plum - Primary brand color (#3B2938)
  plum: {
    light: '#765C73',
    default: '#3B2938',
    dark: '#261924',
    bg: '#F5EEF6',
  },
  // Warm Oat - Primary light background (#F5EEE6)
  oat: {
    light: '#FCF9F5',
    default: '#F5EEE6',
    dark: '#E6D9CF',
    bg: '#F5EEE6',
  },
  // Soft Rose - Cycle/menstrual accent (#D9939E)
  rose: {
    light: '#F4D4D9',
    default: '#D9939E',
    dark: '#B86F7B',
    bg: '#FBF2F4',
  },
  // Sage - Fitness/recovery/activity accent (#8FA89A)
  sage: {
    light: '#BDD2C6',
    default: '#8FA89A',
    dark: '#5F7C6B',
    bg: '#F1F6F3',
  },
  // Terracotta - Energy/nutrition/calories accent (#C97861)
  terracotta: {
    light: '#E5A997',
    default: '#C97861',
    dark: '#9E4D37',
    bg: '#FAF0ED',
  },
  // Warm Gold - Premium accent (#C6A15B)
  gold: {
    light: '#E2C78E',
    default: '#C6A15B',
    dark: '#937331',
    bg: '#FAF5EA',
  },
  // Slate Charcoal - Primary text (#29252A)
  charcoal: {
    light: '#6E6770',
    default: '#29252A',
    dark: '#1A171B',
  },
  // Supporting Neutrals & Semantics
  cream: '#FCF9F5',
  sand: '#E6D9CF',
  lavender: '#A79AAA',
  white: '#FFFFFF',

  // System Feedback
  error: '#B9626D',
  warning: '#C29350',
  success: '#6F947A',

  // Dark Mode System Surfaces
  darkBg: '#211C21',
  darkCard: '#302730',
  darkText: '#F7F0E9',
  darkSubtext: '#CFC2C7',
  darkBorder: '#423642',
};

export const SEMANTICS = {
  nutrition: PALETTE.terracotta.default,
  activity: PALETTE.sage.default,
  period: PALETTE.rose.default,
  follicular: PALETTE.sage.default,
  ovulation: PALETTE.gold.default,
  luteal: PALETTE.plum.default,
  recovery: PALETTE.lavender,
  primaryButton: PALETTE.plum.default,
  primaryButtonText: PALETTE.oat.default,
};

export const TYPOGRAPHY = {
  display: {
    fontSize: 44,
    fontFamily: 'Outfit-Bold',
    lineHeight: 52,
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'] as any,
  },
  h1: {
    fontSize: 28,
    fontFamily: 'Outfit-Bold',
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 22,
    fontFamily: 'Outfit-SemiBold',
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    fontFamily: 'Outfit-Medium',
    lineHeight: 24,
  },
  bodyLarge: {
    fontSize: 16,
    fontFamily: 'Outfit-Regular',
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 14,
    fontFamily: 'Outfit-Regular',
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    fontFamily: 'Outfit-Regular',
    lineHeight: 16,
  },
  caption: {
    fontSize: 11,
    fontFamily: 'Outfit-Medium',
    lineHeight: 14,
    letterSpacing: 0.2,
  },
  dataLabel: {
    fontSize: 14,
    fontFamily: 'Outfit-Medium',
    letterSpacing: 0.5,
  },
  dataValue: {
    fontSize: 32,
    fontFamily: 'Outfit-Bold',
    lineHeight: 38,
    fontVariant: ['tabular-nums'] as any,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const SHADOWS = {
  soft: {
    shadowColor: '#29252A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  card: {
    shadowColor: '#29252A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
};
