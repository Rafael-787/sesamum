import React, { useState, useEffect } from "react";
import {
  PageHeader,
  PageContainer,
} from "@/shared/components/layout/PageLayout";
import ListToolbar from "@/shared/components/list/ListToolbar";
import ListCard from "@/shared/components/list/ListCard";
import Badge from "@/shared/components/ui/Badge";
import { type User } from "../types/index";
import { Modal } from "@/shared/components/ui/Modal";
import { Building2, User as UserIcon, Shield, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usersService } from "../api/users.service";
import { UserForm } from "../components/UserForm";

const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await usersService.getAll();
        setUsers(response.data);
      } catch (err) {
        setError("Erro ao carregar usuários");
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Map UI filter to user role
  const filterMap: Record<string, string[]> = {
    all: ["admin", "company", "control"],
    admin: ["admin"],
    company: ["company"],
    control: ["control"],
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterMap[filter].includes(user.role);
    return matchesSearch && matchesFilter;
  });

  const handleUserClick = (user: User) => {
    navigate(`/users/${user.id}`);
  };

  const handleFormSuccess = async () => {
    setModalOpen(false);
    // Refresh users list
    try {
      setLoading(true);
      const response = await usersService.getAll();
      setUsers(response.data);
    } catch (err) {
      console.error("Error refreshing users:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader title="Usuários" subtitle="Gerencie usuários do sistema." />

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

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
        description="Preencha os dados para criar um novo usuário."
      >
        <UserForm
          mode="create"
          onSuccess={handleFormSuccess}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      {/* Users List */}
      <ListCard
        isLoading={loading}
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
