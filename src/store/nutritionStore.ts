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

// Common foods database - with i18n key support
const defaultQuickFoods: Omit<FoodEntry, 'id' | 'timestamp'>[] = [
    // Kahvaltılık / Breakfast
    { name: 'egg', calories: 78, macros: { protein: 6, carbs: 0.6, fat: 5 }, servingSize: '1', quantity: 1, mealType: 'breakfast' },
    { name: 'oatmeal', calories: 150, macros: { protein: 5, carbs: 27, fat: 2.5 }, servingSize: '40g', quantity: 1, mealType: 'breakfast' },
    { name: 'wheatBread', calories: 80, macros: { protein: 4, carbs: 15, fat: 1 }, servingSize: '1', quantity: 1, mealType: 'breakfast' },
    { name: 'whiteCheese', calories: 80, macros: { protein: 5, carbs: 1, fat: 6 }, servingSize: '30g', quantity: 1, mealType: 'breakfast' },
    { name: 'milk', calories: 120, macros: { protein: 8, carbs: 12, fat: 5 }, servingSize: '250ml', quantity: 1, mealType: 'breakfast' },
    { name: 'yogurt', calories: 60, macros: { protein: 3.5, carbs: 4, fat: 3 }, servingSize: '100g', quantity: 1, mealType: 'breakfast' },
    { name: 'menemen', calories: 250, macros: { protein: 12, carbs: 8, fat: 18 }, servingSize: '1', quantity: 1, mealType: 'breakfast' },
    { name: 'simit', calories: 280, macros: { protein: 9, carbs: 50, fat: 5 }, servingSize: '1', quantity: 1, mealType: 'breakfast' },
    { name: 'pancakes', calories: 220, macros: { protein: 6, carbs: 35, fat: 7 }, servingSize: '2', quantity: 1, mealType: 'breakfast' },
    { name: 'granola', calories: 200, macros: { protein: 5, carbs: 30, fat: 8 }, servingSize: '50g', quantity: 1, mealType: 'breakfast' },
    { name: 'frenchToast', calories: 280, macros: { protein: 8, carbs: 32, fat: 12 }, servingSize: '2', quantity: 1, mealType: 'breakfast' },

    // Protein Kaynakları / Proteins
    { name: 'chickenBreast', calories: 165, macros: { protein: 31, carbs: 0, fat: 3.6 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'groundBeef', calories: 250, macros: { protein: 26, carbs: 0, fat: 15 }, servingSize: '100g', quantity: 1, mealType: 'dinner' },
    { name: 'salmon', calories: 208, macros: { protein: 20, carbs: 0, fat: 13 }, servingSize: '100g', quantity: 1, mealType: 'dinner' },
    { name: 'tunaCanned', calories: 116, macros: { protein: 26, carbs: 0, fat: 1 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'meatballs', calories: 280, macros: { protein: 18, carbs: 5, fat: 20 }, servingSize: '100g', quantity: 1, mealType: 'dinner' },
    { name: 'grillChicken', calories: 248, macros: { protein: 46, carbs: 0, fat: 5.4 }, servingSize: '150g', quantity: 1, mealType: 'lunch' },
    { name: 'steak', calories: 375, macros: { protein: 38, carbs: 0, fat: 24 }, servingSize: '150g', quantity: 1, mealType: 'dinner' },
    { name: 'turkeyBreast', calories: 135, macros: { protein: 30, carbs: 0, fat: 1 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'shrimpGrilled', calories: 99, macros: { protein: 24, carbs: 0, fat: 0.3 }, servingSize: '100g', quantity: 1, mealType: 'dinner' },
    { name: 'eggs3', calories: 234, macros: { protein: 18, carbs: 1.8, fat: 15 }, servingSize: '3', quantity: 1, mealType: 'breakfast' },

    // Karbonhidrat / Carbs
    { name: 'rice', calories: 130, macros: { protein: 2.7, carbs: 28, fat: 0.3 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'bulgur', calories: 120, macros: { protein: 4, carbs: 25, fat: 0.5 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'pasta', calories: 131, macros: { protein: 5, carbs: 25, fat: 1 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'potato', calories: 77, macros: { protein: 2, carbs: 17, fat: 0.1 }, servingSize: '100g', quantity: 1, mealType: 'dinner' },
    { name: 'sweetPotato', calories: 86, macros: { protein: 1.6, carbs: 20, fat: 0.1 }, servingSize: '100g', quantity: 1, mealType: 'dinner' },
    { name: 'quinoa', calories: 120, macros: { protein: 4.4, carbs: 21, fat: 1.9 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'couscous', calories: 112, macros: { protein: 3.8, carbs: 23, fat: 0.2 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },

    // Sebzeler / Vegetables
    { name: 'broccoli', calories: 34, macros: { protein: 2.8, carbs: 7, fat: 0.4 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'spinach', calories: 23, macros: { protein: 2.9, carbs: 3.6, fat: 0.4 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'shepherdSalad', calories: 80, macros: { protein: 2, carbs: 8, fat: 5 }, servingSize: '1', quantity: 1, mealType: 'lunch' },
    { name: 'mixedVegetables', calories: 65, macros: { protein: 2.5, carbs: 13, fat: 0.5 }, servingSize: '150g', quantity: 1, mealType: 'dinner' },
    { name: 'greenSalad', calories: 20, macros: { protein: 1.5, carbs: 3, fat: 0.2 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'grilledVegetables', calories: 100, macros: { protein: 3, carbs: 15, fat: 4 }, servingSize: '150g', quantity: 1, mealType: 'dinner' },

    // Meyveler / Fruits
    { name: 'banana', calories: 105, macros: { protein: 1.3, carbs: 27, fat: 0.4 }, servingSize: '1', quantity: 1, mealType: 'snack' },
    { name: 'apple', calories: 95, macros: { protein: 0.5, carbs: 25, fat: 0.3 }, servingSize: '1', quantity: 1, mealType: 'snack' },
    { name: 'orange', calories: 62, macros: { protein: 1.2, carbs: 15, fat: 0.2 }, servingSize: '1', quantity: 1, mealType: 'snack' },
    { name: 'strawberries', calories: 32, macros: { protein: 0.7, carbs: 7.7, fat: 0.3 }, servingSize: '100g', quantity: 1, mealType: 'snack' },
    { name: 'blueberries', calories: 57, macros: { protein: 0.7, carbs: 14, fat: 0.3 }, servingSize: '100g', quantity: 1, mealType: 'snack' },
    { name: 'watermelon', calories: 60, macros: { protein: 1.2, carbs: 15, fat: 0.3 }, servingSize: '200g', quantity: 1, mealType: 'snack' },
    { name: 'grapes', calories: 69, macros: { protein: 0.7, carbs: 18, fat: 0.2 }, servingSize: '100g', quantity: 1, mealType: 'snack' },
    { name: 'pineapple', calories: 50, macros: { protein: 0.5, carbs: 13, fat: 0.1 }, servingSize: '100g', quantity: 1, mealType: 'snack' },

    // Atıştırmalıklar & Takviyeler / Snacks & Supplements
    { name: 'proteinShake', calories: 120, macros: { protein: 24, carbs: 3, fat: 1 }, servingSize: '1', quantity: 1, mealType: 'snack' },
    { name: 'almonds', calories: 170, macros: { protein: 6, carbs: 6, fat: 15 }, servingSize: '30g', quantity: 1, mealType: 'snack' },
    { name: 'proteinBar', calories: 200, macros: { protein: 20, carbs: 22, fat: 6 }, servingSize: '1', quantity: 1, mealType: 'snack' },
    { name: 'greekYogurt', calories: 150, macros: { protein: 15, carbs: 6, fat: 7 }, servingSize: '150g', quantity: 1, mealType: 'snack' },
    { name: 'cottageCheese', calories: 98, macros: { protein: 11, carbs: 3.4, fat: 4.3 }, servingSize: '100g', quantity: 1, mealType: 'snack' },
    { name: 'peanutButter', calories: 188, macros: { protein: 8, carbs: 6, fat: 16 }, servingSize: '32g', quantity: 1, mealType: 'snack' },
    { name: 'mixedNuts', calories: 180, macros: { protein: 5, carbs: 7, fat: 16 }, servingSize: '30g', quantity: 1, mealType: 'snack' },
    { name: 'darkChocolate', calories: 110, macros: { protein: 1.5, carbs: 10, fat: 7 }, servingSize: '20g', quantity: 1, mealType: 'snack' },
    { name: 'riceKek', calories: 70, macros: { protein: 1.4, carbs: 14, fat: 1 }, servingSize: '2', quantity: 1, mealType: 'snack' },
    { name: 'hummus', calories: 80, macros: { protein: 4, carbs: 6, fat: 5 }, servingSize: '50g', quantity: 1, mealType: 'snack' },

    // Türk Yemekleri / Turkish Foods
    { name: 'lahmacun', calories: 210, macros: { protein: 8, carbs: 32, fat: 6 }, servingSize: '1', quantity: 1, mealType: 'dinner' },
    { name: 'doner', calories: 217, macros: { protein: 19, carbs: 0.5, fat: 15 }, servingSize: '100g', quantity: 1, mealType: 'dinner' },
    { name: 'lentilSoup', calories: 140, macros: { protein: 8, carbs: 22, fat: 2 }, servingSize: '1', quantity: 1, mealType: 'lunch' },
    { name: 'pide', calories: 350, macros: { protein: 14, carbs: 45, fat: 12 }, servingSize: '1', quantity: 1, mealType: 'dinner' },
    { name: 'iskender', calories: 650, macros: { protein: 35, carbs: 45, fat: 38 }, servingSize: '1', quantity: 1, mealType: 'dinner' },
    { name: 'manti', calories: 400, macros: { protein: 18, carbs: 50, fat: 14 }, servingSize: '1', quantity: 1, mealType: 'dinner' },
    { name: 'kofte', calories: 280, macros: { protein: 18, carbs: 5, fat: 20 }, servingSize: '100g', quantity: 1, mealType: 'dinner' },
    { name: 'dolma', calories: 180, macros: { protein: 4, carbs: 22, fat: 8 }, servingSize: '5', quantity: 1, mealType: 'lunch' },
    { name: 'borek', calories: 300, macros: { protein: 8, carbs: 28, fat: 18 }, servingSize: '100g', quantity: 1, mealType: 'breakfast' },
    { name: 'baklava', calories: 330, macros: { protein: 5, carbs: 40, fat: 18 }, servingSize: '2', quantity: 1, mealType: 'snack' },

    // İçecekler / Beverages
    { name: 'ayran', calories: 65, macros: { protein: 3, carbs: 5, fat: 3.5 }, servingSize: '250ml', quantity: 1, mealType: 'lunch' },
    { name: 'turkishCoffee', calories: 5, macros: { protein: 0.3, carbs: 0.7, fat: 0.2 }, servingSize: '1', quantity: 1, mealType: 'snack' },
    { name: 'greenTea', calories: 0, macros: { protein: 0, carbs: 0, fat: 0 }, servingSize: '1', quantity: 1, mealType: 'snack' },
    { name: 'blackCoffee', calories: 2, macros: { protein: 0.3, carbs: 0, fat: 0 }, servingSize: '1', quantity: 1, mealType: 'snack' },
    { name: 'freshJuice', calories: 110, macros: { protein: 1, carbs: 26, fat: 0.5 }, servingSize: '250ml', quantity: 1, mealType: 'snack' },
    { name: 'smoothie', calories: 180, macros: { protein: 5, carbs: 35, fat: 3 }, servingSize: '300ml', quantity: 1, mealType: 'snack' },

    // Uluslararası / International
    { name: 'sushi', calories: 200, macros: { protein: 9, carbs: 38, fat: 1 }, servingSize: '6', quantity: 1, mealType: 'dinner' },
    { name: 'pizza', calories: 270, macros: { protein: 12, carbs: 33, fat: 10 }, servingSize: '1', quantity: 1, mealType: 'dinner' },
    { name: 'burger', calories: 540, macros: { protein: 25, carbs: 40, fat: 30 }, servingSize: '1', quantity: 1, mealType: 'dinner' },
    { name: 'sandwich', calories: 350, macros: { protein: 15, carbs: 38, fat: 15 }, servingSize: '1', quantity: 1, mealType: 'lunch' },
    { name: 'caesarSalad', calories: 320, macros: { protein: 18, carbs: 12, fat: 24 }, servingSize: '1', quantity: 1, mealType: 'lunch' },
    { name: 'friedRice', calories: 250, macros: { protein: 6, carbs: 40, fat: 8 }, servingSize: '150g', quantity: 1, mealType: 'dinner' },
    { name: 'curry', calories: 400, macros: { protein: 20, carbs: 30, fat: 22 }, servingSize: '1', quantity: 1, mealType: 'dinner' },
    { name: 'tacos', calories: 340, macros: { protein: 14, carbs: 28, fat: 18 }, servingSize: '2', quantity: 1, mealType: 'dinner' },
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
