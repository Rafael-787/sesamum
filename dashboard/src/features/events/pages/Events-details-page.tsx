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
import { Trash, Users } from "lucide-react";
import { eventCompaniesService } from "../api/eventCompanies.service";

import type { CompanyWithEventData } from "@/features/companies";
import type { Event, Overview, StaffWithStatus } from "../types";
import { formatDate, formatDateTime } from "@/shared/lib/dateUtils";
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

  // Check permissions
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

  // Estados para o Modal de Limite de Staff
  const [changeStaffLimitModalOpen, setChangeStaffLimitModalOpen] =
    useState(false);
  const [companyToEditLimit, setCompanyToEditLimit] = useState<any>(null);
  const [newStaffLimit, setNewStaffLimit] = useState<number | "">("");
  const [isUpdatingLimit, setIsUpdatingLimit] = useState(false);

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

        // Fetch companies for this event e mapeia o staff_limit
        const isAuthorized =
          event?.company_role === "production" || isAdmin() || isControl();

        if (isAuthorized) {
          const companiesResponse = await eventsService.getCompanies(
            Number(id),
          );
          const mappedCompanies = companiesResponse.data.map((c: any) => ({
            ...c,
            staffLimit: c.staff_limit || c.staffLimit,
          }));
          setCompanies(mappedCompanies);
        }

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

  const isAuthorized =
    event?.company_role === "production" || isAdmin() || isControl();
  const handleCompanyAdded = async () => {
    if (!id) return;
    try {
      if (isAuthorized) {
        const companiesResponse = await eventsService.getCompanies(Number(id));
        const mappedCompanies = companiesResponse.data.map((c: any) => ({
          ...c,
          staffLimit: c.staff_limit || c.staffLimit,
        }));
        setCompanies(mappedCompanies);
      }

      const overviewResponse = await eventsService.getOverview(Number(id));
      setOverview(overviewResponse.data);
    } catch (err) {
      console.error("Error refetching companies:", err);
    }
  };

  const handleStaffAdded = async () => {
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

  // Abre o modal de alteração de limite e preenche o valor atual
  const changeStaffLimit = (company: any) => {
    setCompanyToEditLimit(company);
    setNewStaffLimit(
      company.staffLimit !== undefined && company.staffLimit !== null
        ? company.staffLimit
        : "",
    );
    setChangeStaffLimitModalOpen(true);
  };

  const handleRemoveCompany = async () => {
    if (!companyToRemove || !event?.id) return;

    try {
      await eventCompaniesService.delete(Number(event.id), companyToRemove.id);

      setToast({
        open: true,
        type: "success",
        message: `${companyToRemove.name} foi removido do evento.`,
      });

      if (isAuthorized) {
        const companiesResponse = await eventsService.getCompanies(Number(id));
        const mappedCompanies = companiesResponse.data.map((c: any) => ({
          ...c,
          staffLimit: c.staff_limit || c.staffLimit,
        }));
        setCompanies(mappedCompanies);
      }

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

  // Submete a alteração de limite para a API
  const handleUpdateStaffLimit = async () => {
    if (!companyToEditLimit || !event?.id || newStaffLimit === "") return;

    try {
      setIsUpdatingLimit(true);

      // Assumindo que o seu eventCompaniesService tenha o método update
      await eventCompaniesService.update(
        Number(event.id),
        companyToEditLimit.id,
        {
          staff_limit: newStaffLimit,
        },
      );

      setToast({
        open: true,
        type: "success",
        message: `Limite de staffs atualizado com sucesso.`,
      });

      // Recarrega a lista de empresas para refletir a alteração
      if (isAuthorized) {
        const companiesResponse = await eventsService.getCompanies(Number(id));
        const mappedCompanies = companiesResponse.data.map((c: any) => ({
          ...c,
          staffLimit: c.staff_limit || c.staffLimit,
        }));
        setCompanies(mappedCompanies);
      }

      setChangeStaffLimitModalOpen(false);
      setCompanyToEditLimit(null);
    } catch (error) {
      console.error("Erro ao atualizar limite:", error);
      setToast({
        open: true,
        type: "error",
        message: `Erro ao atualizar limite de staffs.`,
      });
    } finally {
      setIsUpdatingLimit(false);
    }
  };

  const handleExportReport = async () => {
    if (!id) return;

    try {
      const response = await eventsService.exportReport(Number(id));

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      link.setAttribute("download", `relatorio_evento_${event?.name}.csv`);
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

      setToast({
        open: true,
        type: "success",
        message: "Relatório exportado com sucesso!",
      });
    } catch (err) {
      console.error("Erro ao exportar relatório:", err);
      setToast({
        open: true,
        type: "error",
        message: "Erro ao exportar o relatório.",
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
        onExport={handleExportReport || undefined}
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
              {formatDateTime(event.date_begin)}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-text-subtitle">
              Data de Término
            </label>
            <p className="mt-1 text-text-title">
              {formatDateTime(event.date_end)}
            </p>
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
            content: (
              <OverviewTab
                overview={overview}
                canViewCompanies={
                  event.company_role === "production" ||
                  isAdmin() ||
                  isControl()
                }
              />
            ),
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
                          variant: "destructive",
                          onClick: (c) => confirmRemoveCompany(c),
                        },
                        {
                          label: "Limite de staffs",
                          icon: <Users size={16} />,
                          variant: "default",
                          onClick: (c) => changeStaffLimit(c),
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

      {/* Remove Company Dialog */}
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

      {/* Modal para Mudar Staff Limit */}
      <Modal
        open={changeStaffLimitModalOpen}
        onOpenChange={(isOpen) => {
          setChangeStaffLimitModalOpen(isOpen);
          if (!isOpen) setCompanyToEditLimit(null);
        }}
        title="Mudar Limite de Staffs"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Defina o novo limite de staffs para a empresa{" "}
            <strong>{companyToEditLimit?.name}</strong> neste evento.
          </p>

          <div>
            <label
              htmlFor="staffLimit"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Limite
            </label>
            <input
              id="staffLimit"
              type="number"
              min="0"
              value={newStaffLimit}
              onChange={(e) =>
                setNewStaffLimit(e.target.value ? Number(e.target.value) : "")
              }
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-input-bg border border-input-border text-input-text"
              placeholder="Digite o limite..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setChangeStaffLimitModalOpen(false);
                setCompanyToEditLimit(null);
              }}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 hover:cursor-pointer transition-colors"
              disabled={isUpdatingLimit}
            >
              Cancelar
            </button>
            <button
              onClick={handleUpdateStaffLimit}
              disabled={isUpdatingLimit || newStaffLimit === ""}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-button-bg-hover hover:cursor-pointer transition-colors disabled:opacity-50"
            >
              {isUpdatingLimit ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </Modal>
    </DetailsPageContainer>
  );
};

export default EventDetailsPage;
