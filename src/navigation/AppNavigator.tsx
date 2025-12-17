// FitLog - App Navigator with Dynamic Theme
import React from 'react';
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
} from '../screens';
import { useThemeStore } from '../store';

// Type definitions
export type RootStackParamList = {
    MainTabs: undefined;
    ActiveWorkout: { templateId?: string } | undefined;
    ExerciseDetail: { exerciseId: string };
    TemplateEditor: { templateId?: string; isNew?: boolean };
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

// Main Navigator
export const AppNavigator: React.FC = () => {
    const mode = useThemeStore((state) => state.mode);
    const colors = useThemeStore((state) => state.colors);

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

    return (
        <NavigationContainer theme={navigationTheme}>
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
            </Stack.Navigator>
        </NavigationContainer>
    );
};
