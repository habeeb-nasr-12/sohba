import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "access_token";
const USER_DATA_KEY = "user_data";
const REFRESH_TOKEN_KEY = "refresh_token";

export const tokenStorage = {
  async setAccessToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
    } catch (error) {
      console.error("Error storing access token:", error);
      throw error;
    }
  },

  async setRefreshToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error("Error storing refresh token:", error);
      throw error;
    }
  },

  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error("Error retrieving access token:", error);
      return null;
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error("Error retrieving refresh token:", error);
      return null;
    }
  },

  async removeAccessToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error("Error removing access token:", error);
    }
  },

  async removeRefreshToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error("Error removing refresh token:", error);
    }
  },

  async setUserData(user: any): Promise<void> {
    try {
      await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Error storing user data:", error);
      throw error;
    }
  },

  async getUserData(): Promise<any | null> {
    try {
      const userData = await SecureStore.getItemAsync(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error retrieving user data:", error);
      return null;
    }
  },

  async removeUserData(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(USER_DATA_KEY);
    } catch (error) {
      console.error("Error removing user data:", error);
    }
  },

  async clearAll(): Promise<void> {
    await Promise.all([
      this.removeAccessToken(),
      this.removeRefreshToken(),
      this.removeUserData()
    ]);
  },
};
