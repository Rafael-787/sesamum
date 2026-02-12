import { http, HttpResponse, delay } from "msw";
import { mockStaffs, sanitizeCPF } from "../data/staffs";
import type { Staff } from "@/features/staffs/types";

/**
 * Staffs MSW Handlers
 *
 * These handlers simulate the staffs API endpoints with full CRUD operations:
 * - GET    /api/v1/staffs/       - List all staffs
 * - GET    /api/v1/staffs/:id/   - Get single staff by ID
 * - POST   /api/v1/staffs/       - Create new staff
 * - PUT    /api/v1/staffs/:id/   - Update staff
 * - PATCH  /api/v1/staffs/:id/   - Partial update staff
 * - DELETE /api/v1/staffs/:id/   - Delete staff
 *
 * All handlers include realistic delays to simulate network latency.
 * CRUD operations modify the in-memory mockStaffs array to simulate persistence
 * during the browser session.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const staffHandlers = [
  // GET /api/v1/staffs/ - List all staffs
  http.get(`${API_BASE_URL}/api/v1/staffs/`, async ({ request }) => {
    await delay(800);

    const url = new URL(request.url);
    const companyId = url.searchParams.get("company_id");
    const search = url.searchParams.get("search");

    // Check user role from headers (for dev mode role switching)
    const userRole = request.headers.get("X-User-Role");

    let filtered = [...mockStaffs];

    // Auto-filter by company_id for company role users
    // In production, this filtering happens on the backend based on JWT
    if (userRole === "company") {
      // Mock: assume company users are from company_id 1
      // In production, this would come from the JWT token
      const userCompanyId = 1;
      filtered = filtered.filter((s) => s.company_id === userCompanyId);
    }

    // Filter by company_id (if explicitly provided)
    if (companyId) {
      filtered = filtered.filter((s) => s.company_id === Number(companyId));
    }

    // Filter by search (name, cpf, or email)
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          (s.cpf?.includes(search) ?? false) ||
          (s.email?.toLowerCase().includes(searchLower) ?? false),
      );
    }

    return HttpResponse.json(filtered, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),

  // GET /api/v1/staffs/:id/ - Get single staff
  http.get(`${API_BASE_URL}/api/v1/staffs/:id/`, async ({ params }) => {
    await delay(600);

    const staffId = Number(params.id);
    const staff = mockStaffs.find((s) => s.id === staffId);

    if (!staff) {
      return HttpResponse.json({ detail: "Staff not found" }, { status: 404 });
    }

    return HttpResponse.json(staff, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),

  // POST /api/v1/staffs/ - Create new staff
  http.post(`${API_BASE_URL}/api/v1/staffs/`, async ({ request }) => {
    await delay(1000);

    const newStaffData = (await request.json()) as Omit<Staff, "id">;

    // Validation
    if (!newStaffData.name || !newStaffData.cpf || !newStaffData.company_id) {
      return HttpResponse.json(
        { detail: "Name, CPF, and company_id are required" },
        { status: 400 },
      );
    }

    // Sanitize CPF (remove formatting)
    const sanitizedCpf = sanitizeCPF(newStaffData.cpf);

    // Check for duplicate CPF
    if (mockStaffs.some((s) => s.cpf === sanitizedCpf)) {
      return HttpResponse.json(
        { detail: "CPF already exists" },
        { status: 400 },
      );
    }

    // Create new staff
    const newStaff: Staff = {
      id: Math.max(...mockStaffs.map((s) => s.id), 0) + 1,
      ...newStaffData,
      cpf: sanitizedCpf,
      created_at: new Date().toISOString(),
    };

    mockStaffs.push(newStaff);

    return HttpResponse.json(newStaff, {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),

  // PUT /api/v1/staffs/:id/ - Update staff (full update)
  http.put(
    `${API_BASE_URL}/api/v1/staffs/:id/`,
    async ({ params, request }) => {
      await delay(900);

      const staffId = Number(params.id);
      const index = mockStaffs.findIndex((s) => s.id === staffId);

      if (index === -1) {
        return HttpResponse.json(
          { detail: "Staff not found" },
          { status: 404 },
        );
      }

      const updateData = (await request.json()) as Omit<Staff, "id">;

      // Validation
      if (!updateData.name || !updateData.cpf || !updateData.company_id) {
        return HttpResponse.json(
          { detail: "Name, CPF, and company_id are required" },
          { status: 400 },
        );
      }

      // Sanitize CPF
      const sanitizedCpf = sanitizeCPF(updateData.cpf);

      // Check for duplicate CPF (excluding current staff)
      if (mockStaffs.some((s) => s.cpf === sanitizedCpf && s.id !== staffId)) {
        return HttpResponse.json(
          { detail: "CPF already exists" },
          { status: 400 },
        );
      }

      const updatedStaff: Staff = {
        id: staffId,
        ...updateData,
        cpf: sanitizedCpf,
      };

      mockStaffs[index] = updatedStaff;

      return HttpResponse.json(updatedStaff, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
  ),

  // PATCH /api/v1/staffs/:id/ - Partial update staff
  http.patch(
    `${API_BASE_URL}/api/v1/staffs/:id/`,
    async ({ params, request }) => {
      await delay(900);

      const staffId = Number(params.id);
      const index = mockStaffs.findIndex((s) => s.id === staffId);

      if (index === -1) {
        return HttpResponse.json(
          { detail: "Staff not found" },
          { status: 404 },
        );
      }

      const patchData = (await request.json()) as Partial<Omit<Staff, "id">>;

      // Sanitize CPF if updating
      if (patchData.cpf) {
        patchData.cpf = sanitizeCPF(patchData.cpf);
      }

      // Check for duplicate CPF if updating cpf
      if (
        patchData.cpf &&
        mockStaffs.some((s) => s.cpf === patchData.cpf && s.id !== staffId)
      ) {
        return HttpResponse.json(
          { detail: "CPF already exists" },
          { status: 400 },
        );
      }

      const updatedStaff: Staff = {
        ...mockStaffs[index],
        ...patchData,
      };

      mockStaffs[index] = updatedStaff;

      return HttpResponse.json(updatedStaff, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
  ),

  // DELETE /api/v1/staffs/:id/ - Delete staff
  http.delete(`${API_BASE_URL}/api/v1/staffs/:id/`, async ({ params }) => {
    await delay(800);

    const staffId = Number(params.id);
    const index = mockStaffs.findIndex((s) => s.id === staffId);

    if (index === -1) {
      return HttpResponse.json({ detail: "Staff not found" }, { status: 404 });
    }

    mockStaffs.splice(index, 1);

    return new HttpResponse(null, { status: 204 });
  }),
];
