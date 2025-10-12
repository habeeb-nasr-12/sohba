export interface User {
  _id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  authProvider: 'local' | 'google';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  firstName?: string;
  lastName?: string;
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
}

export interface RefreshTokenResponse {
  message: string;
  accessToken: string;
}

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: SignUpRequest) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

export interface GoogleAuthResponse {
  success: boolean;
  message: string;
  user: User;
  accessToken: string;
  refreshToken?: string;
}
