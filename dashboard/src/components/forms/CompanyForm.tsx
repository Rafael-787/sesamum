import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IMaskInput } from "react-imask";
import { companiesService } from "../../api/services";
import type { Company } from "../../types";
import {
  companySchema,
  type CompanyFormData,
} from "../../schemas/companySchema";

interface CompanyFormProps {
  mode: "create" | "edit";
  company?: Company;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CompanyForm({
  mode,
  company,
  onSuccess,
  onCancel,
}: CompanyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: company?.name || "",
      cnpj: company?.cnpj || "",
      type: company?.type || "production",
    },
  });

  const onSubmit = async (data: CompanyFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const payload = {
        name: data.name,
        cnpj: data.cnpj,
        type: data.type,
      } as Omit<Company, "id">;

      if (mode === "create") {
        await companiesService.create(payload);
      } else if (company?.id) {
        await companiesService.update(company.id, payload);
      }

      // Success: reset form and close modal
      reset();
      onSuccess();
    } catch (err: any) {
      console.error("Erro ao salvar empresa:", err);
      setError(
        err.response?.data?.message ||
          "Erro ao salvar empresa. Tente novamente."
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
          Nome da Empresa
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-input-bg border border-input-border text-input-text"
          placeholder="Digite o nome da empresa"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* CNPJ input */}
      <div>
        <label
          htmlFor="cnpj"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          CNPJ
        </label>
        <Controller
          name="cnpj"
          control={control}
          render={({ field }) => (
            <IMaskInput
              mask="00.000.000/0000-00"
              value={field.value}
              onAccept={(value: string) => field.onChange(value)}
              disabled={isSubmitting}
              id="cnpj"
              type="text"
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-input-bg border border-input-border text-input-text"
              placeholder="00.000.000/0000-00"
            />
          )}
        />
        {errors.cnpj && (
          <p className="mt-1 text-xs text-red-600">{errors.cnpj.message}</p>
        )}
      </div>

      {/* Type select */}
      <div>
        <label
          htmlFor="type"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Tipo
        </label>
        <select
          id="type"
          {...register("type")}
          className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-input-bg border border-input-border text-input-text"
          disabled={isSubmitting}
        >
          <option value="production">Produção</option>
          <option value="service">Serviço</option>
        </select>
        {errors.type && (
          <p className="mt-1 text-xs text-red-600">{errors.type.message}</p>
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
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Salvando..."
            : mode === "create"
            ? "Criar Empresa"
            : "Atualizar Empresa"}
        </button>
      </div>
    </form>
  );
}
