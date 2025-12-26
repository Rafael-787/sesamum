import React from "react";
import { ChevronRight, Ban } from "lucide-react";

interface ListCardProps {
  onClick?: (event?: any) => void;
  children: (event: any) => React.ReactNode;
  filteredElements: any[]; // Accepts array of event objects
  notFoundIcon?: React.ReactNode;
  notFoundMessage?: string;
}

interface ListCardComponent extends React.FC<ListCardProps> {
  Icon: React.FC<{ children: React.ReactNode; active?: boolean }>;
  Body: React.FC<{ children: React.ReactNode }>;
}

const ListCard: ListCardComponent = ({
  onClick,
  children,
  filteredElements,
  notFoundIcon,
  notFoundMessage,
}) => {
  return (
    <div className="grid gap-4">
      {filteredElements.length === 0 ? (
        <div className="text-center py-12 bg-card-primary rounded-xl shadow-sm">
          {notFoundIcon || (
            <Ban size={48} className="mx-auto text-input-icon mb-4" />
          )}
          <h3 className="text-lg font-medium text-input-text">
            {notFoundMessage || "Nenhum elemento encontrado"}
          </h3>
          <p className="text-subtitle">Tente ajustar os filtros de busca.</p>
        </div>
      ) : (
        filteredElements.map((event, idx) => (
          <button
            key={idx}
            className={
              "p-4 sm:p-6 bg-card-primary rounded-3xl shadow-sm border-2 border-card-primary transition-colors flex items-center gap-4 hover:cursor-pointer hover:bg-input-bg hover:border-input-border"
            }
            onClick={() => onClick?.(event)}
          >
            {children(event)}
            <div className="p-2 rounded-lg transition-colors text-input-icon">
              <ChevronRight size={20} />
            </div>
          </button>
        ))
      )}
    </div>
  );
};

ListCard.Icon = ({
  children,
  active = true,
}: {
  children: React.ReactNode;
  active?: boolean;
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg shrink-0 text-white  overflow-hidden ${
        active ? "bg-primary" : "bg-secondary"
      }`}
    >
      {children}
    </div>
  );
};

ListCard.Body = ({
  children,
}: {
  children: React.ReactNode;
  active?: boolean;
}) => {
  return <div className={`flex flex-col grow `}>{children}</div>;
};

export default ListCard;
