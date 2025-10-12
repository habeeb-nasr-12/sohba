import "../global.css";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Provider } from "@ant-design/react-native";
import { AuthProvider } from "../shared/contexts/AuthContext";

function RootLayout() {
  const queryClient = new QueryClient();

  const [fontsLoaded] = useFonts({
    antoutline: require("@ant-design/icons-react-native/fonts/antoutline.ttf"),
  });

  if (!fontsLoaded) {
    return null; // Return null or a loading screen while fonts are loading
  }

  return (
    <Provider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default RootLayout;
