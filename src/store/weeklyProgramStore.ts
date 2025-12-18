// FitLog - Weekly Program Store with Firebase Sync
import { create } from 'zustand';
import firebase from 'firebase/compat/app';
import { db } from '../config/firebase';
import { useAuthStore } from './authStore';

export interface WeeklyProgramDay {
    dayIndex: number; // 0-6 (Pazar-Cumartesi)
    dayName: string;
    templateId: string | null;
    templateName: string | null;
    isRestDay: boolean;
}

export interface WeeklyProgram {
    id: string;
    name: string;
    days: WeeklyProgramDay[];
    isActive: boolean;
}

interface WeeklyProgramState {
    programs: WeeklyProgram[];
    activeProgram: WeeklyProgram | null;
    isLoading: boolean;
    isSynced: boolean;

    // Actions
    loadPrograms: () => Promise<void>;
    saveToFirestore: () => Promise<void>;
    createProgram: (name: string) => WeeklyProgram;
    updateProgram: (programId: string, updates: Partial<WeeklyProgram>) => void;
    deleteProgram: (programId: string) => void;
    setActiveProgram: (programId: string) => void;
    assignTemplateToDay: (programId: string, dayIndex: number, templateId: string | null, templateName: string | null) => void;
    toggleRestDay: (programId: string, dayIndex: number) => void;
    swapDays: (programId: string, fromDayIndex: number, toDayIndex: number) => void;
    getTodaysWorkout: () => WeeklyProgramDay | null;
    setProgram: (program: WeeklyProgram) => void;
}

const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

const generateId = () => Math.random().toString(36).substr(2, 9);

const createEmptyWeek = (): WeeklyProgramDay[] => {
    return dayNames.map((name, index) => ({
        dayIndex: index,
        dayName: name,
        templateId: null,
        templateName: null,
        isRestDay: index === 0 || index === 6,
    }));
};

// Default program - Push/Pull/Legs
const defaultProgram: WeeklyProgram = {
    id: 'default-ppl',
    name: 'Push/Pull/Legs',
    isActive: true,
    days: [
        { dayIndex: 0, dayName: 'Pazar', templateId: null, templateName: null, isRestDay: true },
        { dayIndex: 1, dayName: 'Pazartesi', templateId: 'push-day', templateName: 'Push Day', isRestDay: false },
        { dayIndex: 2, dayName: 'Salı', templateId: 'pull-day', templateName: 'Pull Day', isRestDay: false },
        { dayIndex: 3, dayName: 'Çarşamba', templateId: 'leg-day', templateName: 'Leg Day', isRestDay: false },
        { dayIndex: 4, dayName: 'Perşembe', templateId: 'push-day', templateName: 'Push Day', isRestDay: false },
        { dayIndex: 5, dayName: 'Cuma', templateId: 'pull-day', templateName: 'Pull Day', isRestDay: false },
        { dayIndex: 6, dayName: 'Cumartesi', templateId: null, templateName: null, isRestDay: true },
    ],
};

