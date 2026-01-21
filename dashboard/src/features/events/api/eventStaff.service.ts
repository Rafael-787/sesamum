/**
 * Event Staff Service
 *
 * Handles API calls for event-staff relationships.
 */

import { apiClient } from "@/shared/api/client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { EventStaff, CreateEventStaffPayload } from "../types";

interface EventStaffParams {
  staff_cpf?: string;
  event_id?: number;
  project_id?: number;
}

export const eventStaffService = {
  /**
   * Get all event-staff relationships
   * Supports filtering by staff_cpf, event_id, or project_id
   */
  getAll: async (params?: EventStaffParams) => {
    return apiClient.get<EventStaff[]>(ENDPOINTS.EVENT_STAFF.LIST, { params });
  },

  /**
   * Get a specific event-staff relationship by ID
   */
  getById: async (id: string | number) => {
    return apiClient.get<EventStaff>(ENDPOINTS.EVENT_STAFF.DETAIL(id));
  },

  /**
   * Create a new event-staff relationship
   */
  create: async (data: CreateEventStaffPayload) => {
    return apiClient.post<EventStaff>(ENDPOINTS.EVENT_STAFF.CREATE, data);
  },

  /**
   * Delete an event-staff relationship
   */
  delete: async (id: string | number) => {
    return apiClient.delete(ENDPOINTS.EVENT_STAFF.DELETE(id));
  },

  /**
   * Bulk create event-staff relationships
   */
  createBulk: async (
    eventId: number,
    staff: Array<{ cpf: string; name: string; email?: string }>,
  ) => {
    return apiClient.post(ENDPOINTS.EVENT_STAFF.BULK(eventId), { staff });
  },
};
