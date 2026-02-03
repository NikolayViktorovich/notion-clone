import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Block } from '../../types';
import { BaseBlock } from './BaseBlock';

interface HeaderBlockProps {
  block: Block;
  level: 1 | 2 | 3;
}

export const HeaderBlock = ({ block: b, level: lvl }: HeaderBlockProps) => {
  const [text, setText] = useState(b.content);
  const [edit, setEdit] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const { updateBlock: update } = useStore();

  const sizes = {
    1: 'text-3xl font-bold',
    2: 'text-2xl font-semibold',
    3: 'text-xl font-medium',
  };

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

  return (
    <BaseBlock>
      {edit ? (
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={save}
          className={`w-full resize-none border-none outline-none bg-transparent text-text ${sizes[lvl]}`}
          style={{ minHeight: '1.5em', overflowWrap: 'anywhere', wordBreak: 'break-word' }}
          placeholder="Введите заголовок..."
        />
      ) : (
        <div
          onClick={() => setEdit(true)}
          className={`cursor-text text-text ${sizes[lvl]}`}
          style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
        >
          {text || <span className="text-text-secondary">Пустой заголовок...</span>}
        </div>
      )}
    </BaseBlock>
  );
};