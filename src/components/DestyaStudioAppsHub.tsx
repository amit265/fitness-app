import React from 'react';
import { View, StyleSheet, Pressable, Image, Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Typography } from './Typography';
import { Card } from './Card';
import { SPACING } from '../constants/theme';
import { ExternalLink } from 'lucide-react-native';
import { logAnalyticsEvent } from '../services/analyticsService';
import { useAppTheme } from '../context/ThemeContext';
import { t } from '../i18n';
import rawAppData from '../../assets/appData.json';

interface AppItem {
  name: string;
  description: string;
  icon: string;
  androidUrl: string;
  iosUrl: string;
  isAvailableOnIOS: boolean;
  show: boolean;
}

export const DestyaStudioAppsHub: React.FC = () => {
  const { colors } = useAppTheme();

  const activeApps = (rawAppData as AppItem[]).filter((app) => app.show !== false);

  const handleOpenApp = async (app: AppItem) => {
    const targetUrl = Platform.OS === 'ios' && app.iosUrl ? app.iosUrl : (app.androidUrl || app.iosUrl);
    const slug = app.name.toLowerCase().replace(/[^a-z0-9]/g, '_');

    try {
      await AsyncStorage.setItem(`ds_cross_promo_${slug}_clicked`, 'true');
      logAnalyticsEvent('cross_promo_clicked', { target_app: app.name });
    } catch (e) {}

    if (targetUrl) {
      Linking.openURL(targetUrl).catch((err) =>
        console.warn('Failed to open Destya Studio app link:', err)
      );
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <Typography variant="h3" >
          {t('crossPromo.moreFromDestya')}
        </Typography>
        <Typography variant="caption" color={colors.primary} >
          {t('crossPromo.appsCount', { count: activeApps.length })}
        </Typography>
      </View>
      <Typography variant="caption" color={colors.textSecondary} style={{ marginBottom: SPACING.md }}>
        {t('crossPromo.subtitle')}
      </Typography>

      <View style={styles.appList}>
        {activeApps.map((app, index) => (
          <Pressable
            key={`app-${index}-${app.name}`}
            style={({ pressed }) => [
              styles.appItem,
              { backgroundColor: colors.surface },
              pressed && styles.appItemPressed,
            ]}
            onPress={() => handleOpenApp(app)}
          >
            <Image source={{ uri: app.icon }} style={[styles.appIcon, { backgroundColor: colors.border }]} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Typography variant="bodySmall" >
                {app.name}
              </Typography>
              <Typography variant="caption" color={colors.textSecondary} numberOfLines={2} style={{ marginTop: 2 }}>
                {app.description}
              </Typography>
            </View>
            <ExternalLink color={colors.primary} size={16} style={{ marginLeft: 6 }} />
          </Pressable>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  appList: {
    gap: 10,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
  },
  appItemPressed: {
    opacity: 0.7,
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
});

