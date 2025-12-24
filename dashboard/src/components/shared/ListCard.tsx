import React from "react";
import { ChevronRight, Ban } from "lucide-react";

interface ListCardProps {
  isClosed?: boolean;
  onClick?: (event?: any) => void;
  children: (event: any) => React.ReactNode;
  style?: React.CSSProperties;
  action?: React.ReactNode;
  filteredElements: any[]; // Accepts array of event objects
  notFoundIcon?: React.ReactNode;
  notFoundMessage?: string;
}

/**
 * Reusable EventCard component for event list items.
 * - Accepts children as a render function: (event) => JSX
 * - Accepts action prop for action button(s).
 * - Applies CSS variables for all visual tokens.
 */
const ListCard: React.FC<ListCardProps> = ({
  isClosed = false,
  onClick,
  children,
  style = {},
  filteredElements,
  notFoundIcon,
  notFoundMessage,
}) => {
  return (
    <div className="grid gap-4">
      {filteredElements.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-100">
          {notFoundIcon || (
            <Ban size={48} className="mx-auto text-slate-300 mb-4" />
          )}
          <h3 className="text-lg font-medium text-slate-900">
            {notFoundMessage || "Nenhum elemento encontrado"}
          </h3>
          <p className="text-slate-500">Tente ajustar os filtros de busca.</p>
        </div>
      ) : (
        filteredElements.map((event, idx) => (
          <div
            key={event.id ?? idx}
            style={{
              background: "var(--toolbar-bg, #fff)",
              borderRadius: "var(--container-radius, 1.5rem)",
              boxShadow:
                "var(--toolbar-shadow, 0 1px 2px 0 rgba(16,30,54,0.04))",
              ...style,
            }}
          >
            <button
              className={
                "p-4 sm:p-6 w-full border-2 border-white transition-colors flex items-center gap-4 hover:cursor-pointer hover:bg-slate-100 hover:border-gray-200"
              }
              style={{ borderRadius: "var(--container-radius, 1.5rem)" }}
              onClick={() => onClick?.(event)}
            >
              {/* Children: pass event object */}
              {children(event)}
              {/* Action part (e.g., Chevron button) */}
              <div
                className="p-2 rounded-lg transition-colors"
                style={{
                  color: "var(--color-primary, #2563eb)80",
                  background: "transparent",
                }}
              >
                <ChevronRight size={20} />
              </div>
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default ListCard;
