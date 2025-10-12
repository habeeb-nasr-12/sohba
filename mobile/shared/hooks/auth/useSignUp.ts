import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { AuthResponse, SignUpRequest } from '../../types/auth';
import { tokenStorage } from '../../utils/storage';
import { api } from '../../utils/api';
import { authKeys } from './queryKeys';

export const useSignUp = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: SignUpRequest): Promise<AuthResponse> => {
      try {
        const response = await api.post('/auth/signup', data);
        return response.data;
      } catch (error: any) {
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
          throw new Error(error.response.data?.message || 'Sign up failed');
        }
        
        throw error;
      }
    },
    onSuccess: async (data) => {
      // Store tokens and user data
      await tokenStorage.setAccessToken(data.accessToken);
      await tokenStorage.setUserData(data.user);
      
      // Update query cache
      queryClient.setQueryData(authKeys.currentUser(), data.user);
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: (error: any) => {
      const message = error.message || error.response?.data?.message || 'Sign up failed';
      Alert.alert('Sign Up Error', message);
    },
  });
};
