// FitLog - Data Sync Hook for Firebase
import { useEffect, useCallback } from 'react';
import { db, auth } from '../config/firebase';
import firebase from 'firebase/compat/app';
import {
    useUserStore,
    useAchievementsStore,
    useOnboardingStore,
    useWorkoutHistoryStore
} from '../store';
import { useWaterStore } from '../store/waterStore';

// Debounce function
const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

export const useDataSync = () => {
    const userStore = useUserStore();
    const achievementsStore = useAchievementsStore();
    const onboardingStore = useOnboardingStore();
    const waterStore = useWaterStore();
    const workoutHistoryStore = useWorkoutHistoryStore();

    // Save to Firestore (debounced)
    const saveToFirestore = useCallback(
        debounce(async () => {
            const user = auth.currentUser;
            if (!user) return;

            try {
                const userRef = db.collection('users').doc(user.uid);

                await userRef.set({
                    profile: userStore.profile,
                    templates: userStore.templates,
                    achievements: {
                        achievements: achievementsStore.achievements,
                        totalPoints: achievementsStore.totalPoints,
                    },
                    waterRecords: waterStore.records,
                    onboarding: {
                        hasCompletedOnboarding: onboardingStore.hasCompletedOnboarding,
                        hasSelectedTrainingStyle: onboardingStore.hasSelectedTrainingStyle,
                        onboardingData: onboardingStore.onboardingData,
                    },
                    workoutHistory: workoutHistoryStore.workoutHistory,
                    stats: workoutHistoryStore.stats,
                    lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                }, { merge: true });

                console.log('✅ Data synced to Firestore');
            } catch (error) {
                console.error('❌ Error syncing to Firestore:', error);
            }
        }, 2000),
        [userStore, achievementsStore, onboardingStore, waterStore, workoutHistoryStore]
    );

    // Load from Firestore
    const loadFromFirestore = useCallback(async () => {
        const user = auth.currentUser;
        if (!user) return false;

        try {
            const userDoc = await db.collection('users').doc(user.uid).get();

            if (userDoc.exists) {
                const data = userDoc.data();

                // Load profile and templates
                if (data?.profile) {
                    userStore.updateProfile(data.profile);
                }
                if (data?.templates && Array.isArray(data.templates)) {
                    // Replace templates with Firestore data
                    data.templates.forEach((template: any) => {
                        const existing = userStore.templates.find(t => t.id === template.id);
                        if (!existing) {
                            userStore.addTemplate(template);
                        }
                    });
                }

                // Load onboarding state
                if (data?.onboarding) {
                    if (data.onboarding.hasCompletedOnboarding) {
                        onboardingStore.setHadCompletedOnboarding(true);
                    }
                    if (data.onboarding.hasSelectedTrainingStyle) {
                        onboardingStore.completeTrainingStyleSelection();
                    }
                    if (data.onboarding.onboardingData?.trainingStyle) {
                        onboardingStore.setTrainingStyle(data.onboarding.onboardingData.trainingStyle);
                    }
                    if (data.onboarding.onboardingData?.fitnessLevel) {
                        onboardingStore.setFitnessLevel(data.onboarding.onboardingData.fitnessLevel);
                    }
                }

                console.log('✅ Data loaded from Firestore');
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Error loading from Firestore:', error);
            return false;
        }
    }, [userStore, onboardingStore]);

    // Auto-sync on store changes
    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        saveToFirestore();
    }, [
        userStore.profile,
        userStore.templates,
        achievementsStore.achievements,
        onboardingStore.hasCompletedOnboarding,
        onboardingStore.hasSelectedTrainingStyle,
        waterStore.records,
        workoutHistoryStore.workoutHistory,
    ]);

    return {
        saveToFirestore,
        loadFromFirestore,
    };
};
