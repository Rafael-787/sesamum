// User type based on copilot-instructions
export interface User {
  id: number;
  name: string;
  picture: string;
  email: string;
  role: "admin" | "company" | "control";
  company_id: number;
}
