import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { tokenStorage } from '../../utils/storage';
import { api } from '../../utils/api';
import { authKeys } from './queryKeys';

export const useSignOut = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  return useMutation({
    mutationFn: async (): Promise<void> => {
      try {
        await api.post('/auth/logout');
      } catch (error: any) {
        // Continue with local logout even if API call fails
      }
      
      try {
        // Clear local storage
        await tokenStorage.clearAll();
      } catch (storageError) {
        throw new Error('Failed to clear local authentication data');
      }
    },
    onSuccess: () => {
      try {
        // Clear user data from cache
        queryClient.setQueryData(authKeys.currentUser(), null);
        
        // Invalidate all auth-related queries
        queryClient.invalidateQueries({ queryKey: authKeys.all });
        
        // Navigate back to auth screen
        router.replace('/(auth)');
        
      } catch (error) {
        // Silently handle cleanup errors
      }
    },
    onError: (error: any) => {
      try {
        // Even if logout fails, clear local data and navigate
        tokenStorage.clearAll();
        queryClient.setQueryData(authKeys.currentUser(), null);
        queryClient.invalidateQueries({ queryKey: authKeys.all });
        
        // Still navigate to auth screen
        router.replace('/(auth)');
        
      } catch (cleanupError) {
        // Silently handle emergency cleanup errors
      }
    },
  });
};
