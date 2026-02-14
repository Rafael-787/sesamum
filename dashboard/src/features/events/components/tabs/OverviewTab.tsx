import React from "react";
import { MetricCard } from "@/features/dashboard/components/MetricCard";
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
  const totalsChecks = overview?.companies?.reduce(
    (acc: any, company: any) => {
      acc.checkin += company.checkin_count;
      acc.checkout += company.checkout_count;
      acc.registration += company.registration_count;
      return acc;
    },
    { checkin: 0, checkout: 0, registration: 0 },
  );
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
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-text-subtitle">
                Credenciamento Realizado
              </label>
              <span className="text-sm font-semibold text-text-title">
                {totalsChecks.registration} / {totalStaff} (
                {totalStaff / totalsChecks.registration}%)
              </span>
            </div>
            <Progress.Root
              className="relative overflow-hidden bg-slate-200 rounded-full w-full h-3"
              value={totalStaff / totalsChecks.registration}
            >
              <Progress.Indicator
                className="bg-toast-warning-border h-full transition-transform duration-300 ease-in-out"
                style={{
                  transform: `translateX(-${100 - totalStaff / totalsChecks.registration}%)`,
                }}
              />
            </Progress.Root>
          </div>
          {/* Check-in Progress */}

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-text-subtitle">
                Check-in Realizado
              </label>
              <span className="text-sm font-semibold text-text-title">
                {totalsChecks.checkin} / {totalsChecks.registration} (
                {totalsChecks.registration / totalsChecks.checkin}%)
              </span>
            </div>
            <Progress.Root
              className="relative overflow-hidden bg-slate-200 rounded-full w-full h-3"
              value={totalsChecks.registration / totalsChecks.checkin}
            >
              <Progress.Indicator
                className="bg-toast-success-border h-full transition-transform duration-300 ease-in-out"
                style={{
                  transform: `translateX(-${100 - totalsChecks.registration / totalsChecks.checkin}%)`,
                }}
              />
            </Progress.Root>
          </div>

          {/* Check-out Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-text-subtitle">
                Check-out Realizado
              </label>
              <span className="text-sm font-semibold text-text-title">
                {totalsChecks.checkout} / {totalsChecks.checkin} (
                {totalsChecks.checkin / totalsChecks.checkout}%)
              </span>
            </div>
            <Progress.Root
              className="relative overflow-hidden bg-slate-200 rounded-full w-full h-3"
              value={totalsChecks.checkin / totalsChecks.checkout}
            >
              <Progress.Indicator
                className="bg-toast-error-border h-full transition-transform duration-300 ease-in-out"
                style={{
                  transform: `translateX(-${100 - totalsChecks.checkin / totalsChecks.checkout}%)`,
                }}
              />
            </Progress.Root>
          </div>
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
