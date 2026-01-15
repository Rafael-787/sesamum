import React, { useState } from "react";
import { PageHeader, PageContainer } from "../components/layout/PageLayout";
import ListToolbar from "../components/shared/ListToolbar";
import ListCard from "../components/shared/ListCard";
import Badge from "../components/ui/Badge";
import { type User } from "../types/index";
import { Modal } from "../components/ui/Modal";
import { Building2, User as UserIcon, Shield, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mockup users based on the data schema
const MOCK_USERS: User[] = [
  {
    id: 1,
    name: "João Silva",
    email: "joao.silva@produevent.com",
    picture: "https://thispersondoesnotexist.com/",
    role: "admin",
    company_id: 1,
  },
  {
    id: 2,
    name: "Maria Santos",
    picture: "",
    email: "maria.santos@techsolutions.com",
    role: "company",
    company_id: 2,
  },
  {
    id: 3,
    name: "Pedro Costa",
    picture: "",
    email: "pedro.costa@esportes.com",
    role: "control",
    company_id: 3,
  },
  {
    id: 4,
    name: "Ana Oliveira",
    picture: "",
    email: "ana.oliveira@agroexpo.com",
    role: "company",
    company_id: 4,
  },
];

const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);

  // Map UI filter to user role
  const filterMap: Record<string, string[]> = {
    all: ["admin", "company", "control"],
    admin: ["admin"],
    company: ["company"],
    control: ["control"],
  };

  const filteredUsers = MOCK_USERS.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterMap[filter].includes(user.role);
    return matchesSearch && matchesFilter;
  });

  const handleUserClick = (user: User) => {
    navigate(`/users/${user.id}`);
  };

  return (
    <PageContainer>
      <PageHeader title="Usuários" subtitle="Gerencie usuários do sistema." />

      <ListToolbar
        searchPlaceholder="Buscar por Nome ou Email..."
        filterOptions={[
          { value: "all", label: "Todos" },
          { value: "admin", label: "Administradores" },
          { value: "company", label: "Empresas" },
          { value: "control", label: "Controladores" },
        ]}
        addLabel="Novo Usuário"
        onAdd={() => setModalOpen(true)}
        searchValue={search}
        onSearchChange={setSearch}
        filterValue={filter}
        onFilterChange={setFilter}
      />

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Novo Usuário"
        description="Formulário de novo usuário em breve."
      >
        {/* Future form goes here */}
        <div className="text-sm text-gray-600">Formulário de novo usuário.</div>
      </Modal>

      {/* Users List */}
      <ListCard
        filteredElements={filteredUsers}
        notFoundIcon={
          <UserIcon size={48} className="mx-auto text-slate-300 mb-4" />
        }
        notFoundMessage="Nenhum usuário encontrado"
        onClick={handleUserClick}
      >
        {(user) => {
          const getRoleIcon = (user: any) => {
            if (user.picture) {
              return (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="object-cover"
                />
              );
            }
            switch (user.role) {
              case "admin":
                return <Shield size={28} />;
              case "control":
                return <Eye size={28} />;
              default:
                return <Building2 size={28} />;
            }
          };

          return (
            <>
              <ListCard.Icon>{getRoleIcon(user)}</ListCard.Icon>

              <ListCard.Body>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-title font-semibold">{user.name}</h3>
                    <Badge variant={user.role} />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-subtitle">
                    <span className="flex items-center gap-1">
                      <UserIcon size={14} />
                      {user.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 size={14} />
                      Empresa #{user.company_id}
                    </span>
                  </div>
                </div>
              </ListCard.Body>
            </>
          );
        }}
      </ListCard>
    </PageContainer>
  );
};

export default UsersPage;
