import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usersService } from "../api/users.service";
import { companiesService } from "@/features/companies/api/companies.service";
import type { User } from "../types";
import type { Company } from "@/features/companies/types";
import { userSchema, type UserFormData } from "../schemas/userSchema";

interface UserFormProps {
  mode: "create" | "edit";
  user?: User;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UserForm({ mode, user, onSuccess, onCancel }: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || "company",
      company_id: user?.company_id || undefined,
    },
  });

  // Fetch companies for dropdown
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoadingCompanies(true);
        const response = await companiesService.getAll();
        setCompanies(response.data);
      } catch (err) {
        console.error("Error fetching companies:", err);
        setError("Erro ao carregar lista de empresas");
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

  const onSubmit = async (data: UserFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const payload: any = {
        name: data.name,
        role: data.role,
        company_id: data.company_id,
      };

      // Only include email if it's not empty
      if (data.email && data.email.trim() !== "") {
        payload.email = data.email;
      }

      if (mode === "create") {
        await usersService.create(payload);
      } else if (user?.id) {
        await usersService.update(user.id, payload);
      }

      // Success: reset form and close modal
      reset();
      onSuccess();
    } catch (err: any) {
      console.error("Erro ao salvar usuário:", err);
      setError(
        err.response?.data?.message ||
          "Erro ao salvar usuário. Tente novamente.",
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
          Nome
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-input-bg border border-input-border text-input-text"
          placeholder="Digite o nome do usuário"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Email input */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-input-bg border border-input-border text-input-text"
          placeholder="usuario@exemplo.com"
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Role select */}
      <div>
        <label
          htmlFor="role"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Função
        </label>
        <select
          id="role"
          {...register("role")}
          className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-input-bg border border-input-border text-input-text"
          disabled={isSubmitting}
        >
          <option value="admin">Administrador</option>
          <option value="company">Gerente</option>
          <option value="control">Controle</option>
        </select>
        {errors.role && (
          <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>
        )}
      </div>

      {/* Company select */}
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
          disabled={isSubmitting || loadingCompanies}
        >
          <option value="">Selecione uma empresa</option>
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
          disabled={isSubmitting || loadingCompanies}
        >
          {isSubmitting
            ? "Salvando..."
            : mode === "create"
              ? "Criar Usuário"
              : "Atualizar Usuário"}
        </button>
      </div>
    </form>
  );
}
