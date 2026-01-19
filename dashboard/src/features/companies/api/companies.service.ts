import { apiClient } from "@/shared/api/client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { Company, CompanyWithEventData } from "../types";

/**
 * Companies API Service
 *
 * Provides type-safe methods for company-related API operations.
 * All methods return Axios responses with typed data.
 */

export const companiesService = {
  /**
   * Get all companies
   *
   * @param params - Optional query parameters (type, search)
   * @returns Promise with array of companies
   * @example
   * const response = await companiesService.getAll({ type: 'production' });
   * const companies = response.data;
   */
  getAll: (params?: { type?: string; search?: string }) => {
    return apiClient.get<Company[]>(ENDPOINTS.COMPANIES.LIST, { params });
  },

  /**
   * Get a single company by ID
   *
   * @param id - Company ID
   * @returns Promise with company data
   * @example
   * const response = await companiesService.getById(1);
   * const company = response.data;
   */
  getById: (id: number) => {
    return apiClient.get<Company>(ENDPOINTS.COMPANIES.DETAIL(id));
  },

  /**
   * Create a new company
   *
   * @param data - Company data without ID
   * @returns Promise with created company
   * @example
   * const response = await companiesService.create({
   *   name: 'New Company',
   *   cnpj: '12.345.678/0001-90',
   *   type: 'production'
   * });
   */
  create: (data: Omit<Company, "id">) => {
    return apiClient.post<Company>(ENDPOINTS.COMPANIES.CREATE, data);
  },

  /**
   * Update a company (full update)
   *
   * @param id - Company ID
   * @param data - Complete company data
   * @returns Promise with updated company
   * @example
   * const response = await companiesService.update(1, {
   *   name: 'Updated Name',
   *   cnpj: '12.345.678/0001-90',
   *   type: 'service'
   * });
   */
  update: (id: number, data: Omit<Company, "id">) => {
    return apiClient.put<Company>(ENDPOINTS.COMPANIES.UPDATE(id), data);
  },

  /**
   * Partially update a company
   *
   * @param id - Company ID
   * @param data - Partial company data
   * @returns Promise with updated company
   * @example
   * const response = await companiesService.patch(1, { name: 'New Name' });
   */
  patch: (id: number, data: Partial<Omit<Company, "id">>) => {
    return apiClient.patch<Company>(ENDPOINTS.COMPANIES.UPDATE(id), data);
  },

  /**
   * Delete a company
   *
   * @param id - Company ID
   * @returns Promise with void
   * @example
   * await companiesService.delete(1);
   */
  delete: (id: number) => {
    return apiClient.delete(ENDPOINTS.COMPANIES.DELETE(id));
  },

  /**
   * Get all companies for a specific event
   *
   * @param eventId - Event ID
   * @returns Promise with array of companies assigned to the event with role and staffCount
   * @example
   * const response = await companiesService.getByEvent(1);
   * const eventCompanies = response.data;
   */
  getByEvent: (eventId: number) => {
    return apiClient.get<CompanyWithEventData[]>(
      ENDPOINTS.EVENT_COMPANIES.LIST,
      {
        params: { event_id: eventId },
      },
    );
  },
};
