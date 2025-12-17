// FitLog - Workout History Store with Firebase (Compat Mode)
import { create } from 'zustand';
import firebase from 'firebase/compat/app';
import { db } from '../config/firebase';
import { useAuthStore } from './authStore';

export interface CompletedSet {
    setNumber: number;
    weight: number;
    reps: number;
    isCompleted: boolean;
}

export interface CompletedExercise {
    exerciseId: string;
    exerciseName: string;
    muscleGroup: string;
    sets: CompletedSet[];
    totalVolume: number;
}

export interface WorkoutRecord {
    id?: string;
    userId: string;
    dateLabel: string;
    templateId?: string;
    templateName?: string;
    exercises: CompletedExercise[];
    duration: number;
    totalVolume: number;
    totalSets: number;
    totalReps: number;
    createdAt?: any;
}

export interface WorkoutStats {
    totalWorkouts: number;
    thisWeekWorkouts: number;
    thisMonthWorkouts: number;
    totalVolume: number;
    averageDuration: number;
    favoriteExercise?: string;
    personalRecords: Record<string, { weight: number; reps: number; date: string }>;
}

interface WorkoutHistoryState {
    workoutHistory: WorkoutRecord[];
    stats: WorkoutStats;
    isLoading: boolean;
    error: string | null;

    saveWorkout: (workout: Omit<WorkoutRecord, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
    loadWorkoutHistory: () => Promise<void>;
    getWorkoutStats: () => WorkoutStats;
    getRecentWorkouts: (limit?: number) => WorkoutRecord[];
    getExerciseHistory: (exerciseId: string) => CompletedExercise[];
}

export const useWorkoutHistoryStore = create<WorkoutHistoryState>((set, get) => ({
    workoutHistory: [],
    stats: {
        totalWorkouts: 0,
        thisWeekWorkouts: 0,
        thisMonthWorkouts: 0,
        totalVolume: 0,
        averageDuration: 0,
        personalRecords: {},
    },
    isLoading: false,
    error: null,

    saveWorkout: async (workout) => {
        const user = useAuthStore.getState().user;
        if (!user) {
            console.error('User not logged in');
            return;
        }

        set({ isLoading: true, error: null });

        try {
            const workoutData = {
                ...workout,
                userId: user.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            };

            const docRef = await db.collection('workouts').add(workoutData);

            const savedWorkout = { ...workoutData, id: docRef.id } as WorkoutRecord;
            set((state) => ({
                workoutHistory: [savedWorkout, ...state.workoutHistory],
                isLoading: false,
            }));

            get().getWorkoutStats();
            console.log('Workout saved successfully:', docRef.id);
        } catch (error: any) {
            console.error('Error saving workout:', error);
            set({ isLoading: false, error: 'Antrenman kaydedilemedi' });
        }
    },

    loadWorkoutHistory: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        set({ isLoading: true, error: null });

        try {
            const snapshot = await db.collection('workouts')
                .where('userId', '==', user.uid)
                .orderBy('createdAt', 'desc')
                .limit(50)
                .get();

            const workouts: WorkoutRecord[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                workouts.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.() || new Date(),
                } as WorkoutRecord);
            });

            set({ workoutHistory: workouts, isLoading: false });
            get().getWorkoutStats();
        } catch (error: any) {
            console.error('Error loading workout history:', error);
            set({ isLoading: false, error: 'Antrenman geçmişi yüklenemedi' });
        }
    },

    getWorkoutStats: () => {
        const { workoutHistory } = get();

        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let totalVolume = 0;
        let totalDuration = 0;
        let thisWeekWorkouts = 0;
        let thisMonthWorkouts = 0;
        const exerciseCount: Record<string, number> = {};
        const personalRecords: Record<string, { weight: number; reps: number; date: string }> = {};

        workoutHistory.forEach((workout) => {
            totalVolume += workout.totalVolume || 0;
            totalDuration += workout.duration || 0;

            const workoutDate = workout.createdAt instanceof Date
                ? workout.createdAt
                : new Date();

            if (workoutDate >= startOfWeek) thisWeekWorkouts++;
            if (workoutDate >= startOfMonth) thisMonthWorkouts++;

            workout.exercises?.forEach((exercise) => {
                exerciseCount[exercise.exerciseName] = (exerciseCount[exercise.exerciseName] || 0) + 1;

                exercise.sets?.forEach((setData) => {
                    const key = exercise.exerciseId;
                    const currentPR = personalRecords[key];
                    if (!currentPR || setData.weight > currentPR.weight) {
                        personalRecords[key] = {
                            weight: setData.weight,
                            reps: setData.reps,
                            date: workout.dateLabel,
                        };
                    }
                });
            });
        });

        let favoriteExercise: string | undefined;
        let maxCount = 0;
        Object.entries(exerciseCount).forEach(([name, count]) => {
            if (count > maxCount) {
                maxCount = count;
                favoriteExercise = name;
            }
        });

        const stats: WorkoutStats = {
            totalWorkouts: workoutHistory.length,
            thisWeekWorkouts,
            thisMonthWorkouts,
            totalVolume,
            averageDuration: workoutHistory.length > 0
                ? Math.round(totalDuration / workoutHistory.length)
                : 0,
            favoriteExercise,
            personalRecords,
        };

        set({ stats });
        return stats;
    },

    getRecentWorkouts: (limitCount = 10) => {
        return get().workoutHistory.slice(0, limitCount);
    },

    getExerciseHistory: (exerciseId) => {
        const history: CompletedExercise[] = [];
        get().workoutHistory.forEach((workout) => {
            workout.exercises?.forEach((exercise) => {
                if (exercise.exerciseId === exerciseId) {
                    history.push(exercise);
                }
            });
        });
        return history;
    },
}));
