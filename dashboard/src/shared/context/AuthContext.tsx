import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User } from "@/features/users/types";

/**
 * AuthContext
 *
 * Provides authentication state and methods throughout the application.
 * Manages JWT tokens (access and refresh) in localStorage.
 *
 * NOTE: Role-based access control is not implemented yet.
 * This is a basic implementation for token management only.
 *
 * Future enhancements:
 * - Add login/logout methods
 * - Add user role management (admin, company, control)
 * - Add permission checking utilities
 * - Integrate with actual auth endpoints
 */

interface AuthContextType {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  setTokens: (access: string, refresh: string) => void;
  clearTokens: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  // Mock user for development (in production, this would come from JWT or API)
  const [user] = useState<User>({
    id: 1,
    name: "Admin User",
    picture: "",
    email: "admin@sesamum.com",
    role: "admin",
    company_id: 1,
  });

  // Load tokens from localStorage on mount
  useEffect(() => {
    const storedAccessToken = localStorage.getItem("access_token");
    const storedRefreshToken = localStorage.getItem("refresh_token");

    if (storedAccessToken) {
      setAccessToken(storedAccessToken);
    }

    if (storedRefreshToken) {
      setRefreshToken(storedRefreshToken);
    }
  }, []);

  // Listen for logout events from API client
  useEffect(() => {
    const handleLogout = () => {
      clearTokens();
    };

    window.addEventListener("auth:logout", handleLogout);

    return () => {
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, []);

  const setTokens = (access: string, refresh: string) => {
    setAccessToken(access);
    setRefreshToken(refresh);
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
  };

  const clearTokens = () => {
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  };

  const isAuthenticated = Boolean(accessToken);

  const value: AuthContextType = {
    isAuthenticated,
    accessToken,
    refreshToken,
    user,
    setTokens,
    clearTokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use AuthContext
 *
 * @throws Error if used outside AuthProvider
 * @example
 * const { isAuthenticated, setTokens, clearTokens } = useAuth();
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
