import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  Modal,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Typography } from './Typography';
import { useAppTheme } from '../context/ThemeContext';
import { SPACING } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import { getTodayStr } from '../utils/date';
import { Droplets } from 'lucide-react-native';

// Auto-dismiss countdown duration in seconds
const AUTO_DISMISS_SECONDS = 8;

// Quick-select amounts in litres
const QUICK_AMOUNTS = [
  { label: '250ml', value: 0.25 },
  { label: '500ml', value: 0.5 },
  { label: '750ml', value: 0.75 },
  { label: '1L', value: 1.0 },
];

const WINDOW_MESSAGES: Record<string, { emoji: string; message: string }> = {
  morning: { emoji: '🌅', message: 'Start your day hydrated!' },
  midday: { emoji: '🍵', message: 'Lunchtime hydration check' },
  afternoon: { emoji: '💧', message: 'Afternoon energy boost' },
  evening: { emoji: '🌙', message: 'Evening wind-down sip' },
};

interface WaterReminderModalProps {
  visible: boolean;
  windowKey: string; // e.g. 'morning', 'midday', 'afternoon', 'evening'
  onClose: () => void;
}

export const WaterReminderModal: React.FC<WaterReminderModalProps> = ({
  visible,
  windowKey,
  onClose,
}) => {
  const { colors } = useAppTheme();
  const setDailyCheckIn = useAppStore((state) => state.setDailyCheckIn);
  const dailyCheckIns = useAppStore((state) => state.dailyCheckIns);
  const todayStr = getTodayStr();
  const todayCheckIn = dailyCheckIns[todayStr] || null;

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(AUTO_DISMISS_SECONDS);
  const [logged, setLogged] = useState(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Current total hydration today
  const currentHydration = todayCheckIn?.hydration ?? 0;

  const windowInfo = WINDOW_MESSAGES[windowKey] || WINDOW_MESSAGES.midday;

  // Slide in when visible
  useEffect(() => {
    if (visible) {
      setSelectedAmount(null);
      setLogged(false);
      setCountdown(AUTO_DISMISS_SECONDS);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 10,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(300);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  // Countdown auto-dismiss
  useEffect(() => {
    if (!visible || logged) return;
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [visible, logged]);

  const handleLog = () => {
    const amount = selectedAmount ?? 0.5; // default 500ml
    const newTotal = parseFloat((currentHydration + amount).toFixed(2));
    setDailyCheckIn(todayStr, {
      sleepDuration: todayCheckIn?.sleepDuration ?? 8,
      sleepQuality: todayCheckIn?.sleepQuality ?? 4,
      energy: todayCheckIn?.energy ?? 3,
      stress: todayCheckIn?.stress ?? 2,
      hydration: newTotal,
      mood: todayCheckIn?.mood ?? 'good',
      symptoms: todayCheckIn?.symptoms ?? [],
    });
    if (countdownRef.current) clearInterval(countdownRef.current);
    setLogged(true);
    setTimeout(onClose, 1200); // brief success pause then close
  };

  // SVG countdown ring
  const ringSize = 36;
  const ringRadius = 14;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringProgress = countdown / AUTO_DISMISS_SECONDS;
  const ringDashoffset = ringCircumference - ringProgress * ringCircumference;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.sheet,
            { backgroundColor: colors.card, borderColor: colors.border },
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Header row */}
          <View style={styles.headerRow}>
            <View style={[styles.iconBubble, { backgroundColor: '#E8F4FD' }]}>
              <Droplets size={22} color="#2196F3" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Typography variant="h3" style={{ fontSize: 16 }}>
                {windowInfo.emoji} {windowInfo.message}
              </Typography>
              <Typography variant="caption" color={colors.subtext}>
                You&apos;ve had {currentHydration.toFixed(2)}L today
              </Typography>
            </View>
            {/* Countdown ring */}
            {!logged && (
              <Svg width={ringSize} height={ringSize}>
                <Circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={ringRadius}
                  stroke={colors.border}
                  strokeWidth={3}
                  fill="transparent"
                />
                <Circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={ringRadius}
                  stroke="#2196F3"
                  strokeWidth={3}
                  strokeDasharray={`${ringCircumference}`}
                  strokeDashoffset={ringDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
                />
              </Svg>
            )}
          </View>

          {logged ? (
            <View style={styles.successRow}>
              <Typography variant="h3" color="#2196F3" style={{ textAlign: 'center' }}>
                ✓ Logged! Great job staying hydrated 💙
              </Typography>
            </View>
          ) : (
            <>
              {/* Quick amounts */}
              <View style={styles.amountsRow}>
                {QUICK_AMOUNTS.map((item) => (
                  <Pressable
                    key={item.value}
                    onPress={() => setSelectedAmount(item.value)}
                    style={({ pressed }) => [
                      styles.amountBtn,
                      {
                        backgroundColor:
                          selectedAmount === item.value
                            ? '#2196F3'
                            : colors.surface,
                        borderColor:
                          selectedAmount === item.value
                            ? '#2196F3'
                            : colors.border,
                      },
                      pressed && { opacity: 0.75 },
                    ]}
                  >
                    <Typography
                      variant="bodyMedium"
                      style={{ fontWeight: '700' }}
                      color={
                        selectedAmount === item.value
                          ? '#FFFFFF'
                          : colors.text
                      }
                    >
                      {item.label}
                    </Typography>
                  </Pressable>
                ))}
              </View>

              {/* Action buttons */}
              <View style={styles.actionsRow}>
                <Pressable
                  onPress={onClose}
                  style={({ pressed }) => [
                    styles.skipBtn,
                    { borderColor: colors.border },
                    pressed && { opacity: 0.6 },
                  ]}
                >
                  <Typography variant="bodySmall" color={colors.subtext}>
                    Skip
                  </Typography>
                </Pressable>
                <Pressable
                  onPress={handleLog}
                  style={({ pressed }) => [
                    styles.logBtn,
                    { backgroundColor: '#2196F3' },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Droplets size={16} color="#FFFFFF" />
                  <Typography
                    variant="bodyMedium"
                    color="#FFFFFF"
                    style={{ fontWeight: '700', marginLeft: 6 }}
                  >
                    Log {selectedAmount ? `${selectedAmount * 1000}ml` : '500ml'}
                  </Typography>
                </Pressable>
              </View>
            </>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: SPACING.lg,
    paddingBottom: 36,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  amountBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  skipBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 100,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successRow: {
    paddingVertical: SPACING.lg,
  },
});
