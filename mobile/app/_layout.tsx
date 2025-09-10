import "../global.css";
import { Stack } from "expo-router";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";

function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ClerkProvider>
  );
}

export default RootLayout;
