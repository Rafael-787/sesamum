import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DetailsPageContainer,
  DetailsPageHeader,
  DetailsTabsContainer,
  DetailsInfoSection,
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
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { Toast } from "@/shared/components/ui/Toast";
import { useAuth } from "@/shared/context/AuthContext";
import { usePermissions } from "@/shared/hooks/usePermissions";

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
  const navigate = useNavigate();
  const { addRecentVisit } = useRecentlyVisited();
  const { user: currentUser } = useAuth();
  const { can } = usePermissions(); // Move hook to top before any conditional returns
  const [eventSearch, setEventSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    type: "success" | "error";
    message: string;
  }>({
    open: false,
    type: "success",
    message: "",
  });

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

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!id) return;

    try {
      setDeleting(true);
      await usersService.delete(Number(id));

      setToast({
        open: true,
        type: "success",
        message: "Usuário excluído com sucesso",
      });

      setTimeout(() => {
        navigate("/users");
      }, 1500);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Erro ao excluir usuário";

      setToast({
        open: true,
        type: "error",
        message: errorMessage,
      });
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
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

  // Check permissions (only admin role)
  const canEdit = can("update", "user");
  const canDelete = can("delete", "user");

  return (
    <DetailsPageContainer>
      <DetailsPageHeader
        title={user.name}
        subtitle={getRoleLabel(user.role)}
        onEdit={canEdit ? handleEdit : undefined}
        onDelete={canDelete ? handleDelete : undefined}
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

      <DetailsInfoSection>
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
      </DetailsInfoSection>

      <DetailsTabsContainer
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Excluir Usuário"
        description="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita e todos os dados relacionados serão removidos."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={deleting}
        variant="danger"
      />

      {/* Toast Notification */}
      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onOpenChange={(open) => setToast({ ...toast, open })}
      />
    </DetailsPageContainer>
  );
};

export default UsersDetailsPage;
