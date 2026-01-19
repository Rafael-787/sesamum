/**
 * API Endpoints
 *
 * This file contains all API endpoint paths organized by domain.
 * These constants should be used with the apiClient to make requests.
 *
 * Base URL: /api/v1/ (configured in apiClient)
 *
 * Usage:
 *   import { ENDPOINTS } from '@/api/endpoints';
 *   apiClient.get(ENDPOINTS.EVENTS.LIST);
 */

export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/api/v1/auth/login/",
    REFRESH: "/api/v1/auth/refresh/",
    LOGOUT: "/api/v1/auth/logout/",
  },

  // Dashboard
  DASHBOARD: {
    METRICS: "/api/v1/dashboard/metrics/",
    ACTIVITIES: "/api/v1/dashboard/activities/",
  },

  // Events
  EVENTS: {
    LIST: "/api/v1/events/",
    DETAIL: (id: number) => `/api/v1/events/${id}/`,
    CREATE: "/api/v1/events/",
    UPDATE: (id: number) => `/api/v1/events/${id}/`,
    DELETE: (id: number) => `/api/v1/events/${id}/`,
  },

  // Projects
  PROJECTS: {
    LIST: "/api/v1/projects/",
    DETAIL: (id: number) => `/api/v1/projects/${id}/`,
    CREATE: "/api/v1/projects/",
    UPDATE: (id: number) => `/api/v1/projects/${id}/`,
    DELETE: (id: number) => `/api/v1/projects/${id}/`,
  },

  // Companies
  COMPANIES: {
    LIST: "/api/v1/companies/",
    DETAIL: (id: number) => `/api/v1/companies/${id}/`,
    CREATE: "/api/v1/companies/",
    UPDATE: (id: number) => `/api/v1/companies/${id}/`,
    DELETE: (id: number) => `/api/v1/companies/${id}/`,
  },

  // Staff
  STAFFS: {
    LIST: "/api/v1/staffs/",
    DETAIL: (id: number) => `/api/v1/staffs/${id}/`,
    CREATE: "/api/v1/staffs/",
    UPDATE: (id: number) => `/api/v1/staffs/${id}/`,
    DELETE: (id: number) => `/api/v1/staffs/${id}/`,
  },

  // Users
  USERS: {
    LIST: "/api/v1/users/",
    DETAIL: (id: number) => `/api/v1/users/${id}/`,
    CREATE: "/api/v1/users/",
    UPDATE: (id: number) => `/api/v1/users/${id}/`,
    DELETE: (id: number) => `/api/v1/users/${id}/`,
  },

  // Checks (Check-in/out)
  CHECKS: {
    LIST: "/api/v1/checks/",
    CREATE: "/api/v1/checks/",
  },

  // Event Companies (Relationship)
  EVENT_COMPANIES: {
    LIST: "/api/v1/event-companies/",
    DETAIL: (id: number) => `/api/v1/event-companies/${id}/`,
    CREATE: "/api/v1/event-companies/",
    DELETE: (id: number) => `/api/v1/event-companies/${id}/`,
  },

  // Event Staff (Relationship)
  EVENT_STAFF: {
    LIST: "/api/v1/event-staff/",
    DETAIL: (id: number) => `/api/v1/event-staff/${id}/`,
    CREATE: "/api/v1/event-staff/",
    DELETE: (id: number) => `/api/v1/event-staff/${id}/`,
    BULK: (eventId: number) => `/api/v1/events/${eventId}/staff/bulk`,
  },

  // Event Users (Relationship)
  EVENT_USERS: {
    LIST: "/api/v1/event-users/",
    DETAIL: (id: number) => `/api/v1/event-users/${id}/`,
    CREATE: "/api/v1/event-users/",
    DELETE: (id: number) => `/api/v1/event-users/${id}/`,
  },
} as const;
