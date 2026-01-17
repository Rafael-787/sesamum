import React, { useState, useEffect } from "react";
import { PageHeader, PageContainer } from "../components/layout/PageLayout";
import ListToolbar from "../components/shared/ListToolbar";
import ListCard from "../components/shared/ListCard";
import { type Staff } from "../types/index";
import { Modal } from "../components/ui/Modal";
import { Building2, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { staffsService } from "../api/services";
import { formatDateTime } from "../lib/dateUtils";

// Mock company names (in production, this would come from API)
const COMPANY_NAMES: Record<number, string> = {
  1: "ProduEvents Ltda",
  2: "Tech Solutions SP",
  3: "Esportes & Eventos",
  4: "Agro Expo Brasil",
  5: "Cultural Events RJ",
};

const StaffsPage: React.FC = () => {
  const navigate = useNavigate();
  const [staffSearch, setStaffSearch] = useState("");
  const [staffFilter, setStaffFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch staffs
  useEffect(() => {
    const fetchStaffs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await staffsService.getAll();
        setStaffs(response.data);
      } catch (err) {
        setError("Erro ao carregar staffs");
        console.error("Error fetching staffs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffs();
  }, []);

  // Map UI filter to company_id (simplified - filter on client side)
  const filteredStaff = staffs.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
      staff.cpf.toLowerCase().includes(staffSearch.toLowerCase());
    return matchesSearch;
  });

  const handleStaffClick = (staff: Staff) => {
    navigate(`/staffs/${staff.id}`);
  };

  return (
    <PageContainer>
      <PageHeader title="Staffs" subtitle="Gerencie membros da equipe." />

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      <ListToolbar
        searchPlaceholder="Buscar por Nome ou CPF..."
        filterOptions={[]}
        addLabel="Adicionar Staff"
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

      {/* Staff List */}
      <ListCard
        isLoading={loading}
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
                    {COMPANY_NAMES[staff.company_id] ||
                      `Empresa ${staff.company_id}`}
                  </span>
                  <span>{formatDateTime(staff.created_at)}</span>
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
