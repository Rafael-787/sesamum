const variants = {
  default: {
    style: "bg-badge-default-bg text-badge-default-text",
    label: "Padrão",
  },
  open: {
    style: "bg-badge-open-bg text-badge-open-text",
    label: "Ativo",
  },
  close: {
    style: "bg-badge-closed-bg text-badge-closed-text",
    label: "Concluído",
  },
  in_progress: {
    style: "bg-badge-pending-bg text-badge-pending-text",
    label: "Em Progresso",
  },
  admin: {
    style: "bg-badge-default-bg text-badge-admin-text",
    label: "Administrador",
  },
  company: {
    style: "bg-badge-default-bg text-badge-company-text",
    label: "Empresa",
  },
  control: {
    style: "bg-badge-default-bg text-badge-controller-text",
    label: "Controlador",
  },
};

interface BadgeProps {
  variant?: keyof typeof variants;
  label?: string;
}

const Badge = ({ variant = "default", label }: BadgeProps) => {
  const BadgeVariant =
    variants[variant && variant in variants ? variant : "default"];
  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide ${BadgeVariant.style}`}
    >
      {label || BadgeVariant.label}
    </span>
  );
};

export default Badge;
