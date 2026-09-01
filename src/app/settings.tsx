import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  useColorScheme,
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
  RotateCcw,
  Trash2,
  Bell,
  Palette,
  Sparkles,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAdContext } from '../context/AdContext';
import { showRewardedAdWithConsent } from '../services/AdManager';
import { getCurrentLanguage, setAppLanguage } from '../i18n';
import { useAppTheme, MOOD_THEME_PALETTES, MoodThemeKey } from '../context/ThemeContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { isAdFree, grantAdFreeHours, setPremiumStatus } = useAdContext();
  const { themeKey, isDark, setThemeKey } = useAppTheme();

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
    Alert.alert('Language Updated', `App language updated to ${lang.toUpperCase()}.`);
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

  // Auto-save API key
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

  // Reset store with confirmation
  const handleResetData = () => {
    Alert.alert(
      'Reset App State?',
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
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121110' : PALETTE.oat.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Top Header */}
        <View style={[styles.header, { borderBottomColor: isDark ? '#2E2B28' : '#ECE9E4' }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft color={isDark ? PALETTE.cream : PALETTE.charcoal.default} size={22} />
          </Pressable>
          <Typography variant="h2" style={styles.headerTitle}>App Settings</Typography>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Groq AI Settings */}
          <Card style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Key color={PALETTE.sage.default} size={20} />
              <Typography variant="h3">Groq AI API Setup</Typography>
            </View>

            <InputField
              label="Custom Groq API Key (gsk_...)"
              value={apiKey}
              secureTextEntry={true}
              onChangeText={handleSaveApiKey}
              placeholder="gsk_yourApiKeyHere"
            />

            {savedKeySuccess && (
              <Typography variant="caption" color="#10B981" style={{ marginTop: 2, fontFamily: 'Outfit-Bold' }}>
                ✓ API Key Auto-Saved!
              </Typography>
            )}

            <Typography variant="caption" color={PALETTE.charcoal.light} style={styles.captionText}>
              Used client-side for dynamic food parsing and conversational coaching. Keys are stored locally on your device.
            </Typography>

            <Pressable
              style={styles.tutorialTriggerBtn}
              onPress={() => setTutorialModalVisible(true)}
            >
              <HelpCircle color={PALETTE.sage.default} size={18} />
              <Typography variant="bodySmall" color={PALETTE.sage.default} style={{ fontFamily: 'Outfit-Bold', marginLeft: 6 }}>
                How to get a free Groq API Key?
              </Typography>
            </Pressable>
          </Card>

          {/* Premium & AdMob Section */}
          <Card style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Sparkles color={PALETTE.sage.default} size={20} />
              <Typography variant="h3">Membership & Ad-Free Experience</Typography>
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <Typography variant="bodyMedium">Status</Typography>
                <Typography variant="caption" color={isAdFree ? PALETTE.sage.default : PALETTE.charcoal.light} style={{ fontFamily: 'Outfit-Bold' }}>
                  {isAdFree ? '✨ AD-FREE / PREMIUM ACTIVE' : 'FREE USER (ADS ENABLED)'}
                </Typography>
              </View>
            </View>

            <View style={{ gap: 10, marginTop: 8 }}>
              {!isAdFree && (
                <Button
                  title="🎬 Watch Ad for 1-Hour Ad-Free"
                  variant="outline"
                  onPress={handleWatchAdReward}
                />
              )}
              <Button
                title="🔄 Restore Purchases"
                variant="outline"
                onPress={handleRestorePurchases}
              />
            </View>
          </Card>

          {/* Preferences */}
          <Card style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Bell color={PALETTE.sage.default} size={20} />
              <Typography variant="h3">Preferences, Theme & Language</Typography>
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <Typography variant="bodyMedium">Daily Target Reminders</Typography>
                <Typography variant="caption" color={PALETTE.charcoal.light}>
                  Receive gentle notifications for check-in and water targets.
                </Typography>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#ECE9E4', true: PALETTE.sage.default }}
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <Typography variant="bodyMedium">Mood & Rhythm App Palette</Typography>
                <Typography variant="caption" color={PALETTE.charcoal.light}>
                  Sync your app colors with your daily mood or cycle phase.
                </Typography>
              </View>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6, marginBottom: 16 }}>
              {(Object.keys(MOOD_THEME_PALETTES) as MoodThemeKey[]).map((key) => {
                const item = MOOD_THEME_PALETTES[key];
                const isSelected = themeKey === key;
                return (
                  <Pressable
                    key={key}
                    onPress={() => setThemeKey(key)}
                    style={{
                      width: '48%',
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 10,
                      borderRadius: 14,
                      borderWidth: isSelected ? 2 : 1,
                      borderColor: isSelected ? PALETTE.sage.default : isDark ? '#2E2B28' : '#ECE9E4',
                      backgroundColor: isSelected
                        ? isDark ? '#2A2724' : '#F4F8F5'
                        : isDark ? '#1F1C1A' : '#FAF8F5',
                    }}
                  >
                    <Text style={{ fontSize: 18, marginRight: 8 }}>{item.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Typography
                        variant="caption"
                        style={{ fontFamily: isSelected ? 'Outfit-Bold' : 'Outfit-Medium' }}
                        color={isSelected ? PALETTE.sage.default : isDark ? PALETTE.cream : PALETTE.charcoal.default}
                      >
                        {item.name}
                      </Typography>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
              <View style={styles.toggleLeft}>
                <Typography variant="bodyMedium">App Language</Typography>
                <Typography variant="caption" color={PALETTE.charcoal.light}>
                  Select your primary language.
                </Typography>
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {['en', 'es', 'id'].map((lang) => (
                  <Pressable
                    key={lang}
                    onPress={() => handleLanguageChange(lang)}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 8,
                      backgroundColor: currentLang === lang ? PALETTE.sage.default : '#ECE9E4',
                    }}
                  >
                    <Typography
                      variant="caption"
                      color={currentLang === lang ? PALETTE.white : PALETTE.charcoal.default}
                      style={{ fontFamily: 'Outfit-Bold', textTransform: 'uppercase' }}
                    >
                      {lang}
                    </Typography>
                  </Pressable>
                ))}
              </View>
            </View>
          </Card>

          {/* Storage Diagnostics */}
          <Card style={styles.diagnosticCard}>
            <View style={styles.cardHeaderRow}>
              <ShieldAlert color="#E67E22" size={20} />
              <Typography variant="h3" color="#E67E22">Storage & Cache Diagnostics</Typography>
            </View>
            
            <View style={styles.diagnosticRow}>
              <Typography variant="bodySmall">Period Logs Cached:</Typography>
              <Typography variant="bodySmall" style={styles.boldText}>{periods.length} records</Typography>
            </View>
            <View style={styles.diagnosticRow}>
              <Typography variant="bodySmall">Daily Check-Ins Cached:</Typography>
              <Typography variant="bodySmall" style={styles.boldText}>{Object.keys(dailyCheckIns).length} records</Typography>
            </View>
            <View style={styles.diagnosticRow}>
              <Typography variant="bodySmall">Logged Meals Cached:</Typography>
              <Typography variant="bodySmall" style={styles.boldText}>{meals.length} records</Typography>
            </View>
            <View style={styles.diagnosticRow}>
              <Typography variant="bodySmall">Workouts Cached:</Typography>
              <Typography variant="bodySmall" style={styles.boldText}>{activities.length} records</Typography>
            </View>

            <View style={styles.btnDivider} />

            <Button
              title="🧪 Seed 45-Day Mock Testing Data"
              variant="outline"
              onPress={() => {
                seedMockData();
                Alert.alert('Demo Data Loaded', 'Populated 45 days of realistic testing data for fitness, cycle, workouts, meals, and measurements!');
              }}
              style={{ marginBottom: 8 }}
            />

            <Button
              title="Reset All App Data"
              variant="outline"
              onPress={handleResetData}
              style={styles.dangerBtn}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* API Key Tutorial Modal */}
      <Modal visible={tutorialModalVisible} transparent animationType="slide" onRequestClose={() => setTutorialModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setTutorialModalVisible(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: isDark ? '#1C1A18' : PALETTE.white }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <BookOpen color={PALETTE.sage.default} size={24} />
                <Typography variant="h2">Free Groq API Key Setup</Typography>
              </View>
            </View>

            <ScrollView style={{ maxHeight: 350, marginVertical: SPACING.sm }} showsVerticalScrollIndicator={false}>
              <View style={styles.tutorialStepItem}>
                <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold', color: PALETTE.sage.default }}>
                  Step 1: Open Groq Console
                </Typography>
                <Typography variant="bodySmall" color={PALETTE.charcoal.light} style={{ marginTop: 2 }}>
                  Visit <Typography variant="bodySmall" style={{ fontFamily: 'Outfit-Bold' }}>console.groq.com</Typography> in your browser.
                </Typography>
              </View>

              <View style={styles.tutorialStepItem}>
                <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold', color: PALETTE.sage.default }}>
                  Step 2: Sign Up Free
                </Typography>
                <Typography variant="bodySmall" color={PALETTE.charcoal.light} style={{ marginTop: 2 }}>
                  Click "Sign In with Google" or create a free account. No credit card required!
                </Typography>
              </View>

              <View style={styles.tutorialStepItem}>
                <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold', color: PALETTE.sage.default }}>
                  Step 3: Create API Key
                </Typography>
                <Typography variant="bodySmall" color={PALETTE.charcoal.light} style={{ marginTop: 2 }}>
                  In the left sidebar, click <Typography variant="bodySmall" style={{ fontFamily: 'Outfit-Bold' }}>API Keys</Typography> $\rightarrow$ click <Typography variant="bodySmall" style={{ fontFamily: 'Outfit-Bold' }}>"+ Create API Key"</Typography>.
                </Typography>
              </View>

              <View style={styles.tutorialStepItem}>
                <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold', color: PALETTE.sage.default }}>
                  Step 4: Copy & Paste Key
                </Typography>
                <Typography variant="bodySmall" color={PALETTE.charcoal.light} style={{ marginTop: 2 }}>
                  Copy your key (starts with <Typography variant="bodySmall" style={{ fontFamily: 'Outfit-Bold' }}>gsk_...</Typography>) and paste it into the field above!
                </Typography>
              </View>
            </ScrollView>

            <Button title="Got it!" onPress={() => setTutorialModalVisible(false)} style={{ width: '100%', marginTop: SPACING.sm }} />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 60,
  },
  card: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.md,
  },
  captionText: {
    marginTop: 4,
    lineHeight: 16,
  },
  tutorialTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#ECE9E4',
  },
  toggleLeft: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  diagnosticCard: {
    padding: SPACING.lg,
    borderColor: '#FADBD8',
    borderWidth: 1.5,
    marginBottom: SPACING.lg,
  },
  diagnosticRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  boldText: {
    fontFamily: 'Outfit-Bold',
  },
  btnDivider: {
    height: 1.5,
    backgroundColor: '#FADBD8',
    marginVertical: SPACING.md,
  },
  dangerBtn: {
    backgroundColor: '#C0392B',
    borderColor: '#C0392B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalContent: {
    width: '100%',
    borderRadius: 20,
    padding: SPACING.lg,
  },
  modalHeader: {
    marginBottom: SPACING.sm,
  },
  tutorialStepItem: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#ECE9E4',
  },
});
