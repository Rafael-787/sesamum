import React, { useState } from "react";
import ListToolbar from "../../shared/ListToolbar";
import ListCard from "../../shared/ListCard";
import { Modal } from "../../ui/Modal";
import { User as UserIcon, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Staff {
  id: number;
  name: string;
  cpf: string;
  company_id: number;
}

interface Company {
  id: number;
  name: string;
  cnpj: string;
  role: string;
  staffCount: number;
}

interface StaffTabProps {
  staffSearch: string;
  setStaffSearch: (value: string) => void;
  staffFilter: string;
  setStaffFilter: (value: string) => void;
  mockStaff: Staff[];
  companies: Company[];
}

const StaffTab: React.FC<StaffTabProps> = ({
  staffSearch,
  setStaffSearch,
  staffFilter,
  setStaffFilter,
  mockStaff,
  companies,
}) => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  // Build filter map dynamically from companies
  const filterMap: Record<string, number[]> = {
    all: companies.map((c) => c.id),
  };

  companies.forEach((company) => {
    filterMap[`company${company.id}`] = [company.id];
  });

  // Build filter options dynamically from companies
  const filterOptions = [
    { value: "all", label: "Todas Empresas" },
    ...companies.map((company) => ({
      value: `company${company.id}`,
      label: company.name,
    })),
  ];

  const filteredStaff = mockStaff.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
      staff.cpf.includes(staffSearch);
    const matchesFilter =
      staffFilter === "all" ||
      filterMap[staffFilter]?.includes(staff.company_id);
    return matchesSearch && matchesFilter;
  });

  const handleStaffClick = (staff: Staff) => {
    navigate(`/staffs/${staff.id}`);
  };

  return (
    <div className="space-y-4">
      <ListToolbar
        searchPlaceholder="Buscar por Nome ou CPF..."
        filterOptions={filterOptions}
        addLabel="Adicionar Equipe"
        onAdd={() => setModalOpen(true)}
        searchValue={staffSearch}
        onSearchChange={setStaffSearch}
        filterValue={staffFilter}
        onFilterChange={setStaffFilter}
      />

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Novo Membro"
        description="Formulário de novo membro em breve."
      >
        {/* Future form goes here */}
        <div className="text-sm text-gray-600">Formulário de novo membro.</div>
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
                </div>
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
              </div>
            </ListCard.Body>
          </>
        )}
      </ListCard>
    </div>
  );
};

export default StaffTab;
