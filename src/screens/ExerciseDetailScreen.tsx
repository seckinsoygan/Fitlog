// FitLog - Exercise Detail Screen with Dynamic Theme
import React from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Pressable,
    Platform,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Play, ExternalLink, Dumbbell, Target, Settings2 } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { layout, spacing } from '../theme/spacing';
import { Typography, H1, Button } from '../components/atoms';
import { useExerciseLibraryStore, useThemeStore } from '../store';

export const ExerciseDetailScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const colors = useThemeStore((state) => state.colors);
    const exerciseId = route.params?.exerciseId;

    const { getExerciseById } = useExerciseLibraryStore();
    const exercise = getExerciseById(exerciseId);

    if (!exercise) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <Typography variant="body">Egzersiz bulunamadı</Typography>
            </SafeAreaView>
        );
    }

    const youtubeUrl = exercise.youtubeVideoId
        ? `https://www.youtube.com/watch?v=${exercise.youtubeVideoId}`
        : null;

    const youtubeEmbedUrl = exercise.youtubeVideoId
        ? `https://www.youtube.com/embed/${exercise.youtubeVideoId}?rel=0&modestbranding=1`
        : null;

    const handleOpenYoutube = () => {
        if (youtubeUrl) Linking.openURL(youtubeUrl);
    };

    const dynamicStyles = createStyles(colors);

    return (
        <SafeAreaView style={dynamicStyles.container} edges={['top']}>
            {/* Header */}
            <View style={dynamicStyles.header}>
                <Pressable style={dynamicStyles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft size={24} color={colors.textPrimary} />
                </Pressable>
                <View style={dynamicStyles.headerTitle}>
                    <Typography variant="h2" numberOfLines={1}>{exercise.name}</Typography>
                    <Typography variant="caption" color={colors.textSecondary}>{exercise.muscleGroup}</Typography>
                </View>
            </View>

            <ScrollView style={dynamicStyles.scrollView} contentContainerStyle={dynamicStyles.content} showsVerticalScrollIndicator={false}>
                {/* Video Section */}
                {youtubeEmbedUrl && (
                    <View style={dynamicStyles.videoSection}>
                        <Typography variant="label" color={colors.textSecondary} style={{ marginBottom: spacing[2] }}>
                            VIDEO TUTORIAL
                        </Typography>
                        {Platform.OS === 'web' ? (
                            <View style={dynamicStyles.videoContainer}>
                                <iframe
                                    src={youtubeEmbedUrl}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        border: 'none',
                                        borderRadius: 12,
                                    }}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    title={exercise.name}
                                />
                            </View>
                        ) : (
                            <Pressable style={dynamicStyles.videoPlaceholder} onPress={handleOpenYoutube}>
                                <View style={dynamicStyles.playIconContainer}>
                                    <Play size={32} color={colors.textOnPrimary} fill={colors.textOnPrimary} />
                                </View>
                                <Typography variant="body" color={colors.textPrimary}>Video'yu YouTube'da İzle</Typography>
                                <ExternalLink size={16} color={colors.primary} />
                            </Pressable>
                        )}
                    </View>
                )}

                {/* Exercise Info Cards */}
                <View style={dynamicStyles.infoGrid}>
                    <View style={dynamicStyles.infoCard}>
                        <View style={[dynamicStyles.infoIcon, { backgroundColor: colors.primary + '20' }]}>
                            <Target size={20} color={colors.primary} />
                        </View>
                        <Typography variant="label" color={colors.textSecondary}>KAS GRUBU</Typography>
                        <Typography variant="h3">{exercise.muscleGroup}</Typography>
                    </View>

                    <View style={dynamicStyles.infoCard}>
                        <View style={[dynamicStyles.infoIcon, { backgroundColor: colors.info + '20' }]}>
                            <Settings2 size={20} color={colors.info} />
                        </View>
                        <Typography variant="label" color={colors.textSecondary}>EKİPMAN</Typography>
                        <Typography variant="h3">{exercise.equipment}</Typography>
                    </View>
                </View>

                {/* Tips Section */}
                <View style={dynamicStyles.tipsSection}>
                    <Typography variant="label" color={colors.textSecondary}>İPUÇLARI</Typography>
                    <View style={dynamicStyles.tipsList}>
                        <View style={dynamicStyles.tipItem}>
                            <View style={dynamicStyles.tipDot} />
                            <Typography variant="body">Hareketi kontrollü ve yavaş yapın</Typography>
                        </View>
                        <View style={dynamicStyles.tipItem}>
                            <View style={dynamicStyles.tipDot} />
                            <Typography variant="body">Nefes alıp vermeye dikkat edin</Typography>
                        </View>
                        <View style={dynamicStyles.tipItem}>
                            <View style={dynamicStyles.tipDot} />
                            <Typography variant="body">Formunuzu koruyun, ağırlığı azaltın</Typography>
                        </View>
                        <View style={dynamicStyles.tipItem}>
                            <View style={dynamicStyles.tipDot} />
                            <Typography variant="body">Dinlenme sürelerine dikkat edin</Typography>
                        </View>
                    </View>
                </View>

                {/* Open YouTube Button (for web as secondary option) */}
                {youtubeUrl && Platform.OS === 'web' && (
                    <Button
                        title="YouTube'da Aç"
                        variant="secondary"
                        icon={<ExternalLink size={18} color={colors.primary} />}
                        onPress={handleOpenYoutube}
                        fullWidth
                    />
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
});

const createStyles = (colors: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: layout.screenPaddingHorizontal, paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing[3] },
    backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: layout.radiusMedium, backgroundColor: colors.surface, ...Platform.select({ web: { cursor: 'pointer' } }) },
    headerTitle: { flex: 1, gap: 2 },
    scrollView: { flex: 1 },
    content: { padding: layout.screenPaddingHorizontal, paddingBottom: 100, gap: spacing[5] },
    videoSection: { gap: spacing[2] },
    videoContainer: { width: '100%', aspectRatio: 16 / 9, borderRadius: layout.radiusMedium, overflow: 'hidden', backgroundColor: colors.surface },
    videoPlaceholder: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[3], backgroundColor: colors.surface, borderRadius: layout.radiusMedium, padding: spacing[6], borderWidth: 1, borderColor: colors.border, ...Platform.select({ web: { cursor: 'pointer' } }) },
    playIconContainer: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    infoGrid: { flexDirection: 'row', gap: spacing[3] },
    infoCard: { flex: 1, backgroundColor: colors.surface, borderRadius: layout.radiusMedium, padding: spacing[4], borderWidth: 1, borderColor: colors.border, gap: spacing[2] },
    infoIcon: { width: 44, height: 44, borderRadius: layout.radiusMedium, alignItems: 'center', justifyContent: 'center' },
    tipsSection: { backgroundColor: colors.surface, borderRadius: layout.radiusMedium, padding: layout.cardPadding, borderWidth: 1, borderColor: colors.border, gap: spacing[3] },
    tipsList: { gap: spacing[3] },
    tipItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] },
    tipDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 6 },
});
