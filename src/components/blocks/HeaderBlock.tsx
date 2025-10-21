import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Block } from '../../types';
import { BaseBlock } from './BaseBlock';

interface HeaderBlockProps {
  block: Block;
  level: 1 | 2 | 3;
}

export const HeaderBlock = ({ block, level }: HeaderBlockProps) => {
  const [content, setContent] = useState(block.content);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { updateBlock } = useStore();

  const sizes = {
    1: 'text-3xl font-bold',
    2: 'text-2xl font-semibold',
    3: 'text-xl font-medium',
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [isEditing]);

  const handleSave = () => {
    if (content !== block.content) {
      updateBlock(block.id, { content });
    }
    setIsEditing(false);
  };

  return (
    <BaseBlock>
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleSave}
          className={`w-full resize-none border-none outline-none bg-transparent text-text ${sizes[level]}`}
          style={{ minHeight: '1.5em' }}
          placeholder="Введите заголовок..."
        />
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className={`cursor-text hover:bg-hover rounded px-2 py-1 -mx-2 text-text ${sizes[level]}`}
        >
          {content || <span className="text-text-secondary">Пустой заголовок...</span>}
        </div>
      )}
    </BaseBlock>
  );
};