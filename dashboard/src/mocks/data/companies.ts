import type { Company } from "@/features/companies/types";

// ==========================================
// 🏢 Companies Mock Data (API-Compliant)
// ==========================================

/**
 * Mock Companies Data - Per API Instructions
 * - CNPJ stored as digits only (no formatting: "12345678000190" not "12.345.678/0001-90")
 * - Backend must sanitize input before storage
 */

export let mockCompanies: Company[] = [
  {
    id: 1,
    name: "ProduEvents Ltda",
    type: "production",
    cnpj: "12345678000190", // Digits only (was "12.345.678/0001-90")
  },
  {
    id: 2,
    name: "Tech Solutions SP",
    type: "service",
    cnpj: "23456789000101", // Digits only (was "23.456.789/0001-01")
  },
  {
    id: 3,
    name: "Esportes & Eventos",
    type: "production",
    cnpj: "34567890000112", // Digits only (was "34.567.890/0001-12")
  },
  {
    id: 4,
    name: "Agro Expo Brasil",
    type: "service",
    cnpj: "45678901000123", // Digits only (was "45.678.901/0001-23")
  },
  {
    id: 5,
    name: "Cultural Events RJ",
    type: "production",
    cnpj: "56789012000134", // Digits only (was "56.789.012/0001-34")
  },
  {
    id: 6,
    name: "Audio & Light Services",
    type: "service",
    cnpj: "67890123000145", // Digits only (was "67.890.123/0001-45")
  },
];

/**
 * Helper function to reset mock companies to initial state.
 * Useful for testing or resetting the application state.
 */
export const resetMockCompanies = () => {
  mockCompanies = [
    {
      id: 1,
      name: "ProduEvents Ltda",
      type: "production",
      cnpj: "12345678000190",
    },
    {
      id: 2,
      name: "Tech Solutions SP",
      type: "service",
      cnpj: "23456789000101",
    },
    {
      id: 3,
      name: "Esportes & Eventos",
      type: "production",
      cnpj: "34567890000112",
    },
    {
      id: 4,
      name: "Agro Expo Brasil",
      type: "service",
      cnpj: "45678901000123",
    },
    {
      id: 5,
      name: "Cultural Events RJ",
      type: "production",
      cnpj: "56789012000134",
    },
    {
      id: 6,
      name: "Audio & Light Services",
      type: "service",
      cnpj: "67890123000145",
    },
  ];
};

/**
 * Sanitize CNPJ by removing all non-digit characters
 * Matches API behavior: Input "12.345.678/0001-90" → Storage "12345678000190"
 */
export function sanitizeCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, "");
}

/**
 * Format CNPJ for display (adds back formatting)
 * Storage "12345678000190" → Display "12.345.678/0001-90"
 */
export function formatCNPJ(cnpj: string): string {
  const digits = sanitizeCNPJ(cnpj);
  if (digits.length !== 14) return cnpj; // Invalid CNPJ, return as-is

  return digits.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    "$1.$2.$3/$4-$5",
  );
}
