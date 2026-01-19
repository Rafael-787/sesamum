import React, { useState } from "react";
import ListToolbar from "../list/ListToolbar";
import ListCard from "../list/ListCard";
import Badge from "../ui/Badge";
import { Modal } from "../ui/Modal";
import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EventForm } from "@/features/events/components/EventForm";

interface Event {
  id: number;
  name: string;
  date_begin: string;
  date_end: string;
  status: string;
}

interface EventsTabProps {
  addButton?: boolean;
  projectId?: number;
  eventSearch: string;
  setEventSearch: (value: string) => void;
  eventFilter: string;
  setEventFilter: (value: string) => void;
  events: Event[];
  onEventAdded?: () => void;
}

const EventsTab: React.FC<EventsTabProps> = ({
  addButton,
  projectId,
  eventSearch,
  setEventSearch,
  eventFilter,
  setEventFilter,
  events,
  onEventAdded,
}) => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  // Map UI filter to event status
  const filterMap: Record<string, string[]> = {
    all: ["open", "close"],
    open: ["open"],
    close: ["close"],
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.name
      .toLowerCase()
      .includes(eventSearch.toLowerCase());
    const matchesFilter =
      eventFilter === "all" || filterMap[eventFilter]?.includes(event.status);
    return matchesSearch && matchesFilter;
  });

  const handleEventClick = (event: Event) => {
    navigate(`/events/${event.id}`);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleEventSuccess = () => {
    handleModalClose();
    if (onEventAdded) {
      onEventAdded();
    }
  };

  return (
    <div className="space-y-4">
      <ListToolbar
        searchPlaceholder="Buscar por Nome do Evento..."
        filterOptions={[
          { value: "all", label: "Todos" },
          { value: "open", label: "Ativos" },
          { value: "close", label: "Concluídos" },
        ]}
        {...(addButton && {
          addLabel: "Adicionar Evento",
          onAdd: () => setModalOpen(true),
        })}
        searchValue={eventSearch}
        onSearchChange={setEventSearch}
        filterValue={eventFilter}
        onFilterChange={setEventFilter}
      />

      <Modal
        open={modalOpen}
        onOpenChange={handleModalClose}
        title="Novo Evento"
        description={
          projectId
            ? "Criar um novo evento para este projeto."
            : "Criar um novo evento."
        }
      >
        <EventForm
          mode="create"
          projectId={projectId}
          onSuccess={handleEventSuccess}
          onCancel={handleModalClose}
        />
      </Modal>

      <ListCard
        filteredElements={filteredEvents}
        notFoundIcon={
          <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
        }
        notFoundMessage="Nenhum evento encontrado"
        onClick={handleEventClick}
      >
        {(event) => (
          <>
            <ListCard.Icon>
              <Calendar size={28} />
            </ListCard.Icon>

            <ListCard.Body>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-title font-semibold">{event.name}</h3>
                  <Badge variant={event.status} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-subtitle">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {event.date_begin} - {event.date_end}
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

export default EventsTab;
