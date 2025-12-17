// FitLog - Typography Component with Dynamic Theme
import React from 'react';
import { Text, TextStyle } from 'react-native';
import { typography as typographyStyles } from '../../theme';
import { useThemeStore } from '../../store/themeStore';

type TypographyVariant = keyof typeof typographyStyles;

interface TypographyProps {
    variant?: TypographyVariant;
    color?: string;
    style?: TextStyle | TextStyle[];
    children: React.ReactNode;
    numberOfLines?: number;
}

export const Typography: React.FC<TypographyProps> = ({
    variant = 'body',
    color,
    style,
    children,
    numberOfLines,
}) => {
    // Get colors from store directly  
    const colors = useThemeStore((state) => state.colors);
    const baseStyle = typographyStyles[variant];

    // Get default color from theme if not specified
    const textColor = color ?? colors.textPrimary;

    return (
        <Text
            style={[
                baseStyle,
                { color: textColor },
                style,
            ]}
            numberOfLines={numberOfLines}
        >
            {children}
        </Text>
    );
};

// Convenience components for common typography
export const H1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
    <Typography variant="h1" {...props} />
);

export const H2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
    <Typography variant="h2" {...props} />
);

export const H3: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
    <Typography variant="h3" {...props} />
);

export const Body: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
    <Typography variant="body" {...props} />
);

export const Caption: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
    <Typography variant="caption" {...props} />
);

export const DataText: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
    <Typography variant="data" {...props} />
);

export const Label: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
    <Typography variant="label" {...props} />
);
