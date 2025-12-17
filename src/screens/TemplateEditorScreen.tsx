// FitLog - Template Editor Screen with Dynamic Theme
import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Pressable,
    Modal,
    TextInput,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Trash2, X, Check, Dumbbell } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { layout, spacing } from '../theme/spacing';
import { Typography, H2, Button } from '../components/atoms';
import { useUserStore, useExerciseLibraryStore, useThemeStore } from '../store';

const showAlert = (title: string, message: string, buttons?: any[]) => {
    if (Platform.OS === 'web') {
        if (buttons && buttons.length > 1) {
            const result = window.confirm(`${title}\n\n${message}`);
            if (result) buttons.find(b => b.style !== 'cancel')?.onPress?.();
        } else window.alert(`${title}\n\n${message}`);
    } else Alert.alert(title, message, buttons);
};

export const TemplateEditorScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const colors = useThemeStore((state) => state.colors);
    const templateId = route.params?.templateId;
    const isNew = route.params?.isNew ?? false;

    const { getTemplateById, addTemplate, updateTemplate, deleteTemplate } = useUserStore();
    const { getFilteredExercises, getMuscleGroups } = useExerciseLibraryStore();

    const existingTemplate = templateId ? getTemplateById(templateId) : null;

    const [name, setName] = useState(existingTemplate?.name || '');
    const [description, setDescription] = useState(existingTemplate?.description || '');
    const [exercises, setExercises] = useState(existingTemplate?.exercises || []);
    const [showExerciseModal, setShowExerciseModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);

    const allExercises = getFilteredExercises();
    const muscleGroups = getMuscleGroups();

    const filteredExercises = allExercises.filter((e) => {
        const matchesSearch = !searchQuery || e.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMuscle = !selectedMuscleGroup || e.muscleGroup === selectedMuscleGroup;
        return matchesSearch && matchesMuscle;
    });

    const handleSave = () => {
        if (!name.trim()) return showAlert('Hata', 'Program adı boş olamaz');
        if (exercises.length === 0) return showAlert('Hata', 'En az bir hareket eklemelisiniz');

        if (isNew) addTemplate({ name: name.trim(), description: description.trim(), exercises });
        else if (templateId) updateTemplate(templateId, { name: name.trim(), description: description.trim(), exercises });
        navigation.goBack();
    };

    const handleDelete = () => {
        showAlert('Programı Sil', 'Bu programı silmek istediğinize emin misiniz?', [
            { text: 'İptal', style: 'cancel' },
            { text: 'Sil', style: 'destructive', onPress: () => { if (templateId) deleteTemplate(templateId); navigation.goBack(); } },
        ]);
    };

    const handleAddExercise = (exercise: any) => {
        setExercises([...exercises, {
            id: Math.random().toString(36).substr(2, 9),
            name: exercise.name,
            muscleGroup: exercise.muscleGroup,
            defaultSets: 3,
        }]);
        setShowExerciseModal(false);
    };

    const handleRemoveExercise = (exerciseId: string) => setExercises(exercises.filter((e) => e.id !== exerciseId));

    const handleSetChange = (exerciseId: string, sets: number) => {
        setExercises(exercises.map((e) => e.id === exerciseId ? { ...e, defaultSets: Math.max(1, Math.min(10, sets)) } : e));
    };

    const styles = createStyles(colors);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft size={24} color={colors.textPrimary} />
                </Pressable>
                <View style={styles.headerTitle}>
                    <Typography variant="h2">{isNew ? 'Yeni Program' : 'Programı Düzenle'}</Typography>
                </View>
                {!isNew && (
                    <Pressable style={styles.deleteButton} onPress={handleDelete}>
                        <Trash2 size={20} color={colors.error} />
                    </Pressable>
                )}
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Name Input */}
                <View style={styles.inputGroup}>
                    <Typography variant="label" color={colors.textSecondary}>PROGRAM ADI</Typography>
                    <TextInput
                        style={styles.textInput}
                        value={name}
                        onChangeText={setName}
                        placeholder="Örn: Push Day, Upper Body..."
                        placeholderTextColor={colors.textMuted}
                    />
                </View>

                {/* Description Input */}
                <View style={styles.inputGroup}>
                    <Typography variant="label" color={colors.textSecondary}>AÇIKLAMA (Opsiyonel)</Typography>
                    <TextInput
                        style={[styles.textInput, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Programın hedefi..."
                        placeholderTextColor={colors.textMuted}
                        multiline
                        numberOfLines={2}
                    />
                </View>

                {/* Exercises List */}
                <View style={styles.exercisesSection}>
                    <View style={styles.exercisesHeader}>
                        <Typography variant="label" color={colors.textSecondary}>HAREKETLER ({exercises.length})</Typography>
                    </View>

                    {exercises.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Dumbbell size={40} color={colors.textMuted} />
                            <Typography variant="body" color={colors.textMuted}>Henüz hareket eklenmedi</Typography>
                        </View>
                    ) : (
                        exercises.map((exercise, index) => (
                            <View key={exercise.id} style={styles.exerciseItem}>
                                <View style={styles.exerciseOrder}>
                                    <Typography variant="caption" color={colors.primary}>{index + 1}</Typography>
                                </View>
                                <View style={styles.exerciseInfo}>
                                    <Typography variant="body">{exercise.name}</Typography>
                                    <Typography variant="caption" color={colors.textMuted}>{exercise.muscleGroup}</Typography>
                                </View>
                                <View style={styles.setsControl}>
                                    <Pressable style={styles.setsButton} onPress={() => handleSetChange(exercise.id, exercise.defaultSets - 1)}>
                                        <Typography variant="body" color={colors.textSecondary}>-</Typography>
                                    </Pressable>
                                    <Typography variant="body" style={styles.setsText}>{exercise.defaultSets} set</Typography>
                                    <Pressable style={styles.setsButton} onPress={() => handleSetChange(exercise.id, exercise.defaultSets + 1)}>
                                        <Typography variant="body" color={colors.textSecondary}>+</Typography>
                                    </Pressable>
                                </View>
                                <Pressable style={styles.removeButton} onPress={() => handleRemoveExercise(exercise.id)}>
                                    <X size={18} color={colors.error} />
                                </Pressable>
                            </View>
                        ))
                    )}

                    <Pressable style={styles.addExerciseButton} onPress={() => setShowExerciseModal(true)}>
                        <Plus size={20} color={colors.primary} />
                        <Typography variant="body" color={colors.primary}>Hareket Ekle</Typography>
                    </Pressable>
                </View>
            </ScrollView>

            {/* Save Button */}
            <View style={styles.footer}>
                <Button title="Kaydet" variant="primary" fullWidth onPress={handleSave} icon={<Check size={18} color={colors.textOnPrimary} />} />
            </View>

            {/* Exercise Selection Modal */}
            <Modal visible={showExerciseModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <H2>Hareket Seç</H2>
                            <Pressable onPress={() => setShowExerciseModal(false)}>
                                <X size={24} color={colors.textSecondary} />
                            </Pressable>
                        </View>

                        <TextInput
                            style={styles.searchInput}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Hareket ara..."
                            placeholderTextColor={colors.textMuted}
                        />

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
                            <Pressable style={[styles.filterChip, !selectedMuscleGroup && styles.filterChipActive]} onPress={() => setSelectedMuscleGroup(null)}>
                                <Typography variant="caption" color={!selectedMuscleGroup ? colors.textOnPrimary : colors.textSecondary}>Tümü</Typography>
                            </Pressable>
                            {muscleGroups.map((group) => (
                                <Pressable key={group} style={[styles.filterChip, selectedMuscleGroup === group && styles.filterChipActive]} onPress={() => setSelectedMuscleGroup(group)}>
                                    <Typography variant="caption" color={selectedMuscleGroup === group ? colors.textOnPrimary : colors.textSecondary}>{group}</Typography>
                                </Pressable>
                            ))}
                        </ScrollView>

                        <ScrollView style={styles.exerciseList}>
                            {filteredExercises.map((exercise) => (
                                <Pressable key={exercise.id} style={styles.exerciseOption} onPress={() => handleAddExercise(exercise)}>
                                    <View style={styles.exerciseOptionIcon}>
                                        <Dumbbell size={18} color={colors.primary} />
                                    </View>
                                    <View style={styles.exerciseOptionInfo}>
                                        <Typography variant="body">{exercise.name}</Typography>
                                        <Typography variant="caption" color={colors.textMuted}>{exercise.muscleGroup} • {exercise.equipment}</Typography>
                                    </View>
                                    <Plus size={20} color={colors.primary} />
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
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: layout.screenPaddingHorizontal, paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing[3] },
    backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: layout.radiusMedium, backgroundColor: colors.surface },
    headerTitle: { flex: 1 },
    deleteButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: layout.radiusMedium, backgroundColor: colors.error + '15' },
    scrollView: { flex: 1 },
    content: { padding: layout.screenPaddingHorizontal, paddingBottom: 100, gap: spacing[4] },
    inputGroup: { gap: spacing[2] },
    textInput: { backgroundColor: colors.surface, borderRadius: layout.radiusMedium, padding: spacing[4], color: colors.textPrimary, fontSize: 16, borderWidth: 1, borderColor: colors.border },
    textArea: { minHeight: 80, textAlignVertical: 'top' },
    exercisesSection: { gap: spacing[3] },
    exercisesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    emptyState: { alignItems: 'center', padding: spacing[8], backgroundColor: colors.surface, borderRadius: layout.radiusMedium, gap: spacing[3] },
    exerciseItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: layout.radiusMedium, padding: spacing[3], gap: spacing[3], borderWidth: 1, borderColor: colors.border },
    exerciseOrder: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
    exerciseInfo: { flex: 1, gap: 2 },
    setsControl: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
    setsButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceLight, alignItems: 'center', justifyContent: 'center' },
    setsText: { minWidth: 50, textAlign: 'center' },
    removeButton: { padding: spacing[2] },
    addExerciseButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2], padding: spacing[4], borderWidth: 2, borderColor: colors.primary, borderRadius: layout.radiusMedium, borderStyle: 'dashed' },
    footer: { padding: layout.screenPaddingHorizontal, paddingBottom: spacing[6], borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background },
    modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
    modalContent: { backgroundColor: colors.background, borderTopLeftRadius: layout.radiusLarge, borderTopRightRadius: layout.radiusLarge, padding: layout.screenPaddingHorizontal, maxHeight: '85%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: spacing[3] },
    searchInput: { backgroundColor: colors.surface, borderRadius: layout.radiusMedium, padding: spacing[3], color: colors.textPrimary, fontSize: 16, borderWidth: 1, borderColor: colors.border, marginBottom: spacing[2] },
    filterScroll: { maxHeight: 44, marginBottom: spacing[2] },
    filterContent: { gap: spacing[2] },
    filterChip: { paddingHorizontal: spacing[3], paddingVertical: spacing[2], backgroundColor: colors.surface, borderRadius: layout.radiusFull, borderWidth: 1, borderColor: colors.border },
    filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    exerciseList: { maxHeight: 350 },
    exerciseOption: { flexDirection: 'row', alignItems: 'center', padding: spacing[3], backgroundColor: colors.surface, borderRadius: layout.radiusMedium, marginBottom: spacing[2], gap: spacing[3] },
    exerciseOptionIcon: { width: 40, height: 40, borderRadius: layout.radiusMedium, backgroundColor: colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
    exerciseOptionInfo: { flex: 1, gap: 2 },
});
