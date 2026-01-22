import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface PrivateRouteProps {
  children: React.ReactElement;
  allowedRoles?: string[];
}

/**
 * PrivateRoute component for route protection with RBAC
 *
 * Features:
 * - Redirects to /login if user is not authenticated
 * - Redirects to /unauthorized if user role is not in allowedRoles
 * - Dev mode override: devRole takes precedence over actual user role
 * - If no allowedRoles specified, only checks authentication
 */
export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, user, devRole } = useAuth();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is specified, check role permission
  if (allowedRoles && allowedRoles.length > 0) {
    // Dev mode override: devRole takes precedence
    const effectiveRole = devRole || user?.role;

    // Dev role "dev" has access to everything
    const hasPermission =
      effectiveRole === "dev" ||
      (effectiveRole && allowedRoles.includes(effectiveRole));

    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};
