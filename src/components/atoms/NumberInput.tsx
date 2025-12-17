// FitLog - NumberInput Component (Optimized for workout data entry)
import React, { useState, useCallback } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    ViewStyle,
    Platform,
} from 'react-native';
import { colors } from '../../theme/colors';
import { layout, spacing } from '../../theme/spacing';
import { Typography } from './Typography';

interface NumberInputProps {
    label?: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    unit?: string;
    style?: ViewStyle;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    ghostValue?: string; // Önceki antrenmandan gelen hayalet veri
}

export const NumberInput: React.FC<NumberInputProps> = ({
    label,
    value,
    onChangeText,
    placeholder,
    unit,
    style,
    size = 'md',
    disabled = false,
    ghostValue,
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = useCallback(() => setIsFocused(true), []);
    const handleBlur = useCallback(() => setIsFocused(false), []);

    // Filter to only allow numbers and decimal point
    const handleChange = useCallback((text: string) => {
        // Remove any non-numeric characters except decimal point
        const filtered = text.replace(/[^0-9.]/g, '');
        onChangeText(filtered);
    }, [onChangeText]);

    const displayPlaceholder = ghostValue || placeholder || '';

    return (
        <View style={[styles.container, style]}>
            {label && (
                <Typography variant="label" style={styles.label}>
                    {label}
                </Typography>
            )}
            <View
                style={[
                    styles.inputWrapper,
                    sizeStyles[size],
                    isFocused && styles.focused,
                    disabled && styles.disabled,
                ]}
            >
                <TextInput
                    style={[styles.input, inputSizeStyles[size]]}
                    value={value}
                    onChangeText={handleChange}
                    placeholder={displayPlaceholder}
                    placeholderTextColor={ghostValue ? colors.primary + '80' : colors.textMuted}
                    keyboardType="numeric"
                    returnKeyType="done"
                    editable={!disabled}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    selectTextOnFocus
                    // Web specific props
                    {...(Platform.OS === 'web' ? {
                        inputMode: 'numeric',
                        pattern: '[0-9]*',
                    } : {})}
                />
                {unit && (
                    <Typography
                        variant="caption"
                        color={colors.textSecondary}
                        style={styles.unit}
                    >
                        {unit}
                    </Typography>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
    },
    label: {
        marginBottom: spacing[1],
        textAlign: 'center',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
        borderRadius: layout.radiusSmall,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing[2],
    },
    focused: {
        borderColor: colors.primary,
        backgroundColor: colors.surface,
    },
    disabled: {
        opacity: 0.5,
    },
    input: {
        flex: 1,
        color: colors.textPrimary,
        textAlign: 'center',
        fontWeight: '600',
        padding: 0,
        margin: 0,
        ...Platform.select({
            web: {
                outlineStyle: 'none',
                outlineWidth: 0,
            },
        }),
    },
    unit: {
        marginLeft: spacing[1],
    },
});

const sizeStyles: Record<'sm' | 'md' | 'lg', ViewStyle> = {
    sm: {
        height: 36,
        minWidth: 60,
    },
    md: {
        height: 44,
        minWidth: 70,
    },
    lg: {
        height: 52,
        minWidth: 90,
    },
};

const inputSizeStyles: Record<'sm' | 'md' | 'lg', { fontSize: number; height: number }> = {
    sm: { fontSize: 14, height: 34 },
    md: { fontSize: 16, height: 42 },
    lg: { fontSize: 18, height: 50 },
};
