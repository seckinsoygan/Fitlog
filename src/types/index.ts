// FitLog - Types
export interface Set {
    id: string;
    setNumber: number;
    weight: string;
    reps: string;
    completed: boolean;
    isResting?: boolean;
    completedAt?: number;
}

export interface Exercise {
    id: string;
    name: string;
    muscleGroup: string;
    sets: Set[];
    notes?: string;
    isExpanded?: boolean;
}

export interface Workout {
    id: string;
    name: string;
    exercises: Exercise[];
    startedAt?: number;
    completedAt?: number;
    duration?: number; // in seconds
    notes?: string;
}

export interface WorkoutTemplate {
    id: string;
    name: string;
    exercises: Array<{
        exerciseId: string;
        name: string;
        muscleGroup: string;
        targetSets: number;
    }>;
    dayOfWeek?: number; // 0-6
}

export interface ExerciseDefinition {
    id: string;
    name: string;
    muscleGroup: string;
    equipment?: string;
    instructions?: string;
    isCustom?: boolean;
}

export interface WorkoutHistory {
    id: string;
    workoutId: string;
    name: string;
    date: number; // timestamp
    duration: number;
    exercises: Array<{
        name: string;
        sets: Array<{
            weight: string;
            reps: string;
        }>;
    }>;
    totalVolume?: number; // kg x reps sum
}

export interface UserProfile {
    name: string;
    avatar?: string;
    weeklyGoal: number;
    restTimerDefault: number; // seconds
    weightUnit: 'kg' | 'lbs';
}
