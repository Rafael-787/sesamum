import { apiClient } from "@/shared/api/client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { Project } from "../types";

/**
 * Projects API Service
 *
 * Provides type-safe methods for project-related API operations.
 * All methods return Axios responses with typed data.
 */

export const projectsService = {
  /**
   * Get all projects
   *
   * @param params - Optional query parameters (status, company_id, search)
   * @returns Promise with array of projects
   * @example
   * const response = await projectsService.getAll({ status: 'open' });
   * const projects = response.data;
   */
  getAll: (params?: {
    status?: string;
    company_id?: number;
    search?: string;
  }) => {
    return apiClient.get<Project[]>(ENDPOINTS.PROJECTS.LIST, { params });
  },

  /**
   * Get a single project by ID
   *
   * @param id - Project ID
   * @returns Promise with project data
   * @example
   * const response = await projectsService.getById(1);
   * const project = response.data;
   */
  getById: (id: number) => {
    return apiClient.get<Project>(ENDPOINTS.PROJECTS.DETAIL(id));
  },

  /**
   * Create a new project
   *
   * @param data - Project data without ID
   * @returns Promise with created project
   * @example
   * const response = await projectsService.create({
   *   name: 'New Project',
   *   status: 'open',
   *   company_id: 1
   * });
   */
  create: (data: Omit<Project, "id">) => {
    return apiClient.post<Project>(ENDPOINTS.PROJECTS.CREATE, data);
  },

  /**
   * Update a project (full update)
   *
   * @param id - Project ID
   * @param data - Complete project data
   * @returns Promise with updated project
   * @example
   * const response = await projectsService.update(1, {
   *   name: 'Updated Name',
   *   status: 'close',
   *   company_id: 1
   * });
   */
  update: (id: number, data: Omit<Project, "id">) => {
    return apiClient.put<Project>(ENDPOINTS.PROJECTS.UPDATE(id), data);
  },

  /**
   * Partially update a project
   *
   * @param id - Project ID
   * @param data - Partial project data
   * @returns Promise with updated project
   * @example
   * const response = await projectsService.patch(1, { status: 'close' });
   */
  patch: (id: number, data: Partial<Omit<Project, "id">>) => {
    return apiClient.patch<Project>(ENDPOINTS.PROJECTS.UPDATE(id), data);
  },

  /**
   * Delete a project
   *
   * @param id - Project ID
   * @returns Promise with void
   * @example
   * await projectsService.delete(1);
   */
  delete: (id: number) => {
    return apiClient.delete(ENDPOINTS.PROJECTS.DELETE(id));
  },
};
