import React, { useState, useEffect } from "react";
import { useRef } from "react";
import {
  PageHeader,
  PageContainer,
} from "@/shared/components/layout/PageLayout";
import { checksService } from "../api/checks.service";
import type { Event } from "@/features/events/types";
import type { EventStaff } from "@/features/events/types";
import { useAuth } from "@/shared/context/AuthContext";
import {
  Search,
  CheckCircle,
  XCircle,
  UserCheck,
  Clock,
  QrCode,
  Printer,
  TriangleAlert,
} from "lucide-react";
import Badge from "@/shared/components/ui/Badge";
import { formatDateTime } from "@/shared/lib/dateUtils";
import { Toast } from "@/shared/components/ui/Toast";
import qz from "qz-tray";
// import type { Check } from "@/shared/types";

// Função utilitária para imprimir via WebUSB
const printViaQZ = async (tsplData: string) => {
  try {
    // Conecta ao QZ Tray rodando na máquina local
    if (!qz.websocket.isActive()) {
      await qz.websocket.connect();
    }

    // Busca a impressora pelo nome (ajuste "4BarCode" para o nome exato que aparece no Windows)
    const printers = await qz.printers.find("4BarCode");

    // Cria a configuração de impressão
    const config = qz.configs.create(printers);

    // Envia os dados RAW (TSPL)
    const data = [
      {
        type: "raw",
        format: "plain",
        data: tsplData,
      },
    ];

    await qz.print(config, data);

    return true;
  } catch (error) {
    console.error("Erro na impressão QZ Tray:", error);
    throw error;
  } finally {
    // Opcional: desconectar após imprimir, ou manter ativo para próximas impressões mais rápidas
    if (qz.websocket.isActive()) {
      qz.websocket.disconnect();
    }
  }
};
type SearchMode = "cpf" | "qrcode";

const CheckInPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [searchMode, setSearchMode] = useState<SearchMode>("cpf");
  const [searchCPF, setSearchCPF] = useState("");
  const [searchEventStaffId, setSearchEventStaffId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<EventStaff | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    open: boolean;
    type: "success" | "error";
    message: string;
  }>({ open: false, type: "success", message: "" });
  const inputRef = useRef<HTMLInputElement>(null);
  const [scanFeedback, setScanFeedback] = useState<{
    type: "in" | "out" | "error";
    message: string;
    name?: string;
  } | null>(null);

  // Efeito para manter o cursor sempre focado no input do leitor
  useEffect(() => {
    if (searchMode === "qrcode" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchMode, scanFeedback]);

  // Fetch open events on mount
  useEffect(() => {
    fetchOpenEvents();
  }, []);

  const fetchOpenEvents = async () => {
    try {
      const response = await checksService.getEvents();
      setEvents(response.data);
      if (response.data.length > 0) {
        setSelectedEventId(response.data[0].id);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Erro ao carregar eventos");
    }
  };

  const handleSearch = async () => {
    if (!selectedEventId && searchMode === "cpf") {
      showToast("error", "Selecione um evento");
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResult(null);

    try {
      if (searchMode === "cpf") {
        // CPF Search Mode
        if (!searchCPF.trim()) {
          showToast("error", "Digite um CPF");
          setLoading(false);
          return;
        }

        // Remove formatting from CPF
        const cleanCPF = searchCPF.replace(/\D/g, "");

        if (cleanCPF.length !== 11) {
          showToast("error", "CPF inválido");
          setLoading(false);
          return;
        }

        // Search for staff in the selected event
        const response = await checksService.SearchStaff(selectedEventId!, {
          search: cleanCPF,
        });

        if (response.data.length === 0) {
          showToast("error", "Staff não encontrado neste evento");
          setSearchResult(null);
        } else {
          setSearchResult(response.data[0]);
        }
      } else {
        // QR Code (Event Staff ID) Search Mode
        console.log(searchEventStaffId);
        if (!searchEventStaffId.trim()) {
          showToast("error", "Digite ou escaneie um ID");
          setLoading(false);
          return;
        }

        // Search directly by event_staff ID
        const response = await checksService.getById(searchEventStaffId);
        setSearchResult(response.data);

        // Auto-select the event if not already selected
        if (!selectedEventId) {
          setSelectedEventId(response.data.event_id ?? null);
        }
      }
    } catch (err: any) {
      //console.error("Error searching staff:", err);

      const backendMessage = err.response?.data?.non_field_errors?.[0];

      const finalMessage = backendMessage || "Erro ao buscar staff";

      showToast("error", finalMessage);
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };
  const handleQRCodeScan = async () => {
    if (!searchEventStaffId.trim()) return;

    setLoading(true);
    try {
      // 1. Busca o staff diretamente pelo ID lido
      const response = await checksService.getById(searchEventStaffId);
      const staff = response.data;

      // 2. Define a ação lógica (In/Out/Register)
      let nextAction: "registration" | "check-in" | "check-out";

      if (!staff.is_registered) {
        nextAction = "registration";
      } else if (staff.last_status?.action !== "check-in") {
        nextAction = "check-in";
      } else {
        nextAction = "check-out";
      }

      // 3. Executa a ação imediatamente
      await checksService.create({
        action: nextAction,
        events_staff: staff.id,
      });

      // 4. Define o feedback visual
      setScanFeedback({
        type: nextAction === "check-out" ? "out" : "in",
        message:
          nextAction === "check-out"
            ? "Check-out Realizado"
            : "Check-in Realizado",
        name: staff.staff_name,
      });
    } catch (err: any) {
      setScanFeedback({
        type: "error",
        message:
          err.response?.data?.error ||
          "Staff não encontrado ou QR Code inválido",
      });
    } finally {
      setLoading(false);
      setSearchEventStaffId(""); // Limpa o input para o próximo leitor

      if (inputRef.current) {
        inputRef.current.focus(); // Retorna o foco
      }

      // Remove o feedback após 3 segundos
      setTimeout(() => setScanFeedback(null), 3000);
    }
  };

  const handleCheckAction = async (
    action: "registration" | "check-in" | "check-out",
  ) => {
    if (!searchResult || !user) return;

    setLoading(true);
    try {
      await checksService.create({
        action,
        events_staff: searchResult.id,
      });

      showToast("success", `${getActionLabel(action)} realizado com sucesso!`);

      // Refresh the search result to update status
      handleSearch();
    } catch (err: any) {
      //console.error("Error performing check action:", err);
      const errorMessage =
        err.response?.data?.non_field_errors?.[0] ||
        `Erro ao realizar ${getActionLabel(action)}`;
      showToast("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- Função para lidar com a impressão ---
  const handlePrint = async () => {
    if (!searchResult) return;

    setLoading(true);
    try {
      // Busca o modelo TSPL gerado no Django
      const response = await checksService.getPrintLabel(searchResult.id);

      // Envia para o QZ Tray
      await printViaQZ(response.data.label_data);

      showToast("success", "Pulseira enviada para a impressora!");
    } catch (err: any) {
      console.error("Error printing label:", err);
      showToast("error", "Erro ao imprimir. O QZ Tray está aberto?");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ open: true, type, message });
  };

  const getActionLabel = (action: string) => {
    const labels = {
      registration: "Registro",
      "check-in": "Check-in",
      "check-out": "Check-out",
    };
    return labels[action as keyof typeof labels] || action;
  };

  const getStatusBadge = (eventsStaff: EventStaff) => {
    if (!eventsStaff.is_registered) {
      return <Badge variant="pending" label="Aguardando Registro" />;
    }

    if (eventsStaff?.last_status?.action === "check-in") {
      return <Badge variant="check-in" label="Dentro do Evento" />;
    }

    if (eventsStaff?.last_status?.action === "check-out") {
      return <Badge variant="check-out" label="Fora do Evento" />;
    }

    return <Badge variant="credentialed" label="Registrado" />;
  };

  const canRegister = searchResult && !searchResult.is_registered;
  const canCheckIn =
    searchResult &&
    searchResult.is_registered &&
    searchResult.last_status?.action !== "check-in";
  const canCheckOut =
    searchResult && searchResult.last_status?.action === "check-in";

  // Apenas quem já se registou pode imprimir
  const canPrint = searchResult && searchResult.is_registered;

  return (
    <PageContainer>
      <PageHeader
        title="Check-in / Check-out"
        subtitle="Controle de acesso de staff aos eventos"
      />

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Search Mode Toggle */}
      <div className="mb-6 p-6 bg-card-primary rounded-xl border border-card-border shadow-sm">
        <label className="block text-sm font-medium text-text-subtitle mb-3">
          Modo de Busca
        </label>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setSearchMode("cpf");
              setSearchResult(null);
              setSearchEventStaffId("");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium hover:cursor-pointer transition-colors ${
              searchMode === "cpf"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Search size={18} />
            <>
              {/* Lupa aparece apenas no mobile (telas menores que 'sm') */}
              <span className="sm:hidden"> CPF</span>

              {/* Texto aparece apenas no desktop (telas 'sm' ou maiores) */}
              <span className="hidden sm:inline">Buscar pelo CPF</span>
            </>
          </button>
          <button
            onClick={() => {
              setSearchMode("qrcode");
              setSearchResult(null);
              setSearchCPF("");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium hover:cursor-pointer transition-colors ${
              searchMode === "qrcode"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <QrCode size={18} />
            <>
              {/* Lupa aparece apenas no mobile (telas menores que 'sm') */}
              <span className="sm:hidden"> QR Code</span>

              {/* Texto aparece apenas no desktop (telas 'sm' ou maiores) */}
              <span className="hidden sm:inline">Buscar por QR Code</span>
            </>
          </button>
        </div>
      </div>

      {/* Event Selection (only shown in CPF mode) */}
      {searchMode === "cpf" && (
        <div className="mb-6 p-6 bg-card-primary rounded-xl border border-card-border shadow-sm">
          <label className="block text-sm font-medium text-text-subtitle mb-2">
            Selecione o Evento
          </label>
          <select
            value={selectedEventId || ""}
            onChange={(e) => setSelectedEventId(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-input-bg border border-input-border text-input-text"
          >
            <option value="">Selecione um evento</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Search Input */}
      <div className="mb-6 p-6 bg-card-primary rounded-xl border border-card-border shadow-sm">
        <label className="block text-sm font-medium text-text-subtitle mb-2">
          {searchMode === "cpf"
            ? "Buscar Staff por CPF"
            : "Buscar Staff por QR Code"}
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            {searchMode === "cpf" ? (
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-input-icon"
                size={20}
              />
            ) : (
              <QrCode
                className="absolute left-3 top-1/2 -translate-y-1/2 text-input-icon"
                size={20}
              />
            )}
            {searchMode === "cpf" ? (
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Digite o CPF (somente números)"
                value={searchCPF}
                onChange={(e) => setSearchCPF(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-input-bg border border-input-border text-input-text"
                maxLength={14}
              />
            ) : (
              <input
                ref={inputRef}
                type="text"
                placeholder="Aguardando leitor de QR Code..."
                value={searchEventStaffId}
                onChange={(e) => setSearchEventStaffId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQRCodeScan()}
                className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-input-bg border border-input-border text-input-text font-mono"
                autoFocus
                onBlur={() =>
                  searchMode === "qrcode" && inputRef.current?.focus()
                } // Força o foco a não se perder
              />
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 sm:px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover hover:cursor-pointer transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                {/* Loading abreviado no mobile */}
                <span className="sm:hidden">...</span>
                {/* Loading completo no desktop */}
                <span className="hidden sm:inline">Buscando...</span>
              </>
            ) : (
              <>
                {/* Lupa aparece apenas no mobile (telas menores que 'sm') */}
                <Search size={20} className="sm:hidden" />

                {/* Texto aparece apenas no desktop (telas 'sm' ou maiores) */}
                <span className="hidden sm:inline">Buscar</span>
              </>
            )}
          </button>
        </div>
        {searchMode === "qrcode" && (
          <p className="mt-2 text-xs text-text-subtitle">
            O ID do evento-staff será automaticamente escaneado do QR Code
          </p>
        )}
      </div>
      {/* Alerta visual para uso com qrcode*/}
      {scanFeedback && searchMode === "qrcode" && (
        <div
          className={`mt-6 p-10 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg transition-all animate-in fade-in zoom-in duration-200 ${
            scanFeedback.type === "in"
              ? "bg-green-600 text-white"
              : scanFeedback.type === "out"
                ? "bg-orange-600 text-white"
                : "bg-yellow-600 text-white"
          }`}
        >
          {scanFeedback.type === "in" && (
            <CheckCircle size={80} className="mb-4" />
          )}
          {scanFeedback.type === "out" && (
            <XCircle size={80} className="mb-4" />
          )}
          {scanFeedback.type === "error" && (
            <TriangleAlert size={80} className="mb-4" />
          )}

          <h2 className="text-4xl font-bold mb-2 uppercase tracking-wide">
            {scanFeedback.message}
          </h2>
          {scanFeedback.name && (
            <p className="text-2xl font-medium mt-2">{scanFeedback.name}</p>
          )}
        </div>
      )}

      {/* Search Result */}
      {searchResult && (
        <div className="p-6 bg-card-primary rounded-xl border border-card-border shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-text-title mb-1">
              Staff Encontrado
            </h3>
            {getStatusBadge(searchResult)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium text-text-subtitle">
                Nome
              </label>
              <p className="mt-1 text-text-title">{searchResult.staff_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-subtitle">
                CPF
              </label>
              <p className="mt-1 text-text-title">{searchResult.staff_cpf}</p>
            </div>
            {/* Demonstrativo do ID do evento
              <div>
              <label className="text-sm font-medium text-text-subtitle">
                ID do Evento
              </label>
              <p className="mt-1 text-text-title">{searchResult.event_id}</p>
            </div>*/}
            {searchResult.last_status?.action && (
              <>
                <div>
                  <label className="text-sm font-medium text-text-subtitle">
                    Última Ação
                  </label>
                  <p className="mt-1 text-text-title capitalize">
                    {getActionLabel(searchResult.last_status?.action)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-subtitle">
                    Data/Hora
                  </label>
                  <p className="mt-1 text-text-title">
                    {formatDateTime(searchResult.last_status?.timestamp)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-subtitle">
                    ID EventStaff (QR Code)
                  </label>
                  <p className="mt-1 text-text-title font-mono text-sm break-all">
                    {searchResult.id}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            {canRegister && (
              <button
                onClick={() => handleCheckAction("registration")}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:cursor-pointer transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserCheck size={18} />
                Registrar Staff
              </button>
            )}

            {canCheckIn && (
              <button
                onClick={() => handleCheckAction("check-in")}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 hover:cursor-pointer transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle size={18} />
                Check-in
              </button>
            )}

            {canCheckOut && (
              <button
                onClick={() => handleCheckAction("check-out")}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 hover:cursor-pointer transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle size={18} />
                Check-out
              </button>
            )}

            {/* NOVO BOTÃO DE IMPRESSÃO */}
            {canPrint && (
              <button
                onClick={handlePrint}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 hover:cursor-pointer transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
              >
                <Printer size={18} />
                Imprimir Pulseira
              </button>
            )}

            {!canRegister && !canCheckIn && !canCheckOut && !canPrint && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock size={18} />
                <span>Nenhuma ação disponível no momento</span>
              </div>
            )}
          </div>
        </div>
      )}

      <Toast
        open={toast.open}
        onOpenChange={(open) => setToast({ ...toast, open })}
        type={toast.type}
        message={toast.message}
      />
    </PageContainer>
  );
};

export default CheckInPage;
