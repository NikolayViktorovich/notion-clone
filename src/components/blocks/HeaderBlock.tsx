import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Block } from '../../types';

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
          className={`w-full resize-none border-none outline-none bg-transparent ${sizes[level]}`}
          style={{ minHeight: '1.5em' }}
        />
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className={`cursor-text hover:bg-gray-50 rounded px-2 py-1 -mx-2 ${sizes[level]}`}
        >
          {content || <span className="text-gray-400">Empty header...</span>}
        </div>
      )}
    </motion.div>
  );
};