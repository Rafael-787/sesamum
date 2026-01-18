import { z } from "zod";

// Validates email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const userSchema = z.object({
  name: z
    .string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  email: z
    .string()
    .regex(emailRegex, "Email inválido")
    .optional()
    .or(z.literal("")),
  role: z.enum(["admin", "company", "control"], {
    message: "Selecione uma função válida",
  }),
  company_id: z.number({
    required_error: "Selecione uma empresa",
    invalid_type_error: "Selecione uma empresa válida",
  }),
});

export type UserFormData = z.infer<typeof userSchema>;
