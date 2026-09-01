import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { TYPOGRAPHY, PALETTE } from '../constants/theme';
import { useAppTheme } from '../context/ThemeContext';

export type TypographyVariant =
  | 'display'
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
  const { colors } = useAppTheme();

  const defaultColor = colors.text;
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
  display: TYPOGRAPHY.display,
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
