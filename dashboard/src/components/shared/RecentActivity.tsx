import React from "react";
import {
  Calendar,
  Clock,
  User,
  ShieldUser,
  Building2,
  Briefcase,
} from "lucide-react";
import { type RecentActivity } from "../../types";
import { SkeletonCard } from "./SkeletonLoader";
import { formatDateShort } from "../../lib/dateUtils";

interface RecentActivityProps {
  activities: RecentActivity[];
  loading?: boolean;
  title?: string;
  maxItems?: number;
}

const getActivityIcon = (type: RecentActivity["type"]) => {
  switch (type) {
    case "event":
      return <Calendar size={24} className="text-event-bg" />;
    case "project":
      return <Briefcase size={24} className="text-project-bg" />;
    case "user":
      return <ShieldUser size={24} className="text-user-bg" />;
    case "staff":
      return <User size={24} className="text-staff-bg" />;
    case "company":
      return <Building2 size={24} className="text-company-bg" />;
    default:
      return <Clock size={24} className="text-default-bg" />;
  }
};

export const RecentActivityList: React.FC<RecentActivityProps> = ({
  activities,
  loading = false,
  title,
  maxItems = 5,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 p-6">
        <div className="space-y-4">
          <SkeletonCard lines={1} className="p-0! border-0! bg-transparent!" />
          {Array.from({ length: 3 }, (_, i) => (
            <SkeletonCard
              key={i}
              lines={2}
              showIcon
              className="p-0! border-0! bg-transparent!"
            />
          ))}
        </div>
      </div>
    );
  }

  const displayedActivities = activities.slice(0, maxItems);

  return (
    <div
      className="bg-white h-full rounded-xl border border-slate-100 p-6"
      style={{
        boxShadow: "var(--toolbar-shadow, 0 1px 2px 0 rgba(16, 30, 54, 0.04))",
      }}
    >
      <h3
        className="text-lg font-semibold mb-4"
        style={{ color: "var(--header-title-color, #0f172a)" }}
      >
        {title}
      </h3>

      {displayedActivities.length === 0 ? (
        <div className="text-center py-8">
          <Clock size={32} className="mx-auto text-slate-300 mb-2" />
          <p style={{ color: "var(--header-subtitle-color, #64748b)" }}>
            Nenhuma atividade recente
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedActivities.map((activity) => (
            <button
              key={activity.id}
              className="flex w-full items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors hover:cursor-pointer"
            >
              <div className="shrink-0 mt-1.5">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm text-left font-medium truncate"
                  style={{ color: "var(--header-title-color, #0f172a)" }}
                >
                  {activity.title}
                </p>
                <p
                  className="text-xs text-left truncate"
                  style={{ color: "var(--header-subtitle-color, #64748b)" }}
                >
                  {activity.description ?? "Sem descrição disponível"}
                </p>
              </div>
              <div className="shrink-0">
                <span
                  className="text-xs text-rose-900"
                  style={{ color: "var(--header-subtitle-color, #64748b)" }}
                >
                  {formatDateShort(activity.timestamp)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
