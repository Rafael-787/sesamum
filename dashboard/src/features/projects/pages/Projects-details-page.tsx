import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DetailsPageContainer,
  DetailsPageHeader,
  DetailsTabsContainer,
  DetailsInfoSection,
} from "@/shared/components/layout/DetailsPageLayout";
import OverviewTab from "../components/tabs/OverviewTab";
import EventsTab from "@/shared/components/tabs/EventsTab";
import CompaniesTab from "@/shared/components/tabs/CompaniesTab";
import { projectsService } from "../api/projects.service";
import { eventsService } from "@/features/events";
import type { Project } from "../types";
import type { Event } from "@/features/events/types";
import { formatDate } from "@/shared/lib/dateUtils";
import { useRecentlyVisited } from "@/shared/hooks/useRecentlyVisited";
import { Modal } from "@/shared/components/ui/Modal";
import { ProjectForm } from "../components/ProjectForm";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { Toast } from "@/shared/components/ui/Toast";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { Trash } from "lucide-react";
import { Badge } from "@/shared";

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addRecentVisit } = useRecentlyVisited();

  // Check permissions (must be called before any conditional returns)
  const { can, isAdmin, isControl } = usePermissions();

  const [eventSearch, setEventSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [companySearch, setCompanySearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [project, setProject] = useState<Project | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isDeleteEventModalOpen, setIsDeleteEventModalOpen] = useState(false);
  const [eventToRemove, setEventToRemove] = useState<Event | null>(null);
  const [toast, setToast] = useState<{
    open: boolean;
    type: "success" | "error";
    message: string;
  }>({
    open: false,
    type: "success",
    message: "",
  });

  // Fetch project details and their events
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch project details
        const projectResponse = await projectsService.getById(Number(id));
        setProject(projectResponse.data);

        // Track visit to recently visited
        addRecentVisit({
          id: Date.now(),
          type: "project",
          title: projectResponse.data.name,
          description:
            projectResponse.data.status === "open" ? "Aberto" : "Fechado",
          url: `/projects/${id}`,
          entityId: projectResponse.data.id,
        });

        // Fetch events for this project
        const eventsResponse = await projectsService.getEvents(Number(id));
        setEvents(eventsResponse.data);

        // Fetch companies for events in this project
        const companiesResponse = await projectsService.getCompanies(
          Number(id),
        );
        setCompanies(companiesResponse.data);
      } catch (err) {
        setError("Erro ao carregar projeto");
        console.error("Error fetching project data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [id, addRecentVisit]);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = async () => {
    setIsEditModalOpen(false);
    // Refetch project data
    if (!id) return;
    try {
      const projectResponse = await projectsService.getById(Number(id));
      setProject(projectResponse.data);
    } catch (err) {
      console.error("Error refetching project:", err);
    }
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!id) return;

    try {
      setDeleting(true);
      await projectsService.delete(Number(id));

      setToast({
        open: true,
        type: "success",
        message: "Projeto excluído com sucesso",
      });

      setTimeout(() => {
        navigate("/projects");
      }, 1500);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Erro ao excluir projeto";

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

  const handleEventAdded = async () => {
    // Refetch events after adding a new one
    if (!id) return;
    try {
      const eventsResponse = await projectsService.getEvents(Number(id));
      setEvents(eventsResponse.data);
    } catch (err) {
      console.error("Error refetching events:", err);
    }
  };

  const confirmRemoveEvent = (event: Event) => {
    setEventToRemove(event);
    setIsDeleteEventModalOpen(true);
  };

  // Função para remover o evento
  const handleRemoveEvent = async () => {
    if (!eventToRemove || !id) return;

    try {
      // Deleta o evento
      await eventsService.delete(eventToRemove.id);

      setToast({
        open: true,
        type: "success",
        message: "Evento removido com sucesso.",
      });

      // Atualiza a lista de eventos
      handleEventAdded(); // Reutiliza a função que já faz o refetch dos eventos

      setIsDeleteEventModalOpen(false);
      setEventToRemove(null);
    } catch (error) {
      console.error(error);
      setToast({
        open: true,
        type: "error",
        message: "Erro ao remover o evento.",
      });
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

  if (error || !project) {
    return (
      <DetailsPageContainer>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-700">{error || "Projeto não encontrado"}</p>
        </div>
      </DetailsPageContainer>
    );
  }

  const canEdit = can("update", "project");
  const canDelete = can("delete", "project");

  // Constants for metrics (until backend supports them)
  const totalStaff = 0;
  const eventsStaffMetrics: Array<{ name: string; staffCount: number }> = [];

  return (
    <DetailsPageContainer>
      <DetailsPageHeader
        title={project.name}
        subtitle="Projeto"
        onEdit={canEdit ? handleEdit : undefined}
        onDelete={canDelete ? handleDelete : undefined}
      />

      <DetailsInfoSection>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="flex flex-col text-sm font-medium text-text-subtitle">
              Status
            </label>
            <Badge variant={project.status} />
          </div>
          {project.date_begin && (
            <div>
              <label className="text-sm font-medium text-text-subtitle">
                Data de Início
              </label>
              <p className="mt-1 text-text-title">
                {formatDate(project.date_begin)}
              </p>
            </div>
          )}
          {project.date_end && (
            <div>
              <label className="text-sm font-medium text-text-subtitle">
                Data de Término
              </label>
              <p className="mt-1 text-text-title">
                {formatDate(project.date_end)}
              </p>
            </div>
          )}
        </div>
      </DetailsInfoSection>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Excluir Projeto"
        description="Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita e todos os dados relacionados serão removidos."
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
      <DetailsTabsContainer
        tabs={[
          {
            title: "Visão Geral",
            content: (
              <OverviewTab
                totalStaff={totalStaff}
                eventsStaff={eventsStaffMetrics}
                totalEvents={events.length}
                totalCompanies={companies.length}
                closedEvents={events.filter((e) => e.status === "close").length}
              />
            ),
          },
          {
            title: "Eventos",
            content: (
              <EventsTab
                addButton={true}
                projectId={Number(id)}
                eventSearch={eventSearch}
                setEventSearch={setEventSearch}
                eventFilter={eventFilter}
                setEventFilter={setEventFilter}
                events={events}
                onEventAdded={handleEventAdded}
                getActions={() => [
                  {
                    label: "Remover",
                    icon: <Trash size={16} />,
                    variant: "destructive",
                    onClick: (e) => confirmRemoveEvent(e),
                  },
                ]}
              />
            ),
          },
          ...(project.company_role === "production" || isAdmin() || isControl()
            ? [
                {
                  title: "Empresas",
                  content: (
                    <CompaniesTab
                      companySearch={companySearch}
                      setCompanySearch={setCompanySearch}
                      companyFilter={companyFilter}
                      setCompanyFilter={setCompanyFilter}
                      companies={companies}
                    />
                  ),
                },
              ]
            : []),
        ]}
        defaultTab="Visão Geral"
      />

      {/* Edit Project Modal */}
      <Modal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        title="Editar Projeto"
      >
        <ProjectForm
          mode="edit"
          project={project || undefined}
          onSuccess={handleEditSuccess}
          onCancel={handleEditCancel}
        />
      </Modal>
      <ConfirmDialog
        open={isDeleteEventModalOpen}
        onOpenChange={(isOpen) => {
          setIsDeleteEventModalOpen(isOpen);
          if (!isOpen) setEventToRemove(null);
        }}
        title="Remover Evento"
        description={`Tem certeza que deseja excluir o evento "${eventToRemove?.name}"? Esta ação excluirá permanentemente o evento e todos os dados associados a ele.`}
        confirmLabel="Excluir Evento"
        cancelLabel="Cancelar"
        onConfirm={handleRemoveEvent}
        variant="danger"
      />
    </DetailsPageContainer>
  );
};

export default ProjectDetailsPage;
