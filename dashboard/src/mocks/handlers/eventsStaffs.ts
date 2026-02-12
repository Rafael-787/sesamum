import { http, HttpResponse, delay } from "msw";
import { mockEventsStaffs, generateEventStaffId } from "../data/eventsStaffs";
import { mockEvents } from "../data/events";
import { mockStaffs, sanitizeCPF } from "../data/staffs";
import { getLastCheckForStaff } from "../data/checks";
import type { EventStaff } from "../../features/events/types";

/**
 * EventStaffs MSW Handlers
 *
 * These handlers simulate the event_staff relationship API endpoints:
 * - GET    /api/v1/event-staff/       - List events for a staff or staff for an event
 * - GET    /api/v1/event-staff/:id/   - Get single event_staff relationship by ID
 * - POST   /api/v1/event-staff/       - Create new event_staff relationship
 * - DELETE /api/v1/event-staff/:id/   - Delete event_staff relationship
 *
 * All handlers include realistic delays to simulate network latency.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Helper function to enrich EventStaff with lastCheck
 */
const enrichWithLastCheck = (eventStaff: EventStaff): EventStaff => {
  const lastCheck = getLastCheckForStaff(eventStaff.id);
  return {
    ...eventStaff,
    last_status: lastCheck || undefined,
  };
};

