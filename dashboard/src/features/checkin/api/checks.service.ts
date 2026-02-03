import apiClient from "@/shared/api/client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { Check, CheckAction } from "@/shared/types";

export interface CreateCheckData {
  action: CheckAction;
  events_staff_id: string;
  user_control_id: number;
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
  getById: async (id: number) => {
    return apiClient.get<Check>(`${ENDPOINTS.CHECKS.LIST}${id}/`);
  },
  SearchStaff: async (eventId: number, params?: { search?: string }) => {
    return apiClient.get<Check[]>(ENDPOINTS.CHECKS.SEARCH_STAFF(eventId), {
      params,
    });
  },
};
