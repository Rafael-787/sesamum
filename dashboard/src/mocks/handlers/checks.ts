import { http, HttpResponse, delay } from "msw";
import {
  mockChecks,
  getNextCheckId,
  getLastCheckForStaff,
  getRegistrationCheck,
} from "../data/checks";
import { mockEventsStaffs } from "../data/eventsStaffs";
import { mockStaffs } from "../data/staffs";
import type { Check, CheckAction } from "../../shared/types";

// ==========================================
// ✅ Checks MSW Handlers
// ==========================================

/**
 * Checks MSW Handlers - Per API Instructions
 *
 * Critical Flow:
 * 1. Registration: Creates check AND atomically updates events_staff.registration_check_id
 * 2. Check-in/out: Validates registration_check_id is NOT NULL before allowing entry
 *
 * Endpoints:
 * - POST /api/v1/checks/  - Create check (registration, check-in, check-out)
 * - GET  /api/v1/checks/  - List checks with filtering
 *
 * Business Rules:
 * - Registration: Can only register once (check events_staff.registration_check_id)
 * - Check-in: Requires prior registration (registration_check_id must not be NULL)
 * - Check-out: Requires prior check-in (last action must be 'check-in')
 * - Sequential flow: registration → check-in → check-out → check-in → check-out...
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const checkHandlers = [
  // ========================================
  // POST /api/v1/checks/ - Create Check
  // ========================================
  http.post(`${API_BASE_URL}/api/v1/checks/`, async ({ request }) => {
    await delay(600);

    try {
      const body = (await request.json()) as {
        action: CheckAction;
        events_staff_id: string;
        user_control_id: number;
      };

      const { action, events_staff_id, user_control_id } = body;

      // Validate required fields
      if (!action || !events_staff_id || !user_control_id) {
        return HttpResponse.json(
          {
            error: "action, events_staff_id, and user_control_id are required",
          },
          { status: 400 },
        );
      }

      // Validate action type
      if (!["registration", "check-in", "check-out"].includes(action)) {
        return HttpResponse.json(
          {
            error:
              "Invalid action. Must be: registration, check-in, or check-out",
          },
          { status: 400 },
        );
      }

      // Find the events_staff record
      const eventsStaff = mockEventsStaffs.find(
        (es) => es.id === events_staff_id,
      );
      if (!eventsStaff) {
        return HttpResponse.json(
          { error: "EventStaff not found" },
          { status: 404 },
        );
      }

      // ========================================
      // REGISTRATION LOGIC
      // ========================================
      if (action === "registration") {
        // Check if already registered
        if (eventsStaff.registration_check_id !== null) {
          return HttpResponse.json(
            {
              error: "Staff already registered",
              detail: "This staff member is already registered for this event",
            },
            { status: 400 },
          );
        }

        // Create registration check
        const staffDetails = mockStaffs.find(
          (s) => s.cpf === eventsStaff.staff_cpf,
        ) || { name: "Unknown", cpf: 0 };

        const newCheckId = getNextCheckId();
        const newCheck: Check = {
          id: newCheckId,
          action: "registration",
          timestamp: new Date().toISOString(),
          events_staff_id,
          user_control_id,
          staff_name: staffDetails.name,
          staff_cpf: Number(staffDetails.cpf) || 0,
        };

        mockChecks.push(newCheck);

        // 🔥 CRITICAL: Atomically update registration_check_id
        eventsStaff.registration_check_id = newCheckId;

        return HttpResponse.json(newCheck, { status: 201 });
      }

      // ========================================
      // CHECK-IN / CHECK-OUT LOGIC
      // ========================================

      // 🔥 CRITICAL: Validate registration before check-in/out
      if (eventsStaff.registration_check_id === null) {
        return HttpResponse.json(
          {
            error: "Staff not registered",
            detail:
              "Staff must complete registration before check-in/check-out",
          },
          { status: 400 },
        );
      }

      // Get last check to validate sequential flow
      const lastCheck = getLastCheckForStaff(events_staff_id);

      // Validate sequential flow
      if (action === "check-in") {
        // Can check-in if:
        // 1. Only registration exists (first check-in)
        // 2. Last action was check-out
        if (lastCheck && lastCheck.action === "check-in") {
          return HttpResponse.json(
            {
              error: "Already checked in",
              detail:
                "Staff is already inside the venue. Must check-out first.",
            },
            { status: 400 },
          );
        }
      } else if (action === "check-out") {
        // Can check-out only if last action was check-in
        if (!lastCheck || lastCheck.action !== "check-in") {
          return HttpResponse.json(
            {
              error: "Cannot check-out",
              detail: "Staff must be checked in before checking out",
            },
            { status: 400 },
          );
        }
      }

      // Find staff details
      const staffMember = mockEventsStaffs.find(
        (es) => es.id === events_staff_id,
      );
      // We need actual staff data, not just event_staff relation
      // Since we don't have direct access to staff_id in mockEventsStaffs (it might not be there or might be different),
      // we'll use a placeholder or try to find it.
      // Actually mockEventsStaffs has staff_cpf ?
      // Let's import mockStaffs.

      const staffDetails = mockStaffs.find(
        (s) => s.cpf === staffMember?.staff_cpf,
      ) || { name: "Unknown", cpf: 0 };

      // Create check-in or check-out
      const newCheckId = getNextCheckId();
      const newCheck: Check = {
        id: newCheckId,
        action,
        timestamp: new Date().toISOString(),
        events_staff_id,
        user_control_id,
        staff_name: staffDetails.name,
        staff_cpf: Number(staffDetails.cpf) || 0,
      };

      mockChecks.push(newCheck);

      return HttpResponse.json(newCheck, { status: 201 });
    } catch (error) {
      console.error("Check creation error:", error);
      return HttpResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  }),

  // ========================================
  // GET /api/v1/checks/ - List Checks
  // ========================================
  http.get(`${API_BASE_URL}/api/v1/checks/`, async ({ request }) => {
    await delay(500);

    const url = new URL(request.url);
    const eventIdParam = url.searchParams.get("event_id");
    const staffCpf = url.searchParams.get("staff_cpf");
    const actionParam = url.searchParams.get("action");
    const eventsStaffIdParam = url.searchParams.get("events_staff_id");

    let filtered = [...mockChecks];

    // Filter by events_staff_id
    if (eventsStaffIdParam) {
      filtered = filtered.filter(
        (check) => check.events_staff_id === eventsStaffIdParam,
      );
    }

    // Filter by event_id (need to join with events_staff)
    if (eventIdParam) {
      const eventStaffIds = mockEventsStaffs
        .filter((es) => es.event_id === Number(eventIdParam))
        .map((es) => es.id);

      filtered = filtered.filter((check) =>
        eventStaffIds.includes(check.events_staff_id),
      );
    }

    // Filter by staff_cpf (need to join with events_staff)
    if (staffCpf) {
      const eventStaffIds = mockEventsStaffs
        .filter((es) => es.staff_cpf === staffCpf)
        .map((es) => es.id);

      filtered = filtered.filter((check) =>
        eventStaffIds.includes(check.events_staff_id),
      );
    }

    // Filter by action
    if (
      actionParam &&
      ["registration", "check-in", "check-out"].includes(actionParam)
    ) {
      filtered = filtered.filter((check) => check.action === actionParam);
    }

    // Sort by timestamp descending (newest first)
    filtered.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return HttpResponse.json(filtered, { status: 200 });
  }),

  // ========================================
  // GET /api/v1/checks/:id/ - Get Single Check
  // ========================================
  http.get(`${API_BASE_URL}/api/v1/checks/:id/`, async ({ params }) => {
    await delay(300);

    const checkId = Number(params.id);
    const check = mockChecks.find((c) => c.id === checkId);

    if (!check) {
      return HttpResponse.json({ error: "Check not found" }, { status: 404 });
    }

    return HttpResponse.json(check, { status: 200 });
  }),
];

// Export utilities for testing
export { getLastCheckForStaff, getRegistrationCheck };
