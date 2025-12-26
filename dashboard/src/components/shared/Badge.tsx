const variants = {
  open: {
    style: "bg-toast-success-bg text-toast-success-text",
    label: "Ativo",
  },
  close: {
    style: "bg-toast-error-bg text-toast-error-text",
    label: "Concluído",
  },
  in_progress: {
    style: "bg-toast-warning-bg text-toast-warning-text",
    label: "Em Progresso",
  },
};

interface BadgeProps {
  variant: keyof typeof variants;
}

const Badge = (variant: BadgeProps) => (
  <span
    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
      variants[variant.variant].style
    }`}
  >
    {variants[variant.variant].label}
  </span>
);

export default Badge;