export const useWeeklyProgramStore = create<WeeklyProgramState>((set, get) => ({
    programs: [defaultProgram],
    activeProgram: defaultProgram,
    isLoading: false,
    isSynced: false,

    // Load programs from Firestore
    loadPrograms: async () => {
        const user = useAuthStore.getState().user;
        if (!user) {
            console.log('⚠️ No user logged in, using default program');
            return;
        }

        set({ isLoading: true });

        try {
            const doc = await db.collection('userPrograms').doc(user.uid).get();

            if (doc.exists) {
                const data = doc.data();
                const programs: WeeklyProgram[] = data?.programs || [defaultProgram];
                const activeProgram = programs.find(p => p.isActive) || programs[0] || defaultProgram;

                set({
                    programs,
                    activeProgram,
                    isLoading: false,
                    isSynced: true
                });
                console.log('✅ Programs loaded from Firestore');
            } else {
                // First time user - save default program
                await get().saveToFirestore();
                set({ isLoading: false, isSynced: true });
                console.log('✅ Default program saved for new user');
            }
        } catch (error) {
            console.error('❌ Error loading programs:', error);
            set({ isLoading: false });
        }
    },

    // Save programs to Firestore
    saveToFirestore: async () => {
        const user = useAuthStore.getState().user;
        if (!user) {
            console.log('⚠️ No user logged in, cannot save to Firestore');
            return;
        }

        const { programs } = get();

        try {
            await db.collection('userPrograms').doc(user.uid).set({
                programs,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
            set({ isSynced: true });
            console.log('✅ Programs saved to Firestore');
        } catch (error) {
            console.error('❌ Error saving programs:', error);
        }
    },

    createProgram: (name) => {
        const newProgram: WeeklyProgram = {
            id: generateId(),
            name,
            days: createEmptyWeek(),
            isActive: false,
        };
        set((state) => ({
            programs: [...state.programs, newProgram],
        }));
        get().saveToFirestore();
        return newProgram;
    },

    updateProgram: (programId, updates) => {
        set((state) => ({
            programs: state.programs.map((p) =>
                p.id === programId ? { ...p, ...updates } : p
            ),
            activeProgram: state.activeProgram?.id === programId
                ? { ...state.activeProgram, ...updates }
                : state.activeProgram,
        }));
        get().saveToFirestore();
    },

    deleteProgram: (programId) => {
        set((state) => ({
            programs: state.programs.filter((p) => p.id !== programId),
            activeProgram: state.activeProgram?.id === programId ? null : state.activeProgram,
        }));
        get().saveToFirestore();
    },

    setActiveProgram: (programId) => {
        set((state) => {
            const updatedPrograms = state.programs.map((p) => ({
                ...p,
                isActive: p.id === programId,
            }));
            const activeProgram = updatedPrograms.find((p) => p.id === programId) || null;
            return {
                programs: updatedPrograms,
                activeProgram,
            };
        });
        get().saveToFirestore();
    },

    assignTemplateToDay: (programId, dayIndex, templateId, templateName) => {
        set((state) => ({
            programs: state.programs.map((p) =>
                p.id === programId
                    ? {
                        ...p,
                        days: p.days.map((d) =>
                            d.dayIndex === dayIndex
                                ? { ...d, templateId, templateName, isRestDay: !templateId }
                                : d
                        ),
                    }
                    : p
            ),
            activeProgram: state.activeProgram?.id === programId
                ? {
                    ...state.activeProgram,
                    days: state.activeProgram.days.map((d) =>
                        d.dayIndex === dayIndex
                            ? { ...d, templateId, templateName, isRestDay: !templateId }
                            : d
                    ),
                }
                : state.activeProgram,
        }));
        get().saveToFirestore();
    },

    toggleRestDay: (programId, dayIndex) => {
        set((state) => ({
            programs: state.programs.map((p) =>
                p.id === programId
                    ? {
                        ...p,
                        days: p.days.map((d) =>
                            d.dayIndex === dayIndex
                                ? { ...d, isRestDay: !d.isRestDay, templateId: null, templateName: null }
                                : d
                        ),
                    }
                    : p
            ),
        }));
        get().saveToFirestore();
    },

    // Swap workouts between two days (for drag & drop)
    swapDays: (programId, fromDayIndex, toDayIndex) => {
        if (fromDayIndex === toDayIndex) return;

        set((state) => {
            const updateDays = (days: WeeklyProgramDay[]): WeeklyProgramDay[] => {
                const fromDay = days.find(d => d.dayIndex === fromDayIndex);
                const toDay = days.find(d => d.dayIndex === toDayIndex);

                if (!fromDay || !toDay) return days;

                return days.map((d) => {
                    if (d.dayIndex === fromDayIndex) {
                        return {
                            ...d,
                            templateId: toDay.templateId,
                            templateName: toDay.templateName,
                            isRestDay: toDay.isRestDay,
                        };
                    }
                    if (d.dayIndex === toDayIndex) {
                        return {
                            ...d,
                            templateId: fromDay.templateId,
                            templateName: fromDay.templateName,
                            isRestDay: fromDay.isRestDay,
                        };
                    }
                    return d;
                });
            };

            return {
                programs: state.programs.map((p) =>
                    p.id === programId
                        ? { ...p, days: updateDays(p.days) }
                        : p
                ),
                activeProgram: state.activeProgram?.id === programId
                    ? { ...state.activeProgram, days: updateDays(state.activeProgram.days) }
                    : state.activeProgram,
            };
        });
        get().saveToFirestore();
    },

    getTodaysWorkout: () => {
        const { activeProgram } = get();
        if (!activeProgram) return null;

        const todayIndex = new Date().getDay();
        return activeProgram.days.find((d) => d.dayIndex === todayIndex) || null;
    },

    // Set program directly (used by onboarding)
    setProgram: (program) => {
        set((state) => {
            // Deactivate all other programs and set new one as active
            const updatedPrograms = state.programs.map(p => ({ ...p, isActive: false }));
            const existingIndex = updatedPrograms.findIndex(p => p.id === program.id);

            if (existingIndex >= 0) {
                updatedPrograms[existingIndex] = { ...program, isActive: true };
            } else {
                updatedPrograms.push({ ...program, isActive: true });
            }

            return {
                programs: updatedPrograms,
                activeProgram: { ...program, isActive: true },
            };
        });
        get().saveToFirestore();
    },
}));
