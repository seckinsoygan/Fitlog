// FitLog - Exercise Library Store
import { create } from 'zustand';
import { ExerciseDefinition } from '../types';

// Exercise with YouTube video
interface ExerciseWithVideo extends ExerciseDefinition {
    youtubeVideoId?: string;
    videoSource?: string;
    instructions?: string;
}

// Comprehensive exercise library (70+ exercises)
const defaultExercises: ExerciseWithVideo[] = [
    // ==================== GÖĞÜS (Chest) ====================
    { id: 'chest-1', name: 'Bench Press', muscleGroup: 'Göğüs', equipment: 'Barbell', youtubeVideoId: 'VmB1G1K7v94' },
    { id: 'chest-2', name: 'Incline Bench Press', muscleGroup: 'Göğüs', equipment: 'Barbell', youtubeVideoId: 'SrqOu55lrYU' },
    { id: 'chest-3', name: 'Decline Bench Press', muscleGroup: 'Göğüs', equipment: 'Barbell', youtubeVideoId: 'LfyQBUKR8SE' },
    { id: 'chest-4', name: 'Dumbbell Bench Press', muscleGroup: 'Göğüs', equipment: 'Dumbbell', youtubeVideoId: 'VmB1G1K7v94' },
    { id: 'chest-5', name: 'Incline Dumbbell Press', muscleGroup: 'Göğüs', equipment: 'Dumbbell', youtubeVideoId: '0G2_XV7slIg' },
    { id: 'chest-6', name: 'Decline Dumbbell Press', muscleGroup: 'Göğüs', equipment: 'Dumbbell', youtubeVideoId: 'LfyQBUKR8SE' },
    { id: 'chest-7', name: 'Cable Fly', muscleGroup: 'Göğüs', equipment: 'Cable', youtubeVideoId: 'WEM9FCIPlxQ' },
    { id: 'chest-8', name: 'Incline Cable Fly', muscleGroup: 'Göğüs', equipment: 'Cable', youtubeVideoId: 'WEM9FCIPlxQ' },
    { id: 'chest-9', name: 'Dumbbell Fly', muscleGroup: 'Göğüs', equipment: 'Dumbbell', youtubeVideoId: 'eozdVDA78K0' },
    { id: 'chest-10', name: 'Chest Dips', muscleGroup: 'Göğüs', equipment: 'Bodyweight', youtubeVideoId: 'wjUmnZH528Y' },
    { id: 'chest-11', name: 'Push-Up', muscleGroup: 'Göğüs', equipment: 'Bodyweight', youtubeVideoId: '_l3ySVKYVJ8' },
    { id: 'chest-12', name: 'Diamond Push-Up', muscleGroup: 'Göğüs', equipment: 'Bodyweight', youtubeVideoId: 'J0DnG1_S92I' },
    { id: 'chest-13', name: 'Incline Push-Up', muscleGroup: 'Göğüs', equipment: 'Bodyweight', youtubeVideoId: 'cfns5VDVVvk' },
    { id: 'chest-14', name: 'Decline Push-Up', muscleGroup: 'Göğüs', equipment: 'Bodyweight', youtubeVideoId: 'SKPab2YC8BE' },
    { id: 'chest-15', name: 'Machine Chest Press', muscleGroup: 'Göğüs', equipment: 'Machine', youtubeVideoId: 'xUm0BiZCWlQ' },
    { id: 'chest-16', name: 'Pec Deck Machine', muscleGroup: 'Göğüs', equipment: 'Machine', youtubeVideoId: 'Z57CtFmRMxA' },
    { id: 'chest-17', name: 'Chest Cable Crossover', muscleGroup: 'Göğüs', equipment: 'Cable', youtubeVideoId: 'taI4XduLpTk' },
    { id: 'chest-18', name: 'Svend Press', muscleGroup: 'Göğüs', equipment: 'Plate', youtubeVideoId: 'rT7DgCr-3pg' },

    // ==================== SIRT (Back) ====================
    { id: 'back-1', name: 'Deadlift', muscleGroup: 'Sırt', equipment: 'Barbell', youtubeVideoId: 'hCDzSR6bW10' },
    { id: 'back-2', name: 'Sumo Deadlift', muscleGroup: 'Sırt', equipment: 'Barbell', youtubeVideoId: 'lDt8HwxVST0' },
    { id: 'back-3', name: 'Romanian Deadlift', muscleGroup: 'Sırt', equipment: 'Barbell', youtubeVideoId: '_oyxCn2iSjU' },
    { id: 'back-4', name: 'Pull-Up', muscleGroup: 'Sırt', equipment: 'Bodyweight', youtubeVideoId: 'sIvJTfGxdFo' },
    { id: 'back-5', name: 'Chin-Up', muscleGroup: 'Sırt', equipment: 'Bodyweight', youtubeVideoId: 'brhRXlOhsAM' },
    { id: 'back-6', name: 'Neutral Grip Pull-Up', muscleGroup: 'Sırt', equipment: 'Bodyweight', youtubeVideoId: 'GIA4poN3c4I' },
    { id: 'back-7', name: 'Barbell Row', muscleGroup: 'Sırt', equipment: 'Barbell', youtubeVideoId: '9efgcAjQe7E' },
    { id: 'back-8', name: 'Pendlay Row', muscleGroup: 'Sırt', equipment: 'Barbell', youtubeVideoId: 'ZlRrIsoDpKg' },
    { id: 'back-9', name: 'Dumbbell Row', muscleGroup: 'Sırt', equipment: 'Dumbbell', youtubeVideoId: 'xl1YBkLjMH0' },
    { id: 'back-10', name: 'Lat Pulldown', muscleGroup: 'Sırt', equipment: 'Cable', youtubeVideoId: 'SALxEARiMkw' },
    { id: 'back-11', name: 'Close Grip Lat Pulldown', muscleGroup: 'Sırt', equipment: 'Cable', youtubeVideoId: 'ecRF8ERf2q4' },
    { id: 'back-12', name: 'Seated Cable Row', muscleGroup: 'Sırt', equipment: 'Cable', youtubeVideoId: 'UCXxvItLoM' },
    { id: 'back-13', name: 'T-Bar Row', muscleGroup: 'Sırt', equipment: 'Barbell', youtubeVideoId: 'yPis7GtOw5A' },
    { id: 'back-14', name: 'Cable Pullover', muscleGroup: 'Sırt', equipment: 'Cable', youtubeVideoId: 'gw7bOaZxTFM' },
    { id: 'back-15', name: 'Rack Pull', muscleGroup: 'Sırt', equipment: 'Barbell', youtubeVideoId: 'V6agwGixfQo' },
    { id: 'back-16', name: 'Hyperextension', muscleGroup: 'Sırt', equipment: 'Bodyweight', youtubeVideoId: 'ph3pddpKzzw' },
    { id: 'back-17', name: 'Meadows Row', muscleGroup: 'Sırt', equipment: 'Barbell', youtubeVideoId: 'wpfJG2bVyns' },
    { id: 'back-18', name: 'Straight Arm Pulldown', muscleGroup: 'Sırt', equipment: 'Cable', youtubeVideoId: 'gw7bOaZxTFM' },

    // ==================== OMUZ (Shoulders) ====================
    { id: 'shoulder-1', name: 'Overhead Press', muscleGroup: 'Omuz', equipment: 'Barbell', youtubeVideoId: 'F3QY5vMz_6I' },
    { id: 'shoulder-2', name: 'Push Press', muscleGroup: 'Omuz', equipment: 'Barbell', youtubeVideoId: 'X6-DMh-t4nQ' },
    { id: 'shoulder-3', name: 'Dumbbell Shoulder Press', muscleGroup: 'Omuz', equipment: 'Dumbbell', youtubeVideoId: 'M2rwvNhTOu0' },
    { id: 'shoulder-4', name: 'Arnold Press', muscleGroup: 'Omuz', equipment: 'Dumbbell', youtubeVideoId: '3ml7BH7mNwQ' },
    { id: 'shoulder-5', name: 'Lateral Raise', muscleGroup: 'Omuz', equipment: 'Dumbbell', youtubeVideoId: 'kDqklk1ZESo' },
    { id: 'shoulder-6', name: 'Cable Lateral Raise', muscleGroup: 'Omuz', equipment: 'Cable', youtubeVideoId: 'DgL4lEcWyks' },
    { id: 'shoulder-7', name: 'Front Raise', muscleGroup: 'Omuz', equipment: 'Dumbbell', youtubeVideoId: '-t7fuZ0KhDA' },
    { id: 'shoulder-8', name: 'Face Pull', muscleGroup: 'Omuz', equipment: 'Cable', youtubeVideoId: 'HSoHeSjvIdY' },
    { id: 'shoulder-9', name: 'Rear Delt Fly', muscleGroup: 'Omuz', equipment: 'Dumbbell', youtubeVideoId: 'ttvfGg9d76c' },
    { id: 'shoulder-10', name: 'Reverse Pec Deck', muscleGroup: 'Omuz', equipment: 'Machine', youtubeVideoId: '5YK4bgzXDV0' },
    { id: 'shoulder-11', name: 'Upright Row', muscleGroup: 'Omuz', equipment: 'Barbell', youtubeVideoId: 'ljO4jkwv8wQ' },
    { id: 'shoulder-12', name: 'Shrugs', muscleGroup: 'Omuz', equipment: 'Dumbbell', youtubeVideoId: 'g6qbq4Lf1FI' },
    { id: 'shoulder-13', name: 'Barbell Shrugs', muscleGroup: 'Omuz', equipment: 'Barbell', youtubeVideoId: 'NAqCVe2mwzM' },
    { id: 'shoulder-14', name: 'Machine Shoulder Press', muscleGroup: 'Omuz', equipment: 'Machine', youtubeVideoId: 'Wqq43dKW1TU' },
    { id: 'shoulder-15', name: 'Lu Raise', muscleGroup: 'Omuz', equipment: 'Dumbbell', youtubeVideoId: 'evOjFeVtBxU' },

    // ==================== BACAK (Legs) ====================
    { id: 'leg-1', name: 'Squat', muscleGroup: 'Bacak', equipment: 'Barbell', youtubeVideoId: 'Dy28eq_PjQ0' },
    { id: 'leg-2', name: 'Front Squat', muscleGroup: 'Bacak', equipment: 'Barbell', youtubeVideoId: 'tlfahNdNPPI' },
    { id: 'leg-3', name: 'Goblet Squat', muscleGroup: 'Bacak', equipment: 'Dumbbell', youtubeVideoId: 'MeIiIdhvXT4' },
    { id: 'leg-4', name: 'Hack Squat', muscleGroup: 'Bacak', equipment: 'Machine', youtubeVideoId: 'EdtaJRBqwes' },
    { id: 'leg-5', name: 'Leg Press', muscleGroup: 'Bacak', equipment: 'Machine', youtubeVideoId: 'yZmx_Ac3880' },
    { id: 'leg-6', name: 'Bulgarian Split Squat', muscleGroup: 'Bacak', equipment: 'Dumbbell', youtubeVideoId: '2C-uNgKwPLE' },
    { id: 'leg-7', name: 'Lunges', muscleGroup: 'Bacak', equipment: 'Bodyweight', youtubeVideoId: 'QOVaHwm-Q6U' },
    { id: 'leg-8', name: 'Walking Lunges', muscleGroup: 'Bacak', equipment: 'Dumbbell', youtubeVideoId: 'L8fvypPrzzs' },
    { id: 'leg-9', name: 'Leg Extension', muscleGroup: 'Bacak', equipment: 'Machine', youtubeVideoId: 'm0FOpMEgero' },
    { id: 'leg-10', name: 'Leg Curl', muscleGroup: 'Bacak', equipment: 'Machine', youtubeVideoId: 'ELOCsoDSmrg' },
    { id: 'leg-11', name: 'Seated Leg Curl', muscleGroup: 'Bacak', equipment: 'Machine', youtubeVideoId: 'Orxowest56U' },
    { id: 'leg-12', name: 'Standing Calf Raise', muscleGroup: 'Bacak', equipment: 'Machine', youtubeVideoId: '-M4-G8p8fmc' },
    { id: 'leg-13', name: 'Seated Calf Raise', muscleGroup: 'Bacak', equipment: 'Machine', youtubeVideoId: 'JbyjNymZOt0' },
    { id: 'leg-14', name: 'Hip Thrust', muscleGroup: 'Bacak', equipment: 'Barbell', youtubeVideoId: 'SEdqd1n0cvg' },
    { id: 'leg-15', name: 'Glute Bridge', muscleGroup: 'Bacak', equipment: 'Bodyweight', youtubeVideoId: '8bbE64NuDTU' },
    { id: 'leg-16', name: 'Step-Up', muscleGroup: 'Bacak', equipment: 'Dumbbell', youtubeVideoId: 'dQqApCGd5Ss' },
    { id: 'leg-17', name: 'Sissy Squat', muscleGroup: 'Bacak', equipment: 'Bodyweight', youtubeVideoId: '0NUzpKdZ0ug' },
    { id: 'leg-18', name: 'Good Morning', muscleGroup: 'Bacak', equipment: 'Barbell', youtubeVideoId: 'I0uhDivhUKw' },
    { id: 'leg-19', name: 'Box Squat', muscleGroup: 'Bacak', equipment: 'Barbell', youtubeVideoId: 'M4ogegqfgqI' },
    { id: 'leg-20', name: 'Sumo Squat', muscleGroup: 'Bacak', equipment: 'Dumbbell', youtubeVideoId: '9ZuXKqRbT9k' },

    // ==================== KOL (Arms) ====================
    // Biceps
    { id: 'arm-1', name: 'Bicep Curl', muscleGroup: 'Kol', equipment: 'Dumbbell', youtubeVideoId: 'ykJmrZ5v0Oo' },
    { id: 'arm-2', name: 'Barbell Curl', muscleGroup: 'Kol', equipment: 'Barbell', youtubeVideoId: 'JnLFSFurrqQ' },
    { id: 'arm-3', name: 'Hammer Curl', muscleGroup: 'Kol', equipment: 'Dumbbell', youtubeVideoId: 'TwD-YGVP4Bk' },
    { id: 'arm-4', name: 'Preacher Curl', muscleGroup: 'Kol', equipment: 'Barbell', youtubeVideoId: 'vngli9UR6Hw' },
    { id: 'arm-5', name: 'Concentration Curl', muscleGroup: 'Kol', equipment: 'Dumbbell', youtubeVideoId: 'Jvj2wV0vOYU' },
    { id: 'arm-6', name: 'Cable Curl', muscleGroup: 'Kol', equipment: 'Cable', youtubeVideoId: 'NFzTWp2qpiE' },
    { id: 'arm-7', name: 'Incline Dumbbell Curl', muscleGroup: 'Kol', equipment: 'Dumbbell', youtubeVideoId: 'soxrZlIl35U' },
    { id: 'arm-8', name: 'Spider Curl', muscleGroup: 'Kol', equipment: 'Dumbbell', youtubeVideoId: 'kXLsD4Y-2hE' },
    { id: 'arm-9', name: 'EZ Bar Curl', muscleGroup: 'Kol', equipment: 'Barbell', youtubeVideoId: 'zG2xJ0Q5QtI' },
    { id: 'arm-10', name: 'Reverse Curl', muscleGroup: 'Kol', equipment: 'Barbell', youtubeVideoId: 'nRgxYX2Ve9w' },
    // Triceps
    { id: 'arm-11', name: 'Tricep Pushdown', muscleGroup: 'Kol', equipment: 'Cable', youtubeVideoId: '6Fzep104f0s' },
    { id: 'arm-12', name: 'Rope Pushdown', muscleGroup: 'Kol', equipment: 'Cable', youtubeVideoId: 'kiuVA0gs3EI' },
    { id: 'arm-13', name: 'Skull Crusher', muscleGroup: 'Kol', equipment: 'Barbell', youtubeVideoId: 'l3rHYPtMUo8' },
    { id: 'arm-14', name: 'Close-Grip Bench Press', muscleGroup: 'Kol', equipment: 'Barbell', youtubeVideoId: 'wxVRe9pmJdk' },
    { id: 'arm-15', name: 'Overhead Tricep Extension', muscleGroup: 'Kol', equipment: 'Dumbbell', youtubeVideoId: 'YbX7Wd8jQ-Q' },
    { id: 'arm-16', name: 'Tricep Dips', muscleGroup: 'Kol', equipment: 'Bodyweight', youtubeVideoId: '0326dy_-CzM' },
    { id: 'arm-17', name: 'Diamond Push-Up', muscleGroup: 'Kol', equipment: 'Bodyweight', youtubeVideoId: 'J0DnG1_S92I' },
    { id: 'arm-18', name: 'Tricep Kickback', muscleGroup: 'Kol', equipment: 'Dumbbell', youtubeVideoId: '6SS6K3lAwZ8' },
    { id: 'arm-19', name: 'Cable Overhead Extension', muscleGroup: 'Kol', equipment: 'Cable', youtubeVideoId: 'WvLM4CwCOZk' },
    // Forearms
    { id: 'arm-20', name: 'Wrist Curl', muscleGroup: 'Kol', equipment: 'Dumbbell', youtubeVideoId: 'v5lCJb2RaL8' },
    { id: 'arm-21', name: 'Reverse Wrist Curl', muscleGroup: 'Kol', equipment: 'Dumbbell', youtubeVideoId: 'F7dLXCLbdLE' },
    { id: 'arm-22', name: 'Farmer Walk', muscleGroup: 'Kol', equipment: 'Dumbbell', youtubeVideoId: 'Fkzk_RqlYig' },

    // ==================== KARIN (Core/Abs) ====================
    { id: 'core-1', name: 'Plank', muscleGroup: 'Karın', equipment: 'Bodyweight', youtubeVideoId: 'pSHjTRCQxIw' },
    { id: 'core-2', name: 'Side Plank', muscleGroup: 'Karın', equipment: 'Bodyweight', youtubeVideoId: '_6dsnVMxoKs' },
    { id: 'core-3', name: 'Crunch', muscleGroup: 'Karın', equipment: 'Bodyweight', youtubeVideoId: 'Xyd_fa5zoEU' },
    { id: 'core-4', name: 'Cable Crunch', muscleGroup: 'Karın', equipment: 'Cable', youtubeVideoId: 'ToJeyhydUxU' },
    { id: 'core-5', name: 'Hanging Leg Raise', muscleGroup: 'Karın', equipment: 'Bodyweight', youtubeVideoId: 'QyVq5oUBpss' },
    { id: 'core-6', name: 'Hanging Knee Raise', muscleGroup: 'Karın', equipment: 'Bodyweight', youtubeVideoId: 'Pr1ieGZ5atk' },
    { id: 'core-7', name: 'Ab Wheel Rollout', muscleGroup: 'Karın', equipment: 'Equipment', youtubeVideoId: 'PwxgwidWjNc' },
    { id: 'core-8', name: 'Russian Twist', muscleGroup: 'Karın', equipment: 'Bodyweight', youtubeVideoId: 'wkD8rjkodUI' },
    { id: 'core-9', name: 'Bicycle Crunch', muscleGroup: 'Karın', equipment: 'Bodyweight', youtubeVideoId: '9FGilxCbdz8' },
    { id: 'core-10', name: 'Mountain Climber', muscleGroup: 'Karın', equipment: 'Bodyweight', youtubeVideoId: 'nmwgirgXLYM' },
    { id: 'core-11', name: 'Dead Bug', muscleGroup: 'Karın', equipment: 'Bodyweight', youtubeVideoId: 'I5xbsA71v3A' },
    { id: 'core-12', name: 'Pallof Press', muscleGroup: 'Karın', equipment: 'Cable', youtubeVideoId: 'AH_QZLm_0-s' },
    { id: 'core-13', name: 'Leg Raise', muscleGroup: 'Karın', equipment: 'Bodyweight', youtubeVideoId: 'JB2oyawG9KI' },
    { id: 'core-14', name: 'V-Up', muscleGroup: 'Karın', equipment: 'Bodyweight', youtubeVideoId: 'iP2fjvG0g3w' },
    { id: 'core-15', name: 'Decline Sit-Up', muscleGroup: 'Karın', equipment: 'Bodyweight', youtubeVideoId: '-bVetX6hSoE' },
];

