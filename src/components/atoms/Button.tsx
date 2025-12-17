// FitLog - Button Component with Dynamic Theme
import React from 'react';
import {
    Pressable,
    Text,
    ViewStyle,
    TextStyle,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { typography } from '../../theme/typography';
import { layout } from '../../theme/spacing';
import { useThemeStore } from '../../store/themeStore';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    style?: ViewStyle;
    fullWidth?: boolean;
}

const sizeStyles: Record<ButtonSize, ViewStyle> = {
    sm: { paddingVertical: 10, paddingHorizontal: 14, minHeight: 36 },
    md: { paddingVertical: layout.buttonPaddingVertical, paddingHorizontal: layout.buttonPaddingHorizontal, minHeight: 44 },
    lg: { paddingVertical: 16, paddingHorizontal: 24, minHeight: 52 },
};

const textSizeStyles: Record<ButtonSize, { fontSize: number }> = {
    sm: { fontSize: 13 },
    md: { fontSize: 15 },
    lg: { fontSize: 17 },
};

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    icon,
    style,
    fullWidth = false,
}) => {
    const colors = useThemeStore((state) => state.colors);

    const handlePress = () => {
        if (!disabled && !loading) {
            onPress();
        }
    };

    const getButtonStyle = (): ViewStyle => {
        const baseStyle: ViewStyle = {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: layout.radiusMedium,
            ...sizeStyles[size],
            ...Platform.select({
                web: { cursor: disabled ? 'not-allowed' : 'pointer', userSelect: 'none' } as any,
            }),
        };

        if (fullWidth) baseStyle.width = '100%';

        if (disabled) {
            return { ...baseStyle, backgroundColor: colors.secondary, opacity: 0.5 };
        }

        switch (variant) {
            case 'primary':
                return { ...baseStyle, backgroundColor: colors.primary };
            case 'secondary':
                return { ...baseStyle, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border };
            case 'ghost':
                return { ...baseStyle, backgroundColor: 'transparent' };
            case 'danger':
                return { ...baseStyle, backgroundColor: colors.error };
            default:
                return baseStyle;
        }
    };

    const getTextStyle = (): TextStyle => {
        const textSize = textSizeStyles[size];

        if (disabled) {
            return { ...typography.button, ...textSize, color: colors.textMuted };
        }

        switch (variant) {
            case 'primary':
                return { ...typography.button, ...textSize, color: colors.textOnPrimary };
            case 'secondary':
                return { ...typography.button, ...textSize, color: colors.textPrimary };
            case 'ghost':
                return { ...typography.button, ...textSize, color: colors.primary };
            case 'danger':
                return { ...typography.button, ...textSize, color: colors.textOnPrimary };
            default:
                return { ...typography.button, ...textSize, color: colors.textPrimary };
        }
    };

    return (
        <Pressable
            onPress={handlePress}
            disabled={disabled || loading}
            style={({ pressed }) => [
                getButtonStyle(),
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
                style,
            ]}
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'primary' ? colors.textOnPrimary : colors.primary}
                    size="small"
                />
            ) : (
                <>
                    {icon && <>{icon}</>}
                    <Text style={[getTextStyle(), icon ? { marginLeft: 8 } : undefined]}>
                        {title}
                    </Text>
                </>
            )}
        </Pressable>
    );
};
