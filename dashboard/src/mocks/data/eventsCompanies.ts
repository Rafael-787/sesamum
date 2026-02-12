import type { EventCompany } from "@/features/events/types";

/**
 * Mock EventsCompanies Data
 * Represents the events_company relationship table
 * Links companies to events with their role (production or service)
 */
export let mockEventsCompanies: EventCompany[] = [
  // Event 1 - Festival de Música 2024
  { id: 1, event_id: 1, company_id: 1, role: "production", staff_limit: 100 },
  { id: 2, event_id: 1, company_id: 6, role: "service", staff_limit: 50 },

  // Event 2 - Conferência Tech Brasil
  { id: 3, event_id: 2, company_id: 2, role: "production", staff_limit: 80 },
  { id: 4, event_id: 2, company_id: 6, role: "service", staff_limit: 40 },

  // Event 3 - Workshop de Design
  { id: 5, event_id: 3, company_id: 1, role: "production", staff_limit: 30 },
  { id: 6, event_id: 3, company_id: 5, role: "service", staff_limit: 15 },

  // Event 4 - Evento Corporativo - Ano Novo
  { id: 7, event_id: 4, company_id: 3, role: "production", staff_limit: 200 },
  { id: 8, event_id: 4, company_id: 4, role: "service", staff_limit: 100 },

  // Event 5 - Feira de Negócios
  { id: 9, event_id: 5, company_id: 2, role: "production", staff_limit: 150 },
  { id: 10, event_id: 5, company_id: 4, role: "service", staff_limit: 75 },
  { id: 11, event_id: 5, company_id: 6, role: "service", staff_limit: 50 },

  // Event 6 - Show Beneficente (closed)
  { id: 12, event_id: 6, company_id: 5, role: "production", staff_limit: 60 },
  { id: 13, event_id: 6, company_id: 1, role: "service", staff_limit: 30 },
];

/**
 * Helper function to reset mock events_company to initial state.
 */
export const resetMockEventsCompanies = () => {
  mockEventsCompanies = [
    { id: 1, event_id: 1, company_id: 1, role: "production", staff_limit: 100 },
    { id: 2, event_id: 1, company_id: 6, role: "service", staff_limit: 50 },
    { id: 3, event_id: 2, company_id: 2, role: "production", staff_limit: 80 },
    { id: 4, event_id: 2, company_id: 6, role: "service", staff_limit: 40 },
    { id: 5, event_id: 3, company_id: 1, role: "production", staff_limit: 30 },
    { id: 6, event_id: 3, company_id: 5, role: "service", staff_limit: 15 },
    { id: 7, event_id: 4, company_id: 3, role: "production", staff_limit: 200 },
    { id: 8, event_id: 4, company_id: 4, role: "service", staff_limit: 100 },
    { id: 9, event_id: 5, company_id: 2, role: "production", staff_limit: 150 },
    { id: 10, event_id: 5, company_id: 4, role: "service", staff_limit: 75 },
    { id: 11, event_id: 5, company_id: 6, role: "service", staff_limit: 50 },
    { id: 12, event_id: 6, company_id: 5, role: "production", staff_limit: 60 },
    { id: 13, event_id: 6, company_id: 1, role: "service", staff_limit: 30 },
  ];
};
