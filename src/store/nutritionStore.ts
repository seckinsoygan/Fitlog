// FitLog - Nutrition/Calorie Tracking Store with Firebase Sync
import { create } from 'zustand';
import firebase from 'firebase/compat/app';
import { db } from '../config/firebase';
import { useAuthStore } from './authStore';

export interface MacroNutrients {
    protein: number;
    carbs: number;
    fat: number;
}

export interface FoodEntry {
    id: string;
    name: string;
    calories: number;
    macros: MacroNutrients;
    servingSize: string;
    quantity: number;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    timestamp: string;
}

export interface DailyNutrition {
    date: string; // YYYY-MM-DD
    entries: FoodEntry[];
    totalCalories: number;
    totalMacros: MacroNutrients;
    waterIntake: number; // in ml
}

export interface NutritionGoals {
    dailyCalories: number;
    protein: number; // grams
    carbs: number;
    fat: number;
    water: number; // in ml
}

interface NutritionState {
    goals: NutritionGoals;
    dailyLogs: DailyNutrition[];
    quickFoods: FoodEntry[]; // Frequently used foods
    isLoading: boolean;
    isSynced: boolean;

    // Actions
    loadFromFirestore: () => Promise<void>;
    saveToFirestore: () => Promise<void>;
    setGoals: (goals: Partial<NutritionGoals>) => void;
    addFoodEntry: (date: string, entry: Omit<FoodEntry, 'id' | 'timestamp'>) => void;
    removeFoodEntry: (date: string, entryId: string) => void;
    updateWaterIntake: (date: string, amount: number) => void;
    addQuickFood: (food: Omit<FoodEntry, 'id' | 'timestamp'>) => void;
    getDailyNutrition: (date: string) => DailyNutrition;
    getTodayNutrition: () => DailyNutrition;
    getWeeklyAverage: () => { calories: number; protein: number };
    getNutritionHistory: (days?: number) => DailyNutrition[];
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const getDateString = (date: Date = new Date()): string => {
    return date.toISOString().split('T')[0];
};

const createEmptyDailyNutrition = (date: string): DailyNutrition => ({
    date,
    entries: [],
    totalCalories: 0,
    totalMacros: { protein: 0, carbs: 0, fat: 0 },
    waterIntake: 0,
});

// Common foods database - Expanded with Turkish and international foods
const defaultQuickFoods: Omit<FoodEntry, 'id' | 'timestamp'>[] = [
    // Kahvaltılık
    { name: 'Yumurta (1 adet)', calories: 78, macros: { protein: 6, carbs: 0.6, fat: 5 }, servingSize: '1 adet', quantity: 1, mealType: 'breakfast' },
    { name: 'Yulaf Ezmesi (40g)', calories: 150, macros: { protein: 5, carbs: 27, fat: 2.5 }, servingSize: '40g', quantity: 1, mealType: 'breakfast' },
    { name: 'Tam Buğday Ekmek (1 dilim)', calories: 80, macros: { protein: 4, carbs: 15, fat: 1 }, servingSize: '1 dilim', quantity: 1, mealType: 'breakfast' },
    { name: 'Beyaz Peynir (30g)', calories: 80, macros: { protein: 5, carbs: 1, fat: 6 }, servingSize: '30g', quantity: 1, mealType: 'breakfast' },
    { name: 'Süt (1 bardak)', calories: 120, macros: { protein: 8, carbs: 12, fat: 5 }, servingSize: '250ml', quantity: 1, mealType: 'breakfast' },
    { name: 'Yoğurt (100g)', calories: 60, macros: { protein: 3.5, carbs: 4, fat: 3 }, servingSize: '100g', quantity: 1, mealType: 'breakfast' },
    { name: 'Menemen (1 porsiyon)', calories: 250, macros: { protein: 12, carbs: 8, fat: 18 }, servingSize: '1 porsiyon', quantity: 1, mealType: 'breakfast' },
    { name: 'Simit (1 adet)', calories: 280, macros: { protein: 9, carbs: 50, fat: 5 }, servingSize: '1 adet', quantity: 1, mealType: 'breakfast' },

    // Protein Kaynakları
    { name: 'Tavuk Göğsü (100g)', calories: 165, macros: { protein: 31, carbs: 0, fat: 3.6 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'Dana Kıyma (100g)', calories: 250, macros: { protein: 26, carbs: 0, fat: 15 }, servingSize: '100g', quantity: 1, mealType: 'dinner' },
    { name: 'Somon (100g)', calories: 208, macros: { protein: 20, carbs: 0, fat: 13 }, servingSize: '100g', quantity: 1, mealType: 'dinner' },
    { name: 'Ton Balığı Konserve (100g)', calories: 116, macros: { protein: 26, carbs: 0, fat: 1 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'Köfte (100g)', calories: 280, macros: { protein: 18, carbs: 5, fat: 20 }, servingSize: '100g', quantity: 1, mealType: 'dinner' },

    // Karbonhidrat Kaynakları
    { name: 'Pilav (100g)', calories: 130, macros: { protein: 2.7, carbs: 28, fat: 0.3 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'Bulgur Pilavı (100g)', calories: 120, macros: { protein: 4, carbs: 25, fat: 0.5 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'Makarna (100g pişmiş)', calories: 131, macros: { protein: 5, carbs: 25, fat: 1 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'Patates (100g)', calories: 77, macros: { protein: 2, carbs: 17, fat: 0.1 }, servingSize: '100g', quantity: 1, mealType: 'dinner' },

    // Sebzeler
    { name: 'Brokoli (100g)', calories: 34, macros: { protein: 2.8, carbs: 7, fat: 0.4 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'Ispanak (100g)', calories: 23, macros: { protein: 2.9, carbs: 3.6, fat: 0.4 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'Çoban Salata (1 porsiyon)', calories: 80, macros: { protein: 2, carbs: 8, fat: 5 }, servingSize: '1 porsiyon', quantity: 1, mealType: 'lunch' },

    // Meyveler
    { name: 'Muz (1 adet)', calories: 105, macros: { protein: 1.3, carbs: 27, fat: 0.4 }, servingSize: '1 adet', quantity: 1, mealType: 'snack' },
    { name: 'Elma (1 adet)', calories: 95, macros: { protein: 0.5, carbs: 25, fat: 0.3 }, servingSize: '1 adet', quantity: 1, mealType: 'snack' },
    { name: 'Portakal (1 adet)', calories: 62, macros: { protein: 1.2, carbs: 15, fat: 0.2 }, servingSize: '1 adet', quantity: 1, mealType: 'snack' },

    // Atıştırmalıklar & Takviyeler
    { name: 'Protein Shake', calories: 120, macros: { protein: 24, carbs: 3, fat: 1 }, servingSize: '1 scoop', quantity: 1, mealType: 'snack' },
    { name: 'Badem (30g)', calories: 170, macros: { protein: 6, carbs: 6, fat: 15 }, servingSize: '30g', quantity: 1, mealType: 'snack' },
    { name: 'Protein Bar', calories: 200, macros: { protein: 20, carbs: 22, fat: 6 }, servingSize: '1 adet', quantity: 1, mealType: 'snack' },

    // Türk Yemekleri
    { name: 'Lahmacun (1 adet)', calories: 210, macros: { protein: 8, carbs: 32, fat: 6 }, servingSize: '1 adet', quantity: 1, mealType: 'dinner' },
    { name: 'Döner (100g)', calories: 217, macros: { protein: 19, carbs: 0.5, fat: 15 }, servingSize: '100g', quantity: 1, mealType: 'dinner' },
    { name: 'Mercimek Çorbası (1 kase)', calories: 140, macros: { protein: 8, carbs: 22, fat: 2 }, servingSize: '1 kase', quantity: 1, mealType: 'lunch' },

    // İçecekler
    { name: 'Ayran (1 bardak)', calories: 65, macros: { protein: 3, carbs: 5, fat: 3.5 }, servingSize: '250ml', quantity: 1, mealType: 'lunch' },
    { name: 'Türk Kahvesi', calories: 5, macros: { protein: 0.3, carbs: 0.7, fat: 0.2 }, servingSize: '1 fincan', quantity: 1, mealType: 'snack' },
];

const defaultGoals: NutritionGoals = {
    dailyCalories: 2500,
    protein: 180,
    carbs: 250,
    fat: 80,
    water: 3000,
};

export const useNutritionStore = create<NutritionState>((set, get) => ({
    goals: defaultGoals,
    dailyLogs: [],
    quickFoods: defaultQuickFoods.map((f) => ({ ...f, id: generateId(), timestamp: '' })),
    isLoading: false,
    isSynced: false,

    // Load nutrition data from Firestore
    loadFromFirestore: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        set({ isLoading: true });

        try {
            const doc = await db.collection('userNutrition').doc(user.uid).get();

            if (doc.exists) {
                const data = doc.data();
                set({
                    goals: data?.goals || defaultGoals,
                    dailyLogs: data?.dailyLogs || [],
                    isLoading: false,
                    isSynced: true,
                });
                console.log('✅ Nutrition data loaded from Firestore');
            } else {
                set({ isLoading: false, isSynced: true });
            }
        } catch (error) {
            console.error('❌ Error loading nutrition data:', error);
            set({ isLoading: false });
        }
    },

    // Save nutrition data to Firestore
    saveToFirestore: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        const { goals, dailyLogs } = get();

        try {
            await db.collection('userNutrition').doc(user.uid).set({
                goals,
                dailyLogs,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
            set({ isSynced: true });
            console.log('✅ Nutrition data saved to Firestore');
        } catch (error) {
            console.error('❌ Error saving nutrition data:', error);
        }
    },

    setGoals: (goals) => {
        set((state) => ({
            goals: { ...state.goals, ...goals },
        }));
        get().saveToFirestore();
    },

    addFoodEntry: (date, entry) => {
        const newEntry: FoodEntry = {
            ...entry,
            id: generateId(),
            timestamp: new Date().toISOString(),
        };

        set((state) => {
            const existingLog = state.dailyLogs.find((log) => log.date === date);

            if (existingLog) {
                const updatedEntries = [...existingLog.entries, newEntry];
                const totalCalories = updatedEntries.reduce((sum, e) => sum + e.calories * e.quantity, 0);
                const totalMacros = updatedEntries.reduce(
                    (sum, e) => ({
                        protein: sum.protein + e.macros.protein * e.quantity,
                        carbs: sum.carbs + e.macros.carbs * e.quantity,
                        fat: sum.fat + e.macros.fat * e.quantity,
                    }),
                    { protein: 0, carbs: 0, fat: 0 }
                );

                return {
                    dailyLogs: state.dailyLogs.map((log) =>
                        log.date === date
                            ? { ...log, entries: updatedEntries, totalCalories, totalMacros }
                            : log
                    ),
                };
            } else {
                const newLog: DailyNutrition = {
                    date,
                    entries: [newEntry],
                    totalCalories: newEntry.calories * newEntry.quantity,
                    totalMacros: {
                        protein: newEntry.macros.protein * newEntry.quantity,
                        carbs: newEntry.macros.carbs * newEntry.quantity,
                        fat: newEntry.macros.fat * newEntry.quantity,
                    },
                    waterIntake: 0,
                };
                return {
                    dailyLogs: [...state.dailyLogs, newLog],
                };
            }
        });
        get().saveToFirestore();
    },

    removeFoodEntry: (date, entryId) => {
        set((state) => {
            const existingLog = state.dailyLogs.find((log) => log.date === date);
            if (!existingLog) return state;

            const updatedEntries = existingLog.entries.filter((e) => e.id !== entryId);
            const totalCalories = updatedEntries.reduce((sum, e) => sum + e.calories * e.quantity, 0);
            const totalMacros = updatedEntries.reduce(
                (sum, e) => ({
                    protein: sum.protein + e.macros.protein * e.quantity,
                    carbs: sum.carbs + e.macros.carbs * e.quantity,
                    fat: sum.fat + e.macros.fat * e.quantity,
                }),
                { protein: 0, carbs: 0, fat: 0 }
            );

            return {
                dailyLogs: state.dailyLogs.map((log) =>
                    log.date === date
                        ? { ...log, entries: updatedEntries, totalCalories, totalMacros }
                        : log
                ),
            };
        });
        get().saveToFirestore();
    },

    updateWaterIntake: (date, amount) => {
        set((state) => {
            const existingLog = state.dailyLogs.find((log) => log.date === date);

            if (existingLog) {
                return {
                    dailyLogs: state.dailyLogs.map((log) =>
                        log.date === date
                            ? { ...log, waterIntake: Math.max(0, log.waterIntake + amount) }
                            : log
                    ),
                };
            } else {
                const newLog = createEmptyDailyNutrition(date);
                newLog.waterIntake = Math.max(0, amount);
                return {
                    dailyLogs: [...state.dailyLogs, newLog],
                };
            }
        });
        get().saveToFirestore();
    },

    addQuickFood: (food) => {
        const newFood: FoodEntry = {
            ...food,
            id: generateId(),
            timestamp: '',
        };
        set((state) => ({
            quickFoods: [...state.quickFoods, newFood],
        }));
    },

    getDailyNutrition: (date) => {
        const { dailyLogs } = get();
        return dailyLogs.find((log) => log.date === date) || createEmptyDailyNutrition(date);
    },

    getTodayNutrition: () => {
        const today = getDateString();
        return get().getDailyNutrition(today);
    },

    getWeeklyAverage: () => {
        const { dailyLogs } = get();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentLogs = dailyLogs.filter((log) => new Date(log.date) >= sevenDaysAgo);

        if (recentLogs.length === 0) {
            return { calories: 0, protein: 0 };
        }

        const totalCalories = recentLogs.reduce((sum, log) => sum + log.totalCalories, 0);
        const totalProtein = recentLogs.reduce((sum, log) => sum + log.totalMacros.protein, 0);

        return {
            calories: Math.round(totalCalories / recentLogs.length),
            protein: Math.round(totalProtein / recentLogs.length),
        };
    },

    // Get nutrition history for past X days
    getNutritionHistory: (days = 30) => {
        const { dailyLogs } = get();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return dailyLogs
            .filter((log) => new Date(log.date) >= cutoffDate)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
}));
