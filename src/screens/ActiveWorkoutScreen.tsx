// FitLog - Active Workout Screen
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { layout, spacing } from '../theme/spacing';
import { Typography, Button } from '../components/atoms';
import { Header, RestTimer } from '../components/molecules';
import { ExerciseCard } from '../components/organisms';
import { useWorkoutData, useTimer } from '../hooks';

// Web-compatible alert function
const showAlert = (
    title: string,
    message: string,
    buttons: Array<{ text: string; style?: string; onPress?: () => void }>
) => {
    if (Platform.OS === 'web') {
        const confirmButton = buttons.find(b => b.style !== 'cancel');
        const result = window.confirm(`${title}\n\n${message}`);
        if (result && confirmButton?.onPress) {
            confirmButton.onPress();
        }
    } else {
        Alert.alert(title, message, buttons as any);
    }
};

export const ActiveWorkoutScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const [showRestTimer, setShowRestTimer] = useState(false);

    const {
        activeWorkout,
        isWorkoutActive,
        workoutStats,
        templates,
        startWorkout,
        endWorkout,
        cancelWorkout,
        createWorkoutFromTemplate,
        getPreviousExerciseData,
        toggleExerciseExpand,
        addSet,
        updateSet,
        completeSet,
        deleteSet,
    } = useWorkoutData();

    // Workout duration timer
    const { time: workoutDuration, formatTime } = useTimer({
        autoStart: isWorkoutActive,
    });

    // Start workout from template if coming from navigation
    React.useEffect(() => {
        if (!isWorkoutActive && route.params?.templateId) {
            const workout = createWorkoutFromTemplate(route.params.templateId);
            if (workout) {
                startWorkout(workout);
            }
        }
    }, [route.params?.templateId, isWorkoutActive, createWorkoutFromTemplate, startWorkout]);

    const handleSetComplete = useCallback(
        (exerciseId: string, setId: string) => {
            completeSet(exerciseId, setId);
            setShowRestTimer(true);
        },
        [completeSet]
    );

    const handleRestComplete = useCallback(() => {
        setShowRestTimer(false);
    }, []);

    const handleEndWorkout = useCallback(() => {
        showAlert(
            'Antrenmanı Bitir',
            'Antrenmanı bitirmek istediğinize emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Bitir',
                    style: 'default',
                    onPress: () => {
                        endWorkout();
                        navigation.goBack();
                    },
                },
            ]
        );
    }, [endWorkout, navigation]);

    const handleCancelWorkout = useCallback(() => {
        showAlert(
            'Antrenmanı İptal Et',
            'Tüm ilerleme silinecek. Emin misiniz?',
            [
                { text: 'Vazgeç', style: 'cancel' },
                {
                    text: 'İptal Et',
                    style: 'destructive',
                    onPress: () => {
                        cancelWorkout();
                        navigation.goBack();
                    },
                },
            ]
        );
    }, [cancelWorkout, navigation]);

    const handleGoBack = useCallback(() => {
        if (activeWorkout) {
            handleCancelWorkout();
        } else {
            navigation.goBack();
        }
    }, [activeWorkout, handleCancelWorkout, navigation]);

    if (!activeWorkout) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.noWorkoutContainer}>
                    <Typography variant="h2">Aktif Antrenman Yok</Typography>
                    <Typography variant="bodySmall" style={{ textAlign: 'center', marginTop: 8 }}>
                        Dashboard'dan bir antrenman başlatın
                    </Typography>
                    <Button
                        title="Dashboard'a Dön"
                        onPress={() => navigation.goBack()}
                        variant="primary"
                        style={{ marginTop: 24 }}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <Header
                title={activeWorkout.name}
                onBack={handleGoBack}
                showTimer={true}
                timerValue={formatTime()}
                rightComponent={
                    <Button
                        title="Bitir"
                        variant="primary"
                        size="sm"
                        onPress={handleEndWorkout}
                    />
                }
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Progress Summary */}
                {workoutStats && (
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    { width: `${workoutStats.progressPercentage}%` },
                                ]}
                            />
                        </View>
                        <Typography variant="caption">
                            {workoutStats.completedSets}/{workoutStats.totalSets} set tamamlandı •{' '}
                            {Math.round(workoutStats.totalVolume).toLocaleString()} kg hacim
                        </Typography>
                    </View>
                )}

                {/* Rest Timer */}
                {showRestTimer && (
                    <RestTimer
                        initialSeconds={90}
                        onComplete={handleRestComplete}
                        autoStart={true}
                    />
                )}

                {/* Exercise List */}
                {activeWorkout.exercises.map((exercise) => (
                    <ExerciseCard
                        key={exercise.id}
                        exercise={{
                            ...exercise,
                            isExpanded: exercise.isExpanded ?? true,
                        }}
                        previousData={getPreviousExerciseData(exercise.name)}
                        onSetChange={(setId, field, value) =>
                            updateSet(exercise.id, setId, field, value)
                        }
                        onSetComplete={(setId) => handleSetComplete(exercise.id, setId)}
                        onSetDelete={(setId) => deleteSet(exercise.id, setId)}
                        onAddSet={() => addSet(exercise.id)}
                        onToggleExpand={() => toggleExerciseExpand(exercise.id)}
                    />
                ))}

                {/* Add Exercise Button */}
                <Button
                    title="Hareket Ekle"
                    variant="secondary"
                    icon={<Plus size={18} color={colors.textPrimary} />}
                    onPress={() => navigation.navigate('Exercises', { selectMode: true })}
                    style={styles.addExerciseButton}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
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
    },
    progressContainer: {
        alignItems: 'center',
        marginBottom: spacing[4],
        gap: spacing[2],
    },
    progressBar: {
        width: '100%',
        height: 6,
        backgroundColor: colors.surface,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 3,
    },
    noWorkoutContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: layout.screenPaddingHorizontal,
    },
    addExerciseButton: {
        marginTop: spacing[4],
    },
});
