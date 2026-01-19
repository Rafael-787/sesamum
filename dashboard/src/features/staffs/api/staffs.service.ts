import { apiClient } from "@/shared/api/client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { Staff } from "../types";

/**
 * Staffs API Service
 *
 * Provides type-safe methods for staff-related API operations.
 * All methods return Axios responses with typed data.
 */

export const staffsService = {
  /**
   * Get all staffs
   *
   * @param params - Optional query parameters (company_id, search)
   * @returns Promise with array of staffs
   * @example
   * const response = await staffsService.getAll({ company_id: 1 });
   * const staffs = response.data;
   */
  getAll: (params?: { company_id?: number; search?: string }) => {
    return apiClient.get<Staff[]>(ENDPOINTS.STAFFS.LIST, { params });
  },

  /**
   * Get a single staff by ID
   *
   * @param id - Staff ID
   * @returns Promise with staff data
   * @example
   * const response = await staffsService.getById(1);
   * const staff = response.data;
   */
  getById: (id: number) => {
    return apiClient.get<Staff>(ENDPOINTS.STAFFS.DETAIL(id));
  },

  /**
   * Create a new staff
   *
   * @param data - Staff data without ID
   * @returns Promise with created staff
   * @example
   * const response = await staffsService.create({
   *   name: 'New Staff',
   *   cpf: '123.456.789-00',
   *   email: 'staff@email.com',
   *   company_id: 1
   * });
   */
  create: (data: Omit<Staff, "id" | "created_at">) => {
    return apiClient.post<Staff>(ENDPOINTS.STAFFS.CREATE, data);
  },

  /**
   * Update a staff (full update)
   *
   * @param id - Staff ID
   * @param data - Complete staff data
   * @returns Promise with updated staff
   * @example
   * const response = await staffsService.update(1, {
   *   name: 'Updated Name',
   *   cpf: '123.456.789-00',
   *   email: 'updated@email.com',
   *   company_id: 1
   * });
   */
  update: (id: number, data: Omit<Staff, "id" | "created_at">) => {
    return apiClient.put<Staff>(ENDPOINTS.STAFFS.UPDATE(id), data);
  },

  /**
   * Partially update a staff
   *
   * @param id - Staff ID
   * @param data - Partial staff data
   * @returns Promise with updated staff
   * @example
   * const response = await staffsService.patch(1, { name: 'New Name' });
   */
  patch: (id: number, data: Partial<Omit<Staff, "id" | "created_at">>) => {
    return apiClient.patch<Staff>(ENDPOINTS.STAFFS.UPDATE(id), data);
  },

  /**
   * Delete a staff
   *
   * @param id - Staff ID
   * @returns Promise with void
   * @example
   * await staffsService.delete(1);
   */
  delete: (id: number) => {
    return apiClient.delete(ENDPOINTS.STAFFS.DELETE(id));
  },

  /**
   * Get all staffs for a specific event
   *
   * Uses the event_staff relationship endpoint to fetch staffs by event_id.
   * Returns full Staff objects associated with the specified event.
   *
   * @param eventId - Event ID
   * @returns Promise with array of staffs
   * @example
   * const response = await staffsService.getByEvent(1);
   * const staffs = response.data;
   */
  getByEvent: (eventId: number) => {
    return apiClient.get<Staff[]>(ENDPOINTS.EVENT_STAFF.LIST, {
      params: { event_id: eventId },
    });
  },
};
