import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Block } from '../../types';
import { BaseBlock } from './BaseBlock';

interface TextBlockProps {
  block: Block;
}

export const TextBlock = ({ block }: TextBlockProps) => {
  const [content, setContent] = useState(block.content);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { updateBlock } = useStore();

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setContent(block.content);
      setIsEditing(false);
    }
  };

  return (
    <BaseBlock>
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="w-full resize-none border-none outline-none text-lg leading-relaxed bg-transparent text-text placeholder-text-secondary"
          style={{ minHeight: '1.5em' }}
          placeholder="Напишите что-нибудь..."
        />
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="cursor-text hover:bg-hover rounded px-2 py-1 -mx-2 text-lg leading-relaxed whitespace-pre-wrap min-h-[1.5em] text-text"
        >
          {content || <span className="text-text-secondary">Пустой текстовый блок...</span>}
        </div>
      )}
    </BaseBlock>
  );
};