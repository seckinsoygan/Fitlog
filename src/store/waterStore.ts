// FitLog - Water Tracking Store
import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';

export interface WaterEntry {
    id: string;
    amount: number; // ml
    timestamp: Date;
}

export interface DailyWaterRecord {
    date: string; // YYYY-MM-DD
    entries: WaterEntry[];
    totalAmount: number;
}

interface WaterState {
    dailyGoal: number; // ml (default 2500ml)
    glassSize: number; // ml (default 250ml)
    records: Record<string, DailyWaterRecord>;

    // Actions
    addWater: (amount?: number) => void;
    removeLastEntry: () => void;
    setDailyGoal: (goal: number) => void;
    setGlassSize: (size: number) => void;

    // Getters
    getTodayRecord: () => DailyWaterRecord;
    getTodayProgress: () => number; // percentage
    getWeeklyAverage: () => number;
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

const getTodayKey = (): string => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useWaterStore = create<WaterState>()(
    persist(
        (set, get) => ({
            dailyGoal: 2500,
            glassSize: 250,
            records: {},

            addWater: (amount) => {
                const todayKey = getTodayKey();
                const { records, glassSize } = get();
                const waterAmount = amount || glassSize;

                const entry: WaterEntry = {
                    id: generateId(),
                    amount: waterAmount,
                    timestamp: new Date(),
                };

                const currentRecord = records[todayKey] || {
                    date: todayKey,
                    entries: [],
                    totalAmount: 0,
                };

                set({
                    records: {
                        ...records,
                        [todayKey]: {
                            ...currentRecord,
                            entries: [...currentRecord.entries, entry],
                            totalAmount: currentRecord.totalAmount + waterAmount,
                        },
                    },
                });
            },

            removeLastEntry: () => {
                const todayKey = getTodayKey();
                const { records } = get();
                const currentRecord = records[todayKey];

                if (!currentRecord || currentRecord.entries.length === 0) return;

                const lastEntry = currentRecord.entries[currentRecord.entries.length - 1];

                set({
                    records: {
                        ...records,
                        [todayKey]: {
                            ...currentRecord,
                            entries: currentRecord.entries.slice(0, -1),
                            totalAmount: currentRecord.totalAmount - lastEntry.amount,
                        },
                    },
                });
            },

            setDailyGoal: (goal) => set({ dailyGoal: goal }),
            setGlassSize: (size) => set({ glassSize: size }),

            getTodayRecord: () => {
                const todayKey = getTodayKey();
                const { records } = get();
                return records[todayKey] || {
                    date: todayKey,
                    entries: [],
                    totalAmount: 0,
                };
            },

            getTodayProgress: () => {
                const { dailyGoal } = get();
                const todayRecord = get().getTodayRecord();
                return Math.min((todayRecord.totalAmount / dailyGoal) * 100, 100);
            },

            getWeeklyAverage: () => {
                const { records } = get();
                const today = new Date();
                let total = 0;
                let days = 0;

                for (let i = 0; i < 7; i++) {
                    const date = new Date(today);
                    date.setDate(date.getDate() - i);
                    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

                    if (records[key]) {
                        total += records[key].totalAmount;
                        days++;
                    }
                }

                return days > 0 ? Math.round(total / days) : 0;
            },
        }),
        {
            name: 'fitlog-water',
            storage: createJSONStorage(() => customStorage),
        }
    )
);
