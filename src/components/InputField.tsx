import React, { useState } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Typography } from './Typography';
import { PALETTE, SPACING } from '../constants/theme';

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  style,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isFocused, setIsFocused] = useState(false);

  const activeColor = PALETTE.sage.default;
  const inactiveColor = isDark ? '#2E2B28' : '#ECE9E4';
  const backgroundColor = isDark ? '#1C1A18' : PALETTE.white;

  return (
    <View style={styles.container}>
      <Typography variant="bodySmall" color={PALETTE.charcoal.light} style={styles.label}>
        {label}
      </Typography>
      <TextInput
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={[
          styles.input,
          {
            backgroundColor,
            borderColor: error ? PALETTE.error : isFocused ? activeColor : inactiveColor,
            color: isDark ? PALETTE.cream : PALETTE.charcoal.default,
          },
          style,
        ]}
        placeholderTextColor={isDark ? '#6B6256' : '#A89E90'}
        {...props}
      />
      {error && (
        <Typography variant="caption" color={PALETTE.error} style={styles.errorText}>
          {error}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    width: '100%',
  },
  label: {
    marginBottom: SPACING.xs,
    fontFamily: 'Outfit-Medium',
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    fontSize: 14,
    fontFamily: 'Outfit-Regular',
  },
  errorText: {
    marginTop: SPACING.xs,
  },
});
