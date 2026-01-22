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
 * Development Mode:
 * - Supports role switching via setDevRole() for testing different permissions
 * - Dev role persists in localStorage across page refreshes
 * - User.role reflects the dev role when in development mode
 */

interface AuthContextType {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  devRole: "admin" | "company" | "control" | "dev" | null;
  isDevMode: boolean;
  setTokens: (access: string, refresh: string) => void;
  clearTokens: () => void;
  setDevRole: (role: "admin" | "company" | "control" | "dev" | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [devRole, setDevRoleState] = useState<
    "admin" | "company" | "control" | "dev" | null
  >(null);

  // Base user for development (in production, this would come from JWT or API)
  const baseUser: User = {
    id: 1,
    name: "Admin User",
    picture: "",
    email: "admin@sesamum.com",
    role: "admin",
    company_id: 1,
  };

  // Return user with dev role override if in dev mode
  // Note: 'dev' role shows all menus but keeps admin permissions
  const user: User | null = devRole
    ? { ...baseUser, role: devRole === "dev" ? "admin" : devRole }
    : baseUser;

  const isDevMode = devRole !== null;

  // Load tokens and dev role from localStorage on mount
  useEffect(() => {
    const storedAccessToken = localStorage.getItem("access_token");
    const storedRefreshToken = localStorage.getItem("refresh_token");
    const storedDevRole = localStorage.getItem("dev_role") as
      | "admin"
      | "company"
      | "control"
      | "dev"
      | null;

    if (storedAccessToken) {
      setAccessToken(storedAccessToken);
    }

    if (storedRefreshToken) {
      setRefreshToken(storedRefreshToken);
    }

    if (storedDevRole) {
      setDevRoleState(storedDevRole);
    } else {
      // Default to 'dev' role for development mode
      setDevRoleState("dev");
      localStorage.setItem("dev_role", "dev");
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

  const setDevRole = (role: "admin" | "company" | "control" | "dev" | null) => {
    setDevRoleState(role);
    if (role) {
      localStorage.setItem("dev_role", role);
    } else {
      localStorage.removeItem("dev_role");
    }
  };

  const isAuthenticated = Boolean(accessToken);

  const value: AuthContextType = {
    isAuthenticated,
    accessToken,
    refreshToken,
    user,
    devRole,
    isDevMode,
    setTokens,
    clearTokens,
    setDevRole,
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
