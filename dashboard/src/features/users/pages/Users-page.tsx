import React, { useState, useEffect } from "react";
import {
  PageHeader,
  PageContainer,
} from "@/shared/components/layout/PageLayout";
import ListToolbar from "@/shared/components/list/ListToolbar";
import ListCard from "@/shared/components/list/ListCard";
import Badge from "@/shared/components/ui/Badge";
import { type User } from "../types/index";
import type { UserInvite } from "@/shared/types";
import { Modal } from "@/shared/components/ui/Modal";
import { Building2, User as UserIcon, Mail, Shield, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usersService } from "../api/users.service";
import { userInvitesService } from "../api/userInvites.service";
import { UserForm } from "../components/UserForm";
import UserInviteForm from "../components/UserInviteForm";
import { InviteDetailsModal } from "../components/InviteDetailsModal";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { usePermissions } from "@/shared/hooks/usePermissions";

// Unified type for displaying users and invites in the same list
type UserListItem =
  | ({ type: "user" } & User)
  | ({ type: "invite" } & UserInvite);

const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalView, setModalView] = useState<"menu" | "new" | "invite">("menu");
  const [inviteDetailsModalOpen, setInviteDetailsModalOpen] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<UserInvite | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [invites, setInvites] = useState<UserInvite[]>([]);
  const [listItems, setListItems] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search input
  const debouncedSearch = useDebounce(search, 500);

  // Fetch users and invites with server-side filtering
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // When "convite" is selected, only fetch invites
      if (filter === "convite") {
        const [pendingInvitesResponse, expiredInvitesResponse] =
          await Promise.all([
            userInvitesService.getAll({ status: "pending" }),
            userInvitesService.getAll({ status: "expired" }),
          ]);

        setUsers([]);
        setInvites([
          ...pendingInvitesResponse.data,
          ...expiredInvitesResponse.data,
        ]);
      } else if (filter !== "all") {
        // When a specific role is selected, only fetch users with that role (no invites)
        const params: { role?: string; search?: string } = {
          role: filter,
        };

        if (debouncedSearch) {
          params.search = debouncedSearch;
        }

        const usersResponse = await usersService.getAll(params);
        setUsers(usersResponse.data);
        setInvites([]);
      } else {
        // When "all" is selected, fetch all users and all invites
        const params: { search?: string } = {};

        if (debouncedSearch) {
          params.search = debouncedSearch;
        }

        const [usersResponse, pendingInvitesResponse, expiredInvitesResponse] =
          await Promise.all([
            usersService.getAll(params),
            userInvitesService.getAll({ status: "pending" }),
            userInvitesService.getAll({ status: "expired" }),
          ]);

        setUsers(usersResponse.data);
        setInvites([
          ...pendingInvitesResponse.data,
          ...expiredInvitesResponse.data,
        ]);
      }
    } catch (err) {
      setError("Erro ao carregar usuários");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Merge users and invites into unified list
  useEffect(() => {
    let items: UserListItem[] = [];

    // If "convite" filter is selected, only show invites
    if (filter === "convite") {
      const filteredInvites = invites.filter((invite) => {
        if (!debouncedSearch) return true;
        const searchLower = debouncedSearch.toLowerCase();
        return (
          invite.email?.toLowerCase().includes(searchLower) ||
          invite.role.toLowerCase().includes(searchLower)
        );
      });
      items = filteredInvites.map((invite) => ({
        type: "invite" as const,
        ...invite,
      }));
    } else {
      // Show users and invites based on current filter
      items = [
        ...users.map((user) => ({ type: "user" as const, ...user })),
        ...invites
          .filter((invite) => {
            if (!debouncedSearch) return true;
            const searchLower = debouncedSearch.toLowerCase();
            return (
              invite.email?.toLowerCase().includes(searchLower) ||
              invite.role.toLowerCase().includes(searchLower)
            );
          })
          .map((invite) => ({
            type: "invite" as const,
            ...invite,
          })),
      ];
    }

    setListItems(items);
  }, [users, invites, filter, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearch, filter]);

  const handleUserClick = (item: UserListItem) => {
    if (item.type === "user") {
      navigate(`/users/${item.id}`);
    } else if (item.type === "invite") {
      // Open invite details modal
      setSelectedInvite(item);
      setInviteDetailsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setModalView("menu");
  };

  const handleModalCancel = (open: boolean) => {
    if (!open) {
      handleModalClose();
    }
  };
  const handleFormSuccess = async () => {
    setModalOpen(false);
    // Refresh users list
    fetchUsers();
  };

  const handleInviteDeleteSuccess = () => {
    // Refresh users and invites list
    fetchUsers();
  };

  const getModalContent = () => {
    switch (modalView) {
      case "new":
        return (
          <UserForm
            onSuccess={handleFormSuccess}
            onCancel={handleModalClose}
            mode="create"
          />
        );
      case "invite":
        return (
          <UserInviteForm
            onSuccess={handleFormSuccess}
            onCancel={handleModalClose}
          />
        );
      case "menu":
      default:
        return (
          <div className="flex flex-col justify-center gap-4">
            <button
              className="hover:cursor-pointer flex items-center justify-center w-full gap-2 font-medium text-sm transition-colors px-4 py-2 bg-primary text-button-text rounded-lg shadow-sm hover:bg-button-bg-hover"
              onClick={() => setModalView("new")}
            >
              <UserIcon size={18} />
              <span>Criar usuário</span>
            </button>
            <button
              className="hover:cursor-pointer flex items-center justify-center w-full gap-2 font-medium text-sm transition-colors px-4 py-2 bg-primary text-button-text rounded-lg shadow-sm hover:bg-button-bg-hover"
              onClick={() => setModalView("invite")}
            >
              <Mail size={18} />
              <span>Criar convite</span>
            </button>
          </div>
        );
    }
  };

  const ModalText = {
    menu: {
      label: "Novo Usuário",
      description: "Como você deseja criar um novo usuário.",
    },
    new: {
      label: "Criar Usuário",
      description: "Informe todos os dados para criar um novo usuário.",
    },
    invite: {
      label: "Criar Convite",
      description:
        "Crie um convite com duração de 48h para um novo usuário de uma empresa.",
    },
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
          { value: "convite", label: "Convites" },
        ]}
        addLabel="Novo Usuário"
        onAdd={can("create", "user") ? () => setModalOpen(true) : undefined}
        searchValue={search}
        onSearchChange={setSearch}
        filterValue={filter}
        onFilterChange={setFilter}
      />

      <Modal
        open={modalOpen}
        onOpenChange={handleModalCancel}
        title={ModalText[modalView].label}
        description={ModalText[modalView].description}
      >
        {getModalContent()}
      </Modal>

      {/* Invite Details Modal */}
      <InviteDetailsModal
        invite={selectedInvite}
        open={inviteDetailsModalOpen}
        onOpenChange={setInviteDetailsModalOpen}
        onDeleteSuccess={handleInviteDeleteSuccess}
      />

      {/* Users and Invites List */}
      <ListCard
        isLoading={loading}
        filteredElements={listItems}
        notFoundIcon={
          <UserIcon size={48} className="mx-auto text-slate-300 mb-4" />
        }
        notFoundMessage="Nenhum usuário encontrado"
        onClick={handleUserClick}
      >
        {(item) => {
          // Render invite
          if (item.type === "invite") {
            return (
              <>
                <ListCard.Icon active={false}>
                  <Mail size={28} />
                </ListCard.Icon>

                <ListCard.Body>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-title font-semibold">
                        Convite {item.role}
                      </h3>
                      <Badge variant={item.status} />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-subtitle">
                      <span className="flex items-center gap-1">
                        <Mail size={14} />
                        {item.email || "Não especificado"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 size={14} />
                        Empresa #{item.company_id}
                      </span>
                    </div>
                  </div>
                </ListCard.Body>
              </>
            );
          }

          // Render user
          const getRoleIcon = (user: User) => {
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
              <ListCard.Icon>{getRoleIcon(item)}</ListCard.Icon>

              <ListCard.Body>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-title font-semibold">{item.name}</h3>
                    <Badge variant={item.role} />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-subtitle">
                    <span className="flex items-center gap-1">
                      <UserIcon size={14} />
                      {item.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 size={14} />
                      Empresa #{item.company_id}
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
