// FitLog - History Screen with Delete Functionality
import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Modal, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, BarChart3, Clock, Dumbbell, Trash2, X, ChevronRight } from 'lucide-react-native';
import { layout, spacing } from '../theme/spacing';
import { Typography, H1, H2, Button } from '../components/atoms';
import { StatCard } from '../components/molecules';
import { useThemeStore, useWorkoutHistoryStore } from '../store';
import { useTranslation } from '../i18n';

type ViewMode = 'list' | 'calendar';

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

export const HistoryScreen: React.FC = () => {
    const colors = useThemeStore((state) => state.colors);
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const { t, language } = useTranslation();

    const { workoutHistory, stats, deleteWorkout, isLoading } = useWorkoutHistoryStore();
    const locale = language === 'en' ? 'en-US' : 'tr-TR';

    // Group workouts by month
    const groupedHistory = useMemo(() => {
        const groups: { [key: string]: typeof workoutHistory } = {};

        workoutHistory.forEach((workout) => {
            const date = workout.createdAt instanceof Date
                ? workout.createdAt
                : new Date(workout.createdAt || Date.now());
            const monthKey = date.toLocaleDateString(locale, {
                year: 'numeric',
                month: 'long',
            });

            if (!groups[monthKey]) {
                groups[monthKey] = [];
            }
            groups[monthKey].push(workout);
        });

        return Object.entries(groups);
    }, [workoutHistory]);

    // Calculate all-time stats
    const allTimeStats = useMemo(() => {
        const totalWorkouts = workoutHistory.length;
        const totalVolume = workoutHistory.reduce(
            (sum, w) => sum + (w.totalVolume || 0),
            0
        );
        const totalDuration = workoutHistory.reduce((sum, w) => sum + (w.duration || 0), 0);
        const avgDuration =
            totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts / 60) : 0;

        return {
            totalWorkouts,
            totalVolume,
            totalDuration,
            avgDuration,
        };
    }, [workoutHistory]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        return `${mins} ${t.history.min}`;
    };

    const handleWorkoutPress = (workout: any) => {
        setSelectedWorkout(workout);
        setShowDetailModal(true);
    };

    const handleDeleteWorkout = (workoutId: string) => {
        showAlert(
            t.history.deleteWorkout,
            t.history.deleteConfirm,
            [
                { text: t.history.cancel, style: 'cancel' },
                {
                    text: t.history.delete,
                    style: 'destructive',
                    onPress: async () => {
                        await deleteWorkout(workoutId);
                        setShowDetailModal(false);
                        setSelectedWorkout(null);
                    },
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
                    <H1>{t.history.title}</H1>
                    <View style={styles.viewToggle}>
                        <Pressable
                            style={[
                                styles.toggleButton,
                                viewMode === 'list' && styles.toggleButtonActive,
                            ]}
                            onPress={() => setViewMode('list')}
                        >
                            <BarChart3
                                size={18}
                                color={viewMode === 'list' ? colors.textOnPrimary : colors.textSecondary}
                            />
                        </Pressable>
                        <Pressable
                            style={[
                                styles.toggleButton,
                                viewMode === 'calendar' && styles.toggleButtonActive,
                            ]}
                            onPress={() => setViewMode('calendar')}
                        >
                            <Calendar
                                size={18}
                                color={viewMode === 'calendar' ? colors.textOnPrimary : colors.textSecondary}
                            />
                        </Pressable>
                    </View>
                </View>

                {/* All Time Stats */}
                <View style={styles.statsGrid}>
                    <StatCard
                        title={t.history.total}
                        value={allTimeStats.totalWorkouts}
                        subtitle={t.history.workouts}
                        icon={<Dumbbell size={16} color={colors.primary} />}
                        variant="primary"
                    />
                    <StatCard
                        title={t.history.volume}
                        value={`${Math.round(allTimeStats.totalVolume / 1000)}k`}
                        subtitle={t.history.kgTotal}
                        icon={<BarChart3 size={16} color={colors.textSecondary} />}
                    />
                    <StatCard
                        title={t.history.avgDuration}
                        value={allTimeStats.avgDuration}
                        subtitle={t.history.minutes}
                        icon={<Clock size={16} color={colors.textSecondary} />}
                    />
                </View>

                {/* Workout History List */}
                {workoutHistory.length > 0 ? (
                    groupedHistory.map(([month, workouts]) => (
                        <View key={month} style={styles.monthSection}>
                            <Typography variant="label" style={styles.monthLabel} color={colors.textSecondary}>
                                {month}
                            </Typography>
                            {workouts.map((workout) => {
                                const workoutDate = workout.createdAt instanceof Date
                                    ? workout.createdAt
                                    : new Date(workout.createdAt || Date.now());
                                return (
                                    <Pressable
                                        key={workout.id}
                                        style={styles.workoutCard}
                                        onPress={() => handleWorkoutPress(workout)}
                                    >
                                        <View style={styles.workoutIcon}>
                                            <Dumbbell size={20} color={colors.primary} />
                                        </View>
                                        <View style={styles.workoutInfo}>
                                            <Typography variant="body">
                                                {workout.templateName || t.history.workout}
                                            </Typography>
                                            <Typography variant="caption" color={colors.textMuted}>
                                                {workoutDate.toLocaleDateString(locale, {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    weekday: 'short',
                                                })} • {formatDuration(workout.duration || 0)}
                                            </Typography>
                                        </View>
                                        <View style={styles.workoutStats}>
                                            <Typography variant="caption" color={colors.textSecondary}>
                                                {workout.totalSets || 0} {t.history.set}
                                            </Typography>
                                            <Typography variant="caption" color={colors.textMuted}>
                                                {Math.round((workout.totalVolume || 0) / 1000)}k kg
                                            </Typography>
                                        </View>
                                        <ChevronRight size={18} color={colors.textMuted} />
                                    </Pressable>
                                );
                            })}
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Calendar size={48} color={colors.textMuted} />
                        <Typography variant="body" color={colors.textMuted}>
                            {t.history.noWorkouts}
                        </Typography>
                        <Typography variant="caption" color={colors.textMuted}>
                            {t.history.noWorkoutsSubtitle}
                        </Typography>
                    </View>
                )}
            </ScrollView>

            {/* Workout Detail Modal */}
            <Modal visible={showDetailModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <H2>{selectedWorkout?.templateName || t.history.workoutDetails}</H2>
                            <Pressable onPress={() => setShowDetailModal(false)}>
                                <X size={24} color={colors.textSecondary} />
                            </Pressable>
                        </View>

                        {selectedWorkout && (
                            <ScrollView style={styles.modalScroll}>
                                {/* Workout Info */}
                                <View style={styles.detailRow}>
                                    <View style={styles.detailItem}>
                                        <Typography variant="caption" color={colors.textMuted}>{t.history.date}</Typography>
                                        <Typography variant="body">
                                            {(selectedWorkout.createdAt instanceof Date
                                                ? selectedWorkout.createdAt
                                                : new Date(selectedWorkout.createdAt || Date.now())
                                            ).toLocaleDateString(locale, {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </Typography>
                                    </View>
                                    <View style={styles.detailItem}>
                                        <Typography variant="caption" color={colors.textMuted}>{t.history.duration}</Typography>
                                        <Typography variant="body">{formatDuration(selectedWorkout.duration || 0)}</Typography>
                                    </View>
                                </View>

                                <View style={styles.detailRow}>
                                    <View style={styles.detailItem}>
                                        <Typography variant="caption" color={colors.textMuted}>{t.history.totalSets}</Typography>
                                        <Typography variant="body">{selectedWorkout.totalSets || 0}</Typography>
                                    </View>
                                    <View style={styles.detailItem}>
                                        <Typography variant="caption" color={colors.textMuted}>{t.history.volume}</Typography>
                                        <Typography variant="body">{Math.round((selectedWorkout.totalVolume || 0))} kg</Typography>
                                    </View>
                                </View>

                                {/* Exercises */}
                                <Typography variant="label" color={colors.textSecondary} style={{ marginTop: spacing[4] }}>
                                    {t.history.exercises}
                                </Typography>
                                {selectedWorkout.exercises?.map((exercise: any, index: number) => (
                                    <View key={index} style={styles.exerciseCard}>
                                        <View style={styles.exerciseHeader}>
                                            <View style={styles.exerciseIconSmall}>
                                                <Dumbbell size={16} color={colors.primary} />
                                            </View>
                                            <View style={styles.exerciseHeaderInfo}>
                                                <Typography variant="body" style={{ fontWeight: '600' }}>
                                                    {exercise.exerciseName}
                                                </Typography>
                                                <Typography variant="caption" color={colors.textMuted}>
                                                    {exercise.muscleGroup} • {exercise.sets?.length || 0} {t.history.set} • {exercise.totalVolume || 0} kg
                                                </Typography>
                                            </View>
                                        </View>
                                        {/* Set Details */}
                                        <View style={styles.setsContainer}>
                                            {exercise.sets?.map((set: any, setIndex: number) => (
                                                <View key={setIndex} style={styles.setRow}>
                                                    <View style={[styles.setNumber, set.isCompleted && styles.setNumberCompleted]}>
                                                        <Typography variant="caption" color={set.isCompleted ? colors.textOnPrimary : colors.textMuted}>
                                                            {set.setNumber || setIndex + 1}
                                                        </Typography>
                                                    </View>
                                                    <View style={styles.setDetails}>
                                                        <Typography variant="body" style={{ fontWeight: '500' }}>
                                                            {set.weight} kg
                                                        </Typography>
                                                        <Typography variant="caption" color={colors.textMuted}>×</Typography>
                                                        <Typography variant="body" style={{ fontWeight: '500' }}>
                                                            {set.reps} {t.history.reps}
                                                        </Typography>
                                                    </View>
                                                    <Typography variant="caption" color={colors.textMuted}>
                                                        {set.weight * set.reps} kg
                                                    </Typography>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                ))}

                                {/* Delete Button */}
                                <View style={{ marginTop: spacing[6], marginBottom: spacing[4] }}>
                                    <Button
                                        title={t.history.deleteWorkout}
                                        variant="secondary"
                                        fullWidth
                                        icon={<Trash2 size={18} color={colors.error} />}
                                        onPress={() => handleDeleteWorkout(selectedWorkout.id)}
                                    />
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: layout.screenPaddingHorizontal,
        paddingBottom: 100,
        gap: spacing[4],
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    viewToggle: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: layout.radiusMedium,
        padding: 4,
    },
    toggleButton: {
        padding: spacing[2],
        borderRadius: layout.radiusSmall,
    },
    toggleButtonActive: {
        backgroundColor: colors.primary,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: spacing[2],
    },
    monthSection: {
        gap: spacing[2],
    },
    monthLabel: {
        marginBottom: spacing[1],
    },
    workoutCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: layout.radiusMedium,
        padding: spacing[4],
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing[3],
        ...Platform.select({
            web: { cursor: 'pointer' },
        }),
    },
    workoutIcon: {
        width: 44,
        height: 44,
        borderRadius: layout.radiusMedium,
        backgroundColor: colors.primaryMuted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    workoutInfo: {
        flex: 1,
        gap: 2,
    },
    workoutStats: {
        alignItems: 'flex-end',
        gap: 2,
    },
    emptyState: {
        alignItems: 'center',
        padding: spacing[10],
        gap: spacing[3],
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.background,
        borderTopLeftRadius: layout.radiusLarge,
        borderTopRightRadius: layout.radiusLarge,
        padding: layout.screenPaddingHorizontal,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: spacing[4],
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalScroll: {
        marginTop: spacing[4],
    },
    detailRow: {
        flexDirection: 'row',
        gap: spacing[4],
        marginBottom: spacing[3],
    },
    detailItem: {
        flex: 1,
        backgroundColor: colors.surface,
        padding: spacing[3],
        borderRadius: layout.radiusMedium,
        gap: spacing[1],
    },
    exerciseItem: {
        backgroundColor: colors.surface,
        padding: spacing[3],
        borderRadius: layout.radiusMedium,
        marginTop: spacing[2],
        gap: 2,
    },
    exerciseCard: {
        backgroundColor: colors.surface,
        borderRadius: layout.radiusMedium,
        marginTop: spacing[2],
        padding: spacing[3],
        borderWidth: 1,
        borderColor: colors.border,
    },
    exerciseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
        marginBottom: spacing[2],
    },
    exerciseIconSmall: {
        width: 32,
        height: 32,
        borderRadius: layout.radiusSmall,
        backgroundColor: colors.primaryMuted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    exerciseHeaderInfo: {
        flex: 1,
        gap: 2,
    },
    setsContainer: {
        marginTop: spacing[2],
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: spacing[2],
    },
    setRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing[2],
        borderBottomWidth: 1,
        borderBottomColor: colors.border + '40',
        gap: spacing[3],
    },
    setNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.surfaceLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    setNumberCompleted: {
        backgroundColor: colors.success,
    },
    setDetails: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
    },
});
