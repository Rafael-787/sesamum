import { z } from "zod";

// Validates CNPJ format (00.000.000/0000-00)
const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;

export const companySchema = z.object({
  name: z
    .string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  cnpj: z.string().regex(cnpjRegex, "CNPJ inválido (use 00.000.000/0000-00)"),
  type: z.enum(["production", "service"], {
    message: "Selecione um tipo válido",
  }),
});

export type CompanyFormData = z.infer<typeof companySchema>;
