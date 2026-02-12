import { apiClient } from "@/shared/api/client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { AuthResponse, GoogleLoginRequest } from "@/shared/types";

/**
 * Google OAuth login service
 * @param token - Google OAuth id_token from Google Sign-In
 * @returns AuthResponse with JWT tokens and user data
 */
export async function googleLogin(token: string): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(
    ENDPOINTS.AUTH.GOOGLE_LOGIN,
    { token } as GoogleLoginRequest,
  );
  return response.data;
}

/**
 * Google OAuth registration service
 * @param token - Google OAuth id_token from Google Sign-In
 * @param invite_token - User invite token (nano UUID)
 * @returns AuthResponse with JWT tokens and user data
 */
export async function googleRegister(
  token: string,
  invite_token: string,
): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(
    ENDPOINTS.AUTH.GOOGLE_REGISTER,
    { google_token: token, invite_token } as any,
  );
  return response.data;
}

export const DEV_ACCESS_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJlbWFpbCI6ImFkbWluQHNlc2FtdW0uY29tIiwicm9sZSI6ImFkbWluIiwiY29tcGFueV9pZCI6MSwidG9rZW5fdHlwZSI6ImFjY2VzcyIsImV4cCI6MTg0ODI2ODAwMH0.abc123";
export const DEV_REFRESH_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJlbWFpbCI6ImFkbWluQHNlc2FtdW0uY29tIiwidG9rZW5fdHlwZSI6InJlZnJlc2giLCJleHAiOjE4NDgyNjgwMDB9.def456";

export async function login(_email: string, _password: string) {
  // ...existing code...
}

export async function logout(_refreshToken: string) {
  // Simulate backend logout
  return Promise.resolve({ message: "Successfully logged out" });
}

export async function validateToken() {
  const response = await apiClient.get(ENDPOINTS.AUTH.ME);
  return response.data;
}
