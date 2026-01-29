import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User } from "@/features/users/types";
import {
  validateToken,
  logout as apiLogout,
} from "@/features/auth/api/auth.service";
import { useNavigate } from "react-router-dom";

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
  isLoading: boolean;
  setTokens: (token: string) => void;
  clearTokens: () => void;
  setDevRole: (role: "admin" | "company" | "control" | "dev" | null) => void;
  logout: () => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isDevMode = devRole !== null;

  // Hybrid validation: decode JWT, then confirm with /me
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const storedAccessToken = localStorage.getItem("token");
      const storedDevRole = localStorage.getItem("dev_role") as
        | "admin"
        | "company"
        | "control"
        | "dev"
        | null;

      if (storedDevRole) {
        setDevRoleState(storedDevRole);
      }

      if (!storedAccessToken) {
        clearTokens();
        setIsLoading(false);
        return;
      }

      setAccessToken(storedAccessToken);

      // Confirm with backend /me endpoint
      try {
        const me = await validateToken(storedAccessToken);
        let role: "admin" | "company" | "control" = "admin";
        if (devRole && devRole !== "dev") {
          role = devRole;
        } else if (["admin", "company", "control"].includes(me.role)) {
          role = me.role as "admin" | "company" | "control";
        }
        setUser({
          id: me.user_id,
          name: "", // Optionally fetch from /me if available
          picture: "",
          email: me.email,
          role,
          company_id: me.company_id || 1,
        });
      } catch {
        clearTokens();
        setUser(null);
      }
      setIsLoading(false);
    };
    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

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

  const setTokens = (token: string) => {
    setAccessToken(token);
    localStorage.setItem("token", token);
  };

  const clearTokens = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("dev_role");
  };

  // Hybrid logout: call backend, clear tokens, navigate
  const logout = async () => {
    const refresh = localStorage.getItem("refresh_token");
    try {
      if (refresh) await apiLogout(refresh);
    } catch {}
    clearTokens();
    //navigate("/login");
  };

  const setDevRole = (role: "admin" | "company" | "control" | "dev" | null) => {
    setDevRoleState(role);
    if (role) {
      localStorage.setItem("dev_role", role);
    } else {
      localStorage.removeItem("dev_role");
    }
  };

  const isAuthenticated = Boolean(accessToken && user);

  const value: AuthContextType = {
    isAuthenticated,
    accessToken,
    refreshToken,
    user,
    devRole,
    isDevMode,
    isLoading,
    setTokens,
    clearTokens,
    setDevRole,
    logout,
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
