import React from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { Typography } from '../Typography';
import { Card } from '../Card';
import { useAppTheme } from '../../context/ThemeContext';
import { SPACING } from '../../constants/theme';
import { Ruler } from 'lucide-react-native';
import { t } from '../../i18n';

interface BodyMeasurementsCardProps {
  latestWaist?: number;
  latestHips?: number;
  latestChest?: number;
  latestThigh?: number;
  onEdit: () => void;
}

export function BodyMeasurementsCard({
  latestWaist,
  latestHips,
  latestChest,
  latestThigh,
  onEdit,
}: BodyMeasurementsCardProps) {
  const { colors } = useAppTheme();

  return (
    <Card style={[styles.card, { padding: 0, overflow: 'hidden' }]}>
      <Image 
        source={require('../../../assets/images/girl_measuring_waist.jpg')} 
        style={{ width: '100%', height: 160 }} 
        resizeMode="cover" 
      />
      <View style={{ padding: SPACING.md }}>
        <View style={styles.cardHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ruler color={colors.period} size={20} />
            <Typography variant="h3" style={{ marginLeft: 8 }}>
              {t('progress.logMeasurement')}
            </Typography>
          </View>
          <Pressable onPress={onEdit}>
            <Typography variant="caption" color={colors.period}>
              + {t('common.edit')}
            </Typography>
          </Pressable>
        </View>

        <View style={styles.measurementsGrid}>
          <View style={[styles.measureCard, { backgroundColor: colors.surface }]}>
            <Typography variant="caption" color={colors.subtext}>{t('progress.waist')}</Typography>
            <Typography variant="h2" style={{ marginTop: 4 }}>
              {latestWaist ? `${latestWaist} cm` : '--'}
            </Typography>
          </View>
          <View style={[styles.measureCard, { backgroundColor: colors.surface }]}>
            <Typography variant="caption" color={colors.subtext}>{t('progress.hips')}</Typography>
            <Typography variant="h2" style={{ marginTop: 4 }}>
              {latestHips ? `${latestHips} cm` : '--'}
            </Typography>
          </View>
          <View style={[styles.measureCard, { backgroundColor: colors.surface }]}>
            <Typography variant="caption" color={colors.subtext}>{t('progress.chest')}</Typography>
            <Typography variant="h2" style={{ marginTop: 4 }}>
              {latestChest ? `${latestChest} cm` : '--'}
            </Typography>
          </View>
          <View style={[styles.measureCard, { backgroundColor: colors.surface }]}>
            <Typography variant="caption" color={colors.subtext}>{t('progress.thigh')}</Typography>
            <Typography variant="h2" style={{ marginTop: 4 }}>
              {latestThigh ? `${latestThigh} cm` : '--'}
            </Typography>
          </View>
        </View>
      </View>
    </Card>
  );
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
  measurementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: SPACING.sm,
  },
  measureCard: {
    width: '47%',
    padding: SPACING.md,
    borderRadius: 16,
    alignItems: 'center',
  },
});
