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
    deleteWorkout: (workoutId: string) => Promise<void>;
    loadWorkoutHistory: () => Promise<void>;
    getWorkoutStats: () => WorkoutStats;
    getRecentWorkouts: (limit?: number) => WorkoutRecord[];
    getExerciseHistory: (exerciseId: string) => CompletedExercise[];
    getWorkoutsForDateRange: (startDate: Date, endDate: Date) => WorkoutRecord[];
    resetAllProgress: () => Promise<void>;
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
            // Clean undefined values to prevent Firestore errors
            const cleanExercises = (workout.exercises || []).map(ex => ({
                exerciseId: ex.exerciseId || '',
                exerciseName: ex.exerciseName || '',
                muscleGroup: ex.muscleGroup || '',
                sets: (ex.sets || []).map(s => ({
                    setNumber: s.setNumber || 0,
                    weight: s.weight || 0,
                    reps: s.reps || 0,
                    isCompleted: s.isCompleted || false,
                })),
                totalVolume: ex.totalVolume || 0,
            }));

            const workoutData = {
                userId: user.uid,
                dateLabel: workout.dateLabel || new Date().toLocaleDateString('tr-TR'),
                templateId: workout.templateId || '',
                templateName: workout.templateName || 'Antrenman',
                exercises: cleanExercises,
                duration: workout.duration || 0,
                totalVolume: workout.totalVolume || 0,
                totalSets: workout.totalSets || 0,
                totalReps: workout.totalReps || 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            };

            const docRef = await db.collection('workouts').add(workoutData);

            const savedWorkout = { ...workoutData, id: docRef.id, createdAt: new Date() } as WorkoutRecord;
            set((state) => ({
                workoutHistory: [savedWorkout, ...state.workoutHistory],
                isLoading: false,
            }));

            get().getWorkoutStats();
            console.log('✅ Workout saved successfully:', docRef.id);
        } catch (error: any) {
            console.error('❌ Error saving workout:', error);
            set({ isLoading: false, error: 'Antrenman kaydedilemedi' });
        }
    },

    deleteWorkout: async (workoutId: string) => {
        const user = useAuthStore.getState().user;
        if (!user) {
            console.error('User not logged in');
            return;
        }

        set({ isLoading: true, error: null });

        try {
            // Delete from Firestore
            await db.collection('workouts').doc(workoutId).delete();

            // Remove from local state
            set((state) => ({
                workoutHistory: state.workoutHistory.filter(w => w.id !== workoutId),
                isLoading: false,
            }));

            get().getWorkoutStats();
            console.log('✅ Workout deleted successfully:', workoutId);
        } catch (error: any) {
            console.error('❌ Error deleting workout:', error);
            set({ isLoading: false, error: 'Antrenman silinemedi' });
        }
    },

    loadWorkoutHistory: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        set({ isLoading: true, error: null });

        try {
            // Simple query without orderBy to avoid index requirement
            const snapshot = await db.collection('workouts')
                .where('userId', '==', user.uid)
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

            // Sort locally instead of in Firestore query
            workouts.sort((a, b) => {
                const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
                const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
                return dateB - dateA;
            });

            set({ workoutHistory: workouts, isLoading: false });
            get().getWorkoutStats();
            console.log('✅ Loaded', workouts.length, 'workouts from Firestore');
        } catch (error: any) {
            console.error('❌ Error loading workout history:', error);
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
                const exerciseName = exercise.exerciseName || 'Unknown';
                exerciseCount[exerciseName] = (exerciseCount[exerciseName] || 0) + 1;

                exercise.sets?.forEach((setData) => {
                    // Use exercise name as key (not ID) for display purposes
                    const key = exerciseName;
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

    getWorkoutsForDateRange: (startDate: Date, endDate: Date) => {
        const { workoutHistory } = get();
        return workoutHistory.filter((workout) => {
            const workoutDate = workout.createdAt instanceof Date
                ? workout.createdAt
                : new Date(workout.createdAt);
            return workoutDate >= startDate && workoutDate <= endDate;
        });
    },

    resetAllProgress: async () => {
        const user = useAuthStore.getState().user;
        if (!user) {
            console.error('User not logged in');
            return;
        }

        set({ isLoading: true, error: null });

        try {
            // Delete all workouts from Firestore
            const snapshot = await db.collection('workouts')
                .where('userId', '==', user.uid)
                .get();

            const batch = db.batch();
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();

            // Reset local state
            set({
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
            });

            console.log('✅ All progress reset successfully');
        } catch (error: any) {
            console.error('❌ Error resetting progress:', error);
            set({ isLoading: false, error: 'İlerleme sıfırlanamadı' });
        }
    },
}));
