import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IMaskInput } from "react-imask";
import {
  staffSchema,
  type StaffFormData,
} from "@/features/staffs/schemas/staffSchema";
import { useAuth } from "@/shared/context/AuthContext";
import { AlertCircle } from "lucide-react";
import { staffsService } from "@/features/staffs/api/staffs.service";
import { eventStaffService } from "../../api/eventStaff.service";

interface CreateAndAddStaffProps {
  eventId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Component to create a new staff member and immediately add them to an event.
 * Follows the StaffForm pattern with validation and error handling.
 */
const CreateAndAddStaff: React.FC<CreateAndAddStaffProps> = ({
  eventId,
  onSuccess,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: "",
      cpf: "",
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

      // Step 1: Create the staff member
      const createResponse = await staffsService.create({
        name: data.name,
        cpf: data.cpf.replace(/\D/g, ""), // Remove formatting
        email: "",
        company_id,
      });

      const createdStaff = createResponse.data;

      // Step 2: Add the newly created staff to the event
      await eventStaffService.create({
        staff_cpf: createdStaff.cpf,
        event_id: eventId,
      });

      // Success: call onSuccess callback
      onSuccess();
    } catch (err: any) {
      console.error("Erro ao criar e adicionar staff:", err);

      // Handle specific error messages
      if (err.response?.status === 409) {
        setError("CPF já cadastrado no sistema");
      } else if (err.response?.status === 400) {
        setError(
          err.response?.data?.message ||
            "Dados inválidos. Verifique os campos.",
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Erro ao criar staff. Tente novamente.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Error message banner */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Info message */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
        O staff será criado e automaticamente adicionado ao evento.
      </div>

      {/* Name input */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nome Completo <span className="text-red-500">*</span>
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

      {/* CPF input with mask */}
      <div>
        <label
          htmlFor="cpf"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          CPF <span className="text-red-500">*</span>
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

      {/* Company info (read-only) */}
      {user?.company_id && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Empresa
          </label>
          <div className="w-full px-4 py-2 rounded-lg text-sm bg-gray-50 border border-gray-200 text-gray-600">
            Empresa #{user.company_id}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            O staff será vinculado à sua empresa
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-input-border">
        <button
          type="button"
          onClick={onCancel}
          className="hover:cursor-pointer px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="hover:cursor-pointer px-4 py-2 rounded-lg text-sm font-medium text-button-text bg-primary hover:bg-button-bg-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Criando..." : "Criar e Adicionar"}
        </button>
      </div>
    </form>
  );
};

export default CreateAndAddStaff;
