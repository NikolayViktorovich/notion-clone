import { useState, useRef, useEffect, useCallback } from 'react';
import { Block } from '../types';

export const useBlockEditor = (block: Block, onSave: (content: string) => void) => {
  const [text, setText] = useState(block.content);
  const [isEditing, setIsEditing] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    setText(block.content);
  }, [block.content]);

  useEffect(() => {
    if (isEditing && ref.current) {
      ref.current.focus();
      ref.current.setSelectionRange(ref.current.value.length, ref.current.value.length);
    }
  }, [isEditing]);

  const debouncedSave = useCallback((value: string) => {
    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(() => {
      if (value !== block.content) onSave(value);
    }, 300);
  }, [block.content, onSave]);

  const handleChange = useCallback((value: string) => {
    setText(value);
    debouncedSave(value);
  }, [debouncedSave]);

  const save = useCallback(() => {
    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    if (text !== block.content) onSave(text);
    setIsEditing(false);
  }, [text, block.content, onSave]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      save();
    }
    if (e.key === 'Escape') {
      setText(block.content);
      setIsEditing(false);
    }
  }, [save, block.content]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  return {
    text,
    isEditing,
    ref,
    setText: handleChange,
    setIsEditing,
    save,
    handleKeyDown,
  };
};
