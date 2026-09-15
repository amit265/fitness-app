import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { Typography } from '../components/Typography';
import { SPACING } from '../constants/theme';
import { MovementLibrary } from '../components/library/MovementLibrary';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { ScreenContainer } from '../components/ScreenContainer';

export default function MovementLibraryModal() {
  const { colors } = useAppTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Typography variant="h2" style={styles.headerTitle}>Exercise Bank</Typography>
        <Pressable 
          onPress={() => router.back()} 
          style={({ pressed }) => [
            styles.closeBtn,
            { backgroundColor: colors.surface },
            pressed && { opacity: 0.8 }
          ]}
        >
          <X size={20} color={colors.textPrimary} />
        </Pressable>
      </View>
      <ScreenContainer contentStyle={{ paddingBottom: 100 }}>
        <MovementLibrary />
      </ScreenContainer>
    </View>
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
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    flex: 1,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 20,
    marginLeft: SPACING.md,
  },
});
