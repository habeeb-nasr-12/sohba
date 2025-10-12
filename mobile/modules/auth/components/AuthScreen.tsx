import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

export default function AuthScreen() {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Tab Header */}
      <View className="flex-row mx-8 mt-4 mb-2">
        <TouchableOpacity
          className={`flex-1 py-3 rounded-lg mr-2 ${
            isSignIn ? 'bg-blue-50' : 'bg-gray-100'
          }`}
          onPress={() => setIsSignIn(true)}
        >
          <Text
            className={`text-center font-semibold ${
              isSignIn ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            Sign In
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className={`flex-1 py-3 rounded-lg ml-2 ${
            !isSignIn ? 'bg-blue-50' : 'bg-gray-100'
          }`}
          onPress={() => setIsSignIn(false)}
        >
          <Text
            className={`text-center font-semibold ${
              !isSignIn ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>

      {/* Form Content */}
      {isSignIn ? <SignInForm /> : <SignUpForm />}
    </SafeAreaView>
  );
}
