import React, { useState } from "react";
import { PageHeader, PageContainer } from "../components/layout/PageLayout";
import ListToolbar from "../components/shared/ListToolbar";
import ListCard from "../components/shared/ListCard";
import { type Event } from "../types/index";
import { Modal } from "../components/ui/Modal";
import { Toast } from "../components/ui/Toast";
import { Calendar, Building2, Users, MapPin } from "lucide-react";
import Badge from "../components/ui/Badge";

// Mockup events based on the data schema
const MOCK_EVENTS: Event[] = [
  {
    id: 1,
    name: "Festival de Verão 2024",
    date_begin: "2024-12-20T10:00:00Z",
    date_end: "2024-12-22T23:00:00Z",
    status: "open",
    project_id: 1,
    location: "Praia do Forte, Salvador",
    staffs_qnt: 150,
    companies: [
      { id: 1, role: "production", event_id: 1, company_id: 1 },
      { id: 2, role: "service", event_id: 1, company_id: 2 },
    ],
  },
  {
    id: 2,
    name: "Tech Summit SP",
    date_begin: "2024-12-21T08:00:00Z",
    date_end: "2024-12-21T20:00:00Z",
    status: "open",
    project_id: 2,
    location: "Centro de Convenções, São Paulo",
    staffs_qnt: 80,
    companies: [{ id: 3, role: "production", event_id: 2, company_id: 3 }],
  },
  {
    id: 3,
    name: "Corrida Noturna",
    date_begin: "2024-12-23T18:00:00Z",
    date_end: "2024-12-23T23:00:00Z",
    status: "close",
    project_id: 3,
    location: "Parque Ibirapuera, São Paulo",
    staffs_qnt: 40,
    companies: [
      { id: 4, role: "production", event_id: 3, company_id: 4 },
      { id: 5, role: "service", event_id: 3, company_id: 5 },
    ],
  },
];

const EventsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  // Toast states
  const [successOpen, setSuccessOpen] = useState(false);

  React.useEffect(() => {
    setSuccessOpen(true);
  }, []);

  const filteredEvents = MOCK_EVENTS.filter((event) => {
    const matchesSearch = event.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesFilter = filter === "all" || event.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <PageContainer>
      {/* Toasts on page entry */}
      <Toast
        open={successOpen}
        onOpenChange={setSuccessOpen}
        type="default"
        message="Bem-vindo ao painel! (Sucesso)"
        duration={2500}
      />
      <PageHeader title="Eventos" subtitle="Gerencie eventos do sistema." />

      <ListToolbar
        searchPlaceholder="Buscar evento..."
        filterOptions={[
          { value: "all", label: "Todos" },
          { value: "open", label: "Abertos" },
          { value: "close", label: "Concluídos" },
        ]}
        addLabel="Novo Evento"
        onAdd={() => setModalOpen(true)}
        searchValue={search}
        onSearchChange={setSearch}
        filterValue={filter}
        onFilterChange={setFilter}
      />

      <Modal open={modalOpen} onOpenChange={setModalOpen} title="Novo Evento">
        {/* Future form goes here */}
        <div className="text-sm text-gray-600">
          Formulário de novo evento em breve.
        </div>
      </Modal>

      {/* Events List */}
      <ListCard
        filteredElements={filteredEvents}
        notFoundIcon={
          <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
        }
        notFoundMessage="Nenhum evento encontrado"
      >
        {(event) => {
          const isActive = event.status === "open";
          return (
            <>
              <ListCard.Icon active={isActive}>
                <span className="text-xs font-bold uppercase">
                  {new Date(event.date_begin).toLocaleString("default", {
                    month: "short",
                  })}
                </span>
                <span className="text-xl font-bold">
                  {new Date(event.date_begin).getDate()}
                </span>
              </ListCard.Icon>

              <ListCard.Body>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className={`font-semibold ${
                        isActive ? "text-title" : "text-subtitle"
                      }`}
                    >
                      {event.name}
                    </h3>
                    <Badge variant={event.status} />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-subtitle">
                    <span className="flex items-center gap-1">
                      <Building2 size={14} />
                      {event.companies && event.companies[0]?.company_id
                        ? `Empresa #${event.companies[0].company_id}`
                        : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {event.location ?? "Local não informado"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {event.staffs_qnt ?? "N/A"} staffs
                    </span>
                  </div>
                </div>
              </ListCard.Body>
            </>
          );
        }}
      </ListCard>
    </PageContainer>
  );
};

export default EventsPage;
