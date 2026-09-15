import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { PALETTE } from '../constants/theme';

const SPLASH_ICON = require('../../assets/splash-icon.png');

interface SiniAvatarProps {
  size?: number;
  variant?: 'plum' | 'oat' | 'rose' | 'transparent';
  accentColor?: string;
  style?: ViewStyle;
}

export const SiniAvatar: React.FC<SiniAvatarProps> = ({
  size = 48,
  variant = 'plum',
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
      <Image
        source={SPLASH_ICON}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        resizeMode="cover"
      />
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
