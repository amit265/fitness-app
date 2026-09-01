import React from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme, Platform } from 'react-native';
import { Sparkles, PlusCircle, TrendingUp, Calendar, User } from 'lucide-react-native';
import { PALETTE } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const bottomMargin = Math.max(insets.bottom, 16);

  return (
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
        options={{
          title: 'Log',
          tabBarIcon: ({ color, size }) => <PlusCircle color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => <TrendingUp color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
