import React, { useState } from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme, Platform, Linking, Modal, Pressable, View, StyleSheet } from 'react-native';
import { Sparkles, PlusCircle, TrendingUp, Calendar, User } from 'lucide-react-native';
import { PALETTE } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const bottomMargin = Math.max(insets.bottom, 16);
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);

  const webTabListener = {
    tabPress: (e: any) => {
      if (Platform.OS === 'web') {
        e.preventDefault();
        setDownloadModalVisible(true);
      }
    },
  };

  const handleOpenStore = () => {
    Linking.openURL('https://destyastudio.com').catch((err) =>
      console.warn('Failed to open Desty Studio link:', err)
    );
  };

  return (
    <>
      <Tabs
        backBehavior="history"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: PALETTE.sage.default,
          tabBarInactiveTintColor: isDark ? '#8D8070' : PALETTE.charcoal.light,
          tabBarStyle: {
            position: 'absolute',
            bottom: bottomMargin,
            marginHorizontal: 16,
            backgroundColor: isDark ? '#1C1A18' : PALETTE.white,
            borderTopWidth: 0,
            borderRadius: 24,
            height: 64,
            paddingBottom: 0,
            paddingTop: 0,
            elevation: 12,
            shadowOpacity: 0.15,
            shadowRadius: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
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
            title: 'Today',
            tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="log"
          listeners={webTabListener}
          options={{
            title: 'Log',
            tabBarIcon: ({ color, size }) => <PlusCircle color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="progress"
          listeners={webTabListener}
          options={{
            title: 'Progress',
            tabBarIcon: ({ color, size }) => <TrendingUp color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          listeners={webTabListener}
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          }}
        />
      </Tabs>

      {/* Web Preview Gatekeeping Download Modal */}
      <Modal visible={downloadModalVisible} transparent animationType="fade" onRequestClose={() => setDownloadModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setDownloadModalVisible(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: isDark ? '#1C1A18' : PALETTE.white }]}>
            <Typography variant="h2" style={{ fontFamily: 'PlayfairDisplay-Bold', marginBottom: 4 }}>
              Get Destya Mobile App
            </Typography>
            <Typography variant="caption" color={PALETTE.charcoal.light} style={{ marginBottom: 16, lineHeight: 18 }}>
              Experience complete offline cycle tracking, Groq AI coaching, progress charts, and personalized daily fitness plans on mobile.
            </Typography>

            <View style={{ gap: 8, marginTop: 8 }}>
              <Button title="📱 Download on Play Store" onPress={handleOpenStore} />
              <Button title=" Download on App Store" variant="outline" onPress={handleOpenStore} />
              <Button title="Continue Web Preview" variant="outline" onPress={() => setDownloadModalVisible(false)} />
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
