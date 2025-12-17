// FitLog - Advanced Rest Timer Component
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    StyleSheet,
    Pressable,
    Animated,
    Vibration,
    Platform,
} from 'react-native';
import { Play, Pause, RotateCcw, Plus, Minus, X, Volume2, VolumeX } from 'lucide-react-native';
import { Typography, H1 } from '../atoms';
import { useThemeStore, useUserStore } from '../../store';
import { spacing, layout } from '../../theme/spacing';

interface RestTimerProps {
    isVisible: boolean;
    onClose: () => void;
    onComplete?: () => void;
    initialTime?: number; // seconds
    autoStart?: boolean;
}

export const RestTimer: React.FC<RestTimerProps> = ({
    isVisible,
    onClose,
    onComplete,
    initialTime,
    autoStart = false,
}) => {
    const colors = useThemeStore((state) => state.colors);
    const { profile } = useUserStore();

    const defaultTime = initialTime || profile.restTimerDefault || 90;

    const [timeLeft, setTimeLeft] = useState(defaultTime);
    const [isRunning, setIsRunning] = useState(autoStart);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

    const progressAnim = useRef(new Animated.Value(1)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Presets
    const presets = [30, 60, 90, 120, 180];

    // Format time
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Progress percentage
    const progress = timeLeft / defaultTime;

    // Handle timer completion
    const handleComplete = useCallback(() => {
        setIsRunning(false);

        // Vibration
        if (Platform.OS !== 'web') {
            Vibration.vibrate([0, 500, 200, 500]);
        }

        // Pulse animation
        Animated.sequence([
            Animated.timing(pulseAnim, {
                toValue: 1.1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();

        onComplete?.();
    }, [onComplete, pulseAnim]);

    // Timer logic
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, handleComplete]);

    // Progress animation
    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: progress,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [progress, progressAnim]);

    // Reset when time changes
    useEffect(() => {
        setTimeLeft(defaultTime);
        progressAnim.setValue(1);
    }, [defaultTime]);

    const handleStart = () => setIsRunning(true);
    const handlePause = () => setIsRunning(false);

    const handleReset = () => {
        setIsRunning(false);
        setTimeLeft(selectedPreset || defaultTime);
        progressAnim.setValue(1);
    };

    const handleAdjust = (seconds: number) => {
        const newTime = Math.max(0, Math.min(600, timeLeft + seconds));
        setTimeLeft(newTime);
    };

    const handlePreset = (seconds: number) => {
        setSelectedPreset(seconds);
        setTimeLeft(seconds);
        setIsRunning(false);
        progressAnim.setValue(1);
    };

    if (!isVisible) return null;

    const styles = createStyles(colors);

    // Determine progress color based on time left
    const getProgressColor = () => {
        if (timeLeft <= 10) return colors.error;
        if (timeLeft <= 30) return colors.warning;
        return colors.primary;
    };

    return (
        <View style={styles.overlay}>
            <Animated.View style={[styles.container, { transform: [{ scale: pulseAnim }] }]}>
                {/* Header */}
                <View style={styles.header}>
                    <Typography variant="h2">Dinlenme Süresi</Typography>
                    <View style={styles.headerActions}>
                        <Pressable
                            style={styles.iconButton}
                            onPress={() => setSoundEnabled(!soundEnabled)}
                        >
                            {soundEnabled ? (
                                <Volume2 size={20} color={colors.textSecondary} />
                            ) : (
                                <VolumeX size={20} color={colors.textMuted} />
                            )}
                        </Pressable>
                        <Pressable style={styles.iconButton} onPress={onClose}>
                            <X size={24} color={colors.textSecondary} />
                        </Pressable>
                    </View>
                </View>

                {/* Timer Circle */}
                <View style={styles.timerContainer}>
                    <View style={styles.progressRing}>
                        <Animated.View
                            style={[
                                styles.progressFill,
                                {
                                    backgroundColor: getProgressColor(),
                                    transform: [{
                                        rotate: progressAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['360deg', '0deg'],
                                        }),
                                    }],
                                },
                            ]}
                        />
                        <View style={styles.timerInner}>
                            <H1 style={[styles.timerText, { color: getProgressColor() }]}>
                                {formatTime(timeLeft)}
                            </H1>
                            <Typography variant="caption" color={colors.textSecondary}>
                                {isRunning ? 'Devam ediyor...' : 'Durduruldu'}
                            </Typography>
                        </View>
                    </View>
                </View>

                {/* Adjust Buttons */}
                <View style={styles.adjustButtons}>
                    <Pressable
                        style={styles.adjustButton}
                        onPress={() => handleAdjust(-15)}
                    >
                        <Minus size={20} color={colors.textPrimary} />
                        <Typography variant="caption">15s</Typography>
                    </Pressable>

                    <Pressable
                        style={[styles.controlButton, isRunning ? styles.pauseButton : styles.playButton]}
                        onPress={isRunning ? handlePause : handleStart}
                    >
                        {isRunning ? (
                            <Pause size={32} color="#fff" />
                        ) : (
                            <Play size={32} color="#fff" style={{ marginLeft: 4 }} />
                        )}
                    </Pressable>

                    <Pressable
                        style={styles.adjustButton}
                        onPress={() => handleAdjust(15)}
                    >
                        <Plus size={20} color={colors.textPrimary} />
                        <Typography variant="caption">15s</Typography>
                    </Pressable>
                </View>

                {/* Reset Button */}
                <Pressable style={styles.resetButton} onPress={handleReset}>
                    <RotateCcw size={18} color={colors.textSecondary} />
                    <Typography variant="body" color={colors.textSecondary}>
                        Sıfırla
                    </Typography>
                </Pressable>

                {/* Presets */}
                <View style={styles.presets}>
                    <Typography variant="label" color={colors.textSecondary} style={styles.presetsLabel}>
                        HIZLI SEÇENEKLER
                    </Typography>
                    <View style={styles.presetsRow}>
                        {presets.map((preset) => (
                            <Pressable
                                key={preset}
                                style={[
                                    styles.presetButton,
                                    selectedPreset === preset && styles.presetButtonActive,
                                ]}
                                onPress={() => handlePreset(preset)}
                            >
                                <Typography
                                    variant="body"
                                    color={selectedPreset === preset ? colors.textOnPrimary : colors.textPrimary}
                                    style={{ fontWeight: '600' }}
                                >
                                    {preset >= 60 ? `${preset / 60}dk` : `${preset}s`}
                                </Typography>
                            </Pressable>
                        ))}
                    </View>
                </View>
            </Animated.View>
        </View>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    container: {
        backgroundColor: colors.surface,
        borderRadius: layout.radiusLarge,
        padding: spacing[6],
        width: '90%',
        maxWidth: 400,
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: spacing[4],
    },
    headerActions: {
        flexDirection: 'row',
        gap: spacing[2],
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timerContainer: {
        marginVertical: spacing[4],
    },
    progressRing: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 8,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    progressFill: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0.2,
    },
    timerInner: {
        alignItems: 'center',
        gap: spacing[1],
    },
    timerText: {
        fontSize: 48,
        fontWeight: '800',
    },
    adjustButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[4],
        marginVertical: spacing[4],
    },
    adjustButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    controlButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    playButton: {
        backgroundColor: colors.primary,
    },
    pauseButton: {
        backgroundColor: colors.warning,
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
        padding: spacing[3],
    },
    presets: {
        width: '100%',
        marginTop: spacing[4],
        paddingTop: spacing[4],
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    presetsLabel: {
        marginBottom: spacing[3],
    },
    presetsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing[2],
    },
    presetButton: {
        flex: 1,
        paddingVertical: spacing[3],
        borderRadius: layout.radiusMedium,
        backgroundColor: colors.background,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    presetButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
});
