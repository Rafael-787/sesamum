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
