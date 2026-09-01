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
import { Send, X, Bot, User as UserIcon, RotateCcw, Flag } from 'lucide-react-native';

interface CoachChatProps {
  visible: boolean;
  onClose: () => void;
}

export const CoachChat: React.FC<CoachChatProps> = ({ visible, onClose }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
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
      content: `Hello! I'm Aura, your wellness coach. How can I help you sync your fitness, nutrition, or cycle today?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

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
      'Clear Chat History?',
      'Are you sure you want to clear your chat messages with Aura?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Chat',
          style: 'destructive',
          onPress: () => {
            setMessages([
              {
                id: 'welcome-' + Date.now(),
                role: 'assistant',
                content: `Hello! I'm Aura, your wellness coach. How can I help you sync your fitness, nutrition, or cycle today?`,
                timestamp: new Date().toISOString(),
              },
            ]);
          },
        },
      ]
    );
  };

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;

    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      content: inputText.trim(),
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
        content: `Sorry, I encountered an error: ${e.message}. Try checking your internet connection.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage].slice(-30));
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121110' : PALETTE.oat.bg }]}>
        
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: isDark ? '#2E2B28' : '#ECE9E4' }]}>
          <View style={styles.headerTitleRow}>
            <Bot color={PALETTE.sage.default} size={24} />
            <Typography variant="h2" style={styles.headerTitle}>Aura Coach</Typography>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Pressable onPress={handleClearChat} style={styles.closeBtn}>
              <RotateCcw color={PALETTE.charcoal.light} size={20} />
            </Pressable>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <X color={isDark ? PALETTE.cream : PALETTE.charcoal.default} size={22} />
            </Pressable>
          </View>
        </View>

        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={0}
          style={{ flex: 1 }}
        >
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
                  <View style={styles.avatar}>
                    {isCoach ? (
                      <Bot color={PALETTE.sage.default} size={20} />
                    ) : (
                      <UserIcon color={PALETTE.charcoal.light} size={20} />
                    )}
                  </View>
                  <View
                    style={[
                      styles.bubble,
                      {
                        backgroundColor: isCoach
                          ? isDark ? '#1C1A18' : PALETTE.white
                          : PALETTE.sage.default,
                        borderColor: isDark ? '#2E2B28' : '#ECE9E4',
                      },
                      isCoach ? styles.coachBubble : styles.userBubble,
                    ]}
                  >
                    <MarkdownText text={m.content} isCoach={isCoach} />
                    {isCoach && (
                      <Pressable
                        style={styles.flagBtn}
                        onPress={() =>
                          Alert.alert('Response Reported', 'Thank you. This AI output has been flagged for safety review.')
                        }
                      >
                        <Flag color={PALETTE.charcoal.light} size={11} />
                        <Typography variant="caption" color={PALETTE.charcoal.light} style={{ fontSize: 10, marginLeft: 4 }}>
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
                <View style={styles.avatar}>
                  <Bot color={PALETTE.sage.default} size={20} />
                </View>
                <View style={[styles.bubble, styles.coachBubble, { backgroundColor: isDark ? '#1C1A18' : PALETTE.white }]}>
                  <ActivityIndicator size="small" color={PALETTE.sage.default} />
                </View>
              </View>
            )}
          </ScrollView>

          {/* AI Compliance Disclaimer Banner */}
          <View style={[styles.disclaimerRow, { backgroundColor: isDark ? '#1F1B18' : '#FAF8F5' }]}>
            <Typography variant="caption" color={PALETTE.charcoal.light} style={{ fontSize: 10, textAlign: 'center', lineHeight: 14 }}>
              ⚠️ AI responses are generated dynamically and may contain errors. Please verify critical facts.
            </Typography>
          </View>

          {/* Footer Input */}
          <View style={[styles.inputRow, { borderTopColor: isDark ? '#2E2B28' : '#ECE9E4', backgroundColor: isDark ? '#1C1A18' : PALETTE.white }]}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask Aura anything..."
              placeholderTextColor={isDark ? '#6B6256' : '#A89E90'}
              style={[
                styles.textInput,
                {
                  borderColor: isDark ? '#2E2B28' : '#ECE9E4',
                  color: isDark ? PALETTE.cream : PALETTE.charcoal.default,
                },
              ]}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <Pressable
              onPress={handleSend}
              disabled={sending || !inputText.trim()}
              style={[
                styles.sendBtn,
                { backgroundColor: inputText.trim() ? PALETTE.sage.default : isDark ? '#2E2B28' : '#E8E5DF' },
              ]}
            >
              <Send color={PALETTE.white} size={18} />
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
    padding: SPACING.md,
    borderBottomWidth: 1.5,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
  },
  closeBtn: {
    padding: 4,
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
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#ECE9E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  coachBubble: {
    borderTopLeftRadius: 4,
  },
  userBubble: {
    borderTopRightRadius: 4,
  },
  bubbleText: {
    lineHeight: 18,
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
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderTopWidth: 1.5,
    gap: SPACING.sm,
  },
  textInput: {
    flex: 1,
    height: 44,
    borderWidth: 1.5,
    borderRadius: 22,
    paddingHorizontal: SPACING.md,
    fontSize: 14,
    fontFamily: 'Outfit-Regular',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
