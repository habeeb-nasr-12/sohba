import { Redirect, Stack } from 'expo-router'
import { useAuth } from '../../shared/contexts/AuthContext'
import { ActivityIndicator, View } from 'react-native'

export default function AuthRoutesLayout() {
  const { isAuthenticated, isLoading } = useAuth()

  // Show loading spinner while authentication state is being determined
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  // If authenticated, redirect to tabs
  if (isAuthenticated) {
    console.log('🔄 Auth layout: User is authenticated, redirecting to tabs')
    return <Redirect href={'/(tabs)'} />
  }

  // Show auth screens
  console.log('🔄 Auth layout: User not authenticated, showing auth screens')
  return <Stack screenOptions={{ headerShown: false }} />
}