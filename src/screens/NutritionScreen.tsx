// FitLog - Nutrition Screen with Dynamic Theme
import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Pressable,
    Modal,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Flame,
    Droplets,
    Plus,
    Minus,
    X,
    Apple,
    Coffee,
    UtensilsCrossed,
    Cookie,
} from 'lucide-react-native';
import { layout, spacing } from '../theme/spacing';
import { Typography, H1, H2, Button } from '../components/atoms';
import { useNutritionStore, useThemeStore, FoodEntry } from '../store';

const mealTypeIcons = {
    breakfast: Coffee,
    lunch: UtensilsCrossed,
    dinner: UtensilsCrossed,
    snack: Cookie,
};

const mealTypeNames = {
    breakfast: 'Kahvaltı',
    lunch: 'Öğle',
    dinner: 'Akşam',
    snack: 'Atıştırmalık',
};

export const NutritionScreen: React.FC = () => {
    const colors = useThemeStore((state) => state.colors);
    const {
        goals,
        quickFoods,
        getTodayNutrition,
        addFoodEntry,
        removeFoodEntry,
        updateWaterIntake,
    } = useNutritionStore();

    const todayNutrition = getTodayNutrition();
    const today = new Date().toISOString().split('T')[0];

    const [showAddFoodModal, setShowAddFoodModal] = useState(false);
    const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');

    // Calculate percentages
    const caloriePercentage = Math.min(100, (todayNutrition.totalCalories / goals.dailyCalories) * 100);
    const proteinPercentage = Math.min(100, (todayNutrition.totalMacros.protein / goals.protein) * 100);
    const carbsPercentage = Math.min(100, (todayNutrition.totalMacros.carbs / goals.carbs) * 100);
    const fatPercentage = Math.min(100, (todayNutrition.totalMacros.fat / goals.fat) * 100);
    const waterPercentage = Math.min(100, (todayNutrition.waterIntake / goals.water) * 100);

    const handleAddWater = (amount: number) => updateWaterIntake(today, amount);

    const handleAddFood = (food: Omit<FoodEntry, 'id' | 'timestamp'>) => {
        addFoodEntry(today, { ...food, mealType: selectedMealType });
        setShowAddFoodModal(false);
    };

    const handleRemoveFood = (entryId: string) => removeFoodEntry(today, entryId);

    // Group entries by meal type
    const entriesByMeal = todayNutrition.entries.reduce((acc, entry) => {
        if (!acc[entry.mealType]) acc[entry.mealType] = [];
        acc[entry.mealType].push(entry);
        return acc;
    }, {} as Record<string, FoodEntry[]>);

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
                        <H1>Beslenme</H1>
                        <Typography variant="caption" color={colors.textSecondary}>
                            Bugünkü kalori takibin
                        </Typography>
                    </View>
                    <View style={styles.headerIcon}>
                        <Flame size={24} color={colors.primary} />
                    </View>
                </View>

                {/* Main Calorie Card */}
                <View style={styles.calorieCard}>
                    <View style={styles.calorieHeader}>
                        <View style={styles.calorieMain}>
                            <Typography variant="h1" color={colors.primary}>
                                {todayNutrition.totalCalories}
                            </Typography>
                            <Typography variant="bodySmall" color={colors.textSecondary}>
                                / {goals.dailyCalories} kcal
                            </Typography>
                        </View>
                        <View style={styles.caloriePercentBadge}>
                            <Typography variant="h3" color={colors.textOnPrimary}>
                                {Math.round(caloriePercentage)}%
                            </Typography>
                        </View>
                    </View>
                    <View style={styles.progressBarLarge}>
                        <View style={[styles.progressFillLarge, { width: `${caloriePercentage}%` }]} />
                    </View>
                    <Typography variant="caption" color={colors.textMuted} style={{ textAlign: 'center' }}>
                        {goals.dailyCalories - todayNutrition.totalCalories > 0
                            ? `${goals.dailyCalories - todayNutrition.totalCalories} kcal kaldı`
                            : 'Hedefe ulaşıldı! 🎉'}
                    </Typography>
                </View>

                {/* Macros */}
                <View style={styles.macrosContainer}>
                    <View style={styles.macroCard}>
                        <View style={[styles.macroIcon, { backgroundColor: colors.info + '20' }]}>
                            <Typography variant="label" color={colors.info}>P</Typography>
                        </View>
                        <Typography variant="h3">{Math.round(todayNutrition.totalMacros.protein)}g</Typography>
                        <View style={styles.macroProgress}>
                            <View style={[styles.macroFill, { width: `${proteinPercentage}%`, backgroundColor: colors.info }]} />
                        </View>
                        <Typography variant="caption" color={colors.textMuted}>/ {goals.protein}g</Typography>
                    </View>

                    <View style={styles.macroCard}>
                        <View style={[styles.macroIcon, { backgroundColor: colors.warning + '20' }]}>
                            <Typography variant="label" color={colors.warning}>K</Typography>
                        </View>
                        <Typography variant="h3">{Math.round(todayNutrition.totalMacros.carbs)}g</Typography>
                        <View style={styles.macroProgress}>
                            <View style={[styles.macroFill, { width: `${carbsPercentage}%`, backgroundColor: colors.warning }]} />
                        </View>
                        <Typography variant="caption" color={colors.textMuted}>/ {goals.carbs}g</Typography>
                    </View>

                    <View style={styles.macroCard}>
                        <View style={[styles.macroIcon, { backgroundColor: colors.error + '20' }]}>
                            <Typography variant="label" color={colors.error}>Y</Typography>
                        </View>
                        <Typography variant="h3">{Math.round(todayNutrition.totalMacros.fat)}g</Typography>
                        <View style={styles.macroProgress}>
                            <View style={[styles.macroFill, { width: `${fatPercentage}%`, backgroundColor: colors.error }]} />
                        </View>
                        <Typography variant="caption" color={colors.textMuted}>/ {goals.fat}g</Typography>
                    </View>
                </View>

                {/* Water Intake */}
                <View style={styles.waterCard}>
                    <View style={styles.waterHeader}>
                        <View style={styles.waterIcon}>
                            <Droplets size={20} color={colors.info} />
                        </View>
                        <View style={styles.waterInfo}>
                            <Typography variant="body">Su Tüketimi</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>
                                {(todayNutrition.waterIntake / 1000).toFixed(1)}L / {(goals.water / 1000).toFixed(1)}L
                            </Typography>
                        </View>
                        <View style={styles.waterButtons}>
                            <Pressable style={styles.waterButton} onPress={() => handleAddWater(-250)}>
                                <Minus size={16} color={colors.textSecondary} />
                            </Pressable>
                            <Pressable style={styles.waterButtonAdd} onPress={() => handleAddWater(250)}>
                                <Plus size={16} color={colors.textOnPrimary} />
                            </Pressable>
                        </View>
                    </View>
                    <View style={styles.waterProgress}>
                        <View style={[styles.waterFill, { width: `${waterPercentage}%` }]} />
                    </View>
                </View>

                {/* Add Food Button */}
                <Button
                    title="Yemek Ekle"
                    variant="primary"
                    icon={<Plus size={18} color={colors.textOnPrimary} />}
                    onPress={() => setShowAddFoodModal(true)}
                    fullWidth
                />

                {/* Today's Meals */}
                {Object.keys(entriesByMeal).length > 0 && (
                    <View style={styles.mealsSection}>
                        <Typography variant="h3">Bugünkü Öğünler</Typography>

                        {Object.entries(entriesByMeal).map(([mealType, entries]) => {
                            const Icon = mealTypeIcons[mealType as keyof typeof mealTypeIcons];
                            const mealCalories = entries.reduce((sum, e) => sum + e.calories * e.quantity, 0);
                            return (
                                <View key={mealType} style={styles.mealGroup}>
                                    <View style={styles.mealHeader}>
                                        <Icon size={18} color={colors.primary} />
                                        <Typography variant="label">
                                            {mealTypeNames[mealType as keyof typeof mealTypeNames]}
                                        </Typography>
                                        <Typography variant="caption" color={colors.textMuted}>
                                            {mealCalories} kcal
                                        </Typography>
                                    </View>
                                    {entries.map((entry) => (
                                        <View key={entry.id} style={styles.foodItem}>
                                            <View style={styles.foodInfo}>
                                                <Typography variant="body">{entry.name}</Typography>
                                                <Typography variant="caption" color={colors.textMuted}>
                                                    {entry.calories} kcal
                                                </Typography>
                                            </View>
                                            <Pressable
                                                style={styles.removeButton}
                                                onPress={() => handleRemoveFood(entry.id)}
                                            >
                                                <X size={16} color={colors.error} />
                                            </Pressable>
                                        </View>
                                    ))}
                                </View>
                            );
                        })}
                    </View>
                )}
            </ScrollView>

            {/* Add Food Modal */}
            <Modal visible={showAddFoodModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <H2>Yemek Ekle</H2>
                            <Pressable onPress={() => setShowAddFoodModal(false)}>
                                <X size={24} color={colors.textSecondary} />
                            </Pressable>
                        </View>

                        {/* Meal Type Selector */}
                        <View style={styles.mealTypeSelector}>
                            {(Object.keys(mealTypeNames) as Array<keyof typeof mealTypeNames>).map((type) => {
                                const Icon = mealTypeIcons[type];
                                const isActive = selectedMealType === type;
                                return (
                                    <Pressable
                                        key={type}
                                        style={[styles.mealTypeButton, isActive && styles.mealTypeButtonActive]}
                                        onPress={() => setSelectedMealType(type)}
                                    >
                                        <Icon size={16} color={isActive ? colors.textOnPrimary : colors.textSecondary} />
                                        <Typography variant="caption" color={isActive ? colors.textOnPrimary : colors.textSecondary}>
                                            {mealTypeNames[type]}
                                        </Typography>
                                    </Pressable>
                                );
                            })}
                        </View>

                        {/* Quick Foods List */}
                        <Typography variant="label" style={{ marginTop: spacing[3], color: colors.textSecondary }}>
                            HIZLI EKLE
                        </Typography>
                        <ScrollView style={styles.quickFoodsList}>
                            {quickFoods.map((food) => (
                                <Pressable key={food.id} style={styles.quickFoodItem} onPress={() => handleAddFood(food)}>
                                    <View style={styles.quickFoodIcon}>
                                        <Apple size={18} color={colors.primary} />
                                    </View>
                                    <View style={styles.quickFoodInfo}>
                                        <Typography variant="body">{food.name}</Typography>
                                        <Typography variant="caption" color={colors.textMuted}>
                                            {food.calories} kcal • {food.servingSize}
                                        </Typography>
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
    scrollView: { flex: 1 },
    content: { padding: layout.screenPaddingHorizontal, paddingBottom: 100, gap: spacing[4] },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    headerIcon: { width: 48, height: 48, borderRadius: layout.radiusMedium, backgroundColor: colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
    calorieCard: { backgroundColor: colors.surface, borderRadius: layout.radiusLarge, padding: layout.cardPadding, borderWidth: 1, borderColor: colors.border, gap: spacing[3] },
    calorieHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    calorieMain: { flexDirection: 'row', alignItems: 'baseline', gap: spacing[1] },
    caloriePercentBadge: { backgroundColor: colors.primary, paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: layout.radiusMedium },
    progressBarLarge: { height: 10, backgroundColor: colors.surfaceLight, borderRadius: 5, overflow: 'hidden' },
    progressFillLarge: { height: '100%', backgroundColor: colors.primary, borderRadius: 5 },
    macrosContainer: { flexDirection: 'row', gap: spacing[2] },
    macroCard: { flex: 1, backgroundColor: colors.surface, borderRadius: layout.radiusMedium, padding: spacing[3], alignItems: 'center', borderWidth: 1, borderColor: colors.border, gap: spacing[1] },
    macroIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    macroProgress: { width: '100%', height: 4, backgroundColor: colors.surfaceLight, borderRadius: 2, overflow: 'hidden', marginTop: spacing[1] },
    macroFill: { height: '100%', borderRadius: 2 },
    waterCard: { backgroundColor: colors.surface, borderRadius: layout.radiusLarge, padding: layout.cardPadding, borderWidth: 1, borderColor: colors.border, gap: spacing[3] },
    waterHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
    waterIcon: { width: 40, height: 40, borderRadius: layout.radiusMedium, backgroundColor: colors.info + '20', alignItems: 'center', justifyContent: 'center' },
    waterInfo: { flex: 1, gap: 2 },
    waterButtons: { flexDirection: 'row', gap: spacing[2] },
    waterButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceLight, alignItems: 'center', justifyContent: 'center' },
    waterButtonAdd: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.info, alignItems: 'center', justifyContent: 'center' },
    waterProgress: { height: 8, backgroundColor: colors.surfaceLight, borderRadius: 4, overflow: 'hidden' },
    waterFill: { height: '100%', backgroundColor: colors.info, borderRadius: 4 },
    mealsSection: { gap: spacing[3] },
    mealGroup: { backgroundColor: colors.surface, borderRadius: layout.radiusMedium, padding: spacing[3], borderWidth: 1, borderColor: colors.border, gap: spacing[2] },
    mealHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], paddingBottom: spacing[2], borderBottomWidth: 1, borderBottomColor: colors.border },
    foodItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing[2] },
    foodInfo: { flex: 1, gap: 2 },
    removeButton: { padding: spacing[2] },
    modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
    modalContent: { backgroundColor: colors.background, borderTopLeftRadius: layout.radiusLarge, borderTopRightRadius: layout.radiusLarge, padding: layout.screenPaddingHorizontal, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: spacing[3] },
    mealTypeSelector: { flexDirection: 'row', gap: spacing[2] },
    mealTypeButton: { flex: 1, alignItems: 'center', padding: spacing[2], borderRadius: layout.radiusMedium, backgroundColor: colors.surface, gap: spacing[1] },
    mealTypeButtonActive: { backgroundColor: colors.primary },
    quickFoodsList: { marginTop: spacing[2], maxHeight: 300 },
    quickFoodItem: { flexDirection: 'row', alignItems: 'center', padding: spacing[3], backgroundColor: colors.surface, borderRadius: layout.radiusMedium, marginBottom: spacing[2], gap: spacing[3], ...Platform.select({ web: { cursor: 'pointer' } }) },
    quickFoodIcon: { width: 40, height: 40, borderRadius: layout.radiusMedium, backgroundColor: colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
    quickFoodInfo: { flex: 1, gap: 2 },
});
