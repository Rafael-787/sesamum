import { z } from "zod";

// Validates CPF format (000.000.000-00)
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

export const staffSchema = z.object({
  name: z
    .string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  cpf: z.string().regex(cpfRegex, "CPF inválido (use 000.000.000-00)"),
});

export type StaffFormData = z.infer<typeof staffSchema>;
