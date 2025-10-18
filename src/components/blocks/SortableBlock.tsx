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
}

export const SortableBlock = ({ block, children, index }: SortableBlockProps) => {
  const { deleteBlock } = useStore();
  const [deleteModal, setDeleteModal] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
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
    
    return `${block.type.charAt(0).toUpperCase() + block.type.slice(1)}: ${content || 'Empty block'}`;
  };

  return (
    <>
      <motion.div
        ref={setNodeRef}
        style={style}
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: isDragging ? 0.5 : 1, 
          y: 0 
        }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ 
          type: "spring", 
          stiffness: 500, 
          damping: 30,
          delay: index * 0.05 
        }}
        className={`group relative mb-3 ${isDragging ? 'z-50' : ''}`}
      >
        <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
          {/* Drag Handle */}
          <motion.div
            {...attributes}
            {...listeners}
            whileHover={{ scale: 1.1 }}
            className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing mt-2 transition-opacity p-1 hover:bg-gray-200 rounded"
          >
            <GripVertical className="w-4 h-4 text-gray-500" />
          </motion.div>

          {/* Block Content */}
          <div className="flex-1">
            {children}
          </div>

          {/* Delete Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={handleDeleteClick}
            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-200 rounded transition-all"
          >
            <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500 transition-colors" />
          </motion.button>
        </div>
      </motion.div>

      {/* Delete Block Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Block"
        description={`Are you sure you want to delete this block? "${getBlockPreview()}"`}
        confirmText="Delete Block"
        type="delete"
      />
    </>
  );
};