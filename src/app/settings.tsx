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
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Typography } from '../components/Typography';
import { Button } from '../components/Button';
import { InputField } from '../components/InputField';
import { useAppStore } from '../store/useAppStore';
import { PALETTE, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
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
  Check,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAdContext } from '../context/AdContext';
import { useIAP } from '../context/IAPContext';
import { showRewardedAdWithConsent } from '../services/AdManager';
import { getCurrentLanguage, setAppLanguage, t, LANGUAGE_NAMES } from '../i18n';
import { useAppTheme } from '../context/ThemeContext';
import { DestyaStudioFooter } from '../components/DestyaStudioFooter';
import { DestyaStudioAppsHub } from '../components/DestyaStudioAppsHub';
import { APP_CONFIG } from '../constants/appConfig';
import { APP_LINKS } from '../constants/links';

export default function SettingsScreen() {
  const router = useRouter();
  const { isAdFree, grantAdFreeMinutes, adFreeExpiresAt } = useAdContext();
  const { isPremium: isIapPremium, premiumProduct, requestPurchase, restorePurchases } = useIAP();
  const { themeMode, activeThemeName, isDark, setThemeMode, colors } = useAppTheme();

  // Store bindings
  const userProfile = useAppStore((state) => state.userProfile);
  const periods = useAppStore((state) => state.periods);
  const meals = useAppStore((state) => state.meals);
  const activities = useAppStore((state) => state.activities);
  const setUserProfile = useAppStore((state) => state.setUserProfile);
  const resetStore = useAppStore((state) => state.resetStore);
  const seedMockData = useAppStore((state) => state.seedMockData);
  const setUiLanguageStore = useAppStore((state) => state.setUiLanguage);

  const { i18n } = useTranslation();
  const uiLanguage = useAppStore((state) => state.uiLanguage);

  // States
  const [apiKey, setApiKey] = useState(userProfile?.groqApiKey || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [cycleAlertsEnabled, setCycleAlertsEnabled] = useState(true);
  const [currentLang, setCurrentLangState] = useState(i18n.language || 'en');
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [targetLangName, setTargetLangName] = useState('');
  const [timeRemainingStr, setTimeRemainingStr] = useState('');

  useEffect(() => {
    getCurrentLanguage().then(setCurrentLangState);
  }, [uiLanguage]);

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

  const handleLanguageSelect = async (langCode: string) => {
    if (langCode === currentLang) {
      setLangModalVisible(false);
      return;
    }
    const name = LANGUAGE_NAMES[langCode] || langCode;
    setLangModalVisible(false);
    setTargetLangName(name);
    setIsChangingLanguage(true);

    await setAppLanguage(langCode);
    setCurrentLangState(langCode);
    setUiLanguageStore(langCode);

    setTimeout(() => {
      setIsChangingLanguage(false);
    }, 750);
  };

  const handleRestorePurchases = async () => {
    const res = await restorePurchases();
    Alert.alert(res.success ? 'Purchases Restored! ✨' : 'Restore Notice', res.message);
  };

  const handleWatchAdReward = () => {
    showRewardedAdWithConsent(() => {
      grantAdFreeMinutes(15);
      Alert.alert('Reward Unlocked! 🎉', 'You have earned 15 minutes of Ad-Free experience.');
    });
  };

  const handleShareApp = async () => {
    try {
      const shareUrl = APP_LINKS.githubRepo;
      const shareMsg = `Check out Sini AI: Cycle & Fitness — ${t('common.tagline')} ${shareUrl}`;
      await Share.share({ message: shareMsg });
    } catch (e) {
      console.warn('Share app failed:', e);
    }
  };

  const openWebLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (e) {
      console.warn('Failed to open web link:', url, e);
    }
  };

  const handleContactUs = () => {
    Linking.openURL(APP_LINKS.supportEmail).catch(() => {
      Alert.alert('Support Email', APP_CONFIG.supportEmail);
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </Pressable>
        <Typography variant="h3" style={{ fontFamily: 'Outfit-Bold' }}>
          {t('settings.title')}
        </Typography>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* SECTION 1: LANGUAGE & REGION */}
        <Typography variant="caption" color={colors.subtext} style={styles.sectionHeaderTitle}>
          {t('settings.language').toUpperCase()}
        </Typography>
        <View style={[styles.groupedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Pressable
            style={({ pressed }) => [styles.rowItem, pressed && styles.pressedRow]}
            onPress={() => setLangModalVisible(true)}
          >
            <View style={[styles.rowIconCircle, { backgroundColor: colors.surface }]}>
              <Globe size={18} color={colors.primary} />
            </View>
            <View style={styles.rowTextCol}>
              <Typography variant="bodyMedium" style={styles.rowTitle}>
                {t('settings.language')}
              </Typography>
              <Typography variant="caption" color={colors.primary} style={{ fontFamily: 'Outfit-Bold' }}>
                {LANGUAGE_NAMES[currentLang] || 'English'}
              </Typography>
            </View>
            <ChevronRight size={18} color={colors.subtext} />
          </Pressable>
        </View>

        {/* SECTION 2: MEMBERSHIP & AD-FREE UNLOCK */}
        <Typography variant="caption" color={colors.subtext} style={styles.sectionHeaderTitle}>
          MEMBERSHIP & AD-FREE UNLOCK
        </Typography>
        <View style={[styles.groupedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Pressable
            style={({ pressed }) => [styles.rowItem, pressed && styles.pressedRow]}
            onPress={requestPurchase}
          >
            <View style={[styles.rowIconCircle, { backgroundColor: colors.surface }]}>
              <Crown size={18} color={PALETTE.gold.default} />
            </View>
            <View style={styles.rowTextCol}>
              <Typography variant="bodyMedium" color={PALETTE.gold.default} style={{ fontFamily: 'Outfit-Bold' }}>
                Remove All Ads Permanently
              </Typography>
              <Typography variant="caption" color={colors.subtext}>
                {isIapPremium ? '✨ Lifetime Premium Active' : 'Permanent Ad-Free + Unlimited AI Coaching'}
              </Typography>
            </View>
            <View style={styles.priceTagBadge}>
              <Typography variant="caption" color={PALETTE.white} style={{ fontFamily: 'Outfit-Bold' }}>
                {premiumProduct?.displayPrice || t('common.loading')}
              </Typography>
            </View>
          </Pressable>

          {!isIapPremium && (
            <>
              <View style={styles.rowSeparator} />
              <Pressable
                style={({ pressed }) => [styles.rowItem, pressed && styles.pressedRow]}
                onPress={handleWatchAdReward}
              >
                <View style={[styles.rowIconCircle, { backgroundColor: colors.surface }]}>
                  <Timer size={18} color={colors.primary} />
                </View>
                <View style={styles.rowTextCol}>
                  <Typography variant="bodyMedium" style={styles.rowTitle}>
                    {t('settings.watchAdForPass')}
                  </Typography>
                  <Typography variant="caption" color={isAdFree ? colors.primary : colors.subtext}>
                    {isAdFree && timeRemainingStr ? `Active remaining: ${timeRemainingStr}` : 'Watch 1 short video ad to disable ads'}
                  </Typography>
                </View>
                <ChevronRight size={18} color={colors.subtext} />
              </Pressable>

              <View style={styles.rowSeparator} />

              <Pressable
                style={({ pressed }) => [styles.rowItem, pressed && styles.pressedRow]}
                onPress={handleRestorePurchases}
              >
                <View style={[styles.rowIconCircle, { backgroundColor: colors.surface }]}>
                  <Star size={18} color={colors.subtext} />
                </View>
                <View style={styles.rowTextCol}>
                  <Typography variant="bodyMedium" style={styles.rowTitle}>
                    {t('settings.restorePurchases')}
                  </Typography>
                  <Typography variant="caption" color={colors.subtext}>
                    Restore previously purchased premium upgrade
                  </Typography>
                </View>
                <ChevronRight size={18} color={colors.subtext} />
              </Pressable>
            </>
          )}
        </View>

        {/* SECTION 3: APPEARANCE & THEMES */}
        <Typography variant="caption" color={colors.subtext} style={styles.sectionHeaderTitle}>
          {t('settings.theme').toUpperCase()}
        </Typography>
        <View style={[styles.groupedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardPadding}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.rowIconCircle, { backgroundColor: colors.surface }]}>
                <Palette size={18} color={colors.primary} />
              </View>
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold' }}>
                  {t('settings.theme')}
                </Typography>
                <Typography variant="caption" color={colors.subtext}>
                  Active Palette: <Typography variant="caption" color={colors.primary} style={{ fontFamily: 'Outfit-Bold' }}>{activeThemeName}</Typography>
                </Typography>
              </View>
            </View>

            <View style={styles.themeGrid}>
              {[
                { mode: 'automatic', name: t('settings.themeMode.auto'), icon: '✨', desc: 'Adapts to your current cycle phase' },
                { mode: 'classic', name: t('settings.themeMode.classic'), icon: '🌾', desc: 'Original Warm Oat & Deep Plum' },
                { mode: 'dark', name: t('settings.themeMode.dark'), icon: '🌙', desc: 'Deep Plum Night theme' },
              ].map((item) => {
                const isSelected = themeMode === item.mode;
                return (
                  <Pressable
                    key={item.mode}
                    onPress={() => setThemeMode(item.mode as any)}
                    style={[
                      styles.themeChip,
                      {
                        borderColor: isSelected ? colors.primary : colors.border,
                        backgroundColor: isSelected ? colors.surface : colors.card,
                        width: '100%',
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 20, marginRight: 10 }}>{item.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Typography
                        variant="bodyMedium"
                        style={{ fontFamily: isSelected ? 'Outfit-Bold' : 'Outfit-Medium' }}
                        color={isSelected ? colors.primary : colors.textPrimary}
                      >
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color={colors.subtext} style={{ fontSize: 11 }}>
                        {item.desc}
                      </Typography>
                    </View>
                    {isSelected && (
                      <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* SECTION 4: NOTIFICATIONS & ALERTS */}
        <Typography variant="caption" color={colors.subtext} style={styles.sectionHeaderTitle}>
          NOTIFICATIONS & ALERTS
        </Typography>
        <View style={[styles.groupedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardPadding}>
            <View style={styles.settingRowInline}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={[styles.rowIconCircle, { backgroundColor: colors.surface, marginRight: 10 }]}>
                  <Bell size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold' }}>Daily Target Reminders</Typography>
                  <Typography variant="caption" color={colors.subtext}>Check-in & hydration notifications</Typography>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            <View style={styles.rowSeparatorInCard} />

            <View style={styles.settingRowInline}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={[styles.rowIconCircle, { backgroundColor: colors.surface, marginRight: 10 }]}>
                  <Sparkles size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold' }}>Cycle Transition Alerts</Typography>
                  <Typography variant="caption" color={colors.subtext}>Notify when entering new cycle phase</Typography>
                </View>
              </View>
              <Switch
                value={cycleAlertsEnabled}
                onValueChange={setCycleAlertsEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
          </View>
        </View>

        {/* SECTION 5: AI ENGINE INTEGRATION */}
        <Typography variant="caption" color={colors.subtext} style={styles.sectionHeaderTitle}>
          AI & CLOUD INTEGRATION
        </Typography>
        <View style={[styles.groupedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Pressable
            style={({ pressed }) => [styles.rowItem, pressed && styles.pressedRow]}
            onPress={() => router.push('/groq-api')}
          >
            <View style={[styles.rowIconCircle, { backgroundColor: colors.surface }]}>
              <Sparkles size={18} color={colors.primary} />
            </View>
            <View style={styles.rowTextCol}>
              <Typography variant="bodyMedium" style={styles.rowTitle}>Custom Groq AI Setup</Typography>
              <Typography variant="caption" color={userProfile?.groqApiKey ? colors.primary : colors.subtext}>
                {userProfile?.groqApiKey ? '✓ Custom Groq Key Connected' : 'Configure free API key for unlimited AI features'}
              </Typography>
            </View>
            <ChevronRight size={18} color={colors.subtext} />
          </Pressable>
        </View>

        {/* SECTION 6: SUPPORT & LEGAL */}
        <Typography variant="caption" color={colors.subtext} style={styles.sectionHeaderTitle}>
          SUPPORT, COMMUNITY & LEGAL
        </Typography>
        <View style={[styles.groupedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Pressable style={({ pressed }) => [styles.rowItem, pressed && styles.pressedRow]} onPress={handleShareApp}>
            <View style={[styles.rowIconCircle, { backgroundColor: colors.surface }]}>
              <Share2 size={18} color={colors.primary} />
            </View>
            <View style={styles.rowTextCol}>
              <Typography variant="bodyMedium" style={styles.rowTitle}>{t('settings.shareApp')}</Typography>
              <Typography variant="caption" color={colors.subtext}>Invite friends & workout partners to Sini AI</Typography>
            </View>
            <ChevronRight size={18} color={colors.subtext} />
          </Pressable>

          <View style={styles.rowSeparator} />

          <Pressable style={({ pressed }) => [styles.rowItem, pressed && styles.pressedRow]} onPress={handleContactUs}>
            <View style={[styles.rowIconCircle, { backgroundColor: colors.surface }]}>
              <Mail size={18} color={colors.nutrition} />
            </View>
            <View style={styles.rowTextCol}>
              <Typography variant="bodyMedium" style={styles.rowTitle}>{t('settings.supportContact')}</Typography>
              <Typography variant="caption" color={colors.subtext}>Reach out to Destya Studio team for help</Typography>
            </View>
            <ChevronRight size={18} color={colors.subtext} />
          </Pressable>

          <View style={styles.rowSeparator} />

          <Pressable style={({ pressed }) => [styles.rowItem, pressed && styles.pressedRow]} onPress={() => openWebLink(APP_LINKS.privacyPolicy)}>
            <View style={[styles.rowIconCircle, { backgroundColor: colors.surface }]}>
              <ShieldCheck size={18} color={colors.primary} />
            </View>
            <View style={styles.rowTextCol}>
              <Typography variant="bodyMedium" style={styles.rowTitle}>{t('settings.privacyPolicy')}</Typography>
              <Typography variant="caption" color={colors.subtext}>See how your data is processed locally with 100% privacy</Typography>
            </View>
            <ChevronRight size={18} color={colors.subtext} />
          </Pressable>

          <View style={styles.rowSeparator} />

          <Pressable style={({ pressed }) => [styles.rowItem, pressed && styles.pressedRow]} onPress={() => openWebLink(APP_LINKS.termsOfService)}>
            <View style={[styles.rowIconCircle, { backgroundColor: colors.surface }]}>
              <BookOpen size={18} color={colors.primary} />
            </View>
            <View style={styles.rowTextCol}>
              <Typography variant="bodyMedium" style={styles.rowTitle}>{t('settings.termsOfService')}</Typography>
              <Typography variant="caption" color={colors.subtext}>End-user license & service agreement</Typography>
            </View>
            <ChevronRight size={18} color={colors.subtext} />
          </Pressable>

          <View style={styles.rowSeparator} />

          <Pressable style={({ pressed }) => [styles.rowItem, pressed && styles.pressedRow]} onPress={() => openWebLink(APP_LINKS.website)}>
            <View style={[styles.rowIconCircle, { backgroundColor: colors.surface }]}>
              <Globe size={18} color={colors.primary} />
            </View>
            <View style={styles.rowTextCol}>
              <Typography variant="bodyMedium" style={styles.rowTitle}>Destya Studio Website</Typography>
              <Typography variant="caption" color={colors.subtext}>Explore destyastudio.com & our mobile ecosystem</Typography>
            </View>
            <ChevronRight size={18} color={colors.subtext} />
          </Pressable>
        </View>

        {/* SECTION 7: SYSTEM & DATA RESET */}
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
                title={t('settings.resetData')}
                variant="secondary"
                onPress={() => {
                  Alert.alert(
                    t('settings.resetData'),
                    t('settings.resetDataConfirm'),
                    [
                      { text: t('common.cancel'), style: 'cancel' },
                      {
                        text: t('common.delete'),
                        style: 'destructive',
                        onPress: () => {
                          resetStore();
                          Alert.alert('Data Cleared', 'App state reset successfully.');
                        },
                      },
                    ]
                  );
                }}
              />
            </View>
          </View>
        </View>

        {/* DESTYA STUDIO INTEGRATION */}
        <DestyaStudioAppsHub />
        <DestyaStudioFooter />

        <View style={styles.aboutFooterBox}>
          <Typography variant="caption" color={colors.subtext} align="center">
            {t('settings.developerInfo')}
          </Typography>
          <Typography variant="caption" color={colors.subtext} align="center" style={{ marginTop: 2 }}>
            {t('settings.version', { version: APP_CONFIG.version })}
          </Typography>
        </View>
      </ScrollView>

      {/* LANGUAGE SELECTION MODAL */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setLangModalVisible(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Typography variant="h3" style={{ fontFamily: 'Outfit-Bold' }}>
                {t('settings.selectLanguage')}
              </Typography>
              <Pressable onPress={() => setLangModalVisible(false)} hitSlop={12}>
                <Typography variant="bodyMedium" color={colors.primary} style={{ fontFamily: 'Outfit-Bold' }}>
                  {t('common.done')}
                </Typography>
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 380 }}>
              {Object.entries(LANGUAGE_NAMES).map(([code, name]) => {
                const isSelected = currentLang === code;
                return (
                  <Pressable
                    key={code}
                    style={({ pressed }) => [
                      styles.langOptionItem,
                      {
                        backgroundColor: isSelected ? colors.surface : 'transparent',
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                      pressed && styles.pressedRow,
                    ]}
                    onPress={() => handleLanguageSelect(code)}
                  >
                    <Typography
                      variant="bodyLarge"
                      style={{ fontFamily: isSelected ? 'Outfit-Bold' : 'Outfit-Regular', flex: 1 }}
                      color={isSelected ? colors.primary : colors.textPrimary}
                    >
                      {name}
                    </Typography>
                    {isSelected && <Check size={20} color={colors.primary} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* LANGUAGE CHANGING LOADING OVERLAY */}
      <Modal visible={isChangingLanguage} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <View style={[styles.loadingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Typography variant="h3" style={{ fontFamily: 'Outfit-Bold', marginTop: 16 }}>
              {t('common.loading')}
            </Typography>
            <Typography variant="bodySmall" color={colors.subtext} style={{ marginTop: 6, textAlign: 'center' }}>
              Updating language to {targetLangName}...
            </Typography>
          </View>
        </View>
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
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 6,
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
  langOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingCard: {
    width: '100%',
    maxWidth: 320,
    padding: 28,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
});
