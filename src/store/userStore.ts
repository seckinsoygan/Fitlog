// FitLog - User Store (Profile & Templates)
import { create } from 'zustand';

export interface TemplateExercise {
    id: string;
    name: string;
    muscleGroup?: string;
    defaultSets: number;
}

export interface WorkoutTemplate {
    id: string;
    name: string;
    description?: string;
    exercises: TemplateExercise[];
    color?: string;
    estimatedDuration?: number; // minutes
    isCustom?: boolean;
}

export interface UserProfile {
    name: string;
    weeklyGoal: number;
    restTimerDefault: number;
    weightUnit: 'kg' | 'lbs';
}

interface UserState {
    profile: UserProfile;
    templates: WorkoutTemplate[];

    // Profile actions
    updateProfile: (updates: Partial<UserProfile>) => void;

    // Template actions
    addTemplate: (template: Omit<WorkoutTemplate, 'id'>) => WorkoutTemplate;
    updateTemplate: (id: string, updates: Partial<WorkoutTemplate>) => void;
    deleteTemplate: (id: string) => void;
    duplicateTemplate: (id: string) => WorkoutTemplate | null;
    addExerciseToTemplate: (templateId: string, exercise: Omit<TemplateExercise, 'id'>) => void;
    removeExerciseFromTemplate: (templateId: string, exerciseId: string) => void;
    reorderExercisesInTemplate: (templateId: string, exerciseIds: string[]) => void;

    // Getters
    getTemplateById: (id: string) => WorkoutTemplate | undefined;
    getTodaysTemplate: () => WorkoutTemplate | null;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const defaultTemplates: WorkoutTemplate[] = [
    {
        id: 'push-day',
        name: 'Push Day',
        description: 'Göğüs, Omuz ve Triceps',
        color: '#EF4444',
        estimatedDuration: 60,
        exercises: [
            { id: 'e1', name: 'Bench Press', muscleGroup: 'Göğüs', defaultSets: 4 },
            { id: 'e2', name: 'Incline Dumbbell Press', muscleGroup: 'Göğüs', defaultSets: 3 },
            { id: 'e3', name: 'Cable Fly', muscleGroup: 'Göğüs', defaultSets: 3 },
            { id: 'e4', name: 'Overhead Press', muscleGroup: 'Omuz', defaultSets: 4 },
            { id: 'e5', name: 'Lateral Raise', muscleGroup: 'Omuz', defaultSets: 3 },
            { id: 'e6', name: 'Tricep Pushdown', muscleGroup: 'Kol', defaultSets: 3 },
            { id: 'e7', name: 'Skull Crusher', muscleGroup: 'Kol', defaultSets: 3 },
        ],
    },
    {
        id: 'pull-day',
        name: 'Pull Day',
        description: 'Sırt ve Biceps',
        color: '#3B82F6',
        estimatedDuration: 60,
        exercises: [
            { id: 'e8', name: 'Deadlift', muscleGroup: 'Sırt', defaultSets: 4 },
            { id: 'e9', name: 'Pull-Up', muscleGroup: 'Sırt', defaultSets: 4 },
            { id: 'e10', name: 'Barbell Row', muscleGroup: 'Sırt', defaultSets: 4 },
            { id: 'e11', name: 'Lat Pulldown', muscleGroup: 'Sırt', defaultSets: 3 },
            { id: 'e12', name: 'Face Pull', muscleGroup: 'Omuz', defaultSets: 3 },
            { id: 'e13', name: 'Barbell Curl', muscleGroup: 'Kol', defaultSets: 3 },
            { id: 'e14', name: 'Hammer Curl', muscleGroup: 'Kol', defaultSets: 3 },
        ],
    },
    {
        id: 'leg-day',
        name: 'Leg Day',
        description: 'Alt vücut',
        color: '#22C55E',
        estimatedDuration: 55,
        exercises: [
            { id: 'e15', name: 'Squat', muscleGroup: 'Bacak', defaultSets: 4 },
            { id: 'e16', name: 'Leg Press', muscleGroup: 'Bacak', defaultSets: 4 },
            { id: 'e17', name: 'Romanian Deadlift', muscleGroup: 'Bacak', defaultSets: 3 },
            { id: 'e18', name: 'Leg Extension', muscleGroup: 'Bacak', defaultSets: 3 },
            { id: 'e19', name: 'Leg Curl', muscleGroup: 'Bacak', defaultSets: 3 },
            { id: 'e20', name: 'Standing Calf Raise', muscleGroup: 'Bacak', defaultSets: 4 },
        ],
    },
];

const defaultProfile: UserProfile = {
    name: 'Sporcu',
    weeklyGoal: 5,
    restTimerDefault: 90,
    weightUnit: 'kg',
};

export const useUserStore = create<UserState>((set, get) => ({
    profile: defaultProfile,
    templates: defaultTemplates,

    updateProfile: (updates) => {
        set((state) => ({
            profile: { ...state.profile, ...updates },
        }));
    },

    addTemplate: (template) => {
        const newTemplate: WorkoutTemplate = {
            ...template,
            id: generateId(),
            isCustom: true,
        };
        set((state) => ({
            templates: [...state.templates, newTemplate],
        }));
        return newTemplate;
    },

    updateTemplate: (id, updates) => {
        set((state) => ({
            templates: state.templates.map((t) =>
                t.id === id ? { ...t, ...updates } : t
            ),
        }));
    },

    deleteTemplate: (id) => {
        set((state) => ({
            templates: state.templates.filter((t) => t.id !== id),
        }));
    },

    duplicateTemplate: (id) => {
        const { templates } = get();
        const template = templates.find((t) => t.id === id);
        if (!template) return null;

        const newTemplate: WorkoutTemplate = {
            ...template,
            id: generateId(),
            name: `${template.name} (Kopya)`,
            isCustom: true,
            exercises: template.exercises.map((e) => ({ ...e, id: generateId() })),
        };
        set((state) => ({
            templates: [...state.templates, newTemplate],
        }));
        return newTemplate;
    },

    addExerciseToTemplate: (templateId, exercise) => {
        const newExercise: TemplateExercise = {
            ...exercise,
            id: generateId(),
        };
        set((state) => ({
            templates: state.templates.map((t) =>
                t.id === templateId
                    ? { ...t, exercises: [...t.exercises, newExercise] }
                    : t
            ),
        }));
    },

    removeExerciseFromTemplate: (templateId, exerciseId) => {
        set((state) => ({
            templates: state.templates.map((t) =>
                t.id === templateId
                    ? { ...t, exercises: t.exercises.filter((e) => e.id !== exerciseId) }
                    : t
            ),
        }));
    },

    reorderExercisesInTemplate: (templateId, exerciseIds) => {
        set((state) => ({
            templates: state.templates.map((t) => {
                if (t.id !== templateId) return t;
                const reordered = exerciseIds
                    .map((id) => t.exercises.find((e) => e.id === id))
                    .filter(Boolean) as TemplateExercise[];
                return { ...t, exercises: reordered };
            }),
        }));
    },

    getTemplateById: (id) => {
        const { templates } = get();
        return templates.find((t) => t.id === id);
    },

    getTodaysTemplate: () => {
        const { templates } = get();
        const dayOfWeek = new Date().getDay();
        // Simple rotation: Push, Pull, Legs, Push, Pull, Rest, Rest
        const schedule = [null, 'push-day', 'pull-day', 'leg-day', 'push-day', 'pull-day', null];
        const templateId = schedule[dayOfWeek];
        if (!templateId) return null;
        return templates.find((t) => t.id === templateId) || null;
    },
}));
