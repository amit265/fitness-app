import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  ScrollViewProps,
  StyleProp,
} from 'react-native';
import { useResponsive } from '../utils/responsive';

interface ScreenContainerProps extends ScrollViewProps {
  /** Render as a plain View instead of ScrollView (use for screens with their own FlatList/ScrollView). */
  noScroll?: boolean;
  /** Extra style applied to the inner centred column. */
  contentStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/**
 * Universal screen wrapper that:
 * - Centers content to `maxContentWidth` on tablets / iPads
 * - Applies consistent horizontal padding
 * - Handles `contentInsetAdjustmentBehavior` for iOS
 */
export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  noScroll = false,
  contentStyle,
  children,
  style,
  contentContainerStyle,
  ...rest
}) => {
  const { maxContentWidth, pageHPad, isTablet } = useResponsive();

  const innerStyle: ViewStyle = {
    width: '100%',
    maxWidth: maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: pageHPad,
  };

  if (noScroll) {
    return (
      <View style={[styles.fill, style as ViewStyle]}>
        <View style={[innerStyle, contentStyle as ViewStyle]}>{children}</View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.fill, style]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: isTablet ? 40 : 60 },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentInsetAdjustmentBehavior="automatic"
      {...rest}
    >
      <View style={[innerStyle, contentStyle as ViewStyle]}>{children}</View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
});
