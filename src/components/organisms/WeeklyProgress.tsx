// FitLog - WeeklyProgress Component
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { layout, spacing } from '../../theme/spacing';
import { Typography } from '../atoms';

interface WeekDay {
    day: string;
    completed: boolean;
    isToday: boolean;
}

interface WeeklyProgressProps {
    days: WeekDay[];
    completedCount: number;
    goalCount: number;
}

export const WeeklyProgress: React.FC<WeeklyProgressProps> = ({
    days,
    completedCount,
    goalCount,
}) => {
    const progressPercentage = Math.min((completedCount / goalCount) * 100, 100);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Typography variant="h3">Haftalık Hedef</Typography>
                <Typography variant="data" color={colors.primary}>
                    {completedCount}/{goalCount}
                </Typography>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
                <View
                    style={[styles.progressBarFill, { width: `${progressPercentage}%` }]}
                />
            </View>

            {/* Days */}
            <View style={styles.daysContainer}>
                {days.map((day, index) => (
                    <View key={index} style={styles.dayItem}>
                        <View
                            style={[
                                styles.dayDot,
                                day.completed && styles.dayDotCompleted,
                                day.isToday && styles.dayDotToday,
                            ]}
                        >
                            {day.completed && (
                                <Typography variant="caption" color={colors.textOnPrimary}>
                                    ✓
                                </Typography>
                            )}
                        </View>
                        <Typography
                            variant="caption"
                            color={day.isToday ? colors.primary : colors.textMuted}
                        >
                            {day.day}
                        </Typography>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        borderRadius: layout.radiusLarge,
        padding: layout.cardPadding,
        borderWidth: 1,
        borderColor: colors.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[3],
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: colors.background,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: spacing[4],
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 4,
    },
    daysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayItem: {
        alignItems: 'center',
        gap: spacing[1],
    },
    dayDot: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.border,
    },
    dayDotCompleted: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    dayDotToday: {
        borderColor: colors.primary,
    },
});
