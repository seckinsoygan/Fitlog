// FitLog - Exercise Detail Screen with Muscle Anatomy
import React from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Pressable,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Target, Settings2, Activity, Zap } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { layout, spacing } from '../theme/spacing';
import { Typography, H1, Button } from '../components/atoms';
import { useExerciseLibraryStore, useThemeStore } from '../store';
import Svg, { Path, Circle, Ellipse, G, Text as SvgText } from 'react-native-svg';
import { useTranslation } from '../i18n';

// Muscle group mappings for anatomy highlight
const muscleGroupMappings: Record<string, string[]> = {
    'Göğüs': ['chest'],
    'Sırt': ['back', 'lats'],
    'Omuz': ['shoulders', 'deltoids'],
    'Biceps': ['biceps'],
    'Triceps': ['triceps'],
    'Bacak': ['quads', 'hamstrings', 'calves'],
    'Karın': ['abs', 'core'],
    'Ön Kol': ['forearms'],
    'Glutes': ['glutes'],
};

// Simplified Human Anatomy SVG Component
const AnatomyDiagram: React.FC<{ muscleGroup: string; colors: any; t: any }> = ({ muscleGroup, colors, t }) => {
    const activeMuscles = muscleGroupMappings[muscleGroup] || [];

    const getMuscleColor = (muscle: string) => {
        return activeMuscles.includes(muscle) ? colors.primary : colors.surfaceLight;
    };

    const getStrokeColor = () => colors.border;

    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: spacing[4] }}>
            {/* Front View */}
            <View style={{ alignItems: 'center' }}>
                <Typography variant="caption" color={colors.textMuted} style={{ marginBottom: spacing[2] }}>{t.exercises.detail.front}</Typography>
                <Svg width={120} height={200} viewBox="0 0 120 200">
                    {/* Head */}
                    <Circle cx="60" cy="20" r="15" fill={colors.surface} stroke={getStrokeColor()} strokeWidth="1" />

                    {/* Neck */}
                    <Path d="M55 35 L55 45 L65 45 L65 35" fill={colors.surface} stroke={getStrokeColor()} strokeWidth="1" />

                    {/* Shoulders */}
                    <Ellipse cx="35" cy="52" rx="12" ry="8" fill={getMuscleColor('shoulders')} stroke={getStrokeColor()} strokeWidth="1" />
                    <Ellipse cx="85" cy="52" rx="12" ry="8" fill={getMuscleColor('shoulders')} stroke={getStrokeColor()} strokeWidth="1" />

                    {/* Chest */}
                    <Path d="M40 50 Q60 45 80 50 L80 75 Q60 80 40 75 Z" fill={getMuscleColor('chest')} stroke={getStrokeColor()} strokeWidth="1" />

                    {/* Abs */}
                    <Path d="M45 75 L45 110 Q60 115 75 110 L75 75 Q60 80 45 75" fill={getMuscleColor('abs')} stroke={getStrokeColor()} strokeWidth="1" />

                    {/* Left Bicep */}
                    <Ellipse cx="28" cy="75" rx="8" ry="18" fill={getMuscleColor('biceps')} stroke={getStrokeColor()} strokeWidth="1" />

                    {/* Right Bicep */}
                    <Ellipse cx="92" cy="75" rx="8" ry="18" fill={getMuscleColor('biceps')} stroke={getStrokeColor()} strokeWidth="1" />

                    {/* Left Forearm */}
                    <Ellipse cx="25" cy="110" rx="6" ry="15" fill={getMuscleColor('forearms')} stroke={getStrokeColor()} strokeWidth="1" />

                    {/* Right Forearm */}
                    <Ellipse cx="95" cy="110" rx="6" ry="15" fill={getMuscleColor('forearms')} stroke={getStrokeColor()} strokeWidth="1" />

                    {/* Left Quad */}
                    <Ellipse cx="48" cy="140" rx="10" ry="25" fill={getMuscleColor('quads')} stroke={getStrokeColor()} strokeWidth="1" />

                    {/* Right Quad */}
                    <Ellipse cx="72" cy="140" rx="10" ry="25" fill={getMuscleColor('quads')} stroke={getStrokeColor()} strokeWidth="1" />

                    {/* Left Calf */}
                    <Ellipse cx="46" cy="180" rx="6" ry="15" fill={getMuscleColor('calves')} stroke={getStrokeColor()} strokeWidth="1" />

                    {/* Right Calf */}
                    <Ellipse cx="74" cy="180" rx="6" ry="15" fill={getMuscleColor('calves')} stroke={getStrokeColor()} strokeWidth="1" />
                </Svg>
            </View>

            {/* Back View */}
            <View style={{ alignItems: 'center' }}>
                <Typography variant="caption" color={colors.textMuted} style={{ marginBottom: spacing[2] }}>{t.exercises.detail.back}</Typography>
                <Svg width={120} height={200} viewBox="0 0 120 200">
                    {/* Head */}
                    <Circle cx="60" cy="20" r="15" fill={colors.surface} stroke={getStrokeColor()} strokeWidth="1" />

                    {/* Neck */}
                    <Path d="M55 35 L55 45 L65 45 L65 35" fill={colors.surface} stroke={getStrokeColor()} strokeWidth="1" />

                    {/* Shoulders Back */}
                    <Ellipse cx="35" cy="52" rx="12" ry="8" fill={getMuscleColor('deltoids')} stroke={getStrokeColor()} strokeWidth="1" />
                    <Ellipse cx="85" cy="52" rx="12" ry="8" fill={getMuscleColor('deltoids')} stroke={getStrokeColor()} strokeWidth="1" />

                    {/* Upper Back / Lats */}
                    <Path d="M40 50 L35 90 Q60 95 85 90 L80 50 Q60 55 40 50" fill={getMuscleColor('lats')} stroke={getStrokeColor()} strokeWidth="1" />

                    {/* Lower Back */}
                    <Path d="M45 90 L45 115 Q60 118 75 115 L75 90 Q60 95 45 90" fill={getMuscleColor('back')} stroke={getStrokeColor()} strokeWidth="1" />

                    {/* Left Tricep */}
                    <Ellipse cx="25" cy="75" rx="8" ry="18" fill={getMuscleColor('triceps')} stroke={getStrokeColor()} strokeWidth="1" />

                    {/* Right Tricep */}
                    <Ellipse cx="95" cy="75" rx="8" ry="18" fill={getMuscleColor('triceps')} stroke={getStrokeColor()} strokeWidth="1" />

                    {/* Glutes */}
                    <Ellipse cx="50" cy="120" rx="12" ry="10" fill={getMuscleColor('glutes')} stroke={getStrokeColor()} strokeWidth="1" />
                    <Ellipse cx="70" cy="120" rx="12" ry="10" fill={getMuscleColor('glutes')} stroke={getStrokeColor()} strokeWidth="1" />

                    {/* Left Hamstring */}
                    <Ellipse cx="48" cy="150" rx="10" ry="22" fill={getMuscleColor('hamstrings')} stroke={getStrokeColor()} strokeWidth="1" />

                    {/* Right Hamstring */}
                    <Ellipse cx="72" cy="150" rx="10" ry="22" fill={getMuscleColor('hamstrings')} stroke={getStrokeColor()} strokeWidth="1" />

                    {/* Left Calf */}
                    <Ellipse cx="46" cy="185" rx="6" ry="12" fill={getMuscleColor('calves')} stroke={getStrokeColor()} strokeWidth="1" />

                    {/* Right Calf */}
                    <Ellipse cx="74" cy="185" rx="6" ry="12" fill={getMuscleColor('calves')} stroke={getStrokeColor()} strokeWidth="1" />
                </Svg>
            </View>
        </View>
    );
};

