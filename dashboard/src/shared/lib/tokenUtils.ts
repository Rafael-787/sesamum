import { jwtDecode } from "jwt-decode";

export interface DecodedJWT {
  user_id: number;
  email: string;
  role: string;
  company_id?: number;
  token_type: string;
  exp: number;
}

export function decodeJWT(token: string): DecodedJWT | null {
  try {
    return jwtDecode<DecodedJWT>(token);
  } catch {
    return null;
  }
}

export function isJWTExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded) return true;
  return decoded.exp * 1000 < Date.now();
}
