// FitLog - Workout Store (Zustand)
import { create } from 'zustand';
import { Exercise, Set, Workout, WorkoutHistory } from '../types';

interface WorkoutState {
    // Active Workout
    activeWorkout: Workout | null;
    isWorkoutActive: boolean;
    workoutStartTime: number | null;

    // History
    workoutHistory: WorkoutHistory[];

    // Actions
    startWorkout: (workout: Workout) => void;
    endWorkout: () => void;
    cancelWorkout: () => void;

    // Exercise Actions
    addExercise: (exercise: Exercise) => void;
    removeExercise: (exerciseId: string) => void;
    toggleExerciseExpand: (exerciseId: string) => void;

    // Set Actions
    addSet: (exerciseId: string) => void;
    updateSet: (exerciseId: string, setId: string, field: 'weight' | 'reps', value: string) => void;
    completeSet: (exerciseId: string, setId: string) => void;
    deleteSet: (exerciseId: string, setId: string) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
    activeWorkout: null,
    isWorkoutActive: false,
    workoutStartTime: null,
    workoutHistory: [],

    startWorkout: (workout) => {
        set({
            activeWorkout: {
                ...workout,
                startedAt: Date.now(),
            },
            isWorkoutActive: true,
            workoutStartTime: Date.now(),
        });
    },

    endWorkout: () => {
        const { activeWorkout, workoutStartTime, workoutHistory } = get();
        if (!activeWorkout || !workoutStartTime) return;

        const duration = Math.floor((Date.now() - workoutStartTime) / 1000);

        const historyEntry: WorkoutHistory = {
            id: generateId(),
            workoutId: activeWorkout.id,
            name: activeWorkout.name,
            date: Date.now(),
            duration,
            exercises: activeWorkout.exercises.map((ex) => ({
                name: ex.name,
                sets: ex.sets
                    .filter((s) => s.completed)
                    .map((s) => ({ weight: s.weight, reps: s.reps })),
            })),
            totalVolume: activeWorkout.exercises.reduce((total, ex) => {
                return total + ex.sets
                    .filter((s) => s.completed)
                    .reduce((setTotal, s) => {
                        const weight = parseFloat(s.weight) || 0;
                        const reps = parseInt(s.reps) || 0;
                        return setTotal + weight * reps;
                    }, 0);
            }, 0),
        };

        set({
            activeWorkout: null,
            isWorkoutActive: false,
            workoutStartTime: null,
            workoutHistory: [historyEntry, ...workoutHistory],
        });
    },

    cancelWorkout: () => {
        set({
            activeWorkout: null,
            isWorkoutActive: false,
            workoutStartTime: null,
        });
    },

    addExercise: (exercise) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;

        set({
            activeWorkout: {
                ...activeWorkout,
                exercises: [...activeWorkout.exercises, exercise],
            },
        });
    },

    removeExercise: (exerciseId) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;

        set({
            activeWorkout: {
                ...activeWorkout,
                exercises: activeWorkout.exercises.filter((e) => e.id !== exerciseId),
            },
        });
    },

    toggleExerciseExpand: (exerciseId) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;

        set({
            activeWorkout: {
                ...activeWorkout,
                exercises: activeWorkout.exercises.map((e) =>
                    e.id === exerciseId ? { ...e, isExpanded: !e.isExpanded } : e
                ),
            },
        });
    },

    addSet: (exerciseId) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;

        set({
            activeWorkout: {
                ...activeWorkout,
                exercises: activeWorkout.exercises.map((e) => {
                    if (e.id !== exerciseId) return e;

                    const newSet: Set = {
                        id: generateId(),
                        setNumber: e.sets.length + 1,
                        weight: '',
                        reps: '',
                        completed: false,
                    };

                    return { ...e, sets: [...e.sets, newSet] };
                }),
            },
        });
    },

    updateSet: (exerciseId, setId, field, value) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;

        set({
            activeWorkout: {
                ...activeWorkout,
                exercises: activeWorkout.exercises.map((e) => {
                    if (e.id !== exerciseId) return e;

                    return {
                        ...e,
                        sets: e.sets.map((s) =>
                            s.id === setId ? { ...s, [field]: value } : s
                        ),
                    };
                }),
            },
        });
    },

    completeSet: (exerciseId, setId) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;

        set({
            activeWorkout: {
                ...activeWorkout,
                exercises: activeWorkout.exercises.map((e) => {
                    if (e.id !== exerciseId) return e;

                    return {
                        ...e,
                        sets: e.sets.map((s) =>
                            s.id === setId
                                ? { ...s, completed: true, completedAt: Date.now() }
                                : s
                        ),
                    };
                }),
            },
        });
    },

    deleteSet: (exerciseId, setId) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;

        set({
            activeWorkout: {
                ...activeWorkout,
                exercises: activeWorkout.exercises.map((e) => {
                    if (e.id !== exerciseId) return e;

                    const filteredSets = e.sets.filter((s) => s.id !== setId);
                    // Renumber sets
                    return {
                        ...e,
                        sets: filteredSets.map((s, index) => ({
                            ...s,
                            setNumber: index + 1,
                        })),
                    };
                }),
            },
        });
    },
}));
