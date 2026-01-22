// Project type based on copilot-instructions
export interface Project {
  id: number;
  name: string;
  status: "open" | "close" | "pending";
  description?: string;
  company_id: number;
  date_begin?: string;
  date_end?: string;
  events_qnt?: number;
  company_role?: "production" | "service";
}
