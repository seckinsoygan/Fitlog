// FitLog - App Navigator with Onboarding, Auth & Training Style Flow
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Calendar, Flame, Dumbbell, Settings, ClipboardList, TrendingUp } from 'lucide-react-native';
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
    ProgressScreen,
    AchievementsScreen,
} from '../screens';
import { useThemeStore, useAuthStore, useOnboardingStore, useUserStore } from '../store';
import { Typography } from '../components/atoms';
import { useTranslation } from '../i18n';

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
    Achievements: undefined;
};

export type TabParamList = {
    Home: undefined;
    Templates: undefined;
    Progress: undefined;
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
    const { t } = useTranslation();

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
                    tabBarLabel: t.tabs.home,
                    tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Templates"
                component={TemplatesScreen}
                options={{
                    tabBarLabel: t.tabs.templates,
                    tabBarIcon: ({ color, size }) => <ClipboardList size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Progress"
                component={ProgressScreen}
                options={{
                    tabBarLabel: t.tabs.progress,
                    tabBarIcon: ({ color, size }) => <TrendingUp size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Nutrition"
                component={NutritionScreen}
                options={{
                    tabBarLabel: t.tabs.nutrition,
                    tabBarIcon: ({ color, size }) => <Flame size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Exercises"
                component={ExercisesScreen}
                options={{
                    tabBarLabel: t.tabs.exercises,
                    tabBarIcon: ({ color, size }) => <Dumbbell size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    tabBarLabel: t.tabs.settings,
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
            <Stack.Screen
                name="Achievements"
                component={AchievementsScreen}
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
    const { loadFromFirebase } = useUserStore();

    // Initialize auth listener
    useEffect(() => {
        const unsubscribe = initialize();
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    // Load data from Firestore when user logs in
    useEffect(() => {
        if (user && isInitialized) {
            console.log('User logged in, loading data from Firebase...');

            // Load templates
            loadFromFirebase().then((success) => {
                if (success) {
                    console.log('✅ User templates loaded from Firebase');
                } else {
                    console.log('⚠️ No templates found or failed to load');
                }
            });

            // Load workout history
            import('../store/workoutHistoryStore').then(({ useWorkoutHistoryStore }) => {
                const { loadWorkoutHistory } = useWorkoutHistoryStore.getState();
                loadWorkoutHistory().then(() => {
                    console.log('✅ Workout history loaded from Firebase');
                });
            });

            // Load weekly programs
            import('../store/weeklyProgramStore').then(({ useWeeklyProgramStore }) => {
                const { loadPrograms } = useWeeklyProgramStore.getState();
                loadPrograms().then(() => {
                    console.log('✅ Weekly programs loaded from Firebase');
                });
            });

            // Load nutrition data
            import('../store/nutritionStore').then(({ useNutritionStore }) => {
                const { loadFromFirestore } = useNutritionStore.getState();
                loadFromFirestore().then(() => {
                    console.log('✅ Nutrition data loaded from Firebase');
                });
            });

            // Load water data
            import('../store/waterStore').then(({ useWaterStore }) => {
                const { loadFromFirestore } = useWaterStore.getState();
                loadFromFirestore().then(() => {
                    console.log('✅ Water data loaded from Firebase');
                });
            });
        }
    }, [user, isInitialized]);

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
