import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Block } from '../../types';
import { BaseBlock } from './BaseBlock';

interface TextBlockProps {
  block: Block;
}

export const TextBlock = ({ block: b }: TextBlockProps) => {
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
      {edit ? (
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={save}
          onKeyDown={keyDown}
          className="w-full resize-none border-none outline-none text-lg leading-relaxed bg-transparent text-text placeholder-text-secondary"
          style={{ minHeight: '1.5em', overflowWrap: 'anywhere', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
          placeholder="Напишите что-нибудь..."
        />
      ) : (
        <div
          onClick={() => setEdit(true)}
          className="cursor-text text-lg leading-relaxed min-h-[1.5em] text-text"
          style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}
        >
          {text || <span className="text-text-secondary">Пустой текстовый блок...</span>}
        </div>
      )}
    </BaseBlock>
  );
};