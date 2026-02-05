import React from "react";
import { ChevronRight, Ban, EllipsisVertical } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { SkeletonListCard } from "./SkeletonLoader";

// Interface para definir as ações de cada item
export interface ListAction {
  label: string;
  onClick: (item: any) => void;
  icon?: React.ReactNode;
  variant?: "default" | "destructive";
}

interface ListCardProps {
  onClick?: (event?: any) => void;
  children: (event: any) => React.ReactNode;
  filteredElements: any[];
  notFoundIcon?: React.ReactNode;
  notFoundMessage?: string;
  isLoading?: boolean;
  skeletonCount?: number;
  // Prop opcional: função que retorna lista de ações para um item
  getActions?: (item: any) => ListAction[];
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
  isLoading = false,
  skeletonCount = 3,
  getActions,
}) => {
  if (isLoading) {
    return <SkeletonListCard count={skeletonCount} />;
  }

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
        filteredElements.map((item, idx) => {
          // Verifica se existem ações para este item específico
          const actions = getActions ? getActions(item) : [];
          const hasActions = actions.length > 0;
          const isClickable = !!onClick;

          return (
            <div
              key={idx}
              // Alterado para div para evitar button dentro de button
              role={isClickable ? "button" : "listitem"}
              tabIndex={isClickable ? 0 : undefined}
              className={`
                p-4 sm:p-6 bg-card-primary rounded-3xl shadow-sm border-2 border-card-primary
                transition-colors flex items-center gap-4 relative
                ${isClickable ? "hover:cursor-pointer hover:bg-input-bg hover:border-input-border" : ""}
              `}
              onClick={() => isClickable && onClick(item)}
              onKeyDown={(e) => {
                if (isClickable && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onClick(item);
                }
              }}
            >
              {children(item)}

              {/* Área de Ação/Navegação */}
              <div className="ml-auto shrink-0 pl-2">
                {hasActions ? (
                  // Caso 1: Tem ações -> Mostra Ellipsis e Menu
                  <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button
                          className="flex items-center justify-center w-10 h-10 rounded-lg text-input-icon hover:text-title hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                          aria-label="Mais opções"
                        >
                          <EllipsisVertical size={20} />
                        </button>
                      </DropdownMenu.Trigger>

                      <DropdownMenu.Portal>
                        <DropdownMenu.Content
                          className="min-w-[160px] bg-card-primary border border-card-border rounded-xl shadow-lg p-1 z-50 animate-in fade-in zoom-in-95 duration-200"
                          sideOffset={5}
                          align="end"
                        >
                          {actions.map((action, actionIdx) => (
                            <DropdownMenu.Item
                              key={actionIdx}
                              className={`
                                flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg cursor-pointer outline-none transition-colors select-none
                                ${
                                  action.variant === "destructive"
                                    ? "text-red-600 hover:bg-red-50 focus:bg-red-50"
                                    : "text-title hover:bg-input-bg focus:bg-input-bg"
                                }
                              `}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(item);
                              }}
                            >
                              {action.icon}
                              {action.label}
                            </DropdownMenu.Item>
                          ))}
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </div>
                ) : (
                  // Caso 2: Não tem ações -> Mostra ChevronRight (Comportamento original)
                  <div className="p-2 rounded-lg transition-colors text-input-icon">
                    <ChevronRight size={20} />
                  </div>
                )}
              </div>
            </div>
          );
        })
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
      className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg shrink-0 text-white overflow-hidden ${
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
  return <div className={`flex flex-col grow`}>{children}</div>;
};

export default ListCard;
