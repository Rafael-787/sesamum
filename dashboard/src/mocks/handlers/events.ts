import { http, HttpResponse, delay } from "msw";
import { mockEvents } from "../data/events";
import { mockEventsCompanies } from "../data/eventsCompanies";
import type { Event } from "../../types";

/**
 * Events MSW Handlers
 *
 * These handlers simulate the events API endpoints with full CRUD operations:
 * - GET    /api/v1/events/       - List all events (role-based filtering)
 * - GET    /api/v1/events/:id/   - Get single event by ID
 * - POST   /api/v1/events/       - Create new event (admin only)
 * - PUT    /api/v1/events/:id/   - Update event (admin/company limited)
 * - DELETE /api/v1/events/:id/   - Delete event (admin only)
 *
 * Role-Based Access Control:
 * - admin: Full access to all events
 * - company: See only events where their company is assigned (via EventCompany)
 * - control: Read-only access to all events
 *
 * All handlers include realistic delays to simulate network latency.
 * CRUD operations modify the in-memory mockEvents array to simulate persistence
 * during the browser session.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Helper function to extract user info from the Authorization token
 * For mock tokens, this decodes the payload embedded in the token
 */
function getUserFromToken(authHeader: string | null): {
  user_id: number;
  role: string;
  company_id?: number;
} | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);

  // Check if it's a mock token (format: mock_access_<base64payload>)
  if (token.startsWith("mock_access_")) {
    try {
      const payloadBase64 = token.substring(12); // Remove "mock_access_" prefix
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
      return {
        user_id: payload.user_id,
        role: payload.role,
        company_id: payload.company_id,
      };
    } catch (error) {
      console.error("Failed to decode mock token:", error);
      return null;
    }
  }

  // For real JWT tokens, you would decode them here
  // For now, return null for non-mock tokens
  return null;
}

/**
 * Get user role from request headers (checks token first, then dev header)
 */
function getUserRole(request: Request): {
  role: string;
  company_id?: number;
  user_id?: number;
} {
  // Try to get from token first
  const authHeader = request.headers.get("Authorization");
  const userFromToken = getUserFromToken(authHeader);

  if (userFromToken) {
    return userFromToken;
  }

  // Fallback to dev header for testing
  const devRole = request.headers.get("X-User-Role");
  return {
    role: devRole || "admin", // Default to admin if no role specified
    company_id: devRole === "company" ? 1 : undefined, // Mock: company users are from company_id 1
    user_id: 1,
  };
}

