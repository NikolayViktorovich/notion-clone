import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Block } from '../../types';
import { Check } from 'lucide-react';
import { useBlockEditor } from '../../hooks/useBlockEditor';
import { useI18n } from '../../hooks/useI18n';

interface TodoBlockProps {
  block: Block;
}

export const TodoBlock = ({ block }: TodoBlockProps) => {
  const { t } = useI18n();
  const { updateBlock } = useStore();
  const [done, setDone] = useState(false);
  const { text, isEditing, ref, setText, setIsEditing, save, handleKeyDown } = useBlockEditor(
    block,
    (content) => updateBlock(block.id, { content })
  );

  return (
    <div className="notion-block">
      <div className="flex items-start gap-2 px-2 py-1">
        <button
          onClick={() => setDone(!done)}
          className={`flex-shrink-0 w-5 h-5 mt-0.5 border-2 rounded flex items-center justify-center transition-colors ${
            done ? 'bg-accent border-accent text-white' : 'border-border hover:border-text text-transparent'
          }`}
        >
          {done && <Check className="w-3 h-3" />}
        </button>

        {isEditing ? (
          <textarea
            ref={ref}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={save}
            onKeyDown={handleKeyDown}
            className={`flex-1 resize-none border-none outline-none bg-transparent leading-relaxed text-base text-text placeholder-text-secondary ${
              done ? 'line-through text-text-secondary' : ''
            }`}
            style={{ minHeight: '1.5em', overflowWrap: 'anywhere', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
            placeholder={t('blocks.todoItem')}
          />
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className={`flex-1 cursor-text leading-relaxed text-base min-h-[1.5em] ${
              done ? 'line-through text-text-secondary' : 'text-text'
            }`}
            style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}
          >
            {text || <span className="text-text-secondary">{t('blocks.emptyTodo')}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
