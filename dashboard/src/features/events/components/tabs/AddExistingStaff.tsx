import React, { useState, useEffect } from "react";
import {
  Search,
  User,
  Building2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import type { Staff } from "@/features/staffs/types";
import { staffsService } from "@/features/staffs/api/staffs.service";
import { eventStaffService } from "../../api/eventStaff.service";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useAuth } from "@/shared";

interface AddExistingStaffProps {
  eventId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const AddExistingStaff: React.FC<AddExistingStaffProps> = ({
  eventId,
  onSuccess,
  onCancel,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [allStaff, setAllStaff] = useState<Staff[]>([]);
  const [selectedStaffIds, setSelectedStaffIds] = useState<Set<number>>(
    new Set(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { user } = useAuth();
  const userId = user?.id;

  // Fetch staff with server-side filtering
  useEffect(() => {
    const fetchStaff = async () => {
      setIsLoading(true);
      setError("");
      try {
        const params: { search?: string } = {};
        if (debouncedSearchTerm) {
          params.search = debouncedSearchTerm;
        }
        const response = await staffsService.getAll(params);
        setAllStaff(response.data);
      } catch (err) {
        setError("Erro ao carregar lista de staff");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaff();
  }, [debouncedSearchTerm]);

  const handleToggleStaff = (staffId: number) => {
    const newSelected = new Set(selectedStaffIds);
    if (newSelected.has(staffId)) {
      newSelected.delete(staffId);
    } else {
      newSelected.add(staffId);
    }
    setSelectedStaffIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedStaffIds.size === allStaff.length) {
      setSelectedStaffIds(new Set());
    } else {
      setSelectedStaffIds(new Set(allStaff.map((s) => s.id)));
    }
  };

  const handleSubmit = async () => {
    if (selectedStaffIds.size === 0) {
      setError("Selecione pelo menos um staff");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Get selected staff CPFs
      const selectedStaff = allStaff.filter((s) => selectedStaffIds.has(s.id));

      // Create event-staff relationships for each selected staff
      const promises = selectedStaff.map((staff) =>
        eventStaffService.create({
          staff_cpf: staff.cpf,
          event_id: eventId,
          staff_id: staff.id,
          created_by: userId,
        }),
      );

      await Promise.all(promises);
      onSuccess();
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError(
          err.response?.data?.detail || "Alguns staff já estão no evento",
        );
      } else {
        setError("Erro ao adicionar staff ao evento");
      }
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Buscar por nome, CPF ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-input-bg border border-input-border text-input-text"
        />
      </div>

      {/* Select All Checkbox */}
      {allStaff.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="select-all"
            checked={selectedStaffIds.size === allStaff.length}
            onChange={handleSelectAll}
            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
          />
          <label
            htmlFor="select-all"
            className="text-sm font-medium cursor-pointer"
          >
            Selecionar todos ({allStaff.length})
          </label>
          {selectedStaffIds.size > 0 && (
            <span className="ml-auto text-sm text-primary font-medium">
              {selectedStaffIds.size} selecionado(s)
            </span>
          )}
        </div>
      )}

      {/* Staff List */}
      <div className="max-h-96 overflow-y-auto border border-input-border rounded-lg">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            Carregando staff disponível...
          </div>
        ) : allStaff.length === 0 ? (
          <div className="p-8 text-center">
            <User size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-gray-500 text-sm">
              {searchTerm
                ? "Nenhum staff encontrado com os filtros aplicados"
                : "Nenhum staff disponível"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-input-border">
            {allStaff.map((staff) => {
              const isSelected = selectedStaffIds.has(staff.id);
              return (
                <label
                  key={staff.id}
                  className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isSelected ? "bg-primary/5" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleStaff(staff.id)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm text-title">
                        {staff.name}
                      </h4>
                      {isSelected && (
                        <CheckCircle size={14} className="text-primary" />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-subtitle">
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {staff.cpf}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 size={12} />
                        Empresa #{staff.company_id}
                      </span>
                      {staff.email && (
                        <span className="text-gray-500">{staff.email}</span>
                      )}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-input-border">
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="hover:cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || selectedStaffIds.size === 0}
          className="hover:cursor-pointer px-4 py-2 text-sm font-medium text-button-text bg-primary rounded-lg hover:bg-button-bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? "Adicionando..."
            : `Adicionar ${selectedStaffIds.size || ""} Staff${
                selectedStaffIds.size !== 1 ? "s" : ""
              }`}
        </button>
      </div>
    </div>
  );
};

export default AddExistingStaff;
