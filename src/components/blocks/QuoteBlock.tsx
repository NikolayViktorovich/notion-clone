import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Block } from '../../types';
import { QuoteIcon } from 'lucide-react';
import { BaseBlock } from './BaseBlock';

interface QuoteBlockProps {
  block: Block;
}

export const QuoteBlock = ({ block }: QuoteBlockProps) => {
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
      <div className="flex gap-4">
        <QuoteIcon className="w-6 h-6 text-text-secondary mt-1 flex-shrink-0" />
        
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="flex-1 resize-none border-none outline-none bg-transparent text-lg italic leading-relaxed text-text placeholder-text-secondary"
            style={{ minHeight: '1.5em' }}
            placeholder="Write a quote..."
          />
        ) : (
          <blockquote
            onClick={() => setIsEditing(true)}
            className="flex-1 cursor-text hover:bg-hover rounded px-3 py-2 -mx-3 text-lg italic leading-relaxed border-l-4 border-border pl-4 text-text"
          >
            {content || <span className="text-text-secondary">Empty quote...</span>}
          </blockquote>
        )}
      </div>
    </BaseBlock>
  );
};