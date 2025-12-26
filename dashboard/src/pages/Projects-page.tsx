import React, { useState } from "react";
import { PageHeader, PageContainer } from "../components/shared/PageLayout";
import ListToolbar from "../components/shared/ListToolbar";
import ListCard from "../components/shared/ListCard";
import { type Project } from "../types/index";
import { Modal } from "../components/shared/Modal";
import { Building2, Briefcase, Calendar } from "lucide-react";
import { formatDate } from "../lib/dateUtils";
import Badge from "../components/shared/Badge";

// Mockup projects based on the data schema
const MOCK_PROJECTS: Project[] = [
  {
    id: 1,
    name: "Festival de Verão 2024",
    status: "open",
    company_id: 1,
    date_begin: "2024-01-10",
    date_end: "2024-01-20",
    events_qnt: 5,
  },
  {
    id: 2,
    name: "Tech Summit SP",
    status: "open",
    company_id: 2,
    date_begin: "2024-02-15",
    date_end: "2024-02-18",
    events_qnt: 3,
  },
  {
    id: 3,
    name: "Corrida Noturna",
    status: "close",
    company_id: 3,
    date_begin: "2024-03-10",
    date_end: "2024-03-12",
    events_qnt: 2,
  },
  {
    id: 4,
    name: "Expo Agro 2025",
    status: "open",
    company_id: 4,
    date_begin: "2024-04-05",
    date_end: "2024-04-10",
    events_qnt: 4,
  },
];

const ProjectsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);

  // Map UI filter to project status
  const filterMap: Record<string, string[]> = {
    all: ["open", "close"],
    open: ["open"],
    close: ["close"],
  };

  const filteredProjects = MOCK_PROJECTS.filter((project) => {
    const matchesSearch = project.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesFilter = filterMap[filter].includes(project.status);
    return matchesSearch && matchesFilter;
  });

  return (
    <PageContainer>
      <PageHeader title="Projetos" subtitle="Gerencie projetos do sistema." />

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
          filteredElements={filteredProjects}
          notFoundIcon={
            <Briefcase size={48} className="mx-auto text-slate-300 mb-4" />
          }
          notFoundMessage="Nenhum projeto encontrado"
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
