import React, { useState } from "react";
import {
  DetailsPageContainer,
  PageHeader,
  TabsContainer,
  InformationsDetail,
} from "../components/layout/DetailsPageLayout";
import EventsTab from "../components/tabs/EventsTab";
import Badge from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";

const CompaniesDetailsPage: React.FC = () => {
  const [eventSearch, setEventSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
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

  return (
    <DetailsPageContainer>
      <PageHeader
        title="Acme Productions"
        subtitle="Empresa"
        onEdit={handleEdit}
      />

      <Modal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        title="Editar Empresa"
        description="Formulário de edição de empresa em breve."
      >
        {/* Future form goes here */}
        <div className="text-sm text-gray-600">
          Formulário de edição de empresa.
        </div>
      </Modal>

      <InformationsDetail>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-text-subtitle">
              CNPJ
            </label>
            <p className="mt-1 text-text-title">12.345.678/0001-90</p>
          </div>
          <div>
            <label className="text-sm font-medium text-text-subtitle">
              Tipo
            </label>
            <div className="mt-1">
              <Badge variant="company" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-text-subtitle">
              Total de staffs
            </label>
            <p className="mt-1 text-text-title">45</p>
          </div>
        </div>
      </InformationsDetail>

      <TabsContainer
        tabs={[
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
        ]}
        defaultTab="Eventos"
      />
    </DetailsPageContainer>
  );
};

export default CompaniesDetailsPage;
