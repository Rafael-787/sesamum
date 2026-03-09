import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IMaskInput } from "react-imask";
import { eventsService } from "../api/events.service";
import type { Event } from "../types";
import { formatDateToISO, formatDateToDDMMYYYY } from "@/shared/lib/dateUtils";
import { eventSchema, type EventFormData } from "../schemas/eventSchema";

// Função utilitária para extrair HH:MM de um objeto Date ou string ISO
const formatTimeToHHMM = (dateString?: string | Date) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface EventFormProps {
  mode: "create" | "edit";
  event?: Event;
  projectId?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EventForm({
  mode,
  event,
  projectId,
  onSuccess,
  onCancel,
}: EventFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: event?.name || "",
      description: event?.description || "",
      location: event?.location || "",
      status: event?.status || "pending",
      project_id: projectId || event?.project_id || undefined,
      date_begin: event?.date_begin
        ? formatDateToDDMMYYYY(event.date_begin)
        : "",
      time_begin: event?.date_begin ? formatTimeToHHMM(event.date_begin) : "",
      date_end: event?.date_end ? formatDateToDDMMYYYY(event.date_end) : "",
      time_end: event?.date_end ? formatTimeToHHMM(event.date_end) : "",
    },
  } as const);

  const onSubmit = async (data: EventFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const payload = {
        name: data.name,
        description: data.description || undefined,
        location: data.location || undefined,
        status: mode === "create" ? "open" : data.status || "open",
        project: projectId || data.project_id || undefined,
        // Concatena data e hora antes de converter para ISO
        date_begin: formatDateToISO(`${data.date_begin} ${data.time_begin}`),
        date_end: formatDateToISO(`${data.date_end} ${data.time_end}`),
      } as Omit<Event, "id">;

      if (mode === "create") {
        await eventsService.create(payload);
      } else if (event?.id) {
        await eventsService.update(event.id, payload);
      }

      reset();
      onSuccess();
    } catch (err: any) {
      console.error("Erro ao salvar evento:", err);
      setError(
        err.response?.data?.message ||
          "Erro ao salvar evento. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nome do Evento
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-input-bg border border-input-border text-input-text"
          placeholder="Digite o nome do evento"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Descrição <span className="text-xs text-gray-500">(opcional)</span>
        </label>
        <textarea
          id="description"
          {...register("description")}
          rows={3}
          className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-input-bg border border-input-border text-input-text resize-none"
          placeholder="Digite uma descrição para o evento"
          disabled={isSubmitting}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="location"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Local <span className="text-xs text-gray-500">(opcional)</span>
        </label>
        <input
          id="location"
          type="text"
          {...register("location")}
          className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-input-bg border border-input-border text-input-text"
          placeholder="Digite o local do evento"
          disabled={isSubmitting}
        />
        {errors.location && (
          <p className="mt-1 text-xs text-red-600">{errors.location.message}</p>
        )}
      </div>

      {mode === "edit" && (
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Status
          </label>
          <select
            id="status"
            {...register("status")}
            className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-input-bg border border-input-border text-input-text"
            disabled={isSubmitting}
          >
            <option value="pending">Pendente</option>
            <option value="open">Aberto</option>
            <option value="close">Fechado</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-xs text-red-600">{errors.status.message}</p>
          )}
        </div>
      )}

      {/* Inputs de Início: Data e Hora lado a lado */}
      <div className="flex gap-4">
        <div className="flex-[2]">
          <label
            htmlFor="date_begin"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Data de Início
          </label>
          <Controller
            name="date_begin"
            control={control}
            render={({ field }) => (
              <IMaskInput
                mask="00/00/0000"
                value={field.value}
                onAccept={(value: string) => field.onChange(value)}
                disabled={isSubmitting}
                id="date_begin"
                type="text"
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-input-bg border border-input-border text-input-text"
                placeholder="DD/MM/AAAA"
              />
            )}
          />
          {errors.date_begin && (
            <p className="mt-1 text-xs text-red-600">
              {errors.date_begin.message}
            </p>
          )}
        </div>

        <div className="flex-1">
          <label
            htmlFor="time_begin"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Hora
          </label>
          <Controller
            name="time_begin"
            control={control}
            render={({ field }) => (
              <IMaskInput
                mask="00:00"
                value={field.value}
                onAccept={(value: string) => field.onChange(value)}
                disabled={isSubmitting}
                id="time_begin"
                type="text"
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-input-bg border border-input-border text-input-text"
                placeholder="HH:MM"
              />
            )}
          />
          {errors.time_begin && (
            <p className="mt-1 text-xs text-red-600">
              {errors.time_begin.message}
            </p>
          )}
        </div>
      </div>

      {/* Inputs de Término: Data e Hora lado a lado */}
      <div className="flex gap-4">
        <div className="flex-[2]">
          <label
            htmlFor="date_end"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Data de Término
          </label>
          <Controller
            name="date_end"
            control={control}
            render={({ field }) => (
              <IMaskInput
                mask="00/00/0000"
                value={field.value}
                onAccept={(value: string) => field.onChange(value)}
                disabled={isSubmitting}
                id="date_end"
                type="text"
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-input-bg border border-input-border text-input-text"
                placeholder="DD/MM/AAAA"
              />
            )}
          />
          {errors.date_end && (
            <p className="mt-1 text-xs text-red-600">
              {errors.date_end.message}
            </p>
          )}
        </div>

        <div className="flex-1">
          <label
            htmlFor="time_end"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Hora
          </label>
          <Controller
            name="time_end"
            control={control}
            render={({ field }) => (
              <IMaskInput
                mask="00:00"
                value={field.value}
                onAccept={(value: string) => field.onChange(value)}
                disabled={isSubmitting}
                id="time_end"
                type="text"
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-input-bg border border-input-border text-input-text"
                placeholder="HH:MM"
              />
            )}
          />
          {errors.time_end && (
            <p className="mt-1 text-xs text-red-600">
              {errors.time_end.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 hover:cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover hover:cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Salvando..."
            : mode === "create"
              ? "Criar Evento"
              : "Atualizar Evento"}
        </button>
      </div>
    </form>
  );
}
