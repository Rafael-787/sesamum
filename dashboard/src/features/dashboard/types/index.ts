import { type Event } from "../../events/types";

// Dashboard types
export interface DashboardMetrics {
  activeEvents: number;
  totalProjects: number;
  totalCompanies: number;
  totalUsers: number;
  recentCheckIns: number;
}

export interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: Event;
  color?: string;
  status: "open" | "close";
}

export interface CalendarViewProps {
  events: Event[];
  loading?: boolean;
  onEventClick?: (event: Event) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
}

const types = [
  "event",
  "project",
  "user",
  "checkin",
  "staff",
  "company",
] as const;

export interface RecentActivity {
  id: number;
  type: (typeof types)[number];
  title: string;
  description?: string;
  timestamp: string;
  icon?: string;
  url?: string;
  entityId?: number;
}

export interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: (typeof types)[number];
  loading?: boolean;
}

export interface PollingConfig {
  interval: number;
  enabled: boolean;
  pauseWhenHidden: boolean;
}
