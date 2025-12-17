// FitLog - Progress Screen with Charts
import React, { useMemo, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, BarChart, ContributionGraph } from 'react-native-chart-kit';
import { TrendingUp, Target, Flame, Award, Calendar, Dumbbell } from 'lucide-react-native';
import { layout, spacing } from '../theme/spacing';
import { Typography, H1, H2 } from '../components/atoms';
import { useThemeStore, useWorkoutHistoryStore } from '../store';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - (layout.screenPaddingHorizontal * 2);

export const ProgressScreen: React.FC = () => {
    const colors = useThemeStore((state) => state.colors);
    const { workoutHistory, stats, getWorkoutStats, loadWorkoutHistory } = useWorkoutHistoryStore();

    // Refresh stats when screen loads
    useEffect(() => {
        console.log('📊 ProgressScreen: Loading workout history...');
        loadWorkoutHistory().then(() => {
            console.log('📊 ProgressScreen: Workout history loaded, recalculating stats...');
            getWorkoutStats();
        });
    }, []);

    // Debug logging
    useEffect(() => {
        console.log('📊 Stats updated:', {
            totalWorkouts: stats.totalWorkouts,
            thisWeekWorkouts: stats.thisWeekWorkouts,
            totalVolume: stats.totalVolume,
            historyCount: workoutHistory.length,
        });
    }, [stats, workoutHistory]);

    // Calculate weekly workout data (last 8 weeks)
    const weeklyData = useMemo(() => {
        const weeks: number[] = Array(8).fill(0);
        const now = new Date();

        workoutHistory.forEach((workout) => {
            const workoutDate = workout.createdAt instanceof Date
                ? workout.createdAt
                : new Date(workout.createdAt || Date.now());
            const diffTime = now.getTime() - workoutDate.getTime();
            const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
            if (diffWeeks >= 0 && diffWeeks < 8) {
                weeks[7 - diffWeeks]++;
            }
        });

        return weeks;
    }, [workoutHistory]);

    // Calculate volume data (last 8 weeks)
    const volumeData = useMemo(() => {
        const weeks: number[] = Array(8).fill(0);
        const now = new Date();

        workoutHistory.forEach((workout) => {
            const workoutDate = workout.createdAt instanceof Date
                ? workout.createdAt
                : new Date(workout.createdAt || Date.now());
            const diffTime = now.getTime() - workoutDate.getTime();
            const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
            if (diffWeeks >= 0 && diffWeeks < 8) {
                weeks[7 - diffWeeks] += (workout.totalVolume || 0) / 1000; // Convert to tons
            }
        });

        return weeks;
    }, [workoutHistory]);

    // Week labels
    const weekLabels = useMemo(() => {
        const labels: string[] = [];
        for (let i = 7; i >= 0; i--) {
            if (i === 0) labels.push('Bu hafta');
            else if (i === 1) labels.push('Geçen');
            else labels.push(`${i}H`);
        }
        return labels.reverse();
    }, []);

    // Chart configuration
    const chartConfig = {
        backgroundColor: colors.surface,
        backgroundGradientFrom: colors.surface,
        backgroundGradientTo: colors.surface,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(212, 255, 0, ${opacity})`,
        labelColor: (opacity = 1) => colors.textSecondary,
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: '5',
            strokeWidth: '2',
            stroke: colors.primary,
        },
        propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: colors.border,
            strokeWidth: 1,
        },
    };

    const styles = createStyles(colors);

    // Stats cards data
    const statsCards = [
        {
            icon: <Flame size={24} color={colors.primary} />,
            label: 'Toplam Antrenman',
            value: stats.totalWorkouts.toString(),
            color: colors.primary,
        },
        {
            icon: <Calendar size={24} color="#4ECDC4" />,
            label: 'Bu Hafta',
            value: stats.thisWeekWorkouts.toString(),
            color: '#4ECDC4',
        },
        {
            icon: <TrendingUp size={24} color="#FF6B6B" />,
            label: 'Toplam Volume',
            value: `${(stats.totalVolume / 1000).toFixed(1)}t`,
            color: '#FF6B6B',
        },
        {
            icon: <Target size={24} color="#9B59B6" />,
            label: 'Ort. Süre',
            value: `${Math.floor(stats.averageDuration / 60)}dk`,
            color: '#9B59B6',
        },
    ];

    // Personal Records
    const personalRecords = useMemo(() => {
        return Object.entries(stats.personalRecords || {}).slice(0, 5).map(([key, pr]) => ({
            exercise: key,
            weight: pr.weight,
            reps: pr.reps,
            date: pr.date,
        }));
    }, [stats.personalRecords]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <H1>İlerleme</H1>
                    <Typography variant="body" color={colors.textSecondary}>
                        Antrenman istatistiklerin
                    </Typography>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    {statsCards.map((stat, index) => (
                        <View key={index} style={styles.statCard}>
                            <View style={[styles.statIconContainer, { backgroundColor: stat.color + '20' }]}>
                                {stat.icon}
                            </View>
                            <Typography variant="h2" style={styles.statValue}>
                                {stat.value}
                            </Typography>
                            <Typography variant="caption" color={colors.textSecondary}>
                                {stat.label}
                            </Typography>
                        </View>
                    ))}
                </View>

                {/* Weekly Workouts Chart */}
                <View style={styles.chartCard}>
                    <View style={styles.chartHeader}>
                        <H2>Haftalık Antrenman</H2>
                        <Typography variant="caption" color={colors.textSecondary}>
                            Son 8 hafta
                        </Typography>
                    </View>
                    <BarChart
                        data={{
                            labels: weekLabels,
                            datasets: [{ data: weeklyData.length > 0 ? weeklyData : [0, 0, 0, 0, 0, 0, 0, 0] }],
                        }}
                        width={chartWidth - spacing[6]}
                        height={180}
                        yAxisLabel=""
                        yAxisSuffix=""
                        chartConfig={{
                            ...chartConfig,
                            barPercentage: 0.6,
                        }}
                        style={styles.chart}
                        showValuesOnTopOfBars
                        fromZero
                        withInnerLines={false}
                    />
                </View>

                {/* Volume Progress Chart */}
                <View style={styles.chartCard}>
                    <View style={styles.chartHeader}>
                        <H2>Toplam Volume</H2>
                        <Typography variant="caption" color={colors.textSecondary}>
                            Ton (1000kg) bazında
                        </Typography>
                    </View>
                    <LineChart
                        data={{
                            labels: weekLabels,
                            datasets: [{ data: volumeData.some(v => v > 0) ? volumeData : [0, 0, 0, 0, 0, 0, 0, 0] }],
                        }}
                        width={chartWidth - spacing[6]}
                        height={180}
                        chartConfig={chartConfig}
                        style={styles.chart}
                        bezier
                        withInnerLines={false}
                        withOuterLines={false}
                    />
                </View>

                {/* Personal Records */}
                <View style={styles.chartCard}>
                    <View style={styles.chartHeader}>
                        <View style={styles.prHeader}>
                            <Award size={24} color={colors.warning} />
                            <H2>Kişisel Rekorlar</H2>
                        </View>
                    </View>

                    {personalRecords.length > 0 ? (
                        personalRecords.map((pr, index) => (
                            <View key={index} style={styles.prItem}>
                                <View style={styles.prInfo}>
                                    <Dumbbell size={18} color={colors.textMuted} />
                                    <Typography variant="body">{pr.exercise}</Typography>
                                </View>
                                <View style={styles.prValue}>
                                    <Typography variant="h3" color={colors.primary}>
                                        {pr.weight}kg
                                    </Typography>
                                    <Typography variant="caption" color={colors.textSecondary}>
                                        × {pr.reps} tekrar
                                    </Typography>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Award size={48} color={colors.textMuted} />
                            <Typography variant="body" color={colors.textSecondary} style={{ textAlign: 'center' }}>
                                Henüz kişisel rekor bulunmuyor.{'\n'}Antrenman yaparak rekorlarını kır!
                            </Typography>
                        </View>
                    )}
                </View>

                {/* Streak & Motivation */}
                <View style={styles.motivationCard}>
                    <View style={styles.streakContainer}>
                        <Flame size={32} color="#FF6B6B" />
                        <View>
                            <Typography variant="h1" color={colors.textPrimary}>
                                {stats.thisWeekWorkouts || 0}
                            </Typography>
                            <Typography variant="caption" color={colors.textSecondary}>
                                Bu hafta antrenman
                            </Typography>
                        </View>
                    </View>
                    <View style={styles.motivationText}>
                        <Typography variant="body" color={colors.textSecondary}>
                            {stats.thisWeekWorkouts >= 5
                                ? '🔥 Müthiş gidiyorsun! Hedefini aştın!'
                                : stats.thisWeekWorkouts >= 3
                                    ? '💪 Harika! Hedefe yaklaşıyorsun!'
                                    : '🎯 Hadi, bu hafta hedefine ulaş!'}
                        </Typography>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: layout.screenPaddingHorizontal,
        paddingBottom: 100,
    },
    header: {
        gap: spacing[1],
        marginBottom: spacing[5],
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing[3],
        marginBottom: spacing[5],
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: colors.surface,
        borderRadius: layout.radiusLarge,
        padding: spacing[4],
        alignItems: 'center',
        gap: spacing[2],
        borderWidth: 1,
        borderColor: colors.border,
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 28,
        fontWeight: '800',
    },
    chartCard: {
        backgroundColor: colors.surface,
        borderRadius: layout.radiusLarge,
        padding: spacing[4],
        marginBottom: spacing[4],
        borderWidth: 1,
        borderColor: colors.border,
    },
    chartHeader: {
        marginBottom: spacing[3],
    },
    chart: {
        marginLeft: -spacing[4],
        borderRadius: 16,
    },
    prHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
    },
    prItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing[3],
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    prInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
    },
    prValue: {
        alignItems: 'flex-end',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing[6],
        gap: spacing[3],
    },
    motivationCard: {
        backgroundColor: colors.primaryMuted,
        borderRadius: layout.radiusLarge,
        padding: spacing[5],
        borderWidth: 1,
        borderColor: colors.primary + '30',
    },
    streakContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
        marginBottom: spacing[3],
    },
    motivationText: {
        paddingTop: spacing[2],
        borderTopWidth: 1,
        borderTopColor: colors.primary + '20',
    },
});
