// FitLog - Dashboard Screen with Weekly Program Editor Modal
import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Pressable,
    Platform,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Play,
    Flame,
    Trophy,
    Calendar,
    Dumbbell,
    ChevronRight,
    Zap,
    X,
    Clock,
    GripVertical,
    Moon,
    Edit3,
    ArrowLeftRight,
    Droplets,
    Award,
} from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { layout, spacing } from '../theme/spacing';
import { Typography, H2, Button } from '../components/atoms';
import { useThemeStore, useUserStore, useWeeklyProgramStore, useNutritionStore, useWorkoutHistoryStore } from '../store';
import { useWaterStore } from '../store/waterStore';
import { useAchievementsStore } from '../store/achievementsStore';

// Web-specific draggable wrapper for program editor
const WebDraggableDay: React.FC<{
    children: React.ReactNode;
    dayIndex: number;
    onDragStart: (dayIndex: number) => void;
    onDragEnd: () => void;
    onDragOver: (dayIndex: number) => void;
    onDrop: (dayIndex: number) => void;
    style?: any;
}> = ({ children, dayIndex, onDragStart, onDragEnd, onDragOver, onDrop, style }) => {
    const ref = useRef<any>(null);

    useEffect(() => {
        if (Platform.OS !== 'web' || !ref.current) return;

        const element = ref.current;

        const handleDragStart = (e: DragEvent) => {
            e.dataTransfer!.effectAllowed = 'move';
            e.dataTransfer!.setData('text/plain', dayIndex.toString());
            onDragStart(dayIndex);
            setTimeout(() => {
                if (element) element.style.opacity = '0.5';
            }, 0);
        };

        const handleDragEnd = () => {
            if (element) element.style.opacity = '1';
            onDragEnd();
        };

        const handleDragOver = (e: DragEvent) => {
            e.preventDefault();
            e.dataTransfer!.dropEffect = 'move';
            onDragOver(dayIndex);
        };

        const handleDrop = (e: DragEvent) => {
            e.preventDefault();
            onDrop(dayIndex);
        };

        element.setAttribute('draggable', 'true');
        element.addEventListener('dragstart', handleDragStart);
        element.addEventListener('dragend', handleDragEnd);
        element.addEventListener('dragover', handleDragOver);
        element.addEventListener('drop', handleDrop);

        return () => {
            element.removeEventListener('dragstart', handleDragStart);
            element.removeEventListener('dragend', handleDragEnd);
            element.removeEventListener('dragover', handleDragOver);
            element.removeEventListener('drop', handleDrop);
        };
    }, [dayIndex, onDragStart, onDragEnd, onDragOver, onDrop]);

    return (
        <View ref={ref} style={style}>
            {children}
        </View>
    );
};

