import React, { useState } from "react";
import {
  DetailsPageContainer,
  PageHeader,
  TabsContainer,
  InformationsDetail,
} from "../components/layout/DetailsPageLayout";
import { MetricCard } from "../components/shared/MetricCard";
import Card from "../components/ui/Card";
import * as Progress from "@radix-ui/react-progress";
import ListToolbar from "../components/shared/ListToolbar";
import ListCard from "../components/shared/ListCard";
import Badge from "../components/ui/Badge";
import { User as UserIcon, Building2 } from "lucide-react";
//import { type  } from "../types/index";

const EventDetailsPage: React.FC = () => {
  const [staffSearch, setStaffSearch] = useState("");
  const [staffFilter, setStaffFilter] = useState("all");
  const [companySearch, setCompanySearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");

  const handleEdit = () => {
    // Navigate to edit page or open modal
    console.log("Edit event");
  };

  // Mock staff data - replace with real data from API
  const MOCK_STAFF = [
    {
      id: 1,
      name: "João Silva",
      cpf: "123.456.789-00",
      company_id: 1,
    },
    {
      id: 2,
      name: "Maria Santos",
      cpf: "987.654.321-00",
      company_id: 1,
    },
    {
      id: 3,
      name: "Pedro Costa",
      cpf: "456.789.123-00",
      company_id: 2,
    },
    {
      id: 4,
      name: "Ana Oliveira",
      cpf: "321.654.987-00",
      company_id: 2,
    },
    {
      id: 5,
      name: "Carlos Mendes",
      cpf: "789.123.456-00",
      company_id: 3,
    },
  ];

  // Mock company data - replace with real data from API
  const MOCK_COMPANIES = [
    {
      id: 1,
      name: "Acme Productions",
      cnpj: "12.345.678/0001-90",
      role: "production",
      staffCount: 15,
    },
    {
      id: 2,
      name: "Tech Solutions",
      cnpj: "98.765.432/0001-10",
      role: "service",
      staffCount: 12,
    },
    {
      id: 3,
      name: "Event Masters",
      cnpj: "45.678.912/0001-34",
      role: "service",
      staffCount: 8,
    },
    {
      id: 4,
      name: "Creative Studios",
      cnpj: "32.165.498/0001-56",
      role: "production",
      staffCount: 5,
    },
    {
      id: 5,
      name: "Global Services",
      cnpj: "78.912.345/0001-78",
      role: "service",
      staffCount: 2,
    },
  ];

  // Example data - replace with real data from API
  const totalStaff = 42;
  const companiesStaff = [
    { name: "Acme Productions", role: "production", staffCount: 15 },
    { name: "Tech Solutions", role: "service", staffCount: 12 },
    { name: "Event Masters", role: "service", staffCount: 8 },
    { name: "Creative Studios", role: "production", staffCount: 5 },
    { name: "Global Services", role: "service", staffCount: 2 },
  ];

  // Example: Overview tab content
  const OverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard
          title="Empresas no Evento"
          value={5}
          icon="🏢"
          color="company"
        />
        <MetricCard
          title="Equipe no Evento"
          value={42}
          icon="👥"
          color="user"
        />
      </div>

      <Card>
        <h2 className="text-xl font-semibold text-text-title mb-6">
          Status de Check-in/Check-out
        </h2>
        <div className="space-y-6">
          {/* Check-in Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-text-subtitle">
                Check-in Realizado
              </label>
              <span className="text-sm font-semibold text-text-title">
                35 / 42 (83%)
              </span>
            </div>
            <Progress.Root
              className="relative overflow-hidden bg-slate-200 rounded-full w-full h-3"
              value={83}
            >
              <Progress.Indicator
                className="bg-green-500 h-full transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${100 - 83}%)` }}
              />
            </Progress.Root>
          </div>

          {/* Check-out Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-text-subtitle">
                Check-out Realizado
              </label>
              <span className="text-sm font-semibold text-text-title">
                28 / 35 (80%)
              </span>
            </div>
            <Progress.Root
              className="relative overflow-hidden bg-slate-200 rounded-full w-full h-3"
              value={80}
            >
              <Progress.Indicator
                className="bg-blue-500 h-full transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${100 - 80}%)` }}
              />
            </Progress.Root>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-text-title mb-6">
          Equipe por Empresa
        </h2>
        <div className="space-y-4">
          {companiesStaff.map((company, index) => {
            const percentage = (company.staffCount / totalStaff) * 100;
            return (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="text-sm font-medium text-text-title">
                      {company.name}
                    </p>
                    <p className="text-xs text-text-subtitle">
                      Role: {company.role}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-text-title">
                    {company.staffCount} staffs
                  </span>
                </div>
                <Progress.Root
                  className="relative overflow-hidden bg-slate-200 rounded-full w-full h-2"
                  value={percentage}
                >
                  <Progress.Indicator
                    className="bg-primary h-full transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${100 - percentage}%)` }}
                  />
                </Progress.Root>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );

  // Example: Staff tab content
  const StaffTab = () => {
    // Map UI filter to company
    const filterMap: Record<string, number[]> = {
      all: [1, 2, 3, 4, 5],
      company1: [1],
      company2: [2],
      company3: [3],
    };

    const filteredStaff = MOCK_STAFF.filter((staff) => {
      const matchesSearch =
        staff.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
        staff.cpf.includes(staffSearch);
      const matchesFilter =
        staffFilter === "all" ||
        filterMap[staffFilter]?.includes(staff.company_id);
      return matchesSearch && matchesFilter;
    });

    return (
      <div className="space-y-4">
        <ListToolbar
          searchPlaceholder="Buscar por Nome ou CPF..."
          filterOptions={[
            { value: "all", label: "Todas Empresas" },
            { value: "company1", label: "Acme Productions" },
            { value: "company2", label: "Tech Solutions" },
            { value: "company3", label: "Event Masters" },
          ]}
          addLabel="Adicionar Equipe"
          onAdd={() => console.log("Add staff")}
          searchValue={staffSearch}
          onSearchChange={setStaffSearch}
          filterValue={staffFilter}
          onFilterChange={setStaffFilter}
        />

        <ListCard
          filteredElements={filteredStaff}
          notFoundIcon={
            <UserIcon size={48} className="mx-auto text-slate-300 mb-4" />
          }
          notFoundMessage="Nenhum membro da equipe encontrado"
        >
          {(staff) => (
            <>
              <ListCard.Icon>
                <UserIcon size={28} />
              </ListCard.Icon>

              <ListCard.Body>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-title font-semibold">{staff.name}</h3>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-subtitle">
                    <span className="flex items-center gap-1">
                      <UserIcon size={14} />
                      {staff.cpf}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 size={14} />
                      Empresa #{staff.company_id}
                    </span>
                  </div>
                </div>
              </ListCard.Body>
            </>
          )}
        </ListCard>
      </div>
    );
  };

  // Example: Empresas tab content
  const EmpresasTab = () => {
    // Map UI filter to company role
    const filterMap: Record<string, string[]> = {
      all: ["production", "service"],
      production: ["production"],
      service: ["service"],
    };

    const filteredCompanies = MOCK_COMPANIES.filter((company) => {
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

  return (
    <DetailsPageContainer>
      <PageHeader
        title="Corso"
        subtitle="Evento de Carnaval 2026"
        onEdit={handleEdit}
      />

      <InformationsDetail>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-text-subtitle">
              Status
            </label>
            <p className="mt-1 text-text-title">Aberto</p>
          </div>
          <div>
            <label className="text-sm font-medium text-text-subtitle">
              Projeto
            </label>
            <p className="mt-1 text-text-title">Carnaval 2026</p>
          </div>
          <div>
            <label className="text-sm font-medium text-text-subtitle">
              Data de Início
            </label>
            <p className="mt-1 text-text-title">22/02/2026</p>
          </div>
          <div>
            <label className="text-sm font-medium text-text-subtitle">
              Data de Término
            </label>
            <p className="mt-1 text-text-title">25/02/2026</p>
          </div>
          <div>
            <label className="text-sm font-medium text-text-subtitle">
              Local
            </label>
            <p className="mt-1 text-text-title">Avenida Paulista, São Paulo</p>
          </div>
        </div>
      </InformationsDetail>

      <TabsContainer
        tabs={[
          { title: "Visão Geral", content: <OverviewTab /> },
          { title: "Equipe", content: <StaffTab /> },
          { title: "Empresas", content: <EmpresasTab /> },
        ]}
        defaultTab="Visão Geral"
      />
    </DetailsPageContainer>
  );
};

export default EventDetailsPage;
