import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { auth } from '../../config/firebase';
import { authService } from './authService';
import { setUser, setLoading, setError, signOut as signOutAction, clearError } from './authSlice';
import { AuthContextType } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoadingState] = useState(true);
  const [onAuthSuccess, setOnAuthSuccess] = useState<(() => void) | undefined>(undefined);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserState(user);
      setLoadingState(false);
      dispatch(setUser(user));
      
      // Call the auth success callback if it exists
      if (user && onAuthSuccess) {
        onAuthSuccess();
      }
    });

    return () => unsubscribe();
  }, [dispatch, onAuthSuccess]);

  const signInWithGoogle = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      await authService.signInWithGoogle();
    } catch (error: any) {
      dispatch(setError(error.message));
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      await authService.signInWithEmail(email, password);
    } catch (error: any) {
      dispatch(setError(error.message));
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      await authService.signUpWithEmail(email, password, displayName);
    } catch (error: any) {
      dispatch(setError(error.message));
    }
  };

  const signOut = async () => {
    try {
      dispatch(setLoading(true));
      await authService.signOut();
      dispatch(signOutAction());
    } catch (error: any) {
      dispatch(setError(error.message));
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    signOut,
    signInWithEmail,
    signUpWithEmail,
    onAuthSuccess,
    setOnAuthSuccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