interface ExerciseLibraryState {
    exercises: ExerciseWithVideo[];
    searchQuery: string;
    selectedMuscleGroup: string | null;
    selectedExercise: ExerciseWithVideo | null;

    setSearchQuery: (query: string) => void;
    setSelectedMuscleGroup: (group: string | null) => void;
    setSelectedExercise: (exercise: ExerciseWithVideo | null) => void;
    addCustomExercise: (exercise: Omit<ExerciseWithVideo, 'id' | 'isCustom'>) => void;
    deleteExercise: (id: string) => void;
    getFilteredExercises: () => ExerciseWithVideo[];
    getMuscleGroups: () => string[];
    getExerciseById: (id: string) => ExerciseWithVideo | undefined;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useExerciseLibraryStore = create<ExerciseLibraryState>((set, get) => ({
    exercises: defaultExercises,
    searchQuery: '',
    selectedMuscleGroup: null,
    selectedExercise: null,

    setSearchQuery: (query) => set({ searchQuery: query }),
    setSelectedMuscleGroup: (group) => set({ selectedMuscleGroup: group }),
    setSelectedExercise: (exercise) => set({ selectedExercise: exercise }),

    addCustomExercise: (exercise) => {
        const newExercise: ExerciseWithVideo = {
            ...exercise,
            id: generateId(),
            isCustom: true,
        };
        set((state) => ({
            exercises: [...state.exercises, newExercise],
        }));
    },

    deleteExercise: (id) => {
        set((state) => ({
            exercises: state.exercises.filter((e) => e.id !== id),
        }));
    },

    getFilteredExercises: () => {
        const { exercises, searchQuery, selectedMuscleGroup } = get();

        return exercises.filter((exercise) => {
            const matchesSearch = !searchQuery ||
                exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                exercise.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesMuscleGroup = !selectedMuscleGroup ||
                exercise.muscleGroup === selectedMuscleGroup;

            return matchesSearch && matchesMuscleGroup;
        });
    },

    getMuscleGroups: () => {
        const { exercises } = get();
        return [...new Set(exercises.map((e) => e.muscleGroup))];
    },

    getExerciseById: (id) => {
        const { exercises } = get();
        return exercises.find((e) => e.id === id);
    },
}));

export type { ExerciseWithVideo };
