import { Alert } from "react-native";
import { useSignOut as useCustomSignOut } from "../../../shared/hooks/auth";

export const useSignOut = () => {
  const signOutMutation = useCustomSignOut();

  const handleSignOut = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => signOutMutation.mutate(),
      },
    ]);
  };

  return { handleSignOut };
};