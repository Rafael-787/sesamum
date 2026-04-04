import apiClient from "@/shared/api/client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { Check, CheckAction } from "@/shared/types";
import type { EventStaff } from "@/features/events/types";
import type { Event } from "@/features/events/types";

export interface CreateCheckData {
  action: CheckAction;
  events_staff: string;
}

export const checksService = {
  /**
   * Get all checks with optional filtering
   */
  getAll: async (params?: {
    events_staff_id?: string;
    action?: CheckAction;
  }) => {
    return apiClient.get<Check[]>(ENDPOINTS.CHECKS.LIST, { params });
  },

  /**
   * Create a new check (registration, check-in, or check-out)
   */
  create: async (data: CreateCheckData) => {
    return apiClient.post<Check>(ENDPOINTS.CHECKS.CREATE, data);
  },

  /**
   * Get check by ID
   */
  getById: async (id: string) => {
    return apiClient.get<EventStaff>(`${ENDPOINTS.CHECKS.BY_ID(id)}`);
  },
  getEvents: async () => {
    return apiClient.get<Event[]>(`${ENDPOINTS.CHECKS.LIST_EVENTS}`);
  },
  SearchStaff: async (eventId: number, params?: { search?: string }) => {
    return apiClient.get<EventStaff[]>(ENDPOINTS.CHECKS.SEARCH_STAFF(eventId), {
      params,
    });
  },

  /**
   * Get label to print
   */
  getPrintLabel: (id: string) => {
    return apiClient.get(ENDPOINTS.CHECKS.PRINT_LABEL(id));
  },
};
