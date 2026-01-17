import React, { useState, useEffect } from "react";
import { PageHeader, PageContainer } from "../components/layout/PageLayout";
import ListToolbar from "../components/shared/ListToolbar";
import ListCard from "../components/shared/ListCard";
import { type Event } from "../types/index";
import { Modal } from "../components/ui/Modal";
import { Toast } from "../components/ui/Toast";
import { Calendar, Building2, Users, MapPin } from "lucide-react";
import Badge from "../components/ui/Badge";
import { useNavigate } from "react-router-dom";
import { eventsService } from "../api/services";

const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Toast states
  const [successOpen, setSuccessOpen] = useState(false);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await eventsService.getAll();
        setEvents(response.data);
      } catch (err) {
        setError("Erro ao carregar eventos");
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  React.useEffect(() => {
    setSuccessOpen(true);
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesFilter = filter === "all" || event.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleEventClick = (event: Event) => {
    navigate(`/events/${event.id}`);
  };

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

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

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

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Novo Evento"
        description="Formulário de novo evento em breve."
      >
        {/* Future form goes here */}
        <div className="text-sm text-gray-600">Formulário de novo evento.</div>
      </Modal>

      {/* Events List */}
      <ListCard
        isLoading={loading}
        filteredElements={filteredEvents}
        notFoundIcon={
          <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
        }
        notFoundMessage="Nenhum evento encontrado"
        onClick={handleEventClick}
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
