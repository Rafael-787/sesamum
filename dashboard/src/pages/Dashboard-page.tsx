import React from "react";
import {
  RefreshCw,
  Calendar,
  Building2,
  Users,
  TrendingUp,
} from "lucide-react";
import { PageContainer, PageHeader } from "../components/shared/PageLayout";
import { MetricCard } from "../components/shared/MetricCard";
import { EventCalendar } from "../components/shared/EventCalendar";
import { RecentActivityList } from "../components/shared/RecentActivity";
import { useRealTimeData } from "../hooks/useRealTimeData";
import {
  type Event,
  type DashboardMetrics,
  type RecentActivity,
} from "../types";
import { formatDateTime } from "../lib/dateUtils";

// Mock data for dashboard metrics
const MOCK_DASHBOARD_METRICS: DashboardMetrics = {
  activeEvents: 12,
  totalProjects: 8,
  totalCompanies: 45,
  totalUsers: 156,
  recentCheckIns: 89,
};

// Extended mock events with varied dates for calendar testing
const MOCK_EVENTS: Event[] = [
  {
    id: 1,
    name: "Festival de Música 2024",
    date_begin: "2024-12-25T10:00:00Z",
    date_end: "2024-12-25T22:00:00Z",
    status: "open",
    project_id: 1,
    location: "Arena Principal",
    staffs_qnt: 45,
  },
  {
    id: 2,
    name: "Conferência Tech Brasil",
    date_begin: "2024-12-28T09:00:00Z",
    date_end: "2024-12-28T18:00:00Z",
    status: "open",
    project_id: 2,
    location: "Centro de Convenções",
    staffs_qnt: 32,
  },
  {
    id: 3,
    name: "Workshop de Design",
    date_begin: "2025-01-05T14:00:00Z",
    date_end: "2025-01-05T17:00:00Z",
    status: "open",
    project_id: 1,
    location: "Studio A",
    staffs_qnt: 15,
  },
  {
    id: 4,
    name: "Evento Corporativo - Ano Novo",
    date_begin: "2025-01-10T19:00:00Z",
    date_end: "2025-01-10T23:30:00Z",
    status: "open",
    project_id: 3,
    location: "Hotel Grand Plaza",
    staffs_qnt: 28,
  },
  {
    id: 5,
    name: "Feira de Negócios",
    date_begin: "2025-01-15T08:00:00Z",
    date_end: "2025-01-17T18:00:00Z",
    status: "open",
    project_id: 2,
    location: "Expo Center Sul",
    staffs_qnt: 67,
  },
  {
    id: 6,
    name: "Show Beneficente",
    date_begin: "2024-12-20T20:00:00Z",
    date_end: "2024-12-20T23:00:00Z",
    status: "close",
    project_id: 1,
    location: "Teatro Municipal",
    staffs_qnt: 22,
  },
];

// Mock recent activities
const MOCK_RECENT_ACTIVITIES: RecentActivity[] = [
  {
    id: 1,
    type: "event",
    title: "Corso",
    //description: "",
    timestamp: "2024-12-24T10:30:00Z",
  },
  {
    id: 2,
    type: "checkin",
    title: "Check-ins registrados",
    description: "15 funcionários fizeram check-in no Workshop de Design",
    timestamp: "2024-12-24T09:45:00Z",
  },
  {
    id: 3,
    type: "user",
    title: "Novo usuário cadastrado",
    description: "Carlos Silva foi adicionado como usuário de controle",
    timestamp: "2024-12-24T08:15:00Z",
  },
  {
    id: 4,
    type: "project",
    title: "Projeto atualizado",
    description: "Status do Projeto Eventos 2024 alterado para finalizado",
    timestamp: "2024-12-23T16:20:00Z",
  },
  {
    id: 5,
    type: "event",
    title: "Evento encerrado",
    description: "Show Beneficente foi finalizado com sucesso",
    timestamp: "2024-12-23T14:10:00Z",
  },
  {
    id: 6,
    type: "checkin",
    title: "Check-ins registrados",
    description: "20 funcionários fizeram check-in no Conferência Tech Brasil",
    timestamp: "2024-12-22T11:30:00Z",
  },
  {
    id: 7,
    type: "user",
    title: "Usuário atualizado",
    description: "Carlos Silva atualizou seu perfil",
    timestamp: "2024-12-22T10:00:00Z",
  },
  {
    id: 8,
    type: "project",
    title: "Novo projeto criado",
    description: "Projeto Eventos 2025 foi criado com sucesso",
    timestamp: "2024-12-21T15:45:00Z",
  },
];

