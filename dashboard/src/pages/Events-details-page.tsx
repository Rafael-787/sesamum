import React, { useState } from "react";
import {
  DetailsPageContainer,
  PageHeader,
  TabsContainer,
  InformationsDetail,
} from "../components/layout/DetailsPageLayout";
import OverviewTab from "../components/tabs/event-details/OverviewTab";
import StaffTab from "../components/tabs/event-details/StaffTab";
import CompaniesTab from "../components/tabs/CompaniesTab";
import { Modal } from "../components/ui/Modal";
//import { type  } from "../types/index";

const EventDetailsPage: React.FC = () => {
  const [staffSearch, setStaffSearch] = useState("");
  const [staffFilter, setStaffFilter] = useState("all");
  const [companySearch, setCompanySearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleEdit = () => {
    setEditModalOpen(true);
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

  return (
    <DetailsPageContainer>
      <PageHeader
        title="Corso"
        subtitle="Evento de Carnaval 2026"
        onEdit={handleEdit}
      />

      <Modal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        title="Editar Evento"
        description="Formulário de edição de evento em breve."
      >
        {/* Future form goes here */}
        <div className="text-sm text-gray-600">
          Formulário de edição de evento.
        </div>
      </Modal>

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
          {
            title: "Visão Geral",
            content: (
              <OverviewTab
                totalStaff={totalStaff}
                companiesStaff={companiesStaff}
              />
            ),
          },
          {
            title: "Equipe",
            content: (
              <StaffTab
                staffSearch={staffSearch}
                setStaffSearch={setStaffSearch}
                staffFilter={staffFilter}
                setStaffFilter={setStaffFilter}
                mockStaff={MOCK_STAFF}
                companies={MOCK_COMPANIES}
              />
            ),
          },
          {
            title: "Empresas",
            content: (
              <CompaniesTab
                companySearch={companySearch}
                setCompanySearch={setCompanySearch}
                companyFilter={companyFilter}
                setCompanyFilter={setCompanyFilter}
                companies={MOCK_COMPANIES}
              />
            ),
          },
        ]}
        defaultTab="Visão Geral"
      />
    </DetailsPageContainer>
  );
};

export default EventDetailsPage;
