// FitLog - Onboarding Store (Web Compatible)
import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';

export type TrainingStyle =
    | 'strength'
    | 'hypertrophy'
    | 'endurance'
    | 'weight_loss'
    | 'general_fitness';

export interface OnboardingData {
    trainingStyle: TrainingStyle | null;
    fitnessLevel: 'beginner' | 'intermediate' | 'advanced' | null;
    weeklyAvailability: number;
    hasEquipment: boolean;
    goals: string[];
}

interface OnboardingState {
    hasCompletedOnboarding: boolean;
    hasSelectedTrainingStyle: boolean;
    onboardingData: OnboardingData;

    // Actions
    setHadCompletedOnboarding: (completed: boolean) => void;
    setTrainingStyle: (style: TrainingStyle) => void;
    setFitnessLevel: (level: 'beginner' | 'intermediate' | 'advanced') => void;
    setWeeklyAvailability: (days: number) => void;
    setHasEquipment: (hasEquipment: boolean) => void;
    addGoal: (goal: string) => void;
    removeGoal: (goal: string) => void;
    completeOnboarding: () => void;
    completeTrainingStyleSelection: () => void;
    resetOnboarding: () => void;
}

const defaultOnboardingData: OnboardingData = {
    trainingStyle: null,
    fitnessLevel: null,
    weeklyAvailability: 4,
    hasEquipment: true,
    goals: [],
};

// Custom storage that works on both web and native
const customStorage: StateStorage = {
    getItem: (name: string): string | null => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                return localStorage.getItem(name);
            }
            return null;
        } catch {
            return null;
        }
    },
    setItem: (name: string, value: string): void => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem(name, value);
            }
        } catch {
            // Ignore errors
        }
    },
    removeItem: (name: string): void => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.removeItem(name);
            }
        } catch {
            // Ignore errors
        }
    },
};

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set, get) => ({
            hasCompletedOnboarding: false,
            hasSelectedTrainingStyle: false,
            onboardingData: defaultOnboardingData,

            setHadCompletedOnboarding: (completed) => {
                set({ hasCompletedOnboarding: completed });
            },

            setTrainingStyle: (style) => {
                set((state) => ({
                    onboardingData: { ...state.onboardingData, trainingStyle: style },
                }));
            },

            setFitnessLevel: (level) => {
                set((state) => ({
                    onboardingData: { ...state.onboardingData, fitnessLevel: level },
                }));
            },

            setWeeklyAvailability: (days) => {
                set((state) => ({
                    onboardingData: { ...state.onboardingData, weeklyAvailability: days },
                }));
            },

            setHasEquipment: (hasEquipment) => {
                set((state) => ({
                    onboardingData: { ...state.onboardingData, hasEquipment },
                }));
            },

            addGoal: (goal) => {
                set((state) => ({
                    onboardingData: {
                        ...state.onboardingData,
                        goals: [...state.onboardingData.goals, goal],
                    },
                }));
            },

            removeGoal: (goal) => {
                set((state) => ({
                    onboardingData: {
                        ...state.onboardingData,
                        goals: state.onboardingData.goals.filter((g) => g !== goal),
                    },
                }));
            },

            completeOnboarding: () => {
                set({ hasCompletedOnboarding: true });
            },

            completeTrainingStyleSelection: () => {
                set({ hasSelectedTrainingStyle: true });
            },

            resetOnboarding: () => {
                set({
                    hasCompletedOnboarding: false,
                    hasSelectedTrainingStyle: false,
                    onboardingData: defaultOnboardingData,
                });
            },
        }),
        {
            name: 'fitlog-onboarding',
            storage: createJSONStorage(() => customStorage),
        }
    )
);

// Training style configurations
export const trainingStyleConfigs: Record<TrainingStyle, {
    name: string;
    description: string;
    emoji: string;
    setsPerExercise: number;
    repsRange: string;
    restTime: number;
    color: string;
}> = {
    strength: {
        name: 'Güç Antrenmanı',
        description: 'Ağır kaldırışlar, düşük tekrar. Maksimum güç kazanımı.',
        emoji: '💪',
        setsPerExercise: 5,
        repsRange: '3-5',
        restTime: 180,
        color: '#FF6B6B',
    },
    hypertrophy: {
        name: 'Kas Büyütme',
        description: 'Orta ağırlık, yüksek hacim. Kas kütlesi artışı.',
        emoji: '🏋️',
        setsPerExercise: 4,
        repsRange: '8-12',
        restTime: 90,
        color: '#4ECDC4',
    },
    endurance: {
        name: 'Dayanıklılık',
        description: 'Yüksek tekrar, düşük ağırlık. Kas dayanıklılığı.',
        emoji: '🏃',
        setsPerExercise: 3,
        repsRange: '15-20',
        restTime: 45,
        color: '#45B7D1',
    },
    weight_loss: {
        name: 'Kilo Verme',
        description: 'HIIT ve devre antrenmanı. Yağ yakımı odaklı.',
        emoji: '🔥',
        setsPerExercise: 3,
        repsRange: '12-15',
        restTime: 30,
        color: '#F39C12',
    },
    general_fitness: {
        name: 'Genel Fitness',
        description: 'Dengeli antrenman. Günlük form ve sağlık.',
        emoji: '⭐',
        setsPerExercise: 3,
        repsRange: '10-12',
        restTime: 60,
        color: '#9B59B6',
    },
};
