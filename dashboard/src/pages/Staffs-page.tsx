import React, { useState } from "react";
import { PageHeader, PageContainer } from "../components/layout/PageLayout";
import ListToolbar from "../components/shared/ListToolbar";
import ListCard from "../components/shared/ListCard";
import { type Staff } from "../types/index";
import { Modal } from "../components/ui/Modal";
import { Building2, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mockup staff based on the data schema
const MOCK_STAFF: Staff[] = [
  {
    id: 1,
    name: "Rafael Carvalho Ferreira",
    cpf: "123.456.789-00",
    email: "rafael.ferreira@acme.com",
    company_id: 1,
    created_at: "15/01/2026",
  },
  {
    id: 2,
    name: "Ana Paula Costa",
    cpf: "987.654.321-00",
    email: "ana.costa@techsolutions.com",
    company_id: 2,
    created_at: "10/01/2026",
  },
  {
    id: 3,
    name: "Carlos Alberto Santos",
    cpf: "456.789.123-00",
    email: "carlos.santos@esportes.com",
    company_id: 3,
    created_at: "05/01/2026",
  },
  {
    id: 4,
    name: "Beatriz Lima",
    cpf: "321.654.987-00",
    email: "beatriz.lima@agroexpo.com",
    company_id: 4,
    created_at: "12/01/2026",
  },
];

// Mock company names (in production, this would come from API)
const COMPANY_NAMES: Record<number, string> = {
  1: "Acme Productions",
  2: "Tech Solutions",
  3: "Esportes & Eventos",
  4: "AgroExpo",
};

const StaffsPage: React.FC = () => {
  const navigate = useNavigate();
  const [staffSearch, setStaffSearch] = useState("");
  const [staffFilter, setStaffFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);

  // Map UI filter to company_id
  const filterMap: Record<string, number[]> = {
    all: [1, 2, 3, 4],
    "Acme Productions": [1],
    "Tech Solutions": [2],
    "Esportes & Eventos": [3],
    AgroExpo: [4],
  };

  const filterOptions = [
    { value: "all", label: "Todas as Empresas" },
    { value: "Acme Productions", label: "Acme Productions" },
    { value: "Tech Solutions", label: "Tech Solutions" },
    { value: "Esportes & Eventos", label: "Esportes & Eventos" },
    { value: "AgroExpo", label: "AgroExpo" },
  ];

  const filteredStaff = MOCK_STAFF.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
      staff.cpf.toLowerCase().includes(staffSearch.toLowerCase());
    const matchesFilter = filterMap[staffFilter].includes(staff.company_id);
    return matchesSearch && matchesFilter;
  });

  const handleStaffClick = (staff: Staff) => {
    navigate(`/staffs/${staff.id}`);
  };

  return (
    <PageContainer>
      <PageHeader title="Equipe" subtitle="Gerencie membros da equipe." />

      <ListToolbar
        searchPlaceholder="Buscar por Nome ou CPF..."
        filterOptions={filterOptions}
        addLabel="Adicionar Membro"
        onAdd={() => setModalOpen(true)}
        searchValue={staffSearch}
        onSearchChange={setStaffSearch}
        filterValue={staffFilter}
        onFilterChange={setStaffFilter}
      />

      <Modal open={modalOpen} onOpenChange={setModalOpen} title="Novo Membro">
        <div className="text-sm text-gray-600">
          Formulário de novo membro em breve.
        </div>
      </Modal>

      {/* Staff List */}
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
                    {COMPANY_NAMES[staff.company_id]}
                  </span>
                </div>
              </div>
            </ListCard.Body>
          </>
        )}
      </ListCard>
    </PageContainer>
  );
};

export default StaffsPage;
