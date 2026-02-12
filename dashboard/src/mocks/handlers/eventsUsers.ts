import { http, HttpResponse, delay } from "msw";
import { mockEventsUsers } from "../data/eventsUsers";
import { mockEvents } from "../data/events";
import type { EventUser } from "@/features/events/types";

/**
 * EventUsers MSW Handlers
 *
 * These handlers simulate the event_users relationship API endpoints:
 * - GET    /api/v1/event-users/       - List events for a user or users for an event
 * - GET    /api/v1/event-users/:id/   - Get single event_user relationship by ID
 * - POST   /api/v1/event-users/       - Create new event_user relationship
 * - DELETE /api/v1/event-users/:id/   - Delete event_user relationship
 *
 * All handlers include realistic delays to simulate network latency.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const eventUsersHandlers = [
  // GET /api/v1/event-users/ - List event-user relationships
  // Supports filtering by user_id or event_id
  // When user_id is provided, returns full Event objects
  http.get(`${API_BASE_URL}/api/v1/event-users/`, async ({ request }) => {
    await delay(600);

    const url = new URL(request.url);
    const userIdParam = url.searchParams.get("user_id");
    const eventIdParam = url.searchParams.get("event_id");

    let filtered = [...mockEventsUsers];

    // Filter by user_id - return events for this user
    if (userIdParam) {
      const userId = Number(userIdParam);
      const userEventRelations = filtered.filter((eu) => eu.user_id === userId);

      // Get the actual events for this user
      const eventIds = userEventRelations.map((eu) => eu.event_id);
      const userEvents = mockEvents.filter((e) => eventIds.includes(e.id));

      return HttpResponse.json(userEvents, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Filter by event_id - return users for this event
    if (eventIdParam) {
      const eventId = Number(eventIdParam);
      filtered = filtered.filter((eu) => eu.event_id === eventId);
    }

    return HttpResponse.json(filtered, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),

  // GET /api/v1/event-users/:id/ - Get single event_user relationship
  http.get(`${API_BASE_URL}/api/v1/event-users/:id/`, async ({ params }) => {
    await delay(400);

    const relationId = Number(params.id);
    const relation = mockEventsUsers.find((eu) => eu.id === relationId);

    if (!relation) {
      return HttpResponse.json(
        { detail: "Event-User relationship not found" },
        { status: 404 },
      );
    }

    return HttpResponse.json(relation, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),

  // POST /api/v1/event-users/ - Create new event_user relationship
  http.post(`${API_BASE_URL}/api/v1/event-users/`, async ({ request }) => {
    await delay(800);

    const newRelationData = (await request.json()) as Omit<EventUser, "id">;

    // Validation
    if (!newRelationData.user_id || !newRelationData.event_id) {
      return HttpResponse.json(
        { detail: "user_id and event_id are required" },
        { status: 400 },
      );
    }

    // Check if relationship already exists
    const exists = mockEventsUsers.some(
      (eu) =>
        eu.user_id === newRelationData.user_id &&
        eu.event_id === newRelationData.event_id,
    );

    if (exists) {
      return HttpResponse.json(
        { detail: "User is already assigned to this event" },
        { status: 400 },
      );
    }

    // Create new relationship
    const newRelation: EventUser = {
      id: Math.max(...mockEventsUsers.map((eu) => eu.id), 0) + 1,
      ...newRelationData,
    };

    mockEventsUsers.push(newRelation);

    return HttpResponse.json(newRelation, {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),

  // DELETE /api/v1/event-users/:id/ - Delete event_user relationship
  http.delete(`${API_BASE_URL}/api/v1/event-users/:id/`, async ({ params }) => {
    await delay(600);

    const relationId = Number(params.id);
    const index = mockEventsUsers.findIndex((eu) => eu.id === relationId);

    if (index === -1) {
      return HttpResponse.json(
        { detail: "Event-User relationship not found" },
        { status: 404 },
      );
    }

    mockEventsUsers.splice(index, 1);

    return new HttpResponse(null, { status: 204 });
  }),
];
