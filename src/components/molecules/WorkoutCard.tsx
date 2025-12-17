// FitLog - WorkoutCard Component
import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { ChevronRight, Play, Calendar } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { layout, spacing } from '../../theme/spacing';
import { Typography } from '../atoms';

interface WorkoutCardProps {
    title: string;
    exercises: string[];
    duration?: string;
    date?: string;
    isToday?: boolean;
    onPress: () => void;
    onQuickStart?: () => void;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
    title,
    exercises,
    duration,
    date,
    isToday = false,
    onPress,
    onQuickStart,
}) => {
    const handlePress = () => {
        console.log('WorkoutCard pressed:', title);
        onPress();
    };

    const handleQuickStart = (e: any) => {
        e.stopPropagation();
        console.log('Quick start pressed:', title);
        if (onQuickStart) {
            onQuickStart();
        }
    };

    return (
        <Pressable
            style={({ pressed }) => [
                styles.container,
                isToday && styles.todayContainer,
                pressed && styles.pressed,
            ]}
            onPress={handlePress}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    {isToday && (
                        <View style={styles.todayBadge}>
                            <Typography variant="caption" color={colors.textOnPrimary}>
                                BUGÜN
                            </Typography>
                        </View>
                    )}
                    <Typography variant="h3">{title}</Typography>
                </View>

                <View style={styles.exerciseList}>
                    <Typography variant="bodySmall" numberOfLines={2}>
                        {exercises.slice(0, 3).join(' • ')}
                        {exercises.length > 3 && ` +${exercises.length - 3}`}
                    </Typography>
                </View>

                <View style={styles.footer}>
                    {date && (
                        <View style={styles.metaItem}>
                            <Calendar size={14} color={colors.textMuted} />
                            <Typography variant="caption">{date}</Typography>
                        </View>
                    )}
                    {duration && (
                        <Typography variant="caption">{duration}</Typography>
                    )}
                </View>
            </View>

            <View style={styles.actions}>
                {onQuickStart && isToday ? (
                    <Pressable
                        style={({ pressed }) => [
                            styles.playButton,
                            pressed && styles.playButtonPressed,
                        ]}
                        onPress={handleQuickStart}
                        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                    >
                        <Play size={20} color={colors.textOnPrimary} fill={colors.textOnPrimary} />
                    </Pressable>
                ) : (
                    <ChevronRight size={24} color={colors.textMuted} />
                )}
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: layout.radiusLarge,
        padding: layout.cardPadding,
        marginBottom: spacing[3],
        borderWidth: 1,
        borderColor: colors.border,
        ...Platform.select({
            web: {
                cursor: 'pointer',
            },
        }),
    },
    todayContainer: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryMuted,
    },
    pressed: {
        opacity: 0.9,
        transform: [{ scale: 0.99 }],
    },
    content: {
        flex: 1,
        gap: spacing[2],
    },
    header: {
        gap: spacing[2],
    },
    todayBadge: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing[2],
        paddingVertical: 2,
        borderRadius: layout.radiusSmall,
        alignSelf: 'flex-start',
    },
    exerciseList: {
        marginTop: spacing[1],
    },
    footer: {
        flexDirection: 'row',
        gap: spacing[4],
        marginTop: spacing[1],
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[1],
    },
    actions: {
        marginLeft: spacing[3],
    },
    playButton: {
        width: 48,
        height: 48,
        borderRadius: layout.radiusFull,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            web: {
                cursor: 'pointer',
            },
        }),
    },
    playButtonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.95 }],
    },
});
