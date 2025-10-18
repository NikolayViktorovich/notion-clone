import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Block } from '../../types';

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative"
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="w-full resize-none border-none outline-none text-lg leading-relaxed bg-transparent"
          style={{ minHeight: '1.5em' }}
          placeholder="Напишите что-нибудь..."
        />
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="cursor-text hover:bg-gray-50 rounded px-2 py-1 -mx-2 text-lg leading-relaxed whitespace-pre-wrap min-h-[1.5em]"
        >
          {content || <span className="text-gray-400">Пустой текстовый блок...</span>}
        </div>
      )}
    </motion.div>
  );
};