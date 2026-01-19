/**
 * Event Companies Service
 *
 * Handles API calls for event-company relationships.
 */

import { apiClient } from "@/shared/api/client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { EventCompany } from "../types";
import type { Company } from "@/features/companies/types";

interface EventCompanyParams {
  company_id?: number;
  event_id?: number;
  project_id?: number;
}

interface CompanyWithRole extends Company {
  role: "production" | "service";
  staffCount?: number;
}

export const eventCompaniesService = {
  /**
   * Get all event-company relationships
   * Supports filtering by company_id, event_id, or project_id
   * When event_id is provided, returns companies for that event with their role
   * When company_id is provided, returns events for that company
   */
  getAll: async (params?: EventCompanyParams) => {
    return apiClient.get<CompanyWithRole[]>(ENDPOINTS.EVENT_COMPANIES.LIST, {
      params,
    });
  },

  /**
   * Get a specific event-company relationship by ID
   */
  getById: async (id: number) => {
    return apiClient.get<EventCompany>(ENDPOINTS.EVENT_COMPANIES.DETAIL(id));
  },

  /**
   * Create a new event-company relationship
   */
  create: async (data: Omit<EventCompany, "id">) => {
    return apiClient.post<EventCompany>(ENDPOINTS.EVENT_COMPANIES.CREATE, data);
  },

  /**
   * Delete an event-company relationship
   */
  delete: async (id: number) => {
    return apiClient.delete(ENDPOINTS.EVENT_COMPANIES.DELETE(id));
  },
};
