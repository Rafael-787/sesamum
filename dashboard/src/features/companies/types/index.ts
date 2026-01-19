// Company type based on copilot-instructions
export interface Company {
  id: number;
  name: string;
  type: "production" | "service";
  cnpj: string;
}

// Extended Company type with event relationship data
export interface CompanyWithEventData extends Company {
  role: "production" | "service";
  staffCount: number;
}
