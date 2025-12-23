// FitLog - Exercises Screen with Dynamic Theme
import React from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TextInput,
    Pressable,
    FlatList,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, Dumbbell, ChevronRight, ArrowLeft, Play } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { layout, spacing } from '../theme/spacing';
import { Typography, H1, Button } from '../components/atoms';
import { useExerciseLibraryStore, useWorkoutStore, useThemeStore } from '../store';
import { Exercise } from '../types';
import { ExerciseWithVideo } from '../store/exerciseLibraryStore';
import { useTranslation } from '../i18n';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const ExercisesScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const colors = useThemeStore((state) => state.colors);
    const selectMode = route.params?.selectMode ?? false;
    const { t } = useTranslation();

    const {
        searchQuery,
        selectedMuscleGroup,
        setSearchQuery,
        setSelectedMuscleGroup,
        getFilteredExercises,
        getMuscleGroups,
    } = useExerciseLibraryStore();

    const { addExercise, activeWorkout } = useWorkoutStore();

    const filteredExercises = getFilteredExercises();
    const muscleGroups = getMuscleGroups();

    // Helper functions to get translated names
    const getMuscleGroupDisplay = (muscleGroup: string): string => {
        const muscleGroupsDisplay = t.exercises.muscleGroupsDisplay as Record<string, string>;
        return muscleGroupsDisplay[muscleGroup] || muscleGroup;
    };

    const getEquipmentDisplay = (equipment?: string): string => {
        if (!equipment) return '';
        const equipmentDisplay = t.exercises.equipmentDisplay as Record<string, string>;
        return equipmentDisplay[equipment] || equipment;
    };

    const handleExerciseSelect = (exercise: ExerciseWithVideo) => {
        if (selectMode && activeWorkout) {
            const newExercise: Exercise = {
                id: generateId(),
                name: exercise.name,
                muscleGroup: exercise.muscleGroup,
                isExpanded: true,
                sets: [
                    { id: generateId(), setNumber: 1, weight: '', reps: '', completed: false },
                    { id: generateId(), setNumber: 2, weight: '', reps: '', completed: false },
                    { id: generateId(), setNumber: 3, weight: '', reps: '', completed: false },
                ],
            };
            addExercise(newExercise);
            navigation.goBack();
        } else {
            navigation.navigate('ExerciseDetail', { exerciseId: exercise.id });
        }
    };

    const handleGoBack = () => navigation.goBack();

    const styles = createStyles(colors);

    const renderExerciseItem = ({ item }: { item: ExerciseWithVideo }) => (
        <Pressable
            style={({ pressed }) => [
                styles.exerciseItem,
                pressed && styles.exerciseItemPressed,
            ]}
            onPress={() => handleExerciseSelect(item)}
        >
            <View style={styles.exerciseIcon}>
                <Dumbbell size={20} color={colors.primary} />
            </View>
            <View style={styles.exerciseInfo}>
                <Typography variant="body">{item.name}</Typography>
                <Typography variant="caption" color={colors.textSecondary}>
                    {getMuscleGroupDisplay(item.muscleGroup)} • {getEquipmentDisplay(item.equipment)}
                </Typography>
            </View>
            <View style={styles.exerciseActions}>
                {item.youtubeVideoId && !selectMode && (
                    <View style={styles.videoIndicator}>
                        <Play size={12} color={colors.primary} fill={colors.primary} />
                    </View>
                )}
                {selectMode ? (
                    <Plus size={20} color={colors.primary} />
                ) : (
                    <ChevronRight size={20} color={colors.textMuted} />
                )}
            </View>
        </Pressable>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                {selectMode && (
                    <Pressable
                        style={styles.backButton}
                        onPress={handleGoBack}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <ArrowLeft size={24} color={colors.textPrimary} />
                    </Pressable>
                )}
                <H1 style={styles.headerTitle}>{selectMode ? t.exercises.selectExercise : t.exercises.title}</H1>
                {!selectMode && (
                    <View style={styles.exerciseCount}>
                        <Typography variant="caption" color={colors.primary}>
                            {filteredExercises.length}
                        </Typography>
                    </View>
                )}
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Search size={18} color={colors.textMuted} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={t.exercises.searchPlaceholder}
                    placeholderTextColor={colors.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Muscle Group Filter */}
            <View style={styles.filterWrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterContent}
                >
                    <Pressable
                        style={[
                            styles.filterChip,
                            !selectedMuscleGroup && styles.filterChipActive,
                        ]}
                        onPress={() => setSelectedMuscleGroup(null)}
                    >
                        <Typography
                            variant="buttonSmall"
                            color={!selectedMuscleGroup ? colors.textOnPrimary : colors.textSecondary}
                        >
                            {t.exercises.all}
                        </Typography>
                    </Pressable>
                    {muscleGroups.map((group) => (
                        <Pressable
                            key={group}
                            style={[
                                styles.filterChip,
                                selectedMuscleGroup === group && styles.filterChipActive,
                            ]}
                            onPress={() => setSelectedMuscleGroup(group)}
                        >
                            <Typography
                                variant="buttonSmall"
                                color={selectedMuscleGroup === group ? colors.textOnPrimary : colors.textSecondary}
                            >
                                {getMuscleGroupDisplay(group)}
                            </Typography>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            {/* Exercise List */}
            <FlatList
                data={filteredExercises}
                renderItem={renderExerciseItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
        </SafeAreaView>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: layout.screenPaddingHorizontal,
        paddingVertical: spacing[3],
        gap: spacing[3],
    },
    headerTitle: {
        flex: 1,
    },
    exerciseCount: {
        backgroundColor: colors.primaryMuted,
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[1],
        borderRadius: layout.radiusFull,
    },
    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: layout.radiusMedium,
        backgroundColor: colors.surface,
        ...Platform.select({ web: { cursor: 'pointer' } }),
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        marginHorizontal: layout.screenPaddingHorizontal,
        paddingHorizontal: spacing[3],
        borderRadius: layout.radiusMedium,
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing[2],
    },
    searchInput: {
        flex: 1,
        color: colors.textPrimary,
        paddingVertical: spacing[3],
        fontSize: 16,
    },
    filterWrapper: {
        height: 56,
        marginTop: spacing[3],
    },
    filterContent: {
        paddingHorizontal: layout.screenPaddingHorizontal,
        gap: spacing[2],
        alignItems: 'center',
        height: 44,
    },
    filterChip: {
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[2],
        backgroundColor: colors.surface,
        borderRadius: layout.radiusFull,
        borderWidth: 1,
        borderColor: colors.border,
        height: 36,
        justifyContent: 'center',
        ...Platform.select({ web: { cursor: 'pointer' } }),
    },
    filterChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    listContent: {
        padding: layout.screenPaddingHorizontal,
        paddingBottom: 100,
    },
    exerciseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: spacing[3],
        borderRadius: layout.radiusMedium,
        gap: spacing[3],
        ...Platform.select({ web: { cursor: 'pointer' } }),
    },
    exerciseItemPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.99 }],
    },
    exerciseIcon: {
        width: 44,
        height: 44,
        borderRadius: layout.radiusMedium,
        backgroundColor: colors.primaryMuted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    exerciseInfo: {
        flex: 1,
        gap: spacing[1],
    },
    exerciseActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
    },
    videoIndicator: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.primaryMuted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    separator: {
        height: spacing[2],
    },
});
