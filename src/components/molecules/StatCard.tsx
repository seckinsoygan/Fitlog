// FitLog - StatCard Component
import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { colors } from '../../theme/colors';
import { layout, spacing } from '../../theme/spacing';
import { Typography } from '../atoms';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ReactNode;
    variant?: 'default' | 'primary' | 'success';
    onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    subtitle,
    icon,
    variant = 'default',
    onPress,
}) => {
    const getContainerStyle = () => {
        switch (variant) {
            case 'primary':
                return [styles.container, styles.primaryContainer];
            case 'success':
                return [styles.container, styles.successContainer];
            default:
                return [styles.container];
        }
    };

    const getValueColor = () => {
        switch (variant) {
            case 'primary':
                return colors.primary;
            case 'success':
                return colors.success;
            default:
                return colors.textPrimary;
        }
    };

    const Wrapper = onPress ? Pressable : View;

    return (
        <Wrapper
            style={({ pressed }: any) => [
                ...getContainerStyle(),
                pressed && styles.pressed,
            ]}
            onPress={onPress}
        >
            <View style={styles.header}>
                <Typography variant="label">{title}</Typography>
                {icon && <View style={styles.iconContainer}>{icon}</View>}
            </View>
            <Typography variant="dataLarge" color={getValueColor()}>
                {value}
            </Typography>
            {subtitle && (
                <Typography variant="caption" style={styles.subtitle}>
                    {subtitle}
                </Typography>
            )}
        </Wrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        borderRadius: layout.radiusLarge,
        padding: layout.cardPadding,
        minWidth: 100,
        borderWidth: 1,
        borderColor: colors.border,
    },
    primaryContainer: {
        borderColor: colors.primary + '40',
        backgroundColor: colors.primaryMuted,
    },
    successContainer: {
        borderColor: colors.success + '40',
    },
    pressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[2],
    },
    iconContainer: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    subtitle: {
        marginTop: spacing[1],
    },
});
