import React from 'react';
import { View, ViewProps, StyleSheet, useColorScheme } from 'react-native';
import { PALETTE, SHADOWS, SPACING } from '../constants/theme';

interface CardProps extends ViewProps {
  padding?: number;
  noShadow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  padding = SPACING.md,
  noShadow = false,
  style,
  children,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = isDark ? '#1C1A18' : PALETTE.white;
  const borderStyles = isDark
    ? { borderWidth: 1, borderColor: '#2E2B28' }
    : {};

  return (
    <View
      style={[
        styles.card,
        { padding, backgroundColor },
        !noShadow && !isDark && SHADOWS.card,
        borderStyles,
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
  },
});
