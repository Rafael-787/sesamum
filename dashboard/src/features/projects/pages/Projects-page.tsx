import React, { useState, useEffect } from "react";
import {
  PageHeader,
  PageContainer,
} from "@/shared/components/layout/PageLayout";
import ListToolbar from "@/shared/components/list/ListToolbar";
import ListCard from "@/shared/components/list/ListCard";
import { type Project } from "../types/index";
import { Modal } from "@/shared/components/ui/Modal";
import { Building2, Briefcase, Calendar } from "lucide-react";
import { formatDate } from "@/shared/lib/dateUtils";
import Badge from "@/shared/components/ui/Badge";
import { useNavigate } from "react-router-dom";
import { projectsService } from "../api/projects.service";
import { ProjectForm } from "../components/ProjectForm";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { useDebounce } from "@/shared/hooks/useDebounce";

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 500);

  // Fetch projects with server-side filtering
  useEffect(() => {
    fetchProjects();
  }, [debouncedSearch, filter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters for server-side filtering
      const params: { search?: string; status?: string } = {};

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      if (filter !== "all") {
        params.status = filter;
      }

      const response = await projectsService.getAll(params);
      setProjects(response.data);
    } catch (err) {
      setError("Erro ao carregar projetos");
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  const handleFormSuccess = () => {
    setModalOpen(false);
    fetchProjects(); // Refresh the list
  };

  const handleFormCancel = () => {
    setModalOpen(false);
  };

  return (
    <PageContainer>
      <PageHeader title="Projetos" subtitle="Gerencie projetos do sistema." />

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      <ListToolbar
        searchPlaceholder="Buscar projeto..."
        filterOptions={[
          { value: "all", label: "Todos" },
          { value: "open", label: "Abertos" },
          { value: "close", label: "Concluídos" },
        ]}
        addLabel="Novo Projeto"
        onAdd={can("create", "project") ? () => setModalOpen(true) : undefined}
        searchValue={search}
        onSearchChange={setSearch}
        filterValue={filter}
        onFilterChange={setFilter}
      />

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Novo Projeto"
        description="Preencha as informações para criar um novo projeto."
      >
        <ProjectForm
          mode="create"
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>

      {/* Projects List */}
      <ListCard
        isLoading={loading}
        filteredElements={projects}
        notFoundIcon={
          <Briefcase size={48} className="mx-auto text-slate-300 mb-4" />
        }
        notFoundMessage="Nenhum projeto encontrado"
        onClick={handleProjectClick}
      >
        {(project) => {
          const isActive = project.status === "open";
          return (
            <>
              <ListCard.Icon active={isActive}>
                <Briefcase size={28} />
              </ListCard.Icon>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3
                    className={`text-base font-semibold ${
                      isActive ? "text-title" : "text-subtitle"
                    }`}
                  >
                    {project.name}
                  </h3>
                  <Badge variant={project.status} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-subtitle">
                  <span className="flex items-center gap-1">
                    <Building2 size={14} />
                    {`Empresa #${project.company_id}`}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDate(project.date_begin)} -{" "}
                    {formatDate(project.date_end)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {project.events_qnt ?? 0} eventos
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

export default ProjectsPage;
