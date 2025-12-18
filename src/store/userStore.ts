// FitLog - User Store (Profile & Templates with Firebase Sync)
import { create } from 'zustand';
import { TrainingStyle, trainingStyleConfigs } from './onboardingStore';
import {
    saveTemplatesToFirestore,
    loadTemplatesFromFirestore,
    saveProfileToFirestore,
    loadProfileFromFirestore
} from '../services/userDataService';

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
    estimatedDuration?: number;
    isCustom?: boolean;
    trainingStyle?: TrainingStyle;
}

export interface UserProfile {
    name: string;
    weeklyGoal: number;
    restTimerDefault: number;
    weightUnit: 'kg' | 'lbs';
    // Body metrics
    age?: number;
    weight?: number; // in kg
    height?: number; // in cm
    targetWeight?: number;
    // Activity goals
    dailySteps?: number;
}

interface UserState {
    profile: UserProfile;
    templates: WorkoutTemplate[];
    isLoaded: boolean;

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
    addPresetProgram: (preset: { name: string; description: string; color: string; exercises: Omit<TemplateExercise, 'id'>[] }) => void;
    setTemplates: (templates: WorkoutTemplate[]) => void;

    // Firebase sync
    syncToFirebase: () => Promise<void>;
    loadFromFirebase: () => Promise<boolean>;

    // Training Style
    createTemplatesForStyle: (style: TrainingStyle, level: 'beginner' | 'intermediate' | 'advanced') => void;

