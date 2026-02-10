import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Block } from '../../types';
import { GripVertical, Trash2 } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';

interface SortableBlockProps {
  block: Block;
  children: React.ReactNode;
  index: number;
  isDragging?: boolean;
  onDeleteClick?: (blockId: string, blockPreview: string) => void;
}

export const SortableBlock = ({ 
  block, 
  children, 
  index, 
  isDragging = false,
  onDeleteClick 
}: SortableBlockProps) => {
  const { t } = useI18n();
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
    const blockTypeNames: { [key: string]: string } = {
      'text': t('blocks.text').toLowerCase(),
      'heading': t('blocks.heading').toLowerCase(),
      'todo': t('blocks.todo').toLowerCase(),
      'quote': t('blocks.quote').toLowerCase()
    };
    
    const blockTypeName = blockTypeNames[block.type] || block.type;
    onDeleteClick?.(block.id, blockTypeName);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative mb-3 ${dndIsDragging ? 'z-50 opacity-50' : ''}`}
    >
      <div className="flex items-start gap-3 p-2 hover:bg-hover rounded-lg transition-colors">
        <div
          {...attributes}
          {...listeners}
          className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing mt-2 transition-opacity p-1 hover:bg-border rounded"
        >
          <GripVertical className="w-4 h-4 text-text-secondary" />
        </div>

        <div className="flex-1">
          {children}
        </div>

        <button
          onClick={handleDeleteClick}
          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-border rounded transition-opacity"
        >
          <Trash2 className="w-4 h-4 text-text-secondary transition-colors" />
        </button>
      </div>
    </div>
  );
};