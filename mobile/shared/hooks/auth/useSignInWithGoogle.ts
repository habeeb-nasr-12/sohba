import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";
import { Alert } from "react-native";
import { GoogleAuthResponse } from "../../types/auth";
import { tokenStorage } from "../../utils/storage";
import { authKeys } from "./queryKeys";
import { useRouter } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const useSignInWithGoogle = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async (): Promise<GoogleAuthResponse> => {
      const redirectUri = "sohba://auth/google/callback";
      const authUrl = `${API_URL}/auth/google?mobile=true`;

      try {
        const result = await WebBrowser.openAuthSessionAsync(
          authUrl,
          redirectUri,
          {
            showInRecents: false,
            preferEphemeralSession: true,
          }
        );

        if (result.type === "success" && result.url) {
          const url = new URL(result.url);
          const response = url.searchParams.get("response");

          if (response) {
            const parsedResponse = JSON.parse(decodeURIComponent(response));
            return parsedResponse;
          }
        } else if (result.type === "cancel") {
          throw new Error("Sign in was cancelled");
        } else if (result.type === "dismiss") {
          throw new Error("Sign in was dismissed");
        }

        throw new Error("Google authentication failed");
      } catch (error: any) {
        if (
          error.message.includes("cancel") ||
          error.message.includes("dismiss")
        ) {
          throw error;
        }
        throw new Error(
          error.message || "Failed to connect to authentication server"
        );
      }
    },
    onSuccess: async (data) => {
      if (data.success) {
        try {
          // Store tokens and user data sequentially to avoid race conditions
          await tokenStorage.setAccessToken(data.accessToken);
          
          if (data.refreshToken) {
            await tokenStorage.setRefreshToken(data.refreshToken);
          }
          
          await tokenStorage.setUserData(data.user);

          // Update React Query cache with the user data
          queryClient.setQueryData(authKeys.currentUser(), data.user);
          
          // Invalidate and refetch to ensure consistency
          await queryClient.invalidateQueries({ queryKey: authKeys.all });
          
          // Navigate to tabs - use replace to avoid back navigation to auth
          router.replace("/(tabs)");
          
        } catch {
          throw new Error("Failed to store authentication data");
        }
      } else {
        throw new Error(data.message || "Google authentication failed");
      }
    },
    onError: (error: any) => {
      const message = error.message || "Google sign in failed";
      Alert.alert("Google Sign In Error", message);
    },
  });
};
