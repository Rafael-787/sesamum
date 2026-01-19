import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  DetailsPageContainer,
  PageHeader,
  TabsContainer,
  InformationsDetail,
} from "@/shared/components/layout/DetailsPageLayout";
import EventsTab from "@/shared/components/tabs/EventsTab";
import AvatarComponent from "@/shared/components/ui/Avatar";
import { Modal } from "@/shared/components/ui/Modal";
import { usersService } from "../api/users.service";
import { eventsService } from "@/features/events/api/events.service";
import type { User } from "../types";
import type { Event } from "@/features/events/types";
import { useRecentlyVisited } from "@/shared/hooks/useRecentlyVisited";
import { UserForm } from "../components/UserForm";

// Mock company names (should come from companies API in production)
const COMPANY_NAMES: Record<number, string> = {
  0: "Administração Sesamum",
  1: "ProduEvents Ltda",
  2: "Tech Solutions SP",
  3: "Esportes & Eventos",
  4: "Agro Expo Brasil",
  5: "Cultural Events RJ",
};

const UsersDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addRecentVisit } = useRecentlyVisited();
  const [eventSearch, setEventSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user details and their events
  useEffect(() => {
    const fetchUserData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch user details
        const userResponse = await usersService.getById(Number(id));
        setUser(userResponse.data);

        // Track visit to recently visited
        const roleLabels = {
          admin: "Administrador",
          company: "Gerente",
          control: "Controle",
        };
        addRecentVisit({
          id: Date.now(),
          type: "user",
          title: userResponse.data.name,
          description:
            roleLabels[userResponse.data.role as keyof typeof roleLabels] ||
            userResponse.data.role,
          url: `/users/${id}`,
          entityId: userResponse.data.id,
        });

        // Fetch events for this user
        const eventsResponse = await eventsService.getByUser(Number(id));
        setEvents(eventsResponse.data);
      } catch (err) {
        setError("Erro ao carregar usuário");
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleEdit = () => {
    setEditModalOpen(true);
  };

  const handleEditSuccess = async () => {
    setEditModalOpen(false);
    // Refresh user data
    if (!id) return;
    try {
      setLoading(true);
      const userResponse = await usersService.getById(Number(id));
      setUser(userResponse.data);
    } catch (err) {
      console.error("Error refreshing user:", err);
    } finally {
      setLoading(false);
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

  if (error || !user) {
    return (
      <DetailsPageContainer>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-700">{error || "Usuário não encontrado"}</p>
        </div>
      </DetailsPageContainer>
    );
  }

  // Helper function to get role label
  const getRoleLabel = (role: string) => {
    const roleLabels = {
      admin: "Administrador",
      company: "Gerente",
      control: "Controle",
    };
    return roleLabels[role as keyof typeof roleLabels] || role;
  };

  return (
    <DetailsPageContainer>
      <PageHeader
        title={user.name}
        subtitle={getRoleLabel(user.role)}
        onEdit={handleEdit}
      />

      <Modal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        title="Editar Usuário"
        description="Atualize os dados do usuário."
      >
        <UserForm
          mode="edit"
          user={user}
          onSuccess={handleEditSuccess}
          onCancel={() => setEditModalOpen(false)}
        />
      </Modal>

      <InformationsDetail>
        <div className="flex items-start gap-6">
          <AvatarComponent alt={user.name} src={user.picture} size={128} />

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-text-subtitle">
                Email
              </label>
              <p className="mt-1 text-text-title">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-subtitle">
                Função
              </label>
              <p className="mt-1 text-text-title">{getRoleLabel(user.role)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-subtitle">
                Empresa
              </label>
              <p className="mt-1 text-text-title">
                {COMPANY_NAMES[user.company_id] || `Empresa ${user.company_id}`}
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
                addButton={false}
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

export default UsersDetailsPage;
