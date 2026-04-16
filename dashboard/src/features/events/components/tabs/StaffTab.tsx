import React, { useState } from "react";
import ListToolbar from "@/shared/components/list/ListToolbar";
import ListCard from "@/shared/components/list/ListCard";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { Toast } from "@/shared";
import { Modal } from "@/shared/components/ui/Modal";
import Badge from "@/shared/components/ui/Badge";
import {
  User as UserIcon,
  Building2,
  Clock,
  CloudUpload,
  Plus,
  Trash,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { formatDateTime } from "@/shared/lib/dateUtils";
import StaffCSVUpload from "./StaffCSVUpload";
import AddExistingStaff from "./AddExistingStaff";
import CreateAndAddStaff from "./CreateAndAddStaff";
import { eventStaffService } from "../../api/eventStaff.service";
import type { StaffWithStatus } from "../../types";

interface Company {
  id: number;
  name: string;
  cnpj: string;
  role: string;
  staffCount: number;
}

interface StaffTabProps {
  eventId: number;
  staffSearch: string;
  setStaffSearch: (value: string) => void;
  staffFilter: string;
  setStaffFilter: (value: string) => void;
  mockStaff: StaffWithStatus[];
  companies: Company[];
  onStaffAdded?: () => void;
}

const StaffTab: React.FC<StaffTabProps> = ({
  eventId,
  staffSearch,
  setStaffSearch,
  staffFilter,
  setStaffFilter,
  mockStaff,
  onStaffAdded,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [staffToRemove, setStaffToRemove] = useState<any>(null);
  const [modalView, setModalView] = useState<
    "menu" | "csv" | "existing" | "new"
  >("menu");
  const [toast, setToast] = useState<{
    open: boolean;
    type: "default" | "success" | "warning" | "error";
    message: string;
  }>({
    open: false,
    type: "default",
    message: "",
  });

  const getBadgeVariant = (action?: string) => {
    switch (action) {
      case "check-in":
        return "check-in";
      case "check-out":
        return "check-out";
      case "registration":
        return "credentialed";
      default:
        return "pending";
    }
  };

  // Build filter options dynamically from companies
  const filterOptions = [
    { value: "all", label: "Todos" },
    { value: "check-in", label: "Check-in" },
    { value: "check-out", label: "Check-out" },
    { value: "registration", label: "Credenciado" },
    { value: "pending", label: "Pendente" },
  ];

  const filteredStaff = mockStaff.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
      (staff.cpf && staff.cpf.includes(staffSearch));

    const lastAction = staff.last_status?.action || "pending";
    const matchesFilter =
      staffFilter === "all" ||
      filterOptions.find((option) => option.value === staffFilter)?.value ===
        lastAction;
    return matchesSearch && matchesFilter;
  });

  const handleStaffClick = (staff: StaffWithStatus) => {
    navigate(`/staffs/${staff.id}`);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setModalView("menu");
  };

  const handleCSVSuccess = () => {
    handleModalClose();
    if (onStaffAdded) {
      onStaffAdded();
    }
  };
  const confirmRemove = (staff: any) => {
    setStaffToRemove(staff);
    setIsDeleteModalOpen(true);
  };

  const handleRemoveStaff = async () => {
    if (!staffToRemove || !id) return;

    try {
      // Chama o serviço para deletar a relação (Ajuste o método conforme seu service)
      await eventStaffService.delete(Number(id), staffToRemove.id);

      setToast({
        open: true,
        type: "success",
        message: `${staffToRemove.name} foi removido do evento.`,
      });

      // Fecha o modal e recarrega a lista
      setIsDeleteModalOpen(false);
      setStaffToRemove(null);
      if (onStaffAdded) {
        onStaffAdded();
      }
    } catch (error) {
      console.error(error);
      setToast({
        open: true,
        type: "error",
        message: "Erro ao remover o staff do evento.",
      });
    }
  };

  const getModalContent = () => {
    switch (modalView) {
      case "csv":
        return (
          <StaffCSVUpload
            eventId={eventId}
            onSuccess={handleCSVSuccess}
            onCancel={handleModalClose}
            setToast={setToast}
          />
        );
      case "existing":
        return (
          <AddExistingStaff
            eventId={eventId}
            onSuccess={handleCSVSuccess}
            onCancel={handleModalClose}
          />
        );
      case "new":
        return (
          <CreateAndAddStaff
            eventId={eventId}
            onSuccess={handleCSVSuccess}
            onCancel={handleModalClose}
          />
        );
      case "menu":
      default:
        return (
          <div className="flex flex-col justify-center gap-4">
            <button
              className="hover:cursor-pointer flex items-center justify-center w-full gap-2 font-medium text-sm transition-colors px-4 py-2 bg-primary text-button-text rounded-lg shadow-sm hover:bg-button-bg-hover cursor-pointer"
              onClick={() => setModalView("csv")}
            >
              <CloudUpload size={18} />
              <span>Arquivo .csv</span>
            </button>
            <button
              className="hover:cursor-pointer flex items-center justify-center w-full gap-2 font-medium text-sm transition-colors px-4 py-2 bg-primary text-button-text rounded-lg shadow-sm hover:bg-button-bg-hover cursor-pointer"
              onClick={() => setModalView("existing")}
            >
              <UserIcon size={18} />
              <span>Staff existente</span>
            </button>
            <button
              className="hover:cursor-pointer flex items-center justify-center w-full gap-2 font-medium text-sm transition-colors px-4 py-2 bg-primary text-button-text rounded-lg shadow-sm hover:bg-button-bg-hover cursor-pointer"
              onClick={() => setModalView("new")}
            >
              <Plus size={18} />
              <span>Novo Staff</span>
            </button>
          </div>
        );
    }
  };

  const getModalTitle = () => {
    switch (modalView) {
      case "csv":
        return "Importar Staff via CSV";
      case "existing":
        return "Adicionar Staff Existente";
      case "new":
        return "Criar Novo Staff";
      default:
        return "Adicionar Staff";
    }
  };

  return (
    <div className="space-y-4">
      <ListToolbar
        searchPlaceholder="Buscar por Nome ou CPF..."
        filterOptions={filterOptions}
        addLabel="Adicionar Staff"
        onAdd={() => setModalOpen(true)}
        searchValue={staffSearch}
        onSearchChange={setStaffSearch}
        filterValue={staffFilter}
        onFilterChange={setStaffFilter}
      />

      <Modal
        open={modalOpen}
        onOpenChange={handleModalClose}
        title={getModalTitle()}
        description={
          modalView === "menu"
            ? "Como você quer adicionar um novo staff?"
            : undefined
        }
      >
        {getModalContent()}
      </Modal>

      <ListCard
        filteredElements={filteredStaff}
        notFoundIcon={
          <UserIcon size={48} className="mx-auto text-slate-300 mb-4" />
        }
        notFoundMessage="Nenhum membro da equipe encontrado"
        onClick={handleStaffClick}
        getActions={() => [
          {
            label: "Desassociar",
            icon: <Trash size={16} />,
            variant: "destructive", // Isso deixará o texto vermelho conforme configurado no ListCard
            onClick: (s) => confirmRemove(s),
          },
        ]}
      >
        {(staff) => (
          <>
            <ListCard.Icon>
              <UserIcon size={28} />
            </ListCard.Icon>

            <ListCard.Body>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-title font-semibold">{staff.name}</h3>
                  <Badge variant={getBadgeVariant(staff.last_status?.action)} />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-subtitle">
                    <span className="flex items-center gap-1">
                      <UserIcon size={14} />
                      {staff.cpf}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 size={14} />
                      {staff.company || "N/A"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-subtitle">
                    {
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        Última ação:{" "}
                        {staff.last_status?.timestamp
                          ? formatDateTime(staff.last_status.timestamp)
                          : "N/A"}
                      </span>
                    }
                  </div>
                </div>
              </div>
            </ListCard.Body>
          </>
        )}
      </ListCard>
      <Toast
        open={toast.open}
        onOpenChange={(open) => setToast((prev) => ({ ...prev, open }))}
        type={toast.type}
        message={toast.message}
      />
      <ConfirmDialog
        open={isDeleteModalOpen}
        onOpenChange={(isOpen) => {
          setIsDeleteModalOpen(isOpen);
          // Limpa o estado selecionado ao fechar (seja por clique fora ou ESC)
          if (!isOpen) setStaffToRemove(null);
        }}
        title="Desassociar Membro"
        description={`Tem a certeza que deseja remover ${staffToRemove?.name} deste evento? O registo do staff permanecerá no sistema, apenas a ligação ao evento será removida.`}
        confirmLabel="Confirmar Remoção"
        cancelLabel="Cancelar"
        onConfirm={handleRemoveStaff}
        variant="danger"
      />
    </div>
  );
};

export default StaffTab;
