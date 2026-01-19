import React, { useState, useEffect } from "react";
import {
  PageHeader,
  PageContainer,
} from "@/shared/components/layout/PageLayout";
import ListToolbar from "@/shared/components/list/ListToolbar";
import ListCard from "@/shared/components/list/ListCard";
import { type Company } from "../types/index";
import { Modal } from "@/shared/components/ui/Modal";
import { Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { companiesService } from "../api/companies.service";
import { CompanyForm } from "../components/CompanyForm";

const CompaniesPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch companies
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await companiesService.getAll();
      setCompanies(response.data);
    } catch (err) {
      setError("Erro ao carregar empresas");
      console.error("Error fetching companies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleFormSuccess = () => {
    setModalOpen(false);
    fetchCompanies();
  };

  const handleFormCancel = () => {
    setModalOpen(false);
  };

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(search.toLowerCase()) ||
      company.cnpj.includes(search);
    return matchesSearch;
  });

  const handleCompanyClick = (company: Company) => {
    navigate(`/companies/${company.id}`);
  };

  return (
    <PageContainer>
      <PageHeader title="Empresas" subtitle="Gerencie empresas do sistema." />

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      <ListToolbar
        searchPlaceholder="Buscar por Nome ou CNPJ..."
        filterOptions={[]}
        addLabel="Nova Empresa"
        onAdd={() => setModalOpen(true)}
        searchValue={search}
        onSearchChange={setSearch}
        filterValue={filter}
        onFilterChange={setFilter}
      />

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Nova Empresa"
        description="Preencha os dados abaixo para criar uma nova empresa."
      >
        <CompanyForm
          mode="create"
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>

      {/* Companies List */}
      <ListCard
        isLoading={loading}
        filteredElements={filteredCompanies}
        notFoundIcon={
          <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
        }
        notFoundMessage="Nenhuma empresa encontrada"
        onClick={handleCompanyClick}
      >
        {(company) => (
          <>
            <ListCard.Icon>
              <Building2 size={24} />
            </ListCard.Icon>

            <ListCard.Body>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-title font-semibold">{company.name}</h3>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-subtitle">
                  <span className="flex items-center gap-1">
                    <Building2 size={14} />
                    {company.cnpj}
                  </span>
                </div>
              </div>
            </ListCard.Body>
          </>
        )}
      </ListCard>
    </PageContainer>
  );
};

export default CompaniesPage;
