// FitLog - Login Screen (Theme Compatible)
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
import { Mail, Lock, Eye, EyeOff, Dumbbell, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { layout, spacing } from '../../theme/spacing';
import { Typography, H1, Button } from '../../components/atoms';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store';
import { GoogleIcon, AppleIcon } from '../../components/icons/SocialIcons';

export const LoginScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const colors = useThemeStore((state) => state.colors);
    const { signIn, signInWithGoogle, signInWithApple, isLoading, error, clearError } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');
    const [focusedInput, setFocusedInput] = useState<string | null>(null);
    const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);

    const handleLogin = async () => {
        setLocalError('');
        clearError();

        if (!email.trim()) {
            setLocalError('E-posta adresi gerekli');
            return;
        }
        if (!password) {
            setLocalError('Şifre gerekli');
            return;
        }

        try {
            await signIn(email.trim(), password);
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
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Logo & Title */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Dumbbell size={40} color={colors.primary} />
                        </View>
                        <H1>FitLog</H1>
                        <Typography variant="body" color={colors.textSecondary}>
                            Hesabına giriş yap
                        </Typography>
                    </View>

                    {/* Form Card */}
                    <View style={styles.formCard}>
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
                                    placeholder="••••••••"
                                    placeholderTextColor={colors.textMuted}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoComplete="password"
                                    onFocus={() => setFocusedInput('password')}
                                    onBlur={() => setFocusedInput(null)}
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
                        </View>

                        {/* Forgot Password */}
                        <Pressable
                            style={styles.forgotPassword}
                            onPress={() => navigation.navigate('ForgotPassword')}
                        >
                            <Typography variant="caption" color={colors.primary}>
                                Şifremi Unuttum
                            </Typography>
                        </Pressable>

                        {/* Error Message */}
                        {displayError && (
                            <View style={styles.errorContainer}>
                                <Typography variant="caption" color={colors.error}>
                                    {displayError}
                                </Typography>
                            </View>
                        )}

                        {/* Login Button */}
                        <Pressable
                            style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            <Typography variant="body" color={colors.textOnPrimary} style={{ fontWeight: '700' }}>
                                {isLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}
                            </Typography>
                            {!isLoading && <ChevronRight size={20} color={colors.textOnPrimary} />}
                        </Pressable>

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
                                disabled={socialLoading !== null}
                            >
                                <GoogleIcon size={20} />
                                <Typography variant="body">
                                    {socialLoading === 'google' ? 'Giriş...' : 'Google'}
                                </Typography>
                            </Pressable>
                            <Pressable
                                style={[styles.socialButton, styles.appleButton, socialLoading === 'apple' && styles.buttonDisabled]}
                                onPress={handleAppleSignIn}
                                disabled={socialLoading !== null}
                            >
                                <AppleIcon size={20} />
                                <Typography variant="body" color="#fff">
                                    {socialLoading === 'apple' ? 'Giriş...' : 'Apple'}
                                </Typography>
                            </Pressable>
                        </View>
                    </View>

                    {/* Register Link */}
                    <View style={styles.registerContainer}>
                        <Typography variant="body" color={colors.textSecondary}>
                            Hesabın yok mu?{' '}
                        </Typography>
                        <Pressable onPress={() => navigation.navigate('Register')}>
                            <Typography variant="body" color={colors.primary} style={{ fontWeight: '700' }}>
                                Kayıt Ol
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
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        gap: spacing[2],
        marginBottom: spacing[6],
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: colors.primaryMuted,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing[2],
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
    eyeButton: {
        padding: spacing[1],
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: -spacing[2],
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[2],
    },
    buttonDisabled: {
        opacity: 0.6,
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
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: spacing[5],
    },
});
