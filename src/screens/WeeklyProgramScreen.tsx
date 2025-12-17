// FitLog - Weekly Program Screen with Web Drag & Drop
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Pressable,
    Modal,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, X, Dumbbell, Moon, ChevronRight, Play, GripVertical, ArrowLeftRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { layout, spacing } from '../theme/spacing';
import { Typography, H1, H2 } from '../components/atoms';
import { useWeeklyProgramStore, useUserStore, useThemeStore } from '../store';

// Web-specific draggable wrapper
const WebDraggable: React.FC<{
    children: React.ReactNode;
    dayIndex: number;
    onDragStart: (dayIndex: number) => void;
    onDragEnd: () => void;
    onDragOver: (dayIndex: number) => void;
    onDragLeave: () => void;
    onDrop: (dayIndex: number) => void;
    style?: any;
}> = ({ children, dayIndex, onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop, style }) => {
    const ref = useRef<any>(null);

    useEffect(() => {
        if (Platform.OS !== 'web' || !ref.current) return;

        const element = ref.current;

        const handleDragStart = (e: DragEvent) => {
            e.dataTransfer!.effectAllowed = 'move';
            e.dataTransfer!.setData('text/plain', dayIndex.toString());
            onDragStart(dayIndex);

            // Add dragging style
            setTimeout(() => {
                if (element) element.style.opacity = '0.5';
            }, 0);
        };

        const handleDragEnd = (e: DragEvent) => {
            if (element) element.style.opacity = '1';
            onDragEnd();
        };

        const handleDragOver = (e: DragEvent) => {
            e.preventDefault();
            e.dataTransfer!.dropEffect = 'move';
            onDragOver(dayIndex);
        };

        const handleDragEnter = (e: DragEvent) => {
            e.preventDefault();
        };

        const handleDragLeaveEvent = (e: DragEvent) => {
            onDragLeave();
        };

        const handleDrop = (e: DragEvent) => {
            e.preventDefault();
            onDrop(dayIndex);
        };

        element.setAttribute('draggable', 'true');
        element.addEventListener('dragstart', handleDragStart);
        element.addEventListener('dragend', handleDragEnd);
        element.addEventListener('dragover', handleDragOver);
        element.addEventListener('dragenter', handleDragEnter);
        element.addEventListener('dragleave', handleDragLeaveEvent);
        element.addEventListener('drop', handleDrop);

        return () => {
            element.removeEventListener('dragstart', handleDragStart);
            element.removeEventListener('dragend', handleDragEnd);
            element.removeEventListener('dragover', handleDragOver);
            element.removeEventListener('dragenter', handleDragEnter);
            element.removeEventListener('dragleave', handleDragLeaveEvent);
            element.removeEventListener('drop', handleDrop);
        };
    }, [dayIndex, onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop]);

    return (
        <View ref={ref} style={style}>
            {children}
        </View>
    );
};

