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
  Trash2,
  Bell,
  Palette,
  Sparkles,
  ChevronRight,
  Globe,
  Database,
  User,
  Calendar as CalendarIcon,
  Ruler,
  ShieldCheck,
  Check,
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
  const cyclePreferences = useAppStore((state) => state.cyclePreferences);
  const periods = useAppStore((state) => state.periods);
  const dailyCheckIns = useAppStore((state) => state.dailyCheckIns);
  const meals = useAppStore((state) => state.meals);
  const activities = useAppStore((state) => state.activities);
  const measurements = useAppStore((state) => state.measurements);
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

        {/* Top Header Bar */}
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft color={colors.text} size={22} />
          </Pressable>
          <View style={{ alignItems: 'center' }}>
            <Typography variant="h2" style={{ fontFamily: 'Outfit-Bold' }}>Settings</Typography>
            <Typography variant="caption" color={colors.subtext}>Sini AI Preferences</Typography>
          </View>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* SECTION 1: ACCOUNT & PROFILE NAVIGATION */}
          <Typography variant="caption" color={colors.subtext} style={styles.sectionHeaderTitle}>
            ACCOUNT & PROFILE
          </Typography>
          <View style={[styles.groupedCard, { backgroundColor: isDark ? PALETTE.darkCard : PALETTE.white, borderColor: colors.border }]}>
            <Pressable
              style={({ pressed }) => [styles.rowItem, pressed && styles.pressedRow]}
              onPress={() => router.push('/edit-profile')}
            >
              <View style={[styles.rowIconCircle, { backgroundColor: PALETTE.terracotta.bg }]}>
                <User size={18} color={PALETTE.terracotta.default} />
              </View>
              <View style={styles.rowTextCol}>
                <Typography variant="bodyMedium" style={styles.rowTitle}>Profile & Goals</Typography>
                <Typography variant="caption" color={colors.subtext}>
                  {(userProfile?.name || 'Sarah')} · {(userProfile?.weightGoal || 'wellness').toUpperCase()}
                </Typography>
              </View>
              <ChevronRight size={18} color={colors.subtext} />
            </Pressable>

            <View style={styles.rowSeparator} />

            <Pressable
              style={({ pressed }) => [styles.rowItem, pressed && styles.pressedRow]}
              onPress={() => router.push('/cycle')}
            >
              <View style={[styles.rowIconCircle, { backgroundColor: PALETTE.rose.bg }]}>
                <CalendarIcon size={18} color={PALETTE.rose.default} />
              </View>
              <View style={styles.rowTextCol}>
                <Typography variant="bodyMedium" style={styles.rowTitle}>Cycle Parameters</Typography>
                <Typography variant="caption" color={colors.subtext}>
                  {cyclePreferences?.typicalCycleLength || 28}d cycle · {cyclePreferences?.typicalPeriodDuration || 5}d period
                </Typography>
              </View>
              <ChevronRight size={18} color={colors.subtext} />
            </Pressable>

            <View style={styles.rowSeparator} />

            <Pressable
              style={({ pressed }) => [styles.rowItem, pressed && styles.pressedRow]}
              onPress={() => router.push('/bmi')}
            >
              <View style={[styles.rowIconCircle, { backgroundColor: PALETTE.sage.bg }]}>
                <Ruler size={18} color={PALETTE.sage.default} />
              </View>
              <View style={styles.rowTextCol}>
                <Typography variant="bodyMedium" style={styles.rowTitle}>BMI & Biometrics</Typography>
                <Typography variant="caption" color={colors.subtext}>
                  {userProfile?.height || 165} cm · {measurements[0]?.weight || 62} kg
                </Typography>
              </View>
              <ChevronRight size={18} color={colors.subtext} />
            </Pressable>
          </View>

          {/* SECTION 2: AI ENGINE INTEGRATION */}
          <Typography variant="caption" color={colors.subtext} style={styles.sectionHeaderTitle}>
            AI & INTELLIGENCE
          </Typography>
          <View style={[styles.groupedCard, { backgroundColor: isDark ? PALETTE.darkCard : PALETTE.white, borderColor: colors.border }]}>
            <View style={styles.cardPadding}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.rowIconCircle, { backgroundColor: PALETTE.plum.bg }]}>
                  <Key size={18} color={PALETTE.plum.default} />
                </View>
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold' }}>Groq Cloud AI Engine</Typography>
                  <Typography variant="caption" color={apiKey ? PALETTE.sage.default : colors.subtext}>
                    {apiKey ? '✓ API Key Connected (Dynamic NLP Active)' : 'Local Fallback Engine Active'}
                  </Typography>
                </View>
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
                  ✓ Key Auto-Saved!
                </Typography>
              )}

              <Pressable
                style={styles.tutorialLinkBtn}
                onPress={() => setTutorialModalVisible(true)}
              >
                <HelpCircle color={PALETTE.plum.default} size={15} />
                <Typography variant="caption" color={PALETTE.plum.default} style={{ fontFamily: 'Outfit-Bold', marginLeft: 6 }}>
                  How to get a free Groq API Key?
                </Typography>
              </Pressable>
            </View>
          </View>

          {/* SECTION 3: APPEARANCE & PREFERENCES */}
          <Typography variant="caption" color={colors.subtext} style={styles.sectionHeaderTitle}>
            APPEARANCE & NOTIFICATIONS
          </Typography>
          <View style={[styles.groupedCard, { backgroundColor: isDark ? PALETTE.darkCard : PALETTE.white, borderColor: colors.border }]}>
            <View style={styles.cardPadding}>
              <View style={styles.settingRowInline}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={[styles.rowIconCircle, { backgroundColor: PALETTE.gold.bg, marginRight: 10 }]}>
                    <Bell size={18} color={PALETTE.gold.default} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold' }}>Daily Target Reminders</Typography>
                    <Typography variant="caption" color={colors.subtext}>Check-in & hydration alerts</Typography>
                  </View>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: colors.border, true: PALETTE.plum.default }}
                />
              </View>

              <View style={styles.rowSeparatorInCard} />

              <View style={{ marginVertical: 4 }}>
                <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold', marginBottom: 8 }}>
                  Mood & Rhythm Theme
                </Typography>
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
              </View>

              <View style={styles.rowSeparatorInCard} />

              <View style={styles.settingRowInline}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={[styles.rowIconCircle, { backgroundColor: PALETTE.sage.bg, marginRight: 10 }]}>
                    <Globe size={18} color={PALETTE.sage.default} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold' }}>App Language</Typography>
                    <Typography variant="caption" color={colors.subtext}>Primary display language</Typography>
                  </View>
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

          {/* SECTION 4: MEMBERSHIP & EXPERIENCE */}
          <Typography variant="caption" color={colors.subtext} style={styles.sectionHeaderTitle}>
            MEMBERSHIP & AD EXPERIENCE
          </Typography>
          <View style={[styles.groupedCard, { backgroundColor: isDark ? PALETTE.darkCard : PALETTE.white, borderColor: colors.border }]}>
            <View style={styles.cardPadding}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.rowIconCircle, { backgroundColor: PALETTE.gold.bg }]}>
                  <Sparkles size={18} color={PALETTE.gold.default} />
                </View>
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold' }}>Ad-Free Experience</Typography>
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

          {/* SECTION 5: DIAGNOSTICS & RESET */}
          <Typography variant="caption" color={colors.subtext} style={styles.sectionHeaderTitle}>
            SYSTEM & DATA
          </Typography>
          <View style={[styles.groupedCard, { backgroundColor: isDark ? PALETTE.darkCard : PALETTE.white, borderColor: colors.border }]}>
            <View style={styles.cardPadding}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.rowIconCircle, { backgroundColor: PALETTE.sage.bg }]}>
                  <Database size={18} color={PALETTE.sage.default} />
                </View>
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold' }}>Data Cache Summary</Typography>
                  <Typography variant="caption" color={colors.subtext}>
                    {meals.length} meals · {activities.length} workouts · {periods.length} cycle logs
                  </Typography>
                </View>
              </View>

              <View style={{ gap: 10, marginTop: 10 }}>
                <Button
                  title="🧪 Seed 45-Day Demo Mock Data"
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
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  pressedRow: {
    opacity: 0.75,
  },
  rowIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTextCol: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  rowTitle: {
    fontFamily: 'Outfit-Bold',
  },
  rowSeparator: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginLeft: 62,
  },
  rowSeparatorInCard: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginVertical: 12,
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
