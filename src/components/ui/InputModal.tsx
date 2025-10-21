import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

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
  confirmText = 'Сохранить',
  cancelText = 'Отмена',
  placeholder = 'Введите значение',
  value,
  onChange
}: InputModalProps) => {
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-background border border-border rounded-xl shadow-lg max-w-md w-full p-6"
          >
            {/* Хэдер */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-hover rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            {/* Описание */}
            {description && (
              <p className="text-text-secondary mb-4">
                {description}
              </p>
            )}

            {/* Ввод */}
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent mb-6"
              onKeyDown={handleKeyDown}
              autoFocus
            />

            {/* ДЕйствия */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-text bg-hover hover:bg-border rounded-lg transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                disabled={!value.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-accent hover:opacity-90 rounded-lg transition-colors disabled:opacity-50"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};