import React, { useMemo } from "react";
import { MetricCard } from "@/features/dashboard/components/MetricCard";
import { MetricProgress } from "@/shared";
import Card from "@/shared/components/ui/Card";
import * as Progress from "@radix-ui/react-progress";
import { Building2, Users } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";

import type { Overview } from "../../types";

interface OverviewTabProps {
  overview: Overview | null;
  canViewCompanies?: boolean;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  overview,
  canViewCompanies = false,
}) => {
  const { user } = useAuth();

  // Filtra as empresas: mostra todas se tiver permissão, senão mostra apenas a do usuário
  const relevantCompanies = useMemo(() => {
    if (!overview?.companies) return [];
    if (canViewCompanies) return overview.companies;
    return overview.companies.filter((c: any) => c.name === user?.company_id);
  }, [overview, canViewCompanies, user]);

  // Totalizadores baseados apenas nas empresas relevantes para a visualização atual
  const totalsChecks = useMemo(() => {
    return relevantCompanies.reduce(
      (acc: any, company: any) => ({
        checkin: acc.checkin + (company.checkin_count || 0),
        checkout: acc.checkout + (company.checkout_count || 0),
        registration: acc.registration + (company.registration_count || 0),
        staff_limit: acc.staff_limit + (company.staff_limit || 0),
      }),
      { checkin: 0, checkout: 0, registration: 0, staff_limit: 0 },
    );
  }, [relevantCompanies]);

  // Define os totais dos cards e barra de progresso baseados no escopo de visualização
  const totalStaffTarget = canViewCompanies
    ? (totalsChecks.staff_limit ?? 0)
    : totalsChecks.staff_limit;

  const totalCompaniesCount = canViewCompanies
    ? (overview?.metrics?.total_companies ?? 0)
    : relevantCompanies.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {canViewCompanies && (
          <MetricCard
            title="Empresas Atribuídas"
            value={totalCompaniesCount}
            icon={<Building2 />}
            color="company"
          />
        )}
        <MetricCard
          title="Staffs Atribuídos"
          value={totalStaffTarget}
          icon={<Users />}
          color="user"
        />
      </div>

      <Card>
        <h2 className="text-xl font-semibold text-text-title mb-6">
          Status de Credenciamento
        </h2>
        <div className="space-y-6">
          {/* Credenciamento Progress */}
          <MetricProgress
            label="Credenciamento Realizado"
            current={totalsChecks.registration}
            total={totalStaffTarget}
            colorClass="bg-toast-warning-border"
          />

          {/* Check-in: Baseado em quem já fez Credenciamento */}
          <MetricProgress
            label="Check-in Realizado"
            current={totalsChecks.checkin}
            total={totalsChecks.registration}
            colorClass="bg-toast-success-border"
          />

          {/* Check-out: Baseado em quem já fez Check-in */}
          <MetricProgress
            label="Check-out Realizado"
            current={totalsChecks.checkout}
            total={totalsChecks.checkin}
            colorClass="bg-toast-error-border"
          />
        </div>
      </Card>

      {/* Condicional para mostrar Staffs por Empresa apenas para quem tem permissão */}
      {canViewCompanies && (
        <Card>
          <h2 className="text-xl font-semibold text-text-title mb-6">
            Staffs por Empresa
            <p className="text-xs font-medium text-subtitle">
              (Credenciado / contratado)
            </p>
          </h2>
          <div className="space-y-4">
            {overview?.companies?.map((company, index) => {
              const percentage =
                (company.registration_count / company.staff_limit) * 100 || 0;
              return (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="text-sm font-medium text-text-title">
                        {company.name}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-text-title">
                      {company.registration_count} / {company.staff_limit}{" "}
                      staffs
                    </span>
                  </div>
                  <Progress.Root
                    className="relative overflow-hidden bg-slate-200 rounded-full w-full h-2"
                    value={percentage}
                  >
                    <Progress.Indicator
                      className="bg-primary h-full transition-transform duration-300 ease-in-out"
                      style={{ transform: `translateX(-${100 - percentage}%)` }}
                    />
                  </Progress.Root>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default OverviewTab;
