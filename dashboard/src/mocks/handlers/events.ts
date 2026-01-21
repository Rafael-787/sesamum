import { http, HttpResponse, delay } from "msw";
import { mockEvents } from "../data/events";
import type { Event } from "../../types";

/**
 * Events MSW Handlers
 *
 * These handlers simulate the events API endpoints with full CRUD operations:
 * - GET    /api/v1/events/       - List all events
 * - GET    /api/v1/events/:id/   - Get single event by ID
 * - POST   /api/v1/events/       - Create new event
 * - PUT    /api/v1/events/:id/   - Update event
 * - DELETE /api/v1/events/:id/   - Delete event
 *
 * All handlers include realistic delays to simulate network latency.
 * CRUD operations modify the in-memory mockEvents array to simulate persistence
 * during the browser session.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const eventHandlers = [
  // GET /api/v1/events/ - List all events
  http.get(`${API_BASE_URL}/api/v1/events/`, async ({ request }) => {
    await delay(1000);

    // Parse query parameters for filtering
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const projectId = url.searchParams.get("project_id");
    const search = url.searchParams.get("search");

    let filteredEvents = [...mockEvents];

    // Apply filters if provided
    if (status) {
      filteredEvents = filteredEvents.filter(
        (event) => event.status === status
      );
    }
    if (projectId) {
      filteredEvents = filteredEvents.filter(
        (event) => event.project_id === Number(projectId)
      );
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filteredEvents = filteredEvents.filter((event) =>
        event.name.toLowerCase().includes(searchLower)
      );
    }

    return HttpResponse.json(filteredEvents, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),

  // GET /api/v1/events/:id/ - Get single event
  http.get(`${API_BASE_URL}/api/v1/events/:id/`, async ({ params }) => {
    await delay(600);

    const eventId = Number(params.id);
    const event = mockEvents.find((e) => e.id === eventId);

    if (!event) {
      return HttpResponse.json({ detail: "Event not found." }, { status: 404 });
    }

    return HttpResponse.json(event, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),

  // POST /api/v1/events/ - Create new event
  http.post(`${API_BASE_URL}/api/v1/events/`, async ({ request }) => {
    await delay(800);

    try {
      const newEventData = (await request.json()) as Omit<Event, "id">;

      // Validate required fields
      if (
        !newEventData.name ||
        !newEventData.date_begin ||
        !newEventData.date_end
      ) {
        return HttpResponse.json(
          { detail: "Missing required fields: name, date_begin, date_end" },
          { status: 400 }
        );
      }

      // Generate new ID
      const newId = Math.max(...mockEvents.map((e) => e.id), 0) + 1;

      const newEvent: Event = {
        id: newId,
        ...newEventData,
        status: newEventData.status || "open",
        staffs_qnt: newEventData.staffs_qnt || 0,
      };

      // Add to mock data
      mockEvents.push(newEvent);

      return HttpResponse.json(newEvent, {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      return HttpResponse.json(
        { detail: "Invalid request body" },
        { status: 400 }
      );
    }
  }),

  // PUT /api/v1/events/:id/ - Update event
  http.put(
    `${API_BASE_URL}/api/v1/events/:id/`,
    async ({ params, request }) => {
      await delay(700);

      const eventId = Number(params.id);
      const eventIndex = mockEvents.findIndex((e) => e.id === eventId);

      if (eventIndex === -1) {
        return HttpResponse.json(
          { detail: "Event not found." },
          { status: 404 }
        );
      }

      try {
        const updates = (await request.json()) as Partial<Event>;

        // Merge updates with existing event
        const updatedEvent: Event = {
          ...mockEvents[eventIndex],
          ...updates,
          id: eventId, // Ensure ID cannot be changed
        };

        // Update in mock data
        mockEvents[eventIndex] = updatedEvent;

        return HttpResponse.json(updatedEvent, {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        return HttpResponse.json(
          { detail: "Invalid request body" },
          { status: 400 }
        );
      }
    }
  ),

  // PATCH /api/v1/events/:id/ - Partial update event
  http.patch(
    `${API_BASE_URL}/api/v1/events/:id/`,
    async ({ params, request }) => {
      await delay(700);

      const eventId = Number(params.id);
      const eventIndex = mockEvents.findIndex((e) => e.id === eventId);

      if (eventIndex === -1) {
        return HttpResponse.json(
          { detail: "Event not found." },
          { status: 404 }
        );
      }

      try {
        const updates = (await request.json()) as Partial<Event>;

        // Merge updates with existing event
        const updatedEvent: Event = {
          ...mockEvents[eventIndex],
          ...updates,
          id: eventId, // Ensure ID cannot be changed
        };

        // Update in mock data
        mockEvents[eventIndex] = updatedEvent;

        return HttpResponse.json(updatedEvent, {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        return HttpResponse.json(
          { detail: "Invalid request body" },
          { status: 400 }
        );
      }
    }
  ),

  // DELETE /api/v1/events/:id/ - Delete event
  http.delete(`${API_BASE_URL}/api/v1/events/:id/`, async ({ params }) => {
    await delay(600);

    const eventId = Number(params.id);
    const eventIndex = mockEvents.findIndex((e) => e.id === eventId);

    if (eventIndex === -1) {
      return HttpResponse.json({ detail: "Event not found." }, { status: 404 });
    }

    // Remove from mock data
    mockEvents.splice(eventIndex, 1);

    return new HttpResponse(null, {
      status: 204,
    });
  }),
];
