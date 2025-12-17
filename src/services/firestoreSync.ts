// FitLog - Firebase Sync Service
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    collection,
    serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';

export interface UserData {
    profile: any;
    templates: any[];
    achievements: any;
    waterRecords: any;
    workoutHistory: any[];
    onboarding: any;
    lastUpdated: any;
}

// Save user data to Firestore
export const saveUserData = async (
    dataType: keyof UserData,
    data: any
): Promise<boolean> => {
    try {
        const user = auth.currentUser;
        if (!user) return false;

        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
            [dataType]: data,
            lastUpdated: serverTimestamp(),
        }).catch(async () => {
            // If document doesn't exist, create it
            await setDoc(userRef, {
                [dataType]: data,
                createdAt: serverTimestamp(),
                lastUpdated: serverTimestamp(),
            }, { merge: true });
        });

        return true;
    } catch (error) {
        console.error('Error saving user data:', error);
        return false;
    }
};

// Load user data from Firestore
export const loadUserData = async (): Promise<UserData | null> => {
    try {
        const user = auth.currentUser;
        if (!user) return null;

        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            return docSnap.data() as UserData;
        }

        return null;
    } catch (error) {
        console.error('Error loading user data:', error);
        return null;
    }
};

// Initialize user document
export const initializeUserDocument = async (userProfile?: any): Promise<void> => {
    try {
        const user = auth.currentUser;
        if (!user) return;

        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
            await setDoc(userRef, {
                profile: userProfile || {
                    name: user.displayName || 'Sporcu',
                    email: user.email,
                    weeklyGoal: 5,
                    restTimerDefault: 90,
                    weightUnit: 'kg',
                },
                templates: [],
                achievements: { achievements: [], totalPoints: 0 },
                waterRecords: {},
                workoutHistory: [],
                onboarding: {
                    hasCompletedOnboarding: true,
                    hasSelectedTrainingStyle: false,
                },
                createdAt: serverTimestamp(),
                lastUpdated: serverTimestamp(),
            });
        }
    } catch (error) {
        console.error('Error initializing user document:', error);
    }
};

// Sync local store to Firestore
export const syncToFirestore = async (stores: {
    user?: any;
    achievements?: any;
    water?: any;
    workoutHistory?: any;
    onboarding?: any;
}): Promise<void> => {
    try {
        const user = auth.currentUser;
        if (!user) return;

        const userRef = doc(db, 'users', user.uid);
        const updates: any = { lastUpdated: serverTimestamp() };

        if (stores.user) {
            updates.profile = stores.user.profile;
            updates.templates = stores.user.templates;
        }
        if (stores.achievements) {
            updates.achievements = {
                achievements: stores.achievements.achievements,
                totalPoints: stores.achievements.totalPoints,
            };
        }
        if (stores.water) {
            updates.waterRecords = stores.water.records;
        }
        if (stores.workoutHistory) {
            updates.workoutHistory = stores.workoutHistory.workoutHistory;
        }
        if (stores.onboarding) {
            updates.onboarding = {
                hasCompletedOnboarding: stores.onboarding.hasCompletedOnboarding,
                hasSelectedTrainingStyle: stores.onboarding.hasSelectedTrainingStyle,
                onboardingData: stores.onboarding.onboardingData,
            };
        }

        await updateDoc(userRef, updates).catch(async () => {
            await setDoc(userRef, updates, { merge: true });
        });
    } catch (error) {
        console.error('Error syncing to Firestore:', error);
    }
};
