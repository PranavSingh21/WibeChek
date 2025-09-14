import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      // Store user data in Firestore when user signs in
      if (user) {
        try {
          // Check if user already exists
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (!userDoc.exists()) {
            // New user - create profile with Gmail data
            console.log('Creating new user profile for:', user.displayName);
            await setDoc(doc(db, 'users', user.uid), {
              uid: user.uid,
              name: user.displayName || 'User',
              email: user.email,
              photoURL: user.photoURL || 'https://via.placeholder.com/150',
              groups: [],
              isAvailable: true,
              createdAt: new Date(),
              lastSeen: new Date(),
            });
          } else {
            // Existing user - update last seen and Gmail data if changed
            const userData = userDoc.data();
            const updates: any = {
              lastSeen: new Date(),
            };
            
            // Update name if Gmail name is different and not empty
            if (user.displayName && user.displayName !== userData.name) {
              updates.name = user.displayName;
            }
            
            // Update photo if Gmail photo is different and not empty
            if (user.photoURL && user.photoURL !== userData.photoURL) {
              updates.photoURL = user.photoURL;
            }
            
            await updateDoc(doc(db, 'users', user.uid), updates);
          }
        } catch (error) {
          console.error('Error storing user data:', error);
        }
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}