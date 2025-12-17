// FitLog - Achievements Screen
import React, { useMemo } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Award, Lock, Trophy, Flame, Dumbbell, Zap, Star, ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { layout, spacing } from '../theme/spacing';
import { Typography, H1, H2 } from '../components/atoms';
import { useThemeStore, useAchievementsStore, useWorkoutHistoryStore } from '../store';

export const AchievementsScreen: React.FC = () => {
    const navigation = useNavigation();
    const colors = useThemeStore((state) => state.colors);
    const { achievements, totalPoints, getUnlockedAchievements, getLockedAchievements } = useAchievementsStore();
    const { stats } = useWorkoutHistoryStore();

    const unlockedAchievements = getUnlockedAchievements();
    const lockedAchievements = getLockedAchievements();

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'workout': return <Dumbbell size={20} color={colors.primary} />;
            case 'volume': return <Flame size={20} color="#FF6B6B" />;
            case 'streak': return <Zap size={20} color="#F39C12" />;
            case 'special': return <Star size={20} color="#9B59B6" />;
            default: return <Award size={20} color={colors.textSecondary} />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'workout': return colors.primary;
            case 'volume': return '#FF6B6B';
            case 'streak': return '#F39C12';
            case 'special': return '#9B59B6';
            default: return colors.textSecondary;
        }
    };

    const getProgress = (achievement: any) => {
        let current = 0;
        if (achievement.category === 'workout') {
            current = stats.totalWorkouts;
        } else if (achievement.category === 'volume') {
            current = stats.totalVolume;
        } else if (achievement.category === 'streak') {
            current = 0; // TODO: Calculate streak
        } else if (achievement.id === 'weekly-goal') {
            current = stats.thisWeekWorkouts;
        }
        return Math.min((current / achievement.requirement) * 100, 100);
    };

    const styles = createStyles(colors);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with Back Button */}
            <View style={styles.headerBar}>
                <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft size={24} color={colors.textPrimary} />
                </Pressable>
                <H1>Başarılar</H1>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Subtitle */}
                <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: spacing[4] }}>
                    Rozetlerini topla, motivasyonunu artır!
                </Typography>

                {/* Points Card */}
                <View style={styles.pointsCard}>
                    <Trophy size={40} color={colors.warning} />
                    <View style={styles.pointsInfo}>
                        <Typography variant="h1" color={colors.warning}>
                            {totalPoints}
                        </Typography>
                        <Typography variant="body" color={colors.textSecondary}>
                            Toplam Puan
                        </Typography>
                    </View>
                    <View style={styles.pointsStats}>
                        <View style={styles.pointsStat}>
                            <Typography variant="h3" color={colors.success}>
                                {unlockedAchievements.length}
                            </Typography>
                            <Typography variant="caption" color={colors.textSecondary}>
                                Kazanılan
                            </Typography>
                        </View>
                        <View style={styles.pointsStat}>
                            <Typography variant="h3" color={colors.textMuted}>
                                {lockedAchievements.length}
                            </Typography>
                            <Typography variant="caption" color={colors.textSecondary}>
                                Kilitli
                            </Typography>
                        </View>
                    </View>
                </View>

                {/* Unlocked Achievements */}
                {unlockedAchievements.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <H2>🏆 Kazanılan Rozetler</H2>
                            <Typography variant="caption" color={colors.textSecondary}>
                                {unlockedAchievements.length} rozet
                            </Typography>
                        </View>
                        <View style={styles.achievementsGrid}>
                            {unlockedAchievements.map((achievement) => (
                                <View
                                    key={achievement.id}
                                    style={[styles.achievementCard, styles.achievementUnlocked]}
                                >
                                    <View style={[styles.achievementEmoji, { backgroundColor: getCategoryColor(achievement.category) + '20' }]}>
                                        <Typography variant="h1">{achievement.emoji}</Typography>
                                    </View>
                                    <Typography variant="body" style={styles.achievementTitle}>
                                        {achievement.title}
                                    </Typography>
                                    <Typography variant="caption" color={colors.textSecondary} style={styles.achievementDesc}>
                                        {achievement.description}
                                    </Typography>
                                    <View style={styles.achievementBadge}>
                                        {getCategoryIcon(achievement.category)}
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Locked Achievements */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <H2>🔒 Kilitli Rozetler</H2>
                        <Typography variant="caption" color={colors.textSecondary}>
                            {lockedAchievements.length} rozet
                        </Typography>
                    </View>
                    <View style={styles.achievementsGrid}>
                        {lockedAchievements.map((achievement) => {
                            const progress = getProgress(achievement);
                            return (
                                <View
                                    key={achievement.id}
                                    style={[styles.achievementCard, styles.achievementLocked]}
                                >
                                    <View style={[styles.achievementEmoji, styles.lockedEmoji]}>
                                        <Lock size={32} color={colors.textMuted} />
                                    </View>
                                    <Typography variant="body" color={colors.textSecondary} style={styles.achievementTitle}>
                                        {achievement.title}
                                    </Typography>
                                    <Typography variant="caption" color={colors.textMuted} style={styles.achievementDesc}>
                                        {achievement.description}
                                    </Typography>
                                    {/* Progress Bar */}
                                    <View style={styles.progressContainer}>
                                        <View style={styles.progressBar}>
                                            <View style={[styles.progressFill, { width: `${progress}%` }]} />
                                        </View>
                                        <Typography variant="caption" color={colors.textMuted}>
                                            {Math.round(progress)}%
                                        </Typography>
                                    </View>
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
    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: layout.screenPaddingHorizontal,
        paddingVertical: spacing[3],
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        padding: layout.screenPaddingHorizontal,
        paddingBottom: 100,
    },
    header: {
        gap: spacing[1],
        marginBottom: spacing[5],
    },
    pointsCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: layout.radiusLarge,
        padding: spacing[5],
        gap: spacing[4],
        marginBottom: spacing[5],
        borderWidth: 1,
        borderColor: colors.warning + '30',
    },
    pointsInfo: {
        flex: 1,
    },
    pointsStats: {
        flexDirection: 'row',
        gap: spacing[4],
    },
    pointsStat: {
        alignItems: 'center',
    },
    section: {
        marginBottom: spacing[5],
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[4],
    },
    achievementsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing[3],
    },
    achievementCard: {
        width: '47%',
        backgroundColor: colors.surface,
        borderRadius: layout.radiusLarge,
        padding: spacing[4],
        alignItems: 'center',
        gap: spacing[2],
        borderWidth: 1,
        borderColor: colors.border,
        position: 'relative',
    },
    achievementUnlocked: {
        borderColor: colors.primary + '50',
    },
    achievementLocked: {
        opacity: 0.7,
    },
    achievementEmoji: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing[1],
    },
    lockedEmoji: {
        backgroundColor: colors.background,
    },
    achievementTitle: {
        fontWeight: '600',
        textAlign: 'center',
    },
    achievementDesc: {
        textAlign: 'center',
        lineHeight: 16,
    },
    achievementBadge: {
        position: 'absolute',
        top: spacing[2],
        right: spacing[2],
    },
    progressContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
        marginTop: spacing[2],
    },
    progressBar: {
        flex: 1,
        height: 6,
        backgroundColor: colors.border,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 3,
    },
});
