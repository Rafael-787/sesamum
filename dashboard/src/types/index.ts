// User type based on copilot-instructions
export interface User {
  id: number;
  name: string;
  picture: string;
  email: string;
  role: "admin" | "company" | "control";
  company_id: number;
}

// Company type based on copilot-instructions
export interface Company {
  id: number;
  name: string;
  type: "production" | "service";
  cnpj: string;
}

// Project type based on copilot-instructions
export interface Project {
  id: number;
  name: string;
  status: "open" | "close";
  company_id: number;
  date_begin?: string;
  date_end?: string;
  events_qnt?: number;
}
// Event type based on copilot-instructions
export interface Event {
  id: number;
  name: string;
  date_begin: string;
  date_end: string;
  status: "open" | "close";
  project_id?: number;
  type?: "event" | "project";
  location?: string;
  staffs_qnt?: number;
  companies?: EventCompany[];
}

export interface EventCompany {
  id: number;
  role: "production" | "service";
  event_id: number;
  company_id: number;
}

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
