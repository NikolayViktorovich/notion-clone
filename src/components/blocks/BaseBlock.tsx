import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface BaseBlockProps {
  children: ReactNode;
  className?: string;
  isDragging?: boolean;
}

export const BaseBlock = ({ children, className = '', isDragging = false }: BaseBlockProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isDragging ? 0.5 : 1, 
        y: 0,
        scale: isDragging ? 1.02 : 1
      }}
      exit={{ opacity: 0, y: -20 }}
      className={`
        group relative border border-border rounded-lg p-4 bg-background 
        hover:bg-hover transition-all duration-200
        ${isDragging ? 'shadow-lg' : 'shadow-sm'}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};