import { apiClient } from "@/shared/api/client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { User } from "../types";

/**
 * Users API Service
 *
 * Provides type-safe methods for user-related API operations.
 * All methods return Axios responses with typed data.
 */

export const usersService = {
  /**
   * Get all users
   *
   * @param params - Optional query parameters (role, company_id, search)
   * @returns Promise with array of users
   * @example
   * const response = await usersService.getAll({ role: 'admin' });
   * const users = response.data;
   */
  getAll: (params?: {
    role?: string;
    company_id?: number;
    search?: string;
  }) => {
    return apiClient.get<User[]>(ENDPOINTS.USERS.LIST, { params });
  },

  /**
   * Get a single user by ID
   *
   * @param id - User ID
   * @returns Promise with user data
   * @example
   * const response = await usersService.getById(1);
   * const user = response.data;
   */
  getById: (id: number) => {
    return apiClient.get<User>(ENDPOINTS.USERS.DETAIL(id));
  },

  /**
   * Create a new user
   *
   * @param data - User data without ID
   * @returns Promise with created user
   * @example
   * const response = await usersService.create({
   *   name: 'New User',
   *   email: 'user@email.com',
   *   role: 'company',
   *   company_id: 1
   * });
   */
  create: (data: Omit<User, "id" | "picture">) => {
    return apiClient.post<User>(ENDPOINTS.USERS.CREATE, data);
  },

  /**
   * Update a user (full update)
   *
   * @param id - User ID
   * @param data - Complete user data
   * @returns Promise with updated user
   * @example
   * const response = await usersService.update(1, {
   *   name: 'Updated Name',
   *   email: 'updated@email.com',
   *   role: 'admin',
   *   company_id: 0
   * });
   */
  update: (id: number, data: Omit<User, "id" | "picture">) => {
    return apiClient.put<User>(ENDPOINTS.USERS.UPDATE(id), data);
  },

  /**
   * Partially update a user
   *
   * @param id - User ID
   * @param data - Partial user data
   * @returns Promise with updated user
   * @example
   * const response = await usersService.patch(1, { name: 'New Name' });
   */
  patch: (id: number, data: Partial<Omit<User, "id" | "picture">>) => {
    return apiClient.patch<User>(ENDPOINTS.USERS.UPDATE(id), data);
  },

  /**
   * Delete a user
   *
   * @param id - User ID
   * @returns Promise with void
   * @example
   * await usersService.delete(1);
   */
  delete: (id: number) => {
    return apiClient.delete(ENDPOINTS.USERS.DELETE(id));
  },
};
