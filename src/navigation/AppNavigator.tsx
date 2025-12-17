// FitLog - App Navigator with Onboarding, Auth & Training Style Flow
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Calendar, Flame, Dumbbell, Settings, ClipboardList } from 'lucide-react-native';
import {
    DashboardScreen,
    ActiveWorkoutScreen,
    HistoryScreen,
    ExercisesScreen,
    ExerciseDetailScreen,
    SettingsScreen,
    WeeklyProgramScreen,
    NutritionScreen,
    TemplatesScreen,
    TemplateEditorScreen,
    ProfileEditScreen,
    LoginScreen,
    RegisterScreen,
    ForgotPasswordScreen,
    OnboardingScreen,
    TrainingStyleScreen,
} from '../screens';
import { useThemeStore, useAuthStore, useOnboardingStore } from '../store';
import { Typography } from '../components/atoms';

// Type definitions
export type RootStackParamList = {
    // Onboarding
    Onboarding: undefined;
    // Auth screens
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
    // Training style
    TrainingStyle: undefined;
    // App screens
    MainTabs: undefined;
    ActiveWorkout: { templateId?: string } | undefined;
    ExerciseDetail: { exerciseId: string };
    TemplateEditor: { templateId?: string; isNew?: boolean };
    ProfileEdit: undefined;
};

export type TabParamList = {
    Home: undefined;
    Templates: undefined;
    Program: undefined;
    Nutrition: undefined;
    Exercises: { selectMode?: boolean } | undefined;
    Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Loading Screen
const LoadingScreen: React.FC = () => {
    const colors = useThemeStore((state) => state.colors);
    return (
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Typography variant="body" color={colors.textSecondary} style={{ marginTop: 16 }}>
                Yükleniyor...
            </Typography>
        </View>
    );
};

// Tab Navigator Component
const TabNavigator: React.FC = () => {
    const colors = useThemeStore((state) => state.colors);

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                    height: 85,
                    paddingTop: 8,
                    paddingBottom: 28,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarLabelStyle: {
                    fontSize: 9,
                    fontWeight: '500',
                },
                tabBarItemStyle: {
                    gap: 2,
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={DashboardScreen}
                options={{
                    tabBarLabel: 'Ana Sayfa',
                    tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Templates"
                component={TemplatesScreen}
                options={{
                    tabBarLabel: 'Programlar',
                    tabBarIcon: ({ color, size }) => <ClipboardList size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Program"
                component={WeeklyProgramScreen}
                options={{
                    tabBarLabel: 'Haftalık',
                    tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Nutrition"
                component={NutritionScreen}
                options={{
                    tabBarLabel: 'Beslenme',
                    tabBarIcon: ({ color, size }) => <Flame size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Exercises"
                component={ExercisesScreen}
                options={{
                    tabBarLabel: 'Hareketler',
                    tabBarIcon: ({ color, size }) => <Dumbbell size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    tabBarLabel: 'Ayarlar',
                    tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
                }}
            />
        </Tab.Navigator>
    );
};

// Onboarding Navigator
const OnboardingNavigator: React.FC = () => {
    const colors = useThemeStore((state) => state.colors);

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
                animation: 'fade',
            }}
        >
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        </Stack.Navigator>
    );
};

// Auth Navigator
const AuthNavigator: React.FC = () => {
    const colors = useThemeStore((state) => state.colors);

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
                animation: 'fade',
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </Stack.Navigator>
    );
};

// Training Style Navigator (shown after login, before main app)
const TrainingStyleNavigator: React.FC = () => {
    const colors = useThemeStore((state) => state.colors);

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="TrainingStyle" component={TrainingStyleScreen} />
        </Stack.Navigator>
    );
};

// App Navigator (after login and training style selection)
const AppNavigatorStack: React.FC = () => {
    const colors = useThemeStore((state) => state.colors);

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen
                name="ActiveWorkout"
                component={ActiveWorkoutScreen}
                options={{
                    animation: 'slide_from_bottom',
                    gestureEnabled: false,
                }}
            />
            <Stack.Screen
                name="ExerciseDetail"
                component={ExerciseDetailScreen}
                options={{
                    animation: 'slide_from_right',
                }}
            />
            <Stack.Screen
                name="TemplateEditor"
                component={TemplateEditorScreen}
                options={{
                    animation: 'slide_from_right',
                }}
            />
            <Stack.Screen
                name="ProfileEdit"
                component={ProfileEditScreen}
                options={{
                    animation: 'slide_from_right',
                }}
            />
        </Stack.Navigator>
    );
};

// Main Navigator with complete flow
export const AppNavigator: React.FC = () => {
    const mode = useThemeStore((state) => state.mode);
    const colors = useThemeStore((state) => state.colors);
    const { user, isInitialized, initialize } = useAuthStore();
    const { hasCompletedOnboarding, hasSelectedTrainingStyle } = useOnboardingStore();

    // Initialize auth listener
    useEffect(() => {
        const unsubscribe = initialize();
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const navigationTheme = mode === 'dark' ? {
        ...DarkTheme,
        colors: {
            ...DarkTheme.colors,
            primary: colors.primary,
            background: colors.background,
            card: colors.surface,
            text: colors.textPrimary,
            border: colors.border,
        },
    } : {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            primary: colors.primary,
            background: colors.background,
            card: colors.surface,
            text: colors.textPrimary,
            border: colors.border,
        },
    };

    // Show loading while checking auth state
    if (!isInitialized) {
        return <LoadingScreen />;
    }

    // Determine which navigator to show
    const getNavigator = () => {
        // Step 1: Show onboarding if not completed
        if (!hasCompletedOnboarding) {
            return <OnboardingNavigator />;
        }

        // Step 2: Show auth if not logged in
        if (!user) {
            return <AuthNavigator />;
        }

        // Step 3: Show training style selection if not selected
        if (!hasSelectedTrainingStyle) {
            return <TrainingStyleNavigator />;
        }

        // Step 4: Show main app
        return <AppNavigatorStack />;
    };

    return (
        <NavigationContainer theme={navigationTheme}>
            {getNavigator()}
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
