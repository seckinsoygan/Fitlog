// FitLog - Achievements Store with Firebase Sync
import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import firebase from 'firebase/compat/app';
import { db } from '../config/firebase';
import { useAuthStore } from './authStore';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    emoji: string;
    category: 'workout' | 'streak' | 'volume' | 'special';
    requirement: number;
    unlockedAt?: Date | string;
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

    // Firebase actions
    loadFromFirestore: () => Promise<void>;
    saveToFirestore: () => Promise<void>;
    resetAchievements: () => void;
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

            // Load achievements from Firestore
            loadFromFirestore: async () => {
                try {
                    const uid = useAuthStore.getState().userProfile?.uid;
                    if (!uid) {
                        console.log('🏆 Achievements: No user logged in, skipping load');
                        return;
                    }

                    console.log('🏆 Achievements: Loading from Firestore...');
                    const doc = await db.collection('users').doc(uid).collection('achievements').doc('data').get();

                    if (doc.exists) {
                        const data = doc.data();
                        if (data) {
                            // Merge Firestore data with default achievements
                            const savedAchievements = data.achievements || [];
                            const mergedAchievements = defaultAchievements.map(defaultAch => {
                                const saved = savedAchievements.find((s: Achievement) => s.id === defaultAch.id);
                                if (saved) {
                                    return {
                                        ...defaultAch,
                                        isUnlocked: saved.isUnlocked,
                                        unlockedAt: saved.unlockedAt,
                                    };
                                }
                                return defaultAch;
                            });

                            set({
                                achievements: mergedAchievements,
                                totalPoints: data.totalPoints || 0,
                            });
                            console.log('🏆 Achievements: Loaded successfully', {
                                unlocked: mergedAchievements.filter((a: Achievement) => a.isUnlocked).length,
                                totalPoints: data.totalPoints,
                            });
                        }
                    } else {
                        console.log('🏆 Achievements: No saved data, using defaults');
                    }
                } catch (error) {
                    console.error('🏆 Achievements: Error loading from Firestore:', error);
                }
            },

            // Save achievements to Firestore
            saveToFirestore: async () => {
                try {
                    const uid = useAuthStore.getState().userProfile?.uid;
                    if (!uid) {
                        console.log('🏆 Achievements: No user logged in, skipping save');
                        return;
                    }

                    const { achievements, totalPoints } = get();

                    // Only save unlocked achievements to reduce data
                    const achievementsToSave = achievements.map(ach => ({
                        id: ach.id,
                        isUnlocked: ach.isUnlocked,
                        unlockedAt: ach.unlockedAt ? (ach.unlockedAt instanceof Date ? ach.unlockedAt.toISOString() : ach.unlockedAt) : null,
                    }));

                    await db.collection('users').doc(uid).collection('achievements').doc('data').set({
                        achievements: achievementsToSave,
                        totalPoints,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    });

                    console.log('🏆 Achievements: Saved to Firestore', {
                        unlocked: achievements.filter(a => a.isUnlocked).length,
                        totalPoints,
                    });
                } catch (error) {
                    console.error('🏆 Achievements: Error saving to Firestore:', error);
                }
            },

            checkAchievements: (stats) => {
                const { achievements, saveToFirestore } = get();
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
                        const unlockedAch = { ...ach, isUnlocked: true, unlockedAt: new Date().toISOString() };
                        newlyUnlocked.push(unlockedAch);
                        return unlockedAch;
                    }

                    return ach;
                });

                if (newlyUnlocked.length > 0) {
                    set({
                        achievements: updatedAchievements,
                        totalPoints: get().totalPoints + newlyUnlocked.length * 10,
                    });

                    // Save to Firebase
                    saveToFirestore();

                    console.log('🏆 Achievements: Newly unlocked!', newlyUnlocked.map(a => a.title));
                }

                return newlyUnlocked;
            },

            unlockAchievement: (id) => {
                const { saveToFirestore } = get();

                set((state) => ({
                    achievements: state.achievements.map((ach) =>
                        ach.id === id
                            ? { ...ach, isUnlocked: true, unlockedAt: new Date().toISOString() }
                            : ach
                    ),
                    totalPoints: state.totalPoints + 10,
                }));

                // Save to Firebase
                saveToFirestore();
            },

            getUnlockedAchievements: () => {
                return get().achievements.filter((a) => a.isUnlocked);
            },

            getLockedAchievements: () => {
                return get().achievements.filter((a) => !a.isUnlocked);
            },

            resetAchievements: () => {
                set({
                    achievements: defaultAchievements,
                    totalPoints: 0,
                });
            },
        }),
        {
            name: 'fitlog-achievements',
            storage: createJSONStorage(() => customStorage),
        }
    )
);
