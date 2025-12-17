// FitLog - Onboarding Screen
import React, { useState, useRef } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    Animated,
    Pressable,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Dumbbell,
    Target,
    LineChart,
    Users,
    ChevronRight,
    ChevronLeft,
} from 'lucide-react-native';
import { layout, spacing } from '../../theme/spacing';
import { Typography, H1, Button } from '../../components/atoms';
import { useThemeStore } from '../../store';
import { useOnboardingStore } from '../../store/onboardingStore';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}

export const OnboardingScreen: React.FC = () => {
    const colors = useThemeStore((state) => state.colors);
    const { completeOnboarding } = useOnboardingStore();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;

    const slides: OnboardingSlide[] = [
        {
            id: 1,
            title: "FitLog'a Hoş Geldin",
            subtitle: 'Fitness Yolculuğun Başlıyor',
            description: 'Antrenmanlarını takip et, ilerlemenizi gör ve hedeflerine ulaş.',
            icon: <Dumbbell size={80} color={colors.primary} />,
            color: colors.primary,
        },
        {
            id: 2,
            title: 'Kişiselleştirilmiş Programlar',
            subtitle: 'Senin İçin Tasarlandı',
            description: 'Hedeflerine uygun antrenman programları oluştur ve takip et.',
            icon: <Target size={80} color="#4ECDC4" />,
            color: '#4ECDC4',
        },
        {
            id: 3,
            title: 'İlerlemenizi Takip Et',
            subtitle: 'Gelişimini Gör',
            description: 'Detaylı istatistikler ve grafiklerle ne kadar ilerlediğini görn.',
            icon: <LineChart size={80} color="#F39C12" />,
            color: '#F39C12',
        },
        {
            id: 4,
            title: 'Hazır Mısın?',
            subtitle: 'Hadi Başlayalım',
            description: 'Hesap oluştur ve fitness hedeflerine ulaşmak için ilk adımı at.',
            icon: <Users size={80} color="#9B59B6" />,
            color: '#9B59B6',
        },
    ];

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            completeOnboarding();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleSkip = () => {
        completeOnboarding();
    };

    const dynamicStyles = createStyles(colors);
    const currentSlide = slides[currentIndex];

    return (
        <SafeAreaView style={dynamicStyles.container}>
            {/* Skip Button */}
            {currentIndex < slides.length - 1 && (
                <Pressable style={dynamicStyles.skipButton} onPress={handleSkip}>
                    <Typography variant="body" color={colors.textMuted}>
                        Atla
                    </Typography>
                </Pressable>
            )}

            {/* Slide Content */}
            <View style={dynamicStyles.slideContainer}>
                <View style={[dynamicStyles.iconContainer, { backgroundColor: currentSlide.color + '20' }]}>
                    {currentSlide.icon}
                </View>

                <View style={dynamicStyles.textContainer}>
                    <Typography
                        variant="caption"
                        color={currentSlide.color}
                        style={dynamicStyles.subtitle}
                    >
                        {currentSlide.subtitle}
                    </Typography>
                    <H1 style={{ textAlign: 'center' }}>{currentSlide.title}</H1>
                    <Typography
                        variant="body"
                        color={colors.textSecondary}
                        style={dynamicStyles.description}
                    >
                        {currentSlide.description}
                    </Typography>
                </View>
            </View>

            {/* Pagination Dots */}
            <View style={dynamicStyles.pagination}>
                {slides.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            dynamicStyles.dot,
                            index === currentIndex && {
                                backgroundColor: currentSlide.color,
                                width: 24,
                            },
                        ]}
                    />
                ))}
            </View>

            {/* Navigation Buttons */}
            <View style={dynamicStyles.navigation}>
                {currentIndex > 0 ? (
                    <Pressable style={dynamicStyles.navButton} onPress={handlePrev}>
                        <ChevronLeft size={24} color={colors.textSecondary} />
                    </Pressable>
                ) : (
                    <View style={dynamicStyles.navButton} />
                )}

                <Button
                    title={currentIndex === slides.length - 1 ? "Başla" : "Devam"}
                    variant="primary"
                    onPress={handleNext}
                    icon={currentIndex < slides.length - 1 ? <ChevronRight size={18} color={colors.textOnPrimary} /> : undefined}
                />

                <View style={dynamicStyles.navButton} />
            </View>
        </SafeAreaView>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    skipButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 20,
        right: 20,
        padding: spacing[2],
        zIndex: 10,
        ...Platform.select({ web: { cursor: 'pointer' } }) as any,
    },
    slideContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: layout.screenPaddingHorizontal,
    },
    iconContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing[8],
    },
    textContainer: {
        alignItems: 'center',
        gap: spacing[3],
    },
    subtitle: {
        textTransform: 'uppercase',
        letterSpacing: 2,
        fontWeight: '600',
    },
    description: {
        textAlign: 'center',
        paddingHorizontal: spacing[4],
        lineHeight: 24,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing[2],
        paddingVertical: spacing[6],
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.border,
    },
    navigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: layout.screenPaddingHorizontal,
        paddingBottom: spacing[8],
    },
    navButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({ web: { cursor: 'pointer' } }) as any,
    },
});
