// FitLog - Authentication Store with Firebase (Modern Auth SDK - React Native Compatible)
import { create } from 'zustand';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    sendPasswordResetEmail,
    updateProfile,
    deleteUser,
    signInWithCredential,
    OAuthProvider,
    User
} from 'firebase/auth';
import { auth, db, firebase } from '../config/firebase';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';

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
    user: User | null;
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
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is signed in, fetch their profile
                try {
                    const userDoc = await db.collection('users').doc(user.uid).get();

                    if (userDoc.exists) {
                        const profileData = userDoc.data() as UserProfile;
                        set({ user, userProfile: profileData, isInitialized: true });
                    } else {
                        // Create profile if doesn't exist
                        const newProfile: UserProfile = {
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
                        await db.collection('users').doc(user.uid).set(newProfile);
                        set({ user, userProfile: newProfile, isInitialized: true });
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
            const result = await signInWithEmailAndPassword(auth, email, password);
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
            } else if (error.code === 'auth/invalid-credential') {
                errorMessage = 'E-posta veya şifre hatalı';
            }
            set({ isLoading: false, error: errorMessage });
            throw error;
        }
    },

    signInWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
            // Note: Google Sign-In requires additional setup with expo-auth-session
            // For now, show a user-friendly message
            set({
                isLoading: false,
                error: 'Google ile giriş şu an için kullanılamıyor. Lütfen e-posta ve şifre ile giriş yapın.'
            });
        } catch (error: any) {
            console.error('❌ Google Sign-In Error:', error);
            set({ isLoading: false, error: 'Google ile giriş yapılırken bir hata oluştu' });
            throw error;
        }
    },

    signInWithApple: async () => {
        set({ isLoading: true, error: null });
        try {
            if (Platform.OS !== 'ios') {
                set({
                    isLoading: false,
                    error: 'Apple ile giriş sadece iOS cihazlarda kullanılabilir.'
                });
                return;
            }

            // Check if Apple Authentication is available
            const isAvailable = await AppleAuthentication.isAvailableAsync();
            if (!isAvailable) {
                set({
                    isLoading: false,
                    error: 'Apple ile giriş bu cihazda desteklenmiyor.'
                });
                return;
            }

            // Generate nonce for security
            const nonce = Math.random().toString(36).substring(2, 10);
            const hashedNonce = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                nonce
            );

            // Request Apple Sign-In
            const appleCredential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
                nonce: hashedNonce,
            });

            // Create Firebase credential
            const provider = new OAuthProvider('apple.com');
            const credential = provider.credential({
                idToken: appleCredential.identityToken!,
                rawNonce: nonce,
            });

            // Sign in with Firebase
            const result = await signInWithCredential(auth, credential);

            if (result.user) {
                // Check if user profile exists
                const userDoc = await db.collection('users').doc(result.user.uid).get();

                if (!userDoc.exists) {
                    // Create new profile - Apple may provide name only on first sign-in
                    const fullName = appleCredential.fullName;
                    const displayName = fullName
                        ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim()
                        : result.user.displayName || 'Sporcu';

                    const newProfile: UserProfile = {
                        uid: result.user.uid,
                        email: result.user.email || appleCredential.email || '',
                        displayName: displayName,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
                        weightUnit: 'kg',
                        weeklyGoal: 4,
                        restTimerDefault: 90,
                        dailyCalorieGoal: 2500,
                    };

                    await db.collection('users').doc(result.user.uid).set(newProfile);
                } else {
                    // Update last login
                    await db.collection('users').doc(result.user.uid).update({
                        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
                    });
                }
            }

            set({ isLoading: false });
        } catch (error: any) {
            if (error.code === 'ERR_REQUEST_CANCELED') {
                // User cancelled the sign-in
                set({ isLoading: false, error: null });
                return;
            }
            console.error('❌ Apple Sign-In Error:', error);
            set({ isLoading: false, error: 'Apple ile giriş yapılırken bir hata oluştu' });
            throw error;
        }
    },

    signUp: async (email, password, displayName) => {
        set({ isLoading: true, error: null });
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);

            if (result.user) {
                // Update display name
                await updateProfile(result.user, { displayName });

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
            await firebaseSignOut(auth);
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
            await deleteUser(user);

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
            await sendPasswordResetEmail(auth, email);
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
