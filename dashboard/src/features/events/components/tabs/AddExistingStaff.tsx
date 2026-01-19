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
  const [companyFilter, setCompanyFilter] = useState<string>("all");

  // Fetch all available staff
  useEffect(() => {
    const fetchStaff = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await staffsService.getAll();
        setAllStaff(response.data);
      } catch (err) {
        setError("Erro ao carregar lista de staff");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaff();
  }, [eventId]);

  const filteredStaff = allStaff.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.cpf.includes(searchTerm) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCompany =
      companyFilter === "all" || staff.company_id.toString() === companyFilter;

    return matchesSearch && matchesCompany;
  });

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
    if (selectedStaffIds.size === filteredStaff.length) {
      setSelectedStaffIds(new Set());
    } else {
      setSelectedStaffIds(new Set(filteredStaff.map((s) => s.id)));
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

  // Get unique companies for filter
  const companies = Array.from(new Set(allStaff.map((s) => s.company_id))).map(
    (id) => ({
      id,
      name: `Empresa ${id}`, // TODO: Replace with actual company names
    }),
  );

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
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
        <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-input-bg border border-input-border text-input-text"
        >
          <option value="all">Todas Empresas</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id.toString()}>
              {company.name}
            </option>
          ))}
        </select>
      </div>

      {/* Select All Checkbox */}
      {filteredStaff.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="select-all"
            checked={selectedStaffIds.size === filteredStaff.length}
            onChange={handleSelectAll}
            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
          />
          <label
            htmlFor="select-all"
            className="text-sm font-medium cursor-pointer"
          >
            Selecionar todos ({filteredStaff.length})
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
        ) : filteredStaff.length === 0 ? (
          <div className="p-8 text-center">
            <User size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-gray-500 text-sm">
              {searchTerm || companyFilter !== "all"
                ? "Nenhum staff encontrado com os filtros aplicados"
                : "Nenhum staff disponível"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-input-border">
            {filteredStaff.map((staff) => {
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
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || selectedStaffIds.size === 0}
          className="px-4 py-2 text-sm font-medium text-button-text bg-primary rounded-lg hover:bg-button-bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
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
