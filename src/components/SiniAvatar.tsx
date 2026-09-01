import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { PALETTE } from '../constants/theme';

interface SiniAvatarProps {
  size?: number;
  variant?: 'plum' | 'oat' | 'rose' | 'transparent';
  accentColor?: string;
  style?: ViewStyle;
}

export const SiniAvatar: React.FC<SiniAvatarProps> = ({
  size = 48,
  variant = 'plum',
  accentColor,
  style,
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'plum':
        return PALETTE.plum.default;
      case 'oat':
        return PALETTE.oat.default;
      case 'rose':
        return PALETTE.rose.default;
      case 'transparent':
        return 'transparent';
      default:
        return PALETTE.plum.default;
    }
  };

  const getPrimaryArcColor = () => {
    if (variant === 'plum') return PALETTE.oat.default;
    return PALETTE.plum.default;
  };

  const getSecondaryArcColor = () => {
    if (variant === 'plum') return PALETTE.rose.default;
    return PALETTE.sage.default;
  };

  const dotColor = accentColor || PALETTE.gold.default;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: getBackgroundColor(),
        },
        style,
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="siniGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={getPrimaryArcColor()} stopOpacity="0.95" />
            <Stop offset="100%" stopColor={getSecondaryArcColor()} stopOpacity="0.8" />
          </LinearGradient>
          <LinearGradient id="siniGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={getSecondaryArcColor()} stopOpacity="0.9" />
            <Stop offset="100%" stopColor={dotColor} stopOpacity="0.9" />
          </LinearGradient>
        </Defs>

        {/* Outer subtle orbital guide */}
        <Circle
          cx="50"
          cy="50"
          r="38"
          stroke={getPrimaryArcColor()}
          strokeWidth="1.5"
          strokeOpacity="0.15"
          fill="none"
        />

        {/* Top Arc of Abstract "S" / Orbit */}
        <Path
          d="M 28,34 C 36,18 64,18 72,32 C 78,42 70,54 50,54"
          stroke="url(#siniGradient1)"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />

        {/* Bottom Arc of Abstract "S" / Orbit */}
        <Path
          d="M 50,46 C 30,46 22,58 28,68 C 36,82 64,82 72,66"
          stroke="url(#siniGradient2)"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />

        {/* Rhythm Accent Point (Warm Gold/Rose) */}
        <Circle cx="68" cy="30" r="5" fill={dotColor} />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
