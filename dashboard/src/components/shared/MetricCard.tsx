import React from "react";
import { type MetricCardProps } from "../../types/index";
import { SkeletonMetric } from "./SkeletonLoader";

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  color = "primary",
  loading = false,
}) => {
  if (loading) {
    return <SkeletonMetric />;
  }

  const colorClasses = {
    primary: "text-blue-600 bg-blue-50",
    success: "text-green-600 bg-green-50",
    warning: "text-orange-600 bg-orange-50",
    error: "text-red-600 bg-red-50",
  };

  return (
    <div
      className="p-6 bg-white rounded-xl border border-slate-100 hover:border-slate-200 transition-all"
      style={{
        boxShadow: "var(--toolbar-shadow, 0 1px 2px 0 rgba(16, 30, 54, 0.04))",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p
            className="text-sm font-medium"
            style={{ color: "var(--header-subtitle-color, #64748b)" }}
          >
            {title}
          </p>
          <p
            className="text-3xl font-bold"
            style={{ color: "var(--header-title-color, #0f172a)" }}
          >
            {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );
};
