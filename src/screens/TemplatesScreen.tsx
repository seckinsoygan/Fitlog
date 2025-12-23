// FitLog - Templates Screen with Dynamic Theme
import React from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Pressable,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Dumbbell, ChevronRight, Copy, Clock, Edit3, Play, Download, Zap, Target, Trash2, Check } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { layout, spacing } from '../theme/spacing';
import { Typography, H1, H2, Button } from '../components/atoms';
import { useUserStore, useThemeStore } from '../store';
import { useTranslation } from '../i18n';

// Web-compatible alert
const showAlert = (title: string, message: string, buttons?: any[]) => {
    if (Platform.OS === 'web') {
        if (buttons && buttons.length > 1) {
            const result = window.confirm(`${title}\n\n${message}`);
            if (result) {
                const confirmBtn = buttons.find(b => b.style !== 'cancel');
                confirmBtn?.onPress?.();
            }
        } else {
            window.alert(`${title}\n\n${message}`);
        }
    } else {
        Alert.alert(title, message, buttons);
    }
};

export const TemplatesScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const colors = useThemeStore((state) => state.colors);
    const { templates, duplicateTemplate, addPresetProgram, clearAllTemplates, isPresetAdded } = useUserStore();
    const { t } = useTranslation();

    // Preset programs with full daily workout plans
    const presetPrograms = [
        // 3-Day Push/Pull/Legs
        {
            id: 'preset-ppl-3day',
            name: 'Push/Pull/Legs (3 Gün)',
            description: t.templates.ppl3DayDescription,
            emoji: '💪',
            color: '#FF6B6B',
            daysPerWeek: 3,
            days: [
                {
                    name: 'Push Day',
                    exercises: [
                        { name: 'Bench Press', muscleGroup: 'Göğüs', sets: 4, reps: 8 },
                        { name: 'Incline Dumbbell Press', muscleGroup: 'Göğüs', sets: 3, reps: 10 },
                        { name: 'Shoulder Press', muscleGroup: 'Omuz', sets: 4, reps: 10 },
                        { name: 'Lateral Raise', muscleGroup: 'Omuz', sets: 3, reps: 12 },
                        { name: 'Triceps Pushdown', muscleGroup: 'Kol', sets: 3, reps: 12 },
                        { name: 'Overhead Triceps Extension', muscleGroup: 'Kol', sets: 3, reps: 12 },
                    ],
                },
                {
                    name: 'Pull Day',
                    exercises: [
                        { name: 'Deadlift', muscleGroup: 'Sırt', sets: 4, reps: 6 },
                        { name: 'Pull Up', muscleGroup: 'Sırt', sets: 4, reps: 8 },
                        { name: 'Barbell Row', muscleGroup: 'Sırt', sets: 4, reps: 10 },
                        { name: 'Face Pull', muscleGroup: 'Omuz', sets: 3, reps: 15 },
                        { name: 'Barbell Curl', muscleGroup: 'Kol', sets: 3, reps: 10 },
                        { name: 'Hammer Curl', muscleGroup: 'Kol', sets: 3, reps: 12 },
                    ],
                },
                {
                    name: 'Leg Day',
                    exercises: [
                        { name: 'Squat', muscleGroup: 'Bacak', sets: 4, reps: 8 },
                        { name: 'Romanian Deadlift', muscleGroup: 'Bacak', sets: 4, reps: 10 },
                        { name: 'Leg Press', muscleGroup: 'Bacak', sets: 3, reps: 12 },
                        { name: 'Leg Curl', muscleGroup: 'Bacak', sets: 3, reps: 12 },
                        { name: 'Leg Extension', muscleGroup: 'Bacak', sets: 3, reps: 15 },
                        { name: 'Calf Raise', muscleGroup: 'Bacak', sets: 4, reps: 15 },
                    ],
                },
            ],
        },
        // 6-Day Push/Pull/Legs
        {
            id: 'preset-ppl-6day',
            name: 'Push/Pull/Legs (6 Gün)',
            description: t.templates.ppl6DayDescription,
            emoji: '🔥',
            color: '#E74C3C',
            daysPerWeek: 6,
            days: [
                {
                    name: 'Push A',
                    exercises: [
                        { name: 'Bench Press', muscleGroup: 'Göğüs', sets: 4, reps: 6 },
                        { name: 'Overhead Press', muscleGroup: 'Omuz', sets: 4, reps: 8 },
                        { name: 'Incline Dumbbell Press', muscleGroup: 'Göğüs', sets: 3, reps: 10 },
                        { name: 'Lateral Raise', muscleGroup: 'Omuz', sets: 4, reps: 12 },
                        { name: 'Triceps Dips', muscleGroup: 'Kol', sets: 3, reps: 10 },
                        { name: 'Triceps Pushdown', muscleGroup: 'Kol', sets: 3, reps: 12 },
                    ],
                },
                {
                    name: 'Pull A',
                    exercises: [
                        { name: 'Deadlift', muscleGroup: 'Sırt', sets: 4, reps: 5 },
                        { name: 'Pull Up', muscleGroup: 'Sırt', sets: 4, reps: 8 },
                        { name: 'Barbell Row', muscleGroup: 'Sırt', sets: 4, reps: 8 },
                        { name: 'Face Pull', muscleGroup: 'Omuz', sets: 3, reps: 15 },
                        { name: 'Barbell Curl', muscleGroup: 'Kol', sets: 4, reps: 10 },
                        { name: 'Hammer Curl', muscleGroup: 'Kol', sets: 3, reps: 12 },
                    ],
                },
                {
                    name: 'Legs A',
                    exercises: [
                        { name: 'Squat', muscleGroup: 'Bacak', sets: 5, reps: 5 },
                        { name: 'Romanian Deadlift', muscleGroup: 'Bacak', sets: 4, reps: 10 },
                        { name: 'Leg Press', muscleGroup: 'Bacak', sets: 4, reps: 12 },
                        { name: 'Leg Curl', muscleGroup: 'Bacak', sets: 4, reps: 12 },
                        { name: 'Calf Raise', muscleGroup: 'Bacak', sets: 5, reps: 15 },
                        { name: 'Ab Crunch', muscleGroup: 'Karın', sets: 3, reps: 20 },
                    ],
                },
                {
                    name: 'Push B',
                    exercises: [
                        { name: 'Incline Bench Press', muscleGroup: 'Göğüs', sets: 4, reps: 8 },
                        { name: 'Dumbbell Shoulder Press', muscleGroup: 'Omuz', sets: 4, reps: 10 },
                        { name: 'Cable Fly', muscleGroup: 'Göğüs', sets: 3, reps: 12 },
                        { name: 'Front Raise', muscleGroup: 'Omuz', sets: 3, reps: 12 },
                        { name: 'Overhead Triceps Extension', muscleGroup: 'Kol', sets: 3, reps: 12 },
                        { name: 'Rope Pushdown', muscleGroup: 'Kol', sets: 3, reps: 15 },
                    ],
                },
                {
                    name: 'Pull B',
                    exercises: [
                        { name: 'Lat Pulldown', muscleGroup: 'Sırt', sets: 4, reps: 10 },
                        { name: 'Cable Row', muscleGroup: 'Sırt', sets: 4, reps: 10 },
                        { name: 'T-Bar Row', muscleGroup: 'Sırt', sets: 3, reps: 10 },
                        { name: 'Rear Delt Fly', muscleGroup: 'Omuz', sets: 3, reps: 15 },
                        { name: 'Preacher Curl', muscleGroup: 'Kol', sets: 3, reps: 12 },
                        { name: 'Reverse Curl', muscleGroup: 'Kol', sets: 3, reps: 12 },
                    ],
                },
                {
                    name: 'Legs B',
                    exercises: [
                        { name: 'Front Squat', muscleGroup: 'Bacak', sets: 4, reps: 8 },
                        { name: 'Walking Lunges', muscleGroup: 'Bacak', sets: 3, reps: 12 },
                        { name: 'Leg Extension', muscleGroup: 'Bacak', sets: 4, reps: 15 },
                        { name: 'Glute Bridge', muscleGroup: 'Bacak', sets: 4, reps: 12 },
                        { name: 'Seated Calf Raise', muscleGroup: 'Bacak', sets: 4, reps: 20 },
                        { name: 'Hanging Leg Raise', muscleGroup: 'Karın', sets: 3, reps: 15 },
                    ],
                },
            ],
        },
        // 4-Day Upper/Lower Split
        {
            id: 'preset-upper-lower-4day',
            name: 'Upper/Lower (4 Gün)',
            description: t.templates.upperLower4DayDescription,
            emoji: '⚡',
            color: '#9B59B6',
            daysPerWeek: 4,
            days: [
                {
                    name: 'Upper A',
                    exercises: [
                        { name: 'Bench Press', muscleGroup: 'Göğüs', sets: 4, reps: 6 },
                        { name: 'Barbell Row', muscleGroup: 'Sırt', sets: 4, reps: 6 },
                        { name: 'Overhead Press', muscleGroup: 'Omuz', sets: 3, reps: 8 },
                        { name: 'Pull Up', muscleGroup: 'Sırt', sets: 3, reps: 8 },
                        { name: 'Barbell Curl', muscleGroup: 'Kol', sets: 3, reps: 10 },
                        { name: 'Triceps Pushdown', muscleGroup: 'Kol', sets: 3, reps: 10 },
                    ],
                },
                {
                    name: 'Lower A',
                    exercises: [
                        { name: 'Squat', muscleGroup: 'Bacak', sets: 4, reps: 6 },
                        { name: 'Romanian Deadlift', muscleGroup: 'Bacak', sets: 4, reps: 8 },
                        { name: 'Leg Press', muscleGroup: 'Bacak', sets: 3, reps: 10 },
                        { name: 'Leg Curl', muscleGroup: 'Bacak', sets: 3, reps: 10 },
                        { name: 'Calf Raise', muscleGroup: 'Bacak', sets: 4, reps: 12 },
                        { name: 'Plank', muscleGroup: 'Karın', sets: 3, reps: 60 },
                    ],
                },
                {
                    name: 'Upper B',
                    exercises: [
                        { name: 'Incline Dumbbell Press', muscleGroup: 'Göğüs', sets: 4, reps: 8 },
                        { name: 'Cable Row', muscleGroup: 'Sırt', sets: 4, reps: 10 },
                        { name: 'Dumbbell Shoulder Press', muscleGroup: 'Omuz', sets: 3, reps: 10 },
                        { name: 'Lat Pulldown', muscleGroup: 'Sırt', sets: 3, reps: 10 },
                        { name: 'Hammer Curl', muscleGroup: 'Kol', sets: 3, reps: 12 },
                        { name: 'Overhead Triceps Extension', muscleGroup: 'Kol', sets: 3, reps: 12 },
                    ],
                },
                {
                    name: 'Lower B',
                    exercises: [
                        { name: 'Deadlift', muscleGroup: 'Sırt', sets: 4, reps: 5 },
                        { name: 'Front Squat', muscleGroup: 'Bacak', sets: 3, reps: 8 },
                        { name: 'Walking Lunges', muscleGroup: 'Bacak', sets: 3, reps: 12 },
                        { name: 'Leg Extension', muscleGroup: 'Bacak', sets: 3, reps: 15 },
                        { name: 'Seated Calf Raise', muscleGroup: 'Bacak', sets: 4, reps: 15 },
                        { name: 'Ab Crunch', muscleGroup: 'Karın', sets: 3, reps: 20 },
                    ],
                },
            ],
        },
        // 5-Day Bro Split
        {
            id: 'preset-bro-split-5day',
            name: 'Bro Split (5 Gün)',
            description: t.templates.broSplit5DayDescription,
            emoji: '🏆',
            color: '#2ECC71',
            daysPerWeek: 5,
            days: [
                {
                    name: 'Göğüs Günü',
                    exercises: [
                        { name: 'Bench Press', muscleGroup: 'Göğüs', sets: 4, reps: 8 },
                        { name: 'Incline Dumbbell Press', muscleGroup: 'Göğüs', sets: 4, reps: 10 },
                        { name: 'Cable Fly', muscleGroup: 'Göğüs', sets: 3, reps: 12 },
                        { name: 'Dumbbell Pullover', muscleGroup: 'Göğüs', sets: 3, reps: 12 },
                        { name: 'Chest Dips', muscleGroup: 'Göğüs', sets: 3, reps: 10 },
                    ],
                },
                {
                    name: 'Sırt Günü',
                    exercises: [
                        { name: 'Deadlift', muscleGroup: 'Sırt', sets: 4, reps: 6 },
                        { name: 'Pull Up', muscleGroup: 'Sırt', sets: 4, reps: 8 },
                        { name: 'Barbell Row', muscleGroup: 'Sırt', sets: 4, reps: 10 },
                        { name: 'T-Bar Row', muscleGroup: 'Sırt', sets: 3, reps: 10 },
                        { name: 'Lat Pulldown', muscleGroup: 'Sırt', sets: 3, reps: 12 },
                    ],
                },
                {
                    name: 'Omuz Günü',
                    exercises: [
                        { name: 'Overhead Press', muscleGroup: 'Omuz', sets: 4, reps: 8 },
                        { name: 'Dumbbell Shoulder Press', muscleGroup: 'Omuz', sets: 3, reps: 10 },
                        { name: 'Lateral Raise', muscleGroup: 'Omuz', sets: 4, reps: 12 },
                        { name: 'Front Raise', muscleGroup: 'Omuz', sets: 3, reps: 12 },
                        { name: 'Rear Delt Fly', muscleGroup: 'Omuz', sets: 3, reps: 15 },
                        { name: 'Shrugs', muscleGroup: 'Omuz', sets: 3, reps: 12 },
                    ],
                },
                {
                    name: 'Bacak Günü',
                    exercises: [
                        { name: 'Squat', muscleGroup: 'Bacak', sets: 5, reps: 5 },
                        { name: 'Leg Press', muscleGroup: 'Bacak', sets: 4, reps: 12 },
                        { name: 'Romanian Deadlift', muscleGroup: 'Bacak', sets: 4, reps: 10 },
                        { name: 'Leg Curl', muscleGroup: 'Bacak', sets: 3, reps: 12 },
                        { name: 'Leg Extension', muscleGroup: 'Bacak', sets: 3, reps: 15 },
                        { name: 'Calf Raise', muscleGroup: 'Bacak', sets: 5, reps: 15 },
                    ],
                },
                {
                    name: 'Kol Günü',
                    exercises: [
                        { name: 'Barbell Curl', muscleGroup: 'Kol', sets: 4, reps: 10 },
                        { name: 'Close Grip Bench Press', muscleGroup: 'Kol', sets: 4, reps: 10 },
                        { name: 'Hammer Curl', muscleGroup: 'Kol', sets: 3, reps: 12 },
                        { name: 'Triceps Pushdown', muscleGroup: 'Kol', sets: 3, reps: 12 },
                        { name: 'Preacher Curl', muscleGroup: 'Kol', sets: 3, reps: 12 },
                        { name: 'Overhead Triceps Extension', muscleGroup: 'Kol', sets: 3, reps: 12 },
                    ],
                },
            ],
        },
        // 3-Day Full Body
        {
            id: 'preset-fullbody-3day',
            name: 'Full Body (3 Gün)',
            description: t.templates.fullBody3DayDescription,
            emoji: '🏋️',
            color: '#4ECDC4',
            daysPerWeek: 3,
            days: [
                {
                    name: 'Full Body A',
                    exercises: [
                        { name: 'Squat', muscleGroup: 'Bacak', sets: 4, reps: 6 },
                        { name: 'Bench Press', muscleGroup: 'Göğüs', sets: 4, reps: 6 },
                        { name: 'Barbell Row', muscleGroup: 'Sırt', sets: 4, reps: 6 },
                        { name: 'Overhead Press', muscleGroup: 'Omuz', sets: 3, reps: 8 },
                        { name: 'Barbell Curl', muscleGroup: 'Kol', sets: 2, reps: 10 },
                        { name: 'Triceps Pushdown', muscleGroup: 'Kol', sets: 2, reps: 10 },
                    ],
                },
                {
                    name: 'Full Body B',
                    exercises: [
                        { name: 'Deadlift', muscleGroup: 'Sırt', sets: 4, reps: 5 },
                        { name: 'Incline Dumbbell Press', muscleGroup: 'Göğüs', sets: 4, reps: 8 },
                        { name: 'Pull Up', muscleGroup: 'Sırt', sets: 4, reps: 8 },
                        { name: 'Leg Press', muscleGroup: 'Bacak', sets: 3, reps: 10 },
                        { name: 'Lateral Raise', muscleGroup: 'Omuz', sets: 3, reps: 12 },
                        { name: 'Hammer Curl', muscleGroup: 'Kol', sets: 2, reps: 12 },
                    ],
                },
                {
                    name: 'Full Body C',
                    exercises: [
                        { name: 'Front Squat', muscleGroup: 'Bacak', sets: 4, reps: 8 },
                        { name: 'Dumbbell Shoulder Press', muscleGroup: 'Omuz', sets: 4, reps: 8 },
                        { name: 'Cable Row', muscleGroup: 'Sırt', sets: 4, reps: 10 },
                        { name: 'Dumbbell Bench Press', muscleGroup: 'Göğüs', sets: 3, reps: 10 },
                        { name: 'Romanian Deadlift', muscleGroup: 'Bacak', sets: 3, reps: 10 },
                        { name: 'Face Pull', muscleGroup: 'Omuz', sets: 3, reps: 15 },
                    ],
                },
            ],
        },
    ];

    const handleCreateNew = () => navigation.navigate('TemplateEditor', { isNew: true });
    const handleEditTemplate = (templateId: string) => navigation.navigate('TemplateEditor', { templateId, isNew: false });
    const handleDuplicate = (templateId: string) => duplicateTemplate(templateId);
    const handleStartWorkout = (templateId: string) => navigation.navigate('ActiveWorkout', { templateId });

    const handleAddPreset = (preset: typeof presetPrograms[0]) => {
        // Check if this preset is already added
        if (isPresetAdded(preset.name)) {
            showAlert(
                t.templates.alreadyAdded || 'Zaten Eklendi',
                t.templates.alreadyAddedMessage || 'Bu program zaten eklenmiş.',
            );
            return;
        }

        // Her gün için ayrı bir template oluştur
        preset.days.forEach((day, dayIndex) => {
            addPresetProgram({
                name: `${preset.name} - ${day.name}`,
                description: `${preset.description} (${dayIndex + 1}/${preset.days.length})`,
                color: preset.color,
                exercises: day.exercises.map((ex: { name: string; muscleGroup: string; sets: number; reps: number }, i: number) => ({
                    id: `${preset.id}-day${dayIndex}-ex-${i}`,
                    exerciseId: ex.name.toLowerCase().replace(/\s/g, '-'),
                    name: ex.name,
                    muscleGroup: ex.muscleGroup,
                    defaultSets: ex.sets,
                    defaultReps: ex.reps,
                    order: i,
                })),
            });
        });
    };

    const handleClearAll = () => {
        if (templates.length === 0) return;

        showAlert(
            t.templates.clearAll || 'Tümünü Sil',
            t.templates.clearAllConfirm || 'Tüm programları silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
            [
                { text: t.templates.cancel || 'İptal', style: 'cancel' },
                {
                    text: t.templates.delete || 'Sil',
                    style: 'destructive',
                    onPress: () => clearAllTemplates(),
                },
            ]
        );
    };

    const styles = createStyles(colors);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <H1>{t.templates.title}</H1>
                        <Typography variant="caption" color={colors.textSecondary}>
                            {templates.length} {t.templates.program}
                        </Typography>
                    </View>
                    <View style={styles.headerButtons}>
                        {templates.length > 0 && (
                            <Pressable
                                style={[styles.clearAllButton, { borderColor: colors.error + '50' }]}
                                onPress={handleClearAll}
                            >
                                <Trash2 size={16} color={colors.error} />
                                <Typography variant="caption" color={colors.error}>
                                    {t.templates.clearAll}
                                </Typography>
                            </Pressable>
                        )}
                        <Button
                            title={t.templates.newButton}
                            variant="primary"
                            size="sm"
                            icon={<Plus size={16} color={colors.textOnPrimary} />}
                            onPress={handleCreateNew}
                        />
                    </View>
                </View>

                {/* Preset Programs */}
                <View style={styles.presetsSection}>
                    <H2>{t.templates.presetPrograms}</H2>
                    <Typography variant="caption" color={colors.textSecondary} style={{ marginBottom: spacing[3] }}>
                        {t.templates.presetHint}
                    </Typography>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsScroll}>
                        {presetPrograms.map((preset) => (
                            <Pressable
                                key={preset.id}
                                style={[styles.presetCard, { borderColor: preset.color + '50' }]}
                                onPress={() => handleAddPreset(preset)}
                            >
                                <View style={[styles.presetEmoji, { backgroundColor: preset.color + '20' }]}>
                                    <Typography variant="h1">{preset.emoji}</Typography>
                                </View>
                                <Typography variant="body" style={{ fontWeight: '600' }}>{preset.name}</Typography>
                                <Typography variant="caption" color={colors.textSecondary} numberOfLines={2}>
                                    {preset.description}
                                </Typography>
                                <View style={styles.presetMeta}>
                                    <View style={[styles.presetDaysBadge, { backgroundColor: preset.color + '20' }]}>
                                        <Typography variant="caption" style={{ color: preset.color, fontWeight: '600' }}>
                                            {preset.daysPerWeek} {t.templates.daysPerWeek}
                                        </Typography>
                                    </View>
                                </View>
                                {isPresetAdded(preset.name) ? (
                                    <View style={[styles.presetAddedButton, { backgroundColor: colors.success + '20' }]}>
                                        <Check size={14} color={colors.success} />
                                        <Typography variant="caption" color={colors.success}>Eklendi</Typography>
                                    </View>
                                ) : (
                                    <View style={[styles.presetAddButton, { backgroundColor: preset.color }]}>
                                        <Download size={14} color="#fff" />
                                        <Typography variant="caption" color="#fff">{t.templates.add}</Typography>
                                    </View>
                                )}
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>

                {/* Templates List */}
                <View style={styles.templatesList}>
                    {templates.map((template) => (
                        <View key={template.id} style={styles.templateCard}>
                            {/* Template Header */}
                            <View style={styles.templateHeader}>
                                <View style={[styles.templateIcon, { backgroundColor: (template.color || colors.primary) + '20' }]}>
                                    <Dumbbell size={24} color={template.color || colors.primary} />
                                </View>
                                <View style={styles.templateInfo}>
                                    <Typography variant="h3">{template.name}</Typography>
                                    {template.description && (
                                        <Typography variant="caption" color={colors.textSecondary} numberOfLines={1}>
                                            {template.description}
                                        </Typography>
                                    )}
                                    <View style={styles.templateMeta}>
                                        <Typography variant="caption" color={colors.textMuted}>
                                            {template.exercises.length} {t.templates.exerciseCount}
                                        </Typography>
                                        {template.estimatedDuration && (
                                            <View style={styles.metaItem}>
                                                <Clock size={12} color={colors.textMuted} />
                                                <Typography variant="caption" color={colors.textMuted}>
                                                    {template.estimatedDuration} {t.dashboard.minutes}
                                                </Typography>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>

                            {/* Exercise Preview */}
                            <View style={styles.exercisePreview}>
                                {template.exercises.slice(0, 4).map((exercise) => (
                                    <View key={exercise.id} style={styles.exercisePreviewItem}>
                                        <View style={[styles.previewDot, { backgroundColor: template.color || colors.primary }]} />
                                        <Typography variant="caption" numberOfLines={1} style={{ flex: 1 }}>
                                            {exercise.name}
                                        </Typography>
                                        <Typography variant="caption" color={colors.textMuted}>
                                            {exercise.defaultSets}x
                                        </Typography>
                                    </View>
                                ))}
                                {template.exercises.length > 4 && (
                                    <Typography variant="caption" color={colors.textMuted} style={{ paddingLeft: spacing[4] }}>
                                        +{template.exercises.length - 4} {t.templates.moreExercises}
                                    </Typography>
                                )}
                            </View>

                            {/* Action Buttons */}
                            <View style={styles.templateActions}>
                                <Pressable style={styles.actionButton} onPress={() => handleEditTemplate(template.id)}>
                                    <Edit3 size={16} color={colors.textSecondary} />
                                    <Typography variant="caption" color={colors.textSecondary}>{t.templates.edit}</Typography>
                                </Pressable>
                                <View style={styles.actionDivider} />
                                <Pressable style={styles.actionButton} onPress={() => handleDuplicate(template.id)}>
                                    <Copy size={16} color={colors.textSecondary} />
                                    <Typography variant="caption" color={colors.textSecondary}>{t.templates.duplicate}</Typography>
                                </Pressable>
                                <View style={styles.actionDivider} />
                                <Pressable style={styles.startButton} onPress={() => handleStartWorkout(template.id)}>
                                    <Play size={16} color={colors.textOnPrimary} fill={colors.textOnPrimary} />
                                    <Typography variant="caption" color={colors.textOnPrimary}>{t.templates.start}</Typography>
                                </Pressable>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Empty State */}
                {templates.length === 0 && (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIcon}>
                            <Dumbbell size={48} color={colors.textMuted} />
                        </View>
                        <Typography variant="h3" color={colors.textMuted}>{t.templates.noTemplates}</Typography>
                        <Typography variant="body" color={colors.textMuted} style={{ textAlign: 'center' }}>
                            {t.templates.createFirst}
                        </Typography>
                        <Button title={t.templates.createProgram} variant="primary" onPress={handleCreateNew} />
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollView: { flex: 1 },
    content: { padding: layout.screenPaddingHorizontal, paddingBottom: 100, gap: spacing[4] },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    headerButtons: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
    clearAllButton: { flexDirection: 'row', alignItems: 'center', gap: spacing[1], paddingVertical: spacing[2], paddingHorizontal: spacing[3], borderRadius: layout.radiusSmall, borderWidth: 1, ...Platform.select({ web: { cursor: 'pointer' } }) },
    templatesList: { gap: spacing[4] },
    templateCard: { backgroundColor: colors.surface, borderRadius: layout.radiusLarge, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
    templateHeader: { flexDirection: 'row', alignItems: 'flex-start', padding: layout.cardPadding, gap: spacing[3] },
    templateIcon: { width: 52, height: 52, borderRadius: layout.radiusMedium, alignItems: 'center', justifyContent: 'center' },
    templateInfo: { flex: 1, gap: 4 },
    templateMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginTop: 2 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
    exercisePreview: { paddingHorizontal: layout.cardPadding, paddingBottom: spacing[3], gap: spacing[2] },
    exercisePreviewItem: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
    previewDot: { width: 6, height: 6, borderRadius: 3 },
    templateActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border },
    actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2], paddingVertical: spacing[3], ...Platform.select({ web: { cursor: 'pointer' } }) },
    actionDivider: { width: 1, backgroundColor: colors.border },
    startButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2], paddingVertical: spacing[3], backgroundColor: colors.primary, ...Platform.select({ web: { cursor: 'pointer' } }) },
    emptyState: { alignItems: 'center', padding: spacing[8], gap: spacing[4] },
    emptyIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.surfaceLight, alignItems: 'center', justifyContent: 'center' },
    presetsSection: { marginBottom: spacing[2] },
    presetsScroll: { gap: spacing[3], paddingRight: spacing[4] },
    presetCard: { width: 160, backgroundColor: colors.surface, borderRadius: layout.radiusMedium, padding: spacing[3], gap: spacing[2], borderWidth: 1, alignItems: 'center' },
    presetEmoji: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    presetMeta: { flexDirection: 'row', alignItems: 'center', marginTop: spacing[1] },
    presetDaysBadge: { paddingVertical: spacing[1], paddingHorizontal: spacing[2], borderRadius: layout.radiusSmall },
    presetAddButton: { flexDirection: 'row', alignItems: 'center', gap: spacing[1], paddingVertical: spacing[2], paddingHorizontal: spacing[3], borderRadius: layout.radiusSmall, marginTop: spacing[1] },
    presetAddedButton: { flexDirection: 'row', alignItems: 'center', gap: spacing[1], paddingVertical: spacing[2], paddingHorizontal: spacing[3], borderRadius: layout.radiusSmall, marginTop: spacing[1] },
});
