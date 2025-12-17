// FitLog - Dashboard Screen with Dynamic Theme & Enhanced UI
import React, { useMemo, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Pressable,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Play,
    Flame,
    Trophy,
    TrendingUp,
    Calendar,
    Dumbbell,
    Clock,
    ChevronRight,
    Zap,
    Droplets,
    Award,
} from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { layout, spacing } from '../theme/spacing';
import { Typography } from '../components/atoms';
import { useThemeStore, useUserStore, useWeeklyProgramStore, useNutritionStore, useWaterStore, useAchievementsStore, useWorkoutHistoryStore } from '../store';

export const DashboardScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const colors = useThemeStore((state) => state.colors);
    const { profile, templates } = useUserStore();
    const { getTodaysWorkout, activeProgram } = useWeeklyProgramStore();
    const { getTodayNutrition, goals } = useNutritionStore();
    const { getTodayProgress, getTodayRecord, dailyGoal, glassSize, addWater, records } = useWaterStore();
    const { getUnlockedAchievements, totalPoints, checkAchievements } = useAchievementsStore();
    const { stats, getWorkoutStats, loadWorkoutHistory, workoutHistory } = useWorkoutHistoryStore();

    // Refresh data when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            console.log('📊 Dashboard: Refreshing data...');
            // Refresh workout stats
            getWorkoutStats();
            // Check achievements based on current stats
            checkAchievements({
                totalWorkouts: stats.totalWorkouts,
                totalVolume: stats.totalVolume,
                streak: 0, // TODO: Calculate streak
                thisWeekWorkouts: stats.thisWeekWorkouts,
            });
        }, [stats.totalWorkouts, stats.totalVolume])
    );

    const todaysWorkout = getTodaysWorkout();
    const todaysNutrition = getTodayNutrition();
    const todayTemplate = todaysWorkout?.templateId
        ? templates.find(t => t.id === todaysWorkout.templateId)
        : null;

    const waterProgress = getTodayProgress();
    const waterRecord = getTodayRecord();
    const unlockedBadges = getUnlockedAchievements();

    // Use stats from workoutHistoryStore for weekly count
    const thisWeekWorkouts = stats.thisWeekWorkouts;

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Günaydın';
        if (hour < 18) return 'İyi günler';
        return 'İyi akşamlar';
    }, []);

    const calorieProgress = Math.min(100, (todaysNutrition.totalCalories / goals.dailyCalories) * 100);
    const weeklyGoalProgress = Math.min(100, (thisWeekWorkouts / profile.weeklyGoal) * 100);

    const handleStartWorkout = (templateId?: string) => {
        navigation.navigate('ActiveWorkout', { templateId });
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
                    <View style={styles.headerText}>
                        <Typography variant="bodySmall" color={colors.textSecondary}>
                            {greeting}
                        </Typography>
                        <Typography variant="h1">{profile.name} 💪</Typography>
                    </View>
                    <Pressable
                        style={styles.profileAvatar}
                        onPress={() => navigation.navigate('Settings')}
                    >
                        <Typography variant="h2" color={colors.textOnPrimary}>
                            {profile.name.charAt(0)}
                        </Typography>
                    </Pressable>
                </View>

                {/* Today's Workout Card - Hero */}
                <View style={styles.heroCard}>
                    <View style={styles.heroGradient} />
                    <View style={styles.heroContent}>
                        <View style={styles.heroInfo}>
                            <View style={styles.todayBadge}>
                                <Calendar size={14} color={colors.textOnPrimary} />
                                <Typography variant="caption" color={colors.textOnPrimary}>
                                    BUGÜN
                                </Typography>
                            </View>

                            {todaysWorkout?.isRestDay ? (
                                <>
                                    <Typography variant="h2" style={{ marginTop: spacing[2] }}>
                                        Dinlenme Günü 😴
                                    </Typography>
                                    <Typography variant="bodySmall" color={colors.textSecondary}>
                                        Kasların dinlensin, yarın tam gaz!
                                    </Typography>
                                </>
                            ) : todayTemplate ? (
                                <>
                                    <Typography variant="h2" style={{ marginTop: spacing[2] }}>
                                        {todayTemplate.name}
                                    </Typography>
                                    <Typography variant="bodySmall" color={colors.textSecondary}>
                                        {todayTemplate.exercises.length} hareket • ~{todayTemplate.estimatedDuration || 60} dk
                                    </Typography>
                                </>
                            ) : (
                                <>
                                    <Typography variant="h2" style={{ marginTop: spacing[2] }}>
                                        Antrenman Zamanı!
                                    </Typography>
                                    <Typography variant="bodySmall" color={colors.textSecondary}>
                                        Bir program seç ve başla
                                    </Typography>
                                </>
                            )}
                        </View>

                        {!todaysWorkout?.isRestDay && (
                            <Pressable
                                style={styles.startButton}
                                onPress={() => handleStartWorkout(todayTemplate?.id)}
                            >
                                <Play size={24} color={colors.textOnPrimary} fill={colors.textOnPrimary} />
                            </Pressable>
                        )}
                    </View>

                    {/* Exercise Preview */}
                    {todayTemplate && (
                        <View style={styles.exercisePreview}>
                            {todayTemplate.exercises.slice(0, 3).map((exercise, index) => (
                                <View key={exercise.id} style={styles.previewItem}>
                                    <View style={styles.previewDot} />
                                    <Typography variant="caption" numberOfLines={1}>
                                        {exercise.name} ({exercise.defaultSets}x)
                                    </Typography>
                                </View>
                            ))}
                            {todayTemplate.exercises.length > 3 && (
                                <Typography variant="caption" color={colors.textMuted}>
                                    +{todayTemplate.exercises.length - 3} hareket daha
                                </Typography>
                            )}
                        </View>
                    )}
                </View>

                {/* Quick Stats Row */}
                <View style={styles.statsRow}>
                    {/* Calorie Card */}
                    <Pressable
                        style={styles.statCard}
                        onPress={() => navigation.navigate('Nutrition')}
                    >
                        <View style={[styles.statIcon, { backgroundColor: colors.warning + '20' }]}>
                            <Flame size={20} color={colors.warning} />
                        </View>
                        <View style={styles.statInfo}>
                            <Typography variant="h3">{todaysNutrition.totalCalories}</Typography>
                            <Typography variant="caption" color={colors.textMuted}>
                                / {goals.dailyCalories} kcal
                            </Typography>
                        </View>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${calorieProgress}%`, backgroundColor: colors.warning }]} />
                        </View>
                    </Pressable>

                    {/* Weekly Goal Card */}
                    <Pressable
                        style={styles.statCard}
                        onPress={() => navigation.navigate('Progress')}
                    >
                        <View style={[styles.statIcon, { backgroundColor: colors.success + '20' }]}>
                            <Trophy size={20} color={colors.success} />
                        </View>
                        <View style={styles.statInfo}>
                            <Typography variant="h3">{thisWeekWorkouts}/{profile.weeklyGoal}</Typography>
                            <Typography variant="caption" color={colors.textMuted}>
                                bu hafta
                            </Typography>
                        </View>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${weeklyGoalProgress}%`, backgroundColor: colors.success }]} />
                        </View>
                    </Pressable>
                </View>

                {/* Water & Achievements Row */}
                <View style={styles.statsRow}>
                    {/* Water Card */}
                    <Pressable
                        style={styles.statCard}
                        onPress={() => addWater()}
                    >
                        <View style={[styles.statIcon, { backgroundColor: colors.info + '20' }]}>
                            <Droplets size={20} color={colors.info} />
                        </View>
                        <View style={styles.statInfo}>
                            <Typography variant="h3">{(waterRecord.totalAmount / 1000).toFixed(1)}L</Typography>
                            <Typography variant="caption" color={colors.textMuted}>
                                / {(dailyGoal / 1000).toFixed(1)}L su
                            </Typography>
                        </View>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${waterProgress}%`, backgroundColor: colors.info }]} />
                        </View>
                    </Pressable>

                    {/* Achievements Card */}
                    <Pressable
                        style={styles.statCard}
                        onPress={() => navigation.navigate('Achievements')}
                    >
                        <View style={[styles.statIcon, { backgroundColor: '#9B59B6' + '20' }]}>
                            <Award size={20} color="#9B59B6" />
                        </View>
                        <View style={styles.statInfo}>
                            <Typography variant="h3">{unlockedBadges.length}</Typography>
                            <Typography variant="caption" color={colors.textMuted}>
                                rozet • {totalPoints}p
                            </Typography>
                        </View>
                        <View style={styles.badgeRow}>
                            {unlockedBadges.slice(0, 3).map((badge, i) => (
                                <Typography key={badge.id} variant="caption">{badge.emoji}</Typography>
                            ))}
                        </View>
                    </Pressable>
                </View>

                {/* Quick Start Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Typography variant="h3">Hızlı Başlat</Typography>
                        <Pressable onPress={() => navigation.navigate('Templates')}>
                            <Typography variant="buttonSmall" color={colors.primary}>
                                Tümünü Gör
                            </Typography>
                        </Pressable>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.templatesScroll}
                    >
                        {/* Empty Workout */}
                        <Pressable
                            style={styles.templateCard}
                            onPress={() => handleStartWorkout()}
                        >
                            <View style={[styles.templateIcon, { backgroundColor: colors.info + '20' }]}>
                                <Zap size={24} color={colors.info} />
                            </View>
                            <Typography variant="body">Boş Antrenman</Typography>
                            <Typography variant="caption" color={colors.textMuted}>
                                Serbest çalışma
                            </Typography>
                        </Pressable>

                        {templates.slice(0, 4).map((template) => (
                            <Pressable
                                key={template.id}
                                style={styles.templateCard}
                                onPress={() => handleStartWorkout(template.id)}
                            >
                                <View style={[styles.templateIcon, { backgroundColor: (template.color || colors.primary) + '20' }]}>
                                    <Dumbbell size={24} color={template.color || colors.primary} />
                                </View>
                                <Typography variant="body" numberOfLines={1}>{template.name}</Typography>
                                <Typography variant="caption" color={colors.textMuted}>
                                    {template.exercises.length} hareket
                                </Typography>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>

                {/* Weekly Overview */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Typography variant="h3">Bu Hafta</Typography>
                        <Pressable onPress={() => navigation.navigate('Program')}>
                            <ChevronRight size={20} color={colors.textMuted} />
                        </Pressable>
                    </View>

                    <View style={styles.weekGrid}>
                        {activeProgram?.days.map((day) => {
                            const isToday = day.dayIndex === new Date().getDay();
                            return (
                                <View
                                    key={day.dayIndex}
                                    style={[
                                        styles.dayCell,
                                        isToday && styles.dayCellToday,
                                        day.isRestDay && styles.dayCellRest,
                                    ]}
                                >
                                    <Typography
                                        variant="caption"
                                        color={isToday ? colors.textOnPrimary : colors.textSecondary}
                                    >
                                        {day.dayName.slice(0, 3)}
                                    </Typography>
                                    {!day.isRestDay && day.templateName && (
                                        <View style={[styles.dayDot, isToday && styles.dayDotToday]} />
                                    )}
                                </View>
                            );
                        })}
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
    scrollView: {
        flex: 1,
    },
    content: {
        padding: layout.screenPaddingHorizontal,
        paddingBottom: 100,
        gap: spacing[5],
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerText: {
        gap: spacing[1],
    },
    profileAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            web: { cursor: 'pointer' },
        }),
    },
    heroCard: {
        backgroundColor: colors.surface,
        borderRadius: layout.radiusLarge,
        borderWidth: 1,
        borderColor: colors.primary + '40',
        overflow: 'hidden',
    },
    heroGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: colors.primary,
    },
    heroContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: layout.cardPadding,
    },
    heroInfo: {
        flex: 1,
        gap: spacing[1],
    },
    todayBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: spacing[2],
        paddingVertical: spacing[1],
        borderRadius: layout.radiusSmall,
        alignSelf: 'flex-start',
        gap: spacing[1],
    },
    startButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            web: { cursor: 'pointer' },
        }),
    },
    exercisePreview: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
        padding: layout.cardPadding,
        paddingTop: spacing[3],
        gap: spacing[2],
    },
    previewItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
    },
    previewDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.primary,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing[3],
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: layout.radiusMedium,
        padding: spacing[4],
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing[2],
        ...Platform.select({
            web: { cursor: 'pointer' },
        }),
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: layout.radiusMedium,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statInfo: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: spacing[1],
    },
    progressBar: {
        height: 4,
        backgroundColor: colors.surfaceLight,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    section: {
        gap: spacing[3],
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    templatesScroll: {
        gap: spacing[3],
        paddingRight: spacing[4],
    },
    templateCard: {
        width: 140,
        backgroundColor: colors.surface,
        borderRadius: layout.radiusMedium,
        padding: spacing[4],
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing[2],
        ...Platform.select({
            web: { cursor: 'pointer' },
        }),
    },
    templateIcon: {
        width: 48,
        height: 48,
        borderRadius: layout.radiusMedium,
        alignItems: 'center',
        justifyContent: 'center',
    },
    weekGrid: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: layout.radiusMedium,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    dayCell: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: spacing[3],
        gap: spacing[2],
    },
    dayCellToday: {
        backgroundColor: colors.primary,
    },
    dayCellRest: {
        opacity: 0.5,
    },
    dayDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.primary,
    },
    dayDotToday: {
        backgroundColor: colors.textOnPrimary,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: spacing[1],
    },
});
