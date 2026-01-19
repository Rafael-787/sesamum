import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IMaskInput } from "react-imask";
import { companiesService } from "@/features/companies/api/companies.service";
import { projectsService } from "../api/projects.service";
import type { Project } from "../types";
import type { Company } from "@/features/companies/types";
import { formatDateToISO, formatDateToDDMMYYYY } from "@/shared/lib/dateUtils";
import { projectSchema, type ProjectFormData } from "../schemas/projectSchema";

interface ProjectFormProps {
  mode: "create" | "edit";
  project?: Project;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProjectForm({
  mode,
  project,
  onSuccess,
  onCancel,
}: ProjectFormProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name || "",
      description: project?.description || "",
      status: project?.status || "open",
      company_id: project?.company_id || undefined,
      date_begin: project?.date_begin
        ? formatDateToDDMMYYYY(project.date_begin)
        : "",
      date_end: project?.date_end ? formatDateToDDMMYYYY(project.date_end) : "",
    },
  });

  // Fetch companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoadingCompanies(true);
        const response = await companiesService.getAll();
        setCompanies(response.data);
      } catch (err) {
        console.error("Erro ao carregar empresas:", err);
        setError("Erro ao carregar lista de empresas");
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

  const onSubmit = async (data: ProjectFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Prepare payload with ISO date format
      const payload = {
        name: data.name,
        description: data.description || undefined,
        status: mode === "create" ? "open" : data.status || "open",
        company_id: data.company_id,
        date_begin:
          data.date_begin && data.date_begin !== ""
            ? formatDateToISO(data.date_begin)
            : undefined,
        date_end:
          data.date_end && data.date_end !== ""
            ? formatDateToISO(data.date_end)
            : undefined,
      } as Omit<Project, "id">;

      if (mode === "create") {
        await projectsService.create(payload);
      } else if (project?.id) {
        await projectsService.update(project.id, payload);
      }

      // Success: reset form and close modal
      reset();
      onSuccess();
    } catch (err: any) {
      console.error("Erro ao salvar projeto:", err);
      setError(
        err.response?.data?.message ||
          "Erro ao salvar projeto. Tente novamente.",
      );
      // Keep modal open on error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Name input */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nome do Projeto
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-input-bg border border-input-border text-input-text"
          placeholder="Digite o nome do projeto"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Description input */}
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
          placeholder="Digite uma descrição para o projeto"
          disabled={isSubmitting}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Status select - only show in edit mode */}
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
            <option value="open">Aberto</option>
            <option value="close">Fechado</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-xs text-red-600">{errors.status.message}</p>
          )}
        </div>
      )}

      {
        /* Company select */
        <div>
          <label
            htmlFor="company_id"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Empresa
          </label>
          <select
            id="company_id"
            {...register("company_id", { valueAsNumber: true })}
            className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-input-bg border border-input-border text-input-text"
            disabled={isSubmitting || isLoadingCompanies}
          >
            <option value="">
              {isLoadingCompanies ? "Carregando..." : "Selecione uma empresa"}
            </option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          {errors.company_id && (
            <p className="mt-1 text-xs text-red-600">
              {errors.company_id.message}
            </p>
          )}
        </div>
      }
      {/* Date begin input (optional) */}
      <div>
        <label
          htmlFor="date_begin"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Data de Início{" "}
          <span className="text-xs text-gray-500">(opcional)</span>
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

      {/* Date end input (optional) */}
      <div>
        <label
          htmlFor="date_end"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Data de Término{" "}
          <span className="text-xs text-gray-500">(opcional)</span>
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
          <p className="mt-1 text-xs text-red-600">{errors.date_end.message}</p>
        )}
      </div>

      {/* Action buttons */}
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
          disabled={isSubmitting || isLoadingCompanies}
        >
          {isSubmitting
            ? "Salvando..."
            : mode === "create"
              ? "Criar Projeto"
              : "Atualizar Projeto"}
        </button>
      </div>
    </form>
  );
}
