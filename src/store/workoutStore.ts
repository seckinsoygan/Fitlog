// FitLog - Workout Store (Zustand with Persistence)
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Exercise, Set, Workout, WorkoutHistory } from '../types';

interface WorkoutState {
    // Active Workout
    activeWorkout: Workout | null;
    isWorkoutActive: boolean;
    workoutStartTime: number | null;

    // Rest Timer State
    restTimerStartTime: number | null;
    restTimerDuration: number;

    // History
    workoutHistory: WorkoutHistory[];

    // Actions
    startWorkout: (workout: Workout) => void;
    endWorkout: () => void;
    cancelWorkout: () => void;

    // Rest Timer Actions
    startRestTimer: (duration: number) => void;
    stopRestTimer: () => void;
    getRemainingRestTime: () => number;

    // Exercise Actions
    addExercise: (exercise: Exercise) => void;
    removeExercise: (exerciseId: string) => void;
    toggleExerciseExpand: (exerciseId: string) => void;

    // Set Actions
    addSet: (exerciseId: string) => void;
    updateSet: (exerciseId: string, setId: string, field: 'weight' | 'reps', value: string) => void;
    completeSet: (exerciseId: string, setId: string) => void;
    deleteSet: (exerciseId: string, setId: string) => void;

    // Utility
    getElapsedWorkoutTime: () => number;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useWorkoutStore = create<WorkoutState>()(
    persist(
        (set, get) => ({
            activeWorkout: null,
            isWorkoutActive: false,
            workoutStartTime: null,
            restTimerStartTime: null,
            restTimerDuration: 90,
            workoutHistory: [],

            getElapsedWorkoutTime: () => {
                const { workoutStartTime } = get();
                if (!workoutStartTime) return 0;
                return Math.floor((Date.now() - workoutStartTime) / 1000);
            },

            startRestTimer: (duration) => {
                set({
                    restTimerStartTime: Date.now(),
                    restTimerDuration: duration,
                });
            },

            stopRestTimer: () => {
                set({
                    restTimerStartTime: null,
                });
            },

            getRemainingRestTime: () => {
                const { restTimerStartTime, restTimerDuration } = get();
                if (!restTimerStartTime) return 0;
                const elapsed = Math.floor((Date.now() - restTimerStartTime) / 1000);
                return Math.max(0, restTimerDuration - elapsed);
            },

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
        }),
        {
            name: 'fitlog-workout-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                activeWorkout: state.activeWorkout,
                isWorkoutActive: state.isWorkoutActive,
                workoutStartTime: state.workoutStartTime,
                restTimerStartTime: state.restTimerStartTime,
                restTimerDuration: state.restTimerDuration,
                // Don't persist workoutHistory - it's managed by workoutHistoryStore
            }),
        }
    )
);
