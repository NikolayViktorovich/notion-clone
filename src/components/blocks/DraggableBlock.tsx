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
    <div
      ref={dragConstraintsRef}
      className="group relative mb-3"
    >
      <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
        <div
          className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing mt-2 transition-opacity p-1 hover:bg-gray-200 rounded"
        >
          <GripVertical className="w-4 h-4 text-gray-500" />
        </div>

        <div className="flex-1">
          {children}
        </div>

        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-200 rounded transition-all"
        >
          <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500 transition-colors" />
        </button>
      </div>
    </div>
  );
};