export const WeeklyProgramScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const colors = useThemeStore((state) => state.colors);
    const { activeProgram, assignTemplateToDay, swapDays } = useWeeklyProgramStore();
    const { templates } = useUserStore();

    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [draggingDay, setDraggingDay] = useState<number | null>(null);
    const [dragOverDay, setDragOverDay] = useState<number | null>(null);

    const handleDayPress = (dayIndex: number) => {
        setSelectedDay(dayIndex);
        setShowTemplateModal(true);
    };

    const handleTemplateSelect = (templateId: string | null, templateName: string | null) => {
        if (selectedDay !== null && activeProgram) {
            assignTemplateToDay(activeProgram.id, selectedDay, templateId, templateName);
        }
        setShowTemplateModal(false);
        setSelectedDay(null);
    };

    const handleStartWorkout = (templateId: string) => {
        navigation.navigate('ActiveWorkout', { templateId });
    };

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

    const handleDragLeave = () => {
        // Small delay to prevent flickering
        setTimeout(() => setDragOverDay(null), 50);
    };

    const handleDrop = (targetDayIndex: number) => {
        if (draggingDay !== null && activeProgram && draggingDay !== targetDayIndex) {
            swapDays(activeProgram.id, draggingDay, targetDayIndex);
        }
        setDraggingDay(null);
        setDragOverDay(null);
    };

    const today = new Date().getDay();
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
                    <View>
                        <H1>Haftalık Program</H1>
                        <Typography variant="caption" color={colors.textSecondary}>
                            {activeProgram?.name || 'Program seçilmedi'}
                        </Typography>
                    </View>
                    <View style={styles.headerIcon}>
                        <Calendar size={24} color={colors.primary} />
                    </View>
                </View>

                {/* Drag & Drop Hint */}
                <View style={styles.hintCard}>
                    <ArrowLeftRight size={16} color={colors.info} />
                    <Typography variant="caption" color={colors.textSecondary}>
                        Günleri sürükleyerek yerlerini değiştirebilirsiniz
                    </Typography>
                </View>

                {/* Week Days */}
                <View style={styles.weekContainer}>
                    {activeProgram?.days.map((day) => {
                        const isToday = day.dayIndex === today;
                        const template = day.templateId
                            ? templates.find(t => t.id === day.templateId)
                            : null;
                        const isDragging = draggingDay === day.dayIndex;
                        const isDragOver = dragOverDay === day.dayIndex;

                        const dayCardStyle = [
                            styles.dayCard,
                            isToday && styles.dayCardToday,
                            isDragOver && styles.dayCardDragOver,
                        ];

                        const cardContent = (
                            <>
                                {/* Drag Handle */}
                                <View style={styles.dragHandle}>
                                    <GripVertical size={18} color={colors.textMuted} />
                                </View>

                                {/* Main Content */}
                                <Pressable
                                    style={styles.dayContent}
                                    onPress={() => handleDayPress(day.dayIndex)}
                                >
                                    <View style={styles.dayHeader}>
                                        <View style={styles.dayInfo}>
                                            <Typography
                                                variant="body"
                                                color={isToday ? colors.primary : colors.textPrimary}
                                                style={{ fontWeight: '600' }}
                                            >
                                                {day.dayName}
                                            </Typography>
                                            {isToday && (
                                                <View style={styles.todayBadge}>
                                                    <Typography variant="caption" color={colors.textOnPrimary}>
                                                        BUGÜN
                                                    </Typography>
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    <View style={styles.workoutContent}>
                                        {day.isRestDay ? (
                                            <View style={styles.restDayContent}>
                                                <View style={styles.restIcon}>
                                                    <Moon size={18} color={colors.textMuted} />
                                                </View>
                                                <Typography variant="bodySmall" color={colors.textMuted}>
                                                    Dinlenme
                                                </Typography>
                                            </View>
                                        ) : template ? (
                                            <View style={styles.workoutDayContent}>
                                                <View style={[styles.workoutIcon, { backgroundColor: (template.color || colors.primary) + '20' }]}>
                                                    <Dumbbell size={16} color={template.color || colors.primary} />
                                                </View>
                                                <View style={styles.workoutInfo}>
                                                    <Typography variant="body">{template.name}</Typography>
                                                    <Typography variant="caption" color={colors.textMuted}>
                                                        {template.exercises.length} hareket
                                                    </Typography>
                                                </View>
                                                {isToday && (
                                                    <Pressable
                                                        style={styles.playButton}
                                                        onPress={(e) => {
                                                            e.stopPropagation();
                                                            handleStartWorkout(template.id);
                                                        }}
                                                    >
                                                        <Play size={14} color={colors.textOnPrimary} fill={colors.textOnPrimary} />
                                                    </Pressable>
                                                )}
                                            </View>
                                        ) : (
                                            <View style={styles.emptyDayContent}>
                                                <Typography variant="bodySmall" color={colors.textMuted}>
                                                    Program atanmadı
                                                </Typography>
                                            </View>
                                        )}
                                    </View>
                                </Pressable>

                                {/* Arrow indicator */}
                                <ChevronRight size={16} color={colors.textMuted} />
                            </>
                        );

                        if (Platform.OS === 'web') {
                            return (
                                <WebDraggable
                                    key={day.dayIndex}
                                    dayIndex={day.dayIndex}
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    style={dayCardStyle}
                                >
                                    {cardContent}
                                </WebDraggable>
                            );
                        }

                        return (
                            <View key={day.dayIndex} style={dayCardStyle}>
                                {cardContent}
                            </View>
                        );
                    })}
                </View>

                {/* Legend */}
                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                        <Typography variant="caption" color={colors.textMuted}>Bugün</Typography>
                    </View>
                    <View style={styles.legendItem}>
                        <GripVertical size={12} color={colors.textMuted} />
                        <Typography variant="caption" color={colors.textMuted}>Sürükle</Typography>
                    </View>
                </View>
            </ScrollView>

            {/* Template Selection Modal */}
            <Modal visible={showTemplateModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <H2>Antrenman Seç</H2>
                            <Pressable onPress={() => setShowTemplateModal(false)}>
                                <X size={24} color={colors.textSecondary} />
                            </Pressable>
                        </View>

                        <ScrollView style={styles.templateList}>
                            {/* Rest Day Option */}
                            <Pressable style={styles.templateItem} onPress={() => handleTemplateSelect(null, null)}>
                                <View style={[styles.templateIcon, { backgroundColor: colors.surfaceLight }]}>
                                    <Moon size={20} color={colors.textMuted} />
                                </View>
                                <View style={styles.templateInfo}>
                                    <Typography variant="body">Dinlenme Günü</Typography>
                                    <Typography variant="caption" color={colors.textMuted}>
                                        Kaslarını dinlendir
                                    </Typography>
                                </View>
                            </Pressable>

                            {/* Templates */}
                            {templates.map((template) => (
                                <Pressable
                                    key={template.id}
                                    style={styles.templateItem}
                                    onPress={() => handleTemplateSelect(template.id, template.name)}
                                >
                                    <View style={[styles.templateIcon, { backgroundColor: (template.color || colors.primary) + '20' }]}>
                                        <Dumbbell size={20} color={template.color || colors.primary} />
                                    </View>
                                    <View style={styles.templateInfo}>
                                        <Typography variant="body">{template.name}</Typography>
                                        <Typography variant="caption" color={colors.textMuted}>
                                            {template.exercises.length} hareket • ~{template.estimatedDuration || 60} dk
                                        </Typography>
                                    </View>
                                    <ChevronRight size={18} color={colors.textMuted} />
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
    container: { flex: 1, backgroundColor: colors.background },
    scrollView: { flex: 1 },
    content: { padding: layout.screenPaddingHorizontal, paddingBottom: 100, gap: spacing[4] },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    headerIcon: { width: 48, height: 48, borderRadius: layout.radiusMedium, backgroundColor: colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
    hintCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
        backgroundColor: colors.info + '15',
        padding: spacing[3],
        borderRadius: layout.radiusMedium,
        borderWidth: 1,
        borderColor: colors.info + '30',
    },
    weekContainer: { gap: spacing[2] },
    dayCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: layout.radiusMedium,
        padding: spacing[3],
        paddingLeft: spacing[2],
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing[2],
        ...Platform.select({
            web: {
                cursor: 'grab',
                transition: 'all 0.15s ease',
            } as any,
        }),
    },
    dayCardToday: {
        borderWidth: 2,
        borderColor: colors.primary,
    },
    dayCardDragOver: {
        backgroundColor: colors.primaryMuted,
        borderColor: colors.primary,
        transform: [{ scale: 1.02 }],
    },
    dragHandle: {
        padding: spacing[1],
        opacity: 0.6,
    },
    dayContent: {
        flex: 1,
        gap: spacing[2],
    },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dayInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
    },
    todayBadge: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing[2],
        paddingVertical: 2,
        borderRadius: layout.radiusSmall,
    },
    workoutContent: {
        minHeight: 36,
        justifyContent: 'center',
    },
    restDayContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
    },
    restIcon: {
        width: 32,
        height: 32,
        borderRadius: layout.radiusMedium,
        backgroundColor: colors.surfaceLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    workoutDayContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
    },
    workoutIcon: {
        width: 32,
        height: 32,
        borderRadius: layout.radiusMedium,
        alignItems: 'center',
        justifyContent: 'center',
    },
    workoutInfo: {
        flex: 1,
        gap: 2,
    },
    playButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyDayContent: {
        gap: spacing[1],
    },
    legend: { flexDirection: 'row', justifyContent: 'center', gap: spacing[6], paddingTop: spacing[2] },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
    modalContent: { backgroundColor: colors.background, borderTopLeftRadius: layout.radiusLarge, borderTopRightRadius: layout.radiusLarge, padding: layout.screenPaddingHorizontal, maxHeight: '70%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: spacing[4], borderBottomWidth: 1, borderBottomColor: colors.border },
    templateList: { paddingTop: spacing[3] },
    templateItem: { flexDirection: 'row', alignItems: 'center', padding: spacing[3], gap: spacing[3], borderRadius: layout.radiusMedium, marginBottom: spacing[2], backgroundColor: colors.surface },
    templateIcon: { width: 44, height: 44, borderRadius: layout.radiusMedium, alignItems: 'center', justifyContent: 'center' },
    templateInfo: { flex: 1, gap: 2 },
});
