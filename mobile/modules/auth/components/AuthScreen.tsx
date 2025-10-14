import React, { useState } from 'react';
import { View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

export default function AuthScreen() {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <SafeAreaView className="flex-1" >
  
        <View className="items-center pt-8 pb-4">
          <View 
            style={{
              shadowColor: '#1DA1F2',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <Image
              source={require('../../../assets/images/sohpa.jpg')}
              style={{
                width: 300,
                height: 150,
                borderRadius: 24,
                borderWidth: 3,
                borderColor: '#ffffff',
              }}
              resizeMode="cover"
            />
          </View>
        </View>         
        <View className="flex-1">
          {isSignIn ? (
            <SignInForm onToggleToSignUp={() => setIsSignIn(false)} />
          ) : (
            <SignUpForm onToggleToSignIn={() => setIsSignIn(true)} />
          )}
        </View>
    </SafeAreaView>
  );
}
