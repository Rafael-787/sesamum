import React, { useState, useEffect } from "react";
import { Search, Building2, AlertCircle } from "lucide-react";
import type { Company } from "@/features/companies/types";
import { companiesService } from "@/features/companies/api/companies.service";
import { eventCompaniesService } from "../../api/eventCompanies.service";

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

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  // Fetch all available companies
  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await companiesService.getAll();
        setAllCompanies(response.data);
      } catch (err) {
        setError("Erro ao carregar lista de empresas");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, [eventId]);

  const filteredCompanies = allCompanies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.cnpj.includes(searchTerm);

    return matchesSearch;
  });

  const handleSelectCompany = (companyId: number) => {
    setSelectedCompanyId(companyId);
  };

  const handleSubmit = async () => {
    if (!selectedCompanyId) {
      setError("Selecione uma empresa");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await eventCompaniesService.create({
        company_id: selectedCompanyId,
        event_id: eventId,
        role: "service", // Default role, can be made configurable
      });

      onSuccess();
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError(
          err.response?.data?.detail || "Empresa já adicionada ao evento",
        );
      } else {
        setError("Erro ao adicionar empresa ao evento");
      }
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
        ) : filteredCompanies.length === 0 ? (
          <div className="p-8 text-center">
            <Building2 size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-gray-500 text-sm">
              {searchTerm
                ? "Nenhuma empresa encontrada com os filtros aplicados"
                : "Nenhuma empresa disponível"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-input-border">
            {filteredCompanies.map((company) => {
              const isSelected = selectedCompanyId === company.id;
              return (
                <label
                  key={company.id}
                  className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isSelected ? "bg-primary/5" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="company"
                    checked={isSelected}
                    onChange={() => handleSelectCompany(company.id)}
                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary cursor-pointer"
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
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !selectedCompanyId}
          className="px-4 py-2 text-sm font-medium text-button-text bg-primary rounded-lg hover:bg-button-bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Adicionando..." : "Adicionar Empresa"}
        </button>
      </div>
    </div>
  );
};

export default AddExistingCompany;
