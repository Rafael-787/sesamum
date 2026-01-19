import React, { useState } from "react";
import ListToolbar from "@/shared/components/list/ListToolbar";
import ListCard from "@/shared/components/list/ListCard";
import { Modal } from "@/shared/components/ui/Modal";
import Badge from "@/shared/components/ui/Badge";
import {
  User as UserIcon,
  Building2,
  Clock,
  CloudUpload,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDateTime } from "@/shared/lib/dateUtils";
import StaffCSVUpload from "./StaffCSVUpload";
import AddExistingStaff from "./AddExistingStaff";
import CreateAndAddStaff from "./CreateAndAddStaff";

interface Staff {
  id: number;
  name: string;
  cpf: string;
  company_id: number;
  last_action?: "check-in" | "check-out" | "credentialed" | "pending";
  checkin_time?: string;
  checkout_time?: string;
}

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
  mockStaff: Staff[];
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
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalView, setModalView] = useState<
    "menu" | "csv" | "existing" | "new"
  >("menu");

  // Build filter options dynamically from companies
  const filterOptions = [
    { value: "all", label: "Todos" },
    { value: "check-in", label: "Check-in" },
    { value: "check-out", label: "Check-out" },
    { value: "credentialed", label: "Credenciado" },
    { value: "pending", label: "Pendente" },
  ];

  const filteredStaff = mockStaff.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
      staff.cpf.includes(staffSearch);
    const matchesFilter =
      staffFilter === "all" ||
      filterOptions.find((option) => option.value === staffFilter)?.value ===
        staff.last_action;
    return matchesSearch && matchesFilter;
  });

  const handleStaffClick = (staff: Staff) => {
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

  const getModalContent = () => {
    switch (modalView) {
      case "csv":
        return (
          <StaffCSVUpload
            eventId={eventId}
            onSuccess={handleCSVSuccess}
            onCancel={handleModalClose}
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
              className="flex items-center justify-center w-full gap-2 font-medium text-sm transition-colors px-4 py-2 bg-primary text-button-text rounded-lg shadow-sm hover:bg-button-bg-hover cursor-pointer"
              onClick={() => setModalView("csv")}
            >
              <CloudUpload size={18} />
              <span>Arquivo .csv</span>
            </button>
            <button
              className="flex items-center justify-center w-full gap-2 font-medium text-sm transition-colors px-4 py-2 bg-primary text-button-text rounded-lg shadow-sm hover:bg-button-bg-hover cursor-pointer"
              onClick={() => setModalView("existing")}
            >
              <UserIcon size={18} />
              <span>Staff existente</span>
            </button>
            <button
              className="flex items-center justify-center w-full gap-2 font-medium text-sm transition-colors px-4 py-2 bg-primary text-button-text rounded-lg shadow-sm hover:bg-button-bg-hover cursor-pointer"
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
                  <Badge
                    variant={staff.last_action ? staff.last_action : "pending"}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-subtitle">
                    <span className="flex items-center gap-1">
                      <UserIcon size={14} />
                      {staff.cpf}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 size={14} />
                      Empresa #{staff.company_id}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-subtitle">
                    {
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        In:{" "}
                        {staff.checkin_time
                          ? formatDateTime(staff.checkin_time)
                          : "N/A"}
                      </span>
                    }
                    {
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        Out:{" "}
                        {staff.checkout_time
                          ? formatDateTime(staff.checkout_time)
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
    </div>
  );
};

export default StaffTab;
