import type { DashboardMetrics, RecentActivity } from "@/shared/types";

/**
 * Mock Dashboard Metrics
 * Simulates the response from GET /api/v1/dashboard/metrics/
 */
export const mockDashboardMetrics: DashboardMetrics = {
  activeEvents: 12,
  totalProjects: 8,
  totalCompanies: 45,
  totalUsers: 156,
  recentCheckIns: 89,
};

/**
 * Mock Recent Activities
 * Simulates the response from GET /api/v1/dashboard/activities/
 */
export const mockRecentActivities: RecentActivity[] = [
  {
    id: 1,
    type: "event",
    title: "Corso",
    description: "Festival de Música",
    url: "/events/1",
    entityId: 1,
    timestamp: "2024-12-24T10:30:00Z",
  },
  {
    id: 2,
    type: "checkin",
    title: "Check-ins registrados",
    description: "15 funcionários fizeram check-in no Workshop de Design",
    url: "/checkin",
    entityId: 0,
    timestamp: "2024-12-24T09:45:00Z",
  },
  {
    id: 3,
    type: "user",
    title: "Novo usuário cadastrado",
    description: "Carlos Silva foi adicionado como usuário de controle",
    url: "/users/3",
    entityId: 3,
    timestamp: "2024-12-24T08:15:00Z",
  },
  {
    id: 4,
    type: "project",
    title: "Projeto atualizado",
    description: "Status do Projeto Eventos 2024 alterado para finalizado",
    url: "/projects/4",
    entityId: 4,
    timestamp: "2024-12-23T16:20:00Z",
  },
  {
    id: 5,
    type: "staff",
    title: "Evento encerrado",
    description: "Show Beneficente foi finalizado com sucesso",
    url: "/staff/5",
    entityId: 5,
    timestamp: "2024-12-23T14:10:00Z",
  },
  {
    id: 6,
    type: "company",
    title: "Check-ins registrados",
    description: "20 funcionários fizeram check-in no Conferência Tech Brasil",
    url: "/companies/6",
    entityId: 6,
    timestamp: "2024-12-22T11:30:00Z",
  },
  {
    id: 7,
    type: "user",
    title: "Usuário atualizado",
    description: "Carlos Silva atualizou seu perfil",
    url: "/users/7",
    entityId: 7,
    timestamp: "2024-12-22T10:00:00Z",
  },
  {
    id: 8,
    type: "project",
    title: "Novo projeto criado",
    description: "Projeto Eventos 2025 foi criado com sucesso",
    url: "/projects/8",
    entityId: 8,
    timestamp: "2024-12-21T15:45:00Z",
  },
];
