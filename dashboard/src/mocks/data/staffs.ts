import type { Staff } from "@/features/staffs/types";

// ==========================================
// 👥 Staffs Mock Data (API-Compliant)
// ==========================================

/**
 * Mock Staffs Data - Per API Instructions
 * - CPF stored as digits only (no formatting: "12345678900" not "123.456.789-00")
 * - Backend must sanitize input before storage
 */

export let mockStaffs: Staff[] = [
  {
    id: 1,
    name: "João Silva",
    cpf: "12345678900", // Digits only (was "123.456.789-00")
    email: "joao.silva@email.com",
    company_id: 1,
    created_at: "2025-01-15T10:30:00Z",
  },
  {
    id: 2,
    name: "Maria Santos",
    cpf: "98765432100", // Digits only (was "234.567.890-11")
    email: "maria.santos@email.com",
    company_id: 1,
    created_at: "2025-01-20T14:20:00Z",
  },
  {
    id: 3,
    name: "Pedro Oliveira",
    cpf: "11122233344", // Digits only (was "345.678.901-22")
    email: "pedro.oliveira@email.com",
    company_id: 2,
    created_at: "2025-02-01T09:15:00Z",
  },
  {
    id: 4,
    name: "Ana Costa",
    cpf: "55566677788", // Digits only (was "456.789.012-33")
    email: "ana.costa@email.com",
    company_id: 2,
    created_at: "2025-02-05T11:45:00Z",
  },
  {
    id: 5,
    name: "Carlos Ferreira",
    cpf: "99988877766", // Digits only (was "567.890.123-44")
    email: "carlos.ferreira@email.com",
    company_id: 3,
    created_at: "2025-02-10T16:00:00Z",
  },
  {
    id: 6,
    name: "Juliana Lima",
    cpf: "44455566677", // Digits only (was "678.901.234-55")
    email: "juliana.lima@email.com",
    company_id: 3,
    created_at: "2025-02-15T08:30:00Z",
  },
  {
    id: 7,
    name: "Roberto Alves",
    cpf: "33344455566", // Digits only (was "789.012.345-66")
    email: "roberto.alves@email.com",
    company_id: 4,
    created_at: "2025-03-01T13:10:00Z",
  },
  {
    id: 8,
    name: "Fernanda Souza",
    cpf: "22233344455", // Digits only (was "890.123.456-77")
    email: "fernanda.souza@email.com",
    company_id: 5,
    created_at: "2025-03-05T10:50:00Z",
  },
];

/**
 * Helper function to reset mock staffs to initial state.
 * Useful for testing or resetting the application state.
 */
export const resetMockStaffs = () => {
  mockStaffs = [
    {
      id: 1,
      name: "João Silva",
      cpf: "12345678900",
      email: "joao.silva@email.com",
      company_id: 1,
      created_at: "2025-01-15T10:30:00Z",
    },
    {
      id: 2,
      name: "Maria Santos",
      cpf: "98765432100",
      email: "maria.santos@email.com",
      company_id: 1,
      created_at: "2025-01-20T14:20:00Z",
    },
    {
      id: 3,
      name: "Pedro Oliveira",
      cpf: "11122233344",
      email: "pedro.oliveira@email.com",
      company_id: 2,
      created_at: "2025-02-01T09:15:00Z",
    },
    {
      id: 4,
      name: "Ana Costa",
      cpf: "55566677788",
      email: "ana.costa@email.com",
      company_id: 2,
      created_at: "2025-02-05T11:45:00Z",
    },
    {
      id: 5,
      name: "Carlos Ferreira",
      cpf: "99988877766",
      email: "carlos.ferreira@email.com",
      company_id: 3,
      created_at: "2025-02-10T16:00:00Z",
    },
    {
      id: 6,
      name: "Juliana Lima",
      cpf: "44455566677",
      email: "juliana.lima@email.com",
      company_id: 3,
      created_at: "2025-02-15T08:30:00Z",
    },
    {
      id: 7,
      name: "Roberto Alves",
      cpf: "33344455566",
      email: "roberto.alves@email.com",
      company_id: 4,
      created_at: "2025-03-01T13:10:00Z",
    },
    {
      id: 8,
      name: "Fernanda Souza",
      cpf: "22233344455",
      email: "fernanda.souza@email.com",
      company_id: 5,
      created_at: "2025-03-05T10:50:00Z",
    },
  ];
};

/**
 * Sanitize CPF by removing all non-digit characters
 * Matches API behavior: Input "123.456.789-00" → Storage "12345678900"
 */
export function sanitizeCPF(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

/**
 * Format CPF for display (adds back formatting)
 * Storage "12345678900" → Display "123.456.789-00"
 */
export function formatCPF(cpf: string): string {
  const digits = sanitizeCPF(cpf);
  if (digits.length !== 11) return cpf; // Invalid CPF, return as-is

  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}
