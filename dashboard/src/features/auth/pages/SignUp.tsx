import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, Badge } from "@/shared";
import { useAuth } from "@/shared/context/AuthContext";
import { googleRegister } from "../api/auth.service";
import { userInvitesService } from "@/features/users/api/userInvites.service";
//import { companiesService } from "@/features/companies/api/companies.service";
import type { UserInvite } from "@/shared/types";
//import type { Company } from "@/features/companies";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google"; // Importação do Google
import logo from "@/assets/logo_dark.svg";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setTokens } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invite, setInvite] = useState<UserInvite | null>(null);
  const [company, setCompany] = useState<String | null>(null);

  const inviteToken = searchParams.get("invite");

  // Validate invite on mount
  useEffect(() => {
    const validateInvite = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!inviteToken) {
          setError("Token de convite não encontrado na URL.");
          setIsLoading(false);
          return;
        }

        const inviteResponse = await userInvitesService.getById(inviteToken);
        const inviteData = inviteResponse.data;

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

<<<<<<< HEAD
=======
        const companyResponse = await companiesService.getById(
          inviteData.company_id,
        );

>>>>>>> parent of b512fdf ([UI] Correção página sign-up)
        setInvite(inviteData);
        setCompany(inviteData.company);
      } catch (err) {
        console.error("Invite validation error:", err);
        setError("Convite inválido ou não encontrado.");
      } finally {
        setIsLoading(false);
      }
    };

    validateInvite();
  }, [inviteToken]);

  // Função chamada após o sucesso do Google
  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse,
  ) => {
    if (!inviteToken) return;

    try {
      setIsRegistering(true);
      setError(null);

      const token = credentialResponse.credential;

      if (!token) {
        throw new Error("Token do Google não recebido");
      }

      // Call backend with Google token AND invite token
      const authResponse = await googleRegister(token, inviteToken);

      // Store tokens via AuthContext
      setTokens(authResponse.access);

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
          <div className=" flex justify-center">
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
                className="w-full px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 hover:cursor-pointer transition-colors"
              >
                Voltar para Login
              </button>
            </div>
          )}

          {/* Invite Details - Only show if valid and pending */}
          {!isLoading && !error && invite && company && (
            <div className="space-y-6">
              {/* Status Banner */}
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
                <h2 className="text-2xl font-bold text-title">{company}</h2>
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

              {/* Google Sign-Up Component */}
              <div className="flex justify-center w-full">
                {!(invite.status === "used" || invite.status === "expired") && (
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                      setError("Falha ao iniciar o cadastro com Google.");
                    }}
                    useOneTap
                    theme="outline"
                    size="large"
                    text="signup_with" // Texto alterado para "Sign up with Google"
                    shape="rectangular"
                  />
                )}
              </div>

              {isRegistering && (
                <p className="text-center text-sm text-subtitle mt-2">
                  Processando cadastro...
                </p>
              )}

              {/* Already have account link */}
              <div className="text-center">
                <button
                  onClick={() => navigate("/login")}
                  className="text-xs text-primary hover:text-primary-hover hover:cursor-pointer transition-colors"
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
