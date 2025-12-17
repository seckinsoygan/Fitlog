// FitLog - Rest Timer Component
import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, Vibration } from 'react-native';
import { Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { layout, spacing } from '../../theme/spacing';
import { Typography, Button } from '../atoms';

interface RestTimerProps {
    initialSeconds?: number;
    onComplete?: () => void;
    autoStart?: boolean;
}

export const RestTimer: React.FC<RestTimerProps> = ({
    initialSeconds = 90,
    onComplete,
    autoStart = true,
}) => {
    const [seconds, setSeconds] = useState(initialSeconds);
    const [isRunning, setIsRunning] = useState(autoStart);
    const [totalSeconds, setTotalSeconds] = useState(initialSeconds);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRunning && seconds > 0) {
            interval = setInterval(() => {
                setSeconds((prev) => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        Vibration.vibrate([0, 500, 200, 500]);
                        onComplete?.();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isRunning, seconds, onComplete]);

    const formatTime = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
    };

    const handleToggle = useCallback(() => {
        setIsRunning(!isRunning);
    }, [isRunning]);

    const handleReset = useCallback(() => {
        setSeconds(totalSeconds);
        setIsRunning(false);
    }, [totalSeconds]);

    const handleAddTime = useCallback((amount: number) => {
        setSeconds((prev) => Math.max(0, prev + amount));
        setTotalSeconds((prev) => Math.max(0, prev + amount));
    }, []);

    const progress = seconds / totalSeconds;

    return (
        <View style={styles.container}>
            <Typography variant="label" style={styles.title}>
                DİNLENME SÜRESİ
            </Typography>

            {/* Progress Ring Simulation */}
            <View style={styles.timerContainer}>
                <View
                    style={[
                        styles.progressBackground,
                        { borderColor: colors.surface },
                    ]}
                />
                <View
                    style={[
                        styles.progressForeground,
                        {
                            borderColor: seconds > 10 ? colors.primary : colors.warning,
                            transform: [{ rotate: `${(1 - progress) * 360}deg` }],
                        },
                    ]}
                />
                <View style={styles.timerInner}>
                    <Typography variant="dataLarge" color={seconds > 10 ? colors.primary : colors.warning}>
                        {formatTime(seconds)}
                    </Typography>
                </View>
            </View>

            {/* Time Adjustment */}
            <View style={styles.adjustContainer}>
                <Pressable
                    style={styles.adjustButton}
                    onPress={() => handleAddTime(-15)}
                >
                    <Minus size={20} color={colors.textSecondary} />
                    <Typography variant="caption">15s</Typography>
                </Pressable>

                <Pressable style={styles.controlButton} onPress={handleToggle}>
                    {isRunning ? (
                        <Pause size={24} color={colors.textPrimary} />
                    ) : (
                        <Play size={24} color={colors.textPrimary} fill={colors.textPrimary} />
                    )}
                </Pressable>

                <Pressable style={styles.controlButton} onPress={handleReset}>
                    <RotateCcw size={20} color={colors.textSecondary} />
                </Pressable>

                <Pressable
                    style={styles.adjustButton}
                    onPress={() => handleAddTime(15)}
                >
                    <Plus size={20} color={colors.textSecondary} />
                    <Typography variant="caption">15s</Typography>
                </Pressable>
            </View>

            {/* Skip Button */}
            <Button
                title="Dinlenmeyi Atla"
                variant="ghost"
                onPress={onComplete || (() => { })}
                style={styles.skipButton}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: layout.cardPadding,
        backgroundColor: colors.surface,
        borderRadius: layout.radiusLarge,
        marginVertical: spacing[4],
    },
    title: {
        marginBottom: spacing[4],
    },
    timerContainer: {
        width: 160,
        height: 160,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    progressBackground: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 6,
    },
    progressForeground: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 6,
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
    },
    timerInner: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    adjustContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[4],
        marginTop: spacing[4],
    },
    adjustButton: {
        alignItems: 'center',
        gap: spacing[1],
    },
    controlButton: {
        width: 48,
        height: 48,
        borderRadius: layout.radiusFull,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    skipButton: {
        marginTop: spacing[4],
    },
});
