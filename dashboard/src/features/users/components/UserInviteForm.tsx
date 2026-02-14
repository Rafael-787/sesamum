import { useState, useCallback, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Autocomplete } from "@/shared/components/ui/Autocomplete";
import {
  userInviteSchema,
  type UserInviteFormData,
} from "../schemas/userInviteSchema";
import { companiesService } from "@/features/companies/api/companies.service";
import { userInvitesService } from "../api/userInvites.service";
import type { Company } from "@/features/companies/types";

interface UserInviteFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const UserInviteForm = ({
  onSuccess,
  onCancel,
}: UserInviteFormProps) => {
  // const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string>("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UserInviteFormData>({
    resolver: zodResolver(userInviteSchema),
    defaultValues: {
      email: "",
      company_id: undefined,
      role: "company",
    },
  });

  // Load initial companies on mount
  useEffect(() => {
    const loadInitialCompanies = async () => {
      setIsLoadingCompanies(true);
      try {
        const response = await companiesService.getAll();
        setCompanies(response.data);
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setIsLoadingCompanies(false);
      }
    };
    loadInitialCompanies();
  }, []);

  const handleCompanySearch = useCallback(async (searchTerm: string) => {
    setIsLoadingCompanies(true);
    try {
      const response = await companiesService.getAll({ search: searchTerm });
      setCompanies(response.data);
    } catch (error) {
      console.error("Error fetching companies:", error);
      setCompanies([]);
    } finally {
      setIsLoadingCompanies(false);
    }
  }, []);

  const onSubmit = async (data: UserInviteFormData) => {
    setIsSubmitting(true);
    setApiError("");

    try {
      // Calculate expiration date (48h from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48);

      const payload = {
        email: data.email || undefined,
        company: data.company_id,
        company_id: data.company_id,
        role: data.role,
        expires_at: expiresAt.toISOString(),
        created_by: 1, // Use current user ID or default to 1 (admin)
      };
      await userInvitesService.create(payload);
      onSuccess();
    } catch (error: any) {
      console.error("Error creating invite:", error);
      setApiError(
        error.response?.data?.message ||
          "Erro ao criar convite. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {apiError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {apiError}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-input-bg border border-input-border text-input-text"
          placeholder="email@example.com"
        />
        {errors.email && (
          <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="company" className="block text-sm font-medium mb-1">
          Empresa <span className="text-red-500">*</span>
        </label>
        <Controller
          name="company_id"
          control={control}
          render={({ field, fieldState }) => (
            <Autocomplete
              options={companies}
              value={field.value}
              onChange={field.onChange}
              getOptionLabel={(company) => company.name}
              getOptionValue={(company) => company.id}
              placeholder="Digite para buscar empresas..."
              error={fieldState.error?.message}
              onSearch={handleCompanySearch}
              isLoading={isLoadingCompanies}
              debounceMs={500}
              minSearchLength={2}
            />
          )}
        />
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium mb-1">
          Função <span className="text-red-500">*</span>
        </label>
        <select
          id="role"
          {...register("role")}
          className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-input-bg border border-input-border text-input-text"
        >
          <option value="company">Empresa</option>
          <option value="control">Controlador</option>
        </select>
        {errors.role && (
          <p className="text-xs text-red-600 mt-1">{errors.role.message}</p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 hover:cursor-pointer rounded-lg text-sm font-medium transition-colors"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover hover:cursor-pointer text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Convidando..." : "Convidar"}
        </button>
      </div>
    </form>
  );
};

export default UserInviteForm;
