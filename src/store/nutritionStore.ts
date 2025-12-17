// FitLog - Nutrition/Calorie Tracking Store
import { create } from 'zustand';

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

    // Actions
    setGoals: (goals: Partial<NutritionGoals>) => void;
    addFoodEntry: (date: string, entry: Omit<FoodEntry, 'id' | 'timestamp'>) => void;
    removeFoodEntry: (date: string, entryId: string) => void;
    updateWaterIntake: (date: string, amount: number) => void;
    addQuickFood: (food: Omit<FoodEntry, 'id' | 'timestamp'>) => void;
    getDailyNutrition: (date: string) => DailyNutrition;
    getTodayNutrition: () => DailyNutrition;
    getWeeklyAverage: () => { calories: number; protein: number };
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

// Common foods database
const defaultQuickFoods: Omit<FoodEntry, 'id' | 'timestamp'>[] = [
    { name: 'Tavuk Göğsü (100g)', calories: 165, macros: { protein: 31, carbs: 0, fat: 3.6 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'Yumurta (1 adet)', calories: 78, macros: { protein: 6, carbs: 0.6, fat: 5 }, servingSize: '1 adet', quantity: 1, mealType: 'breakfast' },
    { name: 'Pilav (100g)', calories: 130, macros: { protein: 2.7, carbs: 28, fat: 0.3 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'Yulaf Ezmesi (40g)', calories: 150, macros: { protein: 5, carbs: 27, fat: 2.5 }, servingSize: '40g', quantity: 1, mealType: 'breakfast' },
    { name: 'Muz (1 adet)', calories: 105, macros: { protein: 1.3, carbs: 27, fat: 0.4 }, servingSize: '1 adet', quantity: 1, mealType: 'snack' },
    { name: 'Protein Shake', calories: 120, macros: { protein: 24, carbs: 3, fat: 1 }, servingSize: '1 scoop', quantity: 1, mealType: 'snack' },
    { name: 'Badem (30g)', calories: 170, macros: { protein: 6, carbs: 6, fat: 15 }, servingSize: '30g', quantity: 1, mealType: 'snack' },
    { name: 'Somon (100g)', calories: 208, macros: { protein: 20, carbs: 0, fat: 13 }, servingSize: '100g', quantity: 1, mealType: 'dinner' },
    { name: 'Brokoli (100g)', calories: 34, macros: { protein: 2.8, carbs: 7, fat: 0.4 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'Tam Buğday Ekmek (1 dilim)', calories: 80, macros: { protein: 4, carbs: 15, fat: 1 }, servingSize: '1 dilim', quantity: 1, mealType: 'breakfast' },
];

const defaultGoals: NutritionGoals = {
    dailyCalories: 2500,
    protein: 180, // grams
    carbs: 250,
    fat: 80,
    water: 3000, // 3 liters
};

export const useNutritionStore = create<NutritionState>((set, get) => ({
    goals: defaultGoals,
    dailyLogs: [],
    quickFoods: defaultQuickFoods.map((f) => ({ ...f, id: generateId(), timestamp: '' })),

    setGoals: (goals) => {
        set((state) => ({
            goals: { ...state.goals, ...goals },
        }));
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
}));