export const ExerciseDetailScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const colors = useThemeStore((state) => state.colors);
    const exerciseId = route.params?.exerciseId;
    const { t } = useTranslation();

    const { getExerciseById } = useExerciseLibraryStore();
    const exercise = getExerciseById(exerciseId);

    // Helper functions to get translated names
    const getMuscleGroupDisplay = (muscleGroup: string): string => {
        const muscleGroups = t.exercises.muscleGroupsDisplay as Record<string, string>;
        return muscleGroups[muscleGroup] || muscleGroup;
    };

    const getEquipmentDisplay = (equipment: string): string => {
        const equipmentDisplay = t.exercises.equipmentDisplay as Record<string, string>;
        return equipmentDisplay[equipment] || equipment;
    };

    if (!exercise) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <Typography variant="body">{t.exercises.detail.notFound}</Typography>
            </SafeAreaView>
        );
    }

    const dynamicStyles = createStyles(colors);

    return (
        <SafeAreaView style={dynamicStyles.container} edges={['top']}>
            {/* Header */}
            <View style={dynamicStyles.header}>
                <Pressable style={dynamicStyles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft size={24} color={colors.textPrimary} />
                </Pressable>
                <View style={dynamicStyles.headerTitle}>
                    <Typography variant="h2" numberOfLines={1}>{exercise.name}</Typography>
                    <Typography variant="caption" color={colors.textSecondary}>{getMuscleGroupDisplay(exercise.muscleGroup)}</Typography>
                </View>
            </View>

            <ScrollView style={dynamicStyles.scrollView} contentContainerStyle={dynamicStyles.content} showsVerticalScrollIndicator={false}>
                {/* Muscle Anatomy Section */}
                <View style={dynamicStyles.anatomySection}>
                    <View style={dynamicStyles.anatomyHeader}>
                        <Activity size={18} color={colors.primary} />
                        <Typography variant="label" color={colors.textSecondary}>{t.exercises.detail.targetMuscles}</Typography>
                    </View>
                    <AnatomyDiagram muscleGroup={exercise.muscleGroup} colors={colors} t={t} />
                    <View style={dynamicStyles.muscleTag}>
                        <Zap size={14} color={colors.primary} />
                        <Typography variant="body" color={colors.primary} style={{ fontWeight: '600' }}>
                            {getMuscleGroupDisplay(exercise.muscleGroup)}
                        </Typography>
                    </View>
                </View>

                {/* Exercise Info Cards */}
                <View style={dynamicStyles.infoGrid}>
                    <View style={dynamicStyles.infoCard}>
                        <View style={[dynamicStyles.infoIcon, { backgroundColor: colors.primary + '20' }]}>
                            <Target size={20} color={colors.primary} />
                        </View>
                        <Typography variant="label" color={colors.textSecondary}>{t.exercises.detail.muscleGroup}</Typography>
                        <Typography variant="h3">{getMuscleGroupDisplay(exercise.muscleGroup)}</Typography>
                    </View>

                    <View style={dynamicStyles.infoCard}>
                        <View style={[dynamicStyles.infoIcon, { backgroundColor: colors.info + '20' }]}>
                            <Settings2 size={20} color={colors.info} />
                        </View>
                        <Typography variant="label" color={colors.textSecondary}>{t.exercises.detail.equipmentLabel}</Typography>
                        <Typography variant="h3">{getEquipmentDisplay(exercise.equipment || '')}</Typography>
                    </View>
                </View>

                {/* Tips Section */}
                <View style={dynamicStyles.tipsSection}>
                    <Typography variant="label" color={colors.textSecondary}>{t.exercises.detail.tips}</Typography>
                    <View style={dynamicStyles.tipsList}>
                        <View style={dynamicStyles.tipItem}>
                            <View style={dynamicStyles.tipDot} />
                            <Typography variant="body">{t.exercises.detail.tip1}</Typography>
                        </View>
                        <View style={dynamicStyles.tipItem}>
                            <View style={dynamicStyles.tipDot} />
                            <Typography variant="body">{t.exercises.detail.tip2}</Typography>
                        </View>
                        <View style={dynamicStyles.tipItem}>
                            <View style={dynamicStyles.tipDot} />
                            <Typography variant="body">{t.exercises.detail.tip3}</Typography>
                        </View>
                        <View style={dynamicStyles.tipItem}>
                            <View style={dynamicStyles.tipDot} />
                            <Typography variant="body">{t.exercises.detail.tip4}</Typography>
                        </View>
                    </View>
                </View>

                {/* Suggested Sets & Reps */}
                <View style={dynamicStyles.suggestedSection}>
                    <Typography variant="label" color={colors.textSecondary}>{t.exercises.detail.suggested}</Typography>
                    <View style={dynamicStyles.suggestedGrid}>
                        <View style={dynamicStyles.suggestedCard}>
                            <Typography variant="h2" color={colors.primary}>3-4</Typography>
                            <Typography variant="caption" color={colors.textMuted}>{t.exercises.detail.sets}</Typography>
                        </View>
                        <View style={dynamicStyles.suggestedCard}>
                            <Typography variant="h2" color={colors.warning}>8-12</Typography>
                            <Typography variant="caption" color={colors.textMuted}>{t.exercises.detail.reps}</Typography>
                        </View>
                        <View style={dynamicStyles.suggestedCard}>
                            <Typography variant="h2" color={colors.info}>60-90</Typography>
                            <Typography variant="caption" color={colors.textMuted}>{t.exercises.detail.restSeconds}</Typography>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
});

