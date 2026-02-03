import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Block } from '../../types';
import { Check } from 'lucide-react';
import { BaseBlock } from './BaseBlock';

interface TodoBlockProps {
  block: Block;
}

export const TodoBlock = ({ block: b }: TodoBlockProps) => {
  const [text, setText] = useState(b.content);
  const [edit, setEdit] = useState(false);
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const { updateBlock: update } = useStore();

  useEffect(() => {
    if (edit && ref.current) {
      ref.current.focus();
      ref.current.setSelectionRange(ref.current.value.length, ref.current.value.length);
    }
  }, [edit]);

  const save = () => {
    if (text !== b.content) update(b.id, { content: text });
    setEdit(false);
  };

  const keyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      save();
    }
    if (e.key === 'Escape') {
      setText(b.content);
      setEdit(false);
    }
  };

  return (
    <BaseBlock>
      <div className="flex items-start gap-3">
        <button
          onClick={() => setDone(!done)}
          className={`flex-shrink-0 w-5 h-5 mt-1 border-2 rounded flex items-center justify-center transition-colors ${
            done ? 'bg-accent border-accent text-white' : 'border-border hover:border-text text-transparent'
          }`}
        >
          {done && <Check className="w-3 h-3" />}
        </button>

        {edit ? (
          <textarea
            ref={ref}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={save}
            onKeyDown={keyDown}
            className={`flex-1 resize-none border-none outline-none bg-transparent leading-relaxed text-text placeholder-text-secondary ${
              done ? 'line-through text-text-secondary' : ''
            }`}
            style={{ minHeight: '1.5em', overflowWrap: 'anywhere', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
            placeholder="Todo item..."
          />
        ) : (
          <div
            onClick={() => setEdit(true)}
            className={`flex-1 cursor-text leading-relaxed min-h-[1.5em] ${
              done ? 'line-through text-text-secondary' : 'text-text'
            }`}
            style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}
          >
            {text || <span className="text-text-secondary">Empty todo item...</span>}
          </div>
        )}
      </div>
    </BaseBlock>
  );
};