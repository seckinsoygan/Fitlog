// FitLog - Profile Edit Screen
import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Pressable,
    TextInput,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ArrowLeft,
    User,
    Mail,
    Scale,
    Ruler,
    Calendar,
    Target,
    Activity,
    Save,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { layout, spacing } from '../theme/spacing';
import { Typography, H1, Button } from '../components/atoms';
import { useAuthStore, useThemeStore, useUserStore, useNutritionStore } from '../store';

// Web-compatible alert
const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
        window.alert(`${title}\n\n${message}`);
    } else {
        Alert.alert(title, message);
    }
};

interface ProfileField {
    key: string;
    label: string;
    icon: any;
    value: string;
    placeholder: string;
    keyboardType?: 'default' | 'numeric' | 'email-address';
    suffix?: string;
}

export const ProfileEditScreen: React.FC = () => {
    const navigation = useNavigation();
    const colors = useThemeStore((state) => state.colors);
    const { userProfile, updateUserProfile, isLoading } = useAuthStore();
    const { profile, updateProfile } = useUserStore();
    const { goals, setGoals } = useNutritionStore();

    // Form state - load from existing profile
    const [displayName, setDisplayName] = useState(userProfile?.displayName || profile.name);
    const [weight, setWeight] = useState(String(profile.weight || 75));
    const [height, setHeight] = useState(String(profile.height || 175));
    const [age, setAge] = useState(String(profile.age || 25));
    const [targetWeight, setTargetWeight] = useState(String(profile.targetWeight || 72));
    const [dailySteps, setDailySteps] = useState(String(profile.dailySteps || 10000));
    const [weeklyGoal, setWeeklyGoal] = useState(String(profile.weeklyGoal));
    const [restTimer, setRestTimer] = useState(String(profile.restTimerDefault));
    const [dailyCalories, setDailyCalories] = useState(String(goals.dailyCalories));
    const [proteinGoal, setProteinGoal] = useState(String(goals.protein));
    const [carbsGoal, setCarbsGoal] = useState(String(goals.carbs));
    const [fatGoal, setFatGoal] = useState(String(goals.fat));
    const [waterGoal, setWaterGoal] = useState(String(goals.water / 1000)); // Convert to liters

    const handleSave = async () => {
        try {
            // Update auth profile
            if (userProfile) {
                await updateUserProfile({ displayName });
            }

            // Update local profile with ALL fields (saves to Firebase via updateProfile)
            updateProfile({
                name: displayName,
                weeklyGoal: parseInt(weeklyGoal) || 4,
                restTimerDefault: parseInt(restTimer) || 90,
                age: parseInt(age) || 25,
                weight: parseFloat(weight) || 75,
                height: parseFloat(height) || 175,
                targetWeight: parseFloat(targetWeight) || 72,
                dailySteps: parseInt(dailySteps) || 10000,
            });

            // Update nutrition goals (saves to Firebase via setGoals)
            setGoals({
                dailyCalories: parseInt(dailyCalories) || 2500,
                protein: parseInt(proteinGoal) || 180,
                carbs: parseInt(carbsGoal) || 250,
                fat: parseInt(fatGoal) || 80,
                water: (parseFloat(waterGoal) || 3) * 1000, // Convert to ml
            });

            showAlert('Başarılı', 'Profiliniz güncellendi!');
            navigation.goBack();
        } catch (error) {
            showAlert('Hata', 'Profil güncellenirken bir hata oluştu.');
        }
    };

    const dynamicStyles = createStyles(colors);

    const renderInputField = (
        label: string,
        value: string,
        onChange: (text: string) => void,
        icon: React.ReactNode,
        placeholder: string,
        keyboardType: 'default' | 'numeric' | 'email-address' = 'default',
        suffix?: string
    ) => (
        <View style={dynamicStyles.inputGroup}>
            <View style={dynamicStyles.inputLabel}>
                {icon}
                <Typography variant="body" color={colors.textSecondary}>{label}</Typography>
            </View>
            <View style={dynamicStyles.inputWrapper}>
                <TextInput
                    style={dynamicStyles.input}
                    value={value}
                    onChangeText={onChange}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textMuted}
                    keyboardType={keyboardType}
                />
                {suffix && (
                    <Typography variant="body" color={colors.textMuted} style={dynamicStyles.inputSuffix}>
                        {suffix}
                    </Typography>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={dynamicStyles.container} edges={['top']}>
            {/* Header */}
            <View style={dynamicStyles.header}>
                <Pressable style={dynamicStyles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft size={24} color={colors.textPrimary} />
                </Pressable>
                <View style={dynamicStyles.headerTitle}>
                    <Typography variant="h2">Profili Düzenle</Typography>
                </View>
                <Pressable
                    style={[dynamicStyles.saveButton, isLoading && { opacity: 0.5 }]}
                    onPress={handleSave}
                    disabled={isLoading}
                >
                    <Save size={20} color={colors.primary} />
                </Pressable>
            </View>

            <ScrollView
                style={dynamicStyles.scrollView}
                contentContainerStyle={dynamicStyles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Avatar Section */}
                <View style={dynamicStyles.avatarSection}>
                    <View style={dynamicStyles.avatar}>
                        <Typography variant="h1" color={colors.textOnPrimary}>
                            {displayName.charAt(0).toUpperCase()}
                        </Typography>
                    </View>
                    <Typography variant="caption" color={colors.textMuted}>
                        Avatarı değiştirmek için dokun
                    </Typography>
                </View>

                {/* Personal Info Section */}
                <View style={dynamicStyles.section}>
                    <Typography variant="label" color={colors.textSecondary} style={dynamicStyles.sectionLabel}>
                        KİŞİSEL BİLGİLER
                    </Typography>
                    <View style={dynamicStyles.sectionCard}>
                        {renderInputField('İsim', displayName, setDisplayName, <User size={18} color={colors.primary} />, 'Adınızı girin')}
                        {renderInputField('Yaş', age, setAge, <Calendar size={18} color={colors.primary} />, '25', 'numeric', 'yaş')}
                    </View>
                </View>

                {/* Body Metrics Section */}
                <View style={dynamicStyles.section}>
                    <Typography variant="label" color={colors.textSecondary} style={dynamicStyles.sectionLabel}>
                        VÜCUT ÖLÇÜLERİ
                    </Typography>
                    <View style={dynamicStyles.sectionCard}>
                        {renderInputField('Kilo', weight, setWeight, <Scale size={18} color={colors.warning} />, '75', 'numeric', 'kg')}
                        {renderInputField('Boy', height, setHeight, <Ruler size={18} color={colors.warning} />, '175', 'numeric', 'cm')}
                        {renderInputField('Hedef Kilo', targetWeight, setTargetWeight, <Target size={18} color={colors.success} />, '72', 'numeric', 'kg')}
                    </View>
                </View>

                {/* Workout Goals Section */}
                <View style={dynamicStyles.section}>
                    <Typography variant="label" color={colors.textSecondary} style={dynamicStyles.sectionLabel}>
                        ANTRENMAN HEDEFLERİ
                    </Typography>
                    <View style={dynamicStyles.sectionCard}>
                        {renderInputField('Haftalık Antrenman', weeklyGoal, setWeeklyGoal, <Activity size={18} color={colors.info} />, '4', 'numeric', 'gün')}
                        {renderInputField('Dinlenme Süresi', restTimer, setRestTimer, <Activity size={18} color={colors.info} />, '90', 'numeric', 'sn')}
                        {renderInputField('Günlük Adım', dailySteps, setDailySteps, <Activity size={18} color={colors.info} />, '10000', 'numeric', 'adım')}
                    </View>
                </View>

                {/* Nutrition Goals Section */}
                <View style={dynamicStyles.section}>
                    <Typography variant="label" color={colors.textSecondary} style={dynamicStyles.sectionLabel}>
                        BESLENME HEDEFLERİ
                    </Typography>
                    <View style={dynamicStyles.sectionCard}>
                        {renderInputField('Günlük Kalori', dailyCalories, setDailyCalories, <Target size={18} color={colors.error} />, '2500', 'numeric', 'kcal')}
                        {renderInputField('Protein', proteinGoal, setProteinGoal, <Target size={18} color={colors.primary} />, '180', 'numeric', 'g')}
                        {renderInputField('Karbonhidrat', carbsGoal, setCarbsGoal, <Target size={18} color={colors.warning} />, '250', 'numeric', 'g')}
                        {renderInputField('Yağ', fatGoal, setFatGoal, <Target size={18} color={colors.info} />, '80', 'numeric', 'g')}
                        {renderInputField('Su', waterGoal, setWaterGoal, <Target size={18} color={colors.info} />, '3', 'numeric', 'litre')}
                    </View>
                </View>

                {/* Save Button */}
                <Button
                    title={isLoading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                    variant="primary"
                    fullWidth
                    onPress={handleSave}
                    loading={isLoading}
                    disabled={isLoading}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: layout.screenPaddingHorizontal,
        paddingVertical: spacing[3],
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        gap: spacing[3]
    },
    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: layout.radiusMedium,
        backgroundColor: colors.surface,
        ...Platform.select({ web: { cursor: 'pointer' } }) as any
    },
    headerTitle: { flex: 1 },
    saveButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: layout.radiusMedium,
        backgroundColor: colors.primaryMuted,
        ...Platform.select({ web: { cursor: 'pointer' } }) as any
    },
    scrollView: { flex: 1 },
    content: {
        padding: layout.screenPaddingHorizontal,
        paddingBottom: 100,
        gap: spacing[5]
    },
    avatarSection: {
        alignItems: 'center',
        gap: spacing[2],
        paddingVertical: spacing[4],
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: colors.primaryMuted,
    },
    section: {
        gap: spacing[2],
    },
    sectionLabel: {
        marginLeft: spacing[1],
    },
    sectionCard: {
        backgroundColor: colors.surface,
        borderRadius: layout.radiusLarge,
        padding: spacing[4],
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing[4],
    },
    inputGroup: {
        gap: spacing[2],
    },
    inputLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: layout.radiusMedium,
        borderWidth: 1,
        borderColor: colors.border,
    },
    input: {
        flex: 1,
        padding: spacing[3],
        fontSize: 16,
        color: colors.textPrimary,
        ...Platform.select({
            web: { outlineStyle: 'none' } as any,
        }),
    },
    inputSuffix: {
        paddingRight: spacing[3],
    },
});
