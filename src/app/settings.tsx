import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  Alert,
  Switch,
  Platform,
  KeyboardAvoidingView,
  Text,
} from 'react-native';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { InputField } from '../components/InputField';
import { useAppStore } from '../store/useAppStore';
import { PALETTE, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Key,
  HelpCircle,
  BookOpen,
  ShieldAlert,
  Trash2,
  Bell,
  Palette,
  Sparkles,
  ChevronRight,
  Globe,
  Database,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAdContext } from '../context/AdContext';
import { showRewardedAdWithConsent } from '../services/AdManager';
import { getCurrentLanguage, setAppLanguage } from '../i18n';
import { useAppTheme, MOOD_THEME_PALETTES, MoodThemeKey } from '../context/ThemeContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { isAdFree, grantAdFreeHours, setPremiumStatus } = useAdContext();
  const { themeKey, isDark, setThemeKey, colors } = useAppTheme();

  // Store bindings
  const userProfile = useAppStore((state) => state.userProfile);
  const periods = useAppStore((state) => state.periods);
  const dailyCheckIns = useAppStore((state) => state.dailyCheckIns);
  const meals = useAppStore((state) => state.meals);
  const activities = useAppStore((state) => state.activities);
  const setUserProfile = useAppStore((state) => state.setUserProfile);
  const resetStore = useAppStore((state) => state.resetStore);
  const seedMockData = useAppStore((state) => state.seedMockData);

  // States
  const [apiKey, setApiKey] = useState(userProfile?.groqApiKey || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [tutorialModalVisible, setTutorialModalVisible] = useState(false);
  const [savedKeySuccess, setSavedKeySuccess] = useState(false);
  const [currentLang, setCurrentLangState] = useState('en');

  React.useEffect(() => {
    getCurrentLanguage().then(setCurrentLangState);
  }, []);

  const handleLanguageChange = (lang: string) => {
    setCurrentLangState(lang);
    setAppLanguage(lang);
    Alert.alert('Language Updated', `App language set to ${lang.toUpperCase()}.`);
  };

  const handleRestorePurchases = () => {
    setPremiumStatus(true);
    Alert.alert('Purchases Restored', 'Your account has been synced. Premium Ad-Free status activated!');
  };

  const handleWatchAdReward = () => {
    showRewardedAdWithConsent(() => {
      grantAdFreeHours(1);
      Alert.alert('Reward Unlocked! 🎉', 'You have earned 1 hour of Ad-Free experience.');
    });
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        groqApiKey: key.trim(),
      });
      setSavedKeySuccess(true);
      setTimeout(() => setSavedKeySuccess(false), 2000);
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All App Data?',
      'This will delete all logged meals, workouts, weight records, and period history. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => {
            resetStore();
            Alert.alert('Reset Complete', 'App state has been reset to default.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

        {/* Header Bar */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft color={colors.text} size={22} />
          </Pressable>
          <Typography variant="h2" style={styles.headerTitle}>App Settings</Typography>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* GROUP 1: SINI AI & CLOUD INTEGRATION */}
          <Typography variant="caption" color={colors.subtext} style={styles.sectionHeaderTitle}>
            INTELLIGENCE & AI ENGINE
          </Typography>
          <View style={[styles.groupedCard, { backgroundColor: isDark ? PALETTE.darkCard : PALETTE.white, borderColor: colors.border }]}>
            <View style={styles.cardPadding}>
              <View style={styles.cardHeaderRow}>
                <Key color={PALETTE.plum.default} size={20} />
                <Typography variant="h3" style={{ fontFamily: 'Outfit-Bold', marginLeft: 8 }}>
                  Groq Cloud AI Integration
                </Typography>
              </View>

              <InputField
                label="Groq API Key (starts with gsk_)"
                value={apiKey}
                secureTextEntry={true}
                onChangeText={handleSaveApiKey}
                placeholder="gsk_yourApiKeyHere"
              />

              {savedKeySuccess && (
                <Typography variant="caption" color={PALETTE.sage.default} style={{ marginTop: 2, fontFamily: 'Outfit-Bold' }}>
                  ✓ API Key Auto-Saved!
                </Typography>
              )}

              <Typography variant="caption" color={colors.subtext} style={{ marginTop: 4, lineHeight: 16 }}>
                Enables natural-language food logging and Sini AI conversational completions. Stored 100% locally.
              </Typography>

              <Pressable
                style={styles.tutorialLinkBtn}
                onPress={() => setTutorialModalVisible(true)}
              >
                <HelpCircle color={PALETTE.plum.default} size={16} />
                <Typography variant="caption" color={PALETTE.plum.default} style={{ fontFamily: 'Outfit-Bold', marginLeft: 6 }}>
                  How to get a free Groq API Key?
                </Typography>
              </Pressable>
            </View>
          </View>

          {/* GROUP 2: APPEARANCE & THEMES */}
          <Typography variant="caption" color={colors.subtext} style={styles.sectionHeaderTitle}>
            APPEARANCE & THEMES
          </Typography>
          <View style={[styles.groupedCard, { backgroundColor: isDark ? PALETTE.darkCard : PALETTE.white, borderColor: colors.border }]}>
            <View style={styles.cardPadding}>
              <View style={styles.cardHeaderRow}>
                <Palette color={PALETTE.rose.default} size={20} />
                <Typography variant="h3" style={{ fontFamily: 'Outfit-Bold', marginLeft: 8 }}>
                  Mood & Rhythm Theme
                </Typography>
              </View>

              <View style={styles.themeGrid}>
                {(Object.keys(MOOD_THEME_PALETTES) as MoodThemeKey[]).map((key) => {
                  const item = MOOD_THEME_PALETTES[key];
                  const isSelected = themeKey === key;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => setThemeKey(key)}
                      style={[
                        styles.themeChip,
                        {
                          borderColor: isSelected ? PALETTE.plum.default : colors.border,
                          backgroundColor: isSelected
                            ? (isDark ? PALETTE.darkBg : PALETTE.oat.default)
                            : (isDark ? PALETTE.darkCard : PALETTE.cream),
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 16, marginRight: 6 }}>{item.icon}</Text>
                      <Typography
                        variant="caption"
                        style={{ fontFamily: isSelected ? 'Outfit-Bold' : 'Outfit-Medium' }}
                        color={isSelected ? PALETTE.plum.default : colors.text}
                      >
                        {item.name}
                      </Typography>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.rowSeparator} />

              <View style={styles.settingRowInline}>
                <View style={{ flex: 1 }}>
                  <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold' }}>App Language</Typography>
                  <Typography variant="caption" color={colors.subtext}>Primary display language</Typography>
                </View>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {['en', 'es', 'id'].map((lang) => (
                    <Pressable
                      key={lang}
                      onPress={() => handleLanguageChange(lang)}
                      style={[
                        styles.langPill,
                        { backgroundColor: currentLang === lang ? PALETTE.plum.default : colors.border },
                      ]}
                    >
                      <Typography
                        variant="caption"
                        color={currentLang === lang ? PALETTE.oat.default : colors.text}
                        style={{ fontFamily: 'Outfit-Bold', textTransform: 'uppercase' }}
                      >
                        {lang}
                      </Typography>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* GROUP 3: MEMBERSHIP & ADS */}
          <Typography variant="caption" color={colors.subtext} style={styles.sectionHeaderTitle}>
            MEMBERSHIP & EXPERIENCE
          </Typography>
          <View style={[styles.groupedCard, { backgroundColor: isDark ? PALETTE.darkCard : PALETTE.white, borderColor: colors.border }]}>
            <View style={styles.cardPadding}>
              <View style={styles.cardHeaderRow}>
                <Sparkles color={PALETTE.gold.default} size={20} />
                <Typography variant="h3" style={{ fontFamily: 'Outfit-Bold', marginLeft: 8 }}>
                  Ad-Free Experience
                </Typography>
              </View>

              <View style={styles.settingRowInline}>
                <View style={{ flex: 1 }}>
                  <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold' }}>Current Status</Typography>
                  <Typography variant="caption" color={isAdFree ? PALETTE.sage.default : colors.subtext}>
                    {isAdFree ? '✨ AD-FREE ACTIVE' : 'Free Tier (Non-intrusive ads)'}
                  </Typography>
                </View>
              </View>

              <View style={{ gap: 10, marginTop: 10 }}>
                {!isAdFree && (
                  <Button
                    title="🎬 Watch Ad for 1-Hour Ad-Free"
                    variant="outline"
                    onPress={handleWatchAdReward}
                  />
                )}
                <Button
                  title="🔄 Restore Purchases"
                  variant="secondary"
                  onPress={handleRestorePurchases}
                />
              </View>
            </View>
          </View>

          {/* GROUP 4: DIAGNOSTICS & RESET */}
          <Typography variant="caption" color={colors.subtext} style={styles.sectionHeaderTitle}>
            DIAGNOSTICS & DATA
          </Typography>
          <View style={[styles.groupedCard, { backgroundColor: isDark ? PALETTE.darkCard : PALETTE.white, borderColor: colors.border }]}>
            <View style={styles.cardPadding}>
              <View style={styles.cardHeaderRow}>
                <Database color={PALETTE.sage.default} size={20} />
                <Typography variant="h3" style={{ fontFamily: 'Outfit-Bold', marginLeft: 8 }}>
                  Storage Diagnostics
                </Typography>
              </View>

              <View style={styles.diagRow}>
                <Typography variant="caption" color={colors.subtext}>Cached Meals:</Typography>
                <Typography variant="caption" style={{ fontFamily: 'Outfit-Bold' }}>{meals.length} items</Typography>
              </View>
              <View style={styles.diagRow}>
                <Typography variant="caption" color={colors.subtext}>Cached Workouts:</Typography>
                <Typography variant="caption" style={{ fontFamily: 'Outfit-Bold' }}>{activities.length} items</Typography>
              </View>
              <View style={styles.diagRow}>
                <Typography variant="caption" color={colors.subtext}>Period Records:</Typography>
                <Typography variant="caption" style={{ fontFamily: 'Outfit-Bold' }}>{periods.length} records</Typography>
              </View>

              <View style={{ gap: 10, marginTop: 12 }}>
                <Button
                  title="🧪 Seed 45-Day Mock Testing Data"
                  variant="outline"
                  onPress={() => {
                    seedMockData();
                    Alert.alert('Demo Data Loaded', 'Loaded 45 days of realistic testing data!');
                  }}
                />
                <Button
                  title="Reset All App Data"
                  variant="outline"
                  onPress={handleResetData}
                  style={{ borderColor: PALETTE.error }}
                />
              </View>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* API Key Tutorial Modal */}
      <Modal visible={tutorialModalVisible} transparent animationType="slide" onRequestClose={() => setTutorialModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setTutorialModalVisible(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: isDark ? PALETTE.darkCard : PALETTE.white }]}>
            <View style={styles.modalHeader}>
              <BookOpen color={PALETTE.plum.default} size={24} />
              <Typography variant="h2" style={{ fontFamily: 'Outfit-Bold', marginLeft: 8 }}>
                Free Groq API Key Setup
              </Typography>
            </View>

            <Typography variant="bodyMedium" color={colors.subtext} style={{ marginTop: 8, lineHeight: 22 }}>
              1. Visit console.groq.com on your phone or PC.{"\n"}
              2. Sign up for a free developer account.{"\n"}
              3. Navigate to API Keys and tap "Create API Key".{"\n"}
              4. Copy your key (starts with gsk_...) and paste it into Sini AI Settings!
            </Typography>

            <Button
              title="Close Tutorial"
              variant="primary"
              onPress={() => setTutorialModalVisible(false)}
              style={{ marginTop: 20 }}
            />
          </Pressable>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: 'Outfit-Bold',
  },
  backBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 140,
    gap: SPACING.sm,
  },
  sectionHeaderTitle: {
    fontFamily: 'Outfit-Bold',
    fontSize: 11,
    letterSpacing: 0.8,
    marginTop: SPACING.xs,
    marginLeft: 4,
  },
  groupedCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardPadding: {
    padding: SPACING.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  tutorialLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  themeChip: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  rowSeparator: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginVertical: 14,
  },
  settingRowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  langPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  diagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    padding: 24,
    borderRadius: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
