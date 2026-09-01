import React from 'react';
import { Text, TextProps, StyleSheet, useColorScheme } from 'react-native';
import { TYPOGRAPHY, PALETTE } from '../constants/theme';

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall'
  | 'caption'
  | 'dataLabel'
  | 'dataValue';

interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'bodyMedium',
  color,
  align = 'left',
  style,
  children,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const defaultColor = isDark ? PALETTE.cream : PALETTE.charcoal.default;
  const textColor = color || defaultColor;

  return (
    <Text
      style={[
        styles[variant],
        { color: textColor, textAlign: align },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  h1: TYPOGRAPHY.h1,
  h2: TYPOGRAPHY.h2,
  h3: TYPOGRAPHY.h3,
  bodyLarge: TYPOGRAPHY.bodyLarge,
  bodyMedium: TYPOGRAPHY.bodyMedium,
  bodySmall: TYPOGRAPHY.bodySmall,
  caption: TYPOGRAPHY.caption,
  dataLabel: TYPOGRAPHY.dataLabel,
  dataValue: TYPOGRAPHY.dataValue,
});
