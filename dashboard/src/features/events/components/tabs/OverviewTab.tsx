import React from "react";
import { MetricCard } from "@/features/dashboard/components/MetricCard";
import Card from "@/shared/components/ui/Card";
import * as Progress from "@radix-ui/react-progress";
import { Building2, Users } from "lucide-react";

interface OverviewTabProps {
  totalStaff: number;
  companiesStaff: Array<{
    name: string;
    role: string;
    staffCount: number;
  }>;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  totalStaff,
  companiesStaff,
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MetricCard
        title="Empresas no Evento"
        value={5}
        icon={<Building2 />}
        color="company"
      />
      <MetricCard
        title="Staffs no Evento"
        value={42}
        icon={<Users />}
        color="user"
      />
    </div>

    <Card>
      <h2 className="text-xl font-semibold text-text-title mb-6">
        Status de Check-in/Check-out
      </h2>
      <div className="space-y-6">
        {/* Credenciamento Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-text-subtitle">
              Credenciamento Realizado
            </label>
            <span className="text-sm font-semibold text-text-title">
              30 / 35 (90%)
            </span>
          </div>
          <Progress.Root
            className="relative overflow-hidden bg-slate-200 rounded-full w-full h-3"
            value={90}
          >
            <Progress.Indicator
              className="bg-toast-warning-border h-full transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${100 - 90}%)` }}
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
              35 / 42 (83%)
            </span>
          </div>
          <Progress.Root
            className="relative overflow-hidden bg-slate-200 rounded-full w-full h-3"
            value={83}
          >
            <Progress.Indicator
              className="bg-toast-success-border h-full transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${100 - 83}%)` }}
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
              28 / 35 (80%)
            </span>
          </div>
          <Progress.Root
            className="relative overflow-hidden bg-slate-200 rounded-full w-full h-3"
            value={80}
          >
            <Progress.Indicator
              className="bg-toast-error-border h-full transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${100 - 80}%)` }}
            />
          </Progress.Root>
        </div>
      </div>
    </Card>

    <Card>
      <h2 className="text-xl font-semibold text-text-title mb-6">
        Staffs por Empresa
      </h2>
      <div className="space-y-4">
        {companiesStaff.map((company, index) => {
          const percentage = (company.staffCount / totalStaff) * 100;
          return (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-sm font-medium text-text-title">
                    {company.name}
                  </p>
                </div>
                <span className="text-sm font-semibold text-text-title">
                  {company.staffCount} staffs
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

export default OverviewTab;
