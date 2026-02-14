// ==========================================
// 🔷 Shared Types - Sesamum Platform
// ==========================================

/**
 * Check action types for staff credentialing and access control
 */
export type CheckAction = "registration" | "check-in" | "check-out";

/**
 * Check record - Tracks staff registration, check-in, and check-out events
 */
export interface Check {
  id: number;
  action: CheckAction;
  timestamp: string;
  events_staff_id: string; // Nano UUID reference to events_staff
  user_control_id: number; // User with role 'control' who performed the action
  event_id?: number;
  is_registered?: boolean; // Optional: flag indicating if staff is registered
  last_status?: CheckAction; // Optional: flag indicating if staff is registered
  staff_name: string;
  staff_cpf: number;
}

/**
 * User invite status types
 */
export type UserInviteStatus = "pending" | "used" | "expired";

/**
 * User role types (excluding admin for invites)
 */
export type InviteRole = "company" | "control";

/**
 * User Invite - Represents a slot opened by Admin for a company to receive a new user
 */
export interface UserInvite {
  id: string; // Nano UUID used as token in invite URL
<<<<<<< HEAD
  company: any;
=======
  company: string;
>>>>>>> parent of b512fdf ([UI] Correção página sign-up)
  company_id: number;
  email?: string; // Optional - if set, restricts the slot to this specific email
  role: InviteRole;
  used_by: number | null; // User ID who consumed this invite (null = not used)
  status: UserInviteStatus; // Computed by server based on used_by and expires_at
  created_at: string;
  expires_at: string;
  created_by: number; // Admin user ID
}

/**
 * JWT token response structure
 */
export interface JWTTokens {
  access: string;
  refresh: string;
}

/**
 * Auth response with tokens and user data
 */
export interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    company: string;
    company_id: number;
  };
}

/**
 * Google OAuth login request payload
 */
export interface GoogleLoginRequest {
  token: string; // Google OAuth token (id_token)
}

/**
 * Google OAuth register request payload
 */
export interface GoogleRegisterRequest {
  token: string; // Google OAuth token (id_token)
  invite_token: string; // Nano UUID from user_invites table
}

/**
 * Dashboard metrics structure
 */
export interface DashboardMetrics {
  activeEvents: number;
  totalProjects: number;
  totalCompanies: number;
  totalUsers: number;
  recentCheckIns: number;
}

/**
 * Recent Activity item structure for local storage history
 */
export interface RecentActivity {
  id: number;
  type: "event" | "user" | "company" | "project" | "staff" | "checkin";
  title: string;
  description: string;
  url: string;
  entityId: number;
  timestamp: string;
}
