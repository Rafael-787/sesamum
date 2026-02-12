import { http, HttpResponse, delay } from "msw";
import { mockCompanies, sanitizeCNPJ } from "../data/companies";
import type { Company } from "@/features/companies/types";

/**
 * Companies MSW Handlers
 *
 * These handlers simulate the companies API endpoints with full CRUD operations:
 * - GET    /api/v1/companies/       - List all companies
 * - GET    /api/v1/companies/:id/   - Get single company by ID
 * - POST   /api/v1/companies/       - Create new company
 * - PUT    /api/v1/companies/:id/   - Update company
 * - PATCH  /api/v1/companies/:id/   - Partial update company
 * - DELETE /api/v1/companies/:id/   - Delete company
 *
 * All handlers include realistic delays to simulate network latency.
 * CRUD operations modify the in-memory mockCompanies array to simulate persistence
 * during the browser session.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const companyHandlers = [
  // GET /api/v1/companies/ - List all companies
  http.get(`${API_BASE_URL}/api/v1/companies/`, async ({ request }) => {
    await delay(800);

    const url = new URL(request.url);
    const typeFilter = url.searchParams.get("type");
    const search = url.searchParams.get("search");

    let filtered = [...mockCompanies];

    // Filter by type
    if (typeFilter && typeFilter !== "all") {
      filtered = filtered.filter((c) => c.type === typeFilter);
    }

    // Filter by search (name or cnpj)
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) || c.cnpj.includes(search),
      );
    }

    return HttpResponse.json(filtered, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),

  // GET /api/v1/companies/:id/ - Get single company
  http.get(`${API_BASE_URL}/api/v1/companies/:id/`, async ({ params }) => {
    await delay(600);

    const companyId = Number(params.id);
    const company = mockCompanies.find((c) => c.id === companyId);

    if (!company) {
      return HttpResponse.json(
        { detail: "Company not found" },
        { status: 404 },
      );
    }

    return HttpResponse.json(company, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),

  // POST /api/v1/companies/ - Create new company
  http.post(`${API_BASE_URL}/api/v1/companies/`, async ({ request }) => {
    await delay(1000);

    const newCompanyData = (await request.json()) as Omit<Company, "id">;

    // Validation
    if (!newCompanyData.name || !newCompanyData.cnpj) {
      return HttpResponse.json(
        { detail: "Name and CNPJ are required" },
        { status: 400 },
      );
    }

    // Sanitize CNPJ (remove formatting)
    const sanitizedCnpj = sanitizeCNPJ(newCompanyData.cnpj);

    // Check for duplicate CNPJ
    if (mockCompanies.some((c) => c.cnpj === sanitizedCnpj)) {
      return HttpResponse.json(
        { detail: "CNPJ already exists" },
        { status: 400 },
      );
    }

    // Create new company
    const newCompany: Company = {
      id: Math.max(...mockCompanies.map((c) => c.id), 0) + 1,
      ...newCompanyData,
      cnpj: sanitizedCnpj,
    };

    mockCompanies.push(newCompany);

    return HttpResponse.json(newCompany, {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),

  // PUT /api/v1/companies/:id/ - Update company (full update)
  http.put(
    `${API_BASE_URL}/api/v1/companies/:id/`,
    async ({ params, request }) => {
      await delay(900);

      const companyId = Number(params.id);
      const index = mockCompanies.findIndex((c) => c.id === companyId);

      if (index === -1) {
        return HttpResponse.json(
          { detail: "Company not found" },
          { status: 404 },
        );
      }

      const updateData = (await request.json()) as Omit<Company, "id">;

      // Validation
      if (!updateData.name || !updateData.cnpj) {
        return HttpResponse.json(
          { detail: "Name and CNPJ are required" },
          { status: 400 },
        );
      }

      // Sanitize CNPJ
      const sanitizedCnpj = sanitizeCNPJ(updateData.cnpj);

      // Check for duplicate CNPJ (excluding current company)
      if (
        mockCompanies.some(
          (c) => c.cnpj === sanitizedCnpj && c.id !== companyId,
        )
      ) {
        return HttpResponse.json(
          { detail: "CNPJ already exists" },
          { status: 400 },
        );
      }

      const updatedCompany: Company = {
        id: companyId,
        ...updateData,
        cnpj: sanitizedCnpj,
      };

      mockCompanies[index] = updatedCompany;

      return HttpResponse.json(updatedCompany, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
  ),

  // PATCH /api/v1/companies/:id/ - Partial update company
  http.patch(
    `${API_BASE_URL}/api/v1/companies/:id/`,
    async ({ params, request }) => {
      await delay(900);

      const companyId = Number(params.id);
      const index = mockCompanies.findIndex((c) => c.id === companyId);

      if (index === -1) {
        return HttpResponse.json(
          { detail: "Company not found" },
          { status: 404 },
        );
      }

      const patchData = (await request.json()) as Partial<Omit<Company, "id">>;

      // Sanitize CNPJ if updating
      if (patchData.cnpj) {
        patchData.cnpj = sanitizeCNPJ(patchData.cnpj);
      }

      // Check for duplicate CNPJ if updating cnpj
      if (
        patchData.cnpj &&
        mockCompanies.some(
          (c) => c.cnpj === patchData.cnpj && c.id !== companyId,
        )
      ) {
        return HttpResponse.json(
          { detail: "CNPJ already exists" },
          { status: 400 },
        );
      }

      const updatedCompany: Company = {
        ...mockCompanies[index],
        ...patchData,
      };

      mockCompanies[index] = updatedCompany;

      return HttpResponse.json(updatedCompany, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
  ),

  // DELETE /api/v1/companies/:id/ - Delete company
  http.delete(`${API_BASE_URL}/api/v1/companies/:id/`, async ({ params }) => {
    await delay(800);

    const companyId = Number(params.id);
    const index = mockCompanies.findIndex((c) => c.id === companyId);

    if (index === -1) {
      return HttpResponse.json(
        { detail: "Company not found" },
        { status: 404 },
      );
    }

    mockCompanies.splice(index, 1);

    return new HttpResponse(null, { status: 204 });
  }),
];
