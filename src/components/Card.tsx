import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { PALETTE, SHADOWS, SPACING } from '../constants/theme';
import { useAppTheme } from '../context/ThemeContext';

interface CardProps extends ViewProps {
  padding?: number;
  noShadow?: boolean;
  borderColor?: string;
}

export const Card: React.FC<CardProps> = ({
  padding = SPACING.md,
  noShadow = false,
  borderColor,
  style,
  children,
  ...props
}) => {
  const { colors, isDark } = useAppTheme();

  const backgroundColor = colors.card;
  const borderStyle = {
    borderWidth: 1,
    borderColor: borderColor || colors.border,
  };

  return (
    <View
      style={[
        styles.card,
        { padding, backgroundColor },
        borderStyle,
        !noShadow && !isDark && SHADOWS.card,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
  },
});
