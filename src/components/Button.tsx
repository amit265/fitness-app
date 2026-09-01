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

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'positive' | 'nutrition';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  style,
}) => {
  const getButtonStyles = (): StyleProp<ViewStyle> => {
    const baseStyles: any[] = [styles.button];

    switch (variant) {
      case 'primary':
        baseStyles.push({
          backgroundColor: PALETTE.plum.default,
        });
        break;
      case 'secondary':
        baseStyles.push({
          backgroundColor: PALETTE.oat.default,
          borderWidth: 1.5,
          borderColor: PALETTE.plum.default,
        });
        break;
      case 'outline':
        baseStyles.push({
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: PALETTE.plum.default,
        });
        break;
      case 'positive':
        baseStyles.push({
          backgroundColor: PALETTE.sage.default,
        });
        break;
      case 'nutrition':
        baseStyles.push({
          backgroundColor: PALETTE.terracotta.default,
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
        return PALETTE.oat.default;
      case 'secondary':
      case 'outline':
        return PALETTE.plum.default;
      case 'positive':
      case 'nutrition':
        return PALETTE.white;
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
        <>
          {icon}
          <Typography
            variant="dataLabel"
            color={getTextColor()}
            style={[styles.text, icon ? { marginLeft: 8 } : null]}
          >
            {title}
          </Typography>
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingVertical: SPACING.md - 2,
    paddingHorizontal: SPACING.lg,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  text: {
    fontWeight: '600',
  },
});
