import axios, { type AxiosInstance, type AxiosError } from "axios";

/**
 * API Client Configuration
 *
 * This module creates and configures the Axios instance used for all API requests.
 * It includes:
 * - Base URL configuration from environment variables
 * - Request interceptors for authentication tokens
 * - Response interceptors for error handling
 * - Default headers and timeout settings
 */

// Get base URL from environment variables, fallback to localhost
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Axios instance with pre-configured settings
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor
 * Adds JWT token and user context to all requests if available
 */
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage (will be managed by AuthContext)
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add dev role for MSW to apply role-based filtering
    const devRole = localStorage.getItem("dev_role");
    if (devRole) {
      config.headers["X-User-Role"] = devRole;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Response interceptor
 * Handles common error scenarios and token refresh
 */
apiClient.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Refresh failed, clear tokens and redirect to login
      localStorage.removeItem("access_token");

      // Dispatch custom event for AuthContext to handle
      window.dispatchEvent(new CustomEvent("auth:logout"));

      return Promise.reject(error.response);
    }

    // Handle other errors
    if (error.response) {
      // Server responded with error status
      console.error("API Error:", {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
    } else if (error.request) {
      // Request made but no response received
      console.error("Network Error: No response received", {
        url: error.config?.url,
      });
    } else {
      // Something else happened
      console.error("Request Error:", error.message);
    }

    return Promise.reject(error);
  },
);

/**
 * Helper function to handle API errors consistently
 */
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Server responded with an error
      const data = error.response.data as any;
      return data?.detail || data?.message || "An error occurred";
    } else if (error.request) {
      // Network error
      return "Network error. Please check your connection.";
    }
  }

  return "An unexpected error occurred";
};

export default apiClient;
