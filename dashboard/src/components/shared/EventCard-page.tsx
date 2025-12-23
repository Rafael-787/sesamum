import React from "react";
import { ChevronRight } from "lucide-react";

interface EventCardProps {
  isClosed?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
  action?: React.ReactNode;
}

/**
 * Reusable EventCard component for event list items.
 * - Accepts children for date badge and main content.
 * - Accepts action prop for action button(s).
 * - Applies CSS variables for all visual tokens.
 */
const EventCard: React.FC<EventCardProps> = ({
  isClosed = false,
  onClick,
  children,
  style = {},
}) => {
  return (
    <button
      className={
        `p-4 sm:p-6 transition-all flex items-center gap-4 shadow-sm hover:cursor-pointer` +
        (isClosed ? " grayscale opacity-80" : " hover:border-blue-400")
      }
      style={{
        background: isClosed
          ? "var(--container-bg, #f1f5f9)"
          : "var(--toolbar-bg, #fff)",
        border: "1px solid var(--toolbar-border, #e2e8f0)",
        borderRadius: "var(--container-radius, 1.5rem)",
        boxShadow: "var(--toolbar-shadow, 0 1px 2px 0 rgba(16,30,54,0.04))",
        ...style,
      }}
      onClick={onClick}
    >
      {/* Children: date badge + content */}
      {children}
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
  );
};

export default EventCard;
