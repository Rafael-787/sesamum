// Event type based on copilot-instructions
export interface Event {
  id: number;
  name: string;
  description?: string;
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

export interface EventStaff {
  id: number;
  event_id: number;
  staff_cpf: string;
  lastCheck?: Check;
}

export interface EventUser {
  id: number;
  user_id: number;
  event_id: number;
}

export interface Check {
  id: number;
  action: "check-in" | "check-out";
  timestamp: string;
  events_staff_id: number;
  user_control_id: number;
}
