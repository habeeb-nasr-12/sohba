import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { Form, Input } from "@ant-design/react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useSignIn, useSignInWithGoogle } from "../../../shared/hooks/auth";
import { router } from "expo-router";


interface SignInFormProps {
  onToggleToSignUp: () => void;
}

export default function SignInForm({ onToggleToSignUp }: SignInFormProps) {
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

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 py-4">
          <View className="mb-8">
            <Text 
              style={{ 
                fontSize: 32, 
                fontWeight: '700',
                color: '#1a1a1a'  ,
                textAlign: 'center',
                marginBottom: 8,
                letterSpacing: -0.5,
              }}
            >
              Welcome Back
            </Text>
            <Text 
              style={{
                fontSize: 15,
                color: '#6b7280',
                textAlign: 'center',
                fontWeight: '400',
              }}
            >
              Sign in to continue to Sohba
            </Text>
          </View>

          {/* Sign In Form */}
          <View 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 20,
              padding: 24,
              shadowColor: '#000',
              elevation: 5,
            }}
          >
            <Form
              form={form}
              onFinish={handleFinish}
              initialValues={{
                email: "",
                password: "",
              }}
              layout="vertical"
            >
          
                <Form.Item
                label="Email Address"
                  name="email"
               
                  rules={[
                    { required: true, message: "Email is required" },
                    { type: "email", message: "Please enter a valid email" },
                  ]}
                >
                  <Input
                    placeholder="you@example.com"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={{

                      borderWidth: 1.5,
                      borderColor: '#e5e7eb',
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      height: 52,
                    }}
                  />
                </Form.Item>
            
                <Form.Item
                  label="Password"
                  name="password"
                  rules={[{ required: true, message: "Password is required" }]}
                >
                  <Input
                    placeholder="Enter your password"
                    secureTextEntry={true}
                    type="password"
                    style={{
                      borderWidth: 1.5,
                      borderColor: '#e5e7eb',
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      height: 52,
                    }}
                  />
                </Form.Item>
              <Form.Item>
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isPending}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#1DA1F2', '#0d8bd9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      borderRadius: 14,
                      height: 54,
                      justifyContent: 'center',
                      alignItems: 'center',
                      shadowColor: '#1DA1F2', // Background color for the gradient
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 6,
                    }}
                  >
                    <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>
                      {isPending ? 'Signing in...' : 'Sign In'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Form.Item>
            </Form>

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
              <Text style={{ marginHorizontal: 16, color: '#9ca3af', fontSize: 13, fontWeight: '500' }}>
                OR
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
            </View>

            {/* Google Sign In */}
            <TouchableOpacity
              onPress={handleGoogleSignIn}
              disabled={googleSignInPending}
              activeOpacity={0.7}
              style={{
                backgroundColor: '#ffffff',
                borderWidth: 1.5,
                borderColor: '#e5e7eb',
                borderRadius: 14,
                paddingVertical: 14,
                paddingHorizontal: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              {googleSignInPending ? (
                <Text style={{ color: '#6b7280', fontSize: 15, fontWeight: '600' }}>
                  Signing in...
                </Text>
              ) : (
                <>
                  <Image
                    source={require("../../../assets/images/google.png")}
                    style={{ width: 20, height: 20, marginRight: 12 }}
                    resizeMode="contain"
                  />
                  <Text style={{ color: '#1f2937', fontSize: 15, fontWeight: '600' }}>
                    Continue with Google
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Toggle to Sign Up */}
          <View className="mt-8 mb-4">
            <Text style={{ textAlign: 'center', color: '#6b7280', fontSize: 14 }}>
              Don&apos;t have an account?{' '}
              <Text 
                style={{ color: '#1DA1F2', fontWeight: '600' }}
                onPress={onToggleToSignUp}
              >
                Sign up
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
 
  );
}
