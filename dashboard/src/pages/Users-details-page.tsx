import React, { useState } from "react";
import {
  DetailsPageContainer,
  PageHeader,
  TabsContainer,
  InformationsDetail,
} from "../components/layout/DetailsPageLayout";
import EventsTab from "../components/tabs/EventsTab";
import AvatarComponent from "../components/ui/Avatar";
//import { type  } from "../types/index";

const UsersDetailsPage: React.FC = () => {
  const [eventSearch, setEventSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const handleEdit = () => {
    // Navigate to edit page or open modal
    console.log("Edit staff");
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
        title="Rafael Carvalho Ferreira"
        subtitle="Membro da Equipe"
        onEdit={handleEdit}
      />

      <InformationsDetail>
        <div className="flex items-start gap-6">
          <AvatarComponent
            alt="Rafael Carvalho Ferreira"
            src="https://thispersondoesnotexist.com/"
            size={128}
          />

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-text-subtitle">
                CPF
              </label>
              <p className="mt-1 text-text-title">123.456.789-00</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-subtitle">
                Empresa
              </label>
              <p className="mt-1 text-text-title">Acme Productions</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-subtitle">
                Email
              </label>
              <p className="mt-1 text-text-title">rafael.ferreira@acme.com</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-subtitle">
                Data de Credenciamento
              </label>
              <p className="mt-1 text-text-title">15/01/2026</p>
            </div>
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

export default UsersDetailsPage;
