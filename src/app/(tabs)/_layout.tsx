import React, { useState, useCallback } from 'react';
import { Tabs, useFocusEffect } from 'expo-router';
import { useColorScheme, Platform, Linking, Pressable, View, StyleSheet, BackHandler } from 'react-native';
import { AppModal as Modal } from '../../components/AppModal';
import { Sparkles, PlusCircle, TrendingUp, Calendar, User } from 'lucide-react-native';
import { PALETTE } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { useAppTheme } from '../../context/ThemeContext';

import { t } from '../../i18n';
import { APP_LINKS } from '../../constants/links';

import { useAppStore } from '../../store/useAppStore';

export default function TabsLayout() {
  const { colors, isDark } = useAppTheme();
  const uiLanguage = useAppStore((state) => state.uiLanguage);
  const insets = useSafeAreaInsets();
  const bottomMargin = Math.max(insets.bottom, 16);
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);

  const webTabListener = {
    tabPress: (e: any) => {
      if (Platform.OS === 'web') {
        // Temporarily disabled for testing
        // e.preventDefault();
        // setDownloadModalVisible(true);
      }
    },
  };

  const handleOpenStore = () => {
    Linking.openURL(APP_LINKS.website).catch((err) =>
      console.warn('Failed to open Destya Studio link:', err)
    );
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        useAppStore.getState().showAlert(
          t('common.exitApp') === 'common.exitApp' ? 'Exit App' : t('common.exitApp'),
          t('common.exitConfirm') === 'common.exitConfirm' ? 'Are you sure you want to exit?' : t('common.exitConfirm'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            { 
              text: t('common.exit') === 'common.exit' ? 'Exit' : t('common.exit'), 
              style: 'destructive', 
              onPress: () => BackHandler.exitApp() 
            }
          ]
        );
        return true; // prevent default behavior (app close)
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  return (
    <>
      <Tabs
        backBehavior="history"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            position: 'absolute',
            bottom: bottomMargin,
            marginHorizontal: 16,
            backgroundColor: colors.card,
            borderTopWidth: 0,
            borderRadius: 24,
            height: 64,
            paddingBottom: 0,
            paddingTop: 0,
            elevation: 12,
            shadowOpacity: 0.1,
            shadowRadius: 16,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 6 },
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontFamily: 'Outfit-Medium',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t('tabs.today'),
            tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="log"
          listeners={webTabListener}
          options={{
            title: t('tabs.log'),
            tabBarIcon: ({ color, size }) => <PlusCircle color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="progress"
          listeners={webTabListener}
          options={{
            title: t('tabs.progress'),
            tabBarIcon: ({ color, size }) => <TrendingUp color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          listeners={webTabListener}
          options={{
            title: t('tabs.profile'),
            tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          }}
        />
      </Tabs>

      {/* Web Preview Gatekeeping Download Modal */}
      <Modal visible={downloadModalVisible} transparent animationType="fade" onRequestClose={() => setDownloadModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setDownloadModalVisible(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Typography variant="h2" style={{ fontFamily: 'Outfit-Bold', marginBottom: 4 }}>
              {t('webModal.title')}
            </Typography>
            <Typography variant="caption" color={colors.subtext} style={{ marginBottom: 16, lineHeight: 18 }}>
              {t('webModal.description')}
            </Typography>

            <View style={{ gap: 8, marginTop: 8 }}>
              <Button title={t('webModal.downloadBtn')} onPress={handleOpenStore} />
              <Button title={t('common.close')} variant="secondary" onPress={() => setDownloadModalVisible(false)} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 24,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
});
