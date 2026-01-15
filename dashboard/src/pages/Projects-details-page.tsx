import React, { useState } from "react";
import {
  DetailsPageContainer,
  PageHeader,
  TabsContainer,
  InformationsDetail,
} from "../components/layout/DetailsPageLayout";
import OverviewTab from "../components/tabs/project-details/OverviewTab";
import EventsTab from "../components/tabs/EventsTab";
import CompaniesTab from "../components/tabs/CompaniesTab";
import { Modal } from "../components/ui/Modal";
//import { type  } from "../types/index";

const ProjectDetailsPage: React.FC = () => {
  const [eventSearch, setEventSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [companySearch, setCompanySearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleEdit = () => {
    setEditModalOpen(true);
  };

  // Mock events data - replace with real data from API
  const MOCK_EVENTS = [
    {
      id: 1,
      name: "Corso",
      date_begin: "22/02/2026",
      date_end: "25/02/2026",
      status: "open",
    },
    {
      id: 2,
      name: "Festival de Música",
      date_begin: "15/03/2026",
      date_end: "17/03/2026",
      status: "open",
    },
    {
      id: 3,
      name: "Conferência Tech",
      date_begin: "10/01/2026",
      date_end: "12/01/2026",
      status: "close",
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
        title="TUSCA 026"
        subtitle="Aquele evento loucura padrão em 2026"
        onEdit={handleEdit}
      />

      <Modal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        title="Editar Projeto"
        description="Formulário de edição de projeto em breve."
      >
        {/* Future form goes here */}
        <div className="text-sm text-gray-600">
          Formulário de edição de projeto.
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
              Local
            </label>
            <p className="mt-1 text-text-title">Avenida Paulista, São Paulo</p>
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
            title: "Eventos",
            content: (
              <EventsTab
                eventSearch={eventSearch}
                setEventSearch={setEventSearch}
                eventFilter={eventFilter}
                setEventFilter={setEventFilter}
                events={MOCK_EVENTS}
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

export default ProjectDetailsPage;
