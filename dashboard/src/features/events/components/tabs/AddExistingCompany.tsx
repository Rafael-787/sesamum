import React, { useState, useEffect } from "react";
import { Search, Building2, AlertCircle } from "lucide-react";
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
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<number[]>([]);
  const [selectedRole, setSelectedRole] = useState<"production" | "service">(
    "service",
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch companies with server-side filtering
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
    setSelectedCompanyIds((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId],
    );
  };

  const handleSubmit = async () => {
    if (selectedCompanyIds.length === 0) {
      setError("Selecione pelo menos uma empresa");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const results = await Promise.allSettled(
        selectedCompanyIds.map((companyId) =>
          eventCompaniesService
            .create({
              company_id: companyId,
              event_id: eventId,
              role: selectedRole,
            })
            .catch((err) => {
              // Attach company info to error
              const company = allCompanies.find((c) => c.id === companyId);
              throw { ...err, companyName: company?.name, companyId };
            }),
        ),
      );

      const failures = results.filter((r) => r.status === "rejected");
      const successes = results.filter((r) => r.status === "fulfilled");

      if (failures.length > 0) {
        // Build error message with company names
        const failedCompanies = failures
          .map((f: any) => {
            const companyName = f.reason?.companyName || "Empresa desconhecida";
            return companyName;
          })
          .join(", ");

        if (failures.length === selectedCompanyIds.length) {
          // All failed
          setError(
            `${failures.length > 1 ? "As empresas" : "A empresa"} ${failedCompanies} ${failures.length > 1 ? "já foram adicionadas" : "já foi adicionada"} ao evento`,
          );
        } else {
          // Some succeeded, some failed
          setError(
            `${successes.length} ${successes.length > 1 ? "empresas foram adicionadas" : "empresa foi adicionada"}. ${failures.length > 1 ? "As empresas" : "A empresa"} ${failedCompanies} ${failures.length > 1 ? "já estavam no evento" : "já estava no evento"}`,
          );
          onSuccess(); // Still refresh to show the ones that succeeded
        }
      } else {
        // All succeeded
        onSuccess();
      }
    } catch (err: any) {
      setError("Erro ao adicionar empresas ao evento");
      console.error(err);
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

      {/* Role Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Função da Empresa no Evento
        </label>
        <div className="flex gap-4">
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
      <div className="max-h-96 overflow-y-auto border border-input-border rounded-lg">
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
          <div>
            {allCompanies.map((company) => {
              const isSelected = selectedCompanyIds.includes(company.id);
              return (
                <label
                  key={company.id}
                  className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isSelected ? "bg-primary/5" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    name="company"
                    checked={isSelected}
                    onChange={() => handleSelectCompany(company.id)}
                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary cursor-pointer rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm text-title">
                        {company.name}
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-subtitle">
                      <span className="flex items-center gap-1">
                        <Building2 size={12} />
                        {company.cnpj}
                      </span>
                      <span className="text-gray-500 capitalize">
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
          disabled={isSubmitting || selectedCompanyIds.length === 0}
          className="hover:cursor-pointer px-4 py-2 text-sm font-medium text-button-text bg-primary rounded-lg hover:bg-button-bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? "Adicionando..."
            : `Adicionar ${selectedCompanyIds.length > 0 ? `(${selectedCompanyIds.length})` : "Empresas"}`}
        </button>
      </div>
    </div>
  );
};

export default AddExistingCompany;