export const eventHandlers = [
  // GET /api/v1/events/ - List all events with role-based filtering
  http.get(`${API_BASE_URL}/api/v1/events/`, async ({ request }) => {
    await delay(1000);

    // Get user role and company from token/headers
    const userContext = getUserRole(request);

    // Parse query parameters for filtering
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const projectId = url.searchParams.get("project_id");
    const search = url.searchParams.get("search");

    let filteredEvents = [...mockEvents];

    // Role-based filtering
    // Admin: sees all events
    // Company: sees only events where their company is assigned (production or service)
    // Control: sees all events (read-only enforced on mutations)
    if (userContext.role === "company" && userContext.company_id) {
      // Get event IDs where this company is assigned
      const companyEventIds = mockEventsCompanies
        .filter((ec) => ec.company_id === userContext.company_id)
        .map((ec) => ec.event_id);

      // Filter events to only those assigned to this company
      filteredEvents = filteredEvents.filter((event) =>
        companyEventIds.includes(event.id),
      );
    }

    // Apply search/filter parameters
    if (status) {
      filteredEvents = filteredEvents.filter(
        (event) => event.status === status,
      );
    }
    if (projectId) {
      filteredEvents = filteredEvents.filter(
        (event) => event.project_id === Number(projectId),
      );
    }
    if (search) {
      // Search only in event name (as per requirements)
      const searchLower = search.toLowerCase();
      filteredEvents = filteredEvents.filter((event) =>
        event.name.toLowerCase().includes(searchLower),
      );
    }

    return HttpResponse.json(filteredEvents, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),

  // GET /api/v1/events/:id/ - Get single event with role-based access
  http.get(
    `${API_BASE_URL}/api/v1/events/:id/`,
    async ({ params, request }) => {
      await delay(600);

      // Get user role and company from token/headers
      const userContext = getUserRole(request);

      const eventId = Number(params.id);
      const event = mockEvents.find((e) => e.id === eventId);

      if (!event) {
        return HttpResponse.json(
          { detail: "Event not found." },
          { status: 404 },
        );
      }

      // Role-based access control
      if (userContext.role === "company" && userContext.company_id) {
        // Check if company has access to this event
        const hasAccess = mockEventsCompanies.some(
          (ec) =>
            ec.event_id === eventId && ec.company_id === userContext.company_id,
        );

        if (!hasAccess) {
          return HttpResponse.json(
            { detail: "You don't have permission to view this event." },
            { status: 403 },
          );
        }
      }

      return HttpResponse.json(event, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
  ),

  // POST /api/v1/events/ - Create new event (admin only)
  http.post(`${API_BASE_URL}/api/v1/events/`, async ({ request }) => {
    await delay(800);

    // Get user role and company from token/headers
    const userContext = getUserRole(request);

    // Only admin can create events
    // Control role is read-only
    if (userContext.role === "control") {
      return HttpResponse.json(
        { detail: "Control users have read-only access." },
        { status: 403 },
      );
    }

    // Company users can create events (will be associated with their company)
    if (userContext.role === "company" && !userContext.company_id) {
      return HttpResponse.json(
        { detail: "Company ID not found in user context." },
        { status: 403 },
      );
    }

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
          { status: 400 },
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
        { status: 400 },
      );
    }
  }),

  // PUT /api/v1/events/:id/ - Update event (admin and assigned companies)
  http.put(
    `${API_BASE_URL}/api/v1/events/:id/`,
    async ({ params, request }) => {
      await delay(700);

      // Get user role and company from token/headers
      const userContext = getUserRole(request);

      // Control role is read-only
      if (userContext.role === "control") {
        return HttpResponse.json(
          { detail: "Control users have read-only access." },
          { status: 403 },
        );
      }

      const eventId = Number(params.id);
      const eventIndex = mockEvents.findIndex((e) => e.id === eventId);

      if (eventIndex === -1) {
        return HttpResponse.json(
          { detail: "Event not found." },
          { status: 404 },
        );
      }

      // Company users can only update events they're assigned to
      if (userContext.role === "company" && userContext.company_id) {
        const hasAccess = mockEventsCompanies.some(
          (ec) =>
            ec.event_id === eventId && ec.company_id === userContext.company_id,
        );

        if (!hasAccess) {
          return HttpResponse.json(
            { detail: "You don't have permission to update this event." },
            { status: 403 },
          );
        }
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
          { status: 400 },
        );
      }
    },
  ),

  // PATCH /api/v1/events/:id/ - Partial update event (admin and assigned companies)
  http.patch(
    `${API_BASE_URL}/api/v1/events/:id/`,
    async ({ params, request }) => {
      await delay(700);

      // Get user role and company from token/headers
      const userContext = getUserRole(request);

      // Control role is read-only
      if (userContext.role === "control") {
        return HttpResponse.json(
          { detail: "Control users have read-only access." },
          { status: 403 },
        );
      }

      const eventId = Number(params.id);
      const eventIndex = mockEvents.findIndex((e) => e.id === eventId);

      if (eventIndex === -1) {
        return HttpResponse.json(
          { detail: "Event not found." },
          { status: 404 },
        );
      }

      // Company users can only update events they're assigned to
      if (userContext.role === "company" && userContext.company_id) {
        const hasAccess = mockEventsCompanies.some(
          (ec) =>
            ec.event_id === eventId && ec.company_id === userContext.company_id,
        );

        if (!hasAccess) {
          return HttpResponse.json(
            { detail: "You don't have permission to update this event." },
            { status: 403 },
          );
        }
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
          { status: 400 },
        );
      }
    },
  ),

  // DELETE /api/v1/events/:id/ - Delete event (admin only)
  http.delete(
    `${API_BASE_URL}/api/v1/events/:id/`,
    async ({ params, request }) => {
      await delay(600);

      // Get user role and company from token/headers
      const userContext = getUserRole(request);

      // Only admin can delete events
      // Control role is read-only, company role cannot delete
      if (userContext.role !== "admin") {
        return HttpResponse.json(
          { detail: "Only administrators can delete events." },
          { status: 403 },
        );
      }

      const eventId = Number(params.id);
      const eventIndex = mockEvents.findIndex((e) => e.id === eventId);

      if (eventIndex === -1) {
        return HttpResponse.json(
          { detail: "Event not found." },
          { status: 404 },
        );
      }

      // Remove from mock data
      mockEvents.splice(eventIndex, 1);

      return new HttpResponse(null, {
        status: 204,
      });
    },
  ),
];
