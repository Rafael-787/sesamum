import { http, HttpResponse, delay } from "msw";
import { mockEventsCompanies } from "../data/eventsCompanies";
import { mockEvents } from "../data/events";
import { mockCompanies } from "../data/companies";
import type { EventCompany } from "@/features/events/types";

/**
 * EventCompanies MSW Handlers
 *
 * These handlers simulate the event_companies relationship API endpoints:
 * - GET    /api/v1/event-companies/       - List events for a company or companies for an event
 * - GET    /api/v1/event-companies/:id/   - Get single event_company relationship by ID
 * - POST   /api/v1/event-companies/       - Create new event_company relationship
 * - DELETE /api/v1/event-companies/:id/   - Delete event_company relationship
 *
 * All handlers include realistic delays to simulate network latency.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const eventCompaniesHandlers = [
  // GET /api/v1/event-companies/ - List event-company relationships
  // Supports filtering by company_id or event_id
  // When company_id is provided, returns full Event objects
  http.get(`${API_BASE_URL}/api/v1/event-companies/`, async ({ request }) => {
    await delay(600);

    const url = new URL(request.url);
    const companyIdParam = url.searchParams.get("company_id");
    const eventIdParam = url.searchParams.get("event_id");

    let filtered = [...mockEventsCompanies];

    // Filter by company_id - return events for this company
    if (companyIdParam) {
      const companyId = Number(companyIdParam);
      const companyEventRelations = filtered.filter(
        (ec) => ec.company_id === companyId,
      );

      // Get the actual events for this company
      const eventIds = companyEventRelations.map((ec) => ec.event_id);
      const companyEvents = mockEvents.filter((e) => eventIds.includes(e.id));

      return HttpResponse.json(companyEvents, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Filter by event_id - return companies for this event with their role
    if (eventIdParam) {
      const eventId = Number(eventIdParam);
      const eventCompanyRelations = filtered.filter(
        (ec) => ec.event_id === eventId,
      );

      // Get the actual companies for this event with enriched data
      const enrichedCompanies = eventCompanyRelations
        .map((relation) => {
          const company = mockCompanies.find(
            (c) => c.id === relation.company_id,
          );
          return company
            ? {
                ...company,
                role: relation.role,
                staffCount: 0, // TODO: Calculate from EventStaff when available
              }
            : null;
        })
        .filter((c) => c !== null);

      return HttpResponse.json(enrichedCompanies, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return HttpResponse.json(filtered, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),

  // GET /api/v1/event-companies/:id/ - Get single event_company relationship
  http.get(
    `${API_BASE_URL}/api/v1/event-companies/:id/`,
    async ({ params }) => {
      await delay(400);

      const relationId = Number(params.id);
      const relation = mockEventsCompanies.find((ec) => ec.id === relationId);

      if (!relation) {
        return HttpResponse.json(
          { detail: "Event-Company relationship not found" },
          { status: 404 },
        );
      }

      return HttpResponse.json(relation, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
  ),

  // POST /api/v1/event-companies/ - Create new event_company relationship
  http.post(`${API_BASE_URL}/api/v1/event-companies/`, async ({ request }) => {
    await delay(800);

    const newRelationData = (await request.json()) as Omit<EventCompany, "id">;

    // Validation
    if (!newRelationData.company_id || !newRelationData.event_id) {
      return HttpResponse.json(
        { detail: "company_id and event_id are required" },
        { status: 400 },
      );
    }

    if (!newRelationData.role) {
      return HttpResponse.json({ detail: "role is required" }, { status: 400 });
    }

    if (!["production", "service"].includes(newRelationData.role)) {
      return HttpResponse.json(
        { detail: "role must be 'production' or 'service'" },
        { status: 400 },
      );
    }

    // Check if relationship already exists
    const exists = mockEventsCompanies.some(
      (ec) =>
        ec.company_id === newRelationData.company_id &&
        ec.event_id === newRelationData.event_id,
    );

    if (exists) {
      return HttpResponse.json(
        { detail: "Company is already assigned to this event" },
        { status: 400 },
      );
    }

    // Create new relationship
    const newRelation: EventCompany = {
      id: Math.max(...mockEventsCompanies.map((ec) => ec.id), 0) + 1,
      ...newRelationData,
    };

    mockEventsCompanies.push(newRelation);

    return HttpResponse.json(newRelation, {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),

  // DELETE /api/v1/event-companies/:id/ - Delete event_company relationship
  http.delete(
    `${API_BASE_URL}/api/v1/event-companies/:id/`,
    async ({ params }) => {
      await delay(600);

      const relationId = Number(params.id);
      const index = mockEventsCompanies.findIndex((ec) => ec.id === relationId);

      if (index === -1) {
        return HttpResponse.json(
          { detail: "Event-Company relationship not found" },
          { status: 404 },
        );
      }

      mockEventsCompanies.splice(index, 1);

      return new HttpResponse(null, { status: 204 });
    },
  ),
];
