import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Block } from '../../types';
import { QuoteIcon } from 'lucide-react';

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative"
    >
      <div className="flex gap-4">
        <QuoteIcon className="w-6 h-6 text-gray-400 mt-1 flex-shrink-0" />
        
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="flex-1 resize-none border-none outline-none bg-transparent text-lg italic text-gray-600 leading-relaxed"
            style={{ minHeight: '1.5em' }}
            placeholder="Write a quote..."
          />
        ) : (
          <blockquote
            onClick={() => setIsEditing(true)}
            className="flex-1 cursor-text hover:bg-gray-50 rounded px-3 py-2 -mx-3 text-lg italic text-gray-600 leading-relaxed border-l-4 border-gray-300 pl-4"
          >
            {content || <span className="text-gray-400">Empty quote...</span>}
          </blockquote>
        )}
      </div>
    </motion.div>
  );
};