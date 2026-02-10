import { AnimatePresence } from 'framer-motion';
import { useI18n } from '../../hooks/useI18n';

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export const InputModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  placeholder,
  value,
  onChange
}: InputModalProps) => {
  const { t } = useI18n();

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (value.trim()) {
      onConfirm(value);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={handleBackdropClick}
        >
          <div
            className="bg-background border border-border rounded-lg max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <h3 className="text-base font-medium text-text mb-3">
                {title}
              </h3>

              {description && (
                <p className="text-sm text-text-secondary mb-4">
                  {description}
                </p>
              )}

              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder || t('modal.placeholder')}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded text-text placeholder-text-secondary focus:outline-none focus:border-accent mb-4"
                onKeyDown={handleKeyDown}
                autoFocus
              />
              
              <div className="flex gap-2 justify-end">
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 text-sm text-text-secondary hover:text-text transition-colors"
                >
                  {cancelText || t('modal.cancel')}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!value.trim()}
                  className="px-3 py-1.5 text-sm bg-accent hover:opacity-90 text-white rounded transition-colors disabled:opacity-50"
                >
                  {confirmText || t('modal.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