    // Getters
    getTemplateById: (id: string) => WorkoutTemplate | undefined;
    getTodaysTemplate: () => WorkoutTemplate | null;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const defaultProfile: UserProfile = {
    name: 'Sporcu',
    weeklyGoal: 5,
    restTimerDefault: 90,
    weightUnit: 'kg',
};

// Training style based template configurations
const getTemplatesForStyle = (style: TrainingStyle, level: 'beginner' | 'intermediate' | 'advanced'): WorkoutTemplate[] => {
    const config = trainingStyleConfigs[style];
    const sets = level === 'beginner' ? config.setsPerExercise - 1 :
        level === 'advanced' ? config.setsPerExercise + 1 : config.setsPerExercise;

    const templates: Record<TrainingStyle, WorkoutTemplate[]> = {
        strength: [
            {
                id: generateId(),
                name: '💪 Güç - Üst Vücut',
                description: 'Bileşik hareketler, ağır yükler',
                color: '#FF6B6B',
                estimatedDuration: 70,
                trainingStyle: 'strength',
                exercises: [
                    { id: generateId(), name: 'Bench Press', muscleGroup: 'Göğüs', defaultSets: sets },
                    { id: generateId(), name: 'Overhead Press', muscleGroup: 'Omuz', defaultSets: sets },
                    { id: generateId(), name: 'Barbell Row', muscleGroup: 'Sırt', defaultSets: sets },
                    { id: generateId(), name: 'Weighted Pull-Up', muscleGroup: 'Sırt', defaultSets: sets },
                    { id: generateId(), name: 'Close Grip Bench', muscleGroup: 'Triceps', defaultSets: sets - 1 },
                ],
            },
            {
                id: generateId(),
                name: '💪 Güç - Alt Vücut',
                description: 'Squat ve deadlift odaklı',
                color: '#FF6B6B',
                estimatedDuration: 75,
                trainingStyle: 'strength',
                exercises: [
                    { id: generateId(), name: 'Back Squat', muscleGroup: 'Bacak', defaultSets: sets },
                    { id: generateId(), name: 'Deadlift', muscleGroup: 'Sırt/Bacak', defaultSets: sets },
                    { id: generateId(), name: 'Front Squat', muscleGroup: 'Bacak', defaultSets: sets },
                    { id: generateId(), name: 'Romanian Deadlift', muscleGroup: 'Hamstring', defaultSets: sets },
                    { id: generateId(), name: 'Standing Calf Raise', muscleGroup: 'Baldır', defaultSets: sets - 1 },
                ],
            },
        ],
        hypertrophy: [
            {
                id: generateId(),
                name: '🏋️ Push Day',
                description: 'Göğüs, Omuz, Triceps',
                color: '#4ECDC4',
                estimatedDuration: 60,
                trainingStyle: 'hypertrophy',
                exercises: [
                    { id: generateId(), name: 'Bench Press', muscleGroup: 'Göğüs', defaultSets: sets },
                    { id: generateId(), name: 'Incline Dumbbell Press', muscleGroup: 'Göğüs', defaultSets: sets },
                    { id: generateId(), name: 'Cable Fly', muscleGroup: 'Göğüs', defaultSets: sets },
                    { id: generateId(), name: 'Overhead Press', muscleGroup: 'Omuz', defaultSets: sets },
                    { id: generateId(), name: 'Lateral Raise', muscleGroup: 'Omuz', defaultSets: sets },
                    { id: generateId(), name: 'Tricep Pushdown', muscleGroup: 'Triceps', defaultSets: sets },
                ],
            },
            {
                id: generateId(),
                name: '🏋️ Pull Day',
                description: 'Sırt, Biceps',
                color: '#4ECDC4',
                estimatedDuration: 60,
                trainingStyle: 'hypertrophy',
                exercises: [
                    { id: generateId(), name: 'Pull-Up', muscleGroup: 'Sırt', defaultSets: sets },
                    { id: generateId(), name: 'Barbell Row', muscleGroup: 'Sırt', defaultSets: sets },
                    { id: generateId(), name: 'Lat Pulldown', muscleGroup: 'Sırt', defaultSets: sets },
                    { id: generateId(), name: 'Cable Row', muscleGroup: 'Sırt', defaultSets: sets },
                    { id: generateId(), name: 'Face Pull', muscleGroup: 'Arka Omuz', defaultSets: sets },
                    { id: generateId(), name: 'Barbell Curl', muscleGroup: 'Biceps', defaultSets: sets },
                ],
            },
            {
                id: generateId(),
                name: '🏋️ Leg Day',
                description: 'Alt vücut',
                color: '#4ECDC4',
                estimatedDuration: 55,
                trainingStyle: 'hypertrophy',
                exercises: [
                    { id: generateId(), name: 'Squat', muscleGroup: 'Bacak', defaultSets: sets },
                    { id: generateId(), name: 'Leg Press', muscleGroup: 'Bacak', defaultSets: sets },
                    { id: generateId(), name: 'Romanian Deadlift', muscleGroup: 'Hamstring', defaultSets: sets },
                    { id: generateId(), name: 'Leg Extension', muscleGroup: 'Quadriceps', defaultSets: sets },
                    { id: generateId(), name: 'Leg Curl', muscleGroup: 'Hamstring', defaultSets: sets },
                    { id: generateId(), name: 'Calf Raise', muscleGroup: 'Baldır', defaultSets: sets },
                ],
            },
        ],
        endurance: [
            {
                id: generateId(),
                name: '🏃 Dayanıklılık - Tam Vücut A',
                description: 'Yüksek tekrar, düşük dinlenme',
                color: '#45B7D1',
                estimatedDuration: 45,
                trainingStyle: 'endurance',
                exercises: [
                    { id: generateId(), name: 'Goblet Squat', muscleGroup: 'Bacak', defaultSets: sets },
                    { id: generateId(), name: 'Push-Up', muscleGroup: 'Göğüs', defaultSets: sets },
                    { id: generateId(), name: 'Dumbbell Row', muscleGroup: 'Sırt', defaultSets: sets },
                    { id: generateId(), name: 'Lunges', muscleGroup: 'Bacak', defaultSets: sets },
                    { id: generateId(), name: 'Plank', muscleGroup: 'Core', defaultSets: sets },
                ],
            },
            {
                id: generateId(),
                name: '🏃 Dayanıklılık - Tam Vücut B',
                description: 'Devre antrenmanı',
                color: '#45B7D1',
                estimatedDuration: 45,
                trainingStyle: 'endurance',
                exercises: [
                    { id: generateId(), name: 'Kettlebell Swing', muscleGroup: 'Tam Vücut', defaultSets: sets },
                    { id: generateId(), name: 'Mountain Climber', muscleGroup: 'Core', defaultSets: sets },
                    { id: generateId(), name: 'Box Step-Up', muscleGroup: 'Bacak', defaultSets: sets },
                    { id: generateId(), name: 'Battle Rope', muscleGroup: 'Kol', defaultSets: sets },
                    { id: generateId(), name: 'Burpee', muscleGroup: 'Tam Vücut', defaultSets: sets },
                ],
            },
        ],
        weight_loss: [
            {
                id: generateId(),
                name: '🔥 HIIT Üst Vücut',
                description: 'Yüksek yoğunluklu interval',
                color: '#F39C12',
                estimatedDuration: 30,
                trainingStyle: 'weight_loss',
                exercises: [
                    { id: generateId(), name: 'Push-Up', muscleGroup: 'Göğüs', defaultSets: sets },
                    { id: generateId(), name: 'Dumbbell Snatch', muscleGroup: 'Omuz', defaultSets: sets },
                    { id: generateId(), name: 'Renegade Row', muscleGroup: 'Sırt', defaultSets: sets },
                    { id: generateId(), name: 'Burpee', muscleGroup: 'Tam Vücut', defaultSets: sets },
                    { id: generateId(), name: 'Mountain Climber', muscleGroup: 'Core', defaultSets: sets },
                ],
            },
            {
                id: generateId(),
                name: '🔥 HIIT Alt Vücut',
                description: 'Kalori yakıcı bacak antrenmanı',
                color: '#F39C12',
                estimatedDuration: 30,
                trainingStyle: 'weight_loss',
                exercises: [
                    { id: generateId(), name: 'Jump Squat', muscleGroup: 'Bacak', defaultSets: sets },
                    { id: generateId(), name: 'Kettlebell Swing', muscleGroup: 'Tam Vücut', defaultSets: sets },
                    { id: generateId(), name: 'Walking Lunges', muscleGroup: 'Bacak', defaultSets: sets },
                    { id: generateId(), name: 'Box Jump', muscleGroup: 'Bacak', defaultSets: sets },
                    { id: generateId(), name: 'Sprint', muscleGroup: 'Kardio', defaultSets: sets },
                ],
            },
            {
                id: generateId(),
                name: '🔥 Devre Antrenmanı',
                description: 'Tam vücut metabolik',
                color: '#F39C12',
                estimatedDuration: 35,
                trainingStyle: 'weight_loss',
                exercises: [
                    { id: generateId(), name: 'Thrusters', muscleGroup: 'Tam Vücut', defaultSets: sets },
                    { id: generateId(), name: 'Pull-Up', muscleGroup: 'Sırt', defaultSets: sets },
                    { id: generateId(), name: 'Box Step-Up', muscleGroup: 'Bacak', defaultSets: sets },
                    { id: generateId(), name: 'Plank', muscleGroup: 'Core', defaultSets: sets },
                    { id: generateId(), name: 'Battle Rope', muscleGroup: 'Kardio', defaultSets: sets },
                ],
            },
        ],
        general_fitness: [
            {
                id: generateId(),
                name: '⭐ Tam Vücut A',
                description: 'Dengeli antrenman',
                color: '#9B59B6',
                estimatedDuration: 50,
                trainingStyle: 'general_fitness',
                exercises: [
                    { id: generateId(), name: 'Squat', muscleGroup: 'Bacak', defaultSets: sets },
                    { id: generateId(), name: 'Bench Press', muscleGroup: 'Göğüs', defaultSets: sets },
                    { id: generateId(), name: 'Barbell Row', muscleGroup: 'Sırt', defaultSets: sets },
                    { id: generateId(), name: 'Overhead Press', muscleGroup: 'Omuz', defaultSets: sets },
                    { id: generateId(), name: 'Plank', muscleGroup: 'Core', defaultSets: sets },
                ],
            },
            {
                id: generateId(),
                name: '⭐ Tam Vücut B',
                description: 'Alternatif günler için',
                color: '#9B59B6',
                estimatedDuration: 50,
                trainingStyle: 'general_fitness',
                exercises: [
                    { id: generateId(), name: 'Deadlift', muscleGroup: 'Sırt/Bacak', defaultSets: sets },
                    { id: generateId(), name: 'Incline Press', muscleGroup: 'Göğüs', defaultSets: sets },
                    { id: generateId(), name: 'Pull-Up', muscleGroup: 'Sırt', defaultSets: sets },
                    { id: generateId(), name: 'Lunges', muscleGroup: 'Bacak', defaultSets: sets },
                    { id: generateId(), name: 'Bicep Curl', muscleGroup: 'Biceps', defaultSets: sets },
                ],
            },
        ],
    };

    return templates[style] || templates.general_fitness;
};

export const useUserStore = create<UserState>((set, get) => ({
    profile: defaultProfile,
    templates: [],
    isLoaded: false,

    updateProfile: (updates) => {
        set((state) => ({
            profile: { ...state.profile, ...updates },
        }));
        // Sync to Firebase
        const { profile } = get();
        saveProfileToFirestore({ ...profile, ...updates });
    },

    createTemplatesForStyle: (style, level) => {
        const newTemplates = getTemplatesForStyle(style, level);
        set({ templates: newTemplates });
        // Sync to Firebase
        saveTemplatesToFirestore(newTemplates);
    },

    setTemplates: (templates) => {
        set({ templates, isLoaded: true });
    },

    addTemplate: (template) => {
        const newTemplate: WorkoutTemplate = {
            ...template,
            id: generateId(),
            isCustom: true,
        };
        set((state) => {
            const newTemplates = [...state.templates, newTemplate];
            // Sync to Firebase
            saveTemplatesToFirestore(newTemplates);
            return { templates: newTemplates };
        });
        return newTemplate;
    },

    updateTemplate: (id, updates) => {
        set((state) => {
            const newTemplates = state.templates.map((t) =>
                t.id === id ? { ...t, ...updates } : t
            );
            // Sync to Firebase
            saveTemplatesToFirestore(newTemplates);
            return { templates: newTemplates };
        });
    },

    deleteTemplate: (id) => {
        set((state) => {
            const newTemplates = state.templates.filter((t) => t.id !== id);
            // Sync to Firebase
            saveTemplatesToFirestore(newTemplates);
            return { templates: newTemplates };
        });
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
        set((state) => {
            const newTemplates = [...state.templates, newTemplate];
            // Sync to Firebase
            saveTemplatesToFirestore(newTemplates);
            return { templates: newTemplates };
        });
        return newTemplate;
    },

    addExerciseToTemplate: (templateId, exercise) => {
        const newExercise: TemplateExercise = {
            ...exercise,
            id: generateId(),
        };
        set((state) => {
            const newTemplates = state.templates.map((t) =>
                t.id === templateId
                    ? { ...t, exercises: [...t.exercises, newExercise] }
                    : t
            );
            // Sync to Firebase
            saveTemplatesToFirestore(newTemplates);
            return { templates: newTemplates };
        });
    },

    removeExerciseFromTemplate: (templateId, exerciseId) => {
        set((state) => {
            const newTemplates = state.templates.map((t) =>
                t.id === templateId
                    ? { ...t, exercises: t.exercises.filter((e) => e.id !== exerciseId) }
                    : t
            );
            // Sync to Firebase
            saveTemplatesToFirestore(newTemplates);
            return { templates: newTemplates };
        });
    },

    reorderExercisesInTemplate: (templateId, exerciseIds) => {
        set((state) => {
            const newTemplates = state.templates.map((t) => {
                if (t.id !== templateId) return t;
                const reordered = exerciseIds
                    .map((id) => t.exercises.find((e) => e.id === id))
                    .filter(Boolean) as TemplateExercise[];
                return { ...t, exercises: reordered };
            });
            // Sync to Firebase
            saveTemplatesToFirestore(newTemplates);
            return { templates: newTemplates };
        });
    },

    addPresetProgram: (preset) => {
        const newTemplate: WorkoutTemplate = {
            id: generateId(),
            name: preset.name,
            description: preset.description,
            color: preset.color,
            isCustom: false,
            estimatedDuration: 60,
            exercises: preset.exercises.map((ex) => ({
                ...ex,
                id: generateId(),
            })),
        };
        set((state) => {
            const newTemplates = [...state.templates, newTemplate];
            // Sync to Firebase
            saveTemplatesToFirestore(newTemplates);
            return { templates: newTemplates };
        });
    },

    // Firebase sync methods
    syncToFirebase: async () => {
        const { templates, profile } = get();
        await saveTemplatesToFirestore(templates);
        await saveProfileToFirestore(profile);
    },

    loadFromFirebase: async () => {
        try {
            const [templates, profile] = await Promise.all([
                loadTemplatesFromFirestore(),
                loadProfileFromFirestore(),
            ]);

            if (templates && templates.length > 0) {
                set({ templates, isLoaded: true });
            }
            if (profile) {
                set((state) => ({
                    profile: { ...state.profile, ...profile },
                }));
            }

            return true;
        } catch (error) {
            console.error('Error loading from Firebase:', error);
            return false;
        }
    },

    getTemplateById: (id) => {
        const { templates } = get();
        return templates.find((t) => t.id === id);
    },

    getTodaysTemplate: () => {
        const { templates } = get();
        if (templates.length === 0) return null;
        const dayOfWeek = new Date().getDay();
        // Simple rotation based on available templates
        return templates[dayOfWeek % templates.length] || null;
    },
}));

