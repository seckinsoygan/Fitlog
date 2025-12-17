// FitLog - Water Tracker Widget
import React from 'react';
import {
    View,
    StyleSheet,
    Pressable,
    Animated,
} from 'react-native';
import { Droplets, Plus, Minus, Target } from 'lucide-react-native';
import { Typography, H2 } from '../atoms';
import { useThemeStore } from '../../store';
import { useWaterStore } from '../../store/waterStore';
import { spacing, layout } from '../../theme/spacing';

interface WaterTrackerProps {
    compact?: boolean;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({ compact = false }) => {
    const colors = useThemeStore((state) => state.colors);
    const {
        dailyGoal,
        glassSize,
        addWater,
        removeLastEntry,
        getTodayRecord,
        getTodayProgress
    } = useWaterStore();

    const todayRecord = getTodayRecord();
    const progress = getTodayProgress();
    const glasses = Math.floor(todayRecord.totalAmount / glassSize);
    const remainingMl = Math.max(0, dailyGoal - todayRecord.totalAmount);

    const styles = createStyles(colors, compact);

    // Progress circle calculation
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    if (compact) {
        return (
            <Pressable style={styles.compactContainer} onPress={() => addWater()}>
                <View style={styles.compactProgress}>
                    <Droplets size={20} color={colors.info} />
                    <Typography variant="body" style={{ fontWeight: '700' }}>
                        {glasses}
                    </Typography>
                </View>
                <Typography variant="caption" color={colors.textSecondary}>
                    bardak
                </Typography>
            </Pressable>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Droplets size={24} color={colors.info} />
                    <H2>Su Takibi</H2>
                </View>
                <View style={styles.goalBadge}>
                    <Target size={14} color={colors.textSecondary} />
                    <Typography variant="caption" color={colors.textSecondary}>
                        {(dailyGoal / 1000).toFixed(1)}L
                    </Typography>
                </View>
            </View>

            {/* Progress Section */}
            <View style={styles.progressSection}>
                {/* Circle Progress */}
                <View style={styles.circleContainer}>
                    <svg width="100" height="100" style={styles.svg as any}>
                        {/* Background circle */}
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke={colors.border}
                            strokeWidth="8"
                            fill="none"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke={colors.info}
                            strokeWidth="8"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            transform="rotate(-90 50 50)"
                        />
                    </svg>
                    <View style={styles.circleContent}>
                        <Typography variant="h2" color={colors.info}>
                            {Math.round(progress)}%
                        </Typography>
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.stats}>
                    <View style={styles.statItem}>
                        <Typography variant="h2">
                            {(todayRecord.totalAmount / 1000).toFixed(1)}L
                        </Typography>
                        <Typography variant="caption" color={colors.textSecondary}>
                            içildi
                        </Typography>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Typography variant="h2">
                            {glasses}
                        </Typography>
                        <Typography variant="caption" color={colors.textSecondary}>
                            bardak
                        </Typography>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Typography variant="h2" color={remainingMl > 0 ? colors.textPrimary : colors.success}>
                            {(remainingMl / 1000).toFixed(1)}L
                        </Typography>
                        <Typography variant="caption" color={colors.textSecondary}>
                            kaldı
                        </Typography>
                    </View>
                </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                <Pressable
                    style={[styles.actionButton, styles.minusButton]}
                    onPress={removeLastEntry}
                    disabled={todayRecord.entries.length === 0}
                >
                    <Minus size={20} color={todayRecord.entries.length === 0 ? colors.textMuted : colors.error} />
                </Pressable>

                <Pressable
                    style={[styles.actionButton, styles.addButton]}
                    onPress={() => addWater()}
                >
                    <Droplets size={24} color="#fff" />
                    <Typography variant="body" color="#fff" style={{ fontWeight: '700' }}>
                        +{glassSize}ml
                    </Typography>
                </Pressable>

                <Pressable
                    style={[styles.actionButton, styles.plusButton]}
                    onPress={() => addWater(500)}
                >
                    <Plus size={20} color={colors.info} />
                    <Typography variant="caption" color={colors.info}>500ml</Typography>
                </Pressable>
            </View>

            {/* Quick Add Options */}
            <View style={styles.quickOptions}>
                {[150, 200, 250, 330, 500].map((ml) => (
                    <Pressable
                        key={ml}
                        style={[
                            styles.quickOption,
                            glassSize === ml && styles.quickOptionActive,
                        ]}
                        onPress={() => addWater(ml)}
                    >
                        <Typography
                            variant="caption"
                            color={glassSize === ml ? colors.info : colors.textSecondary}
                        >
                            {ml}ml
                        </Typography>
                    </Pressable>
                ))}
            </View>

            {/* Motivation */}
            {progress >= 100 && (
                <View style={styles.celebration}>
                    <Typography variant="body" color={colors.success} style={{ textAlign: 'center' }}>
                        🎉 Tebrikler! Günlük hedefinize ulaştınız!
                    </Typography>
                </View>
            )}
        </View>
    );
};

const createStyles = (colors: any, compact: boolean) => StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        borderRadius: layout.radiusLarge,
        padding: spacing[5],
        borderWidth: 1,
        borderColor: colors.border,
    },
    compactContainer: {
        backgroundColor: colors.surface,
        borderRadius: layout.radiusMedium,
        padding: spacing[3],
        alignItems: 'center',
        gap: spacing[1],
        borderWidth: 1,
        borderColor: colors.border,
        minWidth: 70,
    },
    compactProgress: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[1],
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[4],
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
    },
    goalBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[1],
        backgroundColor: colors.background,
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[1],
        borderRadius: layout.radiusSmall,
    },
    progressSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[4],
        marginBottom: spacing[4],
    },
    circleContainer: {
        position: 'relative',
        width: 100,
        height: 100,
    },
    svg: {
        position: 'absolute',
    },
    circleContent: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stats: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: colors.border,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
        marginBottom: spacing[4],
    },
    actionButton: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: layout.radiusMedium,
    },
    minusButton: {
        width: 44,
        height: 44,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
    },
    addButton: {
        flex: 1,
        flexDirection: 'row',
        gap: spacing[2],
        backgroundColor: colors.info,
        paddingVertical: spacing[3],
    },
    plusButton: {
        width: 60,
        height: 44,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.info,
        gap: spacing[0],
    },
    quickOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing[2],
    },
    quickOption: {
        flex: 1,
        paddingVertical: spacing[2],
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: layout.radiusSmall,
        borderWidth: 1,
        borderColor: colors.border,
    },
    quickOptionActive: {
        borderColor: colors.info,
        backgroundColor: colors.info + '10',
    },
    celebration: {
        marginTop: spacing[4],
        padding: spacing[3],
        backgroundColor: colors.success + '15',
        borderRadius: layout.radiusMedium,
    },
});
