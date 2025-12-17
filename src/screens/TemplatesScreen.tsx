// FitLog - Templates Screen with Dynamic Theme
import React from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Pressable,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Dumbbell, ChevronRight, Copy, Clock, Edit3, Play, Download, Zap, Target } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { layout, spacing } from '../theme/spacing';
import { Typography, H1, H2, Button } from '../components/atoms';
import { useUserStore, useThemeStore } from '../store';

// Preset programs
const presetPrograms = [
    {
        id: 'preset-ppl',
        name: 'Push/Pull/Legs',
        description: '3 günlük klasik bölme programı',
        emoji: '💪',
        color: '#FF6B6B',
        exercises: [
            { name: 'Bench Press', sets: 4 },
            { name: 'Shoulder Press', sets: 3 },
            { name: 'Triceps Pushdown', sets: 3 },
        ],
    },
    {
        id: 'preset-fullbody',
        name: 'Full Body',
        description: 'Haftada 3 gün tam vücut',
        emoji: '🏋️',
        color: '#4ECDC4',
        exercises: [
            { name: 'Squat', sets: 4 },
            { name: 'Bench Press', sets: 4 },
            { name: 'Deadlift', sets: 3 },
        ],
    },
    {
        id: 'preset-upper-lower',
        name: 'Upper/Lower',
        description: '4 günlük üst/alt bölme',
        emoji: '⚡',
        color: '#9B59B6',
        exercises: [
            { name: 'Bench Press', sets: 4 },
            { name: 'Row', sets: 4 },
            { name: 'Pull Up', sets: 3 },
        ],
    },
    {
        id: 'preset-hiit',
        name: 'HIIT Devre',
        description: 'Yüksek yoğunluklu interval',
        emoji: '🔥',
        color: '#F39C12',
        exercises: [
            { name: 'Burpee', sets: 4 },
            { name: 'Mountain Climber', sets: 4 },
            { name: 'Jump Squat', sets: 4 },
        ],
    },
];

export const TemplatesScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const colors = useThemeStore((state) => state.colors);
    const { templates, duplicateTemplate, addPresetProgram } = useUserStore();

    const handleCreateNew = () => navigation.navigate('TemplateEditor', { isNew: true });
    const handleEditTemplate = (templateId: string) => navigation.navigate('TemplateEditor', { templateId, isNew: false });
    const handleDuplicate = (templateId: string) => duplicateTemplate(templateId);
    const handleStartWorkout = (templateId: string) => navigation.navigate('ActiveWorkout', { templateId });

    const handleAddPreset = (preset: typeof presetPrograms[0]) => {
        addPresetProgram({
            name: preset.name,
            description: preset.description,
            color: preset.color,
            exercises: preset.exercises.map((ex, i) => ({
                id: `${preset.id}-ex-${i}`,
                exerciseId: ex.name.toLowerCase().replace(/\s/g, '-'),
                name: ex.name,
                defaultSets: ex.sets,
                defaultReps: 10,
                order: i,
            })),
        });
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
                        <H1>Programlarım</H1>
                        <Typography variant="caption" color={colors.textSecondary}>
                            {templates.length} program
                        </Typography>
                    </View>
                    <Button
                        title="Yeni"
                        variant="primary"
                        size="sm"
                        icon={<Plus size={16} color={colors.textOnPrimary} />}
                        onPress={handleCreateNew}
                    />
                </View>

                {/* Preset Programs */}
                <View style={styles.presetsSection}>
                    <H2>⚡ Hazır Programlar</H2>
                    <Typography variant="caption" color={colors.textSecondary} style={{ marginBottom: spacing[3] }}>
                        Hızlıca ekle ve özelleştir
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
                                <Typography variant="caption" color={colors.textSecondary} numberOfLines={1}>
                                    {preset.description}
                                </Typography>
                                <View style={[styles.presetAddButton, { backgroundColor: preset.color }]}>
                                    <Download size={14} color="#fff" />
                                    <Typography variant="caption" color="#fff">Ekle</Typography>
                                </View>
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
                                            {template.exercises.length} hareket
                                        </Typography>
                                        {template.estimatedDuration && (
                                            <View style={styles.metaItem}>
                                                <Clock size={12} color={colors.textMuted} />
                                                <Typography variant="caption" color={colors.textMuted}>
                                                    {template.estimatedDuration} dk
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
                                        +{template.exercises.length - 4} hareket daha
                                    </Typography>
                                )}
                            </View>

                            {/* Action Buttons */}
                            <View style={styles.templateActions}>
                                <Pressable style={styles.actionButton} onPress={() => handleEditTemplate(template.id)}>
                                    <Edit3 size={16} color={colors.textSecondary} />
                                    <Typography variant="caption" color={colors.textSecondary}>Düzenle</Typography>
                                </Pressable>
                                <View style={styles.actionDivider} />
                                <Pressable style={styles.actionButton} onPress={() => handleDuplicate(template.id)}>
                                    <Copy size={16} color={colors.textSecondary} />
                                    <Typography variant="caption" color={colors.textSecondary}>Kopyala</Typography>
                                </Pressable>
                                <View style={styles.actionDivider} />
                                <Pressable style={styles.startButton} onPress={() => handleStartWorkout(template.id)}>
                                    <Play size={16} color={colors.textOnPrimary} fill={colors.textOnPrimary} />
                                    <Typography variant="caption" color={colors.textOnPrimary}>Başlat</Typography>
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
                        <Typography variant="h3" color={colors.textMuted}>Program Yok</Typography>
                        <Typography variant="body" color={colors.textMuted} style={{ textAlign: 'center' }}>
                            İlk antrenman programınızı oluşturun
                        </Typography>
                        <Button title="Program Oluştur" variant="primary" onPress={handleCreateNew} />
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
    presetCard: { width: 150, backgroundColor: colors.surface, borderRadius: layout.radiusMedium, padding: spacing[3], gap: spacing[2], borderWidth: 1, alignItems: 'center' },
    presetEmoji: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    presetAddButton: { flexDirection: 'row', alignItems: 'center', gap: spacing[1], paddingVertical: spacing[2], paddingHorizontal: spacing[3], borderRadius: layout.radiusSmall, marginTop: spacing[1] },
});
