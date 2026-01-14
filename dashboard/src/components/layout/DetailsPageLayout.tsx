import React from "react";
import * as Tabs from "@radix-ui/react-tabs";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onEdit?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  onEdit,
}) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
    <div>
      <h1 className="font-bold text-3xl text-text-title">{title}</h1>
      {subtitle && <p className="mt-1 text-subtitle ">{subtitle}</p>}
    </div>
    {onEdit && (
      <button
        onClick={onEdit}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
      >
        Editar
      </button>
    )}
  </div>
);

interface PageContainerProps {
  children: React.ReactNode;
}

export const DetailsPageContainer: React.FC<PageContainerProps> = ({
  children,
}) => (
  <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
    {children}
  </div>
);

interface InformationsDetailProps {
  children: React.ReactNode;
}

export const InformationsDetail: React.FC<InformationsDetailProps> = ({
  children,
}) => <div className="mb-6">{children}</div>;

interface TabItem {
  title: string;
  content: React.ReactNode;
}

interface TabsContainerProps {
  tabs: TabItem[];
  defaultTab?: string;
}

export const TabsContainer: React.FC<TabsContainerProps> = ({
  tabs,
  defaultTab,
}) => {
  const defaultValue = defaultTab || tabs[0]?.title || "";

  return (
    <Tabs.Root defaultValue={defaultValue} className="w-full">
      <Tabs.List className="flex border-b border-border mb-6">
        {tabs.map((tab) => (
          <Tabs.Trigger
            key={tab.title}
            value={tab.title}
            className="px-6 py-3 text-sm font-medium text-text-subtitle border-b-2 border-transparent hover:text-text-title hover:border-border transition-colors data-[state=active]:text-primary data-[state=active]:border-primary"
          >
            {tab.title}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {tabs.map((tab) => (
        <Tabs.Content key={tab.title} value={tab.title}>
          {tab.content}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
};
