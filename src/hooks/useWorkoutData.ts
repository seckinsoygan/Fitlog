// FitLog - Workout Data Hook
import { useMemo, useCallback } from 'react';
import { useWorkoutStore, useUserStore, useWeeklyProgramStore } from '../store';
import { Workout, Exercise, Set } from '../types';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useWorkoutData = () => {
    const { templates, profile } = useUserStore();
    const { getTodaysWorkout } = useWeeklyProgramStore();
    const {
        activeWorkout,
        isWorkoutActive,
        workoutHistory,
        startWorkout,
        endWorkout,
        cancelWorkout,
        addExercise,
        removeExercise,
        toggleExerciseExpand,
        addSet,
        updateSet,
        completeSet,
        deleteSet,
    } = useWorkoutStore();

    // Get today's template based on weekly program
    const todaysTemplate = useMemo(() => {
        const todaysWorkout = getTodaysWorkout();
        if (todaysWorkout?.templateId) {
            return templates.find((t) => t.id === todaysWorkout.templateId) || null;
        }
        return templates.length > 0 ? templates[0] : null;
    }, [templates, getTodaysWorkout]);

    // Convert template to workout
    const createWorkoutFromTemplate = useCallback(
        (templateId: string): Workout | null => {
            const template = templates.find((t) => t.id === templateId);
            if (!template) return null;

            const exercises: Exercise[] = template.exercises.map((ex) => ({
                id: generateId(),
                name: ex.name,
                muscleGroup: ex.muscleGroup || '',
                isExpanded: true,
                sets: Array.from({ length: ex.defaultSets || 3 }, (_, i) => ({
                    id: generateId(),
                    setNumber: i + 1,
                    weight: '',
                    reps: '',
                    completed: false,
                })),
            }));

            return {
                id: generateId(),
                name: template.name,
                exercises,
            };
        },
        [templates]
    );

    // Quick start today's workout
    const quickStartToday = useCallback(() => {
        if (todaysTemplate) {
            const workout = createWorkoutFromTemplate(todaysTemplate.id);
            if (workout) {
                startWorkout(workout);
            }
        }
    }, [todaysTemplate, createWorkoutFromTemplate, startWorkout]);

    // Get previous workout data for ghost values
    const getPreviousExerciseData = useCallback(
        (exerciseName: string) => {
            for (const history of workoutHistory) {
                const exercise = history.exercises.find((e) => e.name === exerciseName);
                if (exercise && exercise.sets.length > 0) {
                    return {
                        sets: exercise.sets,
                    };
                }
            }
            return undefined;
        },
        [workoutHistory]
    );

    // Calculate workout stats
    const workoutStats = useMemo(() => {
        if (!activeWorkout) return null;

        const totalSets = activeWorkout.exercises.reduce(
            (sum, ex) => sum + ex.sets.length,
            0
        );
        const completedSets = activeWorkout.exercises.reduce(
            (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
            0
        );
        const totalVolume = activeWorkout.exercises.reduce((total, ex) => {
            return (
                total +
                ex.sets
                    .filter((s) => s.completed)
                    .reduce((setTotal, s) => {
                        const weight = parseFloat(s.weight) || 0;
                        const reps = parseInt(s.reps) || 0;
                        return setTotal + weight * reps;
                    }, 0)
            );
        }, 0);

        return {
            totalSets,
            completedSets,
            progressPercentage: totalSets > 0 ? (completedSets / totalSets) * 100 : 0,
            totalVolume,
        };
    }, [activeWorkout]);

    // Get weekly stats
    const weeklyStats = useMemo(() => {
        const now = Date.now();
        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
        const thisWeekWorkouts = workoutHistory.filter((w) => w.date >= weekAgo);

        return {
            completedCount: thisWeekWorkouts.length,
            goalCount: profile.weeklyGoal,
            totalVolume: thisWeekWorkouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0),
            totalDuration: thisWeekWorkouts.reduce((sum, w) => sum + w.duration, 0),
        };
    }, [workoutHistory, profile.weeklyGoal]);

    return {
        // State
        activeWorkout,
        isWorkoutActive,
        workoutHistory,
        templates,
        todaysTemplate,
        profile,

        // Computed
        workoutStats,
        weeklyStats,

        // Actions
        startWorkout,
        endWorkout,
        cancelWorkout,
        quickStartToday,
        createWorkoutFromTemplate,
        getPreviousExerciseData,

        // Exercise Actions
        addExercise,
        removeExercise,
        toggleExerciseExpand,

        // Set Actions
        addSet,
        updateSet,
        completeSet,
        deleteSet,
    };
};
