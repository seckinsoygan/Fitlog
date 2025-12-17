// FitLog - Header Component
import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, MoreVertical } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { layout, spacing } from '../../theme/spacing';
import { Typography } from '../atoms';

interface HeaderProps {
    title: string;
    subtitle?: string;
    onBack?: () => void;
    onMore?: () => void;
    rightComponent?: React.ReactNode;
    showTimer?: boolean;
    timerValue?: string;
}

export const Header: React.FC<HeaderProps> = ({
    title,
    subtitle,
    onBack,
    onMore,
    rightComponent,
    showTimer,
    timerValue,
}) => {
    const insets = useSafeAreaInsets();

    const handleBackPress = () => {
        console.log('Back button pressed');
        if (onBack) {
            onBack();
        }
    };

    return (
        <View style={[styles.container, { paddingTop: Platform.OS === 'web' ? spacing[4] : insets.top + spacing[2] }]}>
            <View style={styles.leftSection}>
                {onBack && (
                    <Pressable
                        style={styles.iconButton}
                        onPress={handleBackPress}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <ArrowLeft size={24} color={colors.textPrimary} />
                    </Pressable>
                )}
                <View style={styles.titleContainer}>
                    <Typography variant="h2" numberOfLines={1}>
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography variant="caption" numberOfLines={1}>
                            {subtitle}
                        </Typography>
                    )}
                </View>
            </View>

            <View style={styles.rightSection}>
                {showTimer && timerValue && (
                    <View style={styles.timerContainer}>
                        <Typography variant="data" color={colors.primary}>
                            {timerValue}
                        </Typography>
                    </View>
                )}
                {rightComponent}
                {onMore && (
                    <Pressable
                        style={styles.iconButton}
                        onPress={onMore}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <MoreVertical size={24} color={colors.textSecondary} />
                    </Pressable>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: layout.screenPaddingHorizontal,
        paddingBottom: spacing[3],
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: spacing[3],
    },
    titleContainer: {
        flex: 1,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
    },
    iconButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: layout.radiusMedium,
        backgroundColor: colors.surface,
        cursor: 'pointer',
    },
    timerContainer: {
        backgroundColor: colors.surface,
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[2],
        borderRadius: layout.radiusMedium,
        borderWidth: 1,
        borderColor: colors.primary + '40',
    },
});
