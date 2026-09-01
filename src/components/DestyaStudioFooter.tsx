import React from 'react';
import { View, StyleSheet, Pressable, Linking } from 'react-native';
import { Typography } from './Typography';
import { PALETTE } from '../constants/theme';
import { APP_LINKS } from '../constants/links';

interface DestyaStudioFooterProps {
  style?: object;
}

export const DestyaStudioFooter: React.FC<DestyaStudioFooterProps> = ({ style }) => {
  const handleOpenWebsite = () => {
    Linking.openURL(APP_LINKS.website).catch((err) =>
      console.warn('Failed to open Destya Studio website:', err)
    );
  };

  return (
    <View style={[styles.container, style]}>
      <Pressable
        onPress={handleOpenWebsite}
        style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
        hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}
      >
        <Typography variant="caption" color={PALETTE.charcoal.light} style={styles.text}>
          ● Destya Studio
        </Typography>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  pressable: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  pressed: {
    opacity: 0.6,
  },
  text: {
    fontFamily: 'monospace',
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'lowercase',
  },
});
