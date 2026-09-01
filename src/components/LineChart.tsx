import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import { Typography } from './Typography';
import { SPACING } from '../constants/theme';
import { useAppTheme } from '../context/ThemeContext';

interface LineChartProps {
  data: number[];
  labels: string[];
  cyclePhases?: string[]; // optional corresponding cycle phases to color dots
  height?: number;
  width?: number;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  labels,
  cyclePhases,
  height = 180,
  width,
}) => {
  const { colors, isDark } = useAppTheme();

  const containerWidth = width || Dimensions.get('window').width - 64; // Fallback to card width

  if (data.length <= 1) {
    return (
      <View style={[styles.emptyContainer, { height }]}>
        <Typography variant="bodySmall" color={colors.textSecondary} align="center">
          Not enough log points yet. Keep logging daily to view your trend!
        </Typography>
      </View>
    );
  }

  // Calculate limits
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal;
  
  // Add some padding to top/bottom of y-axis so line doesn't hit borders
  const paddingOffset = range === 0 ? 1 : range * 0.15;
  const yMin = minVal - paddingOffset;
  const yMax = maxVal + paddingOffset;
  const yRange = yMax - yMin;

  // Chart padding offsets
  const paddingLeft = 32;
  const paddingRight = 12;
  const paddingTop = 20;
  const paddingBottom = 24;

  const chartWidth = containerWidth - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Map data to SVG coordinates (x, y)
  const points = data.map((val, index) => {
    const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((val - yMin) / yRange) * chartHeight;
    return { x, y, val };
  });

  // 1. Build line path
  let linePath = '';
  let fillPath = '';

  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    fillPath = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      linePath += ` L ${points[i].x} ${points[i].y}`;
      fillPath += ` L ${points[i].x} ${points[i].y}`;
    }

    // Close the fill path to bottom baseline
    const baselineY = paddingTop + chartHeight;
    fillPath += ` L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`;
  }

  // Color helper for cycle phases
  const getPhaseColor = (phase?: string): string => {
    if (!phase) return colors.activity;
    switch (phase.toLowerCase()) {
      case 'menstrual':
        return colors.period;
      case 'luteal':
        return colors.luteal;
      case 'follicular':
        return colors.follicular;
      case 'ovulatory':
        return colors.ovulation;
      default:
        return colors.activity;
    }
  };

  return (
    <View style={styles.container}>
      <Svg width={containerWidth} height={height}>
        {/* Y-Axis Grid Lines & Labels */}
        {[0, 0.5, 1].map((ratio, i) => {
          const y = paddingTop + ratio * chartHeight;
          const val = yMax - ratio * yRange;
          return (
            <React.Fragment key={i}>
              <Line
                x1={paddingLeft}
                y1={y}
                x2={containerWidth - paddingRight}
                y2={y}
                stroke={colors.border}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <SvgText
                x={paddingLeft - 8}
                y={y + 4}
                fill={colors.textSecondary}
                fontSize="10"
                fontFamily="Outfit-Regular"
                textAnchor="end"
              >
                {val.toFixed(1)}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Fill Under Line */}
        {fillPath !== '' && (
          <Path
            d={fillPath}
            fill={colors.activity}
            opacity={isDark ? 0.12 : 0.08}
          />
        )}

        {/* The Trend Line */}
        {linePath !== '' && (
          <Path
            d={linePath}
            stroke={colors.activity}
            strokeWidth={3}
            fill="transparent"
          />
        )}

        {/* Points & Labels */}
        {points.map((p, index) => {
          const phase = cyclePhases?.[index];
          const dotColor = getPhaseColor(phase);
          const isSelected = index === points.length - 1; // highlight latest point
          
          return (
            <React.Fragment key={index}>
              <Circle
                cx={p.x}
                cy={p.y}
                r={isSelected ? 6 : 4}
                fill={dotColor}
                stroke={colors.card}
                strokeWidth={2}
              />
              {/* X-Axis labels (only show first, middle, last to avoid overlap) */}
              {(index === 0 || index === points.length - 1 || (points.length > 5 && index === Math.floor(points.length / 2))) && (
                <SvgText
                  x={p.x}
                  y={height - 4}
                  fill={colors.textSecondary}
                  fontSize="9"
                  fontFamily="Outfit-Regular"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {labels[index]}
                </SvgText>
              )}
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
});

