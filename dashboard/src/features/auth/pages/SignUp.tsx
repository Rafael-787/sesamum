import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, Badge } from "@/shared";
import { useAuth } from "@/shared/context/AuthContext";
import { googleRegister } from "../api/auth.service";
import { userInvitesService } from "@/features/users/api/userInvites.service";
import { companiesService } from "@/features/companies/api/companies.service";
import type { UserInvite } from "@/shared/types";
import type { Company } from "@/features/companies";
import logo from "@/assets/logo.png";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setTokens } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invite, setInvite] = useState<UserInvite | null>(null);
  const [company, setCompany] = useState<Company | null>(null);

  const inviteToken = searchParams.get("invite");

  // Validate invite on mount
  useEffect(() => {
    const validateInvite = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if invite token exists
        if (!inviteToken) {
          setError("Token de convite não encontrado na URL.");
          setIsLoading(false);
          return;
        }

        // Fetch invite details
        const inviteResponse = await userInvitesService.getById(inviteToken);
        const inviteData = inviteResponse.data;

        // Check invite status
        if (inviteData.status === "used") {
          setError("Este convite já foi utilizado.");
          setIsLoading(false);
          return;
        }

        if (inviteData.status === "expired") {
          setError("Este convite expirou.");
          setIsLoading(false);
          return;
        }

        // Fetch company details
        const companyResponse = await companiesService.getById(
          inviteData.company_id,
        );

        setInvite(inviteData);
        setCompany(companyResponse.data);
      } catch (err) {
        console.error("Invite validation error:", err);
        setError("Convite inválido ou não encontrado.");
      } finally {
        setIsLoading(false);
      }
    };

    validateInvite();
  }, [inviteToken]);

  const handleGoogleSignUp = async () => {
    if (!inviteToken) return;

    try {
      setIsRegistering(true);
      setError(null);

      // TODO: Integrate Google Sign-In library (@react-oauth/google)
      // const googleResponse = await googleSignIn();
      // const idToken = googleResponse.credential;

      // For now, simulate Google OAuth with mock token
      const mockGoogleToken = "google_token_newuser@alphaproduction.com";

      // Call backend with Google token and invite token
      const authResponse = await googleRegister(mockGoogleToken, inviteToken);

      // Store tokens via AuthContext
      setTokens(authResponse.tokens.access, authResponse.tokens.refresh);

      // Redirect to dashboard
      navigate("/");
    } catch (err: any) {
      console.error("Registration error:", err);

      // Handle specific error messages
      if (err.response?.status === 400) {
        const errorMsg =
          err.response?.data?.detail || err.response?.data?.error;
        if (errorMsg?.includes("email")) {
          setError("Este convite é restrito a outro endereço de email.");
        } else if (errorMsg?.includes("expired")) {
          setError("Este convite expirou.");
        } else if (errorMsg?.includes("used")) {
          setError("Este convite já foi utilizado.");
        } else if (errorMsg?.includes("already exists")) {
          setError("Usuário já cadastrado. Faça login.");
        } else {
          setError(errorMsg || "Falha ao cadastrar. Tente novamente.");
        }
      } else {
        setError("Falha ao cadastrar com o Google. Tente novamente.");
      }
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-maind-bg flex items-center justify-center p-4">
      <Card>
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <img src={logo} alt="Sesamum Logo" />
          </div>

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          )}

          {/* Error Banner - Shows for invalid/expired/used invites */}
          {!isLoading && error && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
              <button
                onClick={() => navigate("/login")}
                className="w-full px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Voltar para Login
              </button>
            </div>
          )}

          {/* Invite Details - Only show if valid and pending */}
          {!isLoading && !error && invite && company && (
            <div className="space-y-6">
              {/* Status Banner - Visual indicator for invite status */}
              {invite.status === "used" && (
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="used" />
                    <p className="text-sm text-gray-600">
                      Este convite já foi utilizado
                    </p>
                  </div>
                </div>
              )}

              {invite.status === "expired" && (
                <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="expired" />
                    <p className="text-sm text-orange-600">
                      Este convite expirou
                    </p>
                  </div>
                </div>
              )}

              {invite.status === "pending" && (
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="pending" />
                    <p className="text-sm text-green-600">Convite válido</p>
                  </div>
                </div>
              )}

              {/* Invitation Details */}
              <div className="text-center space-y-4">
                <p className="text-sm text-subtitle">Você foi convidado para</p>
                <h2 className="text-2xl font-bold text-title">
                  {company.name}
                </h2>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-subtitle">como</span>
                  <Badge
                    variant={invite.role === "company" ? "company" : "control"}
                  />
                </div>

                {/* Email Restriction Notice */}
                {invite.email && (
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-xs text-blue-600">
                      <strong>Este convite é restrito a:</strong> {invite.email}
                    </p>
                  </div>
                )}

                {/* Expiration Date */}
                <p className="text-xs text-subtitle">
                  Válido até:{" "}
                  {new Date(invite.expires_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {/* Google Sign-Up Button */}
              <button
                onClick={handleGoogleSignUp}
                disabled={
                  isRegistering ||
                  invite.status === "used" ||
                  invite.status === "expired"
                }
                className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRegistering ? (
                  <span>Cadastrando...</span>
                ) : (
                  <>
                    {/* Google Icon SVG */}
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span>Cadastrar com o Google</span>
                  </>
                )}
              </button>

              {/* Already have account link */}
              <div className="text-center">
                <button
                  onClick={() => navigate("/login")}
                  className="text-xs text-primary hover:text-primary-hover transition-colors"
                >
                  Já possui conta? Faça login
                </button>
              </div>

              {/* Info Text */}
              <p className="text-xs text-center text-subtitle">
                Ao cadastrar, você concorda com os termos de uso e política de
                privacidade.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
