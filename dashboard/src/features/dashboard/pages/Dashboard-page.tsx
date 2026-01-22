import React, { useState, useEffect } from "react";
import { RefreshCw, Calendar, Building2, Users, Briefcase } from "lucide-react";
import {
  PageContainer,
  PageHeader,
} from "@/shared/components/layout/PageLayout";
import { MetricCard } from "../components/MetricCard";
import { EventCalendar } from "../components/EventCalendar";
import { RecentActivityList } from "../components/RecentActivity";
import { useRealTimeData } from "@/shared/hooks/useRealTimeData";
import { useRecentlyVisited } from "@/shared/hooks/useRecentlyVisited";
import { type DashboardMetrics, type RecentActivity } from "../types";
import type { Event } from "@/features/events";
import { formatDateTime } from "@/shared/lib/dateUtils";
import { dashboardService } from "../api/dashboard.service";
import { eventsService } from "@/features/events/api/events.service";

/**
 * Dashboard Page
 *
 * Main dashboard view showing key metrics, calendar, and recent activities.
 * Uses MSW-backed API services for metrics and events.
 * Recent activities are stored in and retrieved from localStorage.
 *
 * Features:
 * - Real-time data polling (10-minute intervals)
 * - Manual refresh capability
 * - Loading states
 * - Error handling
 * - localStorage for recent activities with useRecentlyVisited hook
 */

// API fetch functions using the new service layer
const fetchDashboardMetrics = async (): Promise<DashboardMetrics> => {
  const response = await dashboardService.getMetrics();
  return response.data;
};

const fetchEvents = async (): Promise<Event[]> => {
  const response = await eventsService.getAll();
  return response.data;
};

const DashboardPage: React.FC = () => {
  const { getRecentVisits } = useRecentlyVisited();
  // State for activities from localStorage
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  // Load activities from localStorage on mount
  useEffect(() => {
    const loadActivities = () => {
      setActivitiesLoading(true);
      const stored = getRecentVisits();
      setActivities(stored);
      setActivitiesLoading(false);
    };

    loadActivities();

    // Listen for storage changes from other tabs/windows
    const handleStorageChange = () => {
      loadActivities();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [getRecentVisits]);

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

  const handleRefresh = async () => {
    await Promise.all([refetchMetrics(), refetchEvents()]);
    // Reload activities from localStorage
    setActivities(getRecentVisits());
  };

  const refreshButton = (
    <button
      onClick={handleRefresh}
      disabled={metricsLoading || eventsLoading}
      className="hover:cursor-pointer flex text-title text-sm items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <RefreshCw
        size={16}
        className={metricsLoading || eventsLoading ? "animate-spin" : ""}
      />
      Atualizar
    </button>
  );

  const lastUpdate = metricsLastUpdate || eventsLastUpdate;

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
      {(metricsError || eventsError) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-medium">
            Erro ao carregar dados: {metricsError || eventsError}
          </p>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Eventos Ativos"
          value={metrics?.activeEvents || 0}
          icon={<Calendar size={20} />}
          color="event"
          loading={metricsLoading}
        />
        <MetricCard
          title="Projetos"
          value={metrics?.totalProjects || 0}
          icon={<Briefcase size={20} />}
          color="project"
          loading={metricsLoading}
        />
        <MetricCard
          title="Empresas"
          value={metrics?.totalCompanies || 0}
          icon={<Building2 size={20} />}
          color="company"
          loading={metricsLoading}
        />
        <MetricCard
          title="Usuários"
          value={metrics?.totalUsers || 0}
          icon={<Users size={20} />}
          color="user"
          loading={metricsLoading}
        />
      </div>

      {/* Calendar and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
            {/* <h3 className="text-lg text-title font-semibold mb-4">
              Calendário de Eventos
            </h3> */}
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
