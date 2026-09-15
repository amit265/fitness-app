import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { Typography } from '../Typography';
import { SPACING, PALETTE } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';
import { getTodayStr } from '../../utils/date';
import { getCycleState } from '../../domain/cycle/cycleEngine';
import { 
  NUTRITION_LIBRARY, 
  DietProtocol, 
  getNutritionGuideForPhase,
  NutritionRecipe,
  getRecommendedRecipesForPhase
} from '../../domain/nutrition/nutritionLibrary';
import { useRouter } from 'expo-router';
import { t } from '../../i18n';
import { ArrowLeft, CheckCircle2, Heart, Leaf, Fish, Activity, Salad } from 'lucide-react-native';

const DIET_PROTOCOLS: { id: DietProtocol; label: string; icon: any }[] = [
  { id: 'balanced', label: 'Balanced', icon: Heart },
  { id: 'plant-based', label: 'Plant-Based', icon: Leaf },
  { id: 'mediterranean', label: 'Mediterranean', icon: Fish },
  { id: 'pcos-friendly', label: 'PCOS Friendly', icon: Activity },
  { id: 'high-protein', label: 'High Protein', icon: Salad },
];

export function NutritionLibrary() {
  const { colors } = useAppTheme();

  const userProfile = useAppStore((state) => state.userProfile);
  const cyclePreferences = useAppStore((state) => state.cyclePreferences);
  const periods = useAppStore((state) => state.periods);
  
  const todayStr = getTodayStr();
  const cycleState = getCycleState(periods, cyclePreferences, todayStr);
  const currentGuide = getNutritionGuideForPhase(cycleState.phase);
  const recommendedRecipes = getRecommendedRecipesForPhase(cycleState.phase, userProfile?.weightGoal);
  
  const router = useRouter();

  // Default to balanced, or try to map user preference if we had one
  const [selectedDiet, setSelectedDiet] = useState<DietProtocol>('balanced');

  const renderDietSelector = () => (
    <View style={styles.dietSelectorWrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dietScroll}>
        {DIET_PROTOCOLS.map((diet) => {
          const isSelected = selectedDiet === diet.id;
          const Icon = diet.icon;
          return (
            <Pressable
              key={diet.id}
              style={[
                styles.dietPill,
                { 
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border
                }
              ]}
              onPress={() => setSelectedDiet(diet.id)}
            >
              <Icon size={16} color={isSelected ? colors.primaryText : colors.subtext} />
              <Typography 
                variant="bodyMedium" 
                color={isSelected ? colors.primaryText : colors.textPrimary}
                style={{ marginLeft: 6, fontWeight: isSelected ? '600' : '400' }}
              >
                {diet.label}
              </Typography>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingBottom: 100, paddingTop: SPACING.md }]}>
        {/* Dynamic Hero: Best for Today */}
        <View style={styles.sectionContainer}>
          <Typography variant="h2" style={styles.sectionTitle}>Best for Today</Typography>
          <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.phaseBadge, { backgroundColor: colors.surface }]}>
              <Typography variant="caption" color={colors.nutrition}>
                {cycleState.phase.toUpperCase()} PHASE
              </Typography>
            </View>
            
            <Typography variant="h1" style={styles.heroTitle}>{currentGuide.focusTitle}</Typography>
            <Typography variant="bodyLarge" color={colors.subtext} style={styles.heroDesc}>
              {currentGuide.focusDescription}
            </Typography>

            <View style={styles.divider} />

            <View style={styles.nutrientsRow}>
              <Typography variant="bodyMedium" style={{ fontWeight: '600', marginBottom: 8 }}>
                Key Nutrients:
              </Typography>
              <View style={styles.tagsContainer}>
                {currentGuide.keyNutrients.map((n, i) => (
                  <View key={i} style={[styles.tagPill, { backgroundColor: colors.surface }]}>
                    <Typography variant="caption" color={colors.nutrition}>{n}</Typography>
                  </View>
                ))}
              </View>
            </View>

          </View>
        </View>

        {/* Dietary Protocol Lenses */}
        <View style={styles.sectionContainer}>
          <Typography variant="h3" style={[styles.sectionTitle, { marginBottom: SPACING.sm }]}>
            Adapt for your diet:
          </Typography>
          {renderDietSelector()}
          
          <View style={[styles.adaptationCard, { backgroundColor: colors.surface }]}>
            <Typography variant="bodyMedium" style={{ lineHeight: 22 }}>
              <Typography variant="bodyMedium" style={{ fontWeight: '700' }}>
                {DIET_PROTOCOLS.find(d => d.id === selectedDiet)?.label} Protocol: 
              </Typography>
              {" "}{currentGuide.dietaryAdaptations[selectedDiet]}
            </Typography>
          </View>
        </View>

        {/* Recommended Recipes */}
        {recommendedRecipes.length > 0 && (
          <View style={styles.sectionContainer}>
            <Typography variant="h2" style={styles.sectionTitle}>Recommended Recipes</Typography>
            {recommendedRecipes.map(recipe => (
              <Pressable
                key={recipe.id}
                style={({ pressed }) => [
                  styles.recipeCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  pressed && { opacity: 0.8 }
                ]}
                onPress={() => router.push(`/nutritionDetailModal?id=${recipe.id}`)}
              >
                <View style={styles.recipeHeader}>
                  <View style={[styles.dietBadge, { backgroundColor: colors.surface }]}>
                    <Typography variant="caption" color={colors.nutrition}>{recipe.dietaryTags[0]?.toUpperCase()}</Typography>
                  </View>
                  <Typography variant="caption" color={colors.subtext}>
                    {recipe.prepTimeMinutes}m • {recipe.estimatedCalories} kcal
                  </Typography>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1, paddingRight: SPACING.md }}>
                    <Typography variant="h3" style={{ marginBottom: SPACING.xs }}>{recipe.title}</Typography>
                    <Typography variant="bodyMedium" color={colors.subtext} style={{ lineHeight: 20 }}>
                      {recipe.description}
                    </Typography>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  sectionContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
  },
  heroCard: {
    padding: SPACING.lg,
    borderRadius: 20,
    borderWidth: 1,
  },
  phaseBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  heroTitle: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  heroDesc: {
    lineHeight: 24,
    marginBottom: SPACING.md,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: SPACING.md,
  },
  nutrientsRow: {
    marginTop: SPACING.xs,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  dietSelectorWrapper: {
    marginBottom: SPACING.sm,
    marginHorizontal: -SPACING.md, // Bleed scroll
  },
  dietScroll: {
    paddingHorizontal: SPACING.md,
    gap: 8,
  },
  dietPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1,
  },
  adaptationCard: {
    padding: SPACING.md,
    borderRadius: 12,
  },
  recipeCard: {
    padding: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  dietBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
