// FitLog - Settings Screen with Dynamic Theme
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Switch, Modal, TextInput, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
    User,
    Timer,
    Scale,
    Bell,
    Moon,
    Sun,
    HelpCircle,
    ChevronRight,
    X,
    Check,
    Target,
    Palette,
    LogOut,
    Globe,
} from 'lucide-react-native';
import { layout, spacing } from '../theme/spacing';
import { Typography, H1, H2, Button } from '../components/atoms';
import { useUserStore, useThemeStore, useNutritionStore, useAuthStore, useLanguageStore } from '../store';
import { useTranslation, availableLanguages } from '../i18n';

const showAlert = (title: string, message: string, buttons?: any[]) => {
    if (Platform.OS === 'web') {
        if (buttons && buttons.length > 1) {
            const result = window.confirm(`${title}\n\n${message}`);
            if (result) {
                const confirmBtn = buttons.find(b => b.style !== 'cancel');
                confirmBtn?.onPress?.();
            }
        } else {
            window.alert(`${title}\n\n${message}`);
        }
    } else {
        Alert.alert(title, message, buttons);
    }
};

interface SettingItemProps {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
    colors: any;
}

const SettingItem: React.FC<SettingItemProps> = ({
    icon,
    title,
    subtitle,
    onPress,
    rightComponent,
    colors,
}) => (
    <Pressable
        style={({ pressed }) => [
            {
                flexDirection: 'row' as const,
                alignItems: 'center' as const,
                padding: spacing[4],
                gap: spacing[3],
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                backgroundColor: pressed && onPress ? colors.surfaceLight : 'transparent',
            },
        ]}
        onPress={onPress}
        disabled={!onPress}
    >
        <View style={{
            width: 40,
            height: 40,
            borderRadius: layout.radiusMedium,
            backgroundColor: colors.primaryMuted,
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            {icon}
        </View>
        <View style={{ flex: 1, gap: spacing[1] }}>
            <Typography variant="body">{title}</Typography>
            {subtitle && <Typography variant="caption" color={colors.textSecondary}>{subtitle}</Typography>}
        </View>
        {rightComponent || (onPress && <ChevronRight size={20} color={colors.textMuted} />)}
    </Pressable>
);

export const SettingsScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const colors = useThemeStore((state) => state.colors);
    const mode = useThemeStore((state) => state.mode);
    const toggleTheme = useThemeStore((state) => state.toggleTheme);
    const { profile, updateProfile } = useUserStore();
    const { goals, setGoals } = useNutritionStore();
    const { signOut, userProfile, isLoading: authLoading } = useAuthStore();

    const isDarkMode = mode === 'dark';

    const handleLogout = () => {
        showAlert(t.settings.logout, t.settings.logoutConfirm, [
            { text: t.settings.cancel, style: 'cancel' },
            { text: t.settings.logout, style: 'destructive', onPress: () => signOut() },
        ]);
    };

    // Get translations
    const { t, language, setLanguage } = useTranslation();

    // Modal states
    const [showNameModal, setShowNameModal] = useState(false);
    const [showRestTimerModal, setShowRestTimerModal] = useState(false);
    const [showWeightUnitModal, setShowWeightUnitModal] = useState(false);
    const [showWeeklyGoalModal, setShowWeeklyGoalModal] = useState(false);
    const [showCalorieGoalModal, setShowCalorieGoalModal] = useState(false);
    const [showLanguageModal, setShowLanguageModal] = useState(false);

    // Form states
    const [tempName, setTempName] = useState(profile.name);
    const [tempRestTimer, setTempRestTimer] = useState(String(profile.restTimerDefault));
    const [tempWeeklyGoal, setTempWeeklyGoal] = useState(String(profile.weeklyGoal));
    const [tempCalorieGoal, setTempCalorieGoal] = useState(String(goals.dailyCalories));
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    // Handlers
    const handleSaveName = () => {
        if (tempName.trim()) {
            updateProfile({ name: tempName.trim() });
            setShowNameModal(false);
        }
    };

    const handleSaveRestTimer = () => {
        const value = parseInt(tempRestTimer);
        if (value >= 30 && value <= 300) {
            updateProfile({ restTimerDefault: value });
            setShowRestTimerModal(false);
        } else {
            showAlert(t.settings.error, t.settings.restTimeError);
        }
    };

    const handleSaveWeeklyGoal = () => {
        const value = parseInt(tempWeeklyGoal);
        if (value >= 1 && value <= 7) {
            updateProfile({ weeklyGoal: value });
            setShowWeeklyGoalModal(false);
        } else {
            showAlert(t.settings.error, t.settings.weeklyGoalError);
        }
    };

    const handleSaveCalorieGoal = () => {
        const value = parseInt(tempCalorieGoal);
        if (value >= 1000 && value <= 6000) {
            setGoals({ dailyCalories: value });
            setShowCalorieGoalModal(false);
        } else {
            showAlert(t.settings.error, t.settings.calorieGoalError);
        }
    };

    const handleWeightUnitChange = (unit: 'kg' | 'lbs') => {
        updateProfile({ weightUnit: unit });
        setShowWeightUnitModal(false);
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
                <H1>{t.settings.title}</H1>

                {/* Profile Section */}
                <Pressable style={styles.profileCard} onPress={() => navigation.navigate('ProfileEdit' as never)}>
                    <View style={styles.avatar}>
                        {profile.avatarUrl ? (
                            <Typography style={{ fontSize: 32 }}>{profile.avatarUrl}</Typography>
                        ) : (
                            <Typography variant="h1" color={colors.textOnPrimary}>
                                {profile.name.charAt(0)}
                            </Typography>
                        )}
                    </View>
                    <View style={styles.profileInfo}>
                        <Typography variant="h2">{profile.name}</Typography>
                        <Typography variant="caption" color={colors.textSecondary}>
                            {t.settings.editProfile}
                        </Typography>
                    </View>
                    <ChevronRight size={20} color={colors.textMuted} />
                </Pressable>

                {/* Theme Section - Prominent */}
                <View style={styles.themeSection}>
                    <View style={styles.themeSectionHeader}>
                        <Palette size={20} color={colors.primary} />
                        <Typography variant="h3">{t.settings.theme}</Typography>
                    </View>
                    <View style={styles.themeToggleContainer}>
                        <Pressable
                            style={[styles.themeOption, !isDarkMode && styles.themeOptionActive]}
                            onPress={() => !isDarkMode ? null : toggleTheme()}
                        >
                            <Sun size={24} color={!isDarkMode ? colors.textOnPrimary : colors.textMuted} />
                            <Typography
                                variant="body"
                                color={!isDarkMode ? colors.textOnPrimary : colors.textSecondary}
                            >
                                {t.settings.lightMode}
                            </Typography>
                        </Pressable>
                        <Pressable
                            style={[styles.themeOption, isDarkMode && styles.themeOptionActive]}
                            onPress={() => isDarkMode ? null : toggleTheme()}
                        >
                            <Moon size={24} color={isDarkMode ? colors.textOnPrimary : colors.textMuted} />
                            <Typography
                                variant="body"
                                color={isDarkMode ? colors.textOnPrimary : colors.textSecondary}
                            >
                                {t.settings.darkMode}
                            </Typography>
                        </Pressable>
                    </View>
                </View>

                {/* Language Section */}
                <View style={styles.section}>
                    <Typography variant="label" style={styles.sectionLabel}>
                        {t.settings.languageSection}
                    </Typography>
                    <View style={styles.settingsGroup}>
                        <SettingItem
                            icon={<Globe size={20} color={colors.info} />}
                            title={t.settings.language}
                            subtitle={availableLanguages.find(l => l.code === language)?.nativeLabel || 'Türkçe'}
                            onPress={() => setShowLanguageModal(true)}
                            colors={colors}
                        />
                    </View>
                </View>

                {/* Workout Settings */}
                <View style={styles.section}>
                    <Typography variant="label" style={styles.sectionLabel}>
                        {t.settings.workoutSection}
                    </Typography>

                    <View style={styles.settingsGroup}>
                        <SettingItem
                            icon={<Timer size={20} color={colors.primary} />}
                            title={t.settings.defaultRestTime}
                            subtitle={`${profile.restTimerDefault} ${t.settings.seconds}`}
                            onPress={() => {
                                setTempRestTimer(String(profile.restTimerDefault));
                                setShowRestTimerModal(true);
                            }}
                            colors={colors}
                        />
                        <SettingItem
                            icon={<Scale size={20} color={colors.primary} />}
                            title={t.settings.weightUnit}
                            subtitle={profile.weightUnit.toUpperCase()}
                            onPress={() => setShowWeightUnitModal(true)}
                            colors={colors}
                        />
                        <SettingItem
                            icon={<Target size={20} color={colors.primary} />}
                            title={t.settings.weeklyWorkoutGoal}
                            subtitle={`${profile.weeklyGoal} ${t.settings.days}`}
                            onPress={() => {
                                setTempWeeklyGoal(String(profile.weeklyGoal));
                                setShowWeeklyGoalModal(true);
                            }}
                            colors={colors}
                        />
                    </View>
                </View>

                {/* Nutrition Settings */}
                <View style={styles.section}>
                    <Typography variant="label" style={styles.sectionLabel}>
                        {t.settings.nutritionSection}
                    </Typography>

                    <View style={styles.settingsGroup}>
                        <SettingItem
                            icon={<Target size={20} color={colors.warning} />}
                            title={t.settings.dailyCalorieGoal}
                            subtitle={`${goals.dailyCalories} kcal`}
                            onPress={() => {
                                setTempCalorieGoal(String(goals.dailyCalories));
                                setShowCalorieGoalModal(true);
                            }}
                            colors={colors}
                        />
                    </View>
                </View>

                {/* Notifications */}
                <View style={styles.section}>
                    <Typography variant="label" style={styles.sectionLabel}>
                        {t.settings.notificationsSection}
                    </Typography>

                    <View style={styles.settingsGroup}>
                        <SettingItem
                            icon={<Bell size={20} color={colors.primary} />}
                            title={t.settings.workoutReminders}
                            rightComponent={
                                <Switch
                                    value={notificationsEnabled}
                                    onValueChange={setNotificationsEnabled}
                                    trackColor={{ false: colors.secondary, true: colors.primaryMuted }}
                                    thumbColor={notificationsEnabled ? colors.primary : colors.textMuted}
                                />
                            }
                            colors={colors}
                        />
                    </View>
                </View>

                {/* Support */}
                <View style={styles.section}>
                    <Typography variant="label" style={styles.sectionLabel}>
                        {t.settings.supportSection}
                    </Typography>

                    <View style={styles.settingsGroup}>
                        <SettingItem
                            icon={<HelpCircle size={20} color={colors.textSecondary} />}
                            title={t.settings.helpFaq}
                            onPress={() => showAlert(t.settings.help, t.settings.helpMessage)}
                            colors={colors}
                        />
                    </View>
                </View>

                {/* Data Management */}
                <View style={styles.section}>
                    <Typography variant="label" style={styles.sectionLabel}>
                        {t.settings.dataSection}
                    </Typography>

                    <View style={styles.settingsGroup}>
                        <SettingItem
                            icon={<Target size={20} color={colors.error} />}
                            title={t.settings.resetWorkoutHistory}
                            subtitle={t.settings.resetWorkoutHistorySubtitle}
                            onPress={() => {
                                showAlert(
                                    t.settings.resetConfirmTitle,
                                    t.settings.resetConfirmMessage,
                                    [
                                        { text: t.settings.cancel, style: 'cancel' },
                                        {
                                            text: t.settings.reset,
                                            style: 'destructive',
                                            onPress: async () => {
                                                const { resetAllProgress } = await import('../store/workoutHistoryStore').then(m => m.useWorkoutHistoryStore.getState());
                                                await resetAllProgress();
                                                showAlert(t.settings.success, t.settings.resetSuccess);
                                            }
                                        },
                                    ]
                                );
                            }}
                            colors={colors}
                        />
                    </View>
                </View>

                {/* Logout Section */}
                <View style={styles.section}>
                    <View style={styles.settingsGroup}>
                        <SettingItem
                            icon={<LogOut size={20} color={colors.error} />}
                            title={t.settings.logout}
                            subtitle={userProfile?.email || ''}
                            onPress={handleLogout}
                            colors={colors}
                        />
                    </View>
                </View>

                {/* App Info */}
                <View style={styles.appInfo}>
                    <Typography variant="caption" color={colors.textMuted}>FitLog v1.0.0</Typography>
                    <Typography variant="caption" color={colors.textMuted}>{t.settings.madeWith}</Typography>
                </View>
            </ScrollView>

            {/* Modals */}
            <Modal visible={showNameModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <View style={styles.modalBoxHeader}>
                            <H2>{t.settings.changeName}</H2>
                            <Pressable onPress={() => setShowNameModal(false)}>
                                <X size={24} color={colors.textSecondary} />
                            </Pressable>
                        </View>
                        <TextInput
                            style={styles.modalInput}
                            value={tempName}
                            onChangeText={setTempName}
                            placeholder={t.settings.enterYourName}
                            placeholderTextColor={colors.textMuted}
                            autoFocus
                        />
                        <Button title={t.settings.save} onPress={handleSaveName} variant="primary" fullWidth />
                    </View>
                </View>
            </Modal>

            <Modal visible={showRestTimerModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <View style={styles.modalBoxHeader}>
                            <H2>{t.settings.restTime}</H2>
                            <Pressable onPress={() => setShowRestTimerModal(false)}>
                                <X size={24} color={colors.textSecondary} />
                            </Pressable>
                        </View>
                        <TextInput
                            style={styles.modalInput}
                            value={tempRestTimer}
                            onChangeText={setTempRestTimer}
                            placeholder={t.settings.secondsRange}
                            placeholderTextColor={colors.textMuted}
                            keyboardType="numeric"
                            autoFocus
                        />
                        <Typography variant="caption" color={colors.textMuted} style={{ marginBottom: spacing[3] }}>
                            {t.settings.restTimeRange}
                        </Typography>
                        <Button title={t.settings.save} onPress={handleSaveRestTimer} variant="primary" fullWidth />
                    </View>
                </View>
            </Modal>

            <Modal visible={showWeeklyGoalModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <View style={styles.modalBoxHeader}>
                            <H2>Haftalık Hedef</H2>
                            <Pressable onPress={() => setShowWeeklyGoalModal(false)}>
                                <X size={24} color={colors.textSecondary} />
                            </Pressable>
                        </View>
                        <TextInput
                            style={styles.modalInput}
                            value={tempWeeklyGoal}
                            onChangeText={setTempWeeklyGoal}
                            placeholder="Gün sayısı (1-7)"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="numeric"
                            autoFocus
                        />
                        <Button title="Kaydet" onPress={handleSaveWeeklyGoal} variant="primary" fullWidth />
                    </View>
                </View>
            </Modal>

            <Modal visible={showCalorieGoalModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <View style={styles.modalBoxHeader}>
                            <H2>Günlük Kalori</H2>
                            <Pressable onPress={() => setShowCalorieGoalModal(false)}>
                                <X size={24} color={colors.textSecondary} />
                            </Pressable>
                        </View>
                        <TextInput
                            style={styles.modalInput}
                            value={tempCalorieGoal}
                            onChangeText={setTempCalorieGoal}
                            placeholder="Kalori (kcal)"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="numeric"
                            autoFocus
                        />
                        <Button title="Kaydet" onPress={handleSaveCalorieGoal} variant="primary" fullWidth />
                    </View>
                </View>
            </Modal>

            <Modal visible={showWeightUnitModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <View style={styles.modalBoxHeader}>
                            <H2>Ağırlık Birimi</H2>
                            <Pressable onPress={() => setShowWeightUnitModal(false)}>
                                <X size={24} color={colors.textSecondary} />
                            </Pressable>
                        </View>
                        <Pressable
                            style={[styles.unitOption, profile.weightUnit === 'kg' && styles.unitOptionActive]}
                            onPress={() => handleWeightUnitChange('kg')}
                        >
                            <Typography variant="body">Kilogram (KG)</Typography>
                            {profile.weightUnit === 'kg' && <Check size={20} color={colors.primary} />}
                        </Pressable>
                        <Pressable
                            style={[styles.unitOption, profile.weightUnit === 'lbs' && styles.unitOptionActive]}
                            onPress={() => handleWeightUnitChange('lbs')}
                        >
                            <Typography variant="body">Pound (LBS)</Typography>
                            {profile.weightUnit === 'lbs' && <Check size={20} color={colors.primary} />}
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* Language Modal */}
            <Modal visible={showLanguageModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <View style={styles.modalBoxHeader}>
                            <H2>{t.settings.language}</H2>
                            <Pressable onPress={() => setShowLanguageModal(false)}>
                                <X size={24} color={colors.textSecondary} />
                            </Pressable>
                        </View>
                        {availableLanguages.map((lang) => (
                            <Pressable
                                key={lang.code}
                                style={[styles.unitOption, language === lang.code && styles.unitOptionActive]}
                                onPress={() => {
                                    setLanguage(lang.code);
                                    setShowLanguageModal(false);
                                }}
                            >
                                <View>
                                    <Typography variant="body">{lang.nativeLabel}</Typography>
                                    <Typography variant="caption" color={colors.textMuted}>{lang.label}</Typography>
                                </View>
                                {language === lang.code && <Check size={20} color={colors.primary} />}
                            </Pressable>
                        ))}
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
    profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: layout.radiusLarge, padding: layout.cardPadding, gap: spacing[4], borderWidth: 1, borderColor: colors.border },
    avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    profileInfo: { flex: 1, gap: spacing[1] },
    themeSection: { backgroundColor: colors.surface, borderRadius: layout.radiusLarge, padding: layout.cardPadding, borderWidth: 1, borderColor: colors.border, gap: spacing[3] },
    themeSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
    themeToggleContainer: { flexDirection: 'row', gap: spacing[3] },
    themeOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2], paddingVertical: spacing[4], borderRadius: layout.radiusMedium, backgroundColor: colors.surfaceLight, borderWidth: 2, borderColor: 'transparent' },
    themeOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    section: { gap: spacing[2] },
    sectionLabel: { marginLeft: spacing[1], color: colors.textSecondary },
    settingsGroup: { backgroundColor: colors.surface, borderRadius: layout.radiusLarge, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
    appInfo: { alignItems: 'center', gap: spacing[1], marginTop: spacing[4] },
    modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center', padding: spacing[4] },
    modalBox: { backgroundColor: colors.surface, borderRadius: layout.radiusLarge, padding: layout.cardPadding, width: '100%', maxWidth: 400 },
    modalBoxHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[4] },
    modalInput: { backgroundColor: colors.background, borderRadius: layout.radiusMedium, padding: spacing[4], color: colors.textPrimary, fontSize: 16, borderWidth: 1, borderColor: colors.border, marginBottom: spacing[3] },
    unitOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing[4], borderRadius: layout.radiusMedium, backgroundColor: colors.background, marginBottom: spacing[2] },
    unitOptionActive: { borderWidth: 2, borderColor: colors.primary },
});
