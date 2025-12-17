// FitLog - SetRow Component (En kritik molekül)
import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { layout, spacing } from '../../theme/spacing';
import { Typography, NumberInput } from '../atoms';

export interface SetData {
    id: string;
    setNumber: number;
    weight: string;
    reps: string;
    completed: boolean;
    isResting?: boolean;
}

interface SetRowProps {
    data: SetData;
    prevWeight?: string;
    prevReps?: string;
    onWeightChange: (value: string) => void;
    onRepsChange: (value: string) => void;
    onComplete: () => void;
    onDelete?: () => void;
}

export const SetRow: React.FC<SetRowProps> = ({
    data,
    prevWeight,
    prevReps,
    onWeightChange,
    onRepsChange,
    onComplete,
    onDelete,
}) => {
    const { setNumber, weight, reps, completed, isResting } = data;

    const getContainerStyle = () => {
        if (completed) return [styles.container, styles.completedContainer];
        if (isResting) return [styles.container, styles.restingContainer];
        return [styles.container];
    };

    const handleActionPress = () => {
        if (completed && onDelete) {
            onDelete();
        } else {
            onComplete();
        }
    };

    return (
        <View style={getContainerStyle()}>
            {/* Set Number */}
            <View style={styles.setNumber}>
                <Typography
                    variant="body"
                    color={completed ? colors.textMuted : colors.textSecondary}
                    style={styles.setNumberText}
                >
                    {setNumber}
                </Typography>
            </View>

            {/* Previous Data (Ghost) */}
            <View style={styles.previousData}>
                {prevWeight && prevReps && !completed && (
                    <Typography variant="caption" color={colors.textMuted}>
                        {prevWeight} × {prevReps}
                    </Typography>
                )}
                {completed && (
                    <Typography variant="caption" color={colors.primary}>
                        ✓ Tamamlandı
                    </Typography>
                )}
            </View>

            {/* Weight Input */}
            <NumberInput
                value={weight}
                onChangeText={onWeightChange}
                ghostValue={prevWeight}
                size="sm"
                disabled={completed}
                style={styles.input}
            />

            {/* Reps Input */}
            <NumberInput
                value={reps}
                onChangeText={onRepsChange}
                ghostValue={prevReps}
                size="sm"
                disabled={completed}
                style={styles.input}
            />

            {/* Complete/Delete Button */}
            <Pressable
                style={({ pressed }) => [
                    styles.actionButton,
                    completed ? styles.completedButton : styles.checkButton,
                    pressed && styles.actionButtonPressed,
                ]}
                onPress={handleActionPress}
                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
            >
                {completed ? (
                    <X size={18} color={colors.textOnPrimary} strokeWidth={3} />
                ) : (
                    <Check size={18} color={colors.primary} strokeWidth={2.5} />
                )}
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing[3],
        paddingHorizontal: spacing[3],
        backgroundColor: colors.surface,
        borderRadius: layout.radiusMedium,
        marginBottom: spacing[2],
        gap: spacing[2],
    },
    completedContainer: {
        backgroundColor: colors.primaryMuted,
        borderWidth: 1,
        borderColor: colors.primary + '40',
    },
    restingContainer: {
        borderWidth: 1,
        borderColor: colors.warning,
    },
    setNumber: {
        width: 32,
        height: 32,
        borderRadius: layout.radiusFull,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    setNumberText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    previousData: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 60,
    },
    input: {
        width: 70,
        minWidth: 70,
        maxWidth: 70,
    },
    actionButton: {
        width: 44,
        height: 44,
        borderRadius: layout.radiusMedium,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            web: {
                cursor: 'pointer',
            },
        }),
    },
    actionButtonPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.95 }],
    },
    checkButton: {
        backgroundColor: colors.primaryMuted,
        borderWidth: 2,
        borderColor: colors.primary,
    },
    completedButton: {
        backgroundColor: colors.error,
    },
});
