import { http, HttpResponse, delay } from "msw";
import { mockUsers } from "../data/users";
import type { User } from "../../types";

/**
 * Users MSW Handlers
 *
 * These handlers simulate the users API endpoints with full CRUD operations:
 * - GET    /api/v1/users/       - List all users
 * - GET    /api/v1/users/:id/   - Get single user by ID
 * - POST   /api/v1/users/       - Create new user
 * - PUT    /api/v1/users/:id/   - Update user
 * - PATCH  /api/v1/users/:id/   - Partial update user
 * - DELETE /api/v1/users/:id/   - Delete user
 *
 * All handlers include realistic delays to simulate network latency.
 * CRUD operations modify the in-memory mockUsers array to simulate persistence
 * during the browser session.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const userHandlers = [
  // GET /api/v1/users/ - List all users
  http.get(`${API_BASE_URL}/api/v1/users/`, async ({ request }) => {
    await delay(800);

    const url = new URL(request.url);
    const roleFilter = url.searchParams.get("role");
    const companyId = url.searchParams.get("company_id");
    const search = url.searchParams.get("search");

    let filtered = [...mockUsers];

    // Filter by role
    if (roleFilter && roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    // Filter by company_id
    if (companyId) {
      filtered = filtered.filter((u) => u.company_id === Number(companyId));
    }

    // Filter by search (name or email)
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower)
      );
    }

    return HttpResponse.json(filtered, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),

  // GET /api/v1/users/:id/ - Get single user
  http.get(`${API_BASE_URL}/api/v1/users/:id/`, async ({ params }) => {
    await delay(600);

    const userId = Number(params.id);
    const user = mockUsers.find((u) => u.id === userId);

    if (!user) {
      return HttpResponse.json({ detail: "User not found" }, { status: 404 });
    }

    return HttpResponse.json(user, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),

  // POST /api/v1/users/ - Create new user
  http.post(`${API_BASE_URL}/api/v1/users/`, async ({ request }) => {
    await delay(1000);

    const newUserData = (await request.json()) as Omit<User, "id">;

    // Validation
    if (!newUserData.name || !newUserData.role) {
      return HttpResponse.json(
        { detail: "Name and role are required" },
        { status: 400 }
      );
    }

    // Check for duplicate email (only if email is provided)
    if (
      newUserData.email &&
      mockUsers.some((u) => u.email === newUserData.email)
    ) {
      return HttpResponse.json(
        { detail: "Email already exists" },
        { status: 400 }
      );
    }

    // Create new user
    const newUser: User = {
      id: Math.max(...mockUsers.map((u) => u.id), 0) + 1,
      ...newUserData,
      picture:
        newUserData.picture ||
        `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
    };

    mockUsers.push(newUser);

    return HttpResponse.json(newUser, {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),

  // PUT /api/v1/users/:id/ - Update user (full update)
  http.put(`${API_BASE_URL}/api/v1/users/:id/`, async ({ params, request }) => {
    await delay(900);

    const userId = Number(params.id);
    const index = mockUsers.findIndex((u) => u.id === userId);

    if (index === -1) {
      return HttpResponse.json({ detail: "User not found" }, { status: 404 });
    }

    const updateData = (await request.json()) as Omit<User, "id">;

    // Validation
    if (!updateData.name || !updateData.email || !updateData.role) {
      return HttpResponse.json(
        { detail: "Name, email, and role are required" },
        { status: 400 }
      );
    }

    // Check for duplicate email (excluding current user)
    if (
      mockUsers.some((u) => u.email === updateData.email && u.id !== userId)
    ) {
      return HttpResponse.json(
        { detail: "Email already exists" },
        { status: 400 }
      );
    }

    const updatedUser: User = {
      id: userId,
      ...updateData,
    };

    mockUsers[index] = updatedUser;

    return HttpResponse.json(updatedUser, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),

  // PATCH /api/v1/users/:id/ - Partial update user
  http.patch(
    `${API_BASE_URL}/api/v1/users/:id/`,
    async ({ params, request }) => {
      await delay(900);

      const userId = Number(params.id);
      const index = mockUsers.findIndex((u) => u.id === userId);

      if (index === -1) {
        return HttpResponse.json({ detail: "User not found" }, { status: 404 });
      }

      const patchData = (await request.json()) as Partial<Omit<User, "id">>;

      // Check for duplicate email if updating email
      if (
        patchData.email &&
        mockUsers.some((u) => u.email === patchData.email && u.id !== userId)
      ) {
        return HttpResponse.json(
          { detail: "Email already exists" },
          { status: 400 }
        );
      }

      const updatedUser: User = {
        ...mockUsers[index],
        ...patchData,
      };

      mockUsers[index] = updatedUser;

      return HttpResponse.json(updatedUser, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  ),

  // DELETE /api/v1/users/:id/ - Delete user
  http.delete(`${API_BASE_URL}/api/v1/users/:id/`, async ({ params }) => {
    await delay(800);

    const userId = Number(params.id);
    const index = mockUsers.findIndex((u) => u.id === userId);

    if (index === -1) {
      return HttpResponse.json({ detail: "User not found" }, { status: 404 });
    }

    mockUsers.splice(index, 1);

    return new HttpResponse(null, { status: 204 });
  }),
];
