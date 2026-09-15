import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../context/ThemeContext';
import { Typography } from '../../components/Typography';
import { ScreenContainer } from '../../components/ScreenContainer';
import { SPACING } from '../../constants/theme';
import { MovementLibrary } from '../../components/library/MovementLibrary';
import { NutritionLibrary } from '../../components/library/NutritionLibrary';
import { ProgramsLibrary } from '../../components/library/ProgramsLibrary';
import { Activity, Utensils, Calendar } from 'lucide-react-native';
import { t } from '../../i18n';

export default function ExploreScreen() {
  const { colors } = useAppTheme();
  const [activeTab, setActiveTab] = useState<'movement' | 'programs' | 'nutrition'>('movement');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <ScreenContainer contentStyle={{ paddingBottom: 0 }}>
        <View style={styles.header}>
          <Typography variant="h1">{t('tabs.explore', { defaultValue: 'Explore' })}</Typography>
        </View>

        <View style={styles.segmentedControlWrapper}>
          <View style={[styles.segmentedControl, { backgroundColor: colors.surface }]}>
            <Pressable 
              style={[styles.segmentBtn, activeTab === 'movement' && { backgroundColor: colors.primary, shadowColor: colors.shadow, elevation: 2, shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }]}
              onPress={() => setActiveTab('movement')}
            >
              <Activity size={16} color={activeTab === 'movement' ? colors.primaryText : colors.subtext} />
              <Typography variant="bodyMedium" color={activeTab === 'movement' ? colors.primaryText : colors.subtext} style={{ marginLeft: 6, fontWeight: activeTab === 'movement' ? '600' : '400' }}>
                Workouts
              </Typography>
            </Pressable>

            <Pressable 
              style={[styles.segmentBtn, activeTab === 'programs' && { backgroundColor: colors.primary, shadowColor: colors.shadow, elevation: 2, shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }]}
              onPress={() => setActiveTab('programs')}
            >
              <Calendar size={16} color={activeTab === 'programs' ? colors.primaryText : colors.subtext} />
              <Typography variant="bodyMedium" color={activeTab === 'programs' ? colors.primaryText : colors.subtext} style={{ marginLeft: 6, fontWeight: activeTab === 'programs' ? '600' : '400' }}>
                Programs
              </Typography>
            </Pressable>
            
            <Pressable 
              style={[styles.segmentBtn, activeTab === 'nutrition' && { backgroundColor: colors.primary, shadowColor: colors.shadow, elevation: 2, shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }]}
              onPress={() => setActiveTab('nutrition')}
            >
              <Utensils size={16} color={activeTab === 'nutrition' ? colors.primaryText : colors.subtext} />
              <Typography variant="bodyMedium" color={activeTab === 'nutrition' ? colors.primaryText : colors.subtext} style={{ marginLeft: 6, fontWeight: activeTab === 'nutrition' ? '600' : '400' }}>
                Nutrition
              </Typography>
            </Pressable>
          </View>
        </View>

        <View>
          {activeTab === 'movement' && <MovementLibrary />}
          {activeTab === 'programs' && <ProgramsLibrary />}
          {activeTab === 'nutrition' && <NutritionLibrary />}
        </View>
      </ScreenContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  segmentedControlWrapper: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  }
});
