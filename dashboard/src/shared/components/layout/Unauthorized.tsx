import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

/**
 * Unauthorized page shown when user tries to access a route
 * they don't have permission for based on their role
 */
const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full bg-card-primary rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-12 h-12 text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">Acesso Negado</h1>

        <p className="text-gray-600 mb-8">
          Você não tem permissão para acessar esta página. Entre em contato com
          o administrador se acredita que isso é um erro.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Voltar
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors"
          >
            Ir para o Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
