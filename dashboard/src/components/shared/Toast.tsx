import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { Check, Ban, TriangleAlert } from "lucide-react";

const typeVars = {
  default: {
    style:
      "bg-toast-default-bg text-toast-default-text border-toast-default-border",
    icon: <></>,
  },
  success: {
    style:
      "bg-toast-success-bg text-toast-success-text border-toast-success-border",
    icon: <Check size={20} />,
  },
  error: {
    style: "bg-toast-error-bg text-toast-error-text border-toast-error-border",
    icon: <Ban size={20} />,
  },
  warning: {
    style:
      "bg-toast-warning-bg text-toast-warning-text border-toast-warning-border",
    icon: <TriangleAlert size={20} />,
  },
};

export type ToastType = keyof typeof typeVars;

interface ToastProps {
  open: boolean;
  type?: ToastType;
  message: string;
  onOpenChange: (open: boolean) => void;
  duration?: number; // ms
}

export const Toast: React.FC<ToastProps> = ({
  open,
  type = "default",
  message,
  onOpenChange,
  duration = 3000,
}) => {
  const variant = typeVars[type && type in typeVars ? type : "default"];
  return (
    <ToastPrimitive.Provider swipeDirection="right" duration={duration}>
      <ToastPrimitive.Root
        open={open}
        onOpenChange={onOpenChange}
        className={`fixed top-20 right-8 z-200 min-w-60 max-w-xs px-4 py-3 rounded shadow-lg border-l-4 flex items-center gap-2 animate-fade-in ${variant.style}`}
      >
        {variant.icon}
        <span className="flex-1">{message}</span>
        <ToastPrimitive.Close asChild>
          <button
            className="ml-2 text-lg text-gray-2000 hover:text-gray-800 focus:outline-none"
            aria-label="Fechar"
          >
            &times;
          </button>
        </ToastPrimitive.Close>
      </ToastPrimitive.Root>
      <ToastPrimitive.Viewport className="fixed bottom-6 right-6 z-200" />
    </ToastPrimitive.Provider>
  );
};
