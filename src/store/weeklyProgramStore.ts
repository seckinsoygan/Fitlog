// FitLog - Weekly Program Store with Drag & Drop Support
import { create } from 'zustand';

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

    // Actions
    createProgram: (name: string) => WeeklyProgram;
    updateProgram: (programId: string, updates: Partial<WeeklyProgram>) => void;
    deleteProgram: (programId: string) => void;
    setActiveProgram: (programId: string) => void;
    assignTemplateToDay: (programId: string, dayIndex: number, templateId: string | null, templateName: string | null) => void;
    toggleRestDay: (programId: string, dayIndex: number) => void;
    swapDays: (programId: string, fromDayIndex: number, toDayIndex: number) => void;
    getTodaysWorkout: () => WeeklyProgramDay | null;
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
    },

    deleteProgram: (programId) => {
        set((state) => ({
            programs: state.programs.filter((p) => p.id !== programId),
            activeProgram: state.activeProgram?.id === programId ? null : state.activeProgram,
        }));
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
                        // FromDay gets toDay's workout
                        return {
                            ...d,
                            templateId: toDay.templateId,
                            templateName: toDay.templateName,
                            isRestDay: toDay.isRestDay,
                        };
                    }
                    if (d.dayIndex === toDayIndex) {
                        // ToDay gets fromDay's workout
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
    },

    getTodaysWorkout: () => {
        const { activeProgram } = get();
        if (!activeProgram) return null;

        const todayIndex = new Date().getDay();
        return activeProgram.days.find((d) => d.dayIndex === todayIndex) || null;
    },
}));
