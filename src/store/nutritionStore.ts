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

// Common foods database - Expanded with Turkish and international foods
const defaultQuickFoods: Omit<FoodEntry, 'id' | 'timestamp'>[] = [
    // Kahvaltılık
    { name: 'Yumurta (1 adet)', calories: 78, macros: { protein: 6, carbs: 0.6, fat: 5 }, servingSize: '1 adet', quantity: 1, mealType: 'breakfast' },
    { name: 'Yulaf Ezmesi (40g)', calories: 150, macros: { protein: 5, carbs: 27, fat: 2.5 }, servingSize: '40g', quantity: 1, mealType: 'breakfast' },
    { name: 'Tam Buğday Ekmek (1 dilim)', calories: 80, macros: { protein: 4, carbs: 15, fat: 1 }, servingSize: '1 dilim', quantity: 1, mealType: 'breakfast' },
    { name: 'Beyaz Peynir (30g)', calories: 80, macros: { protein: 5, carbs: 1, fat: 6 }, servingSize: '30g', quantity: 1, mealType: 'breakfast' },
    { name: 'Zeytin (10 adet)', calories: 40, macros: { protein: 0.3, carbs: 1, fat: 4 }, servingSize: '10 adet', quantity: 1, mealType: 'breakfast' },
    { name: 'Bal (1 yemek kaşığı)', calories: 64, macros: { protein: 0.1, carbs: 17, fat: 0 }, servingSize: '1 yk', quantity: 1, mealType: 'breakfast' },
    { name: 'Süt (1 bardak)', calories: 120, macros: { protein: 8, carbs: 12, fat: 5 }, servingSize: '250ml', quantity: 1, mealType: 'breakfast' },
    { name: 'Yoğurt (100g)', calories: 60, macros: { protein: 3.5, carbs: 4, fat: 3 }, servingSize: '100g', quantity: 1, mealType: 'breakfast' },
    { name: 'Sucuk (50g)', calories: 200, macros: { protein: 10, carbs: 1, fat: 17 }, servingSize: '50g', quantity: 1, mealType: 'breakfast' },
    { name: 'Menemen (1 porsiyon)', calories: 250, macros: { protein: 12, carbs: 8, fat: 18 }, servingSize: '1 porsiyon', quantity: 1, mealType: 'breakfast' },

    // Protein Kaynakları
    { name: 'Tavuk Göğsü (100g)', calories: 165, macros: { protein: 31, carbs: 0, fat: 3.6 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'Tavuk But (100g)', calories: 209, macros: { protein: 26, carbs: 0, fat: 11 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'Dana Kıyma (100g)', calories: 250, macros: { protein: 26, carbs: 0, fat: 15 }, servingSize: '100g', quantity: 1, mealType: 'dinner' },
    { name: 'Dana Biftek (100g)', calories: 271, macros: { protein: 26, carbs: 0, fat: 18 }, servingSize: '100g', quantity: 1, mealType: 'dinner' },
    { name: 'Somon (100g)', calories: 208, macros: { protein: 20, carbs: 0, fat: 13 }, servingSize: '100g', quantity: 1, mealType: 'dinner' },
    { name: 'Levrek (100g)', calories: 97, macros: { protein: 18, carbs: 0, fat: 2 }, servingSize: '100g', quantity: 1, mealType: 'dinner' },
    { name: 'Ton Balığı Konserve (100g)', calories: 116, macros: { protein: 26, carbs: 0, fat: 1 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'Hindi Göğsü (100g)', calories: 135, macros: { protein: 30, carbs: 0, fat: 1 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'Köfte (100g)', calories: 280, macros: { protein: 18, carbs: 5, fat: 20 }, servingSize: '100g', quantity: 1, mealType: 'dinner' },

    // Karbonhidrat Kaynakları
    { name: 'Pilav (100g)', calories: 130, macros: { protein: 2.7, carbs: 28, fat: 0.3 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'Bulgur Pilavı (100g)', calories: 120, macros: { protein: 4, carbs: 25, fat: 0.5 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'Makarna (100g pişmiş)', calories: 131, macros: { protein: 5, carbs: 25, fat: 1 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'Patates (100g)', calories: 77, macros: { protein: 2, carbs: 17, fat: 0.1 }, servingSize: '100g', quantity: 1, mealType: 'dinner' },
    { name: 'Tatlı Patates (100g)', calories: 86, macros: { protein: 1.6, carbs: 20, fat: 0.1 }, servingSize: '100g', quantity: 1, mealType: 'dinner' },
    { name: 'Kuru Fasulye (100g)', calories: 127, macros: { protein: 9, carbs: 22, fat: 0.5 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'Nohut (100g)', calories: 164, macros: { protein: 9, carbs: 27, fat: 2.6 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'Mercimek (100g)', calories: 116, macros: { protein: 9, carbs: 20, fat: 0.4 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },

    // Sebzeler
    { name: 'Brokoli (100g)', calories: 34, macros: { protein: 2.8, carbs: 7, fat: 0.4 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'Ispanak (100g)', calories: 23, macros: { protein: 2.9, carbs: 3.6, fat: 0.4 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'Havuç (100g)', calories: 41, macros: { protein: 0.9, carbs: 10, fat: 0.2 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'Salatalık (100g)', calories: 15, macros: { protein: 0.7, carbs: 3.6, fat: 0.1 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'Domates (100g)', calories: 18, macros: { protein: 0.9, carbs: 3.9, fat: 0.2 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'Biber (100g)', calories: 31, macros: { protein: 1, carbs: 6, fat: 0.3 }, servingSize: '100g', quantity: 1, mealType: 'lunch' },
    { name: 'Karnabahar (100g)', calories: 25, macros: { protein: 2, carbs: 5, fat: 0.1 }, servingSize: '100g', quantity: 1, mealType: 'dinner' },
    { name: 'Kabak (100g)', calories: 17, macros: { protein: 1.2, carbs: 3, fat: 0.3 }, servingSize: '100g', quantity: 1, mealType: 'dinner' },
    { name: 'Patlıcan (100g)', calories: 25, macros: { protein: 1, carbs: 6, fat: 0.2 }, servingSize: '100g', quantity: 1, mealType: 'dinner' },
    { name: 'Çoban Salata (1 porsiyon)', calories: 80, macros: { protein: 2, carbs: 8, fat: 5 }, servingSize: '1 porsiyon', quantity: 1, mealType: 'lunch' },

    // Meyveler
    { name: 'Muz (1 adet)', calories: 105, macros: { protein: 1.3, carbs: 27, fat: 0.4 }, servingSize: '1 adet', quantity: 1, mealType: 'snack' },
    { name: 'Elma (1 adet)', calories: 95, macros: { protein: 0.5, carbs: 25, fat: 0.3 }, servingSize: '1 adet', quantity: 1, mealType: 'snack' },
    { name: 'Portakal (1 adet)', calories: 62, macros: { protein: 1.2, carbs: 15, fat: 0.2 }, servingSize: '1 adet', quantity: 1, mealType: 'snack' },
    { name: 'Çilek (100g)', calories: 32, macros: { protein: 0.7, carbs: 8, fat: 0.3 }, servingSize: '100g', quantity: 1, mealType: 'snack' },
    { name: 'Üzüm (100g)', calories: 69, macros: { protein: 0.7, carbs: 18, fat: 0.2 }, servingSize: '100g', quantity: 1, mealType: 'snack' },
    { name: 'Karpuz (100g)', calories: 30, macros: { protein: 0.6, carbs: 8, fat: 0.2 }, servingSize: '100g', quantity: 1, mealType: 'snack' },
    { name: 'Kiraz (100g)', calories: 50, macros: { protein: 1, carbs: 12, fat: 0.3 }, servingSize: '100g', quantity: 1, mealType: 'snack' },
    { name: 'Avokado (yarım)', calories: 160, macros: { protein: 2, carbs: 8, fat: 15 }, servingSize: 'yarım', quantity: 1, mealType: 'snack' },

    // Atıştırmalıklar & Takviyeler
    { name: 'Protein Shake', calories: 120, macros: { protein: 24, carbs: 3, fat: 1 }, servingSize: '1 scoop', quantity: 1, mealType: 'snack' },
    { name: 'Badem (30g)', calories: 170, macros: { protein: 6, carbs: 6, fat: 15 }, servingSize: '30g', quantity: 1, mealType: 'snack' },
    { name: 'Ceviz (30g)', calories: 185, macros: { protein: 4, carbs: 4, fat: 18 }, servingSize: '30g', quantity: 1, mealType: 'snack' },
    { name: 'Fındık (30g)', calories: 180, macros: { protein: 4, carbs: 5, fat: 17 }, servingSize: '30g', quantity: 1, mealType: 'snack' },
    { name: 'Fıstık Ezmesi (2 yk)', calories: 190, macros: { protein: 7, carbs: 7, fat: 16 }, servingSize: '2 yk', quantity: 1, mealType: 'snack' },
    { name: 'Pirinç Patlağı (30g)', calories: 120, macros: { protein: 2, carbs: 25, fat: 1 }, servingSize: '30g', quantity: 1, mealType: 'snack' },
    { name: 'Protein Bar', calories: 200, macros: { protein: 20, carbs: 22, fat: 6 }, servingSize: '1 adet', quantity: 1, mealType: 'snack' },
    { name: 'Kreatin (5g)', calories: 0, macros: { protein: 0, carbs: 0, fat: 0 }, servingSize: '5g', quantity: 1, mealType: 'snack' },
    { name: 'BCAA', calories: 0, macros: { protein: 0, carbs: 0, fat: 0 }, servingSize: '1 scoop', quantity: 1, mealType: 'snack' },

    // Türk Yemekleri
    { name: 'Lahmacun (1 adet)', calories: 210, macros: { protein: 8, carbs: 32, fat: 6 }, servingSize: '1 adet', quantity: 1, mealType: 'dinner' },
    { name: 'Döner (100g)', calories: 217, macros: { protein: 19, carbs: 0.5, fat: 15 }, servingSize: '100g', quantity: 1, mealType: 'dinner' },
    { name: 'İskender (1 porsiyon)', calories: 650, macros: { protein: 35, carbs: 45, fat: 35 }, servingSize: '1 porsiyon', quantity: 1, mealType: 'dinner' },
    { name: 'Karnıyarık (1 porsiyon)', calories: 300, macros: { protein: 12, carbs: 20, fat: 20 }, servingSize: '1 porsiyon', quantity: 1, mealType: 'dinner' },
    { name: 'Mantı (1 porsiyon)', calories: 380, macros: { protein: 14, carbs: 45, fat: 15 }, servingSize: '1 porsiyon', quantity: 1, mealType: 'dinner' },
    { name: 'Mercimek Çorbası (1 kase)', calories: 140, macros: { protein: 8, carbs: 22, fat: 2 }, servingSize: '1 kase', quantity: 1, mealType: 'lunch' },
    { name: 'Tavuk Çorbası (1 kase)', calories: 110, macros: { protein: 8, carbs: 12, fat: 3 }, servingSize: '1 kase', quantity: 1, mealType: 'lunch' },
    { name: 'Pide (1/2)', calories: 350, macros: { protein: 12, carbs: 48, fat: 12 }, servingSize: '1/2 pide', quantity: 1, mealType: 'dinner' },
    { name: 'Simit (1 adet)', calories: 280, macros: { protein: 9, carbs: 50, fat: 5 }, servingSize: '1 adet', quantity: 1, mealType: 'breakfast' },
    { name: 'Börek (1 dilim)', calories: 200, macros: { protein: 6, carbs: 22, fat: 10 }, servingSize: '1 dilim', quantity: 1, mealType: 'breakfast' },

    // İçecekler
    { name: 'Türk Kahvesi', calories: 5, macros: { protein: 0.3, carbs: 0.7, fat: 0.2 }, servingSize: '1 fincan', quantity: 1, mealType: 'snack' },
    { name: 'Ayran (1 bardak)', calories: 65, macros: { protein: 3, carbs: 5, fat: 3.5 }, servingSize: '250ml', quantity: 1, mealType: 'lunch' },
    { name: 'Çay (şekersiz)', calories: 2, macros: { protein: 0, carbs: 0.5, fat: 0 }, servingSize: '1 bardak', quantity: 1, mealType: 'snack' },
    { name: 'Taze Sıkılmış Portakal Suyu', calories: 110, macros: { protein: 2, carbs: 26, fat: 0.5 }, servingSize: '250ml', quantity: 1, mealType: 'breakfast' },
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
