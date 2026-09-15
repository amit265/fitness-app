import React from 'react';
import { View, StyleSheet, Image, ScrollView, Pressable, Platform, useWindowDimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Typography } from '../components/Typography';
import { useAppTheme } from '../context/ThemeContext';
import { SPACING } from '../constants/theme';
import { getRecipeById } from '../domain/nutrition/nutritionLibrary';
import { X, Clock, Flame, Utensils, Tag } from 'lucide-react-native';
import { Button } from '../components/Button';
import Markdown from 'react-native-markdown-display';
import { useAppStore } from '../store/useAppStore';

export default function NutritionDetailModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const addMeal = useAppStore(state => state.addMeal);

  const { width } = useWindowDimensions();

  const markdownStyles = {
    body: {
      color: colors.text,
      fontSize: Math.min(15, width * 0.038),
      lineHeight: Math.min(24, width * 0.06),
    },
    heading1: {
      color: colors.textPrimary,
      fontSize: Math.min(20, width * 0.05),
      marginTop: 20,
      marginBottom: 8,
      fontWeight: '700' as const,
    },
    heading2: {
      color: colors.textPrimary,
      fontSize: Math.min(17, width * 0.043),
      marginTop: 18,
      marginBottom: 6,
      fontWeight: '700' as const,
    },
    list_item: {
      marginBottom: 6,
      color: colors.text,
    },
    bullet_list: {
      marginBottom: 8,
    },
    ordered_list: {
      marginBottom: 8,
    },
    strong: {
      color: colors.textPrimary,
      fontWeight: '700' as const,
    },
    blockquote: {
      backgroundColor: colors.surface,
      borderLeftColor: colors.primary,
      borderLeftWidth: 3,
      paddingLeft: 12,
      paddingVertical: 6,
      borderRadius: 4,
      marginVertical: 8,
    },
  };

  const recipe = id ? getRecipeById(id as string) : undefined;

  if (!recipe) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.closeBtn, { backgroundColor: colors.surface }]}>
            <X size={24} color={colors.text} />
          </Pressable>
        </View>
        <View style={styles.center}>
          <Typography variant="bodyLarge">Recipe not found.</Typography>
        </View>
      </SafeAreaView>
    );
  }

  // Generate markdown from recipe data if tutorialMarkdown isn't provided explicitly
  const generatedMarkdown = recipe.tutorialMarkdown || `
## Ingredients
${recipe.ingredients.map(i => `* ${i}`).join('\n')}

## Instructions
${recipe.instructions.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}

${recipe.substitutions && recipe.substitutions.length > 0 ? `## Substitutions\n${recipe.substitutions.map(s => `* ${s}`).join('\n')}` : ''}

${recipe.storageTip ? `## Storage\n> ${recipe.storageTip}` : ''}

${recipe.coachTip ? `## Coach's Tip\n> ${recipe.coachTip}` : ''}
  `.trim();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {recipe.imageUrl ? (
          <Image source={recipe.imageUrl} style={styles.heroImage} resizeMode="cover" />
        ) : (
          <View style={[styles.heroImage, { backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }]}>
            <Utensils size={48} color={colors.subtext} />
          </View>
        )}

        <Pressable onPress={() => router.back()} style={[styles.floatingCloseBtn, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <X size={20} color="#FFF" />
        </Pressable>

        <View style={styles.content}>
          <View style={styles.tagsRow}>
            {recipe.dietaryTags.map(tag => (
              <View key={tag} style={[styles.tag, { backgroundColor: colors.surface }]}>
                <Typography variant="caption" color={colors.primary}>{tag.toUpperCase()}</Typography>
              </View>
            ))}
          </View>

          <Typography variant="h1" style={styles.title}>{recipe.title}</Typography>
          <Typography variant="bodyLarge" color={colors.subtext} style={styles.description}>
            {recipe.description}
          </Typography>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Clock size={20} color={colors.primary} />
              <Typography variant="bodyMedium" style={styles.statText}>{recipe.prepTimeMinutes} min</Typography>
            </View>
            <View style={styles.statItem}>
              <Flame size={20} color={colors.activity} />
              <Typography variant="bodyMedium" style={styles.statText}>{recipe.estimatedCalories} kcal</Typography>
            </View>
            <View style={styles.statItem}>
              <Utensils size={20} color={colors.period} />
              <Typography variant="bodyMedium" style={styles.statText}>{recipe.proteinGrams}g Protein</Typography>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {generatedMarkdown ? (
            <View style={styles.markdownContainer}>
              <Markdown style={markdownStyles}>
                {generatedMarkdown}
              </Markdown>
            </View>
          ) : (
            <Typography variant="bodyMedium" color={colors.subtext}>
              Detailed recipe coming soon.
            </Typography>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.bg, borderTopColor: colors.border }]}>
        <Button 
          title="Log Meal"
          onPress={() => {
            useAppStore.getState().showAlert(
              "Log This Meal",
              "Did you really eat this?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Yes, Log It",
                  onPress: () => {
                    addMeal({
                      name: recipe.title,
                      calories: recipe.estimatedCalories,
                      protein: recipe.proteinGrams,
                      carbs: 0,
                      fat: 0,
                      source: 'database'
                    });
                    router.back();
                  }
                }
              ]
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: SPACING.md, alignItems: 'flex-end' },
  closeBtn: { padding: 8, borderRadius: 20 },
  heroImage: { width: '100%', height: 300 },
  floatingCloseBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  content: { padding: SPACING.lg },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING.sm },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  title: { marginBottom: SPACING.sm },
  description: { marginBottom: SPACING.lg, lineHeight: 24 },
  statsRow: { flexDirection: 'row', gap: SPACING.lg, marginBottom: SPACING.lg },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontWeight: '600' },
  divider: { height: 1, width: '100%', marginBottom: SPACING.lg },
  markdownContainer: { marginTop: SPACING.sm },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : SPACING.lg,
    borderTopWidth: 1,
  }
});
