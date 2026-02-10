import { AnimatePresence } from 'framer-motion';
import React, { useEffect, useCallback } from 'react';
import { useI18n } from '../../hooks/useI18n';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'delete' | 'warning' | 'default';
  children?: React.ReactNode;
}

export const Modal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  type = 'delete',
  children
}: ModalProps) => {
  const { t } = useI18n();
  
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  const handleEscapeKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscapeKey);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, handleEscapeKey]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <div
            className="bg-background border border-border rounded-lg w-full max-w-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <h3 id="modal-title" className="text-base font-medium text-text mb-3">
                {title}
              </h3>
              
              {description && (
                <p className="text-sm text-text-secondary mb-5">
                  {description}
                </p>
              )}
              
              {children && (
                <div className="mb-5">
                  {children}
                </div>
              )}
              
              <div className="flex gap-2 justify-end">
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 text-sm text-text-secondary hover:text-text transition-colors"
                >
                  {cancelText || t('common.cancel')}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`px-3 py-1.5 text-sm rounded transition-colors ${
                    type === 'delete' 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : type === 'warning'
                      ? 'bg-orange-600 hover:bg-orange-700 text-white'
                      : 'bg-accent hover:opacity-90 text-white'
                  }`}
                >
                  {confirmText || t('common.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
