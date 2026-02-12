import { http, HttpResponse, delay } from "msw";
import {
  mockUserInvites,
  generateInviteToken,
  computeInviteStatus,
} from "../data/userInvites";
import { mockCompanies } from "../data/companies";
import type {
  UserInvite,
  InviteRole,
  UserInviteStatus,
} from "../../shared/types";

// ==========================================
// 🎫 User Invites MSW Handlers
// ==========================================

/**
 * User Invites MSW Handlers
 *
 * Manages invite slots opened by admin for new user registration.
 *
 * Endpoints:
 * - GET    /api/v1/user-invites/      - List all invites (admin only)
 * - GET    /api/v1/user-invites/:id/  - Get single invite
 * - POST   /api/v1/user-invites/      - Create new invite (admin only)
 * - DELETE /api/v1/user-invites/:id/  - Delete invite (admin only)
 *
 * Note: PATCH to expire/invalidate invites can be added if needed
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const userInvitesHandlers = [
  // ========================================
  // GET /api/v1/user-invites/ - List Invites
  // ========================================
  http.get(`${API_BASE_URL}/api/v1/user-invites/`, async ({ request }) => {
    await delay(600);

    const url = new URL(request.url);
    const statusFilter = url.searchParams.get("status");
    const companyId = url.searchParams.get("company_id");
    const roleFilter = url.searchParams.get("role");

    // Compute status for all invites before filtering
    let filtered = mockUserInvites.map((inv) => ({
      ...inv,
      status: computeInviteStatus(inv),
    }));

    // Filter by status
    if (statusFilter && ["pending", "used", "expired"].includes(statusFilter)) {
      filtered = filtered.filter((inv) => inv.status === statusFilter);
    }

    // Filter by company_id
    if (companyId) {
      filtered = filtered.filter((inv) => inv.company_id === Number(companyId));
    }

    // Filter by role
    if (roleFilter && ["company", "control"].includes(roleFilter)) {
      filtered = filtered.filter((inv) => inv.role === roleFilter);
    }

    // Sort by created_at descending (newest first)
    filtered.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    return HttpResponse.json(filtered, { status: 200 });
  }),

  // ========================================
  // GET /api/v1/user-invites/:id/ - Get Single Invite
  // ========================================
  http.get(`${API_BASE_URL}/api/v1/user-invites/:id/`, async ({ params }) => {
    await delay(400);

    const inviteId = params.id as string;
    const invite = mockUserInvites.find((inv) => inv.id === inviteId);

    if (!invite) {
      return HttpResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    // Compute status dynamically
    const status = computeInviteStatus(invite);

    return HttpResponse.json({ ...invite, status }, { status: 200 });
  }),

  // ========================================
  // POST /api/v1/user-invites/ - Create Invite
  // ========================================
  http.post(`${API_BASE_URL}/api/v1/user-invites/`, async ({ request }) => {
    await delay(800);

    try {
      const body = (await request.json()) as {
        company_id: number;
        email?: string;
        role: InviteRole;
        expires_at: string;
        created_by: number;
      };

      const { company_id, email, role, expires_at, created_by } = body;

      // Validate required fields
      if (!company_id || !role || !expires_at || !created_by) {
        return HttpResponse.json(
          {
            error: "company_id, role, expires_at, and created_by are required",
          },
          { status: 400 },
        );
      }

      // Validate role
      if (!["company", "control"].includes(role)) {
        return HttpResponse.json(
          { error: "Invalid role. Must be: company or control" },
          { status: 400 },
        );
      }

      // Validate company exists
      const company = mockCompanies.find((c) => c.id === company_id);
      if (!company) {
        return HttpResponse.json(
          { error: "Company not found" },
          { status: 404 },
        );
      }

      // Validate expiration date
      const expiresAtDate = new Date(expires_at);
      const now = new Date();
      if (expiresAtDate <= now) {
        return HttpResponse.json(
          { error: "expires_at must be in the future" },
          { status: 400 },
        );
      }

      // Validate email format if provided
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return HttpResponse.json(
          { error: "Invalid email format" },
          { status: 400 },
        );
      }

      // Create new invite
      const newInvite: UserInvite = {
        id: generateInviteToken(),
        company: company.name,
        company_id: company_id,
        email,
        role,
        used_by: null,
        status: "pending", // Computed (will always be pending for new invites)
        created_at: new Date().toISOString(),
        expires_at,
        created_by,
      };

      mockUserInvites.push(newInvite);

      return HttpResponse.json(newInvite, { status: 201 });
    } catch (error) {
      console.error("Invite creation error:", error);
      return HttpResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  }),

  // ========================================
  // DELETE /api/v1/user-invites/:id/ - Delete Invite
  // ========================================
  http.delete(
    `${API_BASE_URL}/api/v1/user-invites/:id/`,
    async ({ params }) => {
      await delay(500);

      const inviteId = params.id as string;
      const inviteIndex = mockUserInvites.findIndex(
        (inv) => inv.id === inviteId,
      );

      if (inviteIndex === -1) {
        return HttpResponse.json(
          { error: "Invite not found" },
          { status: 404 },
        );
      }

      // Check if invite is already used (may want to prevent deletion)
      const invite = mockUserInvites[inviteIndex];
      if (invite.used_by !== null) {
        return HttpResponse.json(
          { error: "Cannot delete used invite" },
          { status: 400 },
        );
      }

      mockUserInvites.splice(inviteIndex, 1);

      return new HttpResponse(null, { status: 204 });
    },
  ),

  // ========================================
  // PATCH /api/v1/user-invites/:id/ - Update Invite Status
  // ========================================
  http.patch(
    `${API_BASE_URL}/api/v1/user-invites/:id/`,
    async ({ request, params }) => {
      await delay(600);

      try {
        const inviteId = params.id as string;
        const body = (await request.json()) as {
          status?: UserInviteStatus;
          expires_at?: string;
        };

        const invite = mockUserInvites.find((inv) => inv.id === inviteId);
        if (!invite) {
          return HttpResponse.json(
            { error: "Invite not found" },
            { status: 404 },
          );
        }

        // Update status if provided
        if (body.status) {
          if (!["pending", "used", "expired"].includes(body.status)) {
            return HttpResponse.json(
              { error: "Invalid status. Must be: pending, used, or expired" },
              { status: 400 },
            );
          }
          invite.status = body.status;
        }

        // Update expiration if provided
        if (body.expires_at) {
          const newExpiresAt = new Date(body.expires_at);
          const now = new Date();
          if (newExpiresAt <= now) {
            return HttpResponse.json(
              { error: "expires_at must be in the future" },
              { status: 400 },
            );
          }
          invite.expires_at = body.expires_at;
        }

        return HttpResponse.json(invite, { status: 200 });
      } catch (error) {
        console.error("Invite update error:", error);
        return HttpResponse.json(
          { error: "Internal server error" },
          { status: 500 },
        );
      }
    },
  ),
];