// Mock API functions
const fetchDashboardMetrics = async (): Promise<DashboardMetrics> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  return MOCK_DASHBOARD_METRICS;
};

const fetchEvents = async (): Promise<Event[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return MOCK_EVENTS;
};

const fetchRecentActivities = async (): Promise<RecentActivity[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 600));
  return MOCK_RECENT_ACTIVITIES;
};

const DashboardPage: React.FC = () => {
  // Real-time data hooks with 10-minute intervals
  const {
    data: metrics,
    loading: metricsLoading,
    error: metricsError,
    lastUpdate: metricsLastUpdate,
    refetch: refetchMetrics,
  } = useRealTimeData(fetchDashboardMetrics, { interval: 600000 });

  const {
    data: events,
    loading: eventsLoading,
    error: eventsError,
    lastUpdate: eventsLastUpdate,
    refetch: refetchEvents,
  } = useRealTimeData(fetchEvents, { interval: 600000 });

  const {
    data: activities,
    loading: activitiesLoading,
    error: activitiesError,
    lastUpdate: activitiesLastUpdate,
    refetch: refetchActivities,
  } = useRealTimeData(fetchRecentActivities, { interval: 600000 });

  const handleRefresh = async () => {
    await Promise.all([refetchMetrics(), refetchEvents(), refetchActivities()]);
  };

  const refreshButton = (
    <button
      onClick={handleRefresh}
      disabled={metricsLoading || eventsLoading || activitiesLoading}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      style={{
        color: "var(--header-title-color, #0f172a)",
        fontSize: "0.875rem",
        fontWeight: "500",
      }}
    >
      <RefreshCw
        size={16}
        className={
          metricsLoading || eventsLoading || activitiesLoading
            ? "animate-spin"
            : ""
        }
      />
      Atualizar
    </button>
  );

  const lastUpdate =
    metricsLastUpdate || eventsLastUpdate || activitiesLastUpdate;

  return (
    <PageContainer>
      <PageHeader
        title="Bem vindo Admin"
        subtitle={
          lastUpdate
            ? ` Última atualização: ${formatDateTime(lastUpdate.toISOString())}`
            : "N/A"
        }
        action={refreshButton}
      />

      {/* Error Messages */}
      {(metricsError || eventsError || activitiesError) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-medium">
            Erro ao carregar dados:{" "}
            {metricsError || eventsError || activitiesError}
          </p>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Eventos Ativos"
          value={metrics?.activeEvents || 0}
          icon={<Calendar size={20} />}
          color="primary"
          loading={metricsLoading}
        />
        <MetricCard
          title="Projetos"
          value={metrics?.totalProjects || 0}
          icon={<TrendingUp size={20} />}
          color="success"
          loading={metricsLoading}
        />
        <MetricCard
          title="Empresas"
          value={metrics?.totalCompanies || 0}
          icon={<Building2 size={20} />}
          color="warning"
          loading={metricsLoading}
        />
        <MetricCard
          title="Usuários"
          value={metrics?.totalUsers || 0}
          icon={<Users size={20} />}
          color="primary"
          loading={metricsLoading}
        />
      </div>

      {/* Calendar and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-2">
          <div
            className="bg-white rounded-xl border border-slate-100 p-6"
            style={{
              boxShadow:
                "var(--toolbar-shadow, 0 1px 2px 0 rgba(16, 30, 54, 0.04))",
            }}
          >
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: "var(--header-title-color, #0f172a)" }}
            >
              Calendário de Eventos
            </h3>
            <EventCalendar events={events || []} loading={eventsLoading} />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <RecentActivityList
            activities={activities || []}
            loading={activitiesLoading}
            maxItems={7}
            title="Vistos Recentes"
          />
        </div>
      </div>
    </PageContainer>
  );
};

export default DashboardPage;
