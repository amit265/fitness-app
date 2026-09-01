import React from 'react';
import {
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Typography } from './Typography';
import { PALETTE, SPACING } from '../constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}) => {
  const getButtonStyles = (): StyleProp<ViewStyle> => {
    const baseStyles: any[] = [styles.button];

    switch (variant) {
      case 'primary':
        baseStyles.push({
          backgroundColor: PALETTE.sage.default,
        });
        break;
      case 'secondary':
        baseStyles.push({
          backgroundColor: PALETTE.rose.default,
        });
        break;
      case 'outline':
        baseStyles.push({
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: PALETTE.sage.default,
        });
        break;
    }

    if (disabled) {
      baseStyles.push({ opacity: 0.5 });
    }

    return baseStyles;
  };

  const getTextColor = (): string => {
    if (disabled) return PALETTE.charcoal.light;
    switch (variant) {
      case 'primary':
        return PALETTE.white;
      case 'secondary':
        return PALETTE.charcoal.default;
      case 'outline':
        return PALETTE.sage.default;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        getButtonStyles(),
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Typography
          variant="dataLabel"
          color={getTextColor()}
          style={styles.text}
        >
          {title}
        </Typography>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  text: {
    fontWeight: '600',
  },
});
