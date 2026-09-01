import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Linking, Platform, KeyboardAvoidingView,  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../components/Typography';
import { Button } from '../components/Button';
import { InputField } from '../components/InputField';
import { useAppStore } from '../store/useAppStore';
import { useAppTheme } from '../context/ThemeContext';
import { SPACING } from '../constants/theme';
import { ArrowLeft, Key, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { APP_LINKS } from '../constants/links';
import { t } from '../i18n';
import { BannerAdComponent } from '../services/AdManager';
import { Alert } from '../utils/alertUtils';


export default function GroqApiScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const uiLanguage = useAppStore((state) => state.uiLanguage);

  const userProfile = useAppStore((state) => state.userProfile);
  const setUserProfile = useAppStore((state) => state.setUserProfile);

  const [apiKey, setApiKey] = useState(userProfile?.groqApiKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (userProfile?.groqApiKey) {
      setApiKey(userProfile.groqApiKey);
    }
  }, [userProfile?.groqApiKey]);

  const handleSaveKey = () => {
    const trimmed = apiKey.trim();
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        groqApiKey: trimmed,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const handleClearKey = () => {
    Alert.alert(
      t('settings.groqApiKeySection'),
      t('settings.resetDataConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            setApiKey('');
            if (userProfile) {
              setUserProfile({
                ...userProfile,
                groqApiKey: '',
              });
            }
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
            <ArrowLeft color={colors.textPrimary} size={22} />
          </Pressable>
          <View style={{ alignItems: 'center' }}>
            <Typography variant="h2" style={{ fontFamily: 'Outfit-Bold' }}>{t('groq.setupTitle')}</Typography>
            <Typography variant="caption" color={colors.subtext}>{t('groq.setupSubtitle')}</Typography>
          </View>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* CARD 1: WHY CUSTOM AI */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconCircle, { backgroundColor: colors.surface }]}>
                <Sparkles size={20} color={colors.primary} />
              </View>
              <Typography variant="h3" style={{ fontFamily: 'Outfit-Bold', marginLeft: 10 }}>
                {t('groq.setupTitle')}
              </Typography>
            </View>
            <Typography variant="bodyMedium" color={colors.subtext} style={{ lineHeight: 22, marginTop: 4 }}>
              {t('groq.setupSubtitle')}
            </Typography>
          </View>

          {/* CARD 2: HOW TO GET A FREE KEY */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Typography variant="h3" style={{ fontFamily: 'Outfit-Bold', marginBottom: 12 }}>
              {t('groq.getKeyTitle')}
            </Typography>

            {/* Step 1 */}
            <View style={styles.stepRow}>
              <View style={[styles.stepBadge, { backgroundColor: colors.primary }]}>
                <Typography variant="caption" color={colors.primaryText} style={{ fontFamily: 'Outfit-Bold' }}>1</Typography>
              </View>
              <View style={{ flex: 1 }}>
                <Typography variant="bodyMedium">
                  {t('groq.getKeyStep1')}
                </Typography>
              </View>
            </View>

            {/* Step 2 */}
            <View style={styles.stepRow}>
              <View style={[styles.stepBadge, { backgroundColor: colors.primary }]}>
                <Typography variant="caption" color={colors.primaryText} style={{ fontFamily: 'Outfit-Bold' }}>2</Typography>
              </View>
              <View style={{ flex: 1 }}>
                <Typography variant="bodyMedium">
                  {t('groq.getKeyStep2')}
                </Typography>
              </View>
            </View>

            {/* Step 3 */}
            <View style={styles.stepRow}>
              <View style={[styles.stepBadge, { backgroundColor: colors.primary }]}>
                <Typography variant="caption" color={colors.primaryText} style={{ fontFamily: 'Outfit-Bold' }}>3</Typography>
              </View>
              <View style={{ flex: 1 }}>
                <Typography variant="bodyMedium">
                  {t('groq.getKeyStep3')}
                </Typography>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [styles.openGroqBtn, { backgroundColor: colors.surface }, pressed && { opacity: 0.8 }]}
              onPress={() => Linking.openURL(APP_LINKS.groqConsole)}
            >
              <ExternalLink size={16} color={colors.primary} />
              <Typography variant="bodySmall" color={colors.primary} style={{ fontFamily: 'Outfit-Bold', marginLeft: 6 }}>
                console.groq.com
              </Typography>
            </Pressable>
          </View>

          {/* CARD 3: ENTER & SAVE API KEY */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconCircle, { backgroundColor: colors.surface }]}>
                <Key size={20} color={colors.primary} />
              </View>
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Typography variant="h3" style={{ fontFamily: 'Outfit-Bold' }}>
                  {t('settings.groqApiKeySection')}
                </Typography>
              </View>
            </View>

            <InputField
              label={t('settings.groqApiKeySection')}
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry={true}
              placeholder={t('settings.apiKeyPlaceholder')}
            />

            {savedSuccess && (
              <Typography variant="caption" color={colors.primary} style={{ fontFamily: 'Outfit-Bold', marginBottom: 10 }}>
                ✓ {t('groq.savedSuccess')}
              </Typography>
            )}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <Button
                title={savedSuccess ? `✓ ${t('common.done')}` : t('common.save')}
                variant="primary"
                onPress={handleSaveKey}
                style={{ flex: 1 }}
              />
              {apiKey.length > 0 && (
                <Button
                  title={t('common.cancel')}
                  variant="outline"
                  onPress={handleClearKey}
                  style={{ borderColor: colors.border }}
                />
              )}
            </View>
          </View>

          {/* Privacy Guarantee Note */}
          <View style={[styles.privacyBox, { backgroundColor: colors.surface }]}>
            <ShieldCheck size={18} color={colors.primary} />
            <Typography variant="caption" color={colors.subtext} style={{ marginLeft: 8, flex: 1, lineHeight: 16 }}>
              {t('groq.securityNotice')}
            </Typography>
          </View>


        </ScrollView>
      </KeyboardAvoidingView>
      <BannerAdComponent screen="groq-api" />
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
    paddingBottom: 100,
    gap: SPACING.md,
  },
  card: {
    padding: SPACING.lg,
    borderRadius: 20,
    borderWidth: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  openGroqBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  privacyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
  },
});
