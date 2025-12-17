// FitLog - History Screen
import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, BarChart3, Clock, Dumbbell } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { layout, spacing } from '../theme/spacing';
import { Typography, H1, H2 } from '../components/atoms';
import { StatCard, WorkoutCard } from '../components/molecules';
import { useWorkoutData } from '../hooks';

type ViewMode = 'list' | 'calendar';

export const HistoryScreen: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const { workoutHistory, weeklyStats } = useWorkoutData();

    // Group workouts by month
    const groupedHistory = useMemo(() => {
        const groups: { [key: string]: typeof workoutHistory } = {};

        workoutHistory.forEach((workout) => {
            const date = new Date(workout.date);
            const monthKey = date.toLocaleDateString('tr-TR', {
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
        const totalDuration = workoutHistory.reduce((sum, w) => sum + w.duration, 0);
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
        return `${mins} dk`;
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <H1>Geçmiş</H1>
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
                        title="TOPLAM"
                        value={allTimeStats.totalWorkouts}
                        subtitle="antrenman"
                        icon={<Dumbbell size={16} color={colors.primary} />}
                        variant="primary"
                    />
                    <StatCard
                        title="HACİM"
                        value={`${Math.round(allTimeStats.totalVolume / 1000)}k`}
                        subtitle="kg toplam"
                        icon={<BarChart3 size={16} color={colors.textSecondary} />}
                    />
                    <StatCard
                        title="ORT. SÜRE"
                        value={allTimeStats.avgDuration}
                        subtitle="dakika"
                        icon={<Clock size={16} color={colors.textSecondary} />}
                    />
                </View>

                {/* Workout History List */}
                {workoutHistory.length > 0 ? (
                    groupedHistory.map(([month, workouts]) => (
                        <View key={month} style={styles.monthSection}>
                            <Typography variant="label" style={styles.monthLabel}>
                                {month}
                            </Typography>
                            {workouts.map((workout) => (
                                <WorkoutCard
                                    key={workout.id}
                                    title={workout.name}
                                    exercises={workout.exercises.map((e) => e.name)}
                                    date={new Date(workout.date).toLocaleDateString('tr-TR', {
                                        day: 'numeric',
                                        month: 'short',
                                        weekday: 'short',
                                    })}
                                    duration={formatDuration(workout.duration)}
                                    onPress={() => { }}
                                />
                            ))}
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Calendar size={48} color={colors.textMuted} />
                        <Typography variant="body" color={colors.textMuted}>
                            Henüz kayıtlı antrenman yok
                        </Typography>
                        <Typography variant="caption" color={colors.textMuted}>
                            Antrenman tamamladığınızda burada görünecek
                        </Typography>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
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
        gap: spacing[3],
    },
    monthLabel: {
        marginBottom: spacing[1],
    },
    emptyState: {
        alignItems: 'center',
        padding: spacing[10],
        gap: spacing[3],
    },
});
