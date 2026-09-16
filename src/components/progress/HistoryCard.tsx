import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Typography } from '../Typography';
import { Card } from '../Card';
import { useAppTheme } from '../../context/ThemeContext';
import { SPACING } from '../../constants/theme';
import { ChevronRight } from 'lucide-react-native';

interface HistoryCardProps {
  icon: React.ReactNode;
  title: string;
  subtext: string;
  onPress?: () => void;
  chevronColor?: string;
}

export function HistoryCard({ icon, title, subtext, onPress, chevronColor }: HistoryCardProps) {
  const { colors } = useAppTheme();

  const content = (
    <Card style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 }}>
          {icon}
          <Typography variant="h3" style={{ marginLeft: 8, flexShrink: 1 }} numberOfLines={1}>
            {title}
          </Typography>
        </View>
        {onPress && (
          <View style={{ padding: 6, backgroundColor: colors.surface, borderRadius: 8 }}>
            <ChevronRight color={chevronColor || colors.primary} size={20} />
          </View>
        )}
      </View>
      <Typography variant="bodyMedium" color={colors.subtext} style={{ marginTop: 4 }}>
        {subtext}
      </Typography>
    </Card>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    padding: SPACING.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
});
