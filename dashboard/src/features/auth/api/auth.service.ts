import { apiClient } from "@/shared/api/client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type {
  AuthResponse,
  GoogleLoginRequest,
  GoogleRegisterRequest,
} from "@/shared/types";

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
    { token, invite_token } as GoogleRegisterRequest,
  );
  return response.data;
}

export const DEV_ACCESS_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJlbWFpbCI6ImFkbWluQHNlc2FtdW0uY29tIiwicm9sZSI6ImFkbWluIiwiY29tcGFueV9pZCI6MSwidG9rZW5fdHlwZSI6ImFjY2VzcyIsImV4cCI6MTg0ODI2ODAwMH0.abc123";
export const DEV_REFRESH_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJlbWFpbCI6ImFkbWluQHNlc2FtdW0uY29tIiwidG9rZW5fdHlwZSI6InJlZnJlc2giLCJleHAiOjE4NDgyNjgwMDB9.def456";

export async function login(email: string, password: string) {
  // ...existing code...
}

export async function logout(refreshToken: string) {
  // Simulate backend logout
  return Promise.resolve({ message: "Successfully logged out" });
}

export async function validateToken(accessToken: string) {
  // Simulate backend /me endpoint
  // Always returns the decoded token for dev
  return Promise.resolve({
    user_id: 1,
    email: "admin@sesamum.com",
    role: "admin",
    company_id: 1,
    token_type: "access",
    exp: 1848268000,
  } as DecodedJWT);
}
