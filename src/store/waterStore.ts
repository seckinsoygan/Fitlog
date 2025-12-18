// FitLog - Water Tracking Store with Firebase Sync
import { create } from 'zustand';
import firebase from 'firebase/compat/app';
import { db } from '../config/firebase';
import { useAuthStore } from './authStore';

export interface WaterEntry {
    id: string;
    amount: number; // ml
    timestamp: string;
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
    isLoading: boolean;
    isSynced: boolean;

    // Actions
    loadFromFirestore: () => Promise<void>;
    saveToFirestore: () => Promise<void>;
    addWater: (amount?: number) => void;
    removeLastEntry: () => void;
    setDailyGoal: (goal: number) => void;
    setGlassSize: (size: number) => void;

    // Getters
    getTodayRecord: () => DailyWaterRecord;
    getTodayProgress: () => number; // percentage
    getWeeklyAverage: () => number;
    getWaterHistory: (days?: number) => DailyWaterRecord[];
}

const getTodayKey = (): string => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useWaterStore = create<WaterState>((set, get) => ({
    dailyGoal: 2500,
    glassSize: 250,
    records: {},
    isLoading: false,
    isSynced: false,

    // Load water data from Firestore
    loadFromFirestore: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        set({ isLoading: true });

        try {
            const doc = await db.collection('userWater').doc(user.uid).get();

            if (doc.exists) {
                const data = doc.data();
                set({
                    dailyGoal: data?.dailyGoal || 2500,
                    glassSize: data?.glassSize || 250,
                    records: data?.records || {},
                    isLoading: false,
                    isSynced: true,
                });
                console.log('✅ Water data loaded from Firestore');
            } else {
                set({ isLoading: false, isSynced: true });
            }
        } catch (error) {
            console.error('❌ Error loading water data:', error);
            set({ isLoading: false });
        }
    },

    // Save water data to Firestore
    saveToFirestore: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        const { dailyGoal, glassSize, records } = get();

        try {
            await db.collection('userWater').doc(user.uid).set({
                dailyGoal,
                glassSize,
                records,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
            set({ isSynced: true });
            console.log('✅ Water data saved to Firestore');
        } catch (error) {
            console.error('❌ Error saving water data:', error);
        }
    },

    addWater: (amount) => {
        const todayKey = getTodayKey();
        const { records, glassSize } = get();
        const waterAmount = amount || glassSize;

        const entry: WaterEntry = {
            id: generateId(),
            amount: waterAmount,
            timestamp: new Date().toISOString(),
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

        // Save to Firestore after update
        get().saveToFirestore();
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

        get().saveToFirestore();
    },

    setDailyGoal: (goal) => {
        set({ dailyGoal: goal });
        get().saveToFirestore();
    },

    setGlassSize: (size) => {
        set({ glassSize: size });
        get().saveToFirestore();
    },

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

    // Get water history for past X days
    getWaterHistory: (days = 30) => {
        const { records } = get();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return Object.values(records)
            .filter((record) => new Date(record.date) >= cutoffDate)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
}));
