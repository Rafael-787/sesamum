import { http, HttpResponse, delay } from "msw";
import { mockProjects } from "../data/projects";
import type { Project } from "@/features/projects/types";

/**
 * Projects MSW Handlers
 *
 * These handlers simulate the projects API endpoints with full CRUD operations:
 * - GET    /api/v1/projects/       - List all projects
 * - GET    /api/v1/projects/:id/   - Get single project by ID
 * - POST   /api/v1/projects/       - Create new project
 * - PUT    /api/v1/projects/:id/   - Update project
 * - PATCH  /api/v1/projects/:id/   - Partial update project
 * - DELETE /api/v1/projects/:id/   - Delete project
 *
 * All handlers include realistic delays to simulate network latency.
 * CRUD operations modify the in-memory mockProjects array to simulate persistence
 * during the browser session.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const projectHandlers = [
  // GET /api/v1/projects/ - List all projects
  http.get(`${API_BASE_URL}/api/v1/projects/`, async ({ request }) => {
    await delay(800);

    const url = new URL(request.url);
    const statusFilter = url.searchParams.get("status");
    const companyId = url.searchParams.get("company_id");
    const search = url.searchParams.get("search");

    let filtered = [...mockProjects];

    // Filter by status
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Filter by company_id
    if (companyId) {
      filtered = filtered.filter((p) => p.company_id === Number(companyId));
    }

    // Filter by search (name)
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchLower),
      );
    }

    return HttpResponse.json(filtered, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),

  // GET /api/v1/projects/:id/ - Get single project
  http.get(`${API_BASE_URL}/api/v1/projects/:id/`, async ({ params }) => {
    await delay(600);

    const projectId = Number(params.id);
    const project = mockProjects.find((p) => p.id === projectId);

    if (!project) {
      return HttpResponse.json(
        { detail: "Project not found" },
        { status: 404 },
      );
    }

    return HttpResponse.json(project, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),

  // POST /api/v1/projects/ - Create new project
  http.post(`${API_BASE_URL}/api/v1/projects/`, async ({ request }) => {
    await delay(1000);

    const newProjectData = (await request.json()) as Omit<Project, "id">;

    // Validation
    if (!newProjectData.name || !newProjectData.company_id) {
      return HttpResponse.json(
        { detail: "Name and company_id are required" },
        { status: 400 },
      );
    }

    // Create new project
    const newProject: Project = {
      id: Math.max(...mockProjects.map((p) => p.id), 0) + 1,
      events_qnt: 0,
      ...newProjectData,
    };

    mockProjects.push(newProject);

    return HttpResponse.json(newProject, {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),

  // PUT /api/v1/projects/:id/ - Update project (full update)
  http.put(
    `${API_BASE_URL}/api/v1/projects/:id/`,
    async ({ params, request }) => {
      await delay(900);

      const projectId = Number(params.id);
      const index = mockProjects.findIndex((p) => p.id === projectId);

      if (index === -1) {
        return HttpResponse.json(
          { detail: "Project not found" },
          { status: 404 },
        );
      }

      const updateData = (await request.json()) as Omit<Project, "id">;

      // Validation
      if (!updateData.name || !updateData.company_id) {
        return HttpResponse.json(
          { detail: "Name and company_id are required" },
          { status: 400 },
        );
      }

      const updatedProject: Project = {
        id: projectId,
        ...updateData,
      };

      mockProjects[index] = updatedProject;

      return HttpResponse.json(updatedProject, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
  ),

  // PATCH /api/v1/projects/:id/ - Partial update project
  http.patch(
    `${API_BASE_URL}/api/v1/projects/:id/`,
    async ({ params, request }) => {
      await delay(900);

      const projectId = Number(params.id);
      const index = mockProjects.findIndex((p) => p.id === projectId);

      if (index === -1) {
        return HttpResponse.json(
          { detail: "Project not found" },
          { status: 404 },
        );
      }

      const patchData = (await request.json()) as Partial<Omit<Project, "id">>;

      const updatedProject: Project = {
        ...mockProjects[index],
        ...patchData,
      };

      mockProjects[index] = updatedProject;

      return HttpResponse.json(updatedProject, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
  ),

  // DELETE /api/v1/projects/:id/ - Delete project
  http.delete(`${API_BASE_URL}/api/v1/projects/:id/`, async ({ params }) => {
    await delay(800);

    const projectId = Number(params.id);
    const index = mockProjects.findIndex((p) => p.id === projectId);

    if (index === -1) {
      return HttpResponse.json(
        { detail: "Project not found" },
        { status: 404 },
      );
    }

    mockProjects.splice(index, 1);

    return new HttpResponse(null, { status: 204 });
  }),
];
