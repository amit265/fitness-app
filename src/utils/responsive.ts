import { Dimensions, PixelRatio } from 'react-native';
import { useWindowDimensions } from 'react-native';

// ---------------------------------------------------------------------------
// Static values (for StyleSheet.create — cannot use hooks there)
// ---------------------------------------------------------------------------
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/** True when the device screen is 768 dp wide or more (iPad / large tablet). */
export const isTablet = SCREEN_WIDTH >= 768;

/**
 * Maximum width for the main content column.
 * - Phone  → full width (no constraint needed, ScreenContainer handles padding)
 * - Tablet → 720 dp, centred
 * - Large tablet/iPad → 800 dp, centred
 */
export const CONTENT_MAX_WIDTH = SCREEN_WIDTH >= 1024 ? 800 : SCREEN_WIDTH >= 768 ? 720 : SCREEN_WIDTH;

/**
 * Horizontal page padding — larger on tablets so content doesn't hug the edge.
 */
export const PAGE_HORIZONTAL_PADDING = isTablet ? 32 : 16;

/**
 * Pick a value based on whether we are on a tablet.
 * @param phone  Value used on phones (< 768 dp)
 * @param tablet Value used on tablets (>= 768 dp). Falls back to `phone` if omitted.
 */
export function rs<T>(phone: T, tablet?: T): T {
  if (tablet === undefined) return phone;
  return isTablet ? tablet : phone;
}

/**
 * Scale a size relative to a 390-dp phone baseline.
 * Clamps between phone and tablet extremes to avoid runaway growth.
 */
export function scale(size: number): number {
  const ratio = Math.min(SCREEN_WIDTH / 390, isTablet ? 1.3 : 1.1);
  return Math.round(PixelRatio.roundToNearestPixel(size * ratio));
}

// ---------------------------------------------------------------------------
// Hook — re-renders on rotation / window resize
// ---------------------------------------------------------------------------
export interface ResponsiveContext {
  width: number;
  height: number;
  isTablet: boolean;
  isLandscape: boolean;
  rs: <T>(phone: T, tablet?: T) => T;
  maxContentWidth: number;
  pageHPad: number;
}

export function useResponsive(): ResponsiveContext {
  const { width, height } = useWindowDimensions();
  const tablet = width >= 768;
  const maxContentWidth = width >= 1024 ? 800 : width >= 768 ? 720 : width;
  const pageHPad = tablet ? 32 : 16;

  return {
    width,
    height,
    isTablet: tablet,
    isLandscape: width > height,
    rs: <T>(phone: T, tabletVal?: T) => (tabletVal !== undefined && tablet ? tabletVal : phone),
    maxContentWidth,
    pageHPad,
  };
}
