import { useState, useEffect } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithEmail, signUpWithEmail, signInWithGoogle, createGoogleUserProfile, getUserData } from '@/lib/firebase';
import { User } from '@shared/schema';

export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsUsername, setNeedsUsername] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const userData = await getUserData(firebaseUser.uid);
          if (userData) {
            setUser(userData as User);
            setNeedsUsername(false);
          } else {
            setNeedsUsername(true);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUser(null);
        setNeedsUsername(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmail(email, password);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, username: string) => {
    try {
      await signUpWithEmail(email, password, username);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithGoogle();
      setNeedsUsername(result.needsUsername);
      return result;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const completeGoogleSignup = async (username: string) => {
    if (!firebaseUser) throw new Error('No Firebase user');
    
    try {
      await createGoogleUserProfile(firebaseUser, username);
      const userData = await getUserData(firebaseUser.uid);
      setUser(userData as User);
      setNeedsUsername(false);
    } catch (error) {
      console.error('Complete Google signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return {
    user,
    firebaseUser,
    loading,
    needsUsername,
    login,
    signup,
    loginWithGoogle,
    completeGoogleSignup,
    logout,
  };
}
