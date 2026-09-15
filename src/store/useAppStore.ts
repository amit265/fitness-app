import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserProfile,
  CyclePreferences,
  PeriodLog,
  DailyCheckIn,
  Meal,
  Activity,
  BodyMeasurement,
  CachedDailyInsight,
  AIMonitoringLog,
  CustomFood,
} from '../types';

export interface ActiveWorkoutTimer {
  workoutId: string;
  elapsedSeconds: number;
  status: 'running' | 'paused';
  lastUpdatedDate: string; // "YYYY-MM-DD"
  lastTickTimestamp: number; // Date.now() for accurate background tracking
}

export interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

export interface AlertState {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

interface AppState {
  // State
  userProfile: UserProfile | null;
  cyclePreferences: CyclePreferences | null;
  periods: PeriodLog[];
  dailyCheckIns: Record<string, DailyCheckIn>; // Indexed by YYYY-MM-DD
  meals: Meal[];
  activities: Activity[];
  customFoods: CustomFood[];
  measurements: BodyMeasurement[];
  streak: { currentStreak: number; longestStreak: number; lastActiveDate: string | null };
  uiLanguage: string;

  // AI Governance & Monitoring State
  dailyInsightCache: Record<string, CachedDailyInsight>; // Indexed by YYYY-MM-DD
  aiLogs: AIMonitoringLog[];

  // Global UI State
  alertState: AlertState;
  activeWorkoutTimer: ActiveWorkoutTimer | null;

  // Setters/Actions
  setUiLanguage: (lang: string) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  setCyclePreferences: (prefs: CyclePreferences | null) => void;
  recordActivityStreak: (todayStr: string) => void;
  
  addPeriodLog: (period: Omit<PeriodLog, 'id'>) => void;
  updatePeriodLog: (id: string, period: Partial<PeriodLog>) => void;
  deletePeriodLog: (id: string) => void;

  setDailyCheckIn: (date: string, checkIn: Omit<DailyCheckIn, 'id' | 'date'>) => void;
  
  addMeal: (meal: Omit<Meal, 'id' | 'timestamp'>) => void;
  deleteMeal: (id: string) => void;

  addCustomFood: (food: Omit<CustomFood, 'id'>) => void;
  updateCustomFood: (id: string, food: Partial<CustomFood>) => void;
  deleteCustomFood: (id: string) => void;

  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  deleteActivity: (id: string) => void;

  addMeasurement: (measurement: Omit<BodyMeasurement, 'id' | 'date'> & { date?: string }) => void;
  deleteMeasurement: (id: string) => void;

  // Global UI Actions
  showAlert: (title: string, message?: string, buttons?: AlertButton[]) => void;
  hideAlert: () => void;
  setActiveWorkoutTimer: (timer: ActiveWorkoutTimer | null) => void;

  // AI Governance Actions
  setCachedInsight: (date: string, insight: CachedDailyInsight) => void;
  logAIUsage: (log: Omit<AIMonitoringLog, 'id' | 'timestamp'>) => void;
  clearAICache: () => void;

  seedMockData: () => void;
  resetStore: () => void;
}

import { calculateUpdatedStreak } from '../utils/streakUtils';
import { getMockSeedData } from '../utils/mockSeedData';

const initialMockData = getMockSeedData();

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial State populated with past 45 days testing data
      userProfile: initialMockData.userProfile,
      cyclePreferences: initialMockData.cyclePreferences,
      periods: initialMockData.periods,
      dailyCheckIns: initialMockData.dailyCheckIns,
      meals: initialMockData.meals,
      activities: initialMockData.activities,
      customFoods: [],
      measurements: initialMockData.measurements,
      streak: initialMockData.streak,
      uiLanguage: 'en',
      dailyInsightCache: {},
      aiLogs: [],
      alertState: { visible: false, title: '' },
      activeWorkoutTimer: null,

      seedMockData: () => set(getMockSeedData()),

      // Actions
      setUiLanguage: (lang) => set({ uiLanguage: lang }),
      setUserProfile: (profile) => set({ userProfile: profile }),
      updateUserProfile: (profile) => set((state) => ({ 
        userProfile: state.userProfile ? { ...state.userProfile, ...profile } : null 
      })),
      
