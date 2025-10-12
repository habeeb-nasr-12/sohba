import { useQuery } from '@tanstack/react-query';
import { User } from '../../types/auth';
import { tokenStorage } from '../../utils/storage';
import { api } from '../../utils/api';
import { authKeys } from './queryKeys';

export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: async (): Promise<User | null> => {
      const token = await tokenStorage.getAccessToken();
      if (!token) return null;
      
      try {
        const response = await api.get('/auth/me');
        return response.data.user;
      } catch (error: any) {
        console.warn('Failed to fetch current user:', error);
        
        // Only clear auth data on 401 (unauthorized) errors
        // For other errors (network, server), keep the stored user data
        if (error.response?.status === 401) {
          console.log('Authentication invalid, clearing auth data');
          await tokenStorage.clearAll();
          return null;
        }
        
        // For other errors, try to return stored user data
        const storedUser = await tokenStorage.getUserData();
        if (storedUser) {
          console.log('Using stored user data due to API error');
          return storedUser;
        }
        
        return null;
      }
    },
    // Use stored user data as initial data
    initialData: async () => {
      const token = await tokenStorage.getAccessToken();
      if (!token) return null;
      
      const storedUser = await tokenStorage.getUserData();
      return storedUser;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors
      if (error.response?.status === 401) return false;
      // Retry network errors up to 2 times
      return failureCount < 2;
    },
  });
};