export const DashboardScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const colors = useThemeStore((state) => state.colors);
    const { profile, templates } = useUserStore();
    const { getTodaysWorkout, activeProgram, assignTemplateToDay, swapDays } = useWeeklyProgramStore();
    const { getTodayNutrition, goals } = useNutritionStore();
    const { stats, getWorkoutStats, getWorkoutsForDateRange } = useWorkoutHistoryStore();
    const { getTodayProgress, getTodayRecord, dailyGoal, addWater } = useWaterStore();
    const { getUnlockedAchievements, totalPoints } = useAchievementsStore();

    // State for modals
    const [showDayHistoryModal, setShowDayHistoryModal] = useState(false);
    const [showProgramEditorModal, setShowProgramEditorModal] = useState(false);
    const [showTemplatePickerModal, setShowTemplatePickerModal] = useState(false);
    const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
    const [selectedDayWorkouts, setSelectedDayWorkouts] = useState<any[]>([]);

    // Drag & drop state
    const [draggingDay, setDraggingDay] = useState<number | null>(null);
    const [dragOverDay, setDragOverDay] = useState<number | null>(null);

    // Refresh data when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            console.log('📊 Dashboard: Refreshing data...');
            getWorkoutStats();
        }, [])
    );

    const todaysWorkout = getTodaysWorkout();
    const todaysNutrition = getTodayNutrition();
    const todayTemplate = todaysWorkout?.templateId
        ? templates.find(t => t.id === todaysWorkout.templateId)
        : null;

    const thisWeekWorkouts = stats.thisWeekWorkouts;
    const waterProgress = getTodayProgress();
    const waterRecord = getTodayRecord();
    const unlockedBadges = getUnlockedAchievements();

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Günaydın';
        if (hour < 18) return 'İyi günler';
        return 'İyi akşamlar';
    }, []);

    const calorieProgress = Math.min(100, (todaysNutrition.totalCalories / goals.dailyCalories) * 100);
    const weeklyGoalProgress = Math.min(100, (thisWeekWorkouts / profile.weeklyGoal) * 100);

    const handleStartWorkout = (templateId?: string) => {
        navigation.navigate('ActiveWorkout', { templateId });
    };

    // Handle day press in weekly view - show history
    const handleDayPress = (dayIndex: number) => {
        const now = new Date();
        const currentDay = now.getDay();
        const diff = dayIndex - currentDay;
        const selectedDate = new Date(now);
        selectedDate.setDate(now.getDate() + diff);

        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const dayWorkouts = getWorkoutsForDateRange(startOfDay, endOfDay);

        setSelectedDayIndex(dayIndex);
        setSelectedDayWorkouts(dayWorkouts);
        setShowDayHistoryModal(true);
    };

    // Handle "Bu Hafta" header press - show program editor
    const handleWeekHeaderPress = () => {
        setShowProgramEditorModal(true);
    };

    // Handle day press in program editor - show template picker
    const handleEditDayPress = (dayIndex: number) => {
        setSelectedDayIndex(dayIndex);
        setShowTemplatePickerModal(true);
    };

    // Handle template selection
    const handleTemplateSelect = (templateId: string | null, templateName: string | null) => {
        if (selectedDayIndex !== null && activeProgram) {
            assignTemplateToDay(activeProgram.id, selectedDayIndex, templateId, templateName);
        }
        setShowTemplatePickerModal(false);
        setSelectedDayIndex(null);
    };

    // Drag & drop handlers
    const handleDragStart = (dayIndex: number) => {
        setDraggingDay(dayIndex);
    };

    const handleDragEnd = () => {
        setDraggingDay(null);
        setDragOverDay(null);
    };

    const handleDragOver = (dayIndex: number) => {
        if (draggingDay !== null && draggingDay !== dayIndex) {
            setDragOverDay(dayIndex);
        }
    };

    const handleDrop = (targetDayIndex: number) => {
        if (draggingDay !== null && activeProgram && draggingDay !== targetDayIndex) {
            swapDays(activeProgram.id, draggingDay, targetDayIndex);
        }
        setDraggingDay(null);
        setDragOverDay(null);
    };

    const getDayName = (index: number) => {
        const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
        return dayNames[index];
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        return `${mins} dk`;
    };

    const styles = createStyles(colors);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerText}>
                        <Typography variant="bodySmall" color={colors.textSecondary}>
                            {greeting}
                        </Typography>
                        <Typography variant="h1">{profile.name} 💪</Typography>
                    </View>
                    <Pressable
                        style={styles.profileAvatar}
                        onPress={() => navigation.navigate('Settings')}
                    >
                        <Typography variant="h2" color={colors.textOnPrimary}>
                            {profile.name.charAt(0)}
                        </Typography>
                    </Pressable>
                </View>

                {/* Today's Workout Card - Hero */}
                <View style={styles.heroCard}>
                    <View style={styles.heroGradient} />
                    <View style={styles.heroContent}>
                        <View style={styles.heroInfo}>
                            <View style={styles.todayBadge}>
                                <Calendar size={14} color={colors.textOnPrimary} />
                                <Typography variant="caption" color={colors.textOnPrimary}>
                                    BUGÜN
                                </Typography>
                            </View>

                            {todaysWorkout?.isRestDay ? (
                                <>
                                    <Typography variant="h2" style={{ marginTop: spacing[2] }}>
                                        Dinlenme Günü 😴
                                    </Typography>
                                    <Typography variant="bodySmall" color={colors.textSecondary}>
                                        Kasların dinlensin, yarın tam gaz!
                                    </Typography>
                                </>
                            ) : todayTemplate ? (
                                <>
                                    <Typography variant="h2" style={{ marginTop: spacing[2] }}>
                                        {todayTemplate.name}
                                    </Typography>
                                    <Typography variant="bodySmall" color={colors.textSecondary}>
                                        {todayTemplate.exercises.length} hareket • ~{todayTemplate.estimatedDuration || 60} dk
                                    </Typography>
                                </>
                            ) : (
                                <>
                                    <Typography variant="h2" style={{ marginTop: spacing[2] }}>
                                        Antrenman Zamanı!
                                    </Typography>
                                    <Typography variant="bodySmall" color={colors.textSecondary}>
                                        Bir program seç ve başla
                                    </Typography>
                                </>
                            )}
                        </View>

                        {!todaysWorkout?.isRestDay && (
                            <Pressable
                                style={styles.startButton}
                                onPress={() => handleStartWorkout(todayTemplate?.id)}
                            >
                                <Play size={24} color={colors.textOnPrimary} fill={colors.textOnPrimary} />
                            </Pressable>
                        )}
                    </View>

                    {/* Exercise Preview */}
                    {todayTemplate && (
                        <View style={styles.exercisePreview}>
                            {todayTemplate.exercises.slice(0, 3).map((exercise) => (
                                <View key={exercise.id} style={styles.previewItem}>
                                    <View style={styles.previewDot} />
                                    <Typography variant="caption" numberOfLines={1}>
                                        {exercise.name} ({exercise.defaultSets}x)
                                    </Typography>
                                </View>
                            ))}
                            {todayTemplate.exercises.length > 3 && (
                                <Typography variant="caption" color={colors.textMuted}>
                                    +{todayTemplate.exercises.length - 3} hareket daha
                                </Typography>
                            )}
                        </View>
                    )}
                </View>

                {/* Quick Stats Row */}
                <View style={styles.statsRow}>
                    <Pressable
                        style={styles.statCard}
                        onPress={() => navigation.navigate('Nutrition')}
                    >
                        <View style={[styles.statIcon, { backgroundColor: colors.warning + '20' }]}>
                            <Flame size={20} color={colors.warning} />
                        </View>
                        <View style={styles.statInfo}>
                            <Typography variant="h3">{todaysNutrition.totalCalories}</Typography>
                            <Typography variant="caption" color={colors.textMuted}>
                                / {goals.dailyCalories} kcal
                            </Typography>
                        </View>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${calorieProgress}%`, backgroundColor: colors.warning }]} />
                        </View>
                    </Pressable>

                    <Pressable
                        style={styles.statCard}
                        onPress={() => navigation.navigate('History')}
                    >
                        <View style={[styles.statIcon, { backgroundColor: colors.success + '20' }]}>
                            <Trophy size={20} color={colors.success} />
                        </View>
                        <View style={styles.statInfo}>
                            <Typography variant="h3">{thisWeekWorkouts}/{profile.weeklyGoal}</Typography>
                            <Typography variant="caption" color={colors.textMuted}>
                                bu hafta
                            </Typography>
                        </View>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${weeklyGoalProgress}%`, backgroundColor: colors.success }]} />
                        </View>
                    </Pressable>
                </View>

                {/* Water & Achievements Row */}
                <View style={styles.statsRow}>
                    {/* Water Card */}
                    <Pressable
                        style={styles.statCard}
                        onPress={() => addWater()}
                    >
                        <View style={[styles.statIcon, { backgroundColor: colors.info + '20' }]}>
                            <Droplets size={20} color={colors.info} />
                        </View>
                        <View style={styles.statInfo}>
                            <Typography variant="h3">{(waterRecord.totalAmount / 1000).toFixed(1)}L</Typography>
                            <Typography variant="caption" color={colors.textMuted}>
                                / {(dailyGoal / 1000).toFixed(1)}L su
                            </Typography>
                        </View>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${waterProgress}%`, backgroundColor: colors.info }]} />
                        </View>
                    </Pressable>

                    {/* Achievements Card */}
                    <Pressable
                        style={styles.statCard}
                        onPress={() => navigation.navigate('Achievements')}
                    >
                        <View style={[styles.statIcon, { backgroundColor: '#9B59B6' + '20' }]}>
                            <Award size={20} color="#9B59B6" />
                        </View>
                        <View style={styles.statInfo}>
                            <Typography variant="h3">{unlockedBadges.length}</Typography>
                            <Typography variant="caption" color={colors.textMuted}>
                                rozet • {totalPoints}p
                            </Typography>
                        </View>
                        <View style={styles.badgeRow}>
                            {unlockedBadges.slice(0, 3).map((badge) => (
                                <Typography key={badge.id} variant="caption">{badge.emoji}</Typography>
                            ))}
                        </View>
                    </Pressable>
                </View>
                {/* Quick Start Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Typography variant="h3">Hızlı Başlat</Typography>
                        <Pressable onPress={() => navigation.navigate('Templates')}>
                            <Typography variant="buttonSmall" color={colors.primary}>
                                Tümünü Gör
                            </Typography>
                        </Pressable>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.templatesScroll}
                    >
                        <Pressable
                            style={styles.templateCard}
                            onPress={() => handleStartWorkout()}
                        >
                            <View style={[styles.templateIcon, { backgroundColor: colors.info + '20' }]}>
                                <Zap size={24} color={colors.info} />
                            </View>
                            <Typography variant="body">Boş Antrenman</Typography>
                            <Typography variant="caption" color={colors.textMuted}>
                                Serbest çalışma
                            </Typography>
                        </Pressable>

                        {templates.slice(0, 4).map((template) => (
                            <Pressable
                                key={template.id}
                                style={styles.templateCard}
                                onPress={() => handleStartWorkout(template.id)}
                            >
                                <View style={[styles.templateIcon, { backgroundColor: (template.color || colors.primary) + '20' }]}>
                                    <Dumbbell size={24} color={template.color || colors.primary} />
                                </View>
                                <Typography variant="body" numberOfLines={1}>{template.name}</Typography>
                                <Typography variant="caption" color={colors.textMuted}>
                                    {template.exercises.length} hareket
                                </Typography>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>

                {/* Weekly Overview - Clickable Header to Edit Program */}
                <View style={styles.section}>
                    <Pressable style={styles.sectionHeaderClickable} onPress={handleWeekHeaderPress}>
                        <View style={styles.sectionHeaderLeft}>
                            <Typography variant="h3">Bu Hafta</Typography>
                            <View style={styles.editBadge}>
                                <Edit3 size={12} color={colors.primary} />
                                <Typography variant="caption" color={colors.primary}>Düzenle</Typography>
                            </View>
                        </View>
                        <ChevronRight size={20} color={colors.textMuted} />
                    </Pressable>

                    <View style={styles.weekGrid}>
                        {activeProgram?.days.map((day) => {
                            const isToday = day.dayIndex === new Date().getDay();
                            const now = new Date();
                            const currentDay = now.getDay();
                            const diff = day.dayIndex - currentDay;
                            const dayDate = new Date(now);
                            dayDate.setDate(now.getDate() + diff);
                            dayDate.setHours(0, 0, 0, 0);
                            const endDate = new Date(dayDate);
                            endDate.setHours(23, 59, 59, 999);
                            const dayWorkouts = getWorkoutsForDateRange(dayDate, endDate);
                            const hasWorkout = dayWorkouts.length > 0;

                            return (
                                <Pressable
                                    key={day.dayIndex}
                                    style={[
                                        styles.dayCell,
                                        isToday && styles.dayCellToday,
                                        day.isRestDay && styles.dayCellRest,
                                    ]}
                                    onPress={() => handleDayPress(day.dayIndex)}
                                >
                                    <Typography
                                        variant="caption"
                                        color={isToday ? colors.textOnPrimary : colors.textSecondary}
                                    >
                                        {day.dayName.slice(0, 3)}
                                    </Typography>
                                    {hasWorkout ? (
                                        <View style={[styles.dayDotCompleted, isToday && styles.dayDotToday]} />
                                    ) : !day.isRestDay && day.templateName ? (
                                        <View style={[styles.dayDot, isToday && styles.dayDotToday]} />
                                    ) : null}
                                </Pressable>
                            );
                        })}
                    </View>
                    <Typography variant="caption" color={colors.textMuted} style={{ textAlign: 'center', marginTop: spacing[2] }}>
                        💡 Günlere tıklayarak geçmişi, başlığa tıklayarak programı düzenleyin
                    </Typography>
                </View>

            </ScrollView>

            {/* Day History Modal */}
            <Modal visible={showDayHistoryModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <H2>{selectedDayIndex !== null ? getDayName(selectedDayIndex) : ''} Antrenmanları</H2>
                            <Pressable onPress={() => setShowDayHistoryModal(false)}>
                                <X size={24} color={colors.textSecondary} />
                            </Pressable>
                        </View>

                        <ScrollView style={styles.modalScroll}>
                            {selectedDayWorkouts.length > 0 ? (
                                selectedDayWorkouts.map((workout, index) => {
                                    const workoutDate = workout.createdAt instanceof Date
                                        ? workout.createdAt
                                        : new Date(workout.createdAt || Date.now());
                                    return (
                                        <View key={workout.id || index} style={styles.historyItem}>
                                            <View style={styles.historyIcon}>
                                                <Dumbbell size={20} color={colors.primary} />
                                            </View>
                                            <View style={styles.historyInfo}>
                                                <Typography variant="body">
                                                    {workout.templateName || 'Antrenman'}
                                                </Typography>
                                                <Typography variant="caption" color={colors.textMuted}>
                                                    {workoutDate.toLocaleDateString('tr-TR', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </Typography>
                                            </View>
                                            <View style={styles.historyStats}>
                                                <View style={styles.historyStat}>
                                                    <Clock size={12} color={colors.textMuted} />
                                                    <Typography variant="caption" color={colors.textMuted}>
                                                        {formatDuration(workout.duration || 0)}
                                                    </Typography>
                                                </View>
                                                <Typography variant="caption" color={colors.textSecondary}>
                                                    {workout.totalSets || 0} set
                                                </Typography>
                                            </View>
                                        </View>
                                    );
                                })
                            ) : (
                                <View style={styles.emptyHistory}>
                                    <Calendar size={48} color={colors.textMuted} />
                                    <Typography variant="body" color={colors.textMuted}>
                                        Bu gün antrenman yapılmamış
                                    </Typography>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Program Editor Modal - with Drag & Drop */}
            <Modal visible={showProgramEditorModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { maxHeight: '90%' }]}>
                        <View style={styles.modalHeader}>
                            <View>
                                <H2>Haftalık Program</H2>
                                <Typography variant="caption" color={colors.textSecondary}>
                                    {activeProgram?.name || 'Program'}
                                </Typography>
                            </View>
                            <Pressable onPress={() => setShowProgramEditorModal(false)}>
                                <X size={24} color={colors.textSecondary} />
                            </Pressable>
                        </View>

                        {/* Drag & Drop Hint */}
                        <View style={styles.dragHint}>
                            <ArrowLeftRight size={16} color={colors.info} />
                            <Typography variant="caption" color={colors.textSecondary}>
                                Sürükleyerek günleri değiştirin, tıklayarak program atayın
                            </Typography>
                        </View>

                        <ScrollView style={styles.modalScroll}>
                            {activeProgram?.days.map((day) => {
                                const isToday = day.dayIndex === new Date().getDay();
                                const template = day.templateId
                                    ? templates.find(t => t.id === day.templateId)
                                    : null;
                                const isDragging = draggingDay === day.dayIndex;
                                const isDragOver = dragOverDay === day.dayIndex;

                                const dayCard = (
                                    <View
                                        style={[
                                            styles.programDayCard,
                                            isToday && styles.programDayCardToday,
                                            isDragOver && styles.programDayCardDragOver,
                                        ]}
                                    >
                                        {/* Drag Handle */}
                                        <View style={styles.dragHandle}>
                                            <GripVertical size={18} color={colors.textMuted} />
                                        </View>

                                        {/* Day Info */}
                                        <Pressable
                                            style={styles.programDayContent}
                                            onPress={() => handleEditDayPress(day.dayIndex)}
                                        >
                                            <View style={styles.programDayHeader}>
                                                <Typography
                                                    variant="body"
                                                    color={isToday ? colors.primary : colors.textPrimary}
                                                    style={{ fontWeight: '600' }}
                                                >
                                                    {day.dayName}
                                                </Typography>
                                                {isToday && (
                                                    <View style={styles.todayBadgeSmall}>
                                                        <Typography variant="caption" color={colors.textOnPrimary}>
                                                            BUGÜN
                                                        </Typography>
                                                    </View>
                                                )}
                                            </View>

                                            <View style={styles.programDayWorkout}>
                                                {day.isRestDay ? (
                                                    <View style={styles.restDayContent}>
                                                        <Moon size={16} color={colors.textMuted} />
                                                        <Typography variant="bodySmall" color={colors.textMuted}>
                                                            Dinlenme Günü
                                                        </Typography>
                                                    </View>
                                                ) : template ? (
                                                    <View style={styles.workoutDayContent}>
                                                        <View style={[styles.workoutIconSmall, { backgroundColor: (template.color || colors.primary) + '20' }]}>
                                                            <Dumbbell size={14} color={template.color || colors.primary} />
                                                        </View>
                                                        <View style={{ flex: 1 }}>
                                                            <Typography variant="body" numberOfLines={1}>{template.name}</Typography>
                                                            <Typography variant="caption" color={colors.textMuted}>
                                                                {template.exercises.length} hareket
                                                            </Typography>
                                                        </View>
                                                    </View>
                                                ) : (
                                                    <View style={styles.emptyDayContent}>
                                                        <Typography variant="bodySmall" color={colors.textMuted}>
                                                            Program atanmadı - tıkla ekle
                                                        </Typography>
                                                    </View>
                                                )}
                                            </View>
                                        </Pressable>

                                        {/* Edit Icon */}
                                        <Pressable
                                            style={styles.editButton}
                                            onPress={() => handleEditDayPress(day.dayIndex)}
                                        >
                                            <Edit3 size={16} color={colors.textSecondary} />
                                        </Pressable>
                                    </View>
                                );

                                // Wrap with draggable for web
                                if (Platform.OS === 'web') {
                                    return (
                                        <WebDraggableDay
                                            key={day.dayIndex}
                                            dayIndex={day.dayIndex}
                                            onDragStart={handleDragStart}
                                            onDragEnd={handleDragEnd}
                                            onDragOver={handleDragOver}
                                            onDrop={handleDrop}
                                            style={{ marginBottom: spacing[2] }}
                                        >
                                            {dayCard}
                                        </WebDraggableDay>
                                    );
                                }

                                return (
                                    <View key={day.dayIndex} style={{ marginBottom: spacing[2] }}>
                                        {dayCard}
                                    </View>
                                );
                            })}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <Button
                                title="Tamam"
                                variant="primary"
                                fullWidth
                                onPress={() => setShowProgramEditorModal(false)}
                            />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Template Picker Modal */}
            <Modal visible={showTemplatePickerModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.templatePickerContent}>
                        <View style={styles.modalHeader}>
                            <H2>{selectedDayIndex !== null ? getDayName(selectedDayIndex) : ''} için Program</H2>
                            <Pressable onPress={() => setShowTemplatePickerModal(false)}>
                                <X size={24} color={colors.textSecondary} />
                            </Pressable>
                        </View>

                        <ScrollView style={styles.modalScroll}>
                            {/* Rest Day Option */}
                            <Pressable
                                style={styles.templateOption}
                                onPress={() => handleTemplateSelect(null, null)}
                            >
                                <View style={[styles.templateOptionIcon, { backgroundColor: colors.surfaceLight }]}>
                                    <Moon size={20} color={colors.textMuted} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Typography variant="body">Dinlenme Günü</Typography>
                                    <Typography variant="caption" color={colors.textMuted}>
                                        Bu gün antrenman yok
                                    </Typography>
                                </View>
                            </Pressable>

                            {/* Templates */}
                            {templates.map((template) => (
                                <Pressable
                                    key={template.id}
                                    style={styles.templateOption}
                                    onPress={() => handleTemplateSelect(template.id, template.name)}
                                >
                                    <View style={[styles.templateOptionIcon, { backgroundColor: (template.color || colors.primary) + '20' }]}>
                                        <Dumbbell size={20} color={template.color || colors.primary} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Typography variant="body">{template.name}</Typography>
                                        <Typography variant="caption" color={colors.textMuted}>
                                            {template.exercises.length} hareket • ~{template.estimatedDuration || 60} dk
                                        </Typography>
                                    </View>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
        paddingBottom: 100,
        gap: spacing[5],
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerText: {
        gap: spacing[1],
    },
    profileAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            web: { cursor: 'pointer' },
        }),
    },
    heroCard: {
        backgroundColor: colors.surface,
        borderRadius: layout.radiusLarge,
        borderWidth: 1,
        borderColor: colors.primary + '40',
        overflow: 'hidden',
    },
    heroGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: colors.primary,
    },
    heroContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: layout.cardPadding,
    },
    heroInfo: {
        flex: 1,
        gap: spacing[1],
    },
    todayBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: spacing[2],
        paddingVertical: spacing[1],
        borderRadius: layout.radiusSmall,
        alignSelf: 'flex-start',
        gap: spacing[1],
    },
    startButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            web: { cursor: 'pointer' },
        }),
    },
    exercisePreview: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
        padding: layout.cardPadding,
        paddingTop: spacing[3],
        gap: spacing[2],
    },
    previewItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
    },
    previewDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.primary,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing[3],
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: layout.radiusMedium,
        padding: spacing[4],
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing[2],
        ...Platform.select({
            web: { cursor: 'pointer' },
        }),
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: layout.radiusMedium,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statInfo: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: spacing[1],
    },
    progressBar: {
        height: 4,
        backgroundColor: colors.surfaceLight,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    section: {
        gap: spacing[3],
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionHeaderClickable: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: layout.radiusMedium,
        padding: spacing[3],
        borderWidth: 1,
        borderColor: colors.border,
        ...Platform.select({
            web: { cursor: 'pointer' },
        }),
    },
    sectionHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
    },
    editBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primaryMuted,
        paddingHorizontal: spacing[2],
        paddingVertical: spacing[1],
        borderRadius: layout.radiusSmall,
        gap: spacing[1],
    },
    templatesScroll: {
        gap: spacing[3],
        paddingRight: spacing[4],
    },
    templateCard: {
        width: 140,
        backgroundColor: colors.surface,
        borderRadius: layout.radiusMedium,
        padding: spacing[4],
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing[2],
        ...Platform.select({
            web: { cursor: 'pointer' },
        }),
    },
    templateIcon: {
        width: 48,
        height: 48,
        borderRadius: layout.radiusMedium,
        alignItems: 'center',
        justifyContent: 'center',
    },
    weekGrid: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: layout.radiusMedium,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    dayCell: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: spacing[3],
        gap: spacing[2],
        ...Platform.select({
            web: { cursor: 'pointer' },
        }),
    },
    dayCellToday: {
        backgroundColor: colors.primary,
    },
    dayCellRest: {
        opacity: 0.5,
    },
    dayDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.primary,
    },
    dayDotCompleted: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.success,
    },
    dayDotToday: {
        backgroundColor: colors.textOnPrimary,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.background,
        borderTopLeftRadius: layout.radiusLarge,
        borderTopRightRadius: layout.radiusLarge,
        padding: layout.screenPaddingHorizontal,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: spacing[4],
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalScroll: {
        marginTop: spacing[4],
    },
    modalFooter: {
        paddingTop: spacing[4],
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: layout.radiusMedium,
        padding: spacing[4],
        marginBottom: spacing[2],
        gap: spacing[3],
    },
    historyIcon: {
        width: 44,
        height: 44,
        borderRadius: layout.radiusMedium,
        backgroundColor: colors.primaryMuted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    historyInfo: {
        flex: 1,
        gap: 2,
    },
    historyStats: {
        alignItems: 'flex-end',
        gap: spacing[1],
    },
    historyStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[1],
    },
    emptyHistory: {
        alignItems: 'center',
        padding: spacing[8],
        gap: spacing[3],
    },
    badgeRow: {
        flexDirection: 'row',
        gap: spacing[1],
    },
    // Program Editor Styles
    dragHint: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.info + '15',
        borderRadius: layout.radiusSmall,
        padding: spacing[3],
        marginTop: spacing[3],
        gap: spacing[2],
    },
    programDayCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: layout.radiusMedium,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    programDayCardToday: {
        borderColor: colors.primary,
        borderWidth: 2,
    },
    programDayCardDragOver: {
        borderColor: colors.info,
        backgroundColor: colors.info + '10',
        borderWidth: 2,
        borderStyle: 'dashed',
    },
    dragHandle: {
        padding: spacing[3],
        borderRightWidth: 1,
        borderRightColor: colors.border,
        ...Platform.select({
            web: { cursor: 'grab' } as any,
        }),
    },
    programDayContent: {
        flex: 1,
        padding: spacing[3],
        ...Platform.select({
            web: { cursor: 'pointer' },
        }),
    },
    programDayHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
        marginBottom: spacing[2],
    },
    todayBadgeSmall: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing[2],
        paddingVertical: 2,
        borderRadius: layout.radiusSmall,
    },
    programDayWorkout: {},
    restDayContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
    },
    workoutDayContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
    },
    workoutIconSmall: {
        width: 32,
        height: 32,
        borderRadius: layout.radiusSmall,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyDayContent: {
        paddingVertical: spacing[1],
    },
    editButton: {
        padding: spacing[3],
        ...Platform.select({
            web: { cursor: 'pointer' },
        }),
    },
    // Template Picker Styles
    templatePickerContent: {
        backgroundColor: colors.background,
        borderTopLeftRadius: layout.radiusLarge,
        borderTopRightRadius: layout.radiusLarge,
        padding: layout.screenPaddingHorizontal,
        maxHeight: '80%',
        marginTop: 'auto',
    },
    templateOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: layout.radiusMedium,
        padding: spacing[4],
        marginBottom: spacing[2],
        gap: spacing[3],
        borderWidth: 1,
        borderColor: colors.border,
        ...Platform.select({
            web: { cursor: 'pointer' },
        }),
    },
    templateOptionIcon: {
        width: 44,
        height: 44,
        borderRadius: layout.radiusMedium,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
