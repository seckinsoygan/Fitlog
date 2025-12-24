// FitLog - Authentication Store with Firebase (Compat Mode)
import { create } from 'zustand';
import firebase from 'firebase/compat/app';
import { auth, db } from '../config/firebase';

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    createdAt?: any;
    lastLoginAt?: any;
    // FitLog specific
    weightUnit: 'kg' | 'lbs';
    weeklyGoal: number;
    restTimerDefault: number;
    dailyCalorieGoal: number;
}

interface AuthState {
    user: firebase.User | null;
    userProfile: UserProfile | null;
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;

    // Actions
    initialize: () => (() => void) | undefined;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, displayName: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signInWithApple: () => Promise<void>;
    signOut: () => Promise<void>;
    deleteAccount: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    userProfile: null,
    isLoading: false,
    isInitialized: false,
    error: null,

    initialize: () => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                // User is signed in, fetch their profile
                try {
                    const userDoc = await db.collection('users').doc(user.uid).get();
                    if (userDoc.exists) {
                        set({
                            user,
                            userProfile: userDoc.data() as UserProfile,
                            isInitialized: true
                        });
                    } else {
                        // Create default profile if doesn't exist
                        const defaultProfile: UserProfile = {
                            uid: user.uid,
                            email: user.email || '',
                            displayName: user.displayName || 'Sporcu',
                            photoURL: user.photoURL || undefined,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                            lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
                            weightUnit: 'kg',
                            weeklyGoal: 4,
                            restTimerDefault: 90,
                            dailyCalorieGoal: 2500,
                        };
                        await db.collection('users').doc(user.uid).set(defaultProfile);
                        set({ user, userProfile: defaultProfile, isInitialized: true });
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                    set({ user, userProfile: null, isInitialized: true });
                }
            } else {
                set({ user: null, userProfile: null, isInitialized: true });
            }
        });
        return unsubscribe;
    },

    signIn: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const result = await auth.signInWithEmailAndPassword(email, password);
            // Update last login
            if (result.user) {
                await db.collection('users').doc(result.user.uid).update({
                    lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
                });
            }
            set({ isLoading: false });
        } catch (error: any) {
            let errorMessage = 'Giriş yapılırken bir hata oluştu';
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'Bu e-posta ile kayıtlı kullanıcı bulunamadı';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Hatalı şifre';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Geçersiz e-posta adresi';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Çok fazla deneme. Lütfen daha sonra tekrar deneyin.';
            }
            set({ isLoading: false, error: errorMessage });
            throw error;
        }
    },

    signInWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');

            const result = await auth.signInWithPopup(provider);

            if (result.user) {
                // Check if user profile exists, create if not
                const userDoc = await db.collection('users').doc(result.user.uid).get();

                if (!userDoc.exists) {
                    const userProfile: UserProfile = {
                        uid: result.user.uid,
                        email: result.user.email || '',
                        displayName: result.user.displayName || 'Sporcu',
                        photoURL: result.user.photoURL || undefined,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
                        weightUnit: 'kg',
                        weeklyGoal: 4,
                        restTimerDefault: 90,
                        dailyCalorieGoal: 2500,
                    };
                    await db.collection('users').doc(result.user.uid).set(userProfile);
                } else {
                    await db.collection('users').doc(result.user.uid).update({
                        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
                    });
                }
            }
            set({ isLoading: false });
        } catch (error: any) {
            console.error('❌ Google Sign-In Error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);

            let errorMessage = 'Google ile giriş yapılırken bir hata oluştu';
            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = 'Giriş penceresi kapatıldı';
            } else if (error.code === 'auth/popup-blocked') {
                errorMessage = 'Pop-up penceresi engellendi. Lütfen izin verin.';
            } else if (error.code === 'auth/cancelled-popup-request') {
                errorMessage = 'Giriş iptal edildi';
            } else if (error.code === 'auth/unauthorized-domain') {
                errorMessage = 'Bu domain Firebase\'de yetkilendirilmemiş. Firebase Console > Authentication > Settings > Authorized domains kısmına localhost ekleyin.';
            } else if (error.code === 'auth/operation-not-allowed') {
                errorMessage = 'Google Sign-In etkin değil. Firebase Console\'da etkinleştirin.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            set({ isLoading: false, error: errorMessage });
            throw error;
        }
    },

    signInWithApple: async () => {
        set({ isLoading: true, error: null });
        try {
            const provider = new firebase.auth.OAuthProvider('apple.com');
            provider.addScope('email');
            provider.addScope('name');

            const result = await auth.signInWithPopup(provider);

            if (result.user) {
                // Check if user profile exists, create if not
                const userDoc = await db.collection('users').doc(result.user.uid).get();

                if (!userDoc.exists) {
                    const userProfile: UserProfile = {
                        uid: result.user.uid,
                        email: result.user.email || '',
                        displayName: result.user.displayName || 'Sporcu',
                        photoURL: result.user.photoURL || undefined,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
                        weightUnit: 'kg',
                        weeklyGoal: 4,
                        restTimerDefault: 90,
                        dailyCalorieGoal: 2500,
                    };
                    await db.collection('users').doc(result.user.uid).set(userProfile);
                } else {
                    await db.collection('users').doc(result.user.uid).update({
                        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
                    });
                }
            }
            set({ isLoading: false });
        } catch (error: any) {
            let errorMessage = 'Apple ile giriş yapılırken bir hata oluştu';
            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = 'Giriş penceresi kapatıldı';
            } else if (error.code === 'auth/popup-blocked') {
                errorMessage = 'Pop-up penceresi engellendi. Lütfen izin verin.';
            }
            set({ isLoading: false, error: errorMessage });
            throw error;
        }
    },

    signUp: async (email, password, displayName) => {
        set({ isLoading: true, error: null });
        try {
            const result = await auth.createUserWithEmailAndPassword(email, password);

            if (result.user) {
                // Update display name
                await result.user.updateProfile({ displayName });

                // Create user profile in Firestore
                const userProfile: UserProfile = {
                    uid: result.user.uid,
                    email: email,
                    displayName: displayName,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
                    weightUnit: 'kg',
                    weeklyGoal: 4,
                    restTimerDefault: 90,
                    dailyCalorieGoal: 2500,
                };

                await db.collection('users').doc(result.user.uid).set(userProfile);
                set({ userProfile, isLoading: false });
            }
        } catch (error: any) {
            let errorMessage = 'Kayıt olurken bir hata oluştu';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Bu e-posta adresi zaten kullanımda';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Şifre en az 6 karakter olmalıdır';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Geçersiz e-posta adresi';
            }
            set({ isLoading: false, error: errorMessage });
            throw error;
        }
    },

    signOut: async () => {
        set({ isLoading: true, error: null });
        try {
            await auth.signOut();
            set({ user: null, userProfile: null, isLoading: false });
        } catch (error: any) {
            set({ isLoading: false, error: 'Çıkış yapılırken bir hata oluştu' });
            throw error;
        }
    },

    deleteAccount: async () => {
        const { user } = get();
        if (!user) {
            set({ error: 'Kullanıcı bulunamadı' });
            return;
        }

        set({ isLoading: true, error: null });
        try {
            const uid = user.uid;

            // Delete user data from Firestore collections
            const collectionsToDelete = [
                'users',
                'workouts',
                'workoutHistory',
                'templates',
                'weeklyPrograms',
                'nutrition',
                'achievements'
            ];

            const batch = db.batch();

            // Delete main user document
            batch.delete(db.collection('users').doc(uid));

            // For other collections, we need to query and delete documents belonging to the user
            for (const collectionName of collectionsToDelete) {
                if (collectionName === 'users') continue; // Already handled above

                try {
                    const snapshot = await db.collection(collectionName)
                        .where('userId', '==', uid)
                        .get();

                    snapshot.docs.forEach(doc => {
                        batch.delete(doc.ref);
                    });
                } catch (e) {
                    // Collection might not exist or have different structure, continue
                    console.log(`Skipping collection ${collectionName}:`, e);
                }
            }

            await batch.commit();

            // Delete the Firebase Auth user
            await user.delete();

            // Clear local state
            set({ user: null, userProfile: null, isLoading: false });
        } catch (error: any) {
            let errorMessage = 'Hesap silinirken bir hata oluştu';
            if (error.code === 'auth/requires-recent-login') {
                errorMessage = 'Hesabınızı silmek için yeniden giriş yapmanız gerekiyor';
            }
            set({ isLoading: false, error: errorMessage });
            throw error;
        }
    },

    resetPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
            await auth.sendPasswordResetEmail(email);
            set({ isLoading: false });
        } catch (error: any) {
            let errorMessage = 'Şifre sıfırlama e-postası gönderilirken bir hata oluştu';
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'Bu e-posta ile kayıtlı kullanıcı bulunamadı';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Geçersiz e-posta adresi';
            }
            set({ isLoading: false, error: errorMessage });
            throw error;
        }
    },

    updateUserProfile: async (updates) => {
        const { user, userProfile } = get();
        if (!user || !userProfile) return;

        set({ isLoading: true, error: null });
        try {
            await db.collection('users').doc(user.uid).update(updates);
            set({
                userProfile: { ...userProfile, ...updates },
                isLoading: false
            });
        } catch (error: any) {
            set({ isLoading: false, error: 'Profil güncellenirken bir hata oluştu' });
            throw error;
        }
    },

    clearError: () => set({ error: null }),
}));
