import { z } from "zod";
import { formatDateToISO, isValidDate } from "../lib/dateUtils";

export const projectSchema = z
  .object({
    name: z
      .string()
      .min(3, "Nome deve ter no mínimo 3 caracteres")
      .max(100, "Nome deve ter no máximo 100 caracteres"),
    description: z.string().optional(),
    status: z
      .enum(["open", "close"], {
        message: "Status inválido",
      })
      .optional(),
    company_id: z
      .number({
        message: "Selecione uma empresa",
      })
      .refine((val) => val !== undefined && val !== null && !isNaN(val), {
        message: "Selecione uma empresa",
      }),
    date_begin: z
      .string()
      .optional()
      .refine(
        (val) => !val || val === "" || isValidDate(val),
        "Data inválida (use DD/MM/YYYY)"
      ),
    date_end: z
      .string()
      .optional()
      .refine(
        (val) => !val || val === "" || isValidDate(val),
        "Data inválida (use DD/MM/YYYY)"
      ),
  })
  .refine(
    (data) => {
      if (data.date_begin && data.date_end) {
        const begin = formatDateToISO(data.date_begin);
        const end = formatDateToISO(data.date_end);
        return end >= begin;
      }
      return true;
    },
    {
      message: "Data de término deve ser posterior à data de início",
      path: ["date_end"],
    }
  );

export type ProjectFormData = z.infer<typeof projectSchema>;
