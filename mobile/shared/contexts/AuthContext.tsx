import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { AuthContextType } from '../types/auth';
import { 
  useSignIn, 
  useSignUp, 
  useSignInWithGoogle, 
  useSignOut, 
  useRefreshToken,
  useIsAuthenticated 
} from '../hooks/auth';
import { tokenStorage } from '../utils/storage';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useIsAuthenticated();
  const signInMutation = useSignIn();
  const signUpMutation = useSignUp();
  const googleSignInMutation = useSignInWithGoogle();
  const signOutMutation = useSignOut();
  const refreshTokenMutation = useRefreshToken();

  // Initialize auth state on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await tokenStorage.getAccessToken();
        const userData = await tokenStorage.getUserData();
        
        if (!token || !userData) {
          // Clear potentially corrupted data
          await tokenStorage.clearAll();
        }
      } catch (error) {
        // Clear potentially corrupted data
        await tokenStorage.clearAll();
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    await signInMutation.mutateAsync({ email, password });
  };

  const signUp = async (userData: any): Promise<void> => {
    await signUpMutation.mutateAsync(userData);
  };

  const signInWithGoogle = async (): Promise<void> => {
    await googleSignInMutation.mutateAsync();
  };

  const signOut = async (): Promise<void> => {
    return signOutMutation.mutateAsync();
  };

  const refreshToken = async (): Promise<string | null> => {
    try {
      return await refreshTokenMutation.mutateAsync();
    } catch (error) {
      return null;
    }
  };

  const contextValue: AuthContextType = {
    user: user ?? null,
    accessToken: null, // We'll get this from storage when needed
    isAuthenticated,
    isLoading: isLoading || signInMutation.isPending || signUpMutation.isPending || googleSignInMutation.isPending || signOutMutation.isPending,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