const createStyles = (colors: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: layout.screenPaddingHorizontal, paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing[3] },
    backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: layout.radiusMedium, backgroundColor: colors.surface, ...Platform.select({ web: { cursor: 'pointer' } }) as any },
    headerTitle: { flex: 1, gap: 2 },
    scrollView: { flex: 1 },
    content: { padding: layout.screenPaddingHorizontal, paddingBottom: 100, gap: spacing[5] },
    animationSection: { backgroundColor: colors.surface, borderRadius: layout.radiusLarge, padding: layout.cardPadding, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
    anatomySection: { backgroundColor: colors.surface, borderRadius: layout.radiusLarge, padding: layout.cardPadding, borderWidth: 1, borderColor: colors.border },
    anatomyHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[2] },
    muscleTag: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2], backgroundColor: colors.primaryMuted, paddingVertical: spacing[2], paddingHorizontal: spacing[4], borderRadius: layout.radiusFull, alignSelf: 'center' },
    infoGrid: { flexDirection: 'row', gap: spacing[3] },
    infoCard: { flex: 1, backgroundColor: colors.surface, borderRadius: layout.radiusMedium, padding: spacing[4], borderWidth: 1, borderColor: colors.border, gap: spacing[2] },
    infoIcon: { width: 44, height: 44, borderRadius: layout.radiusMedium, alignItems: 'center', justifyContent: 'center' },
    tipsSection: { backgroundColor: colors.surface, borderRadius: layout.radiusMedium, padding: layout.cardPadding, borderWidth: 1, borderColor: colors.border, gap: spacing[3] },
    tipsList: { gap: spacing[3] },
    tipItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] },
    tipDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 6 },
    suggestedSection: { backgroundColor: colors.surface, borderRadius: layout.radiusMedium, padding: layout.cardPadding, borderWidth: 1, borderColor: colors.border, gap: spacing[3] },
    suggestedGrid: { flexDirection: 'row', gap: spacing[2] },
    suggestedCard: { flex: 1, backgroundColor: colors.background, borderRadius: layout.radiusMedium, padding: spacing[3], alignItems: 'center', gap: spacing[1] },
});