export const eventStaffsHandlers = [
  // GET /api/v1/event-staff/ - List event-staff relationships
  // Supports filtering by staff_cpf, event_id, or both
  // When both staff_cpf and event_id are provided, returns EventStaff objects
  // When only staff_cpf is provided, returns full Event objects
  // When only event_id is provided, returns full Staff objects
  http.get(`${API_BASE_URL}/api/v1/event-staff/`, async ({ request }) => {
    await delay(600);

    const url = new URL(request.url);
    const staffCpfParam = url.searchParams.get("staff_cpf");
    const eventIdParam = url.searchParams.get("event_id");

    let filtered = [...mockEventsStaffs];

    // Filter by both staff_cpf AND event_id - return EventStaff objects
    if (staffCpfParam && eventIdParam) {
      const eventId = Number(eventIdParam);
      const sanitizedCpf = sanitizeCPF(staffCpfParam);

      const eventStaffRelations = filtered.filter(
        (es) => es.staff_cpf === sanitizedCpf && es.event_id === eventId,
      );

      // Enrich with lastCheck before returning
      const enrichedRelations = eventStaffRelations.map(enrichWithLastCheck);

      return HttpResponse.json(enrichedRelations, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Filter by staff_cpf only - return events for this staff member
    if (staffCpfParam) {
      const staffEventRelations = filtered.filter(
        (es) => es.staff_cpf === staffCpfParam,
      );

      // Get the actual events for this staff member
      const eventIds = staffEventRelations.map((es) => es.event_id);
      const staffEvents = mockEvents.filter((e) => eventIds.includes(e.id));

      return HttpResponse.json(staffEvents, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Filter by event_id only - return staff members for this event
    if (eventIdParam) {
      const eventId = Number(eventIdParam);
      const eventStaffRelations = filtered.filter(
        (es) => es.event_id === eventId,
      );

      // Get the actual staffs for this event
      const staffCpfs = eventStaffRelations.map((es) => es.staff_cpf);
      const eventStaffs = mockStaffs
        .filter((s) => staffCpfs.includes(s.cpf))
        .map((staff) => {
          // Find the relationship to get last_status
          const relation = eventStaffRelations.find(
            (r) => r.staff_cpf === staff.cpf,
          );
          // Enrich with lastCheck (last_status)
          // Note: mock data might not have last_status populated in relation, so we might need to calculate it or use what's there.
          // relation should be enriched if we used a getter, but here we are filtering raw mockEventsStaffs.
          // Let's use enrichWithLastCheck helper on the relation first.

          let lastStatus = undefined;
          if (relation) {
            const enrichedRelation = enrichWithLastCheck(relation);
            lastStatus = enrichedRelation.last_status;
          }

          return {
            ...staff,
            last_status: lastStatus,
          };
        });

      return HttpResponse.json(eventStaffs, {
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

  // GET /api/v1/event-staff/:id/ - Get single event_staff relationship
  http.get(`${API_BASE_URL}/api/v1/event-staff/:id/`, async ({ params }) => {
    await delay(400);

    const relationId = params.id as string; // Nano UUID
    const relation = mockEventsStaffs.find((es) => es.id === relationId);

    if (!relation) {
      return HttpResponse.json(
        { detail: "Event-Staff relationship not found" },
        { status: 404 },
      );
    }

    // Enrich with lastCheck before returning
    const enrichedRelation = enrichWithLastCheck(relation);

    return HttpResponse.json(enrichedRelation, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),

  // POST /api/v1/event-staff/ - Create new event_staff relationship
  http.post(`${API_BASE_URL}/api/v1/event-staff/`, async ({ request }) => {
    await delay(800);

    const newRelationData = (await request.json()) as Omit<
      EventStaff,
      "id" | "created_at"
    >;

    // Validation
    if (
      !newRelationData.staff_cpf ||
      !newRelationData.event_id ||
      !newRelationData.staff_id ||
      !newRelationData.created_by
    ) {
      return HttpResponse.json(
        {
          detail: "staff_cpf, staff_id, event_id, and created_by are required",
        },
        { status: 400 },
      );
    }

    // Sanitize CPF
    const sanitizedCpf = sanitizeCPF(newRelationData.staff_cpf);

    // Check if relationship already exists
    const exists = mockEventsStaffs.some(
      (es) =>
        es.staff_cpf === sanitizedCpf &&
        es.event_id === newRelationData.event_id,
    );

    if (exists) {
      return HttpResponse.json(
        { detail: "Staff is already assigned to this event" },
        { status: 400 },
      );
    }

    // Create new relationship with Nano UUID
    const newRelation: EventStaff = {
      id: generateEventStaffId(),
      ...newRelationData,
      staff_cpf: sanitizedCpf,
      registration_check_id: null, // Not registered yet
      created_at: new Date().toISOString(),
    };

    mockEventsStaffs.push(newRelation);

    return HttpResponse.json(newRelation, {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),

  // DELETE /api/v1/event-staff/:id/ - Delete event_staff relationship
  http.delete(`${API_BASE_URL}/api/v1/event-staff/:id/`, async ({ params }) => {
    await delay(600);

    const relationId = params.id as string; // Nano UUID
    const index = mockEventsStaffs.findIndex((es) => es.id === relationId);

    if (index === -1) {
      return HttpResponse.json(
        { detail: "Event-Staff relationship not found" },
        { status: 404 },
      );
    }

    mockEventsStaffs.splice(index, 1);

    return new HttpResponse(null, { status: 204 });
  }),

  // POST /api/v1/events/:eventId/staff/bulk - Bulk create event-staff relationships
  http.post(
    `${API_BASE_URL}/api/v1/events/:eventId/staff/bulk`,
    async ({ request, params }) => {
      await delay(1200);

      const eventId = Number(params.eventId);
      const requestData = (await request.json()) as {
        staff: Array<{ cpf: string; name: string; email?: string }>;
      };

      // Validate event exists
      const eventExists = mockEvents.some((e) => e.id === eventId);
      if (!eventExists) {
        return HttpResponse.json(
          { detail: "Event not found" },
          { status: 404 },
        );
      }

      // Validate request
      if (!requestData.staff || !Array.isArray(requestData.staff)) {
        return HttpResponse.json(
          { detail: "staff array is required" },
          { status: 400 },
        );
      }

      const results = {
        created: [] as EventStaff[],
        skipped: [] as Array<{ cpf: string; reason: string }>,
      };

      // Process each staff member
      for (const staffData of requestData.staff) {
        const cpf = sanitizeCPF(staffData.cpf);

        // Check if staff already assigned to event
        const alreadyAssigned = mockEventsStaffs.some(
          (es) => es.staff_cpf === cpf && es.event_id === eventId,
        );

        if (alreadyAssigned) {
          results.skipped.push({
            cpf,
            reason: "Already assigned to this event",
          });
          continue;
        }

        // Check if staff exists and get staff_id
        const staff = mockStaffs.find((s) => s.cpf === cpf);

        if (!staff) {
          results.skipped.push({
            cpf,
            reason: "Staff not found in system",
          });
          continue;
        }

        // Create relationship with Nano UUID and new schema
        const newRelation: EventStaff = {
          id: generateEventStaffId(),
          staff_id: staff.id,
          staff_cpf: cpf,
          event_id: eventId,
          registration_check_id: null,
          created_at: new Date().toISOString(),
          created_by: 1, // Default to admin for bulk operations
        };

        mockEventsStaffs.push(newRelation);
        results.created.push(newRelation);
      }

      return HttpResponse.json(results, {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
  ),
];
