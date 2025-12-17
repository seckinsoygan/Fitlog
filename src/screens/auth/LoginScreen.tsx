// FitLog - Login Screen
import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, Eye, EyeOff, Dumbbell } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { layout, spacing } from '../../theme/spacing';
import { Typography, H1, Button } from '../../components/atoms';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store';

export const LoginScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const colors = useThemeStore((state) => state.colors);
    const { signIn, isLoading, error, clearError } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');

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
                            <Dumbbell size={48} color={colors.primary} />
                        </View>
                        <H1 style={{ textAlign: 'center' }}>FitLog'a Hoş Geldin</H1>
                        <Typography variant="body" color={colors.textSecondary} style={{ textAlign: 'center' }}>
                            Antrenmanlarını takip et, hedeflerine ulaş
                        </Typography>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
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
                                placeholder="Şifre"
                                placeholderTextColor={colors.textMuted}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                autoComplete="password"
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
                        <Button
                            title={isLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}
                            variant="primary"
                            fullWidth
                            onPress={handleLogin}
                            disabled={isLoading}
                            loading={isLoading}
                        />

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Typography variant="caption" color={colors.textMuted} style={styles.dividerText}>
                                veya
                            </Typography>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Register Link */}
                        <Pressable
                            style={styles.registerLink}
                            onPress={() => navigation.navigate('Register')}
                        >
                            <Typography variant="body" color={colors.textSecondary}>
                                Hesabın yok mu?{' '}
                            </Typography>
                            <Typography variant="body" color={colors.primary} style={{ fontWeight: '600' }}>
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
        gap: spacing[3],
        marginBottom: spacing[8],
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
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
    forgotPassword: {
        alignSelf: 'flex-end',
    },
    errorContainer: {
        backgroundColor: colors.error + '15',
        padding: spacing[3],
        borderRadius: layout.radiusMedium,
        borderWidth: 1,
        borderColor: colors.error + '30',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing[2],
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
    },
    dividerText: {
        paddingHorizontal: spacing[4],
    },
    registerLink: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: spacing[2],
    },
});
