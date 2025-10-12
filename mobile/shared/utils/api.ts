import axios from "axios";
import { tokenStorage } from "./storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Create a single axios instance for the entire app
export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add authorization header
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await tokenStorage.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn("Failed to get token:", error);
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}:`, response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (error.code === "ECONNABORTED") {
      console.error("Request timeout");
      error.message = "Request timeout. Please check your connection.";
      return Promise.reject(error);
    }

    if (error.code === "ERR_NETWORK" || !error.response) {
      console.error("Network error:", error.message);
      error.message =
        "Network error. Please check your connection and ensure the backend server is running.";
      return Promise.reject(error);
    }

    // Log error responses for debugging
    console.log(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });

    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get refresh token from storage
        const refreshToken = await tokenStorage.getRefreshToken();
        
        if (!refreshToken) {
          // No refresh token available, clear auth data
          await tokenStorage.clearAll();
          return Promise.reject(error);
        }

        // Try to refresh token
        const refreshResponse = await axios.post(
          `${API_URL}/auth/refresh`,
          { refreshToken }, // Send refresh token in body for mobile
          {
            timeout: 10000,
            headers: {
              "Content-Type": "application/json",
            }
          }
        );

        const newAccessToken = refreshResponse.data.accessToken;
        const newRefreshToken = refreshResponse.data.refreshToken;
        
        await tokenStorage.setAccessToken(newAccessToken);
        if (newRefreshToken) {
          await tokenStorage.setRefreshToken(newRefreshToken);
        }

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear auth data
        await tokenStorage.clearAll();
        console.warn("Token refresh failed:", refreshError);
      }
    }

    return Promise.reject(error);
  }
);
