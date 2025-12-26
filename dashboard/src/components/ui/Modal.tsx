import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";

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
        className={`fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg focus:outline-none ${className}`}
      >
        {title && (
          <Dialog.Title className="mb-4 text-lg font-semibold text-gray-900">
            {title}
          </Dialog.Title>
        )}
        {description && (
          <Dialog.Description className="mb-4 text-sm text-gray-600">
            {description}
          </Dialog.Description>
        )}
        <div>{children}</div>
        <Dialog.Close asChild>
          <button
            type="button"
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Close"
          >
            <span aria-hidden="true" className="text-2xl cursor-pointer">
              &times;
            </span>
          </button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
