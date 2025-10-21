import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { TextBlock } from './blocks/TextBlock';
import { HeaderBlock } from './blocks/HeaderBlock';
import { SortableBlock } from './blocks/SortableBlock';
import { useState, useRef, useEffect } from 'react';
import { Plus, Type, Heading1, List, Code, Quote, Download } from 'lucide-react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable, DndContext, DragEndEvent, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { TodoBlock } from './blocks/TodoBlock';
import { AdvancedCodeBlock } from './blocks/AdvancedCodeBlock';
import { QuoteBlock } from './blocks/QuoteBlock';
import { formatDate } from '../utils/dateUtils';
import { GoogleDriveManager } from './google/GoogleDriveManager';
import { Modal } from './ui/Modal';
import { UndoRedo } from './ui/UndoRedo';

export const Editor = () => {
  const { 
    currentPage, 
    updatePage, 
    createBlock, 
    moveBlock, 
    deleteBlock 
  } = useStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState('');
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [deleteBlockModal, setDeleteBlockModal] = useState<{
    isOpen: boolean;
    blockId: string | null;
    blockPreview: string;
  }>({
    isOpen: false,
    blockId: null,
    blockPreview: '',
  });
  
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const blockMenuRef = useRef<HTMLDivElement>(null);
  
  const [blockCount, setBlockCount] = useState(0);
  const [previousPageId, setPreviousPageId] = useState<string | null>(null);

  const { setNodeRef } = useDroppable({
    id: 'editor-drop-area',
  });

  useEffect(() => {
    if (currentPage) {
      setTitle(currentPage.title);
      
      const isPageChange = previousPageId !== currentPage.id;
      setPreviousPageId(currentPage.id);
      
      if (isPageChange) {
        setBlockCount(currentPage.blocks.length);
      }
    }
  }, [currentPage, previousPageId]);

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
      heading: 'Новый заголовок',
      todo: 'To Do',
      code: '// Вставьте свой код сюда',
      quote: 'Цитата'
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

  const openDeleteBlockModal = (blockId: string, blockPreview: string) => {
    setDeleteBlockModal({
      isOpen: true,
      blockId,
      blockPreview,
    });
  };

  const closeDeleteBlockModal = () => {
    setDeleteBlockModal({
      isOpen: false,
      blockId: null,
      blockPreview: '',
    });
  };

  const handleDeleteBlockConfirm = () => {
    if (deleteBlockModal.blockId) {
      deleteBlock(deleteBlockModal.blockId);
      closeDeleteBlockModal();
    }
  };

  const blockTypes = [
    { type: 'text' as const, icon: Type, label: 'Текст' },
    { type: 'heading' as const, icon: Heading1, label: 'Заголовок' },
    { type: 'todo' as const, icon: List, label: 'To Do' },
    { type: 'code' as const, icon: Code, label: 'Код' },
    { type: 'quote' as const, icon: Quote, label: 'Цитата' },
  ];

  if (!currentPage) {
    return (
      <motion.div 
        className="flex items-center justify-center h-full w-full bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center px-4">
          <div className="w-16 h-16 bg-hover rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Plus className="w-8 h-8 text-text-secondary" />
          </div>
          <h2 className="text-xl font-bold text-text mb-2">
            Страница не выбрана
          </h2>
          <p className="text-text-secondary text-sm">
            Выберите страницу на боковой панели или создайте новую
          </p>
        </div>
      </motion.div>
    );
  }

  const shouldAnimateBlocks = currentPage.blocks.length !== blockCount;
  const isNewPage = previousPageId !== currentPage.id;

  return (
    <motion.div 
      className="flex-1 overflow-y-auto bg-background min-h-screen safe-area-inset-bottom"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 lg:py-8">
        {/* Mobile Header */}
        <div className="lg:hidden mb-3">
          <div className="flex items-center justify-between">
            <UndoRedo />
            <div className="flex items-center gap-2">
              <GoogleDriveManager />
              <button
                onClick={handleExportPage}
                className="flex items-center gap-1 px-2 py-2 bg-accent text-white rounded-lg text-sm hover:opacity-90 transition-colors shadow-sm special-theme-button"
                title="Экспорт"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Header Actions */}
        <motion.div 
          className="hidden lg:flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 lg:mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex gap-2 flex-wrap">
            <UndoRedo />
          </div>
          <div className="flex gap-2 flex-wrap">
            <GoogleDriveManager />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportPage}
              className="flex items-center gap-2 px-3 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-colors shadow-sm special-theme-button"
            >
              <Download className="w-4 h-4" />
              <span>Экспорт страницы</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Page Cover */}
        <AnimatePresence>
          {currentPage.cover && (
            <motion.img
              key="page-cover"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              src={currentPage.cover}
              alt="Cover"
              className="w-full h-20 sm:h-28 md:h-36 lg:h-44 object-cover rounded-lg mb-3 sm:mb-4 lg:mb-6 border border-border"
            />
          )}
        </AnimatePresence>

        {/* Page Icon and Title */}
        <motion.div 
          className="flex items-start gap-4 lg:gap-4 mb-6 lg:mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.3,
            type: "spring",
            stiffness: 100
          }}
        >
          <div className="text-3xl sm:text-3xl lg:text-4xl mt-1 flex-shrink-0">
            {currentPage.icon || '📄'}
          </div>
          
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <textarea
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyDown}
                className="w-full text-2xl sm:text-2xl lg:text-4xl font-bold resize-none border-none outline-none bg-transparent leading-tight text-text placeholder-text-secondary"
                style={{ minHeight: '1.5em' }}
                rows={1}
                placeholder="Untitled"
              />
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                className="w-full text-2xl sm:text-2xl lg:text-4xl font-bold outline-none cursor-text hover:bg-hover rounded-lg px-3 lg:px-3 py-2 lg:py-2 -mx-3 lg:-mx-3 leading-tight text-text break-words"
              >
                {currentPage.title || 'Untitled'}
              </h1>
            )}
            
            {/* Page metadata */}
            <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 text-text-secondary text-sm mt-3">
              <span className="text-sm">Создано: {formatDate(currentPage.createdAt)}</span>
              <span className="hidden xs:inline">•</span>
              <span className="text-sm">Обновлено: {formatDate(currentPage.updatedAt)}</span>
            </div>
          </div>
        </motion.div>

        {/* Blocks with Drag & Drop */}
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
                <AnimatePresence mode="popLayout" onExitComplete={() => setBlockCount(currentPage.blocks.length)}>
                  {currentPage.blocks.map((block, index) => (
                    <motion.div
                      key={block.id}
                      layout
                      initial={shouldAnimateBlocks || isNewPage ? { opacity: 0, y: 20, scale: 0.95 } : false}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ 
                        opacity: 0, 
                        y: -20, 
                        scale: 0.95,
                        transition: { duration: 0.2 }
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                        mass: 1,
                        delay: shouldAnimateBlocks || isNewPage ? index * 0.05 : 0
                      }}
                    >
                      <SortableBlock 
                        key={block.id} 
                        block={block} 
                        index={index} 
                        isDragging={activeId === block.id}
                        onDeleteClick={openDeleteBlockModal}
                      >
                        {block.type === 'text' && <TextBlock block={block} />}
                        {block.type === 'heading' && <HeaderBlock block={block} level={1} />}
                        {block.type === 'todo' && <TodoBlock block={block} />}
                        {block.type === 'code' && <AdvancedCodeBlock block={block} />}
                        {block.type === 'quote' && <QuoteBlock block={block} />}
                      </SortableBlock>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </SortableContext>
            </div>
          </DndContext>
        </div>

        {/* Add Block Menu */}
        <div className="relative" ref={blockMenuRef}>
          <AnimatePresence mode="wait">
            {showBlockMenu ? (

            <motion.div
            key="block-menu"
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 xs:grid-cols-2 gap-2 lg:gap-2 p-3 lg:p-4 bg-hover rounded-xl border border-border mb-3 lg:mb-4"
          >
            {blockTypes.map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => handleAddBlock(type)}
                className="flex items-center gap-2 xs:gap-2 lg:gap-3 p-2 lg:p-3 bg-background rounded-lg border border-border text-text hover:border-accent hover:shadow-sm transition-all text-sm"
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium text-sm">{label}</span>
              </button>
            ))}
          </motion.div>
            ) : (
              <motion.button
                key="add-block-button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowBlockMenu(true)}
                className="w-full p-3 border-2 border-dashed border-border rounded-xl text-text-secondary hover:text-text hover:border-accent transition-all flex items-center justify-center gap-2 hover:bg-hover text-xs"
              >
                <Plus className="w-3 h-3" />
                <span className="font-medium">Добавить блок</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        <AnimatePresence>
          {currentPage.blocks.length === 0 && !showBlockMenu && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center py-6 lg:py-12 px-4"
            >
              <div className="mb-3 lg:mb-4">
                <button
                  onClick={() => setShowBlockMenu(true)}
                  className="px-3 py-2 lg:px-4 lg:py-3 bg-accent text-white rounded-xl text-xs lg:text-sm font-medium hover:opacity-90 transition-colors shadow-sm special-theme-button"
                >
                  + Создайте свой первый блок
                </button>
              </div>
              <p className="text-text-secondary text-xs">Начните создавать свою страницу с помощью блоков контента</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Модальное окно удаления блока */}
      <Modal
        isOpen={deleteBlockModal.isOpen}
        onClose={closeDeleteBlockModal}
        onConfirm={handleDeleteBlockConfirm}
        title="Удалить блок"
        description={`Вы уверены что хотите удалить блок "${deleteBlockModal.blockPreview}"?`}
        confirmText="Удалить"
        type="delete"
      />
    </motion.div>
  );
};