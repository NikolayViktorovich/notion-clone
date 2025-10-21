import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Block } from '../../types';
import { GripVertical, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Modal } from '../ui/Modal';

interface SortableBlockProps {
  block: Block;
  children: React.ReactNode;
  index: number;
  isDragging?: boolean;
}

export const SortableBlock = ({ block, children, index, isDragging = false }: SortableBlockProps) => {
  const { deleteBlock } = useStore();
  const [deleteModal, setDeleteModal] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: dndIsDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDeleteClick = () => {
    setDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    deleteBlock(block.id);
    setDeleteModal(false);
  };

  const getBlockPreview = () => {
    const content = block.content.length > 50 
      ? block.content.substring(0, 50) + '...' 
      : block.content;
    
    return `${block.type.charAt(0).toUpperCase() + block.type.slice(1)}: ${content || 'Пустой блок'}`;
  };

  return (
    <>
      <motion.div
        ref={setNodeRef}
        style={style}
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: dndIsDragging ? 0.5 : 1, 
          y: 0 
        }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ 
          type: "spring", 
          stiffness: 500, 
          damping: 30,
          delay: index * 0.05 
        }}
        className={`group relative mb-3 ${dndIsDragging ? 'z-50' : ''}`}
      >
        <div className="flex items-start gap-3 p-2 hover:bg-hover rounded-lg transition-colors">
          {/* Перетаскивание ручки */}
          <motion.div
            {...attributes}
            {...listeners}
            whileHover={{ scale: 1.1 }}
            className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing mt-2 transition-opacity p-1 hover:bg-border rounded"
          >
            <GripVertical className="w-4 h-4 text-text-secondary" />
          </motion.div>

          {/* Block Content */}
          <div className="flex-1">
            {children}
          </div>

          {/* Удалить */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={handleDeleteClick}
            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-border rounded transition-all"
          >
            <Trash2 className="w-4 h-4 text-text-secondary hover:text-red-500 transition-colors" />
          </motion.button>
        </div>
      </motion.div>

      {/* Модалка для кнопки */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Удалить блок"
        description={`Вы уверены что хотите удалить блок "${getBlockPreview()}"?`}
        confirmText="Удалить"
        type="delete"
      />
    </>
  );
};