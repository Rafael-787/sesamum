import { useState, useMemo, useEffect, useCallback } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

export interface AutocompleteProps<T> {
  options: T[];
  value?: string | number;
  onChange: (value: string | number) => void;
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string | number;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  // Server-side filtering props
  onSearch?: (searchTerm: string) => void | Promise<void>;
  isLoading?: boolean;
  debounceMs?: number;
  minSearchLength?: number;
}

export function Autocomplete<T>({
  options,
  value,
  onChange,
  getOptionLabel,
  getOptionValue,
  placeholder = "Pesquisar...",
  error,
  disabled = false,
  className = "",
  onSearch,
  isLoading = false,
  debounceMs = 300,
  minSearchLength = 0,
}: AutocompleteProps<T>) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Find the selected option to display its label
  const selectedOption = options.find(
    (option) => getOptionValue(option) === value,
  );
  const displayValue = selectedOption ? getOptionLabel(selectedOption) : "";

  // Debounce search term for server-side filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  // Trigger server-side search when debounced term changes
  useEffect(() => {
    if (onSearch && debouncedSearchTerm.length >= minSearchLength) {
      onSearch(debouncedSearchTerm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, minSearchLength]);

  // Client-side filtering (only when onSearch is not provided)
  const filteredOptions = useMemo(() => {
    if (onSearch) return options; // Server-side filtering, show all returned options
    if (!searchTerm) return options;
    return options.filter((option) =>
      getOptionLabel(option).toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [options, searchTerm, getOptionLabel, onSearch]);

  const handleSelect = useCallback(
    (option: T) => {
      onChange(getOptionValue(option));
      setSearchTerm("");
      setOpen(false);
    },
    [onChange, getOptionValue],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!open) setOpen(true);
  };

  const showNoResults =
    !isLoading &&
    filteredOptions.length === 0 &&
    searchTerm.length >= minSearchLength;

  return (
    <div className={className}>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Anchor asChild>
          <div className="relative">
            <input
              className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-input-bg border text-input-text ${
                error ? "border-red-500" : "border-input-border"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              placeholder={placeholder}
              value={open ? searchTerm : displayValue}
              onChange={handleInputChange}
              onFocus={() => !disabled && setOpen(true)}
              disabled={disabled}
            />
            {isLoading ? (
              <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
            ) : (
              <ChevronsUpDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
            )}
          </div>
        </Popover.Anchor>

        <Popover.Portal>
          <Popover.Content
            className="z-50 w(--radix-popover-trigger-width) overflow-hidden rounded-md border border-slate-200 bg-white text-slate-950 shadow-md animate-in fade-in-0 zoom-in-95"
            sideOffset={5}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="max-h-75 overflow-y-auto p-1">
              {isLoading ? (
                <div className="py-6 text-center text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                  Carregando...
                </div>
              ) : showNoResults ? (
                <div className="py-6 text-center text-sm text-slate-500">
                  Nenhum resultado encontrado.
                </div>
              ) : searchTerm.length < minSearchLength && onSearch ? (
                <div className="py-6 text-center text-sm text-slate-500">
                  Digite ao menos {minSearchLength} caracteres para buscar.
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const optionValue = getOptionValue(option);
                  const optionLabel = getOptionLabel(option);
                  const isSelected = optionValue === value;

                  return (
                    <button
                      key={String(optionValue)}
                      type="button"
                      className="relative flex w-full hover:cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-slate-100 focus:bg-slate-100"
                      onClick={() => handleSelect(option)}
                    >
                      <span>{optionLabel}</span>
                      {isSelected && <Check className="ml-auto h-4 w-4" />}
                    </button>
                  );
                })
              )}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

export default Autocomplete;
