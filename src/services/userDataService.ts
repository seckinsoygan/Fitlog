// FitLog - User Templates Firebase Service
import { db, auth } from '../config/firebase';
import firebase from 'firebase/compat/app';

// Save templates to Firestore
export const saveTemplatesToFirestore = async (templates: any[]): Promise<boolean> => {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.log('No user logged in, skipping Firestore save');
            return false;
        }

        await db.collection('users').doc(user.uid).set({
            templates: templates,
            templatesUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        console.log('✅ Templates saved to Firestore:', templates.length);
        return true;
    } catch (error) {
        console.error('❌ Error saving templates to Firestore:', error);
        return false;
    }
};

// Load templates from Firestore
export const loadTemplatesFromFirestore = async (): Promise<any[] | null> => {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.log('No user logged in, skipping Firestore load');
            return null;
        }

        const userDoc = await db.collection('users').doc(user.uid).get();

        if (userDoc.exists) {
            const data = userDoc.data();
            if (data?.templates && Array.isArray(data.templates)) {
                console.log('✅ Templates loaded from Firestore:', data.templates.length);
                return data.templates as any[];
            }
        }

        return null;
    } catch (error) {
        console.error('❌ Error loading templates from Firestore:', error);
        return null;
    }
};

// Save profile to Firestore
export const saveProfileToFirestore = async (profile: any): Promise<boolean> => {
    try {
        const user = auth.currentUser;
        if (!user) return false;

        await db.collection('users').doc(user.uid).set({
            profile: profile,
            profileUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        console.log('✅ Profile saved to Firestore');
        return true;
    } catch (error) {
        console.error('❌ Error saving profile to Firestore:', error);
        return false;
    }
};

// Load profile from Firestore
export const loadProfileFromFirestore = async (): Promise<any | null> => {
    try {
        const user = auth.currentUser;
        if (!user) return null;

        const userDoc = await db.collection('users').doc(user.uid).get();

        if (userDoc.exists) {
            const data = userDoc.data();
            if (data?.profile) {
                console.log('✅ Profile loaded from Firestore');
                return data.profile;
            }
        }

        return null;
    } catch (error) {
        console.error('❌ Error loading profile from Firestore:', error);
        return null;
    }
};

// Save onboarding state to Firestore
export const saveOnboardingToFirestore = async (onboardingData: any): Promise<boolean> => {
    try {
        const user = auth.currentUser;
        if (!user) return false;

        await db.collection('users').doc(user.uid).set({
            onboarding: onboardingData,
            onboardingUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        console.log('✅ Onboarding saved to Firestore');
        return true;
    } catch (error) {
        console.error('❌ Error saving onboarding to Firestore:', error);
        return false;
    }
};

// Load onboarding state from Firestore
export const loadOnboardingFromFirestore = async (): Promise<any | null> => {
    try {
        const user = auth.currentUser;
        if (!user) return null;

        const userDoc = await db.collection('users').doc(user.uid).get();

        if (userDoc.exists) {
            const data = userDoc.data();
            if (data?.onboarding) {
                console.log('✅ Onboarding loaded from Firestore');
                return data.onboarding;
            }
        }

        return null;
    } catch (error) {
        console.error('❌ Error loading onboarding from Firestore:', error);
        return null;
    }
};
