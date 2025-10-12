import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { AuthResponse, SignInRequest } from '../../types/auth';
import { tokenStorage } from '../../utils/storage';
import { api } from '../../utils/api';
import { authKeys } from './queryKeys';

export const useSignIn = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: SignInRequest): Promise<AuthResponse> => {
      try {
        const response = await api.post('/auth/signin', data);
        return response.data;
      } catch (error: any) {
        console.error('Sign in error:', error);
        
        // Handle network errors
        if (error.code === 'ERR_NETWORK' || !error.response) {
          throw new Error('Network error. Please check your connection and ensure the backend server is running.');
        }
        
        // Handle timeout
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout. Please check your connection.');
        }
        
        // Handle API errors
        if (error.response) {
          throw new Error(error.response.data?.message || 'Sign in failed');
        }
        
        throw error;
      }
    },
    onSuccess: async (data) => {
      // Store tokens and user data
      await tokenStorage.setAccessToken(data.accessToken);
      await tokenStorage.setUserData(data.user);
      
      // Invalidate and refetch user data
      queryClient.setQueryData(authKeys.currentUser(), data.user);
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: (error: any) => {
      const message = error.message || error.response?.data?.message || 'Sign in failed';
      Alert.alert('Sign In Error', message);
    },
  });
};
