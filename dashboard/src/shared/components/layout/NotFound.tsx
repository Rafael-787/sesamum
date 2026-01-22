import React from "react";
import { useNavigate } from "react-router-dom";
import { Compass } from "lucide-react";

/**
 * NotFound (404) page shown when user navigates to a route
 * that doesn't exist in the application
 */
const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full bg-card-primary rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <Compass className="w-12 h-12 text-gray-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Página não encontrada
        </h1>

        <p className="text-gray-600 mb-8">
          Não encontramos a página que você está procurando
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 hover:cursor-pointer transition-colors"
          >
            Voltar
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover hover:cursor-pointer transition-colors"
          >
            Ir para o Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
