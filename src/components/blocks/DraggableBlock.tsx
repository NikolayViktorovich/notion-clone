import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useStore } from '../../store/useStore';
import { Block } from '../../types';
import { GripVertical, Trash2 } from 'lucide-react';

interface DraggableBlockProps {
  block: Block;
  children: React.ReactNode;
  index: number;
}

export const DraggableBlock = ({ block, children, index }: DraggableBlockProps) => {
  const { deleteBlock } = useStore();
  const dragConstraintsRef = useRef<HTMLDivElement>(null);

  const handleDelete = () => {
    if (window.confirm('Delete this block?')) {
      deleteBlock(block.id);
    }
  };

  return (
    <motion.div
      ref={dragConstraintsRef}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ 
        type: "spring", 
        stiffness: 500, 
        damping: 30,
        delay: index * 0.05 
      }}
      className="group relative mb-3"
    >
      <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
        {/* Drag Handle */}
        <motion.div
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
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-200 rounded transition-all"
        >
          <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500 transition-colors" />
        </motion.button>
      </div>
    </motion.div>
  );
};