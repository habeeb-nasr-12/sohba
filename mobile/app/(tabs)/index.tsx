import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import SignOutButton from "../../modules/auth/components/SignOutButton";

const HomeScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <SignOutButton />
    </SafeAreaView>
  );
};

export default HomeScreen;
