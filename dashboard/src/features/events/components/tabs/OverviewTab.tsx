import React, { useMemo } from "react";
import { MetricCard } from "@/features/dashboard/components/MetricCard";
import { MetricProgress } from "@/shared";
import Card from "@/shared/components/ui/Card";
import * as Progress from "@radix-ui/react-progress";
import { Building2, Users } from "lucide-react";

import type { Overview } from "../../types";

interface OverviewTabProps {
  overview: Overview | null;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ overview }) => {
  const totalStaff = overview?.metrics?.total_staff ?? 0;
  const totalCompanies = overview?.metrics?.total_companies ?? 0;
  const companies = overview?.companies ?? [];

  /* Contador totais checks */
  const totalsChecks = useMemo(() => {
    return (
      overview?.companies?.reduce(
        (acc: any, company: any) => ({
          checkin: acc.checkin + (company.checkin_count || 0),
          checkout: acc.checkout + (company.checkout_count || 0),
          registration: acc.registration + (company.registration_count || 0),
        }),
        { checkin: 0, checkout: 0, registration: 0 },
      ) || { checkin: 0, checkout: 0, registration: 0 }
    );
  }, [overview]); // Só recalcula se 'overview' mudar

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard
          title="Empresas Atribuídas"
          value={totalCompanies}
          icon={<Building2 />}
          color="company"
        />
        <MetricCard
          title="Staffs Atribuídos"
          value={totalStaff}
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
            total={totalStaff}
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

      <Card>
        <h2 className="text-xl font-semibold text-text-title mb-6">
          Staffs por Empresa
          <p className="text-xs font-medium text-subtitle">
            (Credenciado / contratado)
          </p>
        </h2>
        <div className="space-y-4">
          {companies.map((company, index) => {
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
                    {company.registration_count} / {company.staff_limit} staffs
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
    </div>
  );
};

export default OverviewTab;
