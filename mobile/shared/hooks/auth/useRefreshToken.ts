import { useMutation } from '@tanstack/react-query';
import { RefreshTokenResponse } from '../../types/auth';
import { tokenStorage } from '../../utils/storage';
import { api } from '../../utils/api';

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: async (): Promise<string> => {
      const response = await api.post('/auth/refresh');
      const data: RefreshTokenResponse = response.data;
      
      // Store new access token
      await tokenStorage.setAccessToken(data.accessToken);
      
      return data.accessToken;
    },
    onError: async (error) => {
      // If refresh fails, clear all auth data
      await tokenStorage.clearAll();
    },
  });
};
