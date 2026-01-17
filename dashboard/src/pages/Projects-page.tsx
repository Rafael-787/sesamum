import React, { useState, useEffect } from "react";
import { PageHeader, PageContainer } from "../components/layout/PageLayout";
import ListToolbar from "../components/shared/ListToolbar";
import ListCard from "../components/shared/ListCard";
import { type Project } from "../types/index";
import { Modal } from "../components/ui/Modal";
import { Building2, Briefcase, Calendar } from "lucide-react";
import { formatDate } from "../lib/dateUtils";
import Badge from "../components/ui/Badge";
import { useNavigate } from "react-router-dom";
import { projectsService } from "../api/services";

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await projectsService.getAll();
        setProjects(response.data);
      } catch (err) {
        setError("Erro ao carregar projetos");
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Map UI filter to project status
  const filterMap: Record<string, string[]> = {
    all: ["open", "close"],
    open: ["open"],
    close: ["close"],
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesFilter = filterMap[filter].includes(project.status);
    return matchesSearch && matchesFilter;
  });

  const handleProjectClick = (project: Project) => {
    navigate(`/projects/${project.id}`);
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
        onAdd={() => setModalOpen(true)}
        searchValue={search}
        onSearchChange={setSearch}
        filterValue={filter}
        onFilterChange={setFilter}
      />

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Novo Projeto"
        description="Formulário de novo projeto em breve."
      >
        {/* Future form goes here */}
        <div className="text-sm text-gray-600">Formulário de novo projeto.</div>
      </Modal>
      <div className="text-sm text-gray-600">
        {/* Projects List */}
        <ListCard
          isLoading={loading}
          filteredElements={filteredProjects}
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
      </div>
    </PageContainer>
  );
};

export default ProjectsPage;
