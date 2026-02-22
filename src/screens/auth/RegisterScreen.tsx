// FitLog - Register Screen (Theme Compatible)
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
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft, Check } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { layout, spacing } from '../../theme/spacing';
import { Typography, H1 } from '../../components/atoms';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store';
import { GoogleIcon } from '../../components/icons/SocialIcons';
import Svg, { Path } from 'react-native-svg';

// Apple Logo Icon Component
const AppleIcon = ({ size = 20, color = '#FFFFFF' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </Svg>
);

export const RegisterScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const colors = useThemeStore((state) => state.colors);
    const { signUp, signInWithGoogle, signInWithApple, isLoading, error, clearError } = useAuthStore();

    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');
    const [focusedInput, setFocusedInput] = useState<string | null>(null);
    const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);

    const hasMinLength = password.length >= 6;
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

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
        if (!hasMinLength) {
            setLocalError('Şifre en az 6 karakter olmalı');
            return;
        }
        if (!passwordsMatch) {
            setLocalError('Şifreler eşleşmiyor');
            return;
        }

        try {
            await signUp(email.trim(), password, displayName.trim());
        } catch (err: any) {
            // Error is handled by the store
        }
    };

    const handleGoogleSignIn = async () => {
        setLocalError('');
        clearError();
        setSocialLoading('google');
        try {
            await signInWithGoogle();
        } catch (err: any) {
            // Error is handled by the store
        } finally {
            setSocialLoading(null);
        }
    };

    const handleAppleSignIn = async () => {
        setLocalError('');
        clearError();
        setSocialLoading('apple');
        try {
            await signInWithApple();
        } catch (err: any) {
            // Error is handled by the store
        } finally {
            setSocialLoading(null);
        }
    };

    const styles = createStyles(colors);
    const displayError = localError || error;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft size={24} color={colors.textPrimary} />
                </Pressable>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Title */}
                    <View style={styles.titleContainer}>
                        <H1>Hesap Oluştur</H1>
                        <Typography variant="body" color={colors.textSecondary}>
                            Fitness yolculuğuna başla
                        </Typography>
                    </View>

                    {/* Form Card */}
                    <View style={styles.formCard}>
                        {/* Name Input */}
                        <View style={styles.inputGroup}>
                            <Typography variant="label" color={colors.textSecondary}>
                                İSİM
                            </Typography>
                            <View style={[
                                styles.inputContainer,
                                focusedInput === 'name' && styles.inputFocused
                            ]}>
                                <User size={20} color={focusedInput === 'name' ? colors.primary : colors.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Adınız"
                                    placeholderTextColor={colors.textMuted}
                                    value={displayName}
                                    onChangeText={setDisplayName}
                                    autoCapitalize="words"
                                    onFocus={() => setFocusedInput('name')}
                                    onBlur={() => setFocusedInput(null)}
                                />
                            </View>
                        </View>

                        {/* Email Input */}
                        <View style={styles.inputGroup}>
                            <Typography variant="label" color={colors.textSecondary}>
                                E-POSTA
                            </Typography>
                            <View style={[
                                styles.inputContainer,
                                focusedInput === 'email' && styles.inputFocused
                            ]}>
                                <Mail size={20} color={focusedInput === 'email' ? colors.primary : colors.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="ornek@email.com"
                                    placeholderTextColor={colors.textMuted}
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    autoComplete="email"
                                    onFocus={() => setFocusedInput('email')}
                                    onBlur={() => setFocusedInput(null)}
                                />
                            </View>
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputGroup}>
                            <Typography variant="label" color={colors.textSecondary}>
                                ŞİFRE
                            </Typography>
                            <View style={[
                                styles.inputContainer,
                                focusedInput === 'password' && styles.inputFocused
                            ]}>
                                <Lock size={20} color={focusedInput === 'password' ? colors.primary : colors.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="En az 6 karakter"
                                    placeholderTextColor={colors.textMuted}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    onFocus={() => setFocusedInput('password')}
                                    onBlur={() => setFocusedInput(null)}
                                />
                                <Pressable onPress={() => setShowPassword(!showPassword)}>
                                    {showPassword ? (
                                        <EyeOff size={20} color={colors.textMuted} />
                                    ) : (
                                        <Eye size={20} color={colors.textMuted} />
                                    )}
                                </Pressable>
                            </View>
                            {password.length > 0 && (
                                <View style={styles.passwordHint}>
                                    <View style={[styles.hintDot, hasMinLength && styles.hintDotActive]} />
                                    <Typography variant="caption" color={hasMinLength ? colors.success : colors.textMuted}>
                                        En az 6 karakter
                                    </Typography>
                                </View>
                            )}
                        </View>

                        {/* Confirm Password Input */}
                        <View style={styles.inputGroup}>
                            <Typography variant="label" color={colors.textSecondary}>
                                ŞİFRE TEKRAR
                            </Typography>
                            <View style={[
                                styles.inputContainer,
                                focusedInput === 'confirm' && styles.inputFocused
                            ]}>
                                <Lock size={20} color={focusedInput === 'confirm' ? colors.primary : colors.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Şifrenizi tekrarlayın"
                                    placeholderTextColor={colors.textMuted}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showPassword}
                                    onFocus={() => setFocusedInput('confirm')}
                                    onBlur={() => setFocusedInput(null)}
                                />
                                {passwordsMatch && (
                                    <Check size={20} color={colors.success} />
                                )}
                            </View>
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
                        <Pressable
                            style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                            onPress={handleRegister}
                            disabled={isLoading}
                        >
                            <Typography variant="body" color={colors.textOnPrimary} style={{ fontWeight: '700' }}>
                                {isLoading ? "Kayıt Yapılıyor..." : "Kayıt Ol"}
                            </Typography>
                        </Pressable>

                        {/* Terms */}
                        <Typography variant="caption" color={colors.textMuted} style={styles.terms}>
                            Kayıt olarak Kullanım Koşulları ve Gizlilik Politikası'nı kabul etmiş olursunuz.
                        </Typography>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Typography variant="caption" color={colors.textMuted}>
                                veya
                            </Typography>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social Buttons */}
                        <View style={styles.socialButtons}>
                            <Pressable
                                style={[styles.socialButton, socialLoading === 'google' && styles.buttonDisabled]}
                                onPress={handleGoogleSignIn}
                                disabled={socialLoading !== null || isLoading}
                            >
                                <GoogleIcon size={20} />
                                <Typography variant="body">
                                    {socialLoading === 'google' ? 'Giriş yapılıyor...' : 'Google ile devam et'}
                                </Typography>
                            </Pressable>
                        </View>

                        {/* Apple Sign-In Button */}
                        <Pressable
                            style={[styles.socialButton, styles.appleButton, socialLoading === 'apple' && styles.buttonDisabled]}
                            onPress={handleAppleSignIn}
                            disabled={socialLoading !== null || isLoading}
                        >
                            <AppleIcon size={20} color="#FFFFFF" />
                            <Typography variant="body" color="#FFFFFF">
                                {socialLoading === 'apple' ? 'Giriş yapılıyor...' : 'Apple ile devam et'}
                            </Typography>
                        </Pressable>
                    </View>

                    {/* Login Link */}
                    <View style={styles.loginContainer}>
                        <Typography variant="body" color={colors.textSecondary}>
                            Zaten hesabın var mı?{' '}
                        </Typography>
                        <Pressable onPress={() => navigation.goBack()}>
                            <Typography variant="body" color={colors.primary} style={{ fontWeight: '700' }}>
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
    header: {
        paddingHorizontal: layout.screenPaddingHorizontal,
        paddingVertical: spacing[2],
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: layout.radiusMedium,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: layout.screenPaddingHorizontal,
    },
    titleContainer: {
        gap: spacing[1],
        marginBottom: spacing[5],
    },
    formCard: {
        backgroundColor: colors.surface,
        borderRadius: layout.radiusLarge,
        padding: spacing[5],
        gap: spacing[4],
        borderWidth: 1,
        borderColor: colors.border,
    },
    inputGroup: {
        gap: spacing[2],
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: layout.radiusMedium,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing[3],
        gap: spacing[3],
    },
    inputFocused: {
        borderColor: colors.primary,
    },
    input: {
        flex: 1,
        paddingVertical: spacing[3],
        fontSize: 16,
        color: colors.textPrimary,
        ...Platform.select({
            web: { outlineStyle: 'none' } as any,
        }),
    },
    passwordHint: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
    },
    hintDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.border,
    },
    hintDotActive: {
        backgroundColor: colors.success,
    },
    errorContainer: {
        backgroundColor: colors.error + '15',
        padding: spacing[3],
        borderRadius: layout.radiusMedium,
        borderWidth: 1,
        borderColor: colors.error + '30',
    },
    primaryButton: {
        backgroundColor: colors.primary,
        borderRadius: layout.radiusMedium,
        paddingVertical: spacing[4],
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    terms: {
        textAlign: 'center',
        lineHeight: 18,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: spacing[5],
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
    },
    socialButtons: {
        flexDirection: 'row',
        gap: spacing[3],
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[2],
        paddingVertical: spacing[3],
        borderRadius: layout.radiusMedium,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
    },
    appleButton: {
        backgroundColor: '#000',
        borderColor: '#000',
    },
});
