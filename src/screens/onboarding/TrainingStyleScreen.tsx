// FitLog - Training Style Selection Screen
import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Pressable,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, ChevronRight } from 'lucide-react-native';
import { layout, spacing } from '../../theme/spacing';
import { Typography, H1, H2, Button } from '../../components/atoms';
import { useThemeStore } from '../../store';
import {
    useOnboardingStore,
    TrainingStyle,
    trainingStyleConfigs
} from '../../store/onboardingStore';

export const TrainingStyleScreen: React.FC = () => {
    const colors = useThemeStore((state) => state.colors);
    const {
        onboardingData,
        setTrainingStyle,
        setFitnessLevel,
        setWeeklyAvailability,
        completeTrainingStyleSelection
    } = useOnboardingStore();

    const [selectedStyle, setSelectedStyle] = useState<TrainingStyle | null>(
        onboardingData.trainingStyle
    );
    const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced' | null>(
        onboardingData.fitnessLevel
    );
    const [step, setStep] = useState(1);

    const handleStyleSelect = (style: TrainingStyle) => {
        setSelectedStyle(style);
        setTrainingStyle(style);
    };

    const handleLevelSelect = (level: 'beginner' | 'intermediate' | 'advanced') => {
        setSelectedLevel(level);
        setFitnessLevel(level);
    };

    const handleContinue = () => {
        if (step === 1 && selectedStyle) {
            setStep(2);
        } else if (step === 2 && selectedLevel) {
            // Complete training style selection - templates are already set by default
            completeTrainingStyleSelection();
        }
    };

    const dynamicStyles = createStyles(colors);

    const fitnessLevels = [
        {
            id: 'beginner',
            title: 'Başlangıç',
            description: '0-6 ay deneyim. Temel hareketleri öğreniyorum.',
            emoji: '🌱',
        },
        {
            id: 'intermediate',
            title: 'Orta Seviye',
            description: '6 ay - 2 yıl deneyim. Çoğu harekette rahatzım.',
            emoji: '🌿',
        },
        {
            id: 'advanced',
            title: 'İleri Seviye',
            description: '2+ yıl deneyim. Karmaşık programları uyguluyorum.',
            emoji: '🌳',
        },
    ];

    return (
        <SafeAreaView style={dynamicStyles.container}>
            <ScrollView
                style={dynamicStyles.scrollView}
                contentContainerStyle={dynamicStyles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={dynamicStyles.header}>
                    <Typography variant="caption" color={colors.primary} style={dynamicStyles.stepIndicator}>
                        ADIM {step}/2
                    </Typography>
                    <H1 style={{ textAlign: 'center' }}>
                        {step === 1 ? 'Antrenman Stilini Seç' : 'Seviyeni Belirle'}
                    </H1>
                    <Typography variant="body" color={colors.textSecondary} style={{ textAlign: 'center' }}>
                        {step === 1
                            ? 'Hedefine en uygun antrenman stilini seç'
                            : 'Deneyim seviyeni seç, program buna göre hazırlansın'}
                    </Typography>
                </View>

                {/* Step 1: Training Style Selection */}
                {step === 1 && (
                    <View style={dynamicStyles.optionsContainer}>
                        {(Object.keys(trainingStyleConfigs) as TrainingStyle[]).map((styleKey) => {
                            const config = trainingStyleConfigs[styleKey];
                            const isSelected = selectedStyle === styleKey;

                            return (
                                <Pressable
                                    key={styleKey}
                                    style={[
                                        dynamicStyles.styleCard,
                                        isSelected && {
                                            borderColor: config.color,
                                            backgroundColor: config.color + '10'
                                        },
                                    ]}
                                    onPress={() => handleStyleSelect(styleKey)}
                                >
                                    <View style={dynamicStyles.styleCardContent}>
                                        <View style={[dynamicStyles.emojiContainer, { backgroundColor: config.color + '20' }]}>
                                            <Typography variant="h1">{config.emoji}</Typography>
                                        </View>
                                        <View style={dynamicStyles.styleInfo}>
                                            <Typography variant="h3">{config.name}</Typography>
                                            <Typography variant="caption" color={colors.textSecondary}>
                                                {config.description}
                                            </Typography>
                                            <View style={dynamicStyles.styleStats}>
                                                <View style={dynamicStyles.statBadge}>
                                                    <Typography variant="caption" color={config.color}>
                                                        {config.repsRange} tekrar
                                                    </Typography>
                                                </View>
                                                <View style={dynamicStyles.statBadge}>
                                                    <Typography variant="caption" color={config.color}>
                                                        {config.setsPerExercise} set
                                                    </Typography>
                                                </View>
                                            </View>
                                        </View>
                                        {isSelected && (
                                            <View style={[dynamicStyles.checkCircle, { backgroundColor: config.color }]}>
                                                <Check size={16} color="#fff" />
                                            </View>
                                        )}
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>
                )}

                {/* Step 2: Fitness Level Selection */}
                {step === 2 && (
                    <View style={dynamicStyles.optionsContainer}>
                        {fitnessLevels.map((level) => {
                            const isSelected = selectedLevel === level.id;

                            return (
                                <Pressable
                                    key={level.id}
                                    style={[
                                        dynamicStyles.levelCard,
                                        isSelected && {
                                            borderColor: colors.primary,
                                            backgroundColor: colors.primaryMuted
                                        },
                                    ]}
                                    onPress={() => handleLevelSelect(level.id as any)}
                                >
                                    <View style={dynamicStyles.levelCardContent}>
                                        <Typography variant="h1">{level.emoji}</Typography>
                                        <View style={dynamicStyles.levelInfo}>
                                            <Typography variant="h3">{level.title}</Typography>
                                            <Typography variant="caption" color={colors.textSecondary}>
                                                {level.description}
                                            </Typography>
                                        </View>
                                        {isSelected && (
                                            <View style={[dynamicStyles.checkCircle, { backgroundColor: colors.primary }]}>
                                                <Check size={16} color="#fff" />
                                            </View>
                                        )}
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>
                )}
            </ScrollView>

            {/* Bottom Button */}
            <View style={dynamicStyles.bottomContainer}>
                <Button
                    title={step === 2 ? "Programımı Oluştur" : "Devam Et"}
                    variant="primary"
                    fullWidth
                    onPress={handleContinue}
                    disabled={(step === 1 && !selectedStyle) || (step === 2 && !selectedLevel)}
                    icon={<ChevronRight size={18} color={colors.textOnPrimary} />}
                />
            </View>
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
        paddingBottom: 120,
    },
    header: {
        alignItems: 'center',
        gap: spacing[2],
        marginBottom: spacing[6],
        paddingTop: spacing[4],
    },
    stepIndicator: {
        fontWeight: '600',
        letterSpacing: 1,
    },
    optionsContainer: {
        gap: spacing[3],
    },
    styleCard: {
        backgroundColor: colors.surface,
        borderRadius: layout.radiusLarge,
        borderWidth: 2,
        borderColor: colors.border,
        overflow: 'hidden',
        ...Platform.select({ web: { cursor: 'pointer' } }) as any,
    },
    styleCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing[4],
        gap: spacing[4],
    },
    emojiContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    styleInfo: {
        flex: 1,
        gap: spacing[1],
    },
    styleStats: {
        flexDirection: 'row',
        gap: spacing[2],
        marginTop: spacing[1],
    },
    statBadge: {
        backgroundColor: colors.background,
        paddingVertical: spacing[1],
        paddingHorizontal: spacing[2],
        borderRadius: layout.radiusSmall,
    },
    checkCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    levelCard: {
        backgroundColor: colors.surface,
        borderRadius: layout.radiusLarge,
        borderWidth: 2,
        borderColor: colors.border,
        ...Platform.select({ web: { cursor: 'pointer' } }) as any,
    },
    levelCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing[4],
        gap: spacing[4],
    },
    levelInfo: {
        flex: 1,
        gap: spacing[1],
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: layout.screenPaddingHorizontal,
        paddingBottom: spacing[8],
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
});
