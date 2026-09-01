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

export interface StatusBarTokens {
  background: string;
  content: 'dark' | 'light';
}

export interface ThemeTokens {
  name: string;
  bg: string;
  card: string;
  cardElevated: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  accent: string;
  border: string;
  borderLight: string;
  shadow: string;

  // Status Bar explicit styling
  statusBar: StatusBarTokens;

  // Cycle phase & domain accents
  period: string;
  follicular: string;
  ovulation: string;
  luteal: string;
  cycle: string; // active phase accent
  activity: string;
  nutrition: string;
  recovery: string;

  // System feedback
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  error: string;
  errorBg: string;

  isDark: boolean;
}

export interface CyclePhaseTokens {
  menstrual: string;
  menstrualBg: string;
  menstrualText: string;

  follicular: string;
  follicularBg: string;
  follicularText: string;

  ovulatory: string;
  ovulatoryBg: string;
  ovulatoryText: string;

  luteal: string;
  lutealBg: string;
  lutealText: string;

  confirmedPeriod: string;
  confirmedPeriodText: string;
}

/** Dedicated cycle-phase color system strictly for cycle data visualization */
export const CYCLE_PHASE_COLORS: { light: CyclePhaseTokens; dark: CyclePhaseTokens } = {
  light: {
    menstrual: '#D9939E',
    menstrualBg: '#FBF2F4',
    menstrualText: '#8B424E',

    follicular: '#8FA89A',
    follicularBg: '#F1F6F3',
    follicularText: '#3B5748',

    ovulatory: '#C6A15B',
    ovulatoryBg: '#FAF5EA',
    ovulatoryText: '#73561A',

    luteal: '#6B5267',
    lutealBg: '#F5EEF6',
    lutealText: '#3D263A',

    confirmedPeriod: '#D9939E',
    confirmedPeriodText: '#FFFFFF',
  },
  dark: {
    menstrual: '#E89FA9',
    menstrualBg: '#3B2329',
    menstrualText: '#F4D4D9',

    follicular: '#A2BCAC',
    follicularBg: '#1F3127',
    follicularText: '#BDD2C6',

    ovulatory: '#D9B46E',
    ovulatoryBg: '#3D311A',
    ovulatoryText: '#E2C78E',

    luteal: '#9B8398',
    lutealBg: '#2E1E2D',
    lutealText: '#E4DAE3',

    confirmedPeriod: '#E89FA9',
    confirmedPeriodText: '#FFFFFF',
  },
};

/** SINI CLASSIC: The original application theme (Warm Oat & Deep Plum) */
export const THEME_CLASSIC: ThemeTokens = {
  name: 'Sini Classic',
  bg: PALETTE.oat.bg,
  card: PALETTE.white,
  cardElevated: PALETTE.cream,
  surface: PALETTE.cream,
  textPrimary: PALETTE.charcoal.default,
  textSecondary: PALETTE.charcoal.light,
  textMuted: PALETTE.lavender,
  primary: PALETTE.plum.default,
  primaryText: PALETTE.oat.default,
  accent: PALETTE.plum.default,
  border: PALETTE.sand,
  borderLight: '#F0E8E1',
  shadow: PALETTE.charcoal.default,

  statusBar: {
    background: PALETTE.oat.bg,
    content: 'dark',
  },

  period: '#D9939E',
  follicular: '#8FA89A',
  ovulation: '#C6A15B',
  luteal: '#6B5267',
  cycle: PALETTE.plum.default,
  activity: PALETTE.sage.default,
  nutrition: PALETTE.terracotta.default,
  recovery: PALETTE.lavender,

  success: PALETTE.success,
  successBg: '#D1FAE5',
  warning: PALETTE.warning,
  warningBg: '#FEF3C7',
  error: PALETTE.error,
  errorBg: '#FFEBEB',

  isDark: false,
};

/** SINI DARK MODE: Deep Plum Night */
export const THEME_DARK: ThemeTokens = {
  name: 'Dark Mode',
  bg: PALETTE.darkBg,
  card: PALETTE.darkCard,
  cardElevated: '#3A2E3A',
  surface: '#2B232B',
  textPrimary: PALETTE.darkText,
  textSecondary: PALETTE.darkSubtext,
  textMuted: '#9B8B9B',
  primary: PALETTE.plum.light,
  primaryText: PALETTE.darkText,
  accent: PALETTE.plum.light,
  border: PALETTE.darkBorder,
  borderLight: '#4F414F',
  shadow: '#000000',

  statusBar: {
    background: PALETTE.darkBg,
    content: 'light',
  },

  period: '#E89FA9',
  follicular: '#A2BCAC',
  ovulation: '#D9B46E',
  luteal: '#9B8398',
  cycle: PALETTE.plum.light,
  activity: '#A2BCAC',
  nutrition: '#D98A75',
  recovery: '#B8ACC0',

  success: '#81B28F',
  successBg: '#1C2920',
  warning: '#D9AA67',
  warningBg: '#2B2318',
  error: '#C9737E',
  errorBg: '#2E1A1A',

  isDark: true,
};

