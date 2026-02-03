import { apiClient } from "@/shared/api/client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { UserInvite } from "@/shared/types";

/**
 * User Invites API Service
 *
 * Provides type-safe methods for user invite-related API operations.
 * All methods return Axios responses with typed data.
 */

export const userInvitesService = {
  /**
   * Get all user invites
   *
   * @param params - Optional query parameters (status, company_id, role)
   * @returns Promise with array of user invites
   * @example
   * const response = await userInvitesService.getAll({ status: 'pending' });
   * const invites = response.data;
   */
  getAll: () => {
    return apiClient.get<UserInvite[]>(ENDPOINTS.USER_INVITES.LIST);
  },

  /**
   * Get a single user invite by ID
   *
   * @param id - User invite ID (string/UUID)
   * @returns Promise with user invite data
   * @example
   * const response = await userInvitesService.getById('abc123');
   * const invite = response.data;
   */
  getById: (id: string) => {
    return apiClient.get<UserInvite>(ENDPOINTS.USER_INVITES.DETAIL(id));
  },

  /**
   * Create a new user invite
   *
   * @param data - User invite data
   * @returns Promise with created user invite
   * @example
   * const response = await userInvitesService.create({
   *   company_id: 1,
   *   role: 'company',
   *   email: 'user@email.com',
   *   expires_at: '2026-01-22T23:59:59Z',
   *   created_by: 1
   * });
   */
  create: (
    data: Omit<UserInvite, "id" | "used_by" | "status" | "created_at">,
  ) => {
    return apiClient.post<UserInvite>(ENDPOINTS.USER_INVITES.CREATE, data);
  },

  /**
   * Delete a user invite
   *
   * @param id - User invite ID (string/UUID)
   * @returns Promise with void
   * @example
   * await userInvitesService.delete('abc123');
   */
  delete: (id: string) => {
    return apiClient.delete(ENDPOINTS.USER_INVITES.DELETE(id));
  },
};
