import * as Progress from "@radix-ui/react-progress"; // Assumindo Radix UI

// 1. Componente Reutilizável para a Barra de Progresso
interface MetricProgressProps {
  label: string;
  current: number;
  total: number;
  colorClass: string; // Classe para a cor da barra (ex: bg-green-500)
}

const MetricProgress = ({
  label,
  current,
  total,
  colorClass,
}: MetricProgressProps) => {
  // 2. Lógica de Segurança
  // Evita divisão por zero retornando 0 se total for inválido
  const rawPercentage = total > 0 ? (current / total) * 100 : 0;

  // 3. Restrição (Clamping)
  // Garante que o valor visual fique entre 0 e 100, evitando que a barra quebre o layout
  const safePercentage = Math.min(100, Math.max(0, rawPercentage));

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-text-subtitle">
          {label}
        </label>
        <span className="text-sm font-semibold text-text-title">
          {current} / {total} ({Math.floor((current / total) * 100)}%)
        </span>
      </div>

      <Progress.Root
        className="relative overflow-hidden bg-slate-200 rounded-full w-full h-3"
        value={safePercentage}
      >
        <Progress.Indicator
          className={`${colorClass} h-full transition-transform duration-300 ease-in-out`}
          style={{
            // O translate negativo puxa a barra para a esquerda.
            // Se for 100%, translate é 0%. Se for 0%, translate é -100%.
            transform: `translateX(-${100 - safePercentage}%)`,
          }}
        />
      </Progress.Root>
    </div>
  );
};

export default MetricProgress;
