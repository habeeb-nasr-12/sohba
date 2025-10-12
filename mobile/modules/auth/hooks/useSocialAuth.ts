import { Alert } from "react-native";
import { useSignInWithGoogle } from "../../../shared/hooks/auth";

export const useSocialAuth = () => {
  const {mutateAsync : googleSignInMutation, isPending} = useSignInWithGoogle();

  const handleSocialAuth = async (strategy: "oauth_google" | "oauth_apple") => {
    if (strategy === "oauth_google") {
      try {
        await googleSignInMutation();
      } catch (err: any) {
        // Don't show alert for user cancellation
        if (err.message?.includes("cancel") || err.message?.includes("dismiss")) {
          return;
        }
        
        // Show error alert for other failures
        Alert.alert(
          "Google Sign In Failed", 
          err.message || "An unexpected error occurred during Google sign in"
        );
      }
    } else {
      Alert.alert("Apple Sign In", "Apple sign in is not yet implemented");
    }
  };

  return {
    handleSocialAuth,
    isLoading: isPending,
  };
};
