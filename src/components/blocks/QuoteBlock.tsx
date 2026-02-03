import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Block } from '../../types';
import { QuoteIcon } from 'lucide-react';
import { BaseBlock } from './BaseBlock';

interface QuoteBlockProps {
  block: Block;
}

export const QuoteBlock = ({ block: b }: QuoteBlockProps) => {
  const [text, setText] = useState(b.content);
  const [edit, setEdit] = useState(false);
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
      <div className="flex gap-4">
        <QuoteIcon className="w-6 h-6 text-text-secondary mt-1 flex-shrink-0" />
        
        {edit ? (
          <textarea
            ref={ref}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={save}
            onKeyDown={keyDown}
            className="flex-1 resize-none border-none outline-none bg-transparent text-lg italic leading-relaxed text-text placeholder-text-secondary"
            style={{ minHeight: '1.5em', overflowWrap: 'anywhere', wordBreak: 'break-word' }}
            placeholder="Write a quote..."
          />
        ) : (
          <blockquote
            onClick={() => setEdit(true)}
            className="flex-1 cursor-text text-lg italic leading-relaxed border-l-4 border-border pl-4 text-text"
            style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
          >
            {text || <span className="text-text-secondary">Empty quote...</span>}
          </blockquote>
        )}
      </div>
    </BaseBlock>
  );
};