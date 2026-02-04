import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/shared";
import { useAuth } from "@/shared/context/AuthContext";
import { googleLogin } from "../api/auth.service";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import axios from "axios";
import logo from "@/assets/logo_dark.svg";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setTokens, isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse,
  ) => {
    try {
      setError(null);

      // O 'credential' aqui é o ID TOKEN (JWT) que o backend espera
      const token = credentialResponse.credential;

      if (!token) {
        throw new Error("Token do Google não recebido");
      }

      // Chama seu serviço real (que já está configurado com axios no auth.service.ts)
      const authResponse = await googleLogin(token);

      // Armazena os tokens recebidos do backend
      setTokens(authResponse.access);

      // Redireciona
      navigate("/");
    } catch (err) {
      if (err.response.status === 403) {
        setError("Usuário não cadastrado ou autorizado");
      }

      console.error("Login error:", err);
      setError("Falha ao autenticar com o servidor. Tente novamente.");
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

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Login Content */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-title mb-2">
                Bem-vindo
              </h2>
              <p className="text-sm text-subtitle">
                Faça login com sua conta Google
              </p>
            </div>

            {/* Google Sign-In Button */}
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setError("O login com Google falhou.");
              }}
              useOneTap // Opcional: tenta login automático se já estiver logado
              theme="outline"
              size="large"
              //width="100%"
              text="signin_with"
              shape="rectangular"
            />
          </div>

          {/* Info Text */}
          <p className="text-xs text-center text-subtitle">
            Ao fazer login, você concorda com os termos de uso e política de
            privacidade.
          </p>
        </div>
      </Card>
    </div>
  );
}
