// FitLog - Achievements Store
import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    emoji: string;
    category: 'workout' | 'streak' | 'volume' | 'special';
    requirement: number;
    unlockedAt?: Date;
    isUnlocked: boolean;
}

interface AchievementsState {
    achievements: Achievement[];
    totalPoints: number;

    // Actions
    checkAchievements: (stats: {
        totalWorkouts: number;
        totalVolume: number;
        streak: number;
        thisWeekWorkouts: number;
    }) => Achievement[];
    unlockAchievement: (id: string) => void;
    getUnlockedAchievements: () => Achievement[];
    getLockedAchievements: () => Achievement[];
}

// Custom storage
const customStorage: StateStorage = {
    getItem: (name: string): string | null => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                return localStorage.getItem(name);
            }
            return null;
        } catch { return null; }
    },
    setItem: (name: string, value: string): void => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem(name, value);
            }
        } catch { }
    },
    removeItem: (name: string): void => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.removeItem(name);
            }
        } catch { }
    },
};

// Default achievements
const defaultAchievements: Achievement[] = [
    // Workout milestones
    {
        id: 'first-workout',
        title: 'İlk Adım',
        description: 'İlk antrenmanını tamamla',
        emoji: '🎯',
        category: 'workout',
        requirement: 1,
        isUnlocked: false,
    },
    {
        id: 'workout-10',
        title: 'Isınma Turu',
        description: '10 antrenman tamamla',
        emoji: '🔥',
        category: 'workout',
        requirement: 10,
        isUnlocked: false,
    },
    {
        id: 'workout-25',
        title: 'Kararlı',
        description: '25 antrenman tamamla',
        emoji: '💪',
        category: 'workout',
        requirement: 25,
        isUnlocked: false,
    },
    {
        id: 'workout-50',
        title: 'Yarı Yüzyıl',
        description: '50 antrenman tamamla',
        emoji: '🏆',
        category: 'workout',
        requirement: 50,
        isUnlocked: false,
    },
    {
        id: 'workout-100',
        title: 'Yüzüncü',
        description: '100 antrenman tamamla',
        emoji: '👑',
        category: 'workout',
        requirement: 100,
        isUnlocked: false,
    },
    // Volume milestones
    {
        id: 'volume-1t',
        title: 'Bir Ton',
        description: 'Toplam 1 ton kaldır',
        emoji: '🏋️',
        category: 'volume',
        requirement: 1000,
        isUnlocked: false,
    },
    {
        id: 'volume-10t',
        title: 'On Ton Kulübü',
        description: 'Toplam 10 ton kaldır',
        emoji: '💎',
        category: 'volume',
        requirement: 10000,
        isUnlocked: false,
    },
    {
        id: 'volume-50t',
        title: 'Ağır Siklet',
        description: 'Toplam 50 ton kaldır',
        emoji: '🦾',
        category: 'volume',
        requirement: 50000,
        isUnlocked: false,
    },
    {
        id: 'volume-100t',
        title: 'Canavar',
        description: 'Toplam 100 ton kaldır',
        emoji: '🔱',
        category: 'volume',
        requirement: 100000,
        isUnlocked: false,
    },
    // Streak milestones
    {
        id: 'streak-3',
        title: 'Üç Gün',
        description: '3 gün üst üste antrenman',
        emoji: '⚡',
        category: 'streak',
        requirement: 3,
        isUnlocked: false,
    },
    {
        id: 'streak-7',
        title: 'Bir Hafta',
        description: '7 gün üst üste antrenman',
        emoji: '🌟',
        category: 'streak',
        requirement: 7,
        isUnlocked: false,
    },
    {
        id: 'streak-30',
        title: 'Bir Ay',
        description: '30 gün üst üste antrenman',
        emoji: '🏅',
        category: 'streak',
        requirement: 30,
        isUnlocked: false,
    },
    // Special achievements
    {
        id: 'weekly-goal',
        title: 'Haftalık Hedef',
        description: 'Haftalık hedefini tamamla',
        emoji: '✅',
        category: 'special',
        requirement: 5,
        isUnlocked: false,
    },
    {
        id: 'early-bird',
        title: 'Erken Kuş',
        description: 'Sabah 7\'den önce antrenman yap',
        emoji: '🌅',
        category: 'special',
        requirement: 1,
        isUnlocked: false,
    },
    {
        id: 'night-owl',
        title: 'Gece Kuşu',
        description: 'Gece 10\'dan sonra antrenman yap',
        emoji: '🌙',
        category: 'special',
        requirement: 1,
        isUnlocked: false,
    },
];

export const useAchievementsStore = create<AchievementsState>()(
    persist(
        (set, get) => ({
            achievements: defaultAchievements,
            totalPoints: 0,

            checkAchievements: (stats) => {
                const { achievements } = get();
                const newlyUnlocked: Achievement[] = [];

                const updatedAchievements = achievements.map((ach) => {
                    if (ach.isUnlocked) return ach;

                    let shouldUnlock = false;

                    if (ach.category === 'workout') {
                        shouldUnlock = stats.totalWorkouts >= ach.requirement;
                    } else if (ach.category === 'volume') {
                        shouldUnlock = stats.totalVolume >= ach.requirement;
                    } else if (ach.category === 'streak') {
                        shouldUnlock = stats.streak >= ach.requirement;
                    } else if (ach.id === 'weekly-goal') {
                        shouldUnlock = stats.thisWeekWorkouts >= ach.requirement;
                    }

                    if (shouldUnlock) {
                        newlyUnlocked.push({ ...ach, isUnlocked: true, unlockedAt: new Date() });
                        return { ...ach, isUnlocked: true, unlockedAt: new Date() };
                    }

                    return ach;
                });

                if (newlyUnlocked.length > 0) {
                    set({
                        achievements: updatedAchievements,
                        totalPoints: get().totalPoints + newlyUnlocked.length * 10,
                    });
                }

                return newlyUnlocked;
            },

            unlockAchievement: (id) => {
                set((state) => ({
                    achievements: state.achievements.map((ach) =>
                        ach.id === id
                            ? { ...ach, isUnlocked: true, unlockedAt: new Date() }
                            : ach
                    ),
                    totalPoints: state.totalPoints + 10,
                }));
            },

            getUnlockedAchievements: () => {
                return get().achievements.filter((a) => a.isUnlocked);
            },

            getLockedAchievements: () => {
                return get().achievements.filter((a) => !a.isUnlocked);
            },
        }),
        {
            name: 'fitlog-achievements',
            storage: createJSONStorage(() => customStorage),
        }
    )
);
