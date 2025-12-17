// FitLog - Register Screen
import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft, Dumbbell } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { layout, spacing } from '../../theme/spacing';
import { Typography, H1, Button } from '../../components/atoms';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store';

export const RegisterScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const colors = useThemeStore((state) => state.colors);
    const { signUp, isLoading, error, clearError } = useAuthStore();

    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');

    const handleRegister = async () => {
        setLocalError('');
        clearError();

        if (!displayName.trim()) {
            setLocalError('İsim gerekli');
            return;
        }
        if (!email.trim()) {
            setLocalError('E-posta adresi gerekli');
            return;
        }
        if (!password) {
            setLocalError('Şifre gerekli');
            return;
        }
        if (password.length < 6) {
            setLocalError('Şifre en az 6 karakter olmalı');
            return;
        }
        if (password !== confirmPassword) {
            setLocalError('Şifreler eşleşmiyor');
            return;
        }

        try {
            await signUp(email.trim(), password, displayName.trim());
        } catch (err: any) {
            // Error is handled by the store
        }
    };

    const styles = createStyles(colors);
    const displayError = localError || error;

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Back Button */}
                    <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                        <ArrowLeft size={24} color={colors.textPrimary} />
                    </Pressable>

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Dumbbell size={40} color={colors.primary} />
                        </View>
                        <H1 style={{ textAlign: 'center' }}>Hesap Oluştur</H1>
                        <Typography variant="body" color={colors.textSecondary} style={{ textAlign: 'center' }}>
                            Fitness yolculuğuna başla
                        </Typography>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Name Input */}
                        <View style={styles.inputContainer}>
                            <User size={20} color={colors.textMuted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Adın"
                                placeholderTextColor={colors.textMuted}
                                value={displayName}
                                onChangeText={setDisplayName}
                                autoComplete="name"
                            />
                        </View>

                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                            <Mail size={20} color={colors.textMuted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="E-posta"
                                placeholderTextColor={colors.textMuted}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                autoComplete="email"
                            />
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputContainer}>
                            <Lock size={20} color={colors.textMuted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Şifre (min. 6 karakter)"
                                placeholderTextColor={colors.textMuted}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                autoComplete="new-password"
                            />
                            <Pressable
                                style={styles.eyeButton}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff size={20} color={colors.textMuted} />
                                ) : (
                                    <Eye size={20} color={colors.textMuted} />
                                )}
                            </Pressable>
                        </View>

                        {/* Confirm Password Input */}
                        <View style={styles.inputContainer}>
                            <Lock size={20} color={colors.textMuted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Şifreyi Onayla"
                                placeholderTextColor={colors.textMuted}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showPassword}
                                autoComplete="new-password"
                            />
                        </View>

                        {/* Error Message */}
                        {displayError && (
                            <View style={styles.errorContainer}>
                                <Typography variant="caption" color={colors.error}>
                                    {displayError}
                                </Typography>
                            </View>
                        )}

                        {/* Register Button */}
                        <Button
                            title={isLoading ? "Kayıt Yapılıyor..." : "Kayıt Ol"}
                            variant="primary"
                            fullWidth
                            onPress={handleRegister}
                            disabled={isLoading}
                            loading={isLoading}
                        />

                        {/* Login Link */}
                        <Pressable
                            style={styles.loginLink}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Typography variant="body" color={colors.textSecondary}>
                                Zaten hesabın var mı?{' '}
                            </Typography>
                            <Typography variant="body" color={colors.primary} style={{ fontWeight: '600' }}>
                                Giriş Yap
                            </Typography>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: layout.screenPaddingHorizontal,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: layout.radiusMedium,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing[4],
    },
    header: {
        alignItems: 'center',
        gap: spacing[3],
        marginBottom: spacing[6],
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primaryMuted,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing[2],
    },
    form: {
        gap: spacing[4],
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: layout.radiusMedium,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing[4],
    },
    inputIcon: {
        marginRight: spacing[3],
    },
    input: {
        flex: 1,
        paddingVertical: spacing[4],
        fontSize: 16,
        color: colors.textPrimary,
        ...Platform.select({
            web: { outlineStyle: 'none' } as any,
        }),
    },
    eyeButton: {
        padding: spacing[2],
    },
    errorContainer: {
        backgroundColor: colors.error + '15',
        padding: spacing[3],
        borderRadius: layout.radiusMedium,
        borderWidth: 1,
        borderColor: colors.error + '30',
    },
    loginLink: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: spacing[2],
    },
});
