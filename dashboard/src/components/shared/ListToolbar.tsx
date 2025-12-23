import React from "react";
import { Search, Filter, Plus } from "lucide-react";

interface ListToolbarProps {
  searchPlaceholder?: string;
  filterOptions?: { value: string; label: string }[];
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onAdd?: () => void;
  addLabel?: string;
  children?: React.ReactNode; // For extra actions
}

const ListToolbar: React.FC<ListToolbarProps> = ({
  searchPlaceholder = "Buscar...",
  filterOptions = [],
  filterValue,
  onFilterChange,
  searchValue,
  onSearchChange,
  onAdd,
  addLabel = "Adicionar",
  children,
}) => (
  <div
    className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center"
    style={{
      background: "var(--toolbar-bg, #fff)",
      padding: "var(--toolbar-padding, 1rem)",
      borderRadius: "var(--toolbar-radius, 0.75rem)",
      border: "1px solid var(--toolbar-border, #e2e8f0)",
      boxShadow: "var(--toolbar-shadow, 0 1px 2px 0 rgba(16,30,54,0.04))",
    }}
  >
    <div className="relative flex-1">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2"
        size={20}
        style={{ color: "var(--input-icon, #94a3b8)" }}
      />
      <input
        type="text"
        placeholder={searchPlaceholder}
        className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none text-sm"
        style={{
          background: "var(--input-bg, #f8fafc)",
          border: "1px solid var(--input-border, #e2e8f0)",
          color: "var(--input-text, #0f172a)",
          borderRadius: "var(--input-radius, 0.5rem)",
          boxShadow: "var(--input-shadow, none)",
        }}
        value={searchValue}
        onChange={(e) => onSearchChange?.(e.target.value)}
      />
    </div>
    {filterOptions.length > 0 && (
      <div className="flex gap-4">
        <div className="relative min-w-45">
          <Filter
            className="absolute left-3 top-1/2 -translate-y-1/2"
            size={18}
            style={{ color: "var(--input-icon, #94a3b8)" }}
          />
          <select
            className="w-full pl-10 pr-8 py-2 appearance-none cursor-pointer rounded-lg focus:outline-none text-sm"
            style={{
              background: "var(--input-bg, #f8fafc)",
              border: "1px solid var(--input-border, #e2e8f0)",
              color: "var(--input-text, #0f172a)",
              borderRadius: "var(--input-radius, 0.5rem)",
              boxShadow: "var(--input-shadow, none)",
            }}
            value={filterValue}
            onChange={(e) => onFilterChange?.(e.target.value)}
          >
            {filterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    )}
    {onAdd && (
      <button
        className="flex items-center gap-2 font-medium text-sm transition-colors"
        style={{
          padding: "var(--button-padding, 0.5rem 1rem)",
          background: "var(--button-bg, var(--color-primary, #2563eb))",
          color: "var(--button-text, #fff)",
          borderRadius: "var(--button-radius, 0.5rem)",
          boxShadow: "var(--button-shadow, 0 1px 2px 0 rgba(37,99,235,0.10))",
          cursor: "pointer",
        }}
        onMouseOver={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "var(--button-bg-hover, #1d4ed8)";
        }}
        onMouseOut={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "var(--button-bg, var(--color-primary, #2563eb))";
        }}
        onClick={onAdd}
      >
        <Plus size={18} />
        <span>{addLabel}</span>
      </button>
    )}
    {children}
  </div>
);

export default ListToolbar;
