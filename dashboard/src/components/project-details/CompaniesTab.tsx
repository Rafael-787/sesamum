import React from "react";
import ListToolbar from "../shared/ListToolbar";
import ListCard from "../shared/ListCard";
import Badge from "../ui/Badge";
import { User as UserIcon, Building2 } from "lucide-react";

interface Company {
  id: number;
  name: string;
  cnpj: string;
  role: string;
  staffCount: number;
}

interface CompaniesTabProps {
  companySearch: string;
  setCompanySearch: (value: string) => void;
  companyFilter: string;
  setCompanyFilter: (value: string) => void;
  companies: Company[];
}

const CompaniesTab: React.FC<CompaniesTabProps> = ({
  companySearch,
  setCompanySearch,
  companyFilter,
  setCompanyFilter,
  companies,
}) => {
  // Map UI filter to company role
  const filterMap: Record<string, string[]> = {
    all: ["production", "service"],
    production: ["production"],
    service: ["service"],
  };

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(companySearch.toLowerCase()) ||
      company.cnpj.includes(companySearch);
    const matchesFilter =
      companyFilter === "all" ||
      filterMap[companyFilter]?.includes(company.role);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4">
      <ListToolbar
        searchPlaceholder="Buscar por Nome ou CNPJ..."
        filterOptions={[
          { value: "all", label: "Todas" },
          { value: "production", label: "Produção" },
          { value: "service", label: "Serviço" },
        ]}
        addLabel="Adicionar Empresa"
        onAdd={() => console.log("Add company")}
        searchValue={companySearch}
        onSearchChange={setCompanySearch}
        filterValue={companyFilter}
        onFilterChange={setCompanyFilter}
      />

      <ListCard
        filteredElements={filteredCompanies}
        notFoundIcon={
          <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
        }
        notFoundMessage="Nenhuma empresa encontrada"
      >
        {(company) => (
          <>
            <ListCard.Icon>
              <Building2 size={28} />
            </ListCard.Icon>

            <ListCard.Body>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-title font-semibold">{company.name}</h3>
                  <Badge />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-subtitle">
                  <span className="flex items-center gap-1">
                    <Building2 size={14} />
                    {company.cnpj}
                  </span>
                  <span className="flex items-center gap-1">
                    <UserIcon size={14} />
                    {company.staffCount} staffs
                  </span>
                  <span className="text-xs">Role: {company.role}</span>
                </div>
              </div>
            </ListCard.Body>
          </>
        )}
      </ListCard>
    </div>
  );
};

export default CompaniesTab;
