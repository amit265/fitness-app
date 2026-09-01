import React from 'react';
import { View, StyleSheet, Pressable, Image, Linking } from 'react-native';
import { Typography } from './Typography';
import { Card } from './Card';
import { PALETTE, SPACING } from '../constants/theme';
import { ExternalLink } from 'lucide-react-native';

const DESTYA_STUDIO_APPS = [
  {
    slug: 'spin-the-wheel',
    name: 'Spin the Wheel : Pick for me',
    description: 'Spin the wheel to decide fun topics, games, meals, or challenges!',
    icon: 'https://destyastudio.com/_next/image?url=%2Fapps%2Fspin-the-wheel%2Ficon.png&w=128&q=75',
    url: 'https://destyastudio.com/products/spin-the-wheel',
  },
  {
    slug: 'code-respite',
    name: 'CodeRespite: Tech Refresh',
    description: 'Refresh your coding & tech knowledge with quick, fun daily cards!',
    icon: 'https://destyastudio.com/_next/image?url=%2Fapps%2Fcode-respite%2Ficon.png&w=128&q=75',
    url: 'https://destyastudio.com/products/code-respite',
  },
  {
    slug: 'question-games',
    name: 'AI Icebreaker: Question Games',
    description: 'Deep & fun question games for couples, friends, and parties!',
    icon: 'https://destyastudio.com/_next/image?url=%2Fapps%2Fquestion-games%2Ficon.png&w=128&q=75',
    url: 'https://destyastudio.com/products/question-games',
  },
  {
    slug: 'cheezylines',
    name: 'Cheesy Lines: So Bad, It Works',
    description: 'Hilarious, witty, and smooth pickup lines & icebreakers!',
    icon: 'https://destyastudio.com/_next/image?url=%2Fapps%2Fcheezylines%2Ficon.png&w=128&q=75',
    url: 'https://destyastudio.com/products/cheezylines',
  },
  {
    slug: 'trivia-quest-ai',
    name: 'Trivia Quest AI: Fun Quiz',
    description: 'AI-generated trivia games and knowledge challenges across any topic!',
    icon: 'https://destyastudio.com/_next/image?url=%2Fapps%2Ftrivia-quest-ai%2Ficon.png&w=128&q=75',
    url: 'https://destyastudio.com/products/trivia-quest-ai',
  },
];

export const DestyaStudioAppsHub: React.FC = () => {
  const handleOpenApp = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.warn('Failed to open Destya Studio app link:', err)
    );
  };

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <Typography variant="h3" style={{ fontFamily: 'Outfit-Bold' }}>
          More from Destya Studio
        </Typography>
        <Typography variant="caption" color={PALETTE.sage.default} style={{ fontFamily: 'Outfit-Bold' }}>
          5 APPS
        </Typography>
      </View>
      <Typography variant="caption" color={PALETTE.charcoal.light} style={{ marginBottom: SPACING.md }}>
        Discover our suit of productivity, social, and entertainment mobile apps.
      </Typography>

      <View style={styles.appList}>
        {DESTYA_STUDIO_APPS.map((app) => (
          <Pressable
            key={app.slug}
            style={({ pressed }) => [styles.appItem, pressed && styles.appItemPressed]}
            onPress={() => handleOpenApp(app.url)}
          >
            <Image source={{ uri: app.icon }} style={styles.appIcon} defaultSource={{ uri: 'https://destyastudio.com/favicon.ico' }} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Typography variant="bodySmall" style={{ fontFamily: 'Outfit-Bold' }}>
                {app.name}
              </Typography>
              <Typography variant="caption" color={PALETTE.charcoal.light} numberOfLines={2} style={{ marginTop: 2 }}>
                {app.description}
              </Typography>
            </View>
            <ExternalLink color={PALETTE.sage.default} size={16} style={{ marginLeft: 6 }} />
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
    backgroundColor: '#F5F3EF',
  },
  appItemPressed: {
    opacity: 0.7,
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E2DFD8',
  },
});
