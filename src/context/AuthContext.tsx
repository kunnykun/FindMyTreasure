import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import type { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isDetectorist: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserProfile({ id: user.uid, ...userDoc.data() } as User);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, name: string, phone: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(user, { displayName: name });

    // Create user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      phone,
      role: 'user' as UserRole,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const isAdmin = userProfile?.role === 'admin';
  const isDetectorist = userProfile?.role === 'detectorist';

  const value = {
    currentUser,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    isDetectorist
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
