import { useAuth } from "../context/AuthContext";

export type Resource =
  | "project"
  | "event"
  | "company"
  | "staff"
  | "user"
  | "check";
export type Action = "create" | "read" | "update" | "delete";

export const usePermissions = () => {
  const { user } = useAuth();

  /**
   * Check if the current user can perform an action on a resource.
   *
   * @param action - The action to perform (create, read, update, delete)
   * @param resource - The resource type
   * @param item - Optional item with company_id for ownership checks
   * @returns true if the user has permission, false otherwise
   */
  const can = (
    action: Action,
    resource: Resource,
    item?: { company_id?: number },
  ): boolean => {
    if (!user) return false;

    // Admin can do everything
    if (user.role === "admin") return true;

    // Control role: can only create/read checks, read everything else
    if (user.role === "control") {
      if (resource === "check" && (action === "create" || action === "read")) {
        return true;
      }
      // Can view everything but cannot modify
      if (action === "read") return true;
      return false;
    }

    // Company role
    if (user.role === "company") {
      // Can CRUD their own company's staff
      if (resource === "staff") {
        if (action === "read") return true;
        // For CUD operations, check company ownership
        if (item && item.company_id !== undefined) {
          return item.company_id === user.company_id;
        }
        // If no item provided for create, assume they're creating for their own company
        if (action === "create") return true;
        return false;
      }
      // Can read everything else
      if (action === "read") return true;
      return false;
    }

    return false;
  };

  /**
   * Check if the current user is an admin.
   */
  const isAdmin = (): boolean => user?.role === "admin";

  /**
   * Check if the current user is a company user.
   */
  const isCompany = (): boolean => user?.role === "company";

  /**
   * Check if the current user is a control user.
   */
  const isControl = (): boolean => user?.role === "control";

  /**
   * Check if the current user is in dev mode.
   * Note: 'dev' is a development-only role for testing purposes.
   */
  const isDev = (): boolean => user?.role === "admin"; // dev role is treated as admin

  return { can, isAdmin, isCompany, isControl, isDev, user };
};
