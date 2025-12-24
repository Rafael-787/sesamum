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
}
// Event type based on copilot-instructions
export interface Event {
  id: number;
  name: string;
  date_begin: string;
  date_end: string;
  status: "open" | "close";
  project_id: number;
  companies?: EventCompany[];
}

export interface EventCompany {
  id: number;
  role: "production" | "service";
  event_id: number;
  company_id: number;
}
