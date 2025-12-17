// FitLog - ExerciseCard Organism (Active workout exercise section)
import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { ChevronDown, ChevronUp, Plus, BarChart3 } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { layout, spacing } from '../../theme/spacing';
import { Typography } from '../atoms';
import { SetRow, SetData } from '../molecules';

export interface ExerciseData {
    id: string;
    name: string;
    muscleGroup?: string;
    sets: SetData[];
    notes?: string;
    isExpanded?: boolean;
}

interface PreviousExerciseData {
    sets: Array<{ weight: string; reps: string }>;
}

interface ExerciseCardProps {
    exercise: ExerciseData;
    previousData?: PreviousExerciseData;
    onSetChange: (setId: string, field: 'weight' | 'reps', value: string) => void;
    onSetComplete: (setId: string) => void;
    onSetDelete: (setId: string) => void;
    onAddSet: () => void;
    onToggleExpand?: () => void;
    onViewHistory?: () => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
    exercise,
    previousData,
    onSetChange,
    onSetComplete,
    onSetDelete,
    onAddSet,
    onToggleExpand,
    onViewHistory,
}) => {
    const { name, muscleGroup, sets, isExpanded = true } = exercise;

    const completedSets = sets.filter((s) => s.completed).length;
    const totalSets = sets.length;

    return (
        <View style={styles.container}>
            {/* Exercise Header */}
            <Pressable
                style={styles.header}
                onPress={onToggleExpand}
                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
            >
                <View style={styles.headerLeft}>
                    <Typography variant="h3">{name}</Typography>
                    {muscleGroup && (
                        <Typography variant="caption">{muscleGroup}</Typography>
                    )}
                </View>
                <View style={styles.headerRight}>
                    <View style={styles.progressBadge}>
                        <Typography variant="caption" color={colors.primary}>
                            {completedSets}/{totalSets}
                        </Typography>
                    </View>
                    {onViewHistory && (
                        <Pressable style={styles.historyButton} onPress={onViewHistory}>
                            <BarChart3 size={18} color={colors.textSecondary} />
                        </Pressable>
                    )}
                    {isExpanded ? (
                        <ChevronUp size={20} color={colors.textSecondary} />
                    ) : (
                        <ChevronDown size={20} color={colors.textSecondary} />
                    )}
                </View>
            </Pressable>

            {/* Sets List */}
            {isExpanded && (
                <View style={styles.setsContainer}>
                    {/* Sets Header */}
                    <View style={styles.setsHeader}>
                        <View style={styles.setHeaderCell}>
                            <Typography variant="label">SET</Typography>
                        </View>
                        <View style={styles.previousHeaderCell}>
                            <Typography variant="label">ÖNCEKİ</Typography>
                        </View>
                        <View style={styles.inputHeaderCell}>
                            <Typography variant="label">KG</Typography>
                        </View>
                        <View style={styles.inputHeaderCell}>
                            <Typography variant="label">TEKRAR</Typography>
                        </View>
                        <View style={styles.actionHeaderCell} />
                    </View>

                    {/* Set Rows */}
                    {sets.map((set, index) => (
                        <SetRow
                            key={set.id}
                            data={set}
                            prevWeight={previousData?.sets[index]?.weight}
                            prevReps={previousData?.sets[index]?.reps}
                            onWeightChange={(value) => onSetChange(set.id, 'weight', value)}
                            onRepsChange={(value) => onSetChange(set.id, 'reps', value)}
                            onComplete={() => onSetComplete(set.id)}
                            onDelete={() => onSetDelete(set.id)}
                        />
                    ))}

                    {/* Add Set Button */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.addSetButton,
                            pressed && styles.addSetButtonPressed,
                        ]}
                        onPress={onAddSet}
                    >
                        <Plus size={18} color={colors.primary} />
                        <Typography variant="buttonSmall" color={colors.primary}>
                            Set Ekle
                        </Typography>
                    </Pressable>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        borderRadius: layout.radiusLarge,
        marginBottom: spacing[4],
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: layout.cardPadding,
        backgroundColor: colors.surfaceLight,
        ...Platform.select({
            web: {
                cursor: 'pointer',
            },
        }),
    },
    headerLeft: {
        flex: 1,
        gap: spacing[1],
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
    },
    progressBadge: {
        backgroundColor: colors.primaryMuted,
        paddingHorizontal: spacing[2],
        paddingVertical: spacing[1],
        borderRadius: layout.radiusSmall,
    },
    historyButton: {
        padding: spacing[1],
    },
    setsContainer: {
        padding: layout.cardPadding,
    },
    setsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing[3],
        paddingHorizontal: spacing[1],
        gap: spacing[2],
    },
    setHeaderCell: {
        width: 32,
        alignItems: 'center',
    },
    previousHeaderCell: {
        flex: 1,
        alignItems: 'center',
        minWidth: 60,
    },
    inputHeaderCell: {
        width: 70,
        alignItems: 'center',
    },
    actionHeaderCell: {
        width: 44,
    },
    addSetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[2],
        paddingVertical: spacing[3],
        marginTop: spacing[2],
        borderWidth: 1,
        borderColor: colors.primary + '40',
        borderRadius: layout.radiusMedium,
        borderStyle: 'dashed',
        ...Platform.select({
            web: {
                cursor: 'pointer',
            },
        }),
    },
    addSetButtonPressed: {
        backgroundColor: colors.primaryMuted,
    },
});
