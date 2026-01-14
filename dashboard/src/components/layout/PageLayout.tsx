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
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
    <div>
      <h1 className="font-bold text-3xl text-text-title">{title}</h1>
      {subtitle && <p className="mt-1 text-subtitle ">{subtitle}</p>}
    </div>
    {action && <div className="flex gap-3">{action}</div>}
  </div>
);

interface PageContainerProps {
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children }) => (
  <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
    {children}
  </div>
);
