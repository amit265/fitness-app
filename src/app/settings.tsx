import React, { useState, useEffect } from 'react';
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
  Share,
  Linking,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
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
  Share2,
  Mail,
  ShieldCheck,
  Star,
  Crown,
  Timer,
  Sliders,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAdContext } from '../context/AdContext';
import { useIAP } from '../context/IAPContext';
import { showRewardedAdWithConsent } from '../services/AdManager';
import { getCurrentLanguage, setAppLanguage } from '../i18n';
import { useAppTheme, MOOD_THEME_PALETTES, MoodThemeKey } from '../context/ThemeContext';
import { DestyaStudioFooter } from '../components/DestyaStudioFooter';
import { DestyaStudioAppsHub } from '../components/DestyaStudioAppsHub';
import { APP_CONFIG } from '../constants/appConfig';

export default function SettingsScreen() {
  const router = useRouter();
  const { isAdFree, grantAdFreeHours, adFreeExpiresAt } = useAdContext();
  const { isPremium: isIapPremium, premiumProduct, requestPurchase, restorePurchases } = useIAP();
  const { themeKey, isDark, setThemeKey, colors } = useAppTheme();

  // Store bindings
  const userProfile = useAppStore((state) => state.userProfile);
  const periods = useAppStore((state) => state.periods);
  const meals = useAppStore((state) => state.meals);
  const activities = useAppStore((state) => state.activities);
  const setUserProfile = useAppStore((state) => state.setUserProfile);
  const resetStore = useAppStore((state) => state.resetStore);
  const seedMockData = useAppStore((state) => state.seedMockData);

  // States
  const [apiKey, setApiKey] = useState(userProfile?.groqApiKey || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [cycleAlertsEnabled, setCycleAlertsEnabled] = useState(true);
  const [tutorialModalVisible, setTutorialModalVisible] = useState(false);
  const [savedKeySuccess, setSavedKeySuccess] = useState(false);
  const [currentLang, setCurrentLangState] = useState('en');
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [timeRemainingStr, setTimeRemainingStr] = useState('');

  useEffect(() => {
    getCurrentLanguage().then(setCurrentLangState);
  }, []);

  // Countdown timer for 1-Hour Ad-Free Pass
  useEffect(() => {
    if (typeof adFreeExpiresAt !== 'number') {
      setTimeRemainingStr('');
      return;
    }

    const updateTimer = () => {
      const remaining = adFreeExpiresAt - Date.now();
      if (remaining <= 0) {
        setTimeRemainingStr('00:00:00');
      } else {
        const totalSeconds = Math.floor(remaining / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        setTimeRemainingStr(
          `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [adFreeExpiresAt]);

  const handleLanguageChange = (lang: string) => {
    setCurrentLangState(lang);
    setAppLanguage(lang);
    Alert.alert('Language Updated', `App display language set to ${lang.toUpperCase()}.`);
  };

  const handleRestorePurchases = async () => {
    const res = await restorePurchases();
    Alert.alert(res.success ? 'Purchases Restored! ✨' : 'Restore Notice', res.message);
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

  const handleShareApp = async () => {
    try {
      const shareUrl = APP_CONFIG.githubRepoUrl;
      const shareMsg = `Check out Sini AI: Cycle & Fitness — Fitness that understands your cycle! ${shareUrl}`;
      await Share.share({ message: shareMsg });
    } catch (e) {
      console.warn('Share app failed:', e);
    }
  };

  const openWebLink = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch {
      Linking.openURL(url);
    }
  };

  const handleContactUs = () => {
    const email = APP_CONFIG.supportEmail;
    const subject = `Sini AI Support Request`;
    const body = `Hi Destya Studio Support,\n\n[Write your message here]\n\n---\nDevice OS: ${Platform.OS}\nApp Version: ${APP_CONFIG.version}`;
    const mailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    Linking.openURL(mailUrl).catch(() => Alert.alert('Error', 'Could not open email app.'));
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All App Data?',
      'This will permanently delete all logged meals, workouts, weight records, and period history. This action cannot be undone.',
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
            <Typography variant="h2" style={{ fontFamily: 'Outfit-Bold' }}>App Settings</Typography>
            <Typography variant="caption" color={colors.subtext}>Sini AI System & Preferences</Typography>
          </View>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* SECTION 1: IN-APP PURCHASES & MONETIZATION (QUESTION-GAMES STYLE) */}
          <Typography variant="caption" color={colors.subtext} style={styles.sectionHeaderTitle}>
            MEMBERSHIP & AD-FREE UNLOCK
          </Typography>
          <View style={[styles.groupedCard, { backgroundColor: isDark ? PALETTE.darkCard : PALETTE.white, borderColor: colors.border }]}>
            <View style={styles.cardPadding}>
              
              {/* Lifetime Remove Ads Card */}
              <Pressable
                style={({ pressed }) => [
                  styles.premiumPurchaseBox,
                  { backgroundColor: isDark ? '#2A2016' : '#FFF9F0', borderColor: PALETTE.gold.default },
                  pressed && { opacity: 0.8 },
                ]}
                onPress={requestPurchase}
              >
                <View style={[styles.rowIconCircle, { backgroundColor: '#FBEED6' }]}>
                  <Crown size={20} color={PALETTE.gold.default} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Typography variant="bodyMedium" color={PALETTE.gold.default} style={{ fontFamily: 'Outfit-Bold' }}>
                    Remove All Ads Permanently
                  </Typography>
                  <Typography variant="caption" color={colors.subtext}>
                    {isIapPremium ? '✨ Lifetime Premium Active' : 'Permanent Ad-Free + Unlimited AI Coaching'}
                  </Typography>
                </View>
                <View style={styles.priceTagBadge}>
                  <Typography variant="caption" color={PALETTE.white} style={{ fontFamily: 'Outfit-Bold' }}>
                    {premiumProduct?.displayPrice || '$2.99'}
                  </Typography>
                </View>
              </Pressable>

              {/* Temporary Ad-Free Pass */}
              {!isIapPremium && (
                <View style={{ marginTop: 12 }}>
                  <View style={styles.settingRowInline}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <View style={[styles.rowIconCircle, { backgroundColor: PALETTE.sage.bg, marginRight: 10 }]}>
                        <Timer size={18} color={PALETTE.sage.default} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold' }}>1-Hour Ad-Free Pass</Typography>
                        <Typography variant="caption" color={isAdFree ? PALETTE.sage.default : colors.subtext}>
                          {isAdFree && timeRemainingStr ? `Active: ${timeRemainingStr}` : 'Watch 1 short video ad to disable ads'}
                        </Typography>
                      </View>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                    {!isAdFree && (
                      <Button
                        title="🎬 Watch Ad for 1-Hour Pass"
                        variant="outline"
                        onPress={handleWatchAdReward}
                        style={{ flex: 1 }}
                      />
                    )}
                    <Button
                      title="🔄 Restore Purchases"
                      variant="secondary"
                      onPress={handleRestorePurchases}
                      style={{ flex: 1 }}
                    />
                  </View>
                </View>
              )}

            </View>
          </View>

          {/* SECTION 2: APPEARANCE & MOOD THEMES */}
          <Typography variant="caption" color={colors.subtext} style={styles.sectionHeaderTitle}>
            APPEARANCE & MOOD PALETTE
          </Typography>
          <View style={[styles.groupedCard, { backgroundColor: isDark ? PALETTE.darkCard : PALETTE.white, borderColor: colors.border }]}>
            <View style={styles.cardPadding}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.rowIconCircle, { backgroundColor: PALETTE.plum.bg }]}>
                  <Palette size={18} color={PALETTE.plum.default} />
                </View>
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold' }}>App Theme & Mood</Typography>
                  <Typography variant="caption" color={colors.subtext}>Sync UI color palette with your phase</Typography>
                </View>
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
            </View>
          </View>

          {/* SECTION 3: NOTIFICATIONS & REMINDERS */}
          <Typography variant="caption" color={colors.subtext} style={styles.sectionHeaderTitle}>
            NOTIFICATIONS & ALERTS
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
                    <Typography variant="caption" color={colors.subtext}>Check-in & hydration notifications</Typography>
                  </View>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: colors.border, true: PALETTE.plum.default }}
                />
              </View>

              <View style={styles.rowSeparatorInCard} />

              <View style={styles.settingRowInline}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={[styles.rowIconCircle, { backgroundColor: PALETTE.rose.bg, marginRight: 10 }]}>
                    <Sparkles size={18} color={PALETTE.rose.default} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold' }}>Cycle Transition Alerts</Typography>
                    <Typography variant="caption" color={colors.subtext}>Notify when entering new cycle phase</Typography>
                  </View>
                </View>
                <Switch
                  value={cycleAlertsEnabled}
                  onValueChange={setCycleAlertsEnabled}
                  trackColor={{ false: colors.border, true: PALETTE.plum.default }}
                />
              </View>

            </View>
          </View>

          {/* SECTION 4: AI ENGINE INTEGRATION */}
          <Typography variant="caption" color={colors.subtext} style={styles.sectionHeaderTitle}>
            AI & CLOUD INTEGRATION
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
                    {apiKey ? '✓ Custom Key Connected (Dynamic NLP Active)' : 'Local Fallback Engine Active'}
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
                  ✓ API Key Saved Locally!
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

          {/* SECTION 5: SUPPORT, SHARE & LEGAL */}
          <Typography variant="caption" color={colors.subtext} style={styles.sectionHeaderTitle}>
            SUPPORT & ECOSYSTEM
          </Typography>
          <View style={[styles.groupedCard, { backgroundColor: isDark ? PALETTE.darkCard : PALETTE.white, borderColor: colors.border }]}>
            <Pressable style={({ pressed }) => [styles.rowItem, pressed && styles.pressedRow]} onPress={handleShareApp}>
              <View style={[styles.rowIconCircle, { backgroundColor: PALETTE.sage.bg }]}>
                <Share2 size={18} color={PALETTE.sage.default} />
              </View>
              <View style={styles.rowTextCol}>
                <Typography variant="bodyMedium" style={styles.rowTitle}>Share Sini AI App</Typography>
                <Typography variant="caption" color={colors.subtext}>Share with friends & fitness partners</Typography>
              </View>
              <ChevronRight size={18} color={colors.subtext} />
            </Pressable>

            <View style={styles.rowSeparator} />

            <Pressable style={({ pressed }) => [styles.rowItem, pressed && styles.pressedRow]} onPress={handleContactUs}>
              <View style={[styles.rowIconCircle, { backgroundColor: PALETTE.terracotta.bg }]}>
                <Mail size={18} color={PALETTE.terracotta.default} />
              </View>
              <View style={styles.rowTextCol}>
                <Typography variant="bodyMedium" style={styles.rowTitle}>Contact Support & Feedback</Typography>
                <Typography variant="caption" color={colors.subtext}>Reach out to Destya Studio team</Typography>
              </View>
              <ChevronRight size={18} color={colors.subtext} />
            </Pressable>

            <View style={styles.rowSeparator} />

            <Pressable style={({ pressed }) => [styles.rowItem, pressed && styles.pressedRow]} onPress={() => openWebLink('https://destyastudio.com/privacy')}>
              <View style={[styles.rowIconCircle, { backgroundColor: PALETTE.plum.bg }]}>
                <ShieldCheck size={18} color={PALETTE.plum.default} />
              </View>
              <View style={styles.rowTextCol}>
                <Typography variant="bodyMedium" style={styles.rowTitle}>Privacy Policy & Data Security</Typography>
                <Typography variant="caption" color={colors.subtext}>100% Client-side local data storage</Typography>
              </View>
              <ChevronRight size={18} color={colors.subtext} />
            </Pressable>
          </View>

          {/* SECTION 6: SYSTEM DIAGNOSTICS & RESET */}
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
                  <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold' }}>Local Storage Summary</Typography>
                  <Typography variant="caption" color={colors.subtext}>
                    {meals.length} meals · {activities.length} workouts · {periods.length} cycle logs
                  </Typography>
                </View>
              </View>

              <View style={{ gap: 10, marginTop: 10 }}>
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

          {/* Cross Promo Hub */}
          <DestyaStudioAppsHub />

          {/* APP ABOUT & FOOTER */}
          <View style={styles.aboutFooterBox}>
            <Typography variant="caption" color={colors.subtext} style={{ fontFamily: 'Outfit-Bold' }}>
              Sini AI: Cycle & Fitness v1.0.0
            </Typography>
            <Typography variant="caption" color={colors.subtext} style={{ marginTop: 2 }}>
              100% Client-Side Privacy · Destya Studio
            </Typography>
          </View>

          <DestyaStudioFooter />

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

            <Typography variant="bodyMedium" color={colors.subtext} style={{ marginTop: 12, lineHeight: 22 }}>
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
  premiumPurchaseBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  priceTagBadge: {
    backgroundColor: PALETTE.gold.default,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
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
    width: 36,
    height: 36,
    borderRadius: 18,
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
  aboutFooterBox: {
    alignItems: 'center',
    marginVertical: SPACING.md,
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
