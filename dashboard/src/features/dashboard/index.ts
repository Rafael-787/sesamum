// Dashboard Feature Exports
export { default as DashboardPage } from "./pages/Dashboard-page";

// Components
export { MetricCard } from "./components/MetricCard";
export { EventCalendar } from "./components/EventCalendar";
export { RecentActivityList } from "./components/RecentActivity";

// API
export { dashboardService } from "./api/dashboard.service";

// Types
export type {
  DashboardMetrics,
  CalendarEvent,
  CalendarViewProps,
  RecentActivity,
  MetricCardProps,
  PollingConfig,
} from "./types";
