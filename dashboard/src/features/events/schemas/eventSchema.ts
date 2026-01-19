import { z } from "zod";
import { formatDateToISO, isValidDate } from "../lib/dateUtils";

export const eventSchema = z
  .object({
    name: z
      .string()
      .min(3, "Nome deve ter no mínimo 3 caracteres")
      .max(100, "Nome deve ter no máximo 100 caracteres"),
    description: z.string().optional(),
    location: z.string().optional(),
    status: z
      .enum(["open", "close"], {
        message: "Status inválido",
      })
      .optional(),
    project_id: z
      .number({
        message: "Selecione um projeto",
      })
      .optional(),
    date_begin: z
      .string()
      .min(1, "Data de início é obrigatória")
      .refine((val) => isValidDate(val), "Data inválida (use DD/MM/YYYY)"),
    date_end: z
      .string()
      .min(1, "Data de término é obrigatória")
      .refine((val) => isValidDate(val), "Data inválida (use DD/MM/YYYY)"),
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
      message: "Data de término deve ser posterior ou igual à data de início",
      path: ["date_end"],
    }
  );

export type EventFormData = z.infer<typeof eventSchema>;
