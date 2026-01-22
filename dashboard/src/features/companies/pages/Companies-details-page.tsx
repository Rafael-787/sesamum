import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DetailsPageContainer,
  DetailsPageHeader,
  DetailsTabsContainer,
  DetailsInfoSection,
} from "@/shared/components/layout/DetailsPageLayout";
import EventsTab from "@/shared/components/tabs/EventsTab";
import Badge from "@/shared/components/ui/Badge";
import { Modal } from "@/shared/components/ui/Modal";
import { companiesService } from "../api/companies.service";
import { eventsService } from "@/features/events/api/events.service";
import type { Company } from "../types";
import type { Event } from "@/features/events/types";
import { useRecentlyVisited } from "@/shared/hooks/useRecentlyVisited";
import { CompanyForm } from "../components/CompanyForm";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { Toast } from "@/shared/components/ui/Toast";
import { useAuth } from "@/shared/context/AuthContext";
import { usePermissions } from "@/shared/hooks/usePermissions";

const CompaniesDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addRecentVisit } = useRecentlyVisited();
  const { user } = useAuth();
  const { can } = usePermissions(); // Move hook to top before any conditional returns
  const [eventSearch, setEventSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
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

  // Fetch company details and their events
  const fetchCompanyData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch company details
      const companyResponse = await companiesService.getById(Number(id));
      setCompany(companyResponse.data);

      // Track visit to recently visited
      addRecentVisit({
        id: Date.now(),
        type: "company",
        title: companyResponse.data.name,
        description: `CNPJ: ${companyResponse.data.cnpj}`,
        url: `/companies/${id}`,
        entityId: companyResponse.data.id,
      });

      // Fetch events for this company
      const eventsResponse = await eventsService.getByCompany(Number(id));
      setEvents(eventsResponse.data);
    } catch (err) {
      setError("Erro ao carregar empresa");
      console.error("Error fetching company data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, [id]);

  const handleFormSuccess = () => {
    setEditModalOpen(false);
    fetchCompanyData();
  };

  const handleFormCancel = () => {
    setEditModalOpen(false);
  };

  const handleEdit = () => {
    setEditModalOpen(true);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!id) return;

    try {
      setDeleting(true);
      await companiesService.delete(Number(id));

      setToast({
        open: true,
        type: "success",
        message: "Empresa excluída com sucesso",
      });

      setTimeout(() => {
        navigate("/companies");
      }, 1500);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Erro ao excluir empresa";

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

  if (error || !company) {
    return (
      <DetailsPageContainer>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-700">{error || "Empresa não encontrada"}</p>
        </div>
      </DetailsPageContainer>
    );
  }

  // Check permissions
  const canEdit = can("update", "company");
  const canDelete = can("delete", "company");

  return (
    <DetailsPageContainer>
      <DetailsPageHeader
        title={company.name}
        subtitle="Empresa"
        onEdit={canEdit ? handleEdit : undefined}
        onDelete={canDelete ? handleDelete : undefined}
      />

      <Modal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        title="Editar Empresa"
        description="Atualize os dados da empresa abaixo."
      >
        <CompanyForm
          mode="edit"
          company={company}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>

      <DetailsInfoSection>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-text-subtitle">
              CNPJ
            </label>
            <p className="mt-1 text-text-title">{company.cnpj}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-text-subtitle">
              Tipo
            </label>
            <div className="mt-1">
              <Badge variant="company" />
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
        title="Excluir Empresa"
        description="Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita e todos os dados relacionados serão removidos."
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

export default CompaniesDetailsPage;
