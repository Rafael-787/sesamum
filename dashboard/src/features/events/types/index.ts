import type { Check } from "@/shared/types";
import type { Staff } from "@/features/staffs";

export type { Check };

export interface StaffWithStatus extends Staff {
  last_status?: Check;
}

// Event type based on copilot-instructions
export interface Event {
  id: number;
  name: string;
  description?: string;
  date_begin: string;
  date_end: string;
  status: "open" | "close" | "pending";
  project_id?: number;
  type?: "event" | "project";
  location?: string;
  staffs_qnt?: number;
  companies?: EventCompany[];
  company_role?: "production" | "service";
}

export interface EventCompany {
  id: number;
  role: "production" | "service";
  event_id: number;
  company_id: number;
  staff_limit: number;
}

/**
 * EventStaff - Staff-to-Event assignment with credentialing control
 * Per API instructions: ID is Nano UUID, registration_check_id controls check-in/out access
 */
export interface EventStaff {
  id: string; // Nano UUID (e.g., "es_V1StGXR8_Z5jdHi6B")
  event_id: number;
  staff_id?: number; // Populated by backend from staff_cpf
  staff_cpf?: string; // Redundant field for fast lookup
  registration_check_id?: number | null; // FK to checks table - NULL means not yet registered
  created_at?: string; // Server-generated
  created_by?: number; // User ID who created the assignment - Server-generated
  last_status?: Check; // Optional: last check for UI display
  is_registered?: boolean; // Optional: flag indicating if staff is registered
  staff_name?: string; // Flattened field from staff relation
}

/**
 * Payload for creating a new EventStaff relationship
 * Only requires event_id and staff_cpf; other fields are server-generated
 */
export type CreateEventStaffPayload = Pick<
  EventStaff,
  "event_id" | "staff_cpf" | "created_by" | "staff_id"
>;

export interface EventUser {
  id: number;
  user_id: number;
  event_id: number;
}

export interface Overview {
  metrics: {
    total_staff: number;
    total_companies?: number;
    staff_limit?: number;
  };
  companies?: {
    name: string;
    registration_count: number;
    staff_limit: number;
  }[];
}
