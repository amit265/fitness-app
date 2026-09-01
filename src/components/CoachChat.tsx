import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  useColorScheme,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Typography } from './Typography';
import { MarkdownText } from './MarkdownText';
import { SiniAvatar } from './SiniAvatar';
import { useAppStore } from '../store/useAppStore';
import { getCycleState } from '../domain/cycle/cycleEngine';
import { calculateReadinessScore } from '../domain/readiness/readinessEngine';
import { getDailyCalorieBalance } from '../domain/calories/calorieEngine';
import { analyzeEatingPatterns } from '../domain/calories/eatingPatternEngine';
import { getTodayStr, diffInDays } from '../utils/date';
import { answerCoachQuestion } from '../services/ai/aiService';
import { ChatMessage, CoachingContext } from '../types';
import { PALETTE, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, X, User as UserIcon, RotateCcw, Flag, Sparkles } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';

interface CoachChatProps {
  visible: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const QUICK_ACTIONS = [
  'Log food',
  'Plan dinner',
  'Plan workout',
  'Explain my calories',
  'How am I doing?',
];

export const CoachChat: React.FC<CoachChatProps> = ({ visible, onClose, initialQuery }) => {
  const { colors, isDark } = useAppTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  // Store data
  const userProfile = useAppStore((state) => state.userProfile);
  const cyclePreferences = useAppStore((state) => state.cyclePreferences);
  const periods = useAppStore((state) => state.periods);
  const dailyCheckIns = useAppStore((state) => state.dailyCheckIns);
  const activities = useAppStore((state) => state.activities);
  const meals = useAppStore((state) => state.meals);
  const measurements = useAppStore((state) => state.measurements);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm Sini, your cycle-aware fitness companion. How can I support your nutrition, movement, or cycle today?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  // Handle initial query if provided when modal opens
  useEffect(() => {
    if (visible && initialQuery && initialQuery.trim()) {
      handleSendText(initialQuery);
    }
  }, [visible, initialQuery]);

  // Auto scroll to bottom
  useEffect(() => {
    if (visible) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [visible, messages]);

  // Compute Coaching Context
  const getContext = (): CoachingContext => {
    const today = getTodayStr();
    const cycleState = getCycleState(periods, cyclePreferences, today);
    const checkIn = dailyCheckIns[today] || null;

    const todayActivities = activities.filter(
      (act) => diffInDays(today, act.timestamp.split('T')[0]) === 0
    );
    const recentWorkoutMinutes = todayActivities.reduce((sum, act) => sum + act.durationMinutes, 0);

    const readiness = calculateReadinessScore(
      checkIn,
      cycleState,
      todayActivities,
      userProfile?.weightGoal
    );

    const calBalance = getDailyCalorieBalance(today, meals, activities, userProfile, measurements);
    const todayMeals = meals.filter((m) => m.timestamp.split('T')[0] === today);
    const loggedMealsSummary = todayMeals.map((m) => `${m.name} (${m.calories} kcal)`).join(', ') || 'None logged yet';
    const loggedWorkoutsSummary = todayActivities.map((a) => `${a.type} ${a.durationMinutes}m`).join(', ') || 'None logged yet';

    const eatingPattern = analyzeEatingPatterns(meals, userProfile);

    return {
      userGoal: userProfile?.weightGoal || 'wellness',
      cycleState,
      readinessScore: readiness.score,
      sleepDuration: checkIn?.sleepDuration ?? 8,
      sleepQuality: checkIn?.sleepQuality ?? 4,
      energy: checkIn?.energy ?? 3,
      stress: checkIn?.stress ?? 2,
      hydration: checkIn?.hydration ?? 1.5,
      symptoms: checkIn?.symptoms ?? [],
      recentWorkoutMinutes,
      targetCalories: calBalance.targetCalories,
      consumedCalories: calBalance.consumedCalories,
      remainingCalories: calBalance.remainingCalories,
      activityCalories: calBalance.activityCalories,
      loggedMealsSummary,
      loggedWorkoutsSummary,
      regionalCuisine: userProfile?.regionalCuisine || 'general',
      dietaryPreference: userProfile?.dietaryPreference || 'anything',
      eatingPatternSummary: eatingPattern.summaryText,
    };
  };

  const handleClearChat = () => {
    Alert.alert(
      'Clear Conversation?',
      'Would you like to reset your chat history with Sini?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setMessages([
              {
                id: 'welcome-' + Date.now(),
                role: 'assistant',
                content: `Hello! I'm Sini, your cycle-aware fitness companion. How can I support your nutrition, movement, or cycle today?`,
                timestamp: new Date().toISOString(),
              },
            ]);
          },
        },
      ]
    );
  };

  const handleSendText = async (textToSend: string) => {
    if (!textToSend.trim() || sending) return;

    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage].slice(-30));
    setInputText('');
    setSending(true);

    try {
      const context = getContext();
      const currentHistory = [...messages, userMessage];

      const response = await answerCoachQuestion(
        userMessage.content,
        currentHistory,
        context,
        userProfile?.groqApiKey
      );

      const assistantMessage: ChatMessage = {
        id: Math.random().toString(36).substring(7),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage].slice(-30));
    } catch (e: any) {
      const errorMessage: ChatMessage = {
        id: Math.random().toString(36).substring(7),
        role: 'assistant',
        content: `I'm having trouble connecting right now. Let's try again in a moment.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage].slice(-30));
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <StatusBar style={colors.statusBar.content} />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
          <View style={styles.headerTitleRow}>
            <SiniAvatar size={38} variant="plum" />
            <View>
              <Typography variant="h2" style={styles.headerTitle}>Sini</Typography>
              <Typography variant="caption" color={colors.subtext}>Your cycle-aware fitness companion</Typography>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Pressable onPress={handleClearChat} style={styles.iconBtn}>
              <RotateCcw color={colors.subtext} size={20} />
            </Pressable>
            <Pressable onPress={onClose} style={styles.iconBtn}>
              <X color={colors.text} size={22} />
            </Pressable>
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          {/* Quick Action Chips Horizontal Bar */}
          <View style={[styles.quickActionsContainer, { borderBottomColor: colors.border }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsScroll}>
              {QUICK_ACTIONS.map((action, idx) => (
                <Pressable
                  key={idx}
                  style={({ pressed }) => [
                    styles.actionChip,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    pressed && styles.pressedChip,
                  ]}
                  onPress={() => handleSendText(action)}
                >
                  <Sparkles size={13} color={colors.primary} style={{ marginRight: 5 }} />
                  <Typography variant="caption" color={colors.primary} style={{ fontWeight: '600' }}>
                    {action}
                  </Typography>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Message Thread */}
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.chatScroll}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((m) => {
              const isCoach = m.role === 'assistant';
              return (
                <View
                  key={m.id}
                  style={[
                    styles.messageRow,
                    isCoach ? styles.coachRow : styles.userRow,
                  ]}
                >
                  <View style={styles.avatarWrap}>
                    {isCoach ? (
                      <SiniAvatar size={28} variant="plum" />
                    ) : (
                      <View style={[styles.userAvatar, { backgroundColor: colors.surface }]}>
                        <UserIcon color={colors.primary} size={16} />
                      </View>
                    )}
                  </View>
                  <View
                    style={[
                      styles.bubble,
                      {
                        backgroundColor: isCoach
                          ? colors.card
                          : colors.primary,
                        borderColor: isCoach ? colors.border : colors.primary,
                      },
                      isCoach ? styles.coachBubble : styles.userBubble,
                    ]}
                  >
                    <MarkdownText text={m.content} isCoach={isCoach} />
                    {isCoach && (
                      <Pressable
                        style={styles.flagBtn}
                        onPress={() =>
                          Alert.alert('Response Reported', 'Thank you. Sini AI output feedback has been submitted.')
                        }
                      >
                        <Flag color={colors.subtext} size={11} />
                        <Typography variant="caption" color={colors.subtext} style={{ fontSize: 10, marginLeft: 4 }}>
                          Report Output
                        </Typography>
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            })}
            {sending && (
              <View style={[styles.messageRow, styles.coachRow]}>
                <SiniAvatar size={28} variant="plum" />
                <View style={[styles.bubble, styles.coachBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              </View>
            )}
          </ScrollView>

          {/* AI Compliance Disclaimer Banner */}
          <View style={[styles.disclaimerRow, { backgroundColor: colors.surface }]}>
            <Typography variant="caption" color={colors.subtext} style={{ fontSize: 10, textAlign: 'center', lineHeight: 14 }}>
              Sini AI provides empathetic coaching & guidance. Not medical diagnosis.
            </Typography>
          </View>

          {/* Footer Input */}
          <View style={[styles.inputRow, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask Sini about your nutrition, cycle, or workout..."
              placeholderTextColor={colors.subtext}
              style={[
                styles.textInput,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.bg,
                },
              ]}
              onSubmitEditing={() => handleSendText(inputText)}
              returnKeyType="send"
            />
            <Pressable
              onPress={() => handleSendText(inputText)}
              disabled={sending || !inputText.trim()}
              style={({ pressed }) => [
                styles.sendBtn,
                { backgroundColor: inputText.trim() ? colors.primary : colors.border },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Send color={inputText.trim() ? colors.primaryText : colors.subtext} size={18} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontFamily: 'Outfit-Bold',
    fontSize: 20,
    lineHeight: 24,
  },
  iconBtn: {
    padding: 6,
  },
  quickActionsContainer: {
    borderBottomWidth: 1,
    paddingVertical: SPACING.xs + 2,
  },
  quickActionsScroll: {
    paddingHorizontal: SPACING.md,
    gap: 8,
    alignItems: 'center',
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
  },
  pressedChip: {
    opacity: 0.75,
  },
  chatScroll: {
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    maxWidth: '85%',
    gap: 8,
  },
  coachRow: {
    alignSelf: 'flex-start',
  },
  userRow: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  avatarWrap: {
    marginTop: 2,
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  coachBubble: {
    borderTopLeftRadius: 4,
  },
  userBubble: {
    borderTopRightRadius: 4,
  },
  flagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    alignSelf: 'flex-start',
    opacity: 0.7,
  },
  disclaimerRow: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderTopWidth: 1,
    gap: SPACING.sm,
  },
  textInput: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderRadius: 23,
    paddingHorizontal: SPACING.md,
    fontSize: 14,
    fontFamily: 'Outfit-Regular',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
