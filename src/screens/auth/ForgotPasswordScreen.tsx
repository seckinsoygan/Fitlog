// FitLog - Forgot Password Screen
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
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { layout, spacing } from '../../theme/spacing';
import { Typography, H1, Button } from '../../components/atoms';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store';

export const ForgotPasswordScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const colors = useThemeStore((state) => state.colors);
    const { resetPassword, isLoading, error, clearError } = useAuthStore();

    const [email, setEmail] = useState('');
    const [localError, setLocalError] = useState('');
    const [emailSent, setEmailSent] = useState(false);

    const handleResetPassword = async () => {
        setLocalError('');
        clearError();

        if (!email.trim()) {
            setLocalError('E-posta adresi gerekli');
            return;
        }

        try {
            await resetPassword(email.trim());
            setEmailSent(true);
        } catch (err: any) {
            // Error is handled by the store
        }
    };

    const styles = createStyles(colors);
    const displayError = localError || error;

    if (emailSent) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.successContent}>
                    <View style={styles.successIcon}>
                        <CheckCircle size={64} color={colors.success} />
                    </View>
                    <H1 style={{ textAlign: 'center' }}>E-posta Gönderildi</H1>
                    <Typography variant="body" color={colors.textSecondary} style={{ textAlign: 'center' }}>
                        Şifre sıfırlama bağlantısı {email} adresine gönderildi. Lütfen gelen kutunuzu kontrol edin.
                    </Typography>
                    <Button
                        title="Giriş Sayfasına Dön"
                        variant="primary"
                        fullWidth
                        onPress={() => navigation.navigate('Login')}
                    />
                </View>
            </SafeAreaView>
        );
    }

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
                        <H1 style={{ textAlign: 'center' }}>Şifremi Unuttum</H1>
                        <Typography variant="body" color={colors.textSecondary} style={{ textAlign: 'center' }}>
                            E-posta adresini gir, şifre sıfırlama bağlantısı gönderelim
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

                        {/* Error Message */}
                        {displayError && (
                            <View style={styles.errorContainer}>
                                <Typography variant="caption" color={colors.error}>
                                    {displayError}
                                </Typography>
                            </View>
                        )}

                        {/* Reset Button */}
                        <Button
                            title={isLoading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
                            variant="primary"
                            fullWidth
                            onPress={handleResetPassword}
                            disabled={isLoading}
                            loading={isLoading}
                        />

                        {/* Back to Login */}
                        <Pressable
                            style={styles.loginLink}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Typography variant="body" color={colors.primary}>
                                ← Giriş sayfasına dön
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
    errorContainer: {
        backgroundColor: colors.error + '15',
        padding: spacing[3],
        borderRadius: layout.radiusMedium,
        borderWidth: 1,
        borderColor: colors.error + '30',
    },
    loginLink: {
        alignItems: 'center',
        paddingVertical: spacing[2],
    },
    successContent: {
        flex: 1,
        justifyContent: 'center',
        padding: layout.screenPaddingHorizontal,
        gap: spacing[4],
    },
    successIcon: {
        alignSelf: 'center',
        marginBottom: spacing[2],
    },
});
