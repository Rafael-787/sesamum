import React, { useState } from "react";
import { PageHeader, PageContainer } from "../components/shared/PageLayout";
import ListToolbar from "../components/shared/ListToolbar";
import ListCard from "../components/shared/ListCard";
import { type User } from "../types/index";
import { Modal } from "../components/shared/Modal";
import { Building2, User as UserIcon, Shield, Eye } from "lucide-react";

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

  return (
    <PageContainer>
      <PageHeader title="Usuários" subtitle="Gerencie usuários do sistema." />

      <ListToolbar
        searchPlaceholder="Buscar por Nome ou Email..."
        filterOptions={[
          { value: "all", label: "Todos" },
          { value: "admin", label: "Administradores" },
          { value: "company", label: "Empresas" },
          { value: "control", label: "Controle" },
        ]}
        addLabel="Novo Usuário"
        onAdd={() => setModalOpen(true)}
        searchValue={search}
        onSearchChange={setSearch}
        filterValue={filter}
        onFilterChange={setFilter}
      />

      <Modal open={modalOpen} onOpenChange={setModalOpen} title="Novo Usuário">
        {/* Future form goes here */}
        <div className="text-sm text-gray-600">
          Formulário de novo usuário em breve.
        </div>
      </Modal>

      {/* Users List */}
      <ListCard
        filteredElements={filteredUsers}
        notFoundIcon={
          <UserIcon size={48} className="mx-auto text-slate-300 mb-4" />
        }
        notFoundMessage="Nenhum usuário encontrado"
      >
        {(user) => {
          const getRoleIcon = (user: any) => {
            if (user.picture) {
              return (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-14 h-14 rounded-lg"
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

          const getRoleLabel = (role: string) => {
            switch (role) {
              case "admin":
                return "Administrador";
              case "company":
                return "Empresa";
              case "control":
                return "Controle";
              default:
                return role;
            }
          };

          const getRoleColor = (role: string) => {
            switch (role) {
              case "admin":
                return "var(--color-danger, #dc2626)";
              case "control":
                return "var(--color-warning, #f59e0b)";
              default:
                return "var(--color-success, #16a34a)";
            }
          };

          return (
            <>
              {/* Role Icon */}
              <div
                className="flex flex-col items-center justify-center w-14 h-14 rounded-lg border shrink-0"
                style={{
                  background: user.picture
                    ? "var(--toolbar-bg, #fff)"
                    : "var(--input-primary, #2563eb)",
                  border: "1px solid var(--input-border, #e2e8f0)",
                  color: "var(--sidebar-text, #2563eb)",
                }}
              >
                {getRoleIcon(user)}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3
                    className="text-base font-semibold"
                    style={{
                      color: "var(--header-title-color, #0f172a)",
                    }}
                  >
                    {user.name}
                  </h3>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
                    style={{
                      background: getRoleColor(user.role) + "10",
                      color: getRoleColor(user.role),
                    }}
                  >
                    {getRoleLabel(user.role)}
                  </span>
                </div>
                <div
                  className="flex flex-wrap gap-x-4 gap-y-1 text-sm"
                  style={{ color: "var(--sidebar-muted, #64748b)" }}
                >
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
            </>
          );
        }}
      </ListCard>
    </PageContainer>
  );
};

export default UsersPage;
