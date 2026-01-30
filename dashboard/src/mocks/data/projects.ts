import type { Project } from "@/features/projects";

/**
 * Mock Projects Data
 *
 * Sample project data for MSW handlers.
 * Use `let` to allow CRUD operations to modify the array.
 */

export let mockProjects: Project[] = [
  {
    id: 1,
    name: "Carnaval 2026",
    status: "open",
    company_id: 1,
    date_begin: "2026-02-14T00:00:00Z",
    date_end: "2026-02-17T23:59:59Z",
    events_qnt: 12,
    company_role: "production",
  },
  {
    id: 2,
    name: "Festival de Verão",
    status: "open",
    company_id: 1,
    date_begin: "2026-01-10T00:00:00Z",
    date_end: "2026-01-31T23:59:59Z",
    events_qnt: 8,
    company_role: "production",
  },
  {
    id: 3,
    name: "Tech Conference 2025 (service)",
    status: "close",
    company_id: 2,
    date_begin: "2025-11-01T00:00:00Z",
    date_end: "2025-11-03T23:59:59Z",
    events_qnt: 5,
    company_role: "service",
  },
  {
    id: 4,
    name: "Exposição Agropecuária",
    status: "open",
    company_id: 4,
    date_begin: "2026-03-01T00:00:00Z",
    date_end: "2026-03-15T23:59:59Z",
    events_qnt: 15,
    company_role: "production",
  },
  {
    id: 5,
    name: "Maratona São Paulo (service)",
    status: "open",
    company_id: 3,
    date_begin: "2026-04-20T00:00:00Z",
    date_end: "2026-04-20T23:59:59Z",
    events_qnt: 3,
    company_role: "service",
  },
  {
    id: 6,
    name: "Festival de Cinema",
    status: "close",
    company_id: 5,
    date_begin: "2025-10-15T00:00:00Z",
    date_end: "2025-10-22T23:59:59Z",
    events_qnt: 20,
    company_role: "production",
  },
  {
    id: 7,
    name: "Semana da Inovação (service)",
    status: "pending",
    company_id: 2,
    date_begin: "2026-05-10T00:00:00Z",
    date_end: "2026-05-17T23:59:59Z",
    events_qnt: 0,
    company_role: "service",
  },
];

/**
 * Helper function to reset mock projects to initial state.
 * Useful for testing or resetting the application state.
 */
export const resetMockProjects = () => {
  mockProjects = [
    {
      id: 1,
      name: "Carnaval 2026",
      status: "open",
      company_id: 1,
      date_begin: "2026-02-14T00:00:00Z",
      date_end: "2026-02-17T23:59:59Z",
      events_qnt: 12,
    },
    {
      id: 2,
      name: "Festival de Verão",
      status: "open",
      company_id: 1,
      date_begin: "2026-01-10T00:00:00Z",
      date_end: "2026-01-31T23:59:59Z",
      events_qnt: 8,
    },
    {
      id: 3,
      name: "Tech Conference 2025",
      status: "close",
      company_id: 2,
      date_begin: "2025-11-01T00:00:00Z",
      date_end: "2025-11-03T23:59:59Z",
      events_qnt: 5,
    },
    {
      id: 4,
      name: "Exposição Agropecuária",
      status: "open",
      company_id: 4,
      date_begin: "2026-03-01T00:00:00Z",
      date_end: "2026-03-15T23:59:59Z",
      events_qnt: 15,
    },
    {
      id: 5,
      name: "Maratona São Paulo",
      status: "open",
      company_id: 3,
      date_begin: "2026-04-20T00:00:00Z",
      date_end: "2026-04-20T23:59:59Z",
      events_qnt: 3,
    },
    {
      id: 6,
      name: "Festival de Cinema",
      status: "close",
      company_id: 5,
      date_begin: "2025-10-15T00:00:00Z",
      date_end: "2025-10-22T23:59:59Z",
      events_qnt: 20,
    },
    {
      id: 7,
      name: "Semana da Inovação",
      status: "pending",
      company_id: 2,
      date_begin: "2026-05-10T00:00:00Z",
      date_end: "2026-05-17T23:59:59Z",
      events_qnt: 0,
    },
  ];
};
