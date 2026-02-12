/**
 * API Endpoints
 *
 * This file contains all API endpoint paths organized by domain.
 * These constants should be used with the apiClient to make requests.
 *
 * Base URL: /api/v1/ (configured in apiClient)
 *
 * Usage:
 * import { ENDPOINTS } from '@/api/endpoints';
 * apiClient.get(ENDPOINTS.EVENTS.LIST);
 */

export const ENDPOINTS = {
  // Authentication
  AUTH: {
    GOOGLE_LOGIN: "/api/v1/auth/google/login/",
    GOOGLE_REGISTER: "/api/v1/auth/google/register/",
    ME: "/api/v1/auth/me/",
  },

  // Dashboard
  DASHBOARD: {
    METRICS: "/api/v1/dashboard/metrics/",
  },

  // Events
  EVENTS: {
    LIST: "/api/v1/events/",
    DETAIL: (id: number) => `/api/v1/events/${id}/`,
    CREATE: "/api/v1/events/",
    UPDATE: (id: number) => `/api/v1/events/${id}/`,
    DELETE: (id: number) => `/api/v1/events/${id}/`,
    OVERVIEW: (id: number) => `/api/v1/events/${id}/overview/`,
    STAFFS_TAB: (eventId: number) => `/api/v1/events/${eventId}/staffs/`,
    COMPANIES_TAB: (eventId: number) => `/api/v1/events/${eventId}/companies/`,
  },

  // Projects
  PROJECTS: {
    LIST: "/api/v1/projects/",
    DETAIL: (id: number) => `/api/v1/projects/${id}/`,
    CREATE: "/api/v1/projects/",
    UPDATE: (id: number) => `/api/v1/projects/${id}/`,
    DELETE: (id: number) => `/api/v1/projects/${id}/`,
    EVENTS_TAB: (id: number) => `/api/v1/projects/${id}/events/`,
    COMPANIES_TAB: (id: number) => `/api/v1/projects/${id}/companies/`,
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

  // User Invites
  USER_INVITES: {
    LIST: "/api/v1/invites/",
    CREATE: "/api/v1/invites/",
    DETAIL: (id: string) => `/api/v1/invites/${id}/`,
    DELETE: (id: string) => `/api/v1/invites/${id}/`,
  },

  // Checks (Check-in/out)
  CHECKS: {
    LIST: "/api/v1/checks/",
    CREATE: "/api/v1/checks/",
    SEARCH_STAFF: (eventId: number) =>
      `/api/v1/checks/${eventId}/events-staff/`,
  },

  // Event Companies (Relationship)
  EVENT_COMPANIES: {
    LIST: "/api/v1/event-companies/",
    CREATE: (eventId: number, companyId: number) =>
      `/api/v1/events/${eventId}/company/${companyId}/`,
    REMOVE: (eventId: number, companyId: number) =>
      `/api/v1/events/${eventId}/company/${companyId}/`,
  },

  // Event Staff (Relationship)
  EVENT_STAFF: {
    LIST: "/api/v1/event-staff/",
    ASSIGN: (eventId: number, staffId: number) =>
      `/api/v1/events/${eventId}/staff/${staffId}/`,
    REMOVE: (eventId: number, staffId: number) =>
      `/api/v1/events/${eventId}/staff/${staffId}/`,
    BULK: (eventId: number) => `/api/v1/events/${eventId}/staff/bulk/`,
  },
} as const;
