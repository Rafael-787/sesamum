import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  action,
}) => (
  <div
    className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
    style={{
      padding: "var(--header-padding, 0)",
      borderRadius: "var(--header-radius, 0)",
      background: "var(--header-bg, transparent)",
    }}
  >
    <div>
      <h1
        className="font-bold"
        style={{
          fontSize: "var(--header-title-size, 2rem)",
          color: "var(--header-title-color, #0f172a)",
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          className="mt-1"
          style={{ color: "var(--header-subtitle-color, #64748b)" }}
        >
          {subtitle}
        </p>
      )}
    </div>
    {action && <div className="flex gap-3">{action}</div>}
  </div>
);

interface PageContainerProps {
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children }) => (
  <div
    className="max-w-7xl mx-auto w-full"
    style={{
      padding: "var(--container-padding, 2rem 1rem)",
      borderRadius: "var(--container-radius, 1.5rem)",
      background: "var(--container-bg, transparent)",
    }}
  >
    {children}
  </div>
);
