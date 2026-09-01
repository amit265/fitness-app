import React from 'react';
import {
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Typography } from './Typography';
import { SPACING } from '../constants/theme';
import { useAppTheme } from '../context/ThemeContext';

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
  const { colors } = useAppTheme();

  const getButtonStyles = (): StyleProp<ViewStyle> => {
    const baseStyles: any[] = [styles.button];

    switch (variant) {
      case 'primary':
        baseStyles.push({
          backgroundColor: colors.primary,
        });
        break;
      case 'secondary':
        baseStyles.push({
          backgroundColor: colors.surface,
          borderWidth: 1.5,
          borderColor: colors.primary,
        });
        break;
      case 'outline':
        baseStyles.push({
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: colors.primary,
        });
        break;
      case 'positive':
        baseStyles.push({
          backgroundColor: colors.activity,
        });
        break;
      case 'nutrition':
        baseStyles.push({
          backgroundColor: colors.nutrition,
        });
        break;
    }

    if (disabled) {
      baseStyles.push({ opacity: 0.5 });
    }

    return baseStyles;
  };

  const getTextColor = (): string => {
    if (disabled) return colors.textMuted;
    switch (variant) {
      case 'primary':
        return colors.primaryText;
      case 'secondary':
      case 'outline':
        return colors.primary;
      case 'positive':
      case 'nutrition':
        return '#FFFFFF';
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

