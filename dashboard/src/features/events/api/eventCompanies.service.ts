/**
 * Event Companies Service
 *
 * Handles API calls for event-company relationships.
 */

import { apiClient } from "@/shared/api/client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { EventCompany } from "../types";

export const eventCompaniesService = {
  create: async (data: Omit<EventCompany, "id">) => {
    return apiClient.post<EventCompany>(
      ENDPOINTS.EVENT_COMPANIES.CREATE(data.event_id, data.company_id),
      data,
    );
  },

  delete: async (event_id: number, company_id: number) => {
    return apiClient.delete(
      ENDPOINTS.EVENT_COMPANIES.REMOVE(event_id, company_id),
    );
  },

  update: async (
    event_id: number,
    company_id: number,
    data: { staff_limit: number },
  ) => {
    return apiClient.put(
      ENDPOINTS.EVENT_COMPANIES.CREATE(event_id, company_id),
      data,
    );
  },
};
