import { ReactNode } from 'react';

interface BaseBlockProps {
  children: ReactNode;
  className?: string;
  isDragging?: boolean;
}

export const BaseBlock = ({ children, className = '', isDragging = false }: BaseBlockProps) => {
  return (
    <div
      className={`
        group relative border border-border rounded-lg p-2 sm:p-3 lg:p-4 bg-background 
        hover:bg-hover transition-all
        ${isDragging ? 'shadow-lg opacity-50' : 'shadow-sm'}
        ${className}
      `}
    >
      {children}
    </div>
  );
};