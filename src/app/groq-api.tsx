import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../components/Typography';
import { Button } from '../components/Button';
import { InputField } from '../components/InputField';
import { useAppStore } from '../store/useAppStore';
import { useAppTheme } from '../context/ThemeContext';
import { SPACING } from '../constants/theme';
import { ArrowLeft, Key, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { BannerAdComponent } from '../services/AdManager';

export default function GroqApiScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();

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
      'Remove Groq API Key?',
      'Are you sure you want to remove your custom Groq API Key? The app will revert to local offline intelligence.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove Key',
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
            <Typography variant="h2" style={{ fontFamily: 'Outfit-Bold' }}>Custom AI Setup</Typography>
            <Typography variant="caption" color={colors.subtext}>Groq Cloud AI Engine</Typography>
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
                Why Add Your Own AI Key?
              </Typography>
            </View>
            <Typography variant="bodyMedium" color={colors.subtext} style={{ lineHeight: 22, marginTop: 4 }}>
              Sini AI comes with a built-in offline smart engine. Adding your own free <Typography variant="bodyMedium" color={colors.primary} style={{ fontFamily: 'Outfit-Bold' }}>Groq API Key</Typography> enables hyper-fast, natural language food logging, dynamic meal estimations, and personal cycle-aware fitness advice!
            </Typography>
          </View>

          {/* CARD 2: HOW TO GET A FREE KEY */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Typography variant="h3" style={{ fontFamily: 'Outfit-Bold', marginBottom: 12 }}>
              How to Get a Free Groq Key
            </Typography>

            {/* Step 1 */}
            <View style={styles.stepRow}>
              <View style={[styles.stepBadge, { backgroundColor: colors.primary }]}>
                <Typography variant="caption" color={colors.primaryText} style={{ fontFamily: 'Outfit-Bold' }}>1</Typography>
              </View>
              <View style={{ flex: 1 }}>
                <Typography variant="bodyMedium">
                  Visit{' '}
                  <Typography
                    variant="bodyMedium"
                    color={colors.primary}
                    style={{ fontFamily: 'Outfit-Bold', textDecorationLine: 'underline' }}
                    onPress={() => Linking.openURL('https://console.groq.com/keys')}
                  >
                    console.groq.com/keys
                  </Typography>
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
                  Sign up or log in using your Google account (100% Free Developer Tier).
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
                  Tap <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold' }}>"Create API Key"</Typography>, name it "Sini AI", and copy the generated key (starts with <Typography variant="bodyMedium" style={{ fontFamily: 'Outfit-Bold' }}>gsk_</Typography>).
                </Typography>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [styles.openGroqBtn, { backgroundColor: colors.surface }, pressed && { opacity: 0.8 }]}
              onPress={() => Linking.openURL('https://console.groq.com/keys')}
            >
              <ExternalLink size={16} color={colors.primary} />
              <Typography variant="bodySmall" color={colors.primary} style={{ fontFamily: 'Outfit-Bold', marginLeft: 6 }}>
                Open console.groq.com in Browser
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
                  Save Your API Key
                </Typography>
                <Typography variant="caption" color={userProfile?.groqApiKey ? colors.primary : colors.subtext}>
                  {userProfile?.groqApiKey ? '✓ Custom Groq Key Connected' : 'Stored securely on device only'}
                </Typography>
              </View>
            </View>

            <InputField
              label="Groq API Key (starts with gsk_)"
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry={true}
              placeholder="gsk_yourApiKeyHere"
            />

            {savedSuccess && (
              <Typography variant="caption" color={colors.primary} style={{ fontFamily: 'Outfit-Bold', marginBottom: 10 }}>
                ✓ API Key Saved Successfully!
              </Typography>
            )}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <Button
                title={savedSuccess ? 'Saved! ✓' : 'Save Key'}
                variant="primary"
                onPress={handleSaveKey}
                style={{ flex: 1 }}
              />
              {apiKey.length > 0 && (
                <Button
                  title="Clear"
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
              Your API key is saved locally in private app storage. It is never sent to external tracking servers or third parties.
            </Typography>
          </View>

          {/* Sticky Bottom Ad */}
          <View style={{ alignItems: 'center', marginTop: SPACING.md }}>
            <BannerAdComponent />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
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
