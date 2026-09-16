import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Typography } from '../Typography';
import { Card } from '../Card';
import { useAppTheme } from '../../context/ThemeContext';
import { SPACING } from '../../constants/theme';
import { TrendingUp } from 'lucide-react-native';
import { LineChart } from '../LineChart';
import { t } from '../../i18n';
import { getMeasurementTrend } from '../../utils/trends';
import { BodyMeasurement } from '../../types';

export type TimeWindow = 7 | 30 | 90;
export type MetricType = 'weight' | 'waist' | 'hips' | 'chest' | 'thigh';

interface MeasurementTrendsCardProps {
  measurements: BodyMeasurement[];
  bmiCategoryTranslated: string;
  timeWindow: TimeWindow;
  setTimeWindow: (val: TimeWindow) => void;
  selectedMetric: MetricType;
  setSelectedMetric: (val: MetricType) => void;
}

export function MeasurementTrendsCard({
  measurements,
  bmiCategoryTranslated,
  timeWindow,
  setTimeWindow,
  selectedMetric,
  setSelectedMetric,
}: MeasurementTrendsCardProps) {
  const { colors } = useAppTheme();

  // Get trend data for chart
  const trendData = useMemo(() => getMeasurementTrend(measurements, timeWindow, selectedMetric), [measurements, timeWindow, selectedMetric]);

  // Calculate stats for the selected metric
  const latestValue = measurements.find(m => m[selectedMetric] !== undefined)?.[selectedMetric] ?? null;
  const sortedByAge = [...measurements].sort((a, b) => a.date.localeCompare(b.date));
  const baselineValue = sortedByAge.find(m => m[selectedMetric] !== undefined)?.[selectedMetric] ?? null;

  const metricChange = latestValue !== null && baselineValue !== null
    ? parseFloat((latestValue - baselineValue).toFixed(1))
    : null;

  const getMetricUnit = () => {
    return selectedMetric === 'weight' ? 'kg' : 'cm';
  };

  const getMetricLabel = () => {
    switch(selectedMetric) {
      case 'weight': return t('progress.currentWeight');
      case 'waist': return t('progress.waist');
      case 'hips': return t('progress.hips');
      case 'chest': return t('progress.chest');
      case 'thigh': return t('progress.thigh');
      default: return selectedMetric;
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TrendingUp color={colors.primary} size={20} />
          <Typography variant="h3" style={{ marginLeft: 8 }}>
            {t('progress.weightTrend')}
          </Typography>
        </View>
      </View>

      {/* Time Window Chips */}
      <View style={styles.timeWindowRow}>
        {[7, 30, 90].map((days) => (
          <Pressable
            key={days}
            style={[
              styles.windowChip,
              timeWindow === days ? { backgroundColor: colors.primary } : { backgroundColor: colors.surface },
            ]}
            onPress={() => setTimeWindow(days as TimeWindow)}
          >
            <Typography variant="caption" color={timeWindow === days ? colors.primaryText : colors.textPrimary}>
              {days === 7 ? t('progress.range7d') : days === 30 ? t('progress.range30d') : t('progress.rangeAll')}
            </Typography>
          </Pressable>
        ))}
      </View>

      {/* Summary Stat Grid */}
      <View style={styles.statGrid}>
        <View style={styles.statBox}>
          <Typography variant="caption" color={colors.subtext} numberOfLines={1}>{getMetricLabel()}</Typography>
          <Typography variant="h2" >
            {latestValue ? `${latestValue} ${getMetricUnit()}` : '--'}
          </Typography>
        </View>
        <View style={styles.statBox}>
          <Typography variant="caption" color={colors.subtext} numberOfLines={1}>Change</Typography>
          <Typography variant="h2" color={metricChange && metricChange <= 0 ? colors.activity : colors.nutrition} >
            {metricChange !== null ? `${metricChange > 0 ? '+' : ''}${metricChange} ${getMetricUnit()}` : '--'}
          </Typography>
        </View>
        <View style={styles.statBox}>
          <Typography variant="caption" color={colors.subtext}>{t('profile.bmiLabel')}</Typography>
          <Typography variant="h3" color={colors.primary} >
            {bmiCategoryTranslated}
          </Typography>
        </View>
      </View>

      {/* Metric Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: SPACING.md }}>
        {(['weight', 'waist', 'hips', 'chest', 'thigh'] as MetricType[]).map((metric) => (
          <Pressable
            key={metric}
            style={[
              styles.windowChip,
              { marginRight: 8 },
              selectedMetric === metric ? { backgroundColor: colors.primary } : { backgroundColor: colors.surface },
            ]}
            onPress={() => setSelectedMetric(metric)}
          >
            <Typography variant="caption" color={selectedMetric === metric ? colors.primaryText : colors.textPrimary} style={{ textTransform: 'capitalize' }}>
              {metric}
            </Typography>
          </Pressable>
        ))}
      </ScrollView>

      {/* Line Chart */}
      <View style={{ marginTop: SPACING.sm }}>
        <LineChart data={trendData.values} labels={trendData.labels} height={160} />
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
  timeWindowRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.md,
  },
  windowChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
});
