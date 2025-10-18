import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { TextBlock } from './blocks/TextBlock';
import { HeaderBlock } from './blocks/HeaderBlock';
import { SortableBlock } from './blocks/SortableBlock';
import { useState, useRef, useEffect } from 'react';
import { Plus, Type, Heading1, List, Code, Quote, Download } from 'lucide-react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable, DndContext, DragEndEvent, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { TodoBlock } from './blocks/TodoBlock';
import { AdvancedCodeBlock } from './blocks/AdvancedCodeBlock';
import { QuoteBlock } from './blocks/QuoteBlock';

export const Editor = () => {
  const { currentPage, updatePage, createBlock, moveBlock } = useStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState('');
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const blockMenuRef = useRef<HTMLDivElement>(null);

  const { setNodeRef } = useDroppable({
    id: 'editor-drop-area',
  });

  useEffect(() => {
    if (currentPage) {
      setTitle(currentPage.title);
    }
  }, [currentPage]);

  useEffect(() => {
    if (isEditingTitle && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.setSelectionRange(
        titleRef.current.value.length,
        titleRef.current.value.length
      );
    }
  }, [isEditingTitle]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (blockMenuRef.current && !blockMenuRef.current.contains(event.target as Node)) {
        setShowBlockMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTitleSave = () => {
    if (currentPage && title !== currentPage.title) {
      updatePage(currentPage.id, { title });
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSave();
    }
    if (e.key === 'Escape') {
      setTitle(currentPage?.title || '');
      setIsEditingTitle(false);
    }
  };

  const handleAddBlock = (type: 'text' | 'heading' | 'todo' | 'code' | 'quote') => {
    if (!currentPage) return;

    const contentMap = {
      text: '',
      heading: 'New Heading',
      todo: 'Todo item',
      code: '// Your code here',
      quote: 'Your quote here'
    };

    createBlock(currentPage.id, {
      type,
      content: contentMap[type],
    });
    setShowBlockMenu(false);
  };

  const handleExportPage = () => {
    if (!currentPage) return;

    const data = {
      title: currentPage.title,
      blocks: currentPage.blocks,
      createdAt: currentPage.createdAt,
      updatedAt: currentPage.updatedAt,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentPage.title || 'page'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (active.id !== over?.id && currentPage) {
      const activeIndex = currentPage.blocks.findIndex(block => block.id === active.id);
      const overIndex = currentPage.blocks.findIndex(block => block.id === over?.id);
      
      if (activeIndex !== -1 && overIndex !== -1) {
        moveBlock(active.id as string, overIndex);
      }
    }
  };

  const blockTypes = [
    { type: 'text' as const, icon: Type, label: 'Text', color: 'text-gray-600' },
    { type: 'heading' as const, icon: Heading1, label: 'Heading', color: 'text-gray-600' },
    { type: 'todo' as const, icon: List, label: 'Todo', color: 'text-gray-600' },
    { type: 'code' as const, icon: Code, label: 'Code', color: 'text-gray-600' },
    { type: 'quote' as const, icon: Quote, label: 'Quote', color: 'text-gray-600' },
  ];

  if (!currentPage) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No page selected
          </h2>
          <p className="text-gray-500">
            Select a page from the sidebar or create a new one
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      key={currentPage.id}
      className="flex-1 overflow-y-auto bg-white"
    >
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-8">
          <div></div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportPage}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export Page
          </motion.button>
        </div>

        {/* Page Cover */}
        {currentPage.cover && (
          <motion.img
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            src={currentPage.cover}
            alt="Cover"
            className="w-full h-48 object-cover rounded-lg mb-8"
          />
        )}

        {/* Page Icon and Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-4 mb-12"
        >
          <button className="text-4xl mt-1 hover:bg-gray-100 rounded-lg p-2 transition-colors">
            {currentPage.icon || '📄'}
          </button>
          
          <div className="flex-1">
            {isEditingTitle ? (
              <textarea
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyDown}
                className="w-full text-4xl font-bold resize-none border-none outline-none bg-transparent leading-tight text-gray-900"
                style={{ minHeight: '1.5em' }}
                rows={1}
                placeholder="Untitled"
              />
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                className="text-4xl font-bold outline-none cursor-text hover:bg-gray-50 rounded-lg px-3 py-2 -mx-3 leading-tight text-gray-900"
              >
                {currentPage.title || 'Untitled'}
              </h1>
            )}
          </div>
        </motion.div>

        {/* Blocks with Drag & Drop */}
        <AnimatePresence mode="wait">
          <div key={currentPage.id}>
            <DndContext
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div ref={setNodeRef}>
                <SortableContext 
                  items={currentPage.blocks.map(block => block.id)} 
                  strategy={verticalListSortingStrategy}
                >
                  {currentPage.blocks.map((block, index) => (
                    <SortableBlock key={block.id} block={block} index={index}>
  {block.type === 'text' && <TextBlock block={block} />}
  {block.type === 'heading' && <HeaderBlock block={block} level={1} />}
  {block.type === 'todo' && <TodoBlock block={block} />}
  {block.type === 'code' && <AdvancedCodeBlock block={block} />}
  {block.type === 'quote' && <QuoteBlock block={block} />}
</SortableBlock>
                  ))}
                </SortableContext>
              </div>
            </DndContext>
          </div>
        </AnimatePresence>

        {/* Add Block Menu */}
        <div className="relative" ref={blockMenuRef}>
          {showBlockMenu ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 gap-3 p-6 bg-gray-50 rounded-xl border border-gray-200 mb-6"
            >
              {blockTypes.map(({ type, icon: Icon, label }) => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAddBlock(type)}
                  className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <Icon className="w-5 h-5 text-gray-700" />
                  <span className="text-sm font-medium text-gray-900">{label}</span>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowBlockMenu(true)}
              className="w-full p-6 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-all flex items-center justify-center gap-3 hover:bg-gray-50"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Add a block</span>
            </motion.button>
          )}
        </div>

        {/* Empty State */}
        {currentPage.blocks.length === 0 && !showBlockMenu && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowBlockMenu(true)}
                className="px-8 py-4 bg-black text-white rounded-xl text-base font-medium hover:bg-gray-800 transition-colors shadow-sm"
              >
                + Create your first block
              </motion.button>
            </div>
            <p className="text-gray-500 text-sm">Start building your page with content blocks</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};