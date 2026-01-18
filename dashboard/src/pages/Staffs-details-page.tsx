import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  DetailsPageContainer,
  PageHeader,
  TabsContainer,
  InformationsDetail,
} from "../components/layout/DetailsPageLayout";
import EventsTab from "../components/tabs/EventsTab";
import AvatarComponent from "../components/ui/Avatar";
import { staffsService, eventsService } from "../api/services";
import type { Staff, Event } from "../types";
import { formatDateTime } from "../lib/dateUtils";
import { useRecentlyVisited } from "../hooks/useRecentlyVisited";
import { Modal } from "../components/ui/Modal";
import { StaffForm } from "../components/forms/StaffForm";

// Mock company names (should come from companies API in production)
const COMPANY_NAMES: Record<number, string> = {
  1: "ProduEvents Ltda",
  2: "Tech Solutions SP",
  3: "Esportes & Eventos",
  4: "Agro Expo Brasil",
  5: "Cultural Events RJ",
};

const StaffsDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addRecentVisit } = useRecentlyVisited();
  const [eventSearch, setEventSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [staff, setStaff] = useState<Staff | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Fetch staff details and their events
  useEffect(() => {
    const fetchStaffData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch staff details
        const staffResponse = await staffsService.getById(Number(id));
        setStaff(staffResponse.data);

        // Track visit to recently visited
        addRecentVisit({
          id: Date.now(),
          type: "staff",
          title: staffResponse.data.name,
          description: staffResponse.data.email,
          url: `/staffs/${id}`,
          entityId: staffResponse.data.id,
        });

        // Fetch events for this staff member
        const eventsResponse = await eventsService.getByStaff(
          staffResponse.data.cpf
        );
        setEvents(eventsResponse.data);
      } catch (err) {
        setError("Erro ao carregar membro da equipe");
        console.error("Error fetching staff data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, [id]);

  const handleEditSuccess = async () => {
    setEditModalOpen(false);
    // Reload staff data
    if (!id) return;
    try {
      const staffResponse = await staffsService.getById(Number(id));
      setStaff(staffResponse.data);
    } catch (err) {
      console.error("Error reloading staff:", err);
    }
  };

  if (loading) {
    return (
      <DetailsPageContainer>
        <div className="flex items-center justify-center h-64">
          <p className="text-subtitle">Carregando...</p>
        </div>
      </DetailsPageContainer>
    );
  }

  if (error || !staff) {
    return (
      <DetailsPageContainer>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-700">{error || "Membro não encontrado"}</p>
        </div>
      </DetailsPageContainer>
    );
  }

  return (
    <DetailsPageContainer>
      <PageHeader
        title={staff.name}
        subtitle={staff.email}
        onEdit={() => setEditModalOpen(true)}
      />

      <Modal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        title="Editar Membro"
        description="Atualize as informações do membro da equipe."
      >
        <StaffForm
          mode="edit"
          staff={staff}
          onSuccess={handleEditSuccess}
          onCancel={() => setEditModalOpen(false)}
        />
      </Modal>

      <InformationsDetail>
        <div className="flex items-center gap-6">
          <AvatarComponent alt={staff.name} size={128} />

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-text-subtitle">
                CPF
              </label>
              <p className="mt-1 text-text-title">{staff.cpf}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-subtitle">
                Email
              </label>
              <p className="mt-1 text-text-title">{staff.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-subtitle">
                Empresa
              </label>
              <p className="mt-1 text-text-title">
                {COMPANY_NAMES[staff.company_id] ||
                  `Empresa ${staff.company_id}`}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-subtitle">
                Data de Credenciamento
              </label>
              <p className="mt-1 text-text-title">
                {formatDateTime(staff.created_at)}
              </p>
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
                events={events}
              />
            ),
          },
        ]}
        defaultTab="Eventos"
      />
    </DetailsPageContainer>
  );
};

export default StaffsDetailsPage;
