import React, { useState } from "react";
import { PageHeader, PageContainer } from "../components/shared/PageLayout";
import ListToolbar from "../components/shared/ListToolbar";
import ListCard from "../components/shared/ListCard";
import { type Event } from "../types/index";
import { Calendar, Building2, Users } from "lucide-react";

// Mockup events based on the data schema
const MOCK_EVENTS: Event[] = [
  {
    id: 1,
    name: "Festival de Verão 2024",
    date_begin: "2024-12-20T10:00:00Z",
    date_end: "2024-12-22T23:00:00Z",
    status: "open",
    project_id: 1,
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
    companies: [{ id: 3, role: "production", event_id: 2, company_id: 3 }],
  },
  {
    id: 3,
    name: "Corrida Noturna",
    date_begin: "2024-12-23T18:00:00Z",
    date_end: "2024-12-23T23:00:00Z",
    status: "close",
    project_id: 3,
    companies: [
      { id: 4, role: "production", event_id: 3, company_id: 4 },
      { id: 5, role: "service", event_id: 3, company_id: 5 },
    ],
  },
];

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const EventsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredEvents = MOCK_EVENTS.filter((event) => {
    const matchesSearch = event.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesFilter = filter === "all" || event.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <PageContainer>
      <PageHeader title="Eventos" subtitle="Gerencie eventos do sistema." />

      <ListToolbar
        searchPlaceholder="Buscar evento..."
        filterOptions={[
          { value: "all", label: "Todos" },
          { value: "open", label: "Abertos" },
          { value: "close", label: "Concluídos" },
        ]}
        addLabel="Novo Evento"
        onAdd={() => {}}
        searchValue={search}
        onSearchChange={setSearch}
        filterValue={filter}
        onFilterChange={setFilter}
      />

      {/* Events List */}
      <ListCard
        filteredElements={filteredEvents}
        notFoundIcon={
          <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
        }
        notFoundMessage="Nenhum evento encontrado"
      >
        {(event) => {
          const isClosed = event.status === "close";
          return (
            <>
              {/* Date Badge */}
              <div
                className="flex flex-col items-center justify-center w-14 h-14 rounded-lg border shrink-0"
                style={{
                  background: isClosed
                    ? "var(--color-secondary, #f8fafc)"
                    : "var(--input-primary, #2563eb)",
                  border: "1px solid var(--input-border, #e2e8f0)",
                  color: "var(--sidebar-text, #2563eb)",
                }}
              >
                <span className="text-xs font-bold uppercase">
                  {new Date(event.date_begin).toLocaleString("default", {
                    month: "short",
                  })}
                </span>
                <span className="text-xl font-bold">
                  {new Date(event.date_begin).getDate()}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3
                    className="text-base font-semibold"
                    style={{
                      color: isClosed
                        ? "var(--header-subtitle-color, #64748b)"
                        : "var(--header-title-color, #0f172a)",
                    }}
                  >
                    {event.name}
                  </h3>
                  {isClosed ? (
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
                      style={{
                        background: "var(--input-bg, #f8fafc)",
                        color: "var(--input-text, #0f172a)",
                      }}
                    >
                      Concluído
                    </span>
                  ) : (
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
                      style={{
                        background: "var(--color-success, #16a34a)10",
                        color: "var(--color-success, #16a34a)",
                      }}
                    >
                      Ativo
                    </span>
                  )}
                </div>
                <div
                  className="flex flex-wrap gap-x-4 gap-y-1 text-sm"
                  style={{ color: "var(--sidebar-muted, #64748b)" }}
                >
                  <span className="flex items-center gap-1">
                    <Building2 size={14} />
                    {event.companies && event.companies[0]?.company_id
                      ? `Empresa #${event.companies[0].company_id}`
                      : ""}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDate(event.date_begin)} -{" "}
                    {formatDate(event.date_end)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {event.companies?.length ?? 0} empresas
                  </span>
                </div>
              </div>
            </>
          );
        }}
      </ListCard>
    </PageContainer>
  );
};

export default EventsPage;
