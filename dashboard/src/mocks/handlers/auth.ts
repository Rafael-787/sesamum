import { http, HttpResponse, delay } from "msw";
import { mockUsers } from "../data/users";
import { mockUserInvites } from "../data/userInvites";
import type {
  GoogleLoginRequest,
  GoogleRegisterRequest,
  AuthResponse,
  JWTTokens,
} from "../../shared/types";

// ==========================================
// 🔐 Auth MSW Handlers (Google OAuth + Mock JWT)
// ==========================================

/**
 * Auth MSW Handlers
 *
 * Simulates the authentication system per API instructions:
 * - POST /api/v1/auth/google/login/     - Login with Google OAuth
 * - POST /api/v1/auth/google/register/  - Register with invite token
 * - POST /api/v1/auth/verification/          - Refresh access token
 *
 * Uses simple mock JWT tokens for MSW testing (no external dependencies).
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const theToken = "token_top";

const user = {
  id: 1,
  role: "admin",
  company: 1,
};

export const authHandlers = [
  http.post(`${API_BASE_URL}/api/v1/auth/google/login`, async ({ request }) => {
    await delay(1200);
    const { googleToken } = await request.json();
    console.log(googleToken);

    if (!request || googleToken !== "google_token_admin@sesamum.com") {
      console.error("GoogleToken faltante ou não validado");
      return new HttpResponse(null, { status: 403 });
    }

    return HttpResponse.json({ token: theToken, user });
  }),

  http.post(`${API_BASE_URL}/api/v1/auth/verification`, async ({ request }) => {
    await delay(600);

    try {
      const authHeader = request.headers.get("Authorization");
      const token = authHeader?.split(" ")[1];

      if (!token) return new HttpResponse(null, { status: 401 });

      if (token !== theToken) return new HttpResponse(null, { status: 403 });

      return HttpResponse.json({ user });
    } catch (error) {
      console.error(error);
      return new HttpResponse(null, { status: 500 });
    }
  }),

  http.post(
    `${API_BASE_URL}/api/v1/auth/google/register/`,
    async ({ request }) => {
      await delay(1500); // Registration takes slightly longer

      try {
        const body = (await request.json()) as GoogleRegisterRequest;
        const { token, invite_token } = body;

        // Validate required fields
        if (!token || !invite_token) {
          return HttpResponse.json(
            { error: "Token and invite_token are required" },
            { status: 400 },
          );
        }

        // Find the invite
        const invite = mockUserInvites.find((inv) => inv.id === invite_token);
        if (!invite) {
          return HttpResponse.json(
            { error: "Invalid invite token" },
            { status: 404 },
          );
        }

        // Check if invite is already used
        if (invite.used_by !== null) {
          return HttpResponse.json(
            { error: "Invite token already used" },
            { status: 400 },
          );
        }

        // Check expiration
        const now = new Date();
        const expiresAt = new Date(invite.expires_at);
        if (now > expiresAt) {
          return HttpResponse.json(
            { error: "Invite token expired" },
            { status: 400 },
          );
        }

        // Validate email restriction (if set)
        if (invite.email && invite.email) {
          return HttpResponse.json(
            {
              error: "Email mismatch",
              detail: `This invite is restricted to ${invite.email}`,
            },
            { status: 403 },
          );
        }

        // Create new user
        const newUserId = Math.max(...mockUsers.map((u) => u.id), 0) + 1;
        const newUser = {
          id: newUserId,
          name: "usuário convito",
          email: "email@exemplo.com",
          role: invite.role,
          company_id: invite.company_id,
          created_at: new Date().toISOString(),
          picture: "",
        };

        mockUsers.push(newUser);

        // Mark invite as used by setting used_by to new user ID
        invite.used_by = newUserId;

        return HttpResponse.json(token, { status: 201 });
      } catch (error) {
        console.error("Registration error:", error);
        return HttpResponse.json(
          { error: "Internal server error" },
          { status: 500 },
        );
      }
    },
  ),
];
