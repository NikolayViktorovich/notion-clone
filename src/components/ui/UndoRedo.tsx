import { Undo2, Redo2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useI18n } from '../../hooks/useI18n';

export const UndoRedo = () => {
  const { undo, redo, canUndo, canRedo } = useStore();
  const { t } = useI18n();

  const handleUndo = () => {
    if (canUndo()) undo();
  };

  const handleRedo = () => {
    if (canRedo()) redo();
  };

  return (
    <div className="flex items-center gap-1 bg-background border border-border rounded-lg p-1">
      <button
        onClick={handleUndo}
        disabled={!canUndo()}
        className={`p-2 rounded transition-colors border border-transparent ${
          canUndo() 
            ? 'hover:bg-hover hover:border-border text-text' 
            : 'text-text-secondary cursor-not-allowed'
        }`}
        title={t('undoRedo.undo')}
      >
        <Undo2 className="w-4 h-4" />
      </button>
      
      <div className="w-px h-4 bg-border" />
      
      <button
        onClick={handleRedo}
        disabled={!canRedo()}
        className={`p-2 rounded transition-colors border border-transparent ${
          canRedo() 
            ? 'hover:bg-hover hover:border-border text-text' 
            : 'text-text-secondary cursor-not-allowed'
        }`}
        title={t('undoRedo.redo')}
      >
        <Redo2 className="w-4 h-4" />
      </button>
    </div>
  );
};