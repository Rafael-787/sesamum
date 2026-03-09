import { z } from "zod";
import { formatDateToISO, isValidDate } from "@/shared";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const eventSchema = z
  .object({
    name: z
      .string()
      .min(3, "Nome deve ter no mínimo 3 caracteres")
      .max(100, "Nome deve ter no máximo 100 caracteres"),
    description: z.string().optional(),
    location: z.string().optional(),
    status: z
      .enum(["open", "close", "pending"], {
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
    time_begin: z
      .string()
      .min(1, "Hora de início é obrigatória")
      .regex(timeRegex, "Hora inválida (use HH:MM)"),
    date_end: z
      .string()
      .min(1, "Data de término é obrigatória")
      .refine((val) => isValidDate(val), "Data inválida (use DD/MM/YYYY)"),
    time_end: z
      .string()
      .min(1, "Hora de término é obrigatória")
      .regex(timeRegex, "Hora inválida (use HH:MM)"),
  })
  .refine(
    (data) => {
      if (
        data.date_begin &&
        data.time_begin &&
        data.date_end &&
        data.time_end
      ) {
        // Concatena data e hora para validar se o término é posterior ao início
        const begin = formatDateToISO(`${data.date_begin} ${data.time_begin}`);
        const end = formatDateToISO(`${data.date_end} ${data.time_end}`);
        return end >= begin;
      }
      return true;
    },
    {
      message:
        "Data e hora de término devem ser posteriores ou iguais ao início",
      path: ["time_end"],
    },
  );

export type EventFormData = z.infer<typeof eventSchema>;
