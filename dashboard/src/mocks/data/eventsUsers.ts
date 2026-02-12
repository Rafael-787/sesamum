import type { EventUser } from "@/features/events/types";

/**
 * Mock EventsUser Data
 * Represents the events_user relationship table
 * Links users to events they are assigned to
 */
export let mockEventsUsers: EventUser[] = [
  // User 1 (Admin) - assigned to multiple events
  { id: 1, user_id: 1, event_id: 1 },
  { id: 2, user_id: 1, event_id: 2 },
  { id: 3, user_id: 1, event_id: 4 },

  // User 2 (Carlos Manager - company 1)
  { id: 4, user_id: 2, event_id: 1 },
  { id: 5, user_id: 2, event_id: 3 },

  // User 3 (Ana Control - company 1)
  { id: 6, user_id: 3, event_id: 1 },
  { id: 7, user_id: 3, event_id: 6 },

  // User 4 (Roberto Manager - company 2)
  { id: 8, user_id: 4, event_id: 2 },
  { id: 9, user_id: 4, event_id: 5 },

  // User 5 (Juliana Control - company 2)
  { id: 10, user_id: 5, event_id: 2 },
  { id: 11, user_id: 5, event_id: 5 },

  // User 6 (Pedro Manager - company 3)
  { id: 12, user_id: 6, event_id: 4 },

  // User 7 (Maria Control - company 4)
  { id: 13, user_id: 7, event_id: 5 },

  // User 8 (João Manager - company 5)
  { id: 14, user_id: 8, event_id: 3 },
  { id: 15, user_id: 8, event_id: 6 },
];

/**
 * Helper function to reset mock events_user to initial state.
 */
export const resetMockEventsUsers = () => {
  mockEventsUsers = [
    { id: 1, user_id: 1, event_id: 1 },
    { id: 2, user_id: 1, event_id: 2 },
    { id: 3, user_id: 1, event_id: 4 },
    { id: 4, user_id: 2, event_id: 1 },
    { id: 5, user_id: 2, event_id: 3 },
    { id: 6, user_id: 3, event_id: 1 },
    { id: 7, user_id: 3, event_id: 6 },
    { id: 8, user_id: 4, event_id: 2 },
    { id: 9, user_id: 4, event_id: 5 },
    { id: 10, user_id: 5, event_id: 2 },
    { id: 11, user_id: 5, event_id: 5 },
    { id: 12, user_id: 6, event_id: 4 },
    { id: 13, user_id: 7, event_id: 5 },
    { id: 14, user_id: 8, event_id: 3 },
    { id: 15, user_id: 8, event_id: 6 },
  ];
};
