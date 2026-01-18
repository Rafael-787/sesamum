import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IMaskInput } from "react-imask";
import { staffsService } from "../../api/services";
import type { Staff } from "../../types";
import { staffSchema, type StaffFormData } from "../../schemas/staffSchema";
import { useAuth } from "../../context/AuthContext";

interface StaffFormProps {
  mode: "create" | "edit";
  staff?: Staff;
  onSuccess: () => void;
  onCancel: () => void;
}

export function StaffForm({
  mode,
  staff,
  onSuccess,
  onCancel,
}: StaffFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: staff?.name || "",
      cpf: staff?.cpf || "",
    },
  });

  const onSubmit = async (data: StaffFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Get company_id from logged user
      const company_id = user?.company_id;

      if (!company_id) {
        setError("Usuário não está associado a uma empresa");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        name: data.name,
        cpf: data.cpf,
        email: "",
        company_id,
      } as Omit<Staff, "id" | "created_at">;

      if (mode === "create") {
        await staffsService.create(payload);
      } else if (staff?.id) {
        await staffsService.update(staff.id, payload);
      }

      // Success: reset form and close modal
      reset();
      onSuccess();
    } catch (err: any) {
      console.error("Erro ao salvar staff:", err);
      setError(
        err.response?.data?.message || "Erro ao salvar membro. Tente novamente."
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
          Nome Completo
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-input-bg border border-input-border text-input-text"
          placeholder="Digite o nome completo"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* CPF input */}
      <div>
        <label
          htmlFor="cpf"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          CPF
        </label>
        <Controller
          name="cpf"
          control={control}
          render={({ field }) => (
            <IMaskInput
              mask="000.000.000-00"
              value={field.value}
              onAccept={(value: string) => field.onChange(value)}
              disabled={isSubmitting}
              id="cpf"
              type="text"
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-input-bg border border-input-border text-input-text"
              placeholder="000.000.000-00"
            />
          )}
        />
        {errors.cpf && (
          <p className="mt-1 text-xs text-red-600">{errors.cpf.message}</p>
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
            ? "Criar Membro"
            : "Atualizar Membro"}
        </button>
      </div>
    </form>
  );
}
