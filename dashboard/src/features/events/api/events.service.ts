import { apiClient } from "@/shared/api/client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { Event } from "../types";

/**
 * Events API Service
 *
 * Provides type-safe methods for event-related API operations.
 * Supports full CRUD operations (Create, Read, Update, Delete).
 */

export const eventsService = {
  /**
   * Get all events
   *
   * @param params - Optional query parameters for filtering
   * @returns Promise with array of events
   * @example
   * const response = await eventsService.getAll();
   * const events = response.data;
   *
   * // With filters
   * const response = await eventsService.getAll({ status: 'open', project_id: 1 });
   */
  getAll: (params?: { status?: string; project_id?: number }) => {
    return apiClient.get<Event[]>(ENDPOINTS.EVENTS.LIST, { params });
  },

  /**
   * Get a single event by ID
   *
   * @param id - Event ID
   * @returns Promise with event data
   * @example
   * const response = await eventsService.getById(1);
   * const event = response.data;
   */
  getById: (id: number) => {
    return apiClient.get<Event>(ENDPOINTS.EVENTS.DETAIL(id));
  },

  /**
   * Create a new event
   *
   * @param data - Event data (without ID)
   * @returns Promise with created event
   * @example
   * const response = await eventsService.create({
   *   name: 'New Event',
   *   date_begin: '2026-02-01T10:00:00Z',
   *   date_end: '2026-02-01T18:00:00Z',
   *   status: 'open',
   *   project_id: 1,
   * });
   * const newEvent = response.data;
   */
  create: (data: Omit<Event, "id">) => {
    return apiClient.post<Event>(ENDPOINTS.EVENTS.CREATE, data);
  },

  /**
   * Update an existing event (full update)
   *
   * @param id - Event ID
   * @param data - Complete event data
   * @returns Promise with updated event
   * @example
   * const response = await eventsService.update(1, {
   *   ...existingEvent,
   *   name: 'Updated Name',
   * });
   * const updatedEvent = response.data;
   */
  update: (id: number, data: Partial<Event>) => {
    return apiClient.put<Event>(ENDPOINTS.EVENTS.UPDATE(id), data);
  },

  /**
   * Partially update an existing event
   *
   * @param id - Event ID
   * @param data - Partial event data to update
   * @returns Promise with updated event
   * @example
   * const response = await eventsService.patch(1, { status: 'close' });
   * const updatedEvent = response.data;
   */
  patch: (id: number, data: Partial<Event>) => {
    return apiClient.patch<Event>(ENDPOINTS.EVENTS.UPDATE(id), data);
  },

  /**
   * Delete an event
   *
   * @param id - Event ID
   * @returns Promise with no content (204)
   * @example
   * await eventsService.delete(1);
   */
  delete: (id: number) => {
    return apiClient.delete(ENDPOINTS.EVENTS.DELETE(id));
  },

  /**
   * Get all events for a specific user
   *
   * @param userId - User ID
   * @returns Promise with array of events assigned to the user
   * @example
   * const response = await eventsService.getByUser(1);
   * const userEvents = response.data;
   */
  getByUser: (userId: number) => {
    return apiClient.get<Event[]>(ENDPOINTS.EVENT_USERS.LIST, {
      params: { user_id: userId },
    });
  },

  /**
   * Get all events for a specific staff member
   *
   * @param staffCpf - Staff CPF
   * @returns Promise with array of events assigned to the staff
   * @example
   * const response = await eventsService.getByStaff('123.456.789-00');
   * const staffEvents = response.data;
   */
  getByStaff: (staffCpf: string) => {
    return apiClient.get<Event[]>(ENDPOINTS.EVENT_STAFF.LIST, {
      params: { staff_cpf: staffCpf },
    });
  },

  /**
   * Get all events for a specific company
   *
   * @param companyId - Company ID
   * @returns Promise with array of events assigned to the company
   * @example
   * const response = await eventsService.getByCompany(1);
   * const companyEvents = response.data;
   */
  getByCompany: (companyId: number) => {
    return apiClient.get<Event[]>(ENDPOINTS.EVENT_COMPANIES.LIST, {
      params: { company_id: companyId },
    });
  },
};
