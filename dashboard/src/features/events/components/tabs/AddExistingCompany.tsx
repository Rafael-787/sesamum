import React, { useState, useEffect } from "react";
import { Search, Building2, AlertCircle, Users } from "lucide-react";
import type { Company } from "@/features/companies/types";
import { companiesService } from "@/features/companies/api/companies.service";
import { eventCompaniesService } from "../../api/eventCompanies.service";
import { useDebounce } from "@/shared/hooks/useDebounce";

interface AddExistingCompanyProps {
  eventId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const AddExistingCompany: React.FC<AddExistingCompanyProps> = ({
  eventId,
  onSuccess,
  onCancel,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);

  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null,
  );
  const [selectedRole, setSelectedRole] = useState<"production" | "service">(
    "service",
  );

  // CORREÇÃO: Permite number ou string para lidar com input vazio durante a edição
  const [staffLimit, setStaffLimit] = useState<number | string>(1);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      setError("");
      try {
        const params: { search?: string } = {};
        if (debouncedSearchTerm) {
          params.search = debouncedSearchTerm;
        }
        const response = await companiesService.getAll(params);
        setAllCompanies(response.data);
      } catch (err) {
        setError("Erro ao carregar lista de empresas");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, [debouncedSearchTerm]);

  const handleSelectCompany = (companyId: number) => {
    setSelectedCompanyId((prev) => (prev === companyId ? null : companyId));
  };

  const handleSubmit = async () => {
    if (!selectedCompanyId) {
      setError("Selecione uma empresa");
      return;
    }

    // Converte para número para validação final
    const finalLimit = Number(staffLimit);

    if (!staffLimit || finalLimit < 1) {
      setError("O limite de staff deve ser no mínimo 1");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await eventCompaniesService.create({
        company_id: selectedCompanyId,
        event_id: eventId,
        role: selectedRole,
        staff_limit: finalLimit,
      });

      onSuccess();
    } catch (err: any) {
      console.error(err);
      const errorMessage =
        err.response?.data?.message ||
        (err.response?.data?.non_field_errors
          ? err.response.data.non_field_errors[0]
          : "Erro ao adicionar empresa ao evento");

      if (
        errorMessage.includes("already exists") ||
        errorMessage.includes("já existe")
      ) {
        setError("Esta empresa já foi adicionada a este evento.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Role Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Função da Empresa
          </label>
          <div className="flex gap-4 h-[42px] items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="production"
                checked={selectedRole === "production"}
                onChange={(e) =>
                  setSelectedRole(e.target.value as "production" | "service")
                }
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary cursor-pointer"
              />
              <span className="text-sm text-gray-700">Produção</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="service"
                checked={selectedRole === "service"}
                onChange={(e) =>
                  setSelectedRole(e.target.value as "production" | "service")
                }
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary cursor-pointer"
              />
              <span className="text-sm text-gray-700">Serviço</span>
            </label>
          </div>
        </div>

        {/* Staff Limit Input */}
        <div className="space-y-2">
          <label
            htmlFor="staffLimit"
            className="block text-sm font-medium text-gray-700"
          >
            Limite de Staff
          </label>
          <div className="relative">
            <Users
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              id="staffLimit"
              type="number"
              min="1"
              value={staffLimit}
              onChange={(e) => {
                const value = e.target.value;
                // CORREÇÃO: Se vazio, define string vazia. Se número, converte.
                if (value === "") {
                  setStaffLimit("");
                } else {
                  const parsed = parseInt(value);
                  setStaffLimit(isNaN(parsed) ? "" : parsed);
                }
              }}
              className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-input-bg border border-input-border text-input-text"
              placeholder="Ex: 5"
            />
          </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Search Bar */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Buscar por nome ou CNPJ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-input-bg border border-input-border text-input-text"
        />
      </div>

      {/* Companies List */}
      <div className="max-h-80 overflow-y-auto border border-input-border rounded-lg">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            Carregando empresas disponíveis...
          </div>
        ) : allCompanies.length === 0 ? (
          <div className="p-8 text-center">
            <Building2 size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-gray-500 text-sm">
              {searchTerm
                ? "Nenhuma empresa encontrada com os filtros aplicados"
                : "Nenhuma empresa disponível"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {allCompanies.map((company) => {
              const isSelected = selectedCompanyId === company.id;
              return (
                <label
                  key={company.id}
                  className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isSelected
                      ? "bg-primary/5 border-l-4 border-l-primary"
                      : "border-l-4 border-l-transparent"
                  }`}
                >
                  <div className="relative flex items-center">
                    <input
                      type="radio"
                      name="company_selection"
                      checked={isSelected}
                      onChange={() => handleSelectCompany(company.id)}
                      className="w-4 h-4 text-primary border-gray-300 focus:ring-primary cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4
                        className={`font-semibold text-sm ${isSelected ? "text-primary" : "text-title"}`}
                      >
                        {company.name}
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-subtitle">
                      <span className="flex items-center gap-1">
                        <Building2 size={12} />
                        {company.cnpj}
                      </span>
                      <span className="text-gray-500 capitalize px-2 py-0.5 bg-gray-100 rounded-full">
                        Tipo:{" "}
                        {company.type === "production" ? "Produção" : "Serviço"}
                      </span>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-input-border">
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="hover:cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={
            isSubmitting || !selectedCompanyId || Number(staffLimit) < 1
          }
          className="hover:cursor-pointer px-4 py-2 text-sm font-medium text-button-text bg-primary rounded-lg hover:bg-button-bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Adicionando..." : "Adicionar Empresa"}
        </button>
      </div>
    </div>
  );
};

export default AddExistingCompany;
