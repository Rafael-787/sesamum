import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DetailsPageContainer,
  DetailsPageHeader,
  DetailsTabsContainer,
  DetailsInfoSection,
} from "@/shared/components/layout/DetailsPageLayout";
import OverviewTab from "../components/tabs/OverviewTab";
import StaffTab from "../components/tabs/StaffTab";
import CompaniesTab from "@/shared/components/tabs/CompaniesTab";
import { eventsService } from "../api/events.service";
import { Trash } from "lucide-react";
import { eventCompaniesService } from "../api/eventCompanies.service";

import type { CompanyWithEventData } from "@/features/companies";
import type { Event, Overview, StaffWithStatus } from "../types";
import { formatDate } from "@/shared/lib/dateUtils";
import { useRecentlyVisited } from "@/shared/hooks/useRecentlyVisited";
import { Modal } from "@/shared/components/ui/Modal";
import { EventForm } from "../components/EventForm";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { Toast } from "@/shared/components/ui/Toast";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { Badge } from "@/shared";

const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addRecentVisit } = useRecentlyVisited();

  // Check permissions (must be called before any conditional returns)
  const { can, isAdmin, isControl } = usePermissions();

  const [staffSearch, setStaffSearch] = useState("");
  const [staffFilter, setStaffFilter] = useState("all");
  const [companySearch, setCompanySearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [event, setEvent] = useState<Event | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [companies, setCompanies] = useState<CompanyWithEventData[]>([]);
  const [staffs, setStaffs] = useState<StaffWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isDeleteCompanyModalOpen, setIsDeleteCompanyModalOpen] =
    useState(false);
  const [companyToRemove, setCompanyToRemove] = useState<any>(null);
  const [toast, setToast] = useState<{
    open: boolean;
    type: "success" | "error";
    message: string;
  }>({
    open: false,
    type: "success",
    message: "",
  });

  // Fetch event details, companies, and staffs
  useEffect(() => {
    const fetchEventData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch event details
        const eventResponse = await eventsService.getById(Number(id));
        setEvent(eventResponse.data);

        // Track visit to recently visited
        addRecentVisit({
          id: Date.now(),
          type: "event",
          title: eventResponse.data.name,
          description: `${formatDate(
            eventResponse.data.date_begin,
          )} - ${formatDate(eventResponse.data.date_end)}`,
          url: `/events/${id}`,
          entityId: eventResponse.data.id,
        });

        // Fetch overview for this event
        const overviewResponse = await eventsService.getOverview(Number(id));
        setOverview(overviewResponse.data);

        // Fetch companies for this event
        const companiesResponse = await eventsService.getCompanies(Number(id));
        setCompanies(companiesResponse.data);

        // Fetch staffs for this event
        const staffsResponse = await eventsService.getStaffs(Number(id));
        setStaffs(
          staffsResponse.data.sort((a, b) => a.name.localeCompare(b.name)),
        );
      } catch (err) {
        setError("Erro ao carregar evento");
        console.error("Error fetching event data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id]);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = async () => {
    setIsEditModalOpen(false);
    // Refetch event data
    if (!id) return;
    try {
      const eventResponse = await eventsService.getById(Number(id));
      setEvent(eventResponse.data);
    } catch (err) {
      console.error("Error refetching event:", err);
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
      await eventsService.delete(Number(id));

      setToast({
        open: true,
        type: "success",
        message: "Evento excluído com sucesso",
      });

      setTimeout(() => {
        navigate("/events");
      }, 1500);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Erro ao excluir evento";

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

  const handleCompanyAdded = async () => {
    // Refetch companies after adding a new one
    if (!id) return;
    try {
      const companiesResponse = await eventsService.getCompanies(Number(id));
      setCompanies(companiesResponse.data);
      const overviewResponse = await eventsService.getOverview(Number(id));
      setOverview(overviewResponse.data);
    } catch (err) {
      console.error("Error refetching companies:", err);
    }
  };

  const handleStaffAdded = async () => {
    // Refetch staffs after adding new ones
    if (!id) return;
    try {
      const staffsResponse = await eventsService.getStaffs(Number(id));
      setStaffs(staffsResponse.data);
      const overviewResponse = await eventsService.getOverview(Number(id));
      setOverview(overviewResponse.data);
    } catch (err) {
      console.error("Error refetching staffs:", err);
    }
  };

  const confirmRemoveCompany = (company: any) => {
    setCompanyToRemove(company);
    setIsDeleteCompanyModalOpen(true);
  };

  // Lógica para chamar o serviço e remover a empresa
  const handleRemoveCompany = async () => {
    if (!companyToRemove || !event?.id) return; // Certifique-se de ter o eventId disponível no contexto

    try {
      // Chama o serviço para desassociar a empresa do evento
      await eventCompaniesService.delete(Number(event.id), companyToRemove.id);

      // Feedback de sucesso
      setToast({
        open: true,
        type: "success",
        message: `${companyToRemove.name} foi removido do evento.`,
      });

      // Atualiza a lista de empresas aqui
      const companiesResponse = await eventsService.getCompanies(Number(id));
      setCompanies(companiesResponse.data);

      setIsDeleteCompanyModalOpen(false);
      setCompanyToRemove(null);
    } catch (error) {
      console.error("Erro ao remover empresa:", error);
      setToast({
        open: true,
        type: "error",
        message: `Erro ao remover empresa do evento.`,
      });
    }
  };

  // Example data - to be calculated from EventStaff/EventCompany APIs

  if (loading) {
    return (
      <DetailsPageContainer>
        <div className="flex items-center justify-center h-64">
          <p className="text-subtitle">Carregando...</p>
        </div>
      </DetailsPageContainer>
    );
  }

  if (error || !event) {
    return (
      <DetailsPageContainer>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-700">{error || "Evento não encontrado"}</p>
        </div>
      </DetailsPageContainer>
    );
  }

  const canEdit = can("update", "event");
  const canDelete = can("delete", "event");

  return (
    <DetailsPageContainer>
      <DetailsPageHeader
        title={event.name}
        subtitle={`Evento${event.type === "project" ? " de Projeto" : ""}`}
        onEdit={canEdit ? handleEdit : undefined}
        onDelete={canDelete ? handleDelete : undefined}
      />

      <DetailsInfoSection>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-text-subtitle">
              Status
            </label>
            <p className="mt-1 text-text-title">
              <Badge variant={event.status} />
            </p>
          </div>
          {event.project_id && (
            <div>
              <label className="text-sm font-medium text-text-subtitle">
                Projeto ID
              </label>
              <p className="mt-1 text-text-title">{event.project_id}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-text-subtitle">
              Data de Início
            </label>
            <p className="mt-1 text-text-title">
              {formatDate(event.date_begin)}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-text-subtitle">
              Data de Término
            </label>
            <p className="mt-1 text-text-title">{formatDate(event.date_end)}</p>
          </div>
          {event.location && (
            <div>
              <label className="text-sm font-medium text-text-subtitle">
                Local
              </label>
              <p className="mt-1 text-text-title">{event.location}</p>
            </div>
          )}
          {event.staffs_qnt !== undefined && (
            <div>
              <label className="text-sm font-medium text-text-subtitle">
                Quantidade de Staffs
              </label>
              <p className="mt-1 text-text-title">{event.staffs_qnt}</p>
            </div>
          )}
        </div>
      </DetailsInfoSection>

      <DetailsTabsContainer
        tabs={[
          {
            title: "Visão Geral",
            content: <OverviewTab overview={overview} />,
          },
          {
            title: "Staffs",
            content: (
              <StaffTab
                eventId={Number(id)}
                staffSearch={staffSearch}
                setStaffSearch={setStaffSearch}
                staffFilter={staffFilter}
                setStaffFilter={setStaffFilter}
                mockStaff={staffs}
                companies={companies}
                onStaffAdded={handleStaffAdded}
              />
            ),
          },
          ...(event.company_role === "production" || isAdmin() || isControl()
            ? [
                {
                  title: "Empresas",
                  content: (
                    <CompaniesTab
                      eventId={Number(id)}
                      companySearch={companySearch}
                      setCompanySearch={setCompanySearch}
                      companyFilter={companyFilter}
                      setCompanyFilter={setCompanyFilter}
                      companies={companies}
                      onCompanyAdded={handleCompanyAdded}
                      getActions={() => [
                        {
                          label: "Desassociar",
                          icon: <Trash size={16} />,
                          variant: "destructive", // Estilo vermelho similar ao StaffTab
                          onClick: (c) => confirmRemoveCompany(c),
                        },
                      ]}
                    />
                  ),
                },
              ]
            : []),
        ]}
        defaultTab="Visão Geral"
      />

      {/* Edit Event Modal */}
      <Modal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        title="Editar Evento"
      >
        <EventForm
          mode="edit"
          event={event || undefined}
          onSuccess={handleEditSuccess}
          onCancel={handleEditCancel}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Excluir Evento"
        description="Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita e todos os dados relacionados serão removidos."
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
      <ConfirmDialog
        open={isDeleteCompanyModalOpen}
        onOpenChange={(isOpen) => {
          setIsDeleteCompanyModalOpen(isOpen);
          if (!isOpen) setCompanyToRemove(null);
        }}
        title="Desassociar Empresa"
        description={`Tem a certeza que deseja remover a empresa ${companyToRemove?.name} deste evento? Esta ação não excluirá a empresa do sistema, apenas removerá o vínculo com este evento.`}
        confirmLabel="Confirmar Remoção"
        cancelLabel="Cancelar"
        onConfirm={handleRemoveCompany}
        variant="danger"
      />
    </DetailsPageContainer>
  );
};

export default EventDetailsPage;
