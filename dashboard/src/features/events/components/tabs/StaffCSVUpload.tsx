import React, { useState } from "react";
import { Upload, X, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { eventStaffService } from "../../api/eventStaff.service";
import { type Dispatch, type SetStateAction } from "react";
import { type ToastType } from "@/shared/components/ui/Toast";

interface StaffCSVData {
  name: string;
  cpf: string;
}
export interface ToastState {
  open: boolean;
  type: ToastType;
  message: string;
}
interface StaffCSVUploadProps {
  eventId: number;
  onSuccess: () => void;
  onCancel: () => void;
  setToast: Dispatch<SetStateAction<ToastState>>;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

const StaffCSVUpload: React.FC<StaffCSVUploadProps> = ({
  eventId,
  onSuccess,
  onCancel,
  setToast,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<StaffCSVData[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>("");
  const [step, setStep] = useState<"upload" | "preview">("upload");

  const validateCPF = (cpf: string): boolean => {
    const cleaned = cpf.replace(/\D/g, "");
    return cleaned.length === 11;
  };

  const parseCSV = (text: string): void => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length < 2) {
      setApiError("Arquivo CSV vazio ou inválido");
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const requiredHeaders = ["nome", "cpf"];
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));

    if (missingHeaders.length > 0) {
      setApiError(
        `Colunas obrigatórias faltando: ${missingHeaders.join(", ")}`,
      );
      return;
    }

    const data: StaffCSVData[] = [];
    const validationErrors: ValidationError[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      const row: Record<string, string> = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });

      if (!row.nome && !row.cpf) {
        continue;
      }

      // Validate required fields
      if (!row.nome) {
        validationErrors.push({
          row: i + 1,
          field: "name",
          message: "Nome é obrigatório",
        });
      }

      if (!row.cpf || !validateCPF(row.cpf)) {
        validationErrors.push({
          row: i + 1,
          field: "cpf",
          message: "CPF inválido ou faltando",
        });
      }

      data.push({
        name: row.nome,
        cpf: row.cpf.replace(/\D/g, ""),
      });
    }

    setErrors(validationErrors);
    setParsedData(data);
    if (validationErrors.length === 0) {
      setStep("preview");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      setApiError("Por favor, selecione um arquivo .csv válido");
      return;
    }

    setFile(selectedFile);
    setApiError("");
    setErrors([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(selectedFile);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setApiError("");

    try {
      const response = await eventStaffService.createBulk(eventId, parsedData);
      setToast({
        open: true,
        type: "success",
        message: response.data.message,
      });
      onSuccess();
    } catch (error: any) {
      let errorMessage = "Erro ao importar staff";

      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setApiError(errorMessage);

      setToast({
        open: true,
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setParsedData([]);
    setErrors([]);
    setStep("upload");
    setApiError("");
  };

  const downloadTemplate = () => {
    const template = "nome,cpf\nJoão Silva,12345678901";
    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_staff.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {apiError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {step === "upload" && (
        <>
          <div className="text-sm text-subtitle mb-4">
            <p className="mb-2">
              Faça upload de um arquivo CSV com os seguintes campos:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>
                <strong>nome</strong>: Nome completo do staff.
              </li>
              <li>
                <strong>cpf</strong>: CPF do staff (somente números).
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={downloadTemplate}
            className="hover:cursor-pointer text-sm text-primary hover:underline flex items-center gap-1"
          >
            <FileText size={14} />
            Baixar modelo CSV
          </button>

          <div className="border-2 border-dashed border-input-border rounded-lg p-8 text-center">
            {!file ? (
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-sm text-subtitle mb-2">
                  Clique para selecionar ou arraste um arquivo CSV
                </p>
                <p className="text-xs text-gray-400">Máximo 5MB</p>
              </label>
            ) : (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText size={20} className="text-primary" />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="hover:cursor-pointer text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>

          {errors.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-red-600 flex items-center gap-2">
                <AlertCircle size={16} />
                Erros encontrados ({errors.length})
              </h4>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {errors.map((error, index) => (
                  <div
                    key={index}
                    className="text-xs text-red-600 bg-red-50 p-2 rounded"
                  >
                    Linha {error.row}, campo "{error.field}": {error.message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {step === "preview" && (
        <>
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
            <CheckCircle size={16} />
            <span>
              {parsedData.length} staff{parsedData.length > 1 ? "s" : ""} pronto
              {parsedData.length > 1 ? "s" : ""} para importação
            </span>
          </div>

          <div className="max-h-96 overflow-y-auto border border-input-border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Nome</th>
                  <th className="px-4 py-2 text-left font-semibold">CPF</th>
                </tr>
              </thead>
              <tbody>
                {parsedData.map((staff, index) => (
                  <tr key={index} className="border-t border-input-border">
                    <td className="px-4 py-2">{staff.name}</td>
                    <td className="px-4 py-2">{staff.cpf}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={handleRemoveFile}
            className="hover:cursor-pointer text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
          >
            <X size={14} />
            Selecionar outro arquivo
          </button>
        </>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-input-border">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="hover:cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading || parsedData.length === 0 || errors.length > 0}
          className="hover:cursor-pointer px-4 py-2 text-sm font-medium text-button-text bg-primary rounded-lg hover:bg-button-bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Importando..." : `Importar ${parsedData.length} Staffs`}
        </button>
      </div>
    </div>
  );
};

export default StaffCSVUpload;
