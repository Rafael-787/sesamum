import React, { useState } from "react";
import { PageHeader, PageContainer } from "../components/layout/PageLayout";
import ListToolbar from "../components/shared/ListToolbar";
import ListCard from "../components/shared/ListCard";
import { type Company } from "../types/index";
import { Modal } from "../components/ui/Modal";
import { Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mockup companies based on the data schema
const MOCK_COMPANIES: Company[] = [
  {
    id: 1,
    name: "ProduEvents Ltda",
    type: "production",
    cnpj: "12.345.678/0001-90",
  },
  {
    id: 2,
    name: "Tech Solutions SP",
    type: "service",
    cnpj: "23.456.789/0001-01",
  },
  {
    id: 3,
    name: "Esportes & Eventos",
    type: "production",
    cnpj: "34.567.890/0001-12",
  },
  {
    id: 4,
    name: "Agro Expo Brasil",
    type: "service",
    cnpj: "45.678.901/0001-23",
  },
];

const CompaniesPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);

  const filteredCompanies = MOCK_COMPANIES.filter((company) => {
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
        description="Formulário de nova empresa em breve."
      >
        {/* Future form goes here */}
        <div className="text-sm text-gray-600">Formulário de nova empresa.</div>
      </Modal>

      {/* Companies List */}
      <ListCard
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
