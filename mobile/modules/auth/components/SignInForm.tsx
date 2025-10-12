import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { Form, Input, Button, Provider } from "@ant-design/react-native";
import { useSignIn, useSignInWithGoogle } from "../../../shared/hooks/auth";
import { router } from "expo-router";


export default function SignInForm() {
  const [form] = Form.useForm();
  const { mutateAsync, isPending } = useSignIn();
  const {mutateAsync: googleSignInMutation, isPending: googleSignInPending } = useSignInWithGoogle();

  const handleSubmit = () => {
    form.submit();
  };

  const handleFinish = (values: { email: string; password: string }) => {
    mutateAsync(values, {
      onSuccess: () => {
        Alert.alert("Sign in successful");
        router.push("/(tabs)");
      },
    });
  };

  const handleGoogleSignIn = async () => {
    try {
      await googleSignInMutation();
      // Navigation is handled in the hook's onSuccess callback
    } catch (error: any) {
      console.error("Google sign in error:", error);
      if (!error.message?.includes('cancel') && !error.message?.includes('dismiss')) {
        Alert.alert("Google Sign In Error", error.message || "Failed to sign in with Google");
      }
    }
  };

  return (
    <Provider>
      <ScrollView
        className="flex-1 bg-white"
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-8 py-6">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-center text-gray-900 mb-2">
              Welcome Back
            </Text>
            <Text className="text-gray-600 text-center">
              Sign in to continue to Sohba
            </Text>
          </View>

          {/* Sign In Form */}
          <Form
            form={form}
            onFinish={handleFinish}
            initialValues={{
              email: "",
              password: "",
            }}
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Email is required" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input
                placeholder="Enter your email"
                autoCapitalize="none"
                keyboardType="email-address"
                style={{
                  borderWidth: 1,
                  borderColor: "#e1e5e9",
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  height: 48,
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Password is required" }]}
            >
              <Input
                placeholder="Enter your password"
                secureTextEntry={true}
                type="password"
                style={{
                  borderWidth: 1,
                  borderColor: "#e1e5e9",
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  height: 48,
                }}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                onPress={handleSubmit}
                loading={isPending}
                style={{
                  backgroundColor: "#1DA1F2",
                  borderColor: "#1DA1F2",
                  borderRadius: 8,
                  height: 48,
                }}
              >
                <Text className="text-white font-semibold">Sign In</Text>
              </Button>
            </Form.Item>
          </Form>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-gray-500">OR</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Google Sign In */}
          <TouchableOpacity
            className="flex-row items-center justify-center bg-white border border-gray-300 rounded-lg py-3 px-6 mb-6"
            onPress={handleGoogleSignIn}
            disabled={googleSignInPending}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            {googleSignInPending ? (
              <Text className="text-gray-600">Signing in...</Text>
            ) : (
              <View className="flex-row items-center">
                <Image
                  source={require("../../../assets/images/google.png")}
                  className="size-5 mr-3"
                  resizeMode="contain"
                />
                <Text className="text-gray-800 font-medium">
                  Continue with Google
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Provider>
  );
}
