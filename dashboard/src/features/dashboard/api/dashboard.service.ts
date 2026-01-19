import { apiClient } from "@/shared/api/client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { DashboardMetrics } from "../types";

/**
 * Dashboard API Service
 *
 * Provides type-safe methods for dashboard-related API operations.
 * All methods return Axios responses with typed data.
 *
 * Note: Recent activities are stored in localStorage, not fetched via API.
 */

export const dashboardService = {
  /**
   * Get dashboard metrics
   *
   * @returns Promise with dashboard metrics data
   * @example
   * const response = await dashboardService.getMetrics();
   * const metrics = response.data;
   */
  getMetrics: () => {
    return apiClient.get<DashboardMetrics>(ENDPOINTS.DASHBOARD.METRICS);
  },
};