      setCyclePreferences: (prefs) => set({ cyclePreferences: prefs }),

      showAlert: (title, message, buttons) => set({ alertState: { visible: true, title, message, buttons } }),
      hideAlert: () => set({ alertState: { visible: false, title: '' } }),
      setActiveWorkoutTimer: (timer) => set({ activeWorkoutTimer: timer }),

      recordActivityStreak: (todayStr) =>
        set((state) => ({
          streak: calculateUpdatedStreak(state.streak, todayStr),
        })),

      addPeriodLog: (period) =>
        set((state) => ({
          periods: [
            ...state.periods,
            { ...period, id: Math.random().toString(36).substring(7) },
          ].sort((a, b) => b.startDate.localeCompare(a.startDate)), // Newest first
        })),

      updatePeriodLog: (id, updatedFields) =>
        set((state) => ({
          periods: state.periods.map((p) =>
            p.id === id ? { ...p, ...updatedFields } : p
          ),
        })),

      deletePeriodLog: (id) =>
        set((state) => ({
          periods: state.periods.filter((p) => p.id !== id),
        })),

      setDailyCheckIn: (date, checkIn) =>
        set((state) => ({
          dailyCheckIns: {
            ...state.dailyCheckIns,
            [date]: { ...checkIn, id: date, date },
          },
        })),

      addMeal: (meal) =>
        set((state) => ({
          meals: [
            ...state.meals,
            {
              ...meal,
              id: Math.random().toString(36).substring(7),
              timestamp: new Date().toISOString(),
            },
          ],
        })),

      deleteMeal: (id) =>
        set((state) => ({
          meals: state.meals.filter((m) => m.id !== id),
        })),

      addCustomFood: (food) =>
        set((state) => ({
          customFoods: [
            ...state.customFoods,
            {
              ...food,
              id: Math.random().toString(36).substring(7),
            },
          ],
        })),

      updateCustomFood: (id, updatedFields) =>
        set((state) => ({
          customFoods: state.customFoods.map((f) =>
            f.id === id ? { ...f, ...updatedFields } : f
          ),
        })),

      deleteCustomFood: (id) =>
        set((state) => ({
          customFoods: state.customFoods.filter((f) => f.id !== id),
        })),

      addActivity: (activity) =>
        set((state) => ({
          activities: [
            ...state.activities,
            {
              ...activity,
              id: Math.random().toString(36).substring(7),
              timestamp: new Date().toISOString(),
            },
          ],
        })),

      deleteActivity: (id) =>
        set((state) => ({
          activities: state.activities.filter((a) => a.id !== id),
        })),

      addMeasurement: (measurement) =>
        set((state) => {
          const date = measurement.date || new Date().toISOString().split('T')[0];
          // Filter out any existing measurement for this exact date to overwrite
          const filtered = state.measurements.filter((m) => m.date !== date);
          
          return {
            measurements: [
              ...filtered,
              {
                ...measurement,
                id: Math.random().toString(36).substring(7),
                date,
              },
            ].sort((a, b) => b.date.localeCompare(a.date)), // Newest first
          };
        }),

      deleteMeasurement: (id) =>
        set((state) => ({
          measurements: state.measurements.filter((m) => m.id !== id),
        })),

      setCachedInsight: (date, insight) =>
        set((state) => ({
          dailyInsightCache: {
            ...state.dailyInsightCache,
            [date]: insight,
          },
        })),

      logAIUsage: (log) =>
        set((state) => {
          const newEntry: AIMonitoringLog = {
            ...log,
            id: Math.random().toString(36).substring(7),
            timestamp: new Date().toISOString(),
          };
          return {
            aiLogs: [newEntry, ...state.aiLogs].slice(0, 100), // Keep last 100 logs
          };
        }),

      clearAICache: () =>
        set({
          dailyInsightCache: {},
        }),

      resetStore: () =>
        set({
          userProfile: null,
          cyclePreferences: null,
          periods: [],
          dailyCheckIns: {},
          meals: [],
          activities: [],
          customFoods: [],
          measurements: [],
          streak: { currentStreak: 1, longestStreak: 1, lastActiveDate: null },
          dailyInsightCache: {},
          aiLogs: [],
        }),
    }),
    {
      name: 'aurafit-local-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

