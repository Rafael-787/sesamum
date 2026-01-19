import React from "react";

interface SkeletonLoaderProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = "100%",
  height = "1rem",
  borderRadius = "0.25rem",
  className = "",
}) => (
  <div
    className={`bg-linear-to-r from-gray-100 via-gray-200 to-gray-100 bg-size[200%_100%] animate-skeleton-loader ${className}`}
    style={
      {
        width,
        height,
        borderRadius,
      } as React.CSSProperties
    }
  />
);

interface SkeletonCardProps {
  lines?: number;
  showIcon?: boolean;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  lines = 3,
  showIcon = false,
  className = "",
}) => (
  <div
    className={`p-4 sm:p-6 bg-white rounded-xl border border-slate-100 ${className}`}
  >
    <div className="flex items-center gap-4">
      {showIcon && (
        <SkeletonLoader width="3rem" height="3rem" borderRadius="0.5rem" />
      )}
      <div className="flex-1 space-y-3">
        {Array.from({ length: lines }, (_, i) => (
          <SkeletonLoader
            key={i}
            width={i === 0 ? "80%" : i === lines - 1 ? "60%" : "100%"}
            height={i === 0 ? "1.25rem" : "1rem"}
          />
        ))}
      </div>
    </div>
  </div>
);

interface SkeletonMetricProps {
  className?: string;
}

export const SkeletonMetric: React.FC<SkeletonMetricProps> = ({
  className = "",
}) => (
  <div
    className={`p-6 bg-white rounded-xl border border-slate-100 ${className}`}
  >
    <div className="flex items-center justify-between">
      <div className="space-y-3">
        <SkeletonLoader width="4rem" height="1rem" />
        <SkeletonLoader width="3rem" height="2rem" />
        <SkeletonLoader width="5rem" height="0.75rem" />
      </div>
      <SkeletonLoader width="2.5rem" height="2.5rem" borderRadius="0.5rem" />
    </div>
  </div>
);

interface SkeletonCalendarProps {
  className?: string;
}

export const SkeletonCalendar: React.FC<SkeletonCalendarProps> = ({
  className = "",
}) => (
  <div
    className={`p-6 bg-white rounded-xl border border-slate-100 ${className}`}
  >
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SkeletonLoader width="8rem" height="1.5rem" />
        <div className="flex gap-2">
          <SkeletonLoader width="2rem" height="2rem" borderRadius="0.25rem" />
          <SkeletonLoader width="2rem" height="2rem" borderRadius="0.25rem" />
        </div>
      </div>

      {/* Calendar grid skeleton */}
      <div className="grid grid-cols-7 gap-1">
        {/* Week headers */}
        {Array.from({ length: 7 }, (_, i) => (
          <SkeletonLoader
            key={`header-${i}`}
            height="2rem"
            borderRadius="0.25rem"
          />
        ))}

        {/* Calendar days */}
        {Array.from({ length: 35 }, (_, i) => (
          <SkeletonLoader
            key={`day-${i}`}
            height="3rem"
            borderRadius="0.25rem"
          />
        ))}
      </div>
    </div>
  </div>
);

interface SkeletonListCardProps {
  count?: number;
  showIcon?: boolean;
  className?: string;
}

export const SkeletonListCard: React.FC<SkeletonListCardProps> = ({
  count = 3,
  showIcon = true,
  className = "",
}) => (
  <div className="grid gap-4">
    {Array.from({ length: count }, (_, i) => (
      <div
        key={i}
        className={`p-4 sm:p-6 bg-card-primary rounded-3xl shadow-sm border-2 border-card-primary ${className}`}
      >
        <div className="flex items-center gap-4">
          {showIcon && (
            <SkeletonLoader
              width="3.5rem"
              height="3.5rem"
              borderRadius="0.5rem"
            />
          )}
          <div className="flex-1 space-y-3">
            <SkeletonLoader width="60%" height="1.25rem" />
            <SkeletonLoader width="80%" height="1rem" />
          </div>
          <SkeletonLoader
            width="2.5rem"
            height="2.5rem"
            borderRadius="0.5rem"
          />
        </div>
      </div>
    ))}
  </div>
);
