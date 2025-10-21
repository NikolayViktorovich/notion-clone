import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Block } from '../../types';
import { Check, Square } from 'lucide-react';
import { BaseBlock } from './BaseBlock';

interface TodoBlockProps {
  block: Block;
}

export const TodoBlock = ({ block }: TodoBlockProps) => {
  const [content, setContent] = useState(block.content);
  const [isEditing, setIsEditing] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
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

  const toggleChecked = () => {
    setIsChecked(!isChecked);
  };

  return (
    <BaseBlock>
      <div className="flex items-start gap-3">
        <button
          onClick={toggleChecked}
          className={`flex-shrink-0 w-5 h-5 mt-1 border-2 rounded flex items-center justify-center transition-colors ${
            isChecked 
              ? 'bg-accent border-accent text-white' 
              : 'border-border hover:border-text text-transparent'
          }`}
        >
          {isChecked && <Check className="w-3 h-3" />}
        </button>

        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className={`flex-1 resize-none border-none outline-none bg-transparent leading-relaxed text-text placeholder-text-secondary ${
              isChecked ? 'line-through text-text-secondary' : ''
            }`}
            style={{ minHeight: '1.5em' }}
            placeholder="Todo item..."
          />
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className={`flex-1 cursor-text hover:bg-hover rounded px-2 py-1 -mx-2 leading-relaxed whitespace-pre-wrap min-h-[1.5em] ${
              isChecked ? 'line-through text-text-secondary' : 'text-text'
            }`}
          >
            {content || <span className="text-text-secondary">Empty todo item...</span>}
          </div>
        )}
      </div>
    </BaseBlock>
  );
};