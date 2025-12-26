import React from "react";
import { Select } from "radix-ui";
import { Search, Filter, Plus, ChevronDown } from "lucide-react";
//import { ChevronDownIcon } from "@radix-ui/react-icons";

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
  <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center bg-card-primary p-4 rounded-xl border border-card-border shadow-sm">
    <div className="relative flex-1">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-input-icon"
        size={20}
      />
      <input
        type="text"
        placeholder={searchPlaceholder}
        className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none text-sm bg-input-bg border border-input-border text-input-text"
        value={searchValue}
        onChange={(e) => onSearchChange?.(e.target.value)}
      />
    </div>
    {filterOptions.length > 0 && (
      <div className="flex gap-4">
        <div className="relative min-w-45">
          <Filter
            className="absolute left-3 top-1/2 -translate-y-1/2 text-input-icon"
            size={18}
          />
          <Select.Root value={filterValue} onValueChange={onFilterChange}>
            <Select.Trigger
              className="w-full pl-10 pr-4 py-2 appearance-none cursor-pointer rounded-lg focus:outline-none text-sm flex items-center justify-between bg-input-bg border border-input-border text-input-text"
              aria-label="Filtrar"
            >
              <Select.Value />
              <Select.Icon>
                <ChevronDown size={16} className="text-input-icon" />
              </Select.Icon>
            </Select.Trigger>
            <Select.Content
              position="popper"
              side="bottom"
              align="start"
              className="bg-card-primary border border-input-border rounded-lg shadow-lg p-1 z-50 min-w-45"
            >
              <Select.Viewport>
                {filterOptions.map((opt) => (
                  <Select.Item
                    key={opt.value}
                    value={opt.value}
                    className="px-3 py-2 rounded border-0 hover:bg-input-bg text-input-text cursor-pointer text-sm"
                  >
                    <Select.ItemText>{opt.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Root>
        </div>
      </div>
    )}
    {onAdd && (
      <button
        className="flex items-center gap-2 font-medium text-sm transition-colors px-4 py-2 bg-primary text-button-text rounded-lg shadow-sm hover:bg-button-bg-hover cursor-pointer"
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
