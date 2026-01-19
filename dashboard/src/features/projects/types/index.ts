// Project type based on copilot-instructions
export interface Project {
  id: number;
  name: string;
  status: "open" | "close";
  description?: string;
  company_id: number;
  date_begin?: string;
  date_end?: string;
  events_qnt?: number;
}