/** MENSTRUAL PHASE: Rose Dawn (Quiet · Soft · Restorative) */
export const THEME_ROSE_DAWN: ThemeTokens = {
  name: 'Rose Dawn',
  bg: PALETTE.rose.bg, // #FBF2F4
  card: PALETTE.white,
  cardElevated: '#FFF8F9',
  surface: '#FAF0F2',
  textPrimary: '#3B2329',
  textSecondary: '#7C4F57',
  textMuted: '#A68288',
  primary: PALETTE.rose.dark, // #B86F7B
  primaryText: PALETTE.white,
  accent: PALETTE.rose.default, // #D9939E
  border: PALETTE.rose.light, // #F4D4D9
  borderLight: '#F9E5E8',
  shadow: '#3B2329',

  statusBar: {
    background: PALETTE.rose.bg,
    content: 'dark',
  },

  period: PALETTE.rose.default,
  follicular: PALETTE.sage.default,
  ovulation: PALETTE.gold.default,
  luteal: PALETTE.plum.light,
  cycle: PALETTE.rose.default,
  activity: PALETTE.sage.default,
  nutrition: PALETTE.terracotta.default,
  recovery: PALETTE.lavender,

  success: PALETTE.success,
  successBg: '#D1FAE5',
  warning: PALETTE.warning,
  warningBg: '#FEF3C7',
  error: PALETTE.error,
  errorBg: '#FFEBEB',

  isDark: false,
};

/** FOLLICULAR PHASE: Sage Bloom (Fresh · Light · Renewing) */
export const THEME_SAGE_BLOOM: ThemeTokens = {
  name: 'Sage Bloom',
  bg: PALETTE.sage.bg, // #F1F6F3
  card: PALETTE.white,
  cardElevated: '#F7FAF8',
  surface: '#EBF2EE',
  textPrimary: '#1F3127',
  textSecondary: '#4E695A',
  textMuted: '#849E90',
  primary: PALETTE.sage.dark, // #5F7C6B
  primaryText: PALETTE.white,
  accent: PALETTE.sage.default, // #8FA89A
  border: PALETTE.sage.light, // #BDD2C6
  borderLight: '#D8E5DC',
  shadow: '#1F3127',

  statusBar: {
    background: PALETTE.sage.bg,
    content: 'dark',
  },

  period: PALETTE.rose.default,
  follicular: PALETTE.sage.default,
  ovulation: PALETTE.gold.default,
  luteal: PALETTE.plum.light,
  cycle: PALETTE.sage.default,
  activity: PALETTE.sage.default,
  nutrition: PALETTE.terracotta.default,
  recovery: PALETTE.lavender,

  success: PALETTE.success,
  successBg: '#D1FAE5',
  warning: PALETTE.warning,
  warningBg: '#FEF3C7',
  error: PALETTE.error,
  errorBg: '#FFEBEB',

  isDark: false,
};

/** OVULATORY PHASE: Golden Glow (Bright · Energetic · Vibrant) */
export const THEME_GOLDEN_GLOW: ThemeTokens = {
  name: 'Golden Glow',
  bg: PALETTE.gold.bg, // #FAF5EA
  card: PALETTE.white,
  cardElevated: '#FFFDF7',
  surface: '#F7EFE0',
  textPrimary: '#3D311A',
  textSecondary: '#7A6232',
  textMuted: '#A69268',
  primary: PALETTE.gold.dark, // #937331
  primaryText: PALETTE.white,
  accent: PALETTE.gold.default, // #C6A15B
  border: PALETTE.gold.light, // #E2C78E
  borderLight: '#EFE0C2',
  shadow: '#3D311A',

  statusBar: {
    background: PALETTE.gold.bg,
    content: 'dark',
  },

  period: PALETTE.rose.default,
  follicular: PALETTE.sage.default,
  ovulation: PALETTE.gold.default,
  luteal: PALETTE.plum.light,
  cycle: PALETTE.gold.default,
  activity: PALETTE.sage.default,
  nutrition: PALETTE.terracotta.default,
  recovery: PALETTE.lavender,

  success: PALETTE.success,
  successBg: '#D1FAE5',
  warning: PALETTE.warning,
  warningBg: '#FEF3C7',
  error: PALETTE.error,
  errorBg: '#FFEBEB',

  isDark: false,
};

/** LUTEAL PHASE: Plum Dusk (Grounded · Warm · Reflective) */
export const THEME_PLUM_DUSK: ThemeTokens = {
  name: 'Plum Dusk',
  bg: PALETTE.plum.bg, // #F5EEF6
  card: PALETTE.white,
  cardElevated: '#FAF5FC',
  surface: '#EFE6F0',
  textPrimary: '#261924',
  textSecondary: '#5A4257',
  textMuted: '#8E738B',
  primary: PALETTE.plum.default, // #3B2938
  primaryText: PALETTE.oat.default,
  accent: PALETTE.plum.light, // #765C73
  border: '#D2C4D1',
  borderLight: '#E4DAE3',
  shadow: '#261924',

  statusBar: {
    background: PALETTE.plum.bg,
    content: 'dark',
  },

  period: PALETTE.rose.default,
  follicular: PALETTE.sage.default,
  ovulation: PALETTE.gold.default,
  luteal: PALETTE.plum.light,
  cycle: PALETTE.plum.light,
  activity: PALETTE.sage.default,
  nutrition: PALETTE.terracotta.default,
  recovery: PALETTE.lavender,

  success: PALETTE.success,
  successBg: '#D1FAE5',
  warning: PALETTE.warning,
  warningBg: '#FEF3C7',
  error: PALETTE.error,
  errorBg: '#FFEBEB',

  isDark: false,
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


