'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  titleId?: string;
  description?: string;
  descriptionId?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'dialog' | 'alertdialog' | 'bottomSheet';
  closeOnBackdropClick?: boolean;
  zIndex?: 50 | 60;
  className?: string;
  /** Set to false if parent component handles focus management */
  manageFocus?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-4xl',
};

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  titleId = 'modal-title',
  description,
  descriptionId = 'modal-desc',
  size = 'md',
  variant = 'dialog',
  closeOnBackdropClick = true,
  zIndex = 50,
  className = '',
  manageFocus = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap and keyboard handling (only if manageFocus is true)
  useEffect(() => {
    if (!isOpen || !manageFocus) return;

    // Focus the modal when opened
    const timer = setTimeout(() => {
      if (modalRef.current) {
        modalRef.current.focus();
      }
    }, 10);

    // Handle escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, manageFocus]);

  if (!isOpen) return null;

  const isBottomSheet = variant === 'bottomSheet';
  const zIndexClass = zIndex === 60 ? 'z-[60]' : 'z-50';

  const backdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex ${
        isBottomSheet ? 'items-end sm:items-center' : 'items-center'
      } justify-center ${zIndexClass} ${isBottomSheet ? 'sm:p-4' : 'p-4'}`}
      role={variant === 'alertdialog' ? 'alertdialog' : 'dialog'}
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
      onClick={backdropClick}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`bg-white ${
          isBottomSheet
            ? 'rounded-t-2xl sm:rounded-xl w-full sm:w-auto'
            : 'rounded-xl'
        } shadow-2xl ${sizeClasses[size]} w-full ${
          isBottomSheet ? 'max-h-[95vh] sm:max-h-[90vh]' : 'max-h-[90vh]'
        } flex flex-col ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

// Modal Header component
interface ModalHeaderProps {
  children: ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
  className?: string;
}

export function ModalHeader({
  children,
  onClose,
  showCloseButton = true,
  className = '',
}: ModalHeaderProps) {
  return (
    <div className={`p-4 sm:p-6 border-b border-light-gray flex-shrink-0 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">{children}</div>
        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className="text-dark-gray hover:text-charcoal p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary flex-shrink-0 -mr-2 -mt-2"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

// Modal Body component
interface ModalBodyProps {
  children: ReactNode;
  className?: string;
  scrollable?: boolean;
}

export function ModalBody({
  children,
  className = '',
  scrollable = true,
}: ModalBodyProps) {
  return (
    <div
      className={`p-4 sm:p-6 ${scrollable ? 'overflow-y-auto flex-1' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

// Modal Footer component
interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

export function ModalFooter({ children, className = '' }: ModalFooterProps) {
  return (
    <div
      className={`p-4 sm:p-6 border-t border-light-gray flex-shrink-0 ${className}`}
    >
      {children}
    </div>
  );
}
