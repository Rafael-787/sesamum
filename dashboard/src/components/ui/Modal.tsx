import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  className = "",
}) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50" />
      <Dialog.Content
        className={`fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-card-primary p-6 shadow-lg focus:outline-none ${className}`}
      >
        {title && (
          <Dialog.Title className="mb-4 text-lg font-semibold text-text-title">
            {title}
          </Dialog.Title>
        )}
        {description && (
          <Dialog.Description className="mb-4 text-sm text-text-subtitle">
            {description}
          </Dialog.Description>
        )}
        <div>{children}</div>
        <Dialog.Close asChild>
          <button
            type="button"
            className="absolute top-4 right-4 text-subtitle hover:cursor-pointer hover:text-title focus:outline-none"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